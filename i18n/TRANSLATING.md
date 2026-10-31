# Translating 불멍 (Bulmeong)

Source: `i18n/ko.json`. Each language file (`en.json`, `ja.json`, `zh.json`, `es.json`) has exactly the same keys, the same value types, and arrays of the same length.

## What the site is
A campfire that runs in the browser. You tap the fire to make it bigger, drag objects (a resignation letter, a losing stock account, a Monday alarm clock, firewood) into it, or write something that weighs on you on a sheet of paper and flick it into the fire. Twenty hidden words make special flames; an album collects them. Other visitors' throws fly into the same fire, but only the kind of object travels, never what people wrote. Mostly used on phones, at night, to unwind.

## Voice
- Warm, plain, short. Like a friend sitting by the fire, not a game announcer. No hype, no exclamation marks unless the Korean has one, no "Unleash", "Embark", "Discover the magic".
- en/es: second person, casual (es: tú, neutral Spanish understood in Spain and Latin America). ja: gentle です/ます. zh: Simplified Chinese, mainland usage, friendly 你.
- Write it the way a native writer would, not a word-for-word copy of the Korean. The oracles (`room.*.oracles`, `gold.oracle`) and fire stage names may be rewritten freely to sound natural, keeping the meaning.
- Keep facts exact: numbers, °C, percentages, years (1978, 2009-01-03), 7.5 million years, "Lv.4", "Lv.0", "3 minutes", ASCII 102, 10 decimal places.
- Keep every `{placeholder}` exactly as written, and keep emoji where the Korean has them.

## Length limits (they sit in small buttons)
- `card.*`: max 14 Latin characters / 7 CJK characters. `room.*.name`, `space.camp|temple|snow|cosmos`, `hud.world`, `hud.sound`, `hud.mute`, `rank.top`, `tier.*`, `album.unlocked|locked|mythic`, `album.nickSave`: max 12 Latin / 6 CJK.
- `title.name`: "Bulmeong" in every language except Korean. `meta.title`: "Bulmeong · " + your tagline.

## Culture notes
- Stock losses: never use a colour for "down" (red means down in the US/Europe, blue in Korea). Say loss, minus, in the red only if natural, etc.
- 사직서 = resignation letter (ja 退職届, zh 辞职信, es carta de renuncia). 월요병 = the Monday dread (ja 月曜日の憂鬱, zh 周一综合症).
- 카톡 / messages: generic "text message" or "message".
- 집행검 (egg_sword) is a famous Korean MMO sword. Use the idea "+99 enhanced legendary sword" in your language.
- egg_nirvana: the Heart Sutra line "form is emptiness, emptiness is form" in your language (ja/zh use 色即是空空即是色).
- egg_creator: the maker's nickname is "siruabba" (Siru's dad). For non-Korean files, sampleTrigger = "siruabba" and the hint tells people it is the maker's nickname, Siru's dad, typed siruabba.
- egg_konami: non-Korean sampleTrigger = "uuddlrlrba".

## Secret words (`egg.<id>.alias`)
- Each `alias` array lists lower-case words or short phrases in YOUR language that should also trigger that flame (matching is "text contains alias", case-insensitive). 3–8 entries for the common/rare eggs; `[]` is fine for egg_pi, egg_42, egg_helloworld, egg_binary, egg_morse, egg_konami, egg_schrodinger.
- `sampleTrigger` must trigger its own egg: it must contain one of your aliases, or be one of the universal triggers already in the code: rm -rf, git, sudo, 404, null, moon, karma, sakura, konami, uuddlrlrba, black hole, singularity, satoshi, 0x00, +99, dragon, 3.1415926535, 42 (exactly), hello, world!, 01100110, ... --- ..., prometheus, E=mc^2, schrodinger, phoenix, siruabba.
- Avoid one-letter or extremely common words that would fire by accident.
- `codeHint` must point to words that actually trigger in your language.

## Check before you finish
`node i18n/check.mjs <lang>` prints missing/extra keys, array length mismatches, placeholder differences and failed sample triggers. It must print `OK`.
