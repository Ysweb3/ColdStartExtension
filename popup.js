// Popup for artboard 1j. Lists the open tabs; unticking one ignores it, so checkpoints
// leave it out (background.js reads the same list from storage before every capture).
// "Open coldstart" asks the running app forward over the same POST /focus a second launch uses.

const APP = "http://localhost:8765";
const IGNORED = "ignoredTabs"; // chrome.storage.local key, shared with background.js

const els = {
  dot: document.getElementById("dot"),
  lede: document.getElementById("lede"),
  tabs: document.getElementById("tabs"),
  more: document.getElementById("more"),
  moreLabel: document.getElementById("moreLabel"),
  excluded: document.getElementById("excluded"),
  ignore: document.getElementById("ignore"),
  ignoreLabel: document.getElementById("ignoreLabel"),
  open: document.getElementById("open"),
  status: document.getElementById("status"),
  conn: document.getElementById("conn"),
};

let urls = [];
let active = ""; // the tab the popup was opened over
// ponytail: keyed by url, so a page stays ignored until un-ignored, even after it was closed
let ignored = new Set();
let expanded = false;
let justTicked = null; // the url whose tick should draw itself in on this render
let project = "";
let running = null; // null until GET /project answers or fails

function tidy(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function toggle(url) {
  justTicked = ignored.has(url) ? url : null;
  ignored.has(url) ? ignored.delete(url) : ignored.add(url);
  chrome.storage.local.set({ [IGNORED]: [...ignored] });
  render();
}

function render() {
  const kept = urls.filter(u => !ignored.has(u));
  // textContent, not innerHTML: the name is the user's text
  if (running === false) {
    els.lede.textContent = "coldstart isn't running. Start it, then open this again.";
  } else if (running && !project) {
    els.lede.textContent = "Open a project in coldstart to checkpoint these tabs.";
  } else {
    const b = document.createElement("b");
    b.textContent = project || "…";
    els.lede.replaceChildren(`Checkpoints save the ${kept.length} ticked tabs into `, b, `.`);
  }

  const rows = urls.map(url => {
    const row = document.createElement("div");
    row.className = ignored.has(url) ? "tab off" : "tab";
    row.title = url;
    // a real checkbox to keyboards and screen readers, not just a clickable div
    row.tabIndex = 0;
    row.setAttribute("role", "checkbox");
    row.setAttribute("aria-checked", String(!ignored.has(url)));
    row.setAttribute("aria-label", tidy(url));
    row.addEventListener("keydown", e => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); row.click(); }
    });
    // the app's CHECKBOX glyph (Icons.java); only the row just ticked draws its tick in
    if (url === justTicked) row.classList.add("drawn");
    row.innerHTML =
      '<svg class="ico box" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3.2"/>' +
      '<path class="tick" d="M7.4 12.2 L10.8 15.6 L16.8 8.6"/></svg>' +
      '<span class="url"></span>';
    row.querySelector(".url").textContent = tidy(url);
    row.addEventListener("click", () => {
      toggle(url);
      // render() rebuilt the rows; keep the keyboard where it was
      [...els.tabs.children].find(r => r.title === url)?.focus();
    });
    return row;
  });

  // Rows fill the space; only when they overflow does the "N more" row take the last slot.
  // Expanded shows every tab and the list scrolls. Measured, so a two-line lede still fits.
  const top = els.tabs.scrollTop;
  els.tabs.replaceChildren(...rows);
  els.more.hidden = true;
  let shown = rows.length;
  if (!expanded && els.tabs.scrollHeight > els.tabs.clientHeight) {
    // 34px rows + 8px gaps; the more row is 48px + its 8px gap
    shown = Math.max(1, Math.floor((els.tabs.clientHeight - 48) / 42));
    els.tabs.replaceChildren(...rows.slice(0, shown));
  }
  els.tabs.scrollTop = top;

  const hidden = urls.length - shown;
  els.more.hidden = hidden === 0 && !expanded;
  els.more.classList.toggle("open", expanded);
  justTicked = null;
  els.moreLabel.textContent = expanded ? "Show fewer" : `${hidden} more tabs`;
  const off = urls.length - kept.length;
  els.excluded.textContent = off ? `${off} ignored` : "";

  els.ignore.disabled = !active;
  els.ignore.classList.toggle("on", ignored.has(active));
  els.ignoreLabel.textContent = ignored.has(active) ? "Stop ignoring" : "Ignore this tab";
  els.open.disabled = running === false;
}

els.more.addEventListener("click", () => {
  expanded = !expanded;
  render();
});
els.more.addEventListener("keydown", e => {
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); els.more.click(); }
});

els.ignore.addEventListener("click", () => toggle(active));

els.open.addEventListener("click", async () => {
  els.status.classList.remove("bad");
  try {
    await fetch(`${APP}/focus`, { method: "POST" });
    window.close();
  } catch (err) {
    els.status.textContent = "couldn't reach coldstart · is it still open?";
    els.status.classList.add("bad");
  }
});

// The app answers GET /project with the active project's name (empty string when
// none is selected). A reply at all is what tells us the desktop app is running.
async function connect() {
  try {
    const res = await fetch(`${APP}/project`);
    project = (await res.text()).trim();
    running = true;
    els.dot.classList.add("live");
    els.conn.classList.add("live");
    els.conn.textContent = "connected";
  } catch (err) {
    running = false;
    els.conn.textContent = "not running";
  }
  render();
}

(async () => {
  ignored = new Set((await chrome.storage.local.get(IGNORED))[IGNORED] || []);
  const tabs = await chrome.tabs.query({});
  urls = tabs.map(t => t.url).filter(Boolean);
  // currentWindow is the window the popup was opened from
  active = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.url || "";
  render();
  requestAnimationFrame(() => els.ignore.classList.add("ready"));
  connect();
})();
