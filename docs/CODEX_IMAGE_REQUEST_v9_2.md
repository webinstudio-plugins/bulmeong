# Codex 요청: 불멍 v9 그림 2차 (숨은 장면 '성운 끝', 도감 카드 20장)

상태: 2026-10-31 Claude 작성. 아래 코드 블록을 통째로 Codex에 붙여 넣으면 된다. 저장 폴더는 미리 만들어 두었다.
다 되면 Claude에게 "2차 에셋 왔어"라고만 말해 주면 된다. Claude가 크기·투명도·구도를 검사하고 웹용으로 줄여 사이트에 넣는다.
1차 요청: [CODEX_IMAGE_REQUEST_v9.md](CODEX_IMAGE_REQUEST_v9.md). 계획서: [PLAN_v9.md](PLAN_v9.md).

왜 필요한가:
- 숨은 장면 '성운 끝'은 아직 v8 때 그림 한 장을 쓴다. 다른 세 장면처럼 불 꺼진 판과 불빛 판, 화로가 따로 있어야 불빛이 장면에 비치고 불이 화로 안에 앉는다.
- 도감의 못 찾은 칸은 자물쇠 상자뿐이다. 단어마다 카드 그림이 있으면 못 찾은 칸에는 그림자로, 찾은 칸에는 제 색으로 보여 줄 수 있다.

```
불멍(https://bulmeong.web.app) v9 그림 2차 26장을 만들어 줘. 1차 그림 35장(_art/v9/)과 같은 사이트, 같은 그림체야.
브라우저에서 켜 두는 모닥불 사이트이고, 불꽃은 코드가 그린다. 이번 묶음은 두 가지다.
(1) 숨은 장면 '성운 끝' 4장과 그 장면의 화로 2장: 1차 장면·화로와 같은 규칙(불꽃 금지, 꺼진 판과 불빛 판).
(2) 도감 카드 20장: 숨은 단어 20개를 하나씩 상징하는 작은 그림. 카드에는 불꽃을 그린다.

[저장]
- 루트: C:/Users/user/Desktop/work/bulmeong-lounge/_art/v9/
- 장면: C:/Users/user/Desktop/work/bulmeong-lounge/_art/v9/scenes/
- 화로: C:/Users/user/Desktop/work/bulmeong-lounge/_art/v9/pit/
- 카드: C:/Users/user/Desktop/work/bulmeong-lounge/_art/v9/cards/
- 파일명은 아래 목록 그대로(.png). 1차 파일은 덮어쓰지 않는다. 버린 시안은 rejected/ 에 넣고 지우지 않는다.
- 기록: _art/v9/IMAGE_LOG_2.md 에 파일마다 실제로 쓴 프롬프트 전문, 모델·크기, 투명 여부(알파 검사 결과), 다시 만든 이유를 적는다. 1차 IMAGE_LOG.md는 건드리지 않는다.
- 확인용 모아보기: contact_cosmos.png(장면 4장과 화로 2장), contact_cards.png(카드 20장, 파일명 라벨 포함, 회색 체커 위에), contact_cards_black.png(카드 20장을 알파만 남기고 검게 채운 것. 실루엣만으로 무엇인지 알아볼 수 있는지 보는 용도).
- 사이트 코드(index.html, app.mjs, spells.mjs)와 git은 건드리지 않는다.

[공통 그림체 — 모든 프롬프트 앞에 그대로 붙인다. 1차와 같은 문장]
Gouache storybook illustration. Opaque gouache with visible dry-brush strokes and a faint cold-press paper grain, soft edges, simplified shapes, gentle value steps. Limited palette: night blues #141C2B #22314A, pine greens #24392F #33503F, warm ember orange #F09C42 #D9622B, cream #F2E5CE, charcoal brown #2A2320. Mood: quiet, cozy, a little melancholic but warm. Thin, sparse outlines at most. Not photorealistic, not a 3D render, not anime, not glossy digital painting, no lens flare. No text, letters, numbers, logos, signatures or watermarks anywhere. No people, no animals.
1차의 forest_land_lit.png, pit_stone_lit.png, objects/obj_resignation.png 세 장을 그림체 기준 이미지로 함께 넣는다.

[(1) 숨은 장면 '성운 끝' — 1차 장면 규칙 그대로]
형식: 가로판은 모델이 허락하는 가장 큰 가로 크기(예: 1536×1024), 세로판은 가장 큰 세로 크기(예: 1024×1536). 업스케일 금지.
구도: 눈높이보다 조금 위에서 비스듬히 내려다보는 시점. 화면 가로 50%, 세로 68%(세로판은 세로 64%) 지점에 지름이 화면 너비의 약 30%(세로판은 60%)인 빈 바닥이 있다. 그 자리에 코드가 화로를 올린다. 빈 바닥은 평평하고 아무것도 없어야 한다(돌·장작·불 금지). 중요한 것은 화면 가운데 60% 안에 둔다. 위쪽 25%는 어둡고 단순하게 둔다(그 위에 글자가 올라간다).
- _unlit: 불이 없는 상태. 별빛과 성운 빛뿐, 빈 바닥 자리에 아주 희미한 숯불 기운만.
- _lit: 반드시 같은 이름의 _unlit을 원본으로 이미지 편집(edit)해서 만든다. 빈 바닥 한가운데에 큰 모닥불이 있다고 치고 그 빛만 더한다. 섬의 돌바닥과 가장자리 바위에 주황 빛이 비치고 거리에 따라 줄어든다(반경 약 화면 너비의 45%). 하늘과 성운 색은 그대로 둔다. 불꽃 자체, 화로, 연기는 그리지 않는다. 만든 뒤 두 판을 50%로 겹친 이미지를 _check/ 에 저장해서 윤곽이 겹치는지 확인한다.

scenes/cosmos_land_unlit.png / cosmos_land_lit.png / cosmos_port_unlit.png / cosmos_port_lit.png
  The quiet edge of a nebula. A small flat island of dark weathered stone floating in deep space, its rim crumbling into a few smaller floating rocks. Behind it a soft nebula in muted violet #3A2A5C and teal #1F4A55 drifting like slow smoke, scattered small stars, one faint band of a distant galaxy. The stone floor of the island is smooth and bare where the fire will go. Calm and lonely, not a battle scene, no planets with rings, no spaceships, no glowing runes or symbols.

[(1) 성운 끝 화로 — 투명 배경, 불꽃 없음, 1차 화로 규칙 그대로]
크기 1536×1024 가로. API의 background를 transparent로, 출력은 png로. 저장 뒤 알파 채널이 실제로 있는지, 네 구석이 완전히 투명한지 검사해서 IMAGE_LOG_2.md에 적는다. 화로를 가운데에, 장면과 같은 시점(약 25도 위에서 내려다봄)으로. 화로 너비는 그림 너비의 70%. 화로 밑에 반투명 그림자가 바깥으로 갈수록 완전히 투명해지게.
- _unlit: 장작은 검게 그을렸고 갈라진 틈에 아주 희미한 붉은 숯 기운만. 불꽃·연기 없음.
- _lit: 같은 그림을 편집해서, 화로 한가운데 위쪽에서 큰 불이 타는 것처럼 장작 윗면과 돌 안쪽 면에 주황 빛을 더하고 숯을 밝게. 불꽃·연기·불똥은 그리지 않는다.
pit/pit_altar_unlit.png / pit_altar_lit.png
  A low, wide, shallow bowl carved from one piece of dark meteorite stone, standing directly on the ground, rough pitted surface with a few small pale crystals embedded in the rim. Filled with charred split logs and grey ash. Plain, no engravings, no runes, no symbols.

[(2) 도감 카드 20장 — 투명 배경, 카드마다 불꽃 하나]
형식: 1024×1024, API의 background를 transparent로, 출력은 png로. 알파 검사는 화로와 같게.
구도: 그림 하나를 가운데에, 지름이 화면의 80%인 보이지 않는 원 안에 넣는다. 가장자리에 닿는 것이 없어야 한다. 테두리·액자·카드 틀·바닥 그림자는 그리지 않는다(틀은 코드가 그린다).
불꽃: 이 카드들에는 불꽃을 그린다. 카드마다 적힌 세 가지 색(속 / 몸통 / 끝)으로 칠한다. 불꽃 둘레의 부드러운 빛은 투명하게 사라져도 된다.
실루엣: 못 찾은 단어의 카드는 사이트에서 검은 그림자로만 보인다. 그래서 검게 채워도 무엇인지 알아볼 수 있는 굵고 단순한 형태로 그린다. contact_cards_black.png로 확인하고, 알아보기 어려운 카드는 다시 만든다.
글자: 숫자·글자·기호(₿, π, 0과 1 같은 숫자 모양 포함)를 그리면 실패다. 코드, 숫자, 신호는 빛줄기·구멍·점과 선으로만 나타낸다.
동물: 공통 그림체의 "No people, no animals"에서 카드에 적힌 존재(용, 불사조, 고양이 모양 불꽃)만 예외다. 사람과 손은 여전히 그리지 않는다.
각 프롬프트 뒤에 붙일 문장: Isolated emblem on a transparent background, centered, bold simple silhouette, nothing touching the edges.

cards/card_matrix.png  불꽃 색: 속 #E1FFF8 / 몸통 #2EE0BA / 끝 #1270A8
  A tall flame made of thin falling streaks of teal-green light, like rain made of light, the streaks breaking into embers at the bottom, a few tiny square pixels drifting off. No characters of any kind.
cards/card_bull.png  불꽃 색: 속 #FFF8D7 / 몸통 #FF9430 / 끝 #DA3012
  A staircase of candlestick bars climbing from lower left to upper right, mostly red bars with two short blue bars, a thin bright line joining their tops; the last and tallest bar bursts into a flame at its top.
cards/card_fireworks.png  불꽃 색: 속 #FFFCE6 / 몸통 #FFC844 / 끝 #D67612
  A cream paper envelope with a plain dark red wax seal tearing open, a golden flame bursting out of it into three small firework blossoms above.
cards/card_lightning.png  불꽃 색: 속 #FCE8FF / 몸통 #C05EFF / 끝 #701CBC
  A forked violet-white lightning bolt striking straight down into a violet flame, small sparks splashing outward where it hits.
cards/card_sakura.png  불꽃 색: 속 #FCE8FF / 몸통 #C05EFF / 끝 #701CBC, 꽃잎은 연분홍 #FFBED2
  A violet flame whose rising embers turn into pale pink cherry blossom petals that drift up and to one side, with two small five-petal blossoms among them.
cards/card_konami.png  불꽃 색: 속 #E6FFFF / 몸통 #00F5FF / 끝 #FF00A8
  A plain retro game controller seen from the front (rectangular body, a cross-shaped direction pad, two round buttons, no brand, no letters), with a flame of chunky square pixels in cyan and magenta rising from it.
cards/card_blackhole.png  불꽃 색: 속 #FFD2F5 / 몸통 #EB2673 / 끝 #340C62
  A small perfectly black sphere with a thin glowing ring around it; a pink flame is pulled sideways and bent around the sphere, its tip stretching into the ring.
cards/card_satoshi.png  불꽃 색: 속 #FFFCE6 / 몸통 #FFC844 / 끝 #D67612
  A thick plain gold coin standing on its edge (blank face, no symbol, no letters), a short chain of plain links behind it, a golden flame rising from the top of the coin.
cards/card_sword.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE882 / 끝 #FF7A18
  A straight sword stuck point-down into a flame, the blade glowing white-hot, a ring of bright sparks around the hilt. Plain blade, no runes, no engravings.
cards/card_dragon.png  불꽃 색: 속 #E1FFF8 / 몸통 #2EE0BA / 끝 #1270A8
  An azure eastern dragon coiling upward around a teal flame, holding a softly glowing pearl in one claw. Long serpentine body, whiskers, no scenery.
cards/card_pi.png  불꽃 색: 속 #E6FFFF / 몸통 #00F5FF / 끝 #FF00A8
  A flame twisting into a tight spiral whirlpool seen slightly from above, cyan towards the centre and magenta at the outer edge, like water draining. No symbols.
cards/card_42.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE8AA / 끝 #804EFF
  A small spiral galaxy in deep violet and white-gold, with a calm white-gold flame burning at its very centre.
cards/card_helloworld.png  불꽃 색: 속 #E1FFF8 / 몸통 #2EE0BA / 끝 #1270A8
  An old beige CRT computer monitor, its dark screen showing only a single small glowing teal block cursor, a teal flame rising from the top of the monitor. Nothing else on the screen.
cards/card_binary.png  불꽃 색: 속 #E1FFF8 / 몸통 #2EE0BA / 끝 #1270A8
  A strip of old punched paper tape curling upward in an S shape, its round punched holes glowing teal from behind, the top end catching a teal flame. Holes only, no digits.
cards/card_morse.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE882 / 끝 #FF7A18
  An old brass ship's signal lamp with a bright flame inside its glass lens, sending out three short and three long beams of light as dots and dashes of light over a strip of dark sea.
cards/card_prometheus.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE882 / 끝 #FF7A18
  A long dried fennel stalk standing upright like a torch, its tip burning with a bright white-gold flame, a faint large sun disc behind it. No hands, no people.
cards/card_schrodinger.png  불꽃 색: 속 #E6FFFF / 몸통 #00F5FF / 끝 #FF00A8
  A plain wooden box with its lid slightly open; out of the gap rises a flame shaped like a sitting cat, its left half cyan and its right half magenta.
cards/card_nirvana.png  불꽃 색: 속 #FFFCE6 / 몸통 #FFC844 / 끝 #D67612
  A pale lotus flower floating on a small patch of dark still water, a calm golden flame burning in its centre, two thin rings spreading on the water.
cards/card_phoenix.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE882 / 끝 #FF7A18
  A phoenix with wings spread wide rising from a small heap of grey ash, its body and long tail feathers made of white-gold and orange flame.
cards/card_creator.png  불꽃 색: 속 #FFFFFF / 몸통 #FFE8AA / 끝 #804EFF
  A supernova: a white-gold star bursting outward in soft rays and violet dust, with a small simple crown shape made of flame at its heart.

[순서]
1. 먼저 cosmos_land_unlit, cosmos_land_lit, pit_altar_unlit, pit_altar_lit, card_bull, card_sakura 여섯 장만 만든다. 1차 기준 이미지와 그림체가 맞는지, _lit이 _unlit과 겹치는지, 투명이 제대로인지, 카드 실루엣이 알아보이는지 스스로 검사하고 IMAGE_LOG_2.md에 적는다.
2. 여섯 장이 기준에 맞으면 그 여섯 장을 함께 기준 이미지로 삼아 나머지를 같은 붓 터치·채도·밝기로 만든다. 카드 20장은 크기감(그림이 원 안을 채우는 정도)을 맞춘다.
3. 끝나면 모아보기 3장을 만들고, IMAGE_LOG_2.md 맨 위에 "완료 n/26, 다시 만든 것, 마음에 걸리는 것"을 세 줄로 적는다.
```

## Claude가 받은 뒤 하는 일

- 크기·알파·구도 검사, `_lit`과 `_unlit` 겹침 검사, 카드 실루엣 검사.
- `tools/optimize_art.py`에 성운 장면·화로·카드를 더해 WebP로 줄인다. 장면은 1차와 같은 크기, 카드는 긴 변 384px 알파 WebP.
- 성운 끝 장면을 다른 세 장면처럼 불빛 판과 화로로 그리게 바꾸고, 화로 자리(앵커)를 새로 잰다. v8 그림 `assets/bg-cosmos.jpg`는 그 뒤에 지운다.
- 도감 카드: 못 찾은 칸은 카드 그림을 검은 그림자로, 찾은 칸은 제 색으로 보여 준다. 찾은 순간 찍힌 사진은 지금처럼 카드 아래에 남긴다.
