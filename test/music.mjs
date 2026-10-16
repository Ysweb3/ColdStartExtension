// Music tabs: one per player on capture, none reopened while one is open. Run: node test/music.mjs
import vm from "node:vm";
import fs from "node:fs";
import assert from "node:assert/strict";

const SRC = fs.readFileSync(new URL("../background.js", import.meta.url), "utf8");

function load(tabs) {
  const ext = { created: [], posted: null, listeners: new Set() };
  // pages load only when the test says so: every tab created so far finishes
  ext.finish = () => ext.created.forEach((_, i) => [...ext.listeners].forEach(f => f(i + 1, { status: "complete" })));
  ext.ctx = vm.createContext({
    WebSocket: class { static OPEN = 1; static CLOSED = 3; send() {} },
    fetch: (_u, o) => { ext.posted = JSON.parse(o.body).urls; return Promise.resolve({ ok: true }); },
    URL, navigator: {}, console: { log() {}, error: console.error }, crypto,
    setTimeout, setInterval, clearTimeout, clearInterval,
    chrome: {
      tabs: {
        query: (_q, cb) => cb ? cb(tabs) : Promise.resolve(tabs),
        create: ({ url }) => { ext.created.push(url); return Promise.resolve({ id: ext.created.length }); },
        onUpdated: { addListener: f => ext.listeners.add(f), removeListener: f => ext.listeners.delete(f) },
      },
      identity: { getProfileUserInfo: async () => ({ email: "" }) },
      storage: { local: { get: async () => ({ rwProfileId: "x" }), set: async () => {} } },
      runtime: { onStartup: { addListener() {} } },
      alarms: { create() {}, onAlarm: { addListener() {} } },
    },
  });
  vm.runInContext(SRC, ext.ctx);
  return ext;
}

const settle = () => new Promise(r => setTimeout(r, 50));

// capture keeps the playing spotify tab over the idle one, and one youtube music tab
let ext = load([
  { url: "https://open.spotify.com/album/1" },
  { url: "https://a.test/" },
  { url: "https://open.spotify.com/track/2", audible: true },
  { url: "https://music.youtube.com/watch?v=x" },
  { url: "https://music.youtube.com/library" },
  { url: "https://www.youtube.com/watch?v=y" },
  { url: "https://www.youtube.com/watch?v=z" },
]);
vm.runInContext("sendTabs()", ext.ctx);
await settle();
assert.deepEqual(ext.posted, ["https://a.test/", "https://open.spotify.com/track/2",
  "https://music.youtube.com/watch?v=x", "https://www.youtube.com/watch?v=y", "https://www.youtube.com/watch?v=z"]);

// resume skips a player already open on another page, and opens a saved one only once
ext = load([{ url: "https://open.spotify.com/playlist/9" }]);
vm.runInContext(`openMissing(${JSON.stringify([
  "https://open.spotify.com/track/2", "https://www.deezer.com/en/album/1",
  "https://www.deezer.com/fr/track/3", "https://b.test/", "https://b.test/",
])}, { readyState: 1, send() {} })`, ext.ctx);
await settle();
assert.deepEqual(ext.created, ["https://www.deezer.com/en/album/1", "https://b.test/"]);
ext.finish();

// resume loads four tabs at once, and starts the rest as those finish
ext = load([]);
const six = [1, 2, 3, 4, 5, 6].map(n => `https://c.test/${n}`);
vm.runInContext(`openMissing(${JSON.stringify(six)}, { readyState: 1, send() {} })`, ext.ctx);
await settle();
assert.equal(ext.created.length, 4);
ext.finish();
await settle();
assert.deepEqual(ext.created, six);
ext.finish();

// regional amazon and subdomain apple hosts are players too; plain sites are not
const key = u => vm.runInContext(`musicKey(${JSON.stringify(u)})`, ext.ctx);
assert.equal(key("https://music.amazon.in/albums/1"), "music:music.amazon.in");
assert.equal(key("https://beta.music.apple.com/in/album/1"), "music:beta.music.apple.com");
assert.equal(key("https://m.soundcloud.com/a"), key("https://soundcloud.com/b"));
assert.equal(key("https://www.youtube.com/watch?v=y"), null);
assert.equal(key("chrome://newtab/"), null);
console.log("music tabs: ok");
