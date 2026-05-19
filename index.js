process.env.ELECTRON_NO_ATTACH_CONSOLE = 'true'; // Force Windows to suppress terminal popups for child processes
const {
    app,
    protocol,
    BrowserWindow,
	globalShortcut,
    Menu
} = require('electron');
// fiae function for dynamic quick error changing
function fiae(platform) {
	console.error(new Error(`IA32 arch for platform "${platform}" is not supported`));
};
const path = require('path');
const Store = require('./store.js');
const contextMenu = require('electron-context-menu');
const { ipcMain } = require('electron');
contextMenu({
	showSaveImageAs: true
});

let mainWindow;

let pluginName = null; //put the right flash plugin in depending on the operating system.
switch (process.platform) {
	case 'win32':
		switch (process.arch) {
			case 'ia32':
				fiae('win32');
			case 'x32':
				pluginName = 'flashver/pepflashplayer32.dll'
				console.log("ran!");
				break
			case 'x64':
				pluginName = 'flashver/pepflashplayer64.dll'
				console.log("ran!");
				break
		}
		break
	case 'linux':
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flashver/libpepflashplayer.so';
				break
			case 'x64':
				pluginName = 'flashver/libpepflashplayer.so';
				break
		}

		// SECURITY NOTE: no-sandbox is required for PPAPI Flash plugin support on Linux
		// This reduces security isolation. Only run in isolated/VM environment.
		app.commandLine.appendSwitch('no-sandbox');
		break
	case 'darwin':
		pluginName = 'flashver/PepperFlashPlayer.plugin'
		break
}
app.commandLine.appendSwitch("disable-renderer-backgrounding");
if (process.platform !== "darwin") {
	app.commandLine.appendSwitch('high-dpi-support', "1");
	//app.commandLine.appendSwitch('force-device-scale-factor', "1");
}
//app.commandLine.appendSwitch("--enable-npapi");
//app.commandLine.appendSwitch("--enable-logging");
//app.commandLine.appendSwitch("--log-level", 4);

// SECURITY NOTE: Load PPAPI Flash plugin with error handling
try {
	let pluginPath;
	
	// If compiled, look in the unpacked folder outside the archive
	if (__dirname.includes('.asar')) {
		pluginPath = path.join(process.resourcesPath, 'app.asar.unpacked', pluginName);
	} else {
		// If running locally in VS Code, look in the normal folder
		pluginPath = path.join(__dirname, pluginName);
	}
	
	app.commandLine.appendSwitch('ppapi-flash-path', pluginPath);
	console.log(`Flash plugin loaded from: ${pluginPath}`);
} catch (error) {
	console.error('Failed to load Flash plugin:', error);
}
//app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname.includes(".asar") ? process.resourcesPath : __dirname, "plugins/" + pluginName));

// SECURITY WARNING: The following flags reduce security isolation and are required for Flash
// - disable-site-isolation-trials: Required for PPAPI plugin content access
// - no-sandbox: Required for PPAPI plugin loading (reduces process isolation)
// - ignore-certificate-errors: Allows Flash content on sites with invalid certificates
// - allow-insecure-localhost: Allows local Flash development
// RECOMMENDATION: Only use this application in an isolated VM or sandbox environment
app.commandLine.appendSwitch('disable-site-isolation-trials');
//app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');

let sendWindow = (identifier, message) => {
    mainWindow.webContents.send(identifier, message);
};

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1280, height: 720, max:false }
  }
});

// Add error handlers to catch any unhandled errors
process.on('uncaughtException', (error) => {
	console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('UNHANDLED REJECTION:', reason);
});
// --- NEAT FLASH BROWSER: SINGLE INSTANCE LOCK ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit(); // If an instance is already running, kill this new one immediately
    return;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();

        const urlArg = commandLine.find(arg => arg.startsWith('--url=') || arg.startsWith('--neat-url='));
        const titleArg = commandLine.find(arg => arg.startsWith('--title=') || arg.startsWith('--neat-title='));

        let safeUrl = urlArg ? urlArg.replace(/--url=|--neat-url=/, '') : (commandLine.find(arg => arg.startsWith('http')) || "none");
        let passedTitle = titleArg ? titleArg.replace(/--title=|--neat-title=/, '') : 'Neat Flash Browser';

        let encodedTitle = encodeURIComponent(passedTitle);
        let encodedUrl = encodeURIComponent(safeUrl);

        // FIX: Pass 'isBotfather' as true ONLY if the strict flag was found
        mainWindow.webContents.send('open-new-tab', { 
            url: encodedUrl, 
            title: encodedTitle, 
            isBotfather: !!urlArg 
        });
    }
});

app.on('ready',   () => {

	// FIX: Explicitly set the App ID so Windows can match it to the Registry keys
    app.setAppUserModelId("com.neato3.neatflashbrowser");

	// --- NEAT FLASH BROWSER: SYSTEM DEFAULT HANDLER ---
	// Ask Windows to make this the default browser for web links
	if (!app.isDefaultProtocolClient('http')) {
		app.setAsDefaultProtocolClient('http');
	}

	// --- NEAT FLASH BROWSER: HTTPS KICK-OUT BOUNCER ---
	app.on('web-contents-created', (event, contents) => {
		
		contents.on('will-navigate', (navEvent, navigationUrl) => {
			if (navigationUrl.startsWith('https://')) {
				navEvent.preventDefault(); 
				exports.openSecureUrl(navigationUrl); // FIX: Use the Smart Escape Pod
			}
		});

		contents.on('will-redirect', (navEvent, navigationUrl) => {
			if (navigationUrl.startsWith('https://')) {
				navEvent.preventDefault(); 
				exports.openSecureUrl(navigationUrl); // FIX: Use the Smart Escape Pod
			}
		});

		contents.on('new-window', (navEvent, navigationUrl) => {
			if (navigationUrl.startsWith('https://')) {
				navEvent.preventDefault(); 
				exports.openSecureUrl(navigationUrl); // FIX: Use the Smart Escape Pod
			}
		});
	});
	
	// --- NEAT FLASH BROWSER: FULLSCREEN SYNC & HOTKEYS ---
	ipcMain.on('fullScreen-click', () => {
		if (mainWindow) {
			let isFS = !mainWindow.isFullScreen();
			mainWindow.setFullScreen(isFS);
			mainWindow.webContents.send('toggle-ui-fullscreen', isFS);
		}
	});

	// Catch F11 and Escape cleanly across all tabs (even when clicked inside the game)
	app.on('web-contents-created', (event, contents) => {
		contents.on('before-input-event', (e, input) => {
			if (mainWindow) {
				if (input.key === 'F11' && input.type === 'keyDown') {
					let isFS = !mainWindow.isFullScreen();
					mainWindow.setFullScreen(isFS);
					mainWindow.webContents.send('toggle-ui-fullscreen', isFS);
					e.preventDefault(); // Stop native Chromium F11
				} else if (input.key === 'Escape' && input.type === 'keyDown' && mainWindow.isFullScreen()) {
					mainWindow.setFullScreen(false);
					mainWindow.webContents.send('toggle-ui-fullscreen', false);
					e.preventDefault(); 
				}
			}
		});
	});

	Menu.setApplicationMenu(null);

    let { width, height, isMax } = store.get('windowBounds');
    let filePath = 'filePath';
	console.log("inti param" + process.argv);

	// --- NEAT FLASH BROWSER: SAFE ARGUMENT PARSER ---
	// Locate where you catch the URL and Title via explicit flags
	const urlArg = process.argv.find(arg => arg.startsWith('--url='));
	const titleArg = process.argv.find(arg => arg.startsWith('--title='));

	// Use a safe fallback
	let passedTitle = titleArg ? titleArg.replace('--title=', '') : 'NeatFlashBrowser';
	let safeUrl = urlArg ? urlArg.replace('--url=', '') : "none";

	// BULLETPROOFING: Encode the strings so spaces/brackets don't crash the Chromium Engine
	let encodedTitle = encodeURIComponent(passedTitle);
	let encodedUrl = encodeURIComponent(safeUrl);

	if(width < 100 || height < 100) {
		width = 800;
		height = 500;
	}

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: passedTitle,
        frame: false, 
        transparent: false,
        show: true,
        backgroundColor: '#202124',
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            plugins: true,
            contextIsolation: false,
            enableRemoteModule: true,
			// Use --url and --title for maximum compatibility with the renderer router
            additionalArguments: [`--url=${encodedUrl}`, `--title=${encodedTitle}`]
        }
    });

    mainWindow.loadURL(`file://${__dirname}/browser.html`);


	// SECURITY: Add Content Security Policy headers for additional protection
	// Note: CSP is only applied to remote HTTP/HTTPS content, not local file:// resources
	mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
		// Only apply CSP to remote content (HTTP/HTTPS), not local files or Flash
		if(details.url && details.url.match(/^https?:\/\//i) && details.url.indexOf(".swf") === -1) {
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [
						"default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; " +
						"script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; " +
						"object-src 'self' https: http: data:;"
					]
				}
			});
		} else {
			callback({ responseHeaders: details.responseHeaders });
		}
	});
	
    sendWindow("version", app.getVersion());
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
	 
	mainWindow.once('ready-to-show', () => {
		if(isMax) {	
		if(process.platform === "win32"){
			mainWindow.maximize();
			
		}
		else{
			mainWindow.setFullScreen(true)
		}
		
		
	 }
     mainWindow.show()
	})

	// Upper Limit is working of 500 %
	mainWindow.webContents.setVisualZoomLevelLimits(1, 5).then(console.log("Zoom Levels Have been Set between 100% and 500%")).catch((err) => console.log(err));
   
    mainWindow.on('resize', () => {
		var isMax = mainWindow.isMaximized() || mainWindow.isFullScreen()
		
		if(isMax) {
			console.log( isMax);
			let { width, height, max } = store.get('windowBounds');
			store.set('windowBounds', { width, height , isMax});		
		}
		else{
			let { width, height } = mainWindow.getBounds();
			store.set('windowBounds', { width, height , isMax});	
		}
        
    });

	app.on('browser-window-focus', () => {
			globalShortcut.register('CTRL+SHIFT+q', () => {
				console.log(22321 + enav)
				NAV.newTab('https://www.flash.pm/browser/preview', {
					close: false,
					icon: NAV.TAB_ICON,
					
				});
			});

			globalShortcut.register('CommandOrControl+F', () => {
			mainWindow.webContents.send('on-find');
			});
						
			
			ipcMain.on('clearChache-click', clearCacheFunction);
			async function clearCacheFunction(){
				console.log('clearCacheFunction()!')
				await mainWindow.webContents.session.clearCache()
				.then(()=>{
					console.log('Cleared cache done! restarting..')
					app.relaunch();
					app.exit();
				})

				//console.log(22331,mainWindow.webContents.clearCache )
				//let session = mainWindow.webContents.session;
				//	mainWindow.webContents.clearCache();
				//	app.relaunch();
				//	app.exit();
			}
			
		
			globalShortcut.register("CTRL+SHIFT+I", () => {
			 mainWindow.webContents.openDevTools();
			});
			
			globalShortcut.register("CmdOrCtrl+=", () => {
				console.log("CmdOrCtrl+");
				mainWindow.webContents.zoomFactor = mainWindow.webContents.getZoomFactor() + 0.2;
			});
			globalShortcut.register("CmdOrCtrl+-", () => {
				mainWindow.webContents.zoomFactor = mainWindow.webContents.getZoomFactor() - 0.2;
			});
		
			globalShortcut.register("CTRL+SHIFT+F10", () => {
				let session = mainWindow.webContents.session;
				session.clearCache();
				app.relaunch();
				app.exit();
			});
	})

	app.on('browser-window-blur', () => {
	  globalShortcut.unregisterAll()
	})

		
	mainWindow.webContents.zoomFactor = 1;
	
	
});

app.on('open-file', (event, path) =>
{
    event.preventDefault();
    console.log(path);
});


exports.sethome = (a) => homeSetter(a);
	
function homeSetter(a){
     store.set('homepage', a );
	 console.log("Favorite url:" + a);
};

// ==========================================
// --- NEAT FLASH BROWSER: FAVORITES SYSTEM ---
// ==========================================

// 1. Auto-Save from Botfather
exports.autoSaveFavorite = (url, title) => {
    let favs = store.get('favorites') || [];
	if (!Array.isArray(favs)) favs = []; // THE FIX
    
    // Upgrade any old plain-string URLs to objects
    favs = favs.map(f => typeof f === 'string' ? { url: f, title: 'Saved Link' } : f);

    // Check if we already saved this exact URL
    let existingIndex = favs.findIndex(f => f.url === url);
    
    if (existingIndex === -1) {
        favs.push({ url: url, title: title }); // Add new Botfather link
    } else {
        favs[existingIndex].title = title; // Update title if it changed
    }
    store.set('favorites', favs);
};

// 2. Manual Save (When you click the Star button)
exports.setFavorite = (url) => {
    let favs = store.get('favorites') || [];
	if (!Array.isArray(favs)) favs = []; // THE FIX
    favs = favs.map(f => typeof f === 'string' ? { url: f, title: 'Saved Link' } : f);
    
    if(favs.findIndex(f => f.url === url) === -1) {
        favs.push({ url: url, title: 'Manual Bookmark' });
        store.set('favorites', favs);
        settingsShow(true);
    }
};

// 3. Remove Single Favorite
exports.removeFav = (index) => {
    let favs = store.get('favorites') || [];
	if (!Array.isArray(favs)) favs = []; // THE FIX
    let updatedFavs = []; 
    for (var i = 0; i < favs.length; i++){
        if (i !== index) updatedFavs.push(favs[i]);
    }
    store.set('favorites', updatedFavs);
    settingsShow(true);
};

// 4. Remove All Favorites
exports.removeAllFav = () => {
    store.set('favorites', []);
    settingsShow(true);
};

exports.showSettings = (a) => settingsShow(a);
function settingsShow(a) {
    let fav = store.get('favorites');
    mainWindow.webContents.send('ping', fav, a);
}

app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') {
        app.quit();
    //}
});
/*
const {autoUpdater} = require("electron-updater");

 autoUpdater.on('checking-for-update', () => {
    sendWindow('checking-for-update', '');
});

autoUpdater.on('update-available', () => {
    sendWindow('update-available', '');
});

autoUpdater.on('update-not-available', () => {
    sendWindow('update-not-available', '');
});

autoUpdater.on('error', (err) => {
    sendWindow('error', 'Error: ' + err);
});

autoUpdater.on('download-progress', (d) => {
    sendWindow('download-progress', {
        speed: d.bytesPerSecond,
        percent: d.percent,
        transferred: d.transferred,
        total: d.total
    });
});

autoUpdater.on('update-downloaded', () => {
    sendWindow('update-downloaded', 'Update downloaded');
    autoUpdater.quitAndInstall();
}); */
// ==========================================
// --- NEAT FLASH BROWSER: SMART ESCAPE POD ---
// ==========================================
exports.openSecureUrl = (url) => {
    const { spawn } = require('child_process');
    
    const targetUrl = url;
    const isHttps = targetUrl.toLowerCase().startsWith('https://');
    
    // Read the user's custom path directly from the existing Store instance
    const customBrowserPath = store.get('secureBrowserPath');

    // Helper: Throws a Native OS Warning Box
    function showSecurityErrorPage(blockedUrl) {
        const { dialog } = require('electron');
        
        if (mainWindow && !mainWindow.isDestroyed()) {
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Security Blocked',
                message: 'Secure Browser Required',
                detail: `You attempted to open a secure link:\n${blockedUrl}\n\nBecause Neat Flash Browser is sandboxed, no HTTPS links are allowed to load here.\n\nPlease open the Settings menu and use the Dropdown to select your Google Chrome, Edge, or Firefox executable so Neat Flash Browser can safely route this traffic!`,
                buttons: ['Understood']
            });
        }
    }

    if (isHttps) {
        // If they haven't picked an executable yet, trap it immediately!
        if (!customBrowserPath || customBrowserPath.trim() === '') {
            showSecurityErrorPage(targetUrl);
            return; 
        }

        // DIRECT BINARY EXECUTION
        try {
            const isMac = process.platform === 'darwin';

            if (isMac) {
                // macOS requires "open -a" to launch .app bundles properly
                spawn('open', ['-a', customBrowserPath, targetUrl]);
            } else {
                // Windows and Linux execute the binary path directly
                spawn(customBrowserPath, [targetUrl], { detached: true });
            }
            console.log(`[Bouncer] Escaped to custom browser: ${customBrowserPath}`);
        } catch (err) {
            console.error("Custom browser execution crashed:", err);
            // If the spawn fails (e.g. they deleted the browser they selected), trap it!
            showSecurityErrorPage(targetUrl);
        }
    } else {
        // Safe HTTP Link (e.g. localhost Botfather dashboard) opens normally inside Flash Browser
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('open-new-tab', { 
                url: encodeURIComponent(targetUrl), 
                title: encodeURIComponent('External Link') 
            });
        }
    }
};
