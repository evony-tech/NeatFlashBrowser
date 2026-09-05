# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Neat Flash Browser: an Electron 9.4.4 + Adobe Flash Player (PPAPI) desktop browser, purpose-built
as a companion app for **TheNEATBotfather** (see `../../TheNEATBotfather` and the workspace-level
`CLAUDE.md` one level up for the wider bot ecosystem this fits into). It exists to keep playing the
Flash-era game client alive after Flash's EOL, while Botfather drives account logins into it via a
custom URL-handoff protocol. Read `README.md` and `SECURITY.md` before making changes — the whole
app is designed around a single premise: this is a sandboxed, single-purpose container for
`http://*.somegamewithcastles.com` (and `localhost` Botfather dashboards) that aggressively ejects
anything else (`https://` links) out to the user's real OS browser, because Electron 9 / Flash are
both unpatched and unpatchable.

Note the path: the outer `NeatFlashBrowser/` folder is just a container — **this inner folder is
the actual git repo** (`origin` → `https://github.com/evony-tech/NeatFlashBrowser`).

## Build / run commands

```bash
npm install --legacy-peer-deps   # legacy peer deps required for Electron 9-era packages
npm run start                    # dev: electron .
npm run build                    # electron-builder --win -> dist/NeatFlashBrowser-Setup.exe
```

- **Node.js v12.14.0–v15.x is required** for Electron 9 compatibility — newer Node will not build
  native deps correctly.
- **`flashver/pepflashplayer64.dll` (or `pepflashplayer32.dll`) must be manually placed before
  building** — it's gitignored (licensing) and `index.js` will fail to load the plugin without it.
  `flashver/` also holds `libpepflashplayer.so` (Linux) and `PepperFlashPlayer.plugin` (macOS) for
  those platforms; `electron-builder`'s `asarUnpack` config keeps this whole folder outside the
  packaged asar so the plugin binary stays on disk at runtime.
- There's no test suite or linter in this repo.
- No CI is configured (`.github/` is empty).

## Architecture

### Main process — `index.js`

- **Single-instance lock**: only one browser process ever runs. A second launch (e.g. Botfather
  spawning the browser again for another account) hits `app.on('second-instance', ...)`, which
  parses `--url=`/`--title=` (or the legacy `--neat-url=`/`--neat-title=`) off the incoming command
  line and forwards an `open-new-tab` IPC message to the renderer instead of opening a new window —
  this is how "one organized window, many account tabs" works. The same args are parsed on cold
  start to open the first tab.
- **Flash plugin path resolution** is OS/arch-specific (`switch (process.platform)` /
  `process.arch`) and differs between running unpacked (`__dirname`) vs. packaged
  (`.asar` → `process.resourcesPath/app.asar.unpacked/...`).
- **Required insecure Chromium flags** (`disable-site-isolation-trials`, `ignore-certificate-errors`,
  `nodeIntegration: true`, `contextIsolation: false`, `enableRemoteModule: true`) exist solely to
  keep the PPAPI plugin and `electron-navigation`/`remote` working — see `SECURITY.md`'s table
  before touching any of these; they're deliberate, not oversights. Sandbox itself (`--no-sandbox`)
  is intentionally **not** set on Windows/macOS (only forced on Linux, where PPAPI needs it) — this
  is a point of pride per `SECURITY.md` ("Chromium Sandbox Restored").
- **HTTPS Bouncer / "Smart Escape Pod"**: `contents.on('will-navigate' | 'will-redirect' |
  'new-window', ...)` on every `web-contents-created` intercepts any `https://` URL before it loads
  and hands it to `exports.openSecureUrl()`, which spawns the user's configured external browser
  binary (`store.get('secureBrowserPath')`) directly via `child_process.spawn` — or shows a native
  warning dialog if no browser is configured yet. Plain `http://` URLs are safe and get routed to a
  new in-app tab instead. The renderer (`browser.html`) applies the *same* guard a second time
  inside each `<webview>`'s own `will-navigate` listener, since the webview's navigation events
  don't otherwise bubble through the main-process listener.
- **CSP injection** (`webRequest.onHeadersReceived`) only touches remote `http(s)://` responses that
  aren't `.swf` files — local `file://` and Flash content are left alone.
- **Favorites** (`autoSaveFavorite`/`setFavorite`/`removeFav`/`removeAllFav`) persist through
  `store.js` (a tiny hand-rolled JSON-file store, not `electron-store`) as `{url, title}` objects;
  old plain-string entries are upgraded on read. Favorites can be imported/exported as JSON from the
  Settings overlay (`browser.html`).
- **Proxy**: `applyProxyToSession()` sets a proxy on the `BrowserWindow`'s session
  (`session.setProxy`). This only affects Chromium's own networking (page loads, XHR) — **it does
  not reach the PPAPI Flash plugin's raw game-server socket**, which Chromium routes through its
  network-service process outside the session/proxy layer (confirmed by packet capture 2026-08-20;
  see the long comment above `applyProxyToSession` in `index.js`). That gap is currently
  unaddressed in this repo — a DLL-injection experiment aimed at it was tried locally and then
  deliberately removed (2026-09-05) as out of scope; that kind of socket-hook tooling belongs in
  `FlashSniffBrowser`/`AmfRelay` instead, per the workspace-level `CLAUDE.md`'s naming/ownership
  convention. Don't reintroduce it here without checking with the user first.

### Renderer — `browser.html`

Single-file renderer using `electron-navigation` (`enav`, tab strip + `<webview>` management) with
`nodeIntegration`/`remote` enabled so it can call back into `index.js` functions directly
(`remote.require('./index').openSecureUrl(...)`, `.sethome(...)`, etc.) rather than using a preload
+ IPC-channel pattern. Notable pieces: the Settings overlay (favorites list, secure-browser
auto-detect dropdown — scans common Chrome/Edge/Firefox/Brave/Safari install paths including
`ProgramW6432` for 64-bit-on-32-bit-redirect issues, proxy dropdown), and a dark-mode CSS injector
that detects raw `.xml`/`.json` responses (e.g. game battle reports) and applies a readable
background instead of leaving black-on-transparent text.

### `proxies.js` — Botfather proxy-pool bridge

Reads Botfather's own `Proxies` table directly out of `%APPDATA%\TheNEATBotfather\Data\TheNEATBotfather.db`
using `sql.js` (pure WASM SQLite) rather than a native SQLite binding — a native module would need
rebuilding against Electron 9's old ABI, which `sql.js` avoids entirely. It **copies** the DB file
to a temp path before reading (Botfather usually has it open concurrently; `sql.js` has no
WAL/locking awareness) and deletes the copy afterward. Returns `[]` silently if Botfather has never
run on the machine — this must stay a soft failure, not an exception, since the proxy dropdown is
optional UI.

### `scripts/build-home.js` — static home-tab generator

`npm run build-home` regenerates `home.html`, the tab opened when the browser starts without a
Botfather URL handoff (`browser.html`'s fallback branch loads `file://${__dirname}/home.html`).
It's generated rather than fetched live because the app can't just navigate to
`github.com/evony-tech/NeatFlashBrowser` itself — the HTTPS Bouncer would eject that navigation
straight back out to the OS browser. The script pulls two sources and needs to be rerun manually
whenever they change:
- `README.md`, via a small hand-rolled parser (`renderBlock`/`renderReadme`) — **not** a real
  markdown parser, because this README isn't actually GFM (no `#` headers, `**bold**`, or fenced
  code blocks, just plain paragraphs with emoji lead-ins). The parser is tuned to this specific
  shape, including cases where a heading and its first line of body text share one blank-line-
  delimited block with no break between them (see the comment above `renderBlock`).
- The latest `RELEASE_COUNT` GitHub Releases via the REST API (`marked` — a devDependency added
  for this script only, not used anywhere in the shipped app — renders their bodies, which *are*
  real markdown).
Network failure during generation is a soft failure (a "check GitHub from your regular browser"
fallback message), not a build error.

## Gotchas worth knowing before editing

- `browser.html` is a single large HTML file with inline `<script>`, not a bundled/transpiled
  frontend — there's no build step for the renderer beyond Electron loading it via `file://`.
- Two independent copies of the HTTPS-interception logic exist (main-process `web-contents-created`
  listeners in `index.js`, and the per-webview listener in `browser.html`) — if you change the
  bounce behavior, check both.
- `store.js` writes are synchronous (`fs.writeFileSync`) and unkeyed by version — favorites/settings
  corruption is handled defensively at the call sites (`Array.isArray` checks in `index.js`), not in
  `Store` itself.
- `home.html` is a generated, committed file (like the icons) — edit `README.md` or
  `scripts/build-home.js`, then rerun `npm run build-home`; don't hand-edit `home.html` directly, it
  will just be overwritten next regeneration.
