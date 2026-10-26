# coldstart extension

The browser half of [coldstart](https://github.com/Ysweb3/ColdStart), a Windows app that saves
your open apps and browser tabs as a project and brings them back later.

This extension reads your tabs when coldstart saves a project, and reopens them when you resume
it. It does nothing on its own: **the coldstart desktop app must be running.**

> Screenshots coming soon.

## What it does

- **Saves tabs.** When you click Checkpoint in coldstart, the extension sends the app the URLs
  of the tabs open in this browser profile.
- **Reopens tabs.** On Resume it opens the saved tabs that are not already open, four at a time,
  in the background. Only web pages are opened, never `file:`, `javascript:` or browser pages.
- **Ignores tabs you pick.** Click the toolbar icon to see your open tabs. Untick any you
  want checkpoints to leave out, or use Ignore this tab. Open coldstart brings the app forward.
- **Closes tabs** after a "Checkpoint & close", but only the ones it just saved.
- **Keeps one tab per music player** (Spotify, YouTube Music and others), so resuming doesn't
  start a second player.
- **Knows your profiles.** Each browser profile runs its own copy, so tabs are kept per profile
  and reopen in the right one.
- A green dot on the toolbar icon means it is connected to the app.

Everything goes to `localhost:8765` on your own machine. Nothing is sent anywhere else.

## Install

The extension is not in the Chrome Web Store or Edge Add-ons yet, so you load it from source.

First, install and start the [coldstart app](https://github.com/Ysweb3/ColdStart).

Then get the extension:

```
git clone https://github.com/Ysweb3/ColdStartExtension.git
```

### Chrome

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Pick the `ColdStartExtension` folder (the one with `manifest.json` in it).
5. Pin coldstart from the puzzle-piece menu so you can see its icon.

### Edge

1. Go to `edge://extensions`.
2. Turn on **Developer mode** (left sidebar).
3. Click **Load unpacked**.
4. Pick the `ColdStartExtension` folder.
5. Show coldstart on the toolbar from the puzzle-piece menu.

Brave (`brave://extensions`) and Opera (`opera://extensions`) work the same way.
Firefox is not supported yet.

Do this in every browser you want tabs from. With coldstart open, the icon gets a green dot
within a few seconds.

To update, run `git pull` in the folder, then click the reload icon on the extension's card.

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Read the URLs of your open tabs, open saved ones, close saved ones. |
| `alarms` | Wake the extension every 30 seconds so it stays connected to the app. |
| `identity`, `identity.email` | Read the email the browser profile is signed in with, to tell profiles apart. |
| `storage` | Keep a random id for this profile when it has no email. |
| host access | Talk to the app on `localhost:8765`. |

## Tests

```
node test/music.mjs
node test/stress.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
