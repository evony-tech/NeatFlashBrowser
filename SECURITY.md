# Security Policy

## ⚠️ Important Security Notice

**Flash Browser is built on Electron 9.4.4, which reached end-of-life in March 2021.**

This application should **ONLY** be used in isolated, sandboxed environments such as virtual machines. Do not use this application for accessing sensitive data, important accounts, or production systems.

## Known Security Limitations

### 1. End-of-Life Software

- **Electron 9.4.4** (EOL: March 2021) - No security patches available
- **Adobe Flash Player** (EOL: January 12, 2021) - No longer supported by Adobe
- **Node.js 12.14** - Bundled with Electron 9, also reached EOL

### 2. Required Security-Reducing Flags

To support PPAPI Flash Player plugins, the following security flags are **required** and cannot be disabled:

| Flag | Risk | Reason Required |
|------|------|-----------------|
| `no-sandbox` | Disables process isolation | Required for PPAPI plugin loading on Linux and Windows |
| `disable-site-isolation-trials` | Reduces cross-site isolation | Required for Flash plugin content access |
| `ignore-certificate-errors` | Accepts invalid SSL certificates | Many Flash game sites use expired/self-signed certificates |
| `allow-insecure-localhost` | Permits insecure local connections | Required for local Flash development |
| `nodeIntegration: true` | Enables Node.js in renderer | Required for electron-navigation and Flash plugin management |
| `contextIsolation: false` | Disables context isolation | Required for remote module and Flash plugin communication |
| `enableRemoteModule: true` | Allows renderer access to main process | Required for navigation system and Flash features |

### 3. Dependency Vulnerabilities

As of the last update, the following known vulnerabilities exist:

#### electron-navigation (v6.6.6)
- **Status:** Abandoned package (last update: 4+ years ago)
- **Vulnerabilities:** 44 known issues
- **Impact:** Core navigation system, cannot be removed without complete rewrite
- **Mitigation:** Used in controlled environment only

#### @cliqz/adblocker-electron (v1.23.0)
- **Peer Dependency Mismatch:** Requires Electron >11, running on 9.4.4
- **Status:** Working but unsupported configuration
- **Mitigation:** Can be disabled if compatibility issues arise (see lines 316-321 in index.js)

#### Additional Dependencies
- Total vulnerabilities: 29 (1 low, 9 moderate, 15 high, 4 critical)
- These are primarily transitive dependencies with no fixes available for Electron 9

## Security Improvements Implemented

Despite the constraints of Electron 9 EOL status, the following security hardening measures have been implemented:

### Code-Level Protections

1. **URL Validation**
   - Command-line argument validation for SWF file paths
   - URL sanitization before setting favorites/homepage
   - Path traversal detection and warnings

2. **Content Security Policy**
   - CSP headers added for non-Flash content
   - Object source restrictions where possible
   - Script source validation

3. **Error Handling**
   - Try-catch blocks around all remote module calls
   - IPC communication error handling
   - Plugin loading failure detection

4. **Input Sanitization**
   - URL input validation in navigation bar
   - Protocol checking (http/https/file only)
   - Empty input rejection

### Configuration Hardening

- Node.js engine version constraints (12.14.0 to <16.0.0)
- Documented security trade-offs in code comments
- Error logging for security-related failures

## Risk Assessment

### High Risk Scenarios

❌ **DO NOT USE FOR:**
- Banking or financial services
- Sensitive personal data
- Production environments
- Public-facing systems
- Systems with access to important data

### Acceptable Use Cases

✅ **Appropriate for:**
- Running legacy Flash games in isolated VMs
- Flash content preservation and archival
- Educational purposes in sandboxed environments
- Testing and development of Flash content

## Recommended Security Practices

### 1. Virtual Machine Isolation

**Required setup:**
```
- Run FlashBrowser inside a dedicated VM
- Use snapshots before each session
- No shared folders with host system
- No access to sensitive files/networks
- Isolated network segment if possible
```

### 2. Network Isolation

- Use firewall rules to restrict outbound connections
- Consider VPN or proxy for Flash game sites
- Monitor network traffic for suspicious activity
- Block access to internal networks/resources

### 3. Data Protection

- Never enter passwords or sensitive information
- Do not access email, cloud storage, or authenticated services
- Clear cache regularly (Ctrl+Shift+F10)
- Do not download files to important directories

### 4. System Monitoring

- Monitor system resource usage for abnormal behavior
- Check running processes regularly
- Review logs for suspicious activity
- Keep VM snapshots for easy rollback

## Vulnerability Disclosure

If you discover a security vulnerability in FlashBrowser, please report it by:

1. **Opening an issue** on the GitHub repository
2. **Tagging as** `security` and `vulnerability`
3. **Providing details:**
   - Steps to reproduce
   - Potential impact
   - Affected versions
   - Suggested mitigations (if any)

**Please do not** publicly disclose exploit code or detailed attack techniques without giving maintainers time to respond (reasonable disclosure period: 90 days).

## CVE References

### Electron 9.x Known CVEs

The following Common Vulnerabilities and Exposures (CVEs) affect Electron 9.x and have no available patches:

- Various remote code execution vulnerabilities
- Cross-site scripting (XSS) vulnerabilities in webviews
- Privilege escalation issues
- Information disclosure vulnerabilities

For a complete list of Electron 9 CVEs, see:
- [CVE Details - Electron](https://www.cvedetails.com/vulnerability-list/vendor_id-17824/product_id-44696/version_id-498625/Electronjs-Electron-9.0.html)
- [Electron Security Advisories](https://github.com/electron/electron/security/advisories)

### Flash Player Known CVEs

Adobe Flash Player has thousands of known CVEs dating back decades. Notable recent CVEs before EOL include:
- CVE-2020-9746 (RCE)
- CVE-2020-9633 (RCE)
- CVE-2020-9632 (Information Disclosure)

## Security Architecture Decisions

### Why Stay on Electron 9?

**Q:** Why not upgrade to the latest Electron?

**A:** PPAPI plugin support (required for Flash Player) was completely removed in Electron 10. No version after 9.x supports PPAPI plugins. Upgrading to Electron 10+ would break Flash functionality entirely.

### Why Not Use Ruffle?

**Q:** Why not migrate to Ruffle (WebAssembly Flash emulator)?

**A:** Ruffle is an excellent alternative for many use cases, but it:
- Has incomplete Flash API coverage
- May not support all legacy Flash content
- Requires significant code refactoring
- Is a different approach than native PPAPI plugins

Users who don't need native Flash plugin support should consider using Ruffle instead.

### Future Migration Path

When Flash support is no longer required, the recommended migration path is:

1. **Upgrade to Electron LTS** (latest supported version)
2. **Enable modern security features:**
   - `contextIsolation: true`
   - `nodeIntegration: false`
   - Remove `enableRemoteModule`
   - Enable sandbox mode
   - Enable site isolation
3. **Replace electron-navigation** with modern alternatives
4. **Remove Flash-specific code** and dependencies
5. **Implement Content Security Policy** fully
6. **Add security-focused preload scripts**

## Additional Resources

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Flash Player EOL Information](https://www.adobe.com/products/flashplayer/end-of-life.html)

## Contact

For security-related questions or concerns, please open an issue on the GitHub repository with the `security` label.

---

**Last Updated:** January 2026
**Electron Version:** 9.4.4 (EOL)
**Flash Player Version:** 32.0.0.465 (EOL)
