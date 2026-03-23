
# Flash Browser  (please give us a :star:)

## ⚠️ SECURITY WARNING ⚠️

**This application uses Electron 9.4.4 and Adobe Flash Player, both of which reached end-of-life and are no longer receiving security updates.**
- X
- **Electron 9.4.4**: EOL March 2021 - No security patches available
- **Adobe Flash Player**: EOL January 12, 2021 - No longer supported by Adobe
- **Known Vulnerabilities**: 29+ security issues in dependencies

### ✅ Safe Usage Requirements

**ONLY use Flash Browser in these scenarios:**
- Running inside a dedicated Virtual Machine (VM)
- Isolated network segment with no access to sensitive data
- No important accounts or personal information
- Legacy Flash game preservation and archival

**❌ DO NOT:**
- Use for banking, email, or sensitive accounts
- Access production systems or important data
- Run on your main computer without VM isolation
- Enter passwords or personal information

**See [SECURITY.md](SECURITY.md) for complete security information and best practices.**

---

## Setup Instructions

### Prerequisites
- Node.js (version 12.14.0 to 15.x recommended for Electron 9 compatibility)
- Flash Player plugin files (not included in source code - obtain from previous builds)

### Installation Steps

1. **Download & unzip** the code
2. **Install Node.js** if not already installed
3. **Navigate** to the unzipped folder using command line/terminal
4. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: `--legacy-peer-deps` is required due to @cliqz/adblocker-electron peer dependency mismatch

5. **Run the application:**
   ```bash
   npm run start
   ```

### Flash Player Plugin Files

Flash Player plugin files are **not included** in the source code due to licensing. You can obtain them from:
- Previous Flash Browser releases
- Archived Flash Player distributions
- Your own Flash Player installation backups

Required files by platform:
- **Windows (x64)**: `flashver/pepflashplayer64.dll`
- **Windows (x86)**: `flashver/pepflashplayer32.dll`
- **Linux**: `flashver/libpepflashplayer.so`
- **macOS**: `flashver/PepperFlashPlayer.plugin`

---

## Downloads

A browser dedicating to supporting adobe flash.
Run flash player in browser on:

Windows 10
:link: [Download Installer](https://github.com/radubirsan/FlashBrowser/releases) (86 MB) 

MacOS
:link: [Download Installer](https://github.com/radubirsan/FlashBrowser/releases/tag/v0.2) (268 MB) 

Linux (tested on Ubuntu)
:link: [Download Installer](https://github.com/radubirsan/FlashBrowser/releases/tag/v0.01) ([Run flash on Ubuntu tutorial](https://flash.pm/2021/09/23/run-flash-player-on-linux-ubuntu-with-flashbrowser-in-14-steps/)) 

# How do I use it?
How to Enable Adobe Flash Player on Chrome Browser?
How to install flash player browser video:

:movie_camera: Windows:
https://www.youtube.com/watch?v=Cv3umbqlw1g&t=1s

:movie_camera: Mac:
https://www.youtube.com/watch?v=NZFzMEZ9l-Y

<br/>![Capture](https://wethegeek.com/wp-content/uploads/2021/07/Adobe-Flash-Player.png)
<br/>![Captures](https://images-na.ssl-images-amazon.com/images/I/A1p%2BBYQK5BL.png)
<br/>![Captures](https://github.com/radubirsan/FlashBrowser/blob/main/unnamed.png)

You can run it from the command line (ex: FlashBrowser.exe D:\\Achilles.swf ) :


# Socials:
- Twitter: https://twitter.com/BrowserFlash
- Telegram: https://t.me/Flash_EN
- Discord: https://discord.gg/8nR2J7EcrV
- Youtube https://www.youtube.com/@FlashisBack
- e-mail flashblockchain@gmail.com

# Flash Sites:

| Description  | Link |
| ------------- | ------------- |
| Turn based Ninja  | http://ninjasage.id  |
| Game Gallery  | http://coolbuddy.com/  |
| Game Gallery| https://flashstorage.games/ |
| Game Gallery| https://www.friv.cloud/swf/list_swf_file.txt|
| Game Gallery| https://gamaverse.com/|
| Game Gallery| http://fancyplanet.org/|
| Game Gallery| https://itch.io/games/flash |
| Game Gallery| http://mystreous.0fees.net/oyunlar/ |
| Game Gallery| http://www.kanogames.com/play/game/robokill |
| Game Gallery| http://www.stickpage.com |
| Game Gallery| https://dovga.com/games |
| Game Gallery| https://www.siftheadsgames.com/Sift-Heads-Renegade-2.html |
<!---| Game Gallery| http://web.archive.org/web/20140818215300/http://www.nitrome.com/games/bumpbattleroyale/#.U_J11DO286Q |-->



---

## Important Security Notice

⚠️ **This is Alpha Software with End-of-Life Dependencies**

**CRITICAL SECURITY REQUIREMENTS:**
- ✅ **Install and run ONLY in a Virtual Machine (VM)**
- ✅ **Use isolated network with no access to important data**
- ✅ **Do NOT log into any important accounts** (email, banking, social media, etc.)
- ✅ **Do NOT enter passwords or sensitive information**
- ✅ **Do NOT access production systems or valuable data**

**Known Security Issues:**
- Electron 9.4.4 reached end-of-life in March 2021 (no security patches)
- Adobe Flash Player reached end-of-life in January 2021 (no updates)
- 29+ known vulnerabilities in dependencies (1 low, 9 moderate, 15 high, 4 critical)
- electron-navigation package has 44 known security issues and is abandoned

**For complete security information, risk assessment, and best practices, see [SECURITY.md](SECURITY.md)**

**For all changes and updates, see [CHANGELOG.md](CHANGELOG.md)**

---

[Download Count](https://hanadigital.github.io/grev/?user=radubirsan&repo=FlashBrowser2)

