Changelog
All notable changes to Neat Flash Browser will be documented in this file.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.
## [1.5.3] - 2026-09-05

### Summary
This update rounds out proxy support with full manual editing, makes the default start tab work offline, and smooths out two rough edges in the address bar and Settings menu.

### Added
- **Manual Proxy List:** The Proxy dropdown in Settings now merges Botfather's own proxy list with a separately managed list you control directly — add one by typing `host:port`, edit or remove existing entries inline, or import a whole `proxylist.txt` (one `host:port` per line) in one go.
- **Offline Home Page:** The default tab (opened when the browser isn't launched via a Botfather handoff) is now a generated page built from this repo's README and its latest GitHub Releases, instead of pointing out to neato3.com — since the browser can't navigate to its own `https://` GitHub page itself without the HTTPS Bouncer kicking it back out.
- **Address Bar Server Autofill:** Typing a server code like `ss78.` or `78.` in the address bar now offers an inline game-server completion, the same way a normal browser omnibox completes a bare hostname.
- **Smarter Update Check:** "Check for updates" now queries GitHub's release API directly in the background instead of always bouncing out to an external browser just to find out if there's something new — you only leave the app if you choose to open the release page.

### Fixed
- **Settings Menu:** Clicking outside the Settings panel now closes it, instead of requiring the explicit Close button.
- **Raw Data Contrast:** Raw JSON/XML/plain-text pages now use a light background instead of a forced dark one — Chromium's built-in viewer applies its own syntax-highlight colors tuned for a light background, so the previous dark override was low-contrast.
- **Address Bar Display:** The offline home tab now shows as `home.html` in the address bar instead of its full local disk path.

## [1.4.1] - 2026-05-19

### Summary
This update brings robust Import/Export tools for Favorites, a specialized XML reading theme, and crucial bug fixes for Electron IPC deadlocks and 64-bit Windows environment pathing.

### Added
- **Import & Export Favorites:** Added side-by-side Export and Import buttons in the Settings overlay. Users can now easily backup their dashboards to a JSON file or migrate them to a new PC. The importer features smart-merging to automatically prevent exact URL duplicates.
- **XML Readability Theme:** The browser now actively listens for `.xml` file extensions (like Evony battle reports) and dynamically injects a custom `rgb(194, 139, 86)` background color. This ensures raw black text is perfectly readable without sacrificing the browser's global dark theme for other dashboards.
- **Brave Browser Support:** Added Brave Browser to the HTTPS secure browser auto-detection list.

### Fixed
- **64-Bit Browser Auto-Detection:** Bypassed Windows 32-bit folder redirection (where the 32-bit Flash browser was being lied to by the OS and redirected to `Program Files (x86)`). By explicitly querying the `ProgramW6432` environment variable, the Settings menu can now successfully detect 64-bit installations of Chrome, Edge, and Firefox.
- **File Picker IPC Deadlock:** Removed the parent window binding (`remote.getCurrentWindow()`) from Electron's `dialog.showOpenDialog` and `dialog.showSaveDialog` calls. This completely eliminates UI freezing and deadlocking issues when picking a custom browser executable or importing files on certain Windows builds.
- **Favorites Corruption Crash:** Bulletproofed the Favorites routing engine with strict `Array.isArray()` validation checks. If a user's `user-preferences.json` file becomes corrupted and saves as an object instead of an array, the browser will gracefully reset it instead of instantly crashing the UI loop.

## [1.3.11] - 2026-05-14

### Summary
This update restores essential right-click functionality inside the browser tabs, giving users back their native copy, cut, and paste controls that were previously blocked by the sandboxed webviews.

### Added
- **Smart Context Menu:** Implemented a native right-click menu across all active browser tabs. The menu is dynamically context-aware:
  - Displays **Copy** only when text is actively highlighted.
  - Displays **Cut** and **Paste** only when clicking inside an editable text field (e.g., login screens, chat boxes, or forms).
  - Always provides a **Select All** option for quick data highlighting.

### Fixed
- **Right-Click Swallowing:** Bypassed a core Chromium sandboxing limitation where the inner `<webview>` tags were completely ignoring right-click events, preventing users from easily copying data or pasting complex passwords into the Evony client or Botfather dashboards.

## [1.3.9] - 2026-05-14

### Summary
This update introduces the Smart Auto-Detect Engine for the HTTPS Bouncer, allowing the browser to automatically scan your OS for installed external browsers. It also brings massive quality-of-life upgrades to the Favorites system and seals two navigation bypass leaks.

### Added
- **Smart Browser Auto-Detection:** The Settings menu now automatically scans Windows and macOS for installed secure browsers (Google Chrome, Microsoft Edge, Mozilla Firefox, and Safari) and populates them into an easy-to-use dropdown menu.
- **Custom Executable Picker:** Added a native OS file picker fallback for users who install their secure browsers in non-standard directories.
- **Inline Favorite Editing & Auto-Folders:** You can now rename favorites directly in the dropdown menu. Renaming a favorite using the `[Server] Name` format (e.g., `[SS82] Farm`) will dynamically generate a clean, collapsible folder for that server and group the accounts inside it.
- **Update Link:** Added a direct "Check for updates on GitHub" link in the Settings menu that safely routes through the Escape Pod.

### Changed
- **Native OS Warnings:** When an HTTPS link is blocked and no secure browser is configured, the browser no longer attempts to render an HTML error page. It now triggers a clean, Native OS Warning Dialog that pauses the application and explains how to configure the settings.
- **Default Browser Assignment:** Clicking "Set default browser" now automatically opens the native Windows `ms-settings:defaultapps` page, making it much easier for users to assign the browser at the OS level.
- **UI Polish:** Stripped out the bulky, light-grey Chromium scrollbars from the Settings overlay and Favorites menu. The menus remain fully scrollable via mouse wheel but look much cleaner in dark mode.

### Fixed
- **Address Bar Leak:** Fixed a vulnerability where manually typing an `https://` link directly into the address bar would bypass the outer window's Bouncer. The Bouncer now actively monitors the inner `<webview>` tag's `will-navigate` events.
- **Data URI Glitch:** Fixed an issue where the legacy `electron-navigation` library would mistakenly send internal `data:` URIs to Google Search instead of rendering them.
[1.3.7] - 2026-05-13
Summary
This massive update officially rebrands the project to Neat Flash Browser, transforming it into a purpose-built companion for The NEAT Botfather. It focuses on eradicating Chromium process bugs, overhauling the user interface, slimming down dependencies, and implementing a strict URL router to sandbox legacy Flash content from modern HTTPS web traffic.

Added
Smart Escape Pod (HTTPS Bouncer): Engineered a custom "Monkey Patch" over electron-navigation. Secure https:// URLs (like PayPal or external links) are now strictly forbidden from opening inside the Flash environment. They are instantly intercepted and spawned directly into the user's secure native OS browser (Chrome, Firefox, Brave, or Edge) via child_process.spawn, bypassing Windows 11 default app loop traps.

Botfather Auto-Save: Added CLI argument parsers (--url= and --title=) that automatically identify incoming links from the Botfather C# server and seamlessly add them to the Smart Favorites list.

Single Instance Lock: Prevents multiple browser processes from spawning. Clicking a new account in Botfather will now cleanly route the new tab into the already-running Neat Flash Browser window.

Default Browser Integration: Added a "Set as Default HTTP Browser" button to the Settings menu that registers the app with the Windows registry to automatically catch standard unencrypted links.

Changed
Instant Settings UI: Completely ripped out the slow, legacy backend IPC messaging for the Settings menu. The Settings and Favorites control panel now operates entirely on the frontend as an instant, dark-mode HTML overlay.

Tab Creation Sequence: Tab attributes (plugins: '') are now injected during the HTML construction phase rather than post-creation, allowing Flash to be active the exact millisecond the tab spawns.

Fixed
Eradicated Terminal Flicker: Removed the global no-sandbox flag and deleted the deprecated --enable-npapi switch. This entirely fixes the "Chromium Sandbox Flicker" bug where Windows would briefly flash a terminal (conhost.exe) when opening new tabs.

Ghost Tabs: Fixed an issue where closing the Settings menu could accidentally trigger background navigations.

Removed
Dependency Bloat: Stripped out heavy, unused packages (@cliqz/adblocker-electron, electron-dl, and cross-fetch) to drastically reduce memory footprint and improve tab-launch speed for local Botfather routing.

[1.0.1] - 2026-01-09
(Legacy Fork Update)

Summary
This update focuses on dependency updates and security hardening while maintaining PPAPI Flash Player plugin support on Electron 9.4.4 (the latest and final version supporting PPAPI plugins).
Note: Electron 9.4.4 reached end-of-life in March 2021. This application should only be used in isolated/sandboxed environments.

Changed
Dependencies Updated

electron-builder: 22.9.1 → 22.14.13 (latest Electron 9 compatible)

electron-packager: 15.4.0 → 15.5.2 (latest Electron 9 compatible)

electron-context-menu: 3.1.1 → 3.6.1 (stay in v3; v4+ requires Electron 12+)

Added engines field specifying Node.js version constraints: >=12.14.0 <16.0.0

Security Improvements
Added Content Security Policy headers for non-Flash content via onHeadersReceived handler.

Added URL input sanitization before setting favorites/homepage (Empty input validation, Protocol validation).

Wrapped remote.require() calls in try-catch blocks.

SECURITY.md: Added comprehensive security policy and vulnerability disclosure guidelines detailing known security limitations.

Required Security Trade-offs
The following security-reducing flags are required for PPAPI Flash Player support and cannot be removed:

disable-site-isolation-trials - Required for plugin content access

ignore-certificate-errors - Many Flash sites use expired certificates

allow-insecure-localhost - Required for local Flash development

nodeIntegration: true - Required for electron-navigation

contextIsolation: false - Required for remote module access

enableRemoteModule: true - Required for navigation features

[1.0.0] - Original Release
Initial release of Flash Browser with Electron 9.4.4 and PPAPI Flash Player support.

Features:
Multi-platform Flash Player support (Windows, macOS, Linux)

Tab-based browser interface

Favorites and homepage management

Zoom controls and find-in-page

Cache management

Context menus

Keyboard shortcuts