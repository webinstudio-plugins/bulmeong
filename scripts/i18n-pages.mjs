// node scripts/i18n-pages.mjs — writes /<lang>/index.html for every language with its own head and pre-filled
// UI text (so crawlers read it without running JS), rewrites the root head block as the English x-default,
// and writes sitemap.xml. Pages are served from bulmeong.web.app (Firebase, folder firebase-public/) and from
// CloudFront; every served page takes its scripts, art, sound and translations from CloudFront through <base>.
// Runs in the deploy workflow; the language folders and firebase-public/ are not committed.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const ORIGIN = 'https://bulmeong.web.app'; // canonical address
const FILES = 'https://d3ouqxquns99r3.cloudfront.net'; // scripts, art, sound, translations
const LANGS = ['ko', 'en', 'ja', 'zh', 'es'];
const HREFLANG = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-Hans', es: 'es' };
const OG_LOCALE = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', es: 'es_ES' };
const START = '<!-- i18n-head:start -->', END = '<!-- i18n-head:end -->';
const BASE = `<head>\n  <base href="${FILES}/">`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dicts = Object.fromEntries(LANGS.map(l => [l, JSON.parse(fs.readFileSync(`i18n/${l}.json`, 'utf8'))]));

function head(lang, url) {
  const d = dicts[lang];
  const ld = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Bulmeong', alternateName: '불멍',
    url, image: `${FILES}/og.jpg`, description: d['meta.desc'], inLanguage: HREFLANG[lang],
    applicationCategory: 'EntertainmentApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'Webin Studio' }
  };
  return [
    START,
    `<title>${esc(d['meta.title'])}</title>`,
    `<meta name="description" content="${esc(d['meta.desc'])}">`,
    '<meta name="author" content="Webin Studio">',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<meta name="application-name" content="Bulmeong">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
    '<meta name="apple-mobile-web-app-title" content="Bulmeong">',
    `<link rel="canonical" href="${url}">`,
    ...LANGS.map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${ORIGIN}/${l}/">`),
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Bulmeong">',
    `<meta property="og:title" content="${esc(d['meta.title'])}">`,
    `<meta property="og:description" content="${esc(d['meta.desc'])}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${FILES}/og.jpg">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(d['title.tagline'])}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(d['meta.title'])}">`,
    `<meta name="twitter:description" content="${esc(d['meta.desc'])}">`,
    `<meta name="twitter:image" content="${FILES}/og.jpg">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
    END
  ].join('\n  ');
}

const withHead = (html, block) => {
  const i = html.indexOf(START), j = html.indexOf(END);
  assert(i > 0 && j > i, 'head markers missing in index.html');
  return html.slice(0, i) + block + html.slice(j + END.length);
};

// Same work as applyDom() in i18n.mjs, done at build time.
function prerender(html, d) {
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)[^<]*(<\/\2>)/g,
    (m, open, tag, key, close) => (typeof d[key] === 'string' ? open + esc(d[key]) + close : m));
  return html.replace(/\sdata-i18n-attr="([^"]+)"/g, (m, pairs) =>
    pairs.split(';').map(p => p.split(':')).map(([a, k]) => ` ${a}="${esc(d[k] ?? '')}"`).join('') + m);
}

const write = (file, text) => {
  fs.mkdirSync(file.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  fs.writeFileSync(file, text);
};

const src = fs.readFileSync('index.html', 'utf8');
const root = withHead(src, head('en', `${ORIGIN}/`));
if (root !== src) fs.writeFileSync('index.html', root);
// the repo root page keeps relative URLs (local preview, CloudFront); the Firebase copy gets the CloudFront base
write('firebase-public/index.html', root.replace('<head>', BASE));

for (const lang of LANGS) {
  const html = prerender(withHead(root, head(lang, `${ORIGIN}/${lang}/`)), dicts[lang])
    .replace(/<html lang="[^"]*">/, `<html lang="${HREFLANG[lang]}">`)
    .replace('<head>', BASE);
  assert(!/data-i18n="[^"]+"[^>]*><\/(span|button|h1|h2|p|div|label)>/.test(html), `${lang}: empty translated element`);
  assert.equal((html.match(/hreflang=/g) || []).length, LANGS.length + 1, `${lang}: hreflang count`);
  write(`${lang}/index.html`, html);
  write(`firebase-public/${lang}/index.html`, html);
}

const today = new Date().toISOString().slice(0, 10);
const alts = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${ORIGIN}/${l}/"/>`)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`).join('\n');
const urls = ['', ...LANGS.map(l => `${l}/`)]
  .map(p => `  <url>\n    <loc>${ORIGIN}/${p}</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n  </url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
write('sitemap.xml', sitemap);
write('firebase-public/sitemap.xml', sitemap);
fs.copyFileSync('robots.txt', 'firebase-public/robots.txt');
console.log(`wrote ${LANGS.map(l => `${l}/index.html`).join(', ')}, sitemap.xml, firebase-public/${root !== src ? ', index.html head' : ''}`);
