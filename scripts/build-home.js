/*
 * Generates home.html: the browser's default tab when it's opened without a
 * Botfather URL handoff. It's built from this repo's own README.md plus the
 * latest GitHub Releases, then committed as a static file -- the browser
 * can't just navigate to github.com/evony-tech/NeatFlashBrowser itself,
 * since the HTTPS Bouncer (see index.js/browser.html) intercepts and ejects
 * any https:// navigation out to the user's real OS browser. Run this
 * whenever the README or a release changes:
 *
 *   npm run build-home
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { marked } = require('marked');

const REPO = 'evony-tech/NeatFlashBrowser';
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'home.html');
const RELEASE_COUNT = 5;

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'NeatFlashBrowser-home-builder',
                'Accept': 'application/vnd.github+json'
            }
        }, res => {
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`GitHub API returned ${res.statusCode} for ${url}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (err) { reject(err); }
            });
        }).on('error', reject);
    });
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Linkifies bare URLs in already-escaped text. Trailing sentence punctuation
// ("...our website https://x.com.") is split back out of the href, and a
// wildcard domain like "http://*.somegamewithcastles.com" (used in the
// README to describe a domain pattern, not a real address) is left as plain
// text since it isn't actually clickable.
function linkify(escaped) {
    return escaped.replace(/(https?:\/\/[^\s<]+)/g, match => {
        const trailing = match.match(/[.,;:!?)]+$/);
        const url = trailing ? match.slice(0, -trailing[0].length) : match;
        const punct = trailing ? trailing[0] : '';
        return (url.includes('*') ? url : `<a href="${url}">${url}</a>`) + punct;
    });
}

const EMOJI_RE = /^[^\x00-\x7F]/; // first char outside ASCII -- good enough to spot an emoji/symbol lead-in on this README

/*
 * README.md here isn't actually GitHub-flavored markdown -- no '#' headers,
 * '**bold**', or fenced code blocks, just plain paragraphs with emoji
 * lead-ins (see README.md itself: "🚀 Core Features", "🤖 Seamless
 * Botfather Integration: ..."). Running it through a real markdown parser
 * would just produce one undifferentiated block of <p> tags, so this parses
 * the specific shape the README actually uses instead.
 */
// Short, title-like lines ("Prerequisites", "🚀 Core Features") are
// headings; short *sentence fragments* that happen to be brief ("Windows 10
// or Windows 11 (64-bit)") are not -- digits/parens are a reasonable proxy
// for "this is a spec/detail, not a section title".
const isHeadingLine = line => line.length <= 45 && !/[.!]$/.test(line) && !/[0-9()]/.test(line);

// A "block" (blank-line-separated chunk) here isn't reliably one semantic
// unit -- the README glues a heading straight onto its first line of body
// text with no blank line between them ("🚀 Core Features\n🤖 Seamless
// Botfather Integration: ...", "Prerequisites\nNode.js (...)"), and a
// "Bash\n<command>" snippet is sometimes glued onto the sentence that
// follows it too. So this peels off one recognizable unit from the front of
// `lines` at a time and recurses on whatever's left, rather than assuming
// the whole block is a single paragraph.
function renderBlock(lines) {
    const text = lines.join(' ');

    if (/https?:\/\//.test(text)) {
        return `<p>${linkify(escapeHtml(text))}</p>\n`;
    }

    if (/^bash$/i.test(lines[0]) && lines.length > 1) {
        const code = `<pre><code>${escapeHtml(lines[1])}</code></pre>\n`;
        return lines.length > 2 ? code + renderBlock(lines.slice(2)) : code;
    }

    if (lines.length > 1 && isHeadingLine(lines[0])) {
        const heading = EMOJI_RE.test(lines[0]) ? `<h2>${escapeHtml(lines[0])}</h2>\n` : `<h3>${escapeHtml(lines[0])}</h3>\n`;
        return heading + renderBlock(lines.slice(1));
    }

    if (lines.length === 1) {
        const colonIdx = text.indexOf(':');
        if (EMOJI_RE.test(text) && colonIdx > 0 && colonIdx < 60) {
            const lead = text.slice(0, colonIdx);
            const desc = text.slice(colonIdx + 1).trim();
            return `<div class="feature"><strong>${escapeHtml(lead)}:</strong> ${escapeHtml(desc)}</div>\n`;
        }
        if (isHeadingLine(text)) {
            return EMOJI_RE.test(text) ? `<h2>${escapeHtml(text)}</h2>\n` : `<h3>${escapeHtml(text)}</h3>\n`;
        }
    }

    const cls = /^DO NOT\b/.test(text) ? ' class="warning"' : '';
    return `<p${cls}>${escapeHtml(text)}</p>\n`;
}

function renderReadme(markdown) {
    const blocks = markdown.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);

    // First block is "Title\nTagline" with no blank line between them.
    const [firstLine, ...rest] = blocks.shift().split('\n');
    let html = `<h1>${escapeHtml(firstLine)}</h1>\n`;
    if (rest.length) html += `<p class="tagline">${escapeHtml(rest.join(' '))}</p>\n`;

    for (const block of blocks) {
        html += renderBlock(block.split('\n'));
    }

    return html;
}

function renderReleases(releases) {
    if (!releases.length) return '<p>No releases found.</p>';
    return releases.map(r => {
        const date = new Date(r.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        return `<div class="release">
    <h3>${escapeHtml(r.name || r.tag_name)} <span class="tag">${escapeHtml(r.tag_name)}</span></h3>
    <div class="release-date">${date}</div>
    <div class="release-body">${marked.parse(r.body || '_No release notes provided._')}</div>
    <a class="release-link" href="${r.html_url}">View on GitHub</a>
</div>`;
    }).join('\n');
}

async function main() {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

    let releasesHtml;
    try {
        const releases = await fetchJson(`https://api.github.com/repos/${REPO}/releases?per_page=${RELEASE_COUNT}`);
        releasesHtml = renderReleases(releases);
    } catch (err) {
        console.warn(`Could not fetch releases from GitHub (${err.message}) -- home.html will omit the Releases section.`);
        releasesHtml = '<p>Release notes unavailable (offline when this page was generated) -- check the <a href="https://github.com/' + REPO + '/releases">GitHub Releases page</a> from your regular browser.</p>';
    }

    const generatedAt = new Date().toLocaleString();
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Neat Flash Browser</title>
<style>
    body { margin: 0; padding: 40px 60px 80px; background: #161b22; color: #c9d1d9; font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.55; }
    .wrap { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 32px; margin-bottom: 4px; }
    h2 { margin-top: 40px; border-bottom: 1px solid #30363d; padding-bottom: 8px; }
    h3 { color: #e6edf3; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .tagline { color: #8b949e; font-size: 16px; margin-top: 0; }
    .feature { background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 12px 16px; margin: 10px 0; }
    .warning { color: #f85149; font-weight: bold; }
    pre { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px 16px; overflow-x: auto; }
    code { font-family: Consolas, monospace; }
    .release { background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 16px 20px; margin: 16px 0; }
    .release h3 { margin-bottom: 2px; }
    .release .tag { color: #8b949e; font-weight: normal; font-size: 13px; }
    .release-date { color: #8b949e; font-size: 13px; margin-bottom: 10px; }
    .release-body :first-child { margin-top: 0; }
    .release-link { display: inline-block; margin-top: 6px; font-size: 13px; }
    footer { margin-top: 60px; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 16px; }
</style>
</head>
<body>
<div class="wrap">
${renderReadme(readme)}
<h2>Latest Releases</h2>
${releasesHtml}
<footer>
    NeatFlashBrowser v${pkg.version} &middot; generated ${escapeHtml(generatedAt)} by <code>npm run build-home</code> from README.md and the GitHub Releases API. This page is static -- rerun the script to refresh it.
</footer>
</div>
</body>
</html>
`;

    fs.writeFileSync(OUT_FILE, html);
    console.log(`Wrote ${OUT_FILE}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
