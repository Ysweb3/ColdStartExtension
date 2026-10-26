# Security policy

## Reporting a vulnerability

Please don't open a public issue. Report it privately through GitHub instead:
[Report a vulnerability](https://github.com/Ysweb3/ColdStartExtension/security/advisories/new).

Say what you found, how to reproduce it, and which commit you tested.

## What counts

The extension reads your tabs, opens and closes tabs when the coldstart app asks, and talks only
to `localhost:8765`. Things worth reporting:

- Anything other than the coldstart app getting it to open, close or read tabs.
- Tab URLs or profile emails leaving the machine.
- It opening something other than a web page (`file:`, `javascript:`, browser pages).

For the desktop app, report in
[Ysweb3/ColdStart](https://github.com/Ysweb3/ColdStart/security/advisories/new).

## Supported versions

Only the latest commit on `main`.
