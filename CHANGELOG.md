Changelog
All notable changes to Neat Flash Browser will be documented in this file.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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