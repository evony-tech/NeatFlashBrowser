# Security Policy

## ⚠️ Important Security Notice

**Neat Flash Browser is built on Electron 9.4.4, which reached end-of-life in March 2021.**

This application is a highly specialized companion tool built exclusively for **The NEAT Botfather**. It should **ONLY** be used to access the flash game web client and your local Botfather dashboard. Do not use this application for accessing sensitive data, banking, important accounts, or general web browsing.

## Custom Security Engineering (v1.3.7)

Because we are forced to use an older version of Electron to maintain PPAPI Flash Player compatibility, we have engineered custom application-level protections to keep our users safe:

### 1. The Smart Escape Pod (HTTPS Bouncer)
Neat Flash Browser features a custom-built URL router that aggressively monitors navigation. 
* **Local & HTTP Traffic:** Permitted to render inside the Flash environment (used for game flash client and `localhost` Botfather UI).
* **HTTPS Traffic:** Strictly forbidden. If a user clicks an `https://` link (such as PayPal, YouTube, or financial system), the browser's "Monkey Patch" intercepts the request before a tab is ever created. It uses `child_process.spawn` to physically eject the URL directly to your native Windows OS browser (Chrome, Firefox, Brave, or Edge), keeping your secure browsing completely isolated from the Flash container.

### 2. Chromium Sandbox Restored
Unlike previous forks of this software, **Neat Flash Browser successfully runs with the Chromium Sandbox enabled.** We eradicated the legacy `--no-sandbox` requirement, mitigating a massive attack vector while simultaneously fixing the "terminal flicker" bug on Windows.

### 3. Open Source Verification
To ensure absolute community trust, this application cannot "phone home" in secret. Users are encouraged to verify the code themselves:
* The `app.asar` file can be unpacked by anyone using Node.js (`npx asar extract app.asar src`) to audit the exact JavaScript running on their machine.
* The Chromium Developer Tools (`Ctrl + Shift + I`) are left enabled by design so users can actively monitor the Network tab and verify traffic is only flowing to `*.ev0ny.com` and `localhost`.

---

## Known Security Limitations

### 1. End-of-Life Software
- **Electron 9.4.4** (EOL: March 2021) - No security patches available from the upstream Chromium project.
- **Adobe Flash Player** (EOL: January 12, 2021) - No longer supported or patched by Adobe.

### 2. Required Security-Reducing Flags
To support legacy Flash Player plugins and our internal navigation system, the following security flags are required by the engine and cannot be disabled:

| Flag | Risk | Reason Required |
|------|------|-----------------|
| `disable-site-isolation-trials` | Reduces cross-site isolation | Required for Flash plugin content access |
| `ignore-certificate-errors` | Accepts invalid SSL certificates | Many legacy Flash game endpoints use expired/self-signed certificates |
| `nodeIntegration: true` | Enables Node.js in renderer | Required by `electron-navigation` |
| `contextIsolation: false` | Disables context isolation | Required for remote module and Flash plugin communication |
| `enableRemoteModule: true` | Allows renderer access to main process | Required for IPC UI routing and the HTTPS Bouncer |

### 3. Dependency Profile
In version 1.3.7, we aggressively stripped out unused, heavy dependencies (like legacy adblockers and fetch protocols) to reduce the attack surface and memory footprint. 

The primary remaining vulnerability vector is **electron-navigation** (v6.6.6). 
* **Status:** Abandoned package.
* **Mitigation:** We have heavily "Monkey Patched" the core functions of this dependency to forcibly route malicious or secure popups out to the native OS shell. 

---

## Risk Assessment

### ❌ DO NOT USE FOR:
- Banking, financial services, or shopping
- Accessing email, cloud storage, or authenticated services
- General web browsing
- Navigating to untrusted websites

### ✅ ACCEPTABLE USE CASES:
- Logging into the flash game web client alongside The NEAT Botfather
- Accessing `http://localhost:8025` dashboards
- Flash content preservation in isolated/sandboxed environments (VMs)

## Recommended Security Practices

1. **Virtual Machine Isolation:** For the highest level of security, run Botfather and Neat Flash Browser inside a dedicated Virtual Machine (VM) without shared host folders.
2. **Network Monitoring:** Feel free to use tools like GlassWire or Wireshark. You will see traffic only routes to game servers and your local Botfather instance.
3. **Data Protection:** Never enter passwords for anything other than your game accounts within this browser. 

## Vulnerability Disclosure

If you discover a vulnerability that bypasses the HTTPS Bouncer or threatens the local Botfather ecosystem, please report it via the **Issues** tab on our GitHub repository. Please tag the issue as `security` and provide reproduction steps.

---

**Last Updated:** May 2026  
**Electron Version:** 9.4.4 (EOL)  
**Flash Player Version:** 32.0.0.465 (EOL)
