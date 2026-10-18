👑 Neat Flash Browser
The Ultimate Flash Browser engineered exclusively for The NEAT Botfather.

Neat Flash Browser is a custom-built, ultra-lightweight web browser designed to do one thing perfectly: play Games exactly like it's 2015. By stripping out modern commercial bloat and integrating directly with Botfather, it delivers maximum speed, automated account management, and a hardened security shield for legacy Flash content.

🆕 What's New
🔌 Manual Proxy List: Add, edit, or import your own proxies from a proxylist.txt file alongside whatever Botfather already provides, right from the Settings menu.

🏠 Offline Home Page: The default start tab is now generated from this README and the latest GitHub Releases, so it works without ever leaving the sandboxed browser.

⌨️ Address Bar Autofill: Typing a server code like ss78. now offers an inline game server completion, just like a normal browser's address bar.

🔄 Smarter Update Check: "Check for updates" now checks GitHub directly in the background instead of always opening an external browser just to look.

See CHANGELOG.md for the full release history.

🚀 Core Features
🤖 Seamless Botfather Integration: Click "Login via Web Browser" in Botfather, and Neat Flash instantly catches the handoff. Built-in Single Instance Locking ensures multiple accounts open flawlessly as new tabs in a single, organized window.

🛡️ The "HTTPS Bouncer": Flash Player is a legacy engine. To keep you safe, Neat Flash features a rigid security bouncer. It intercepts any external HTTPS links or sneaky redirects, freezes them, and instantly kicks them out to your secure, default Windows browser (Chrome, Edge, etc.). Your Game container stays 100% sealed.

📁 Smart Account Organization: Running 50 accounts? The browser automatically parses Botfather's URL tags (e.g., [SS123] THOR) and organizes your lords into sleek, collapsible dark-mode server folders.

🌐 Native OS Integration: With one click in the Settings menu, Neat Flash securely registers itself with Windows 10/11 as your default HTTP handler, while leaving your HTTPS web traffic completely untouched.

⚠️ Security Notice & Architecture
The Candid Truth: This application relies on Electron 9.4.4 and Adobe Flash Player (PPAPI), both of which are End-of-Life (EOL) and no longer receive security patches.

How we mitigate this:
We engineered the HTTPS Bouncer specifically for this reason. Neat Flash Browser is designed to be an isolated container strictly for http://*.somegamewithcastles.com.

DO NOT use this browser for banking, email, or social media.

DO NOT enter personal passwords into this browser.

If you navigate outside of the game, the browser will aggressively attempt to route that traffic to your standard, updated OS browser.

For maximum security, we still highly recommend running Botfather and Neat Flash Browser inside a dedicated Virtual Machine (VM) or isolated VPS.

🛠️ Developer Setup & Compilation
Want to build Neat Flash Browser from the source?

Prerequisites
Node.js (v12.14.0 to v15.x highly recommended for Electron 9 compatibility)

Flash Player Plugin: Due to licensing, the native Flash .dll is not included in the source code. You must place pepflashplayer64.dll (or pepflashplayer32.dll for 32-bit systems) into a folder named flashver/ in the root directory before compiling.

Build Instructions
Clone the repository and open your terminal.

Install the legacy dependencies:

Bash
npm install --legacy-peer-deps
Run the development build to test:

Bash
npm run start
Compile the Windows Installer (automatically handles ASAR unpacking for the Flash plugin and writes the Master Browser Registry keys):

Bash
npm run build
Your compiled NeatFlashBrowser-Setup.exe will be waiting in the dist/ folder.

📥 Downloads & Installation
Ready to play? You don't need to compile it yourself.
All installers are centralized on GitHub Releases — no separate download mirror to keep in sync:

👉 Download Neat Flash Browser https://github.com/evony-tech/NeatFlashBrowser/releases/latest

**Windows only.** Botfather itself is a Windows-only WinForms app, so Windows is where nearly
everyone runs Neat Flash Browser — and as of v1.5.4 it's the only platform we build and release
for. Grab `NeatFlashBrowser-Setup.exe`.

Linux and macOS builds existed for a while (v1.5.3 shipped both), but have been discontinued:
Electron 9 — required for the PPAPI Flash plugin this app depends on — no longer runs at all on
current Linux kernels (crashes immediately on startup with a `futex` error). Since that's the
underlying runtime on both platforms, there's no viable path to keep shipping Linux or macOS
builds without a much larger rewrite (a newer Electron means a newer, incompatible Flash plugin
story). If you're on Linux or macOS, your option is running Botfather + Neat Flash Browser inside
a Windows VM.

System Requirements:

Windows 10 or Windows 11 (64-bit) — only supported platform

The NEAT Botfather (v1.9.5.5 or later for automated URL injection)

Engineered by Evony-Tech for the Neato3 Community.