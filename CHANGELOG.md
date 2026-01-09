# Changelog

All notable changes to FlashBrowser will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-01-09

### Summary

This update focuses on dependency updates and security hardening while maintaining PPAPI Flash Player plugin support on Electron 9.4.4 (the latest and final version supporting PPAPI plugins).

**Note:** Electron 9.4.4 reached end-of-life in March 2021. This application should only be used in isolated/sandboxed environments.

### Changed

#### Dependencies Updated

**Build Tools:**
- `electron-builder`: 22.9.1 → 22.14.13 (latest Electron 9 compatible)
- `electron-packager`: 15.4.0 → 15.5.2 (latest Electron 9 compatible)

**Runtime Dependencies:**
- `electron-context-menu`: 3.1.1 → 3.6.1 (stay in v3; v4+ requires Electron 12+)
- `electron-dl`: 3.3.1 → 3.5.2 (stay in v3; v4+ requires Electron 12+)
- `cross-fetch`: 3.1.4 → 3.2.0 (avoid v4.x breaking changes)
- `resolve-dependencies`: 6.0.7 → 6.0.9 (patch update)

**Unchanged (Flash Compatibility):**
- `electron`: 9.4.4 (PPAPI support removed in v10+)
- `electron-navigation`: 6.6.6 (abandoned but core to navigation)
- `@cliqz/adblocker-electron`: 1.23.0 (peer dependency constraints)
- `electron-find`: 1.0.7 (stable and working)

#### Package Configuration

- Added `engines` field specifying Node.js version constraints: `>=12.14.0 <16.0.0`
- Updated installation to use `--legacy-peer-deps` flag for @cliqz/adblocker-electron peer dependency mismatch

### Added

#### Security Improvements

**index.js:**
- Added try-catch block around Flash plugin path resolution
- Added comprehensive security documentation comments for all security-reducing flags
- Implemented URL validation for command-line arguments
  - HTTP/HTTPS URL format validation
  - Path traversal detection and warnings for local file paths
  - Error handling with safe fallback values
- Added Content Security Policy headers for non-Flash content via `onHeadersReceived` handler
- Enhanced error logging for Flash plugin loading failures

**browser.html:**
- Wrapped all `remote.require()` calls in try-catch blocks:
  - setFavorite() function
  - setHome() function
  - clearAllFavorites() function
  - showSettings() function
  - removeFav button onclick handler
  - handleDoubleClick() function for macOS
- Added URL input sanitization before setting favorites/homepage
  - Empty input validation
  - Protocol validation (http/https/file only)
  - Input trimming and formatting
- Added error handling for FindInPage initialization
- Added error handling for IPC communication (on-find event)
- Added security-focused console logging for debugging

#### Documentation

**SECURITY.md** (new file):
- Comprehensive security policy and vulnerability disclosure guidelines
- Detailed list of known security limitations and CVE references
- Risk assessment and recommended security practices
- VM isolation and network segmentation recommendations
- Explanation of required security-reducing flags
- Dependency vulnerability documentation (electron-navigation: 44 issues, etc.)
- Future migration path guidance

**CHANGELOG.md** (this file):
- Tracking all changes and updates
- Semantic versioning adoption
- Detailed dependency version changes

### Security

#### Known Vulnerabilities

**Total: 29 vulnerabilities** (1 low, 9 moderate, 15 high, 4 critical)

These vulnerabilities are primarily due to:
- Electron 9.4.4 EOL status (no patches available)
- electron-navigation package (abandoned, 44 known issues)
- Transitive dependencies with no Electron 9 compatible fixes

#### Required Security Trade-offs

The following security-reducing flags are **required** for PPAPI Flash Player support and cannot be removed:

- `no-sandbox` - Required for plugin loading
- `disable-site-isolation-trials` - Required for plugin content access
- `ignore-certificate-errors` - Many Flash sites use expired certificates
- `allow-insecure-localhost` - Required for local Flash development
- `nodeIntegration: true` - Required for electron-navigation
- `contextIsolation: false` - Required for remote module access
- `enableRemoteModule: true` - Required for navigation features

See SECURITY.md for detailed explanations and mitigations.

### Technical Notes

#### Installation

Due to peer dependency conflicts with @cliqz/adblocker-electron (requires Electron >11), installation now requires:

```bash
npm install --legacy-peer-deps
```

This is safe as version 1.23.0 works correctly with Electron 9.4.4 despite the peer dependency mismatch.

#### Deprecation Warnings

`electron-packager` is now deprecated in favor of `@electron/packager`. The package continues to work but shows a deprecation warning. No migration is planned to maintain Electron 9 compatibility.

#### Engine Compatibility

Node.js version 22.18.0 is being used for development, which exceeds the specified engine range (12.14.0 to <16.0.0). This is acceptable for development but production builds should use Node.js 12-15.

### Testing

The following test areas should be validated after this update:

- [ ] Flash plugin loads successfully on Windows (x64/x86)
- [ ] Flash plugin loads successfully on macOS
- [ ] Flash plugin loads successfully on Linux
- [ ] Local SWF file loading via command-line
- [ ] Remote SWF URL loading via command-line
- [ ] Browser navigation and tab management
- [ ] Settings and favorites functionality
- [ ] Zoom controls
- [ ] Find in page (Ctrl+F)
- [ ] Cache clearing and restart
- [ ] Download SWF functionality
- [ ] Context menu operations
- [ ] Keyboard shortcuts
- [ ] Build process (npm run build, build1, build2)

### Migration Notes

#### From Previous Versions

1. Delete `node_modules` directory
2. Delete `package-lock.json`
3. Run `npm install --legacy-peer-deps`
4. Test Flash plugin loading with a known-good SWF file

#### Future Considerations

When Flash support is no longer required, consider:
- Migrating to Electron LTS (latest supported version)
- Enabling modern security features (contextIsolation, sandbox mode)
- Replacing electron-navigation with modern alternatives
- Implementing Ruffle (WebAssembly Flash emulator) for legacy content
- Removing PPAPI-specific security trade-offs

### Acknowledgments

This update maintains compatibility with PPAPI Flash Player while applying maximum possible security improvements within the constraints of Electron 9 EOL status.

**Contributors:**
- Security audit and recommendations: Claude Sonnet 4.5
- Implementation and testing: [Your Name/Team]

---

## Version History

### [1.0.0] - Original Release

Initial release of Flash Browser with Electron 9.4.4 and PPAPI Flash Player support.

**Features:**
- Multi-platform Flash Player support (Windows, macOS, Linux)
- Tab-based browser interface
- Favorites and homepage management
- Zoom controls and find-in-page
- Cache management
- Download SWF files
- Context menus
- Keyboard shortcuts

---

**Note on Versioning:** This changelog documents changes made during the January 2026 update. If you choose to release this as a new version, increment the version number in package.json accordingly (e.g., 1.1.0 or 1.0.1).
