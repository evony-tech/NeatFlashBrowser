# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Neat Flash Browser: an Electron 9.4.4 + Adobe Flash Player (PPAPI) desktop browser, purpose-built
as a companion app for **TheNEATBotfather** (see `../../TheNEATBotfather` and the workspace-level
`CLAUDE.md` one level up for the wider bot ecosystem this fits into) — including making that
ecosystem usable on Linux, since Botfather itself is a Windows-only WinForms app. It exists to keep
playing the Flash-era game client alive after Flash's EOL, while Botfather drives account logins
into it via a URL-handoff protocol (see "The Botfather handoff" below). Read `README.md` and
`SECURITY.md` before making changes — the whole app is designed around a single premise: this is a
sandboxed, single-purpose container for `http://*.somegamewithcastles.com` (and `localhost` Botfather dashboards)
that aggressively ejects anything else (`https://` links) out to the user's real OS browser, because
Electron 9 / Flash are both unpatched and unpatchable.

Single window, tabbed via a custom in-page tab bar built on `electron-navigation` (not Electron
`BrowserView`/multi-window) — each "tab" is a `<webview>` inside `browser.html`.

Note the path: the outer `NeatFlashBrowser/` folder is just a container — **this inner folder is
the actual git repo** (`origin` → `https://github.com/evony-tech/NeatFlashBrowser`).

## Build / run commands

```bash
npm install --legacy-peer-deps   # legacy peer deps required for Electron 9-era packages
npm run start                    # dev: electron .
npm run linux-start              # dev on Linux: electron . --no-sandbox (PPAPI Flash needs it there)
npm run build-home               # regenerate home.html from README.md + latest GitHub Releases
npm run build                    # Windows installer (NSIS) via electron-builder -> dist/NeatFlashBrowser-Setup.exe
npm run linux-build              # Linux package via electron-builder (no explicit target config -> AppImage default)
```

- `build1`/`build2`/`build3`/`build4`/`buildWin32`/`buildWin64` are older `electron-packager`
  targets, largely superseded by `build`/`linux-build`; ignore unless asked about them specifically.
- **Node.js v12.14.0–v15.x is required** for Electron 9 compatibility — newer Node will not build
  native deps correctly. (Build-time-only tooling like `scripts/build-home.js` isn't bound by this —
  it runs under whatever Node is on `PATH`, not Electron's bundled runtime.)
- **Flash plugin binaries are not in source control** — must be placed manually before
  building/running:
  - `flashver/pepflashplayer64.dll` / `pepflashplayer32.dll` (Windows)
  - `flashver/libpepflashplayer.so` (Linux)
  - `flashver/PepperFlashPlayer.plugin` (macOS)
  - `index.js` picks the right one by `process.platform`/`process.arch` near the top of the file;
    `asarUnpack: ["flashver/**/*"]` in `package.json`'s `build` config keeps it out of the asar
    archive so Electron can load it as a native plugin post-package.
- There's no test suite or linter in this repo. No CI is configured (`.github/` is empty).

## Linux specifics

- PPAPI Flash requires `app.commandLine.appendSwitch('no-sandbox')`, which `index.js` sets
  automatically when `process.platform === 'linux'` — a real, documented security tradeoff, not an
  oversight; keep the comment in place if you touch that block.
- "Set as Default Browser" branches on `process.platform`; on Linux it shells out to
  `xdg-settings set default-web-browser neatflashbrowser.desktop` via `execFile`, falling back to a
  dialog telling the user to run that command manually if it fails.
- The secure-browser auto-detect dropdown (used by the HTTPS Bouncer's "escape to external browser"
  flow, see below) checks `/usr/bin`, `/usr/local/bin`, `/snap/bin`, `/opt/google/chrome` for common
  browsers on Linux, then falls back to `which`, then to `xdg-open` as a last resort — there's no
  Windows-style registry to query.

## Architecture

### Process split
- `index.js` — Electron main process. Owns the single `BrowserWindow`, single-instance locking,
  protocol registration, and all `ipcMain` handlers.
- `browser.html` — the entire renderer UI: custom tab bar, `<webview>` per tab, settings overlay,
  favorites/proxy management. Talks to `index.js` both via `ipcRenderer` and directly via
  `remote.require('./index')` (nodeIntegration is on).
- `store.js` — thin wrapper for persisted settings (favorites, manual proxies, chosen external
  browser, etc.) — check here before adding new persisted state rather than inventing a second
  mechanism.
- `proxies.js` / `scripts/build-home.js` — standalone helper modules, described below.

### Main process — `index.js` details
- **Single-instance lock**: only one browser process ever runs. A second launch (e.g. Botfather
  spawning the browser again for another account, or an OS "open with") hits
  `app.on('second-instance', ...)`, which parses `--url=`/`--title=` (or the legacy
  `--neat-url=`/`--neat-title=`) off the incoming command line and forwards an `open-new-tab` IPC
  message to the renderer instead of opening a new window. The same args are parsed on cold start to
  open the first tab.
- **Flash plugin path resolution** is OS/arch-specific and differs between running unpacked
  (`__dirname`) vs. packaged (`.asar` → `process.resourcesPath/app.asar.unpacked/...`).
- **Required insecure Chromium flags** (`disable-site-isolation-trials`, `ignore-certificate-errors`,
  `nodeIntegration: true`, `contextIsolation: false`, `enableRemoteModule: true`) exist solely to
  keep the PPAPI plugin and `electron-navigation`/`remote` working — see `SECURITY.md`'s table
  before touching any of these; they're deliberate, not oversights. Sandbox itself (`--no-sandbox`)
  is intentionally **not** set on Windows/macOS (only forced on Linux) — a point of pride per
  `SECURITY.md` ("Chromium Sandbox Restored").
- **CSP injection** (`webRequest.onHeadersReceived`) only touches remote `http(s)://` responses that
  aren't `.swf` files — local `file://` and Flash content are left alone.
- **Favorites** (`autoSaveFavorite`/`setFavorite`/`removeFav`/`removeAllFav`) persist through
  `store.js` as `{url, title}` objects; old plain-string entries are upgraded on read.
- **Proxy**: `applyProxyToSession()` sets a proxy on the `BrowserWindow`'s session
  (`session.setProxy`). This only affects Chromium's own networking (page loads, XHR) — **it does
  not reach the PPAPI Flash plugin's raw game-server socket**, which Chromium routes through its
  network-service process outside the session/proxy layer (confirmed by packet capture 2026-08-20;
  see the comment above `applyProxyToSession`). That gap is currently unaddressed here — a
  DLL-injection experiment aimed at it was tried locally and deliberately removed (2026-09-05) as
  out of scope; that kind of socket-hook tooling belongs in `FlashSniffBrowser`/`AmfRelay` instead,
  per the workspace-level `CLAUDE.md`'s naming/ownership convention. Don't reintroduce it here
  without checking with the user first.
- **Update check**: `checkForUpdate()` hits `api.github.com/.../releases/latest` directly as a
  background HTTPS request — not a webContents navigation — so it isn't caught by the HTTPS Bouncer
  and doesn't need a secure browser configured just to check.

### The Botfather handoff
The load-bearing mechanism connecting the two apps — see [[TheNEATBotfather]]'s `Web/dashboard.html`
and `Handlers/ApiLaunchUrlHandler.cs` for the other half.

1. Botfather's web dashboard (served at `localhost:8025`) has a "▶ Play in Flash Browser" button per
   account. Clicking it calls Botfather's `POST /api/launch-url`, gets back `{url, title}`, and does
   `window.top.postMessage({type:'open-flash-tab', url, title}, '*')`.
2. When the dashboard page is itself loaded inside a NeatFlashBrowser `<webview>`, `dashboard.html`
   catches that postMessage and re-sends it over `ipcRenderer.send('open-flash-tab', {url, title})`
   into the main process.
3. `index.js`'s `open-flash-tab` handler validates the URL is `http://` (never
   `https://`/`data:`/`javascript:` — this input crosses from Botfather's HTTP server into
   `ipcMain`, so it's untrusted) and sends `open-new-tab` back down to the renderer.
4. The 🤖 toolbar button in `browser.html` calls `ipcRenderer.invoke('botfather-ping')`, which does
   an `http.get('http://localhost:8025/')` from the main process with a 1.5s timeout; if alive,
   `open-botfather-tab` opens the dashboard itself as a tab, else the user gets an alert telling them
   to start Botfather first. The same probe runs automatically ~1.2s after startup (only when not
   launched via a direct game-URL handoff) to silently auto-open the dashboard if Botfather's already
   running.

IPC channel map (main ⇄ renderer):
| Channel | Direction | Purpose |
|---|---|---|
| `open-botfather-tab` | renderer→main | open Botfather dashboard as a new tab |
| `open-flash-tab` | renderer→main | open a game login URL as a new tab (via the postMessage bridge above) |
| `botfather-ping` | renderer→main (invoke) | is Botfather's HTTP server alive on :8025 |
| `open-new-tab` | main→renderer | actually create the `<webview>` tab |
| `fullScreen-click` / `clearChache-click` | renderer→main | toolbar actions |

### The HTTPS Bouncer / "Smart Escape Pod"
Security boundary, not a convenience feature — don't loosen it without understanding why it exists
(this container is deliberately sealed to `http://*.somegamewithcastles.com`-style traffic only, since Electron
9/Flash are both EOL). `contents.on('will-navigate' | 'will-redirect' | 'new-window', ...)` on every
`web-contents-created` intercepts any `https://` URL and hands it to `exports.openSecureUrl()`,
which spawns the user's configured external browser binary (`store.get('secureBrowserPath')`)
directly via `child_process.spawn` (on Linux, falling back through the auto-detected browser list,
then `xdg-open`) — or shows a native warning dialog if none is configured. Plain `http://` URLs are
safe and get routed to a new in-app tab instead. The renderer (`browser.html`) applies the *same*
guard a second time inside each `<webview>`'s own `will-navigate` listener, since webview navigation
events don't otherwise bubble through the main-process listener — if you change the bounce behavior,
check both places.

### Renderer — `browser.html`
Single-file renderer (no bundler/transpiler — Electron loads it straight via `file://`) using
`electron-navigation` (`enav`, tab strip + `<webview>` management) with `nodeIntegration`/`remote`
enabled so it can call back into `index.js` functions directly rather than using a preload +
IPC-channel pattern exclusively. Notable pieces in the Settings overlay (closes on an outside click —
`#overlay`'s own click handler, with `stopPropagation()` on the inner panel so clicks inside it don't
bubble up and close it):
- Secure-browser auto-detect dropdown (scans common install paths per-platform, including
  `ProgramW6432` for Windows 64-on-32 redirect issues).
- Proxy dropdown: a flat merged list of whatever's read from Botfather's DB (via `proxies.js`) plus a
  separately-managed manual list (add/inline-edit/delete, or import a `proxylist.txt` — one
  `host:port` per line) stored under `manualProxies` in `store.js`. Botfather's own DB is never
  written to from here — if it has entries the user likely doesn't need to add their own, and if it
  doesn't (or isn't reachable) they just add their own instead. No visual distinction between the two
  sources in the dropdown itself.
- Favorites: import/export as JSON, inline rename, `[Server] Name`-pattern auto-grouping into
  collapsible folders.
- "Check for updates" button (see `checkForUpdate()` above).
- Address bar: typing a server code (`ss78.` or `78.`) offers an inline game-server-domain completion
  (left selected, so continued typing just replaces it) — implemented via `document`-level `input`
  event delegation, since `electron-navigation` creates the actual `#nav-ctrls-url` input, not us.
  Appending the suggestion via `.value` doesn't fire a native `input` event on its own, so a
  synthetic one is dispatched right after — otherwise `electron-navigation`'s own address-bar logic
  keeps a stale cached value and Enter needs a second press to pick up the real one.
- A CSS injector that detects raw `.json`/`.xml`/`.plain` MIME-type responses (checks the actual
  `Content-Type`, not the URL) and applies a **light** background (`#fafafa` bg / `#1e1e1e` text)
  rather than a dark one — Chromium's built-in raw-data viewer has its own syntax-highlight colors
  tuned for a light background, so forcing a dark one just makes the text low-contrast.

### `proxies.js` — Botfather proxy-pool bridge
Reads Botfather's own `Proxies` table directly out of
`%APPDATA%\TheNEATBotfather\Data\TheNEATBotfather.db` using `sql.js` (pure WASM SQLite) rather than
a native SQLite binding — a native module would need rebuilding against Electron 9's old ABI, which
`sql.js` avoids entirely. It **copies** the DB file to a temp path before reading (Botfather usually
has it open concurrently; `sql.js` has no WAL/locking awareness) and deletes the copy afterward.
Returns `[]` silently if Botfather has never run on the machine — this must stay a soft failure, not
an exception, since the proxy dropdown is optional UI.

### `scripts/build-home.js` — static home-tab generator
`npm run build-home` regenerates `home.html`, the tab opened when the browser starts without a
Botfather URL handoff. It's generated rather than fetched live because the app can't just navigate
to `github.com/evony-tech/NeatFlashBrowser` itself — the HTTPS Bouncer would eject that navigation
straight back out to the OS browser. Pulls two sources, and needs to be rerun manually whenever they
change:
- `README.md`, via a small hand-rolled parser (`renderBlock`/`renderReadme`) — **not** a real
  markdown parser, because this README isn't actually GFM (no `#` headers, `**bold**`, or fenced
  code blocks, just plain paragraphs with emoji lead-ins). Tuned to this specific shape, including
  cases where a heading and its first line of body text share one blank-line-delimited block with no
  break between them.
- The latest `RELEASE_COUNT` GitHub Releases via the REST API (`marked` — a devDependency added for
  this script only, not used anywhere in the shipped app — renders their bodies, which *are* real
  markdown).
Network failure during generation is a soft failure (a "check GitHub from your regular browser"
fallback message baked into the page), not a build error.

## Gotchas worth knowing before editing

- No `Models`/`Handlers`/`Services` split like Botfather has — this is a much smaller app. Keep new
  code inside the existing shape (`index.js` main-process logic, `browser.html` all renderer
  logic/markup, `store.js` persistence, small standalone helper modules for anything self-contained)
  rather than introducing new structure unless a change is genuinely large enough to warrant it.
- Two independent copies of the HTTPS-interception logic exist (main-process and per-webview, see
  above) — if you change the bounce behavior, check both.
- `store.js` writes are synchronous (`fs.writeFileSync`) and unkeyed by version — favorites/settings
  corruption is handled defensively at the call sites (`Array.isArray` checks), not in `Store`
  itself.
- `home.html` is a generated, committed file (like the icons) — edit `README.md` or
  `scripts/build-home.js`, then rerun `npm run build-home`; don't hand-edit `home.html` directly, it
  will just be overwritten next regeneration.
