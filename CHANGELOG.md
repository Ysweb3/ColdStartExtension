# Changelog

## Unreleased

### Changed

- Popup: unticking a tab now ignores it in every checkpoint, instead of picking what to send.
  Its Send button is replaced by Ignore this tab and Open coldstart.

## 1.0.0 - 2026-10-24

First public release. Built from the git history since August 2026.

### Added

- Sends this profile's open tabs to the coldstart app when it asks, over a WebSocket on
  `localhost:8765`.
- Reopens a project's saved tabs on resume: only the ones not already open, four at a time,
  and reports how many it opened.
- Closes the tabs a project just saved on "Checkpoint & close".
- Popup: lists your open tabs, lets you untick some, and sends the rest to the open project.
- Tabs are kept per browser profile, by signed-in email or by a random per-profile id.
- One tab per music player, so resume doesn't start a second one.
- Green dot on the toolbar icon while connected to the app.
- Extension icon.
- Tests: `test/music.mjs` and a connection stress test, `test/stress.mjs`. CI runs both on
  every push.

### Changed

- Renamed the extension to coldstart.
- Popup restyled to match the app.
- Wakes every 30 seconds instead of every minute, so resumed tabs wait less for a sleeping
  extension.

### Fixed

- Stays connected when the browser suspends the service worker, with a heartbeat and alarms.
- Drops and redials a socket to a hung app; failed tab posts are reported.
- YouTube playlist tabs no longer reopen as duplicates (the `&index=` part is ignored).
- No duplicate tabs on resume.
- Connects reliably when the browser starts.

### Security

- Resume opens only web pages (never `file:`, `javascript:` or browser pages) and at most 100
  tabs at once.
