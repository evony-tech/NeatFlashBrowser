# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

NeatFlashBrowser is an Electron 9.4.4 app that embeds the legacy Adobe Flash Player (PPAPI) plugin to run Flash-based browser games ("Evony"/`*.evony.com`) that no modern browser supports anymore. It exists purely as a companion front-end for [[TheNEATBotfather]] — the README calls it "engineered exclusively for The NEAT Botfather" — and is the piece that makes the Botfather ecosystem usable on Linux, since Botfather itself is a Windows-only WinForms app.

Single window, tabbed via a custom in-page tab bar (not Electron `BrowserView`/multi-window) — each "tab" is a `<webview>` inside `browser.html`.

## Build & run

Not an SDK-style Node project with a lockfile you can just `npm ci` — legacy Electron 9 stack.

- `npm install --legacy-peer-deps` (peer deps don't resolve cleanly with modern npm)
- `npm run start` — normal dev run (`electron .`)
- `npm run linux-start` — dev run on Linux (`electron . --no-sandbox`; PPAPI Flash requires no-sandbox on Linux, see below)
- `npm run build` — Windows installer (NSIS) via electron-builder
- `npm run linux-build` — Linux package via electron-builder
- `build1`/`build2`/`build3`/`buildWin32`/`buildWin64` — older `electron-packager` targets, largely superseded by the `build`/`linux-build` electron-builder scripts; probably safe to ignore unless asked about them specifically
- **Flash plugin binary is not in source control** — must be placed manually before building:
  - `flashver/pepflashplayer64.dll` / `pepflashplayer32.dll` (Windows)
  - `flashver/libpepflashplayer.so` (Linux)
  - `flashver/PepperFlashPlayer.plugin` (macOS)
  - `index.js` picks the right one by `process.platform`/`process.arch` near the top of the file; `asarUnpack: ["flashver/**/*"]` in `package.json`'s `build` config keeps it out of the asar archive so Electron can load it as a native plugin post-package.
- No test suite.

## Linux specifics

- PPAPI Flash requires `app.commandLine.appendSwitch('no-sandbox')`, which `index.js` sets automatically when `process.platform === 'linux'` — this is a real (documented) security tradeoff, not an oversight; keep the comment in place if you touch that block.
- `browser.html`'s "Set as Default Browser" flow branches on `process.platform`; on Linux it shells out to `xdg-settings set default-web-browser neatflashbrowser.desktop` via `execFile`, falling back to a dialog telling the user to run that command manually if it fails.
- Linux browser auto-detection (used by the "escape to external browser" bouncer, see below) checks `/usr/bin`, `/usr/local/bin`, `/snap/bin`, `/opt/google/chrome` for common browsers, then falls back to `which`, then to `xdg-open` as a last resort — there's no Windows-style registry to query.

## Architecture

### Process split
- `index.js` — Electron main process. Owns the single `BrowserWindow`, single-instance locking (`app.requestSingleInstanceLock()` / `second-instance` event, so a second launch or an OS "open with" hands its URL to the existing window instead of opening a new one), protocol registration (`setAsDefaultProtocolClient('http')`), and all `ipcMain` handlers.
- `browser.html` — the entire renderer UI: custom tab bar, `<webview>` per tab, settings overlay, favorites import/export. Talks to `index.js` over `ipcRenderer`.
- `store.js` — thin wrapper for persisted settings (favorites, chosen external browser, etc.) — check here before adding new persisted state rather than inventing a second mechanism.

### The Botfather handoff (the integration this Linux work is about)
This is the load-bearing mechanism connecting the two apps — see [[TheNEATBotfather]]'s `Web/dashboard.html` and `Handlers/ApiLaunchUrlHandler.cs` for the other half.

1. Botfather's web dashboard (served at `localhost:8025`) has a "▶ Play in Flash Browser" button per account. Clicking it calls Botfather's `POST /api/launch-url`, gets back `{url, title}` (a pre-authenticated `s.html?loginid=...` game URL), and does `window.top.postMessage({type:'open-flash-tab', url, title}, '*')`.
2. When the dashboard page is itself loaded inside a NeatFlashBrowser `<webview>`, `dashboard.html` catches that postMessage and re-sends it over `ipcRenderer.send('open-flash-tab', {url, title})` into the Electron main process (`index.js:205`).
3. `index.js`'s `open-flash-tab` handler validates the URL is `http://` (never `https://` — a `data`/`javascript`/`https` payload here should never be trusted, since this input effectively crosses from the Botfather HTTP server into `ipcMain`) and sends `open-new-tab` back down to the renderer to actually open the tab.
4. Separately, the 🤖 toolbar button in `browser.html` calls `ipcRenderer.invoke('botfather-ping')`, which does an `http.get('http://localhost:8025/')` from the main process with a 1.5s timeout; if alive, `open-botfather-tab` opens the dashboard itself as a tab, else the user gets an alert telling them to start Botfather first. The same probe runs automatically ~1.2s after app startup (`if (safeUrl === 'none')` — only when the app wasn't launched via a direct game-URL handoff) to silently auto-open the dashboard if Botfather's already running.

IPC channel map (main ⇄ renderer), for anyone adding a new one:
| Channel | Direction | Purpose |
|---|---|---|
| `open-botfather-tab` | renderer→main | open Botfather dashboard as a new tab |
| `open-flash-tab` | renderer→main | open a game login URL as a new tab (called via the postMessage bridge described above) |
| `botfather-ping` | renderer→main (invoke) | is Botfather's HTTP server alive on :8025 |
| `open-new-tab` | main→renderer | actually create the `<webview>` tab |
| `fullScreen-click` / `clearChache-click` | renderer→main | toolbar actions |

### The "HTTPS Bouncer"
Security boundary, not a convenience feature — don't loosen it without understanding why it exists (README: Flash/Electron 9 are both EOL, so this container is deliberately sealed to `http://*.evony.com`-style traffic only). Any navigation (`will-navigate`, `new-window`) to an `https://` URL, from either the main window or inside a `<webview>`, gets intercepted and handed to `openSecureUrl()` (`index.js` ~line 555), which shells the URL out to a real, updated external browser instead of loading it in this Flash-enabled container. On Linux that's the auto-detected browser list described above, falling back to `xdg-open`.

### Models vs. everything else
There's no `Models`/`Handlers`/`Services` split like Botfather has — this is a much smaller app. `index.js` = main-process logic, `browser.html` = all renderer logic and markup in one file, `store.js` = persistence. Keep new code inside that shape rather than introducing new files/folders unless a change is genuinely large enough to warrant it.
