// node scripts/i18n-pages.mjs — writes /<lang>/index.html for every language with its own head and pre-filled
// UI text (so crawlers read it without running JS), rewrites the root head block as the English x-default,
// and writes sitemap.xml. Runs in the deploy workflow; the language folders are not committed.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const ORIGIN = 'https://d3ouqxquns99r3.cloudfront.net';
const LANGS = ['ko', 'en', 'ja', 'zh', 'es'];
const HREFLANG = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-Hans', es: 'es' };
const OG_LOCALE = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', es: 'es_ES' };
const START = '<!-- i18n-head:start -->', END = '<!-- i18n-head:end -->';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dicts = Object.fromEntries(LANGS.map(l => [l, JSON.parse(fs.readFileSync(`i18n/${l}.json`, 'utf8'))]));

function head(lang, url) {
  const d = dicts[lang];
  const ld = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Bulmeong', alternateName: '불멍',
    url, image: `${ORIGIN}/og.jpg`, description: d['meta.desc'], inLanguage: HREFLANG[lang],
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
    `<meta property="og:image" content="${ORIGIN}/og.jpg">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(d['title.tagline'])}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(d['meta.title'])}">`,
    `<meta name="twitter:description" content="${esc(d['meta.desc'])}">`,
    `<meta name="twitter:image" content="${ORIGIN}/og.jpg">`,
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

const src = fs.readFileSync('index.html', 'utf8');
const root = withHead(src, head('en', `${ORIGIN}/`));
if (root !== src) fs.writeFileSync('index.html', root);

for (const lang of LANGS) {
  let html = prerender(withHead(root, head(lang, `${ORIGIN}/${lang}/`)), dicts[lang]);
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${HREFLANG[lang]}">`)
    .replace('<head>', '<head>\n  <base href="/">'); // assets, modules and i18n fetches resolve from the site root
  assert(!/data-i18n="[^"]+"[^>]*><\/(span|button|h1|h2|p|div|label)>/.test(html), `${lang}: empty translated element`);
  assert.equal((html.match(/hreflang=/g) || []).length, LANGS.length + 1, `${lang}: hreflang count`);
  fs.mkdirSync(lang, { recursive: true });
  fs.writeFileSync(`${lang}/index.html`, html);
}

const today = new Date().toISOString().slice(0, 10);
const alts = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${ORIGIN}/${l}/"/>`)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`).join('\n');
const urls = ['', ...LANGS.map(l => `${l}/`)]
  .map(p => `  <url>\n    <loc>${ORIGIN}/${p}</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n  </url>`).join('\n');
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
console.log(`wrote ${LANGS.map(l => `${l}/index.html`).join(', ')}, sitemap.xml${root !== src ? ', index.html head' : ''}`);
