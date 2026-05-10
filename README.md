👑 Neat Flash Browser
The Ultimate Flash Browser engineered exclusively for The NEAT Botfather.

Neat Flash Browser is a custom-built, ultra-lightweight web browser designed to do one thing perfectly: play Games exactly like it's 2015. By stripping out modern commercial bloat and integrating directly with Botfather, it delivers maximum speed, automated account management, and a hardened security shield for legacy Flash content.

🚀 Core Features
🤖 Seamless Botfather Integration: Click "Login via Web Browser" in Botfather, and Neat Flash instantly catches the handoff. Built-in Single Instance Locking ensures multiple accounts open flawlessly as new tabs in a single, organized window.

🛡️ The "HTTPS Bouncer": Flash Player is a legacy engine. To keep you safe, Neat Flash features a rigid security bouncer. It intercepts any external HTTPS links or sneaky redirects, freezes them, and instantly kicks them out to your secure, default Windows browser (Chrome, Edge, etc.). Your Game container stays 100% sealed.

📁 Smart Account Organization: Running 50 accounts? The browser automatically parses Botfather's URL tags (e.g., [SS123] TECH) and organizes your lords into sleek, collapsible dark-mode server folders.

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
Download the latest pre-packaged installer directly from our website:

👉 Download Neat Flash Browser https://neato3.com/neatflashbrowser/

System Requirements:

Windows 10 or Windows 11 (64-bit)

The NEAT Botfather (v1.9.5.5 or later for automated URL injection)

Engineered by Evony-Tech for the Neato3 Community.