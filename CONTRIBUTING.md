# Contributing

Thanks for helping. The extension is plain JavaScript with no build step.

## Setup

- Node 24 (for the tests)
- A Chromium browser (Chrome, Edge, Brave or Opera)
- The [coldstart app](https://github.com/Ysweb3/ColdStart) running, to try changes by hand

Load the folder with **Load unpacked** (see the [README](README.md#install)). After you edit a
file, click the reload icon on the extension's card.

## Tests

The tests run `background.js` in a Node vm with `chrome.*` stubbed. No browser needed.

```
node test/music.mjs
node test/stress.mjs
```

- `music.mjs` checks that music players keep one tab each. It must pass.
- `stress.mjs` attacks the link to the app: restarts, outages, a hung app, floods. It prints
  `ok` or `GAP` per case and exits 1 while any known gap is still open. CI runs it but doesn't
  fail on it. A change must not add a new `GAP`.

The full stack, with the real app and this extension in Chrome for Testing, runs from the
ColdStart repo: `node e2e/full-stack.mjs ../ColdStartExtension`.

## Commits

Match the style in `git log`:

- One change per commit.
- Subject in the imperative, sentence case, no trailing period, about 50 characters or less.
  For example: `Open resumed tabs four at a time`, `Send the profile with popup tabs`.
- Say what the user sees when you can.
- Use the body for the why.

## Pull requests

- Branch from `main`. Keep each pull request to one topic.
- If you change the port, the `/tabs`, `/project` or `/ws` messages, or browser names, the app
  needs the matching change. Open both pull requests together.
