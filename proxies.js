// Reads the Proxies table from TheNEATBotfather's own SQLite database, so
// this browser can offer the same proxy pool Botfather assigns to bot
// accounts. Uses sql.js (pure WASM) instead of a native SQLite module --
// this app runs on Electron 9.4.4, and a native module would need rebuilding
// against that exact Electron ABI (electron-rebuild + a working native
// toolchain); sql.js needs neither.
const path = require('path');
const fs = require('fs');
const os = require('os');

function getBotfatherDbPath() {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'TheNEATBotfather', 'Data', 'TheNEATBotfather.db');
}

let sqlJsPromise = null;
function loadSqlJs() {
    if (!sqlJsPromise) {
        const initSqlJs = require('sql.js');
        sqlJsPromise = initSqlJs({
            // Point sql.js at its own wasm file rather than trying (and failing)
            // to fetch it over the network -- there is no network fetch inside
            // an Electron main-process require() context anyway.
            locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
        });
    }
    return sqlJsPromise;
}

/**
 * Returns Botfather's saved proxies as [{ id, address }, ...], address being
 * the plain "host:port" string Botfather itself stores (no scheme, no
 * credentials -- matches what neatbot's own -proxy flag expects).
 * Returns [] if Botfather's database doesn't exist yet (e.g. Botfather has
 * never been run on this machine) rather than throwing.
 */
async function getProxies() {
    const dbPath = getBotfatherDbPath();
    if (!fs.existsSync(dbPath)) return [];

    // Copy rather than read the live file directly -- Botfather is normally
    // running with its own open connection to this database, and reading it
    // in place risks catching an inconsistent snapshot (sql.js has no notion
    // of SQLite's WAL/locking, so it can't coordinate with a concurrent
    // writer the way a real SQLite connection would).
    const tempPath = path.join(os.tmpdir(), `botfather-proxies-${process.pid}-${Date.now()}.db`);
    fs.copyFileSync(dbPath, tempPath);
    try {
        const SQL = await loadSqlJs();
        const fileBuffer = fs.readFileSync(tempPath);
        const db = new SQL.Database(fileBuffer);
        try {
            const results = db.exec('SELECT Id, ProxyAddress FROM Proxies ORDER BY Id');
            if (results.length === 0) return [];
            return results[0].values.map(([id, address]) => ({ id, address }));
        } finally {
            db.close();
        }
    } finally {
        fs.unlinkSync(tempPath);
    }
}

module.exports = { getProxies, getBotfatherDbPath };
