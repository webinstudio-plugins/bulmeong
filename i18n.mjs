// UI language: the page's own path (/ja/) > ?lang= > the visitor's own pick > browser languages > English.
export const LANGS = ['ko', 'en', 'ja', 'zh', 'es'];
const pick = v => {
  const base = String(v || '').toLowerCase().split('-')[0];
  return LANGS.includes(base) ? base : null;
};
let savedPick = null;
try { savedPick = localStorage.getItem('bulmeong:lang'); } catch {}

export const lang = pick(location.pathname.split('/')[1])
  || pick(new URLSearchParams(location.search).get('lang'))
  || pick(savedPick)
  || (navigator.languages || [navigator.language]).map(pick).find(Boolean)
  || 'en';

const dict = await fetch(`./i18n/${lang}.json`).then(r => r.json()).catch(() => ({}));

export function t(key, vars) {
  const s = dict[key];
  if (typeof s !== 'string') {
    console.warn('[i18n] missing', lang, key);
    return key;
  }
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}

// Lists (oracles, chips, aliases) are arrays in the JSON.
export const tl = key => (Array.isArray(dict[key]) ? dict[key] : []);

export const LOCALE = lang === 'zh' ? 'zh-CN' : lang;

export function setLang(next) {
  if (!LANGS.includes(next)) return;
  try { localStorage.setItem('bulmeong:lang', next); } catch {}
  location.assign(`/${next}/`);
}

export function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr, t(key));
    }
  });
}

document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
// The page's Korean fonts lack most kana and hanzi, so ja/zh load their own (Google Fonts splits CJK into small slices).
const CJK_FONTS = { ja: 'Zen+Old+Mincho:wght@400;700&family=Klee+One:wght@600', zh: 'Noto+Serif+SC:wght@400;700' };
if (CJK_FONTS[lang]) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${CJK_FONTS[lang]}&display=swap`;
  document.head.appendChild(link);
}
if (dict['meta.title']) document.title = dict['meta.title'];
