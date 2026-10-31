// node i18n/check.mjs <lang>  — compares a language file with ko.json and checks every sample trigger fires its own flame.
import fs from 'node:fs';

const lang = process.argv[2];
const dir = new URL('./', import.meta.url);
const ko = JSON.parse(fs.readFileSync(new URL('ko.json', dir), 'utf8'));
const tr = JSON.parse(fs.readFileSync(new URL(`${lang}.json`, dir), 'utf8'));
const problems = [];
const ph = v => JSON.stringify(v).match(/\{\w+\}/g)?.sort().join() || '';

for (const k of Object.keys(ko)) {
  if (!(k in tr)) { problems.push(`missing ${k}`); continue; }
  if (Array.isArray(ko[k]) !== Array.isArray(tr[k])) problems.push(`type ${k}`);
  else if (Array.isArray(ko[k]) && !k.endsWith('.alias') && ko[k].length !== tr[k].length) problems.push(`length ${k}`);
  if (ph(ko[k]) !== ph(tr[k])) problems.push(`placeholders ${k}: ${ph(ko[k])} vs ${ph(tr[k])}`);
}
for (const k of Object.keys(tr)) if (!(k in ko)) problems.push(`extra ${k}`);

// Same matching as app.mjs detectSecretSpell: mythic, epic, rare, common; regex or alias.
const src = fs.readFileSync(new URL('../app.mjs', dir), 'utf8');
const start = src.indexOf('const EASTER_EGG_DEX = [');
const body = src.slice(src.indexOf('[', start), src.indexOf('\n];\n', start) + 2);
const state = { space: 'camp' };
const getFireStage = () => ({ lv: 0 });
const dex = eval(body);
for (const e of dex) e.aliases = (tr[`egg.${e.id}.alias`] || []).map(a => a.toLowerCase());
const order = ['mythic', 'epic', 'rare', 'common'].flatMap(tier => dex.filter(e => e.tier === tier));
for (const e of dex) {
  const raw = (tr[`egg.${e.id}.sampleTrigger`] || '').trim();
  const lower = raw.toLowerCase();
  const hit = order.find(x => x.match(lower, raw) || x.aliases.some(a => lower.includes(a)));
  if (hit?.id !== e.id) problems.push(`sampleTrigger ${e.id} fires ${hit ? hit.id : 'nothing'}`);
}

console.log(problems.length ? problems.join('\n') : 'OK');
process.exitCode = problems.length ? 1 : 0;
