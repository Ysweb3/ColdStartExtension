# Security audit before going public

Scanned on 2026-10-24. Covers the full history: 51 commits on all 12 remote branches. Checked
every added line, every commit message and the author/committer fields.

Looked for: cloud and API keys (AWS, GitHub, OpenAI/Anthropic, Google, Slack, npm, GitLab,
SendGrid), private keys, JWTs, webhook URLs, password/secret/token assignments, long
high-entropy strings, IP addresses, personal file paths (`C:\Users\...`, `/home/...`,
`/Users/...`), email addresses, and committed data files.

History was not changed. Anything listed here stays in history until it is rewritten.

## Summary

- No secrets, API keys, tokens, private keys, personal paths or emails in any file, in any commit.
- A personal Gmail address in the author field of 36 commits.
- One stray Git entry for a local worktree.

## Findings

| Commit | File | What it is | Risk |
|---|---|---|---|
| 36 commits by `Ysweb3` (every non-merge commit from `4bc588d` to `1477d5c`, plus 4 local merges) | commit metadata | Author and committer email `yssh88972@gmail.com`. Visible to anyone who runs `git log` on the public repo. The 15 merges made on GitHub use the noreply address. | **Medium.** Personal email becomes public and scrapeable. Fixing it means rewriting history. To stop it for new commits, set `git config user.email 166310520+Ysweb3@users.noreply.github.com` and turn on "Keep my email address private" in GitHub settings. |
| `14eda3d` (2026-10-09), still in HEAD | `.claude/worktrees/checkpoint-close` | A Claude Code worktree folder committed by mistake. Git stores it as a submodule pointer (to commit `6e6d958`) with no `.gitmodules`, so GitHub shows a broken folder. | **Low.** No content leaks; it only reveals that local tool. Worth removing from the tree and adding `.claude/worktrees/` to `.gitignore`. |
| `8644575` (2026-10-24) | `popup.html`, `background.js` | Comments citing `DESIGN.md` and "artboard 1j", which are not in this repo. | **Info.** Names of private design files only. No content leaks. |
| many | `test/music.mjs`, `test/stress.mjs` | Test URLs (`a.test`, `open.spotify.com/album/1`, `youtube.com/watch?v=y`) and fixed profile ids. | **None.** Placeholders. |
| all | `background.js`, `popup.js` | Network calls go only to `localhost:8765` / `127.0.0.1`. | **None.** Nothing is sent off the machine. |

## Not secrets, but worth fixing before going public

- **Font licences.** `fonts/` ships IBM Plex (and Sora and Space Mono in older commits). These
  are under the SIL Open Font License 1.1, which requires the licence text to ship with the
  fonts. Done: `fonts/OFL.txt` (IBM's `LICENSE.txt` from github.com/IBM/plex, unchanged) now
  sits next to them, so it ships with every copy of the extension.
- **Broad host permission.** `manifest.json` asks for `"host_permissions": ["<all_urls>"]`.
  The code only talks to `localhost:8765`, so `http://localhost:8765/*` may be enough. Store
  reviewers and users see `<all_urls>` as "read and change all your data on all websites".
  Done: narrowed to `http://localhost:8765/*`. Tab urls come from the `tabs` permission and
  the WebSocket needs no host permission.
