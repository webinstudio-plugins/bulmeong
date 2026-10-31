# Codex 요청: 불멍 v9 그림 1차 (장면 3개, 화로, 던지는 물건, 종이, 로고)

상태: 2026-10-31 Claude 작성. 아래 코드 블록을 통째로 Codex에 붙여 넣으면 된다. 저장 폴더는 미리 만들어 두었다.
다 되면 Claude에게 "에셋 왔어"라고만 말해 주면 된다. Claude가 크기·투명도·구도를 검사하고 웹용으로 줄여 사이트에 넣는다.
계획서: [PLAN_v9.md](PLAN_v9.md) 4·5장.

```
불멍(bulmeong.netlify.app) v9 개편에 쓸 그림 35장을 만들어 줘. 브라우저에서 켜 두는 모닥불 사이트야. 화면 가득 밤 풍경이 있고, 가운데 아래쪽 화로에서 불이 타고, 사용자가 물건을 던져 태운다.
불꽃 자체는 코드(캔버스)가 그린다. 그래서 그림에는 불꽃·연기·불똥을 절대 그리지 않는다. 그림은 "불이 꺼진 상태"와 "불빛이 비친 상태" 두 판으로 받고, 코드가 둘을 섞어서 불빛이 깜빡이게 만든다.

[저장]
- 루트: C:/Users/user/Desktop/work/bulmeong-lounge/_art/v9/
- 장면: scenes/  화로: pit/  물건: objects/  종이·로고: ui/ , brand/
- 파일명은 아래 목록의 이름 그대로(.png). 버린 시안은 rejected/ 에 넣고 지우지 않는다.
- 기록: _art/v9/IMAGE_LOG.md 에 파일마다 실제로 쓴 프롬프트 전문, 모델·크기, 투명 여부(알파 검사 결과), 다시 만든 이유를 적는다.
- 확인용 모아보기: contact_scenes.png, contact_pits.png, contact_objects.png (파일명 라벨 포함, 투명 PNG는 회색 체커 위에).
- 사이트 코드(index.html, app.mjs)와 git은 건드리지 않는다.

[공통 그림체 — 모든 프롬프트 앞에 그대로 붙인다]
Gouache storybook illustration. Opaque gouache with visible dry-brush strokes and a faint cold-press paper grain, soft edges, simplified shapes, gentle value steps. Limited palette: night blues #141C2B #22314A, pine greens #24392F #33503F, warm ember orange #F09C42 #D9622B, cream #F2E5CE, charcoal brown #2A2320. Mood: quiet, cozy, a little melancholic but warm. Thin, sparse outlines at most. Not photorealistic, not a 3D render, not anime, not glossy digital painting, no lens flare. No text, letters, numbers, logos, signatures or watermarks anywhere. No people, no animals.

[형식]
- 장면: 가로판은 모델이 허락하는 가장 큰 가로 크기(예: 1536×1024), 세로판은 가장 큰 세로 크기(예: 1024×1536). 업스케일하지 말 것(웹용 변환은 Claude가 한다).
- 화로·물건·종이·로고는 투명 배경 PNG. API의 background 옵션을 transparent로, 출력은 png로 지정한다. 프롬프트에 "transparent background"라고만 쓰면 체커 무늬가 그림에 박혀 나올 수 있으니, 저장 뒤 알파 채널이 실제로 있는지, 가장자리 네 구석이 완전히 투명한지 검사해서 IMAGE_LOG.md에 적는다. 실패하면 다시 만든다.
- "불빛" 판(_lit)은 반드시 같은 이름의 "꺼진" 판(_unlit)을 원본으로 이미지 편집(edit)해서 만든다. 새로 생성하면 구도가 어긋나서 쓸 수 없다. 만든 뒤 두 판을 50%로 겹친 이미지를 rejected/ 옆 _check/ 폴더에 저장해서 윤곽이 겹치는지 확인한다. 어긋나면 다시 만든다.
- 글자·숫자가 들어가면 그 그림은 실패다. 시계 문자판은 눈금만, 종이는 회색 줄만.

[장면 — 화로 자리는 비워 둔다]
구도 공통: 눈높이보다 조금 위에서 비스듬히 내려다보는 시점. 화면 가로 50%, 세로 68%(세로판은 세로 64%) 지점에 지름이 화면 너비의 약 30%(세로판은 60%)인 빈 땅이 있다. 그 자리에 코드가 화로를 올린다. 빈 땅은 평평하고 아무것도 없어야 한다(돌·장작·불 금지). 중요한 것은 화면 가운데 60% 안에 둔다(가장자리는 기기마다 잘린다). 위쪽 25%는 하늘·처마·나무 윗부분처럼 어둡고 단순하게 둔다(그 위에 글자가 올라간다).
- _unlit: 불이 없는 밤. 달빛과 어둠뿐, 빈 땅 자리에 아주 희미한 숯불 기운만.
- _lit: 같은 그림에서 빈 땅 한가운데에 큰 모닥불이 있다고 치고 그 빛만 더한다. 주변 나무 기둥, 처마, 눈, 젖은 바닥에 주황 빛이 비치고 거리에 따라 줄어든다(반경 약 화면 너비의 45%). 불꽃 자체, 화로, 연기는 그리지 않는다.

scenes/forest_land_unlit.png / forest_land_lit.png / forest_port_unlit.png / forest_port_lit.png
  A small clearing in a quiet pine forest at night after rain. Tall dark pine trunks framing both sides, wet moss and a few flat stones near the edges, puddles reflecting faint moonlight, low mist between the trees, a few distant stars through the canopy.
scenes/temple_land_unlit.png / temple_land_lit.png / temple_port_unlit.png / temple_port_lit.png
  Under the deep wooden eave of a small old mountain temple on a rainy night. Heavy curved roof edge across the top with rain dripping from the tiles, a wooden veranda floor in the foreground, a stone-paved courtyard and misty dark mountains beyond, a single small metal wind chime hanging from the eave (plain, no fish shape needed). Muted, calm, not ornate, no statues, no religious symbols.
scenes/snow_land_unlit.png / snow_land_lit.png / snow_port_unlit.png / snow_port_lit.png
  A snowy clearing in front of a small log cabin in the mountains at night. The cabin is off to one side with one dimly glowing window, snow-covered spruces, deep soft snow, light falling snow, a few footprints leading to the empty spot. The empty spot is a trampled snow patch with bare frozen earth.

[화로 — 투명 배경, 불꽃 없음]
크기 1536×1024 가로. 화로를 가운데에, 장면과 같은 시점(약 25도 위에서 내려다봄)으로. 화로 너비는 그림 너비의 70%. 화로 밑에 반투명 그림자가 바깥으로 갈수록 완전히 투명해지게.
- _unlit: 장작은 검게 그을렸고 갈라진 틈에 아주 희미한 붉은 숯 기운만. 불꽃·연기 없음.
- _lit: 같은 그림을 편집해서, 화로 한가운데 위쪽에서 큰 불이 타는 것처럼 장작 윗면과 돌 안쪽 면에 주황 빛을 더하고 장작 틈의 숯을 밝게. 불꽃·연기·불똥은 그리지 않는다.
pit/pit_stone_unlit.png / pit_stone_lit.png
  A ring of rounded river stones with a teepee of split oak logs in the middle, a bed of grey ash inside the ring. (forest scene)
pit/pit_snow_unlit.png / pit_snow_lit.png
  The same kind of stone ring and log teepee, with snow caps on the outer stones and a dark wet melted ring of earth around it. (snow scene; same proportions as pit_stone)
pit/pit_brazier_unlit.png / pit_brazier_lit.png
  A low, wide, old cast-iron brazier bowl on three short legs, standing on a flat stone, filled with charred split logs and ash. Plain, no engravings, no symbols. (temple scene)

[던지는 물건 — 투명 배경, 물건 하나씩]
크기 1024×1024, 사방 여백 8%, 물건 하나만. 빛은 모두 같은 방향(위 오른쪽에서 오는 따뜻하고 부드러운 빛). 바닥 그림자·흰 테두리 없음. 종이에는 글자 대신 회색 줄이나 빈칸만(글자는 코드가 언어별로 얹는다). 상표·로고 금지.
objects/obj_resignation.png  A cream paper envelope, slightly crumpled, closed with a dark red wax seal (the seal is plain, no letters). A clear empty area on the front where a label can be added later.
objects/obj_stock_chart.png  A crumpled sheet of white printer paper with a faint grid and a single line chart that drops steeply from left to right, drawn in dark grey ink only. No numbers, no red, no blue, no green.
objects/obj_alarm_clock.png  An old twin-bell wind-up alarm clock in worn metal, tick marks only on the face (no numerals), hands at about six thirty.
objects/obj_firewood.png  One split oak firewood log, rough bark on one side and pale split wood on the other.
objects/obj_note.png  A small folded note of cream hand-made paper with visible fibers, blank.
objects/obj_wish_gold.png  A small folded paper flecked with gold leaf, blank, softly shining.
objects/obj_bill.png  An unpaid bill: a sheet with grey lines, an empty boxed area at the bottom, a torn perforated edge on top. No numbers.
objects/obj_exam.png  A school exam sheet with grey lines and a few red check marks and crosses, no score, no letters.
objects/obj_todo.png  A brown clipboard holding a sheet with empty checkboxes and grey lines, all boxes unchecked.
objects/obj_phone.png  A generic smartphone with a cracked screen showing only a few small glowing red notification dots. No brand, no app icons, no text.
objects/obj_mail_pile.png  A small messy stack of unopened envelopes tied with string, all blank.
objects/obj_photo.png  An old instant photo with a white border; the photo area is a blurry abstract of warm evening colors, no people visible.
objects/obj_diary.png  A small worn leather diary with a tiny brass lock, closed.
objects/obj_report.png  A stapled office report with grey lines heavily marked with red pen scribbles and circles, no readable text.

[종이·로고]
ui/paper_sheet.png  1536×1024, NOT transparent. A flat, evenly lit sheet of warm cream hand-made paper filling the whole frame edge to edge, long soft fibers, very subtle texture, no folds, no shadows, no objects. Used behind text, so keep it low-contrast.
brand/emblem.png  1024×1024 transparent. A simple symbol: three small logs with one rounded flame, inside a ring of five round stones, front view slightly from above. Bold simple shapes that still read at 32×32 pixels. Same gouache style but flatter.
brand/app_icon.png  1024×1024, NOT transparent, full bleed square (no rounded corners, the phone rounds them). The same emblem centered at about 62% size on a deep night blue #141C2B background with a faint warm glow behind it.

[순서]
1. 먼저 forest_land_unlit, forest_land_lit, pit_stone_unlit, pit_stone_lit, obj_resignation 다섯 장만 만든다. 공통 그림체와 맞는지, _lit이 _unlit과 겹치는지, 투명이 제대로인지 스스로 검사하고 IMAGE_LOG.md에 적는다.
2. 다섯 장이 기준에 맞으면 그 다섯 장을 그림체 기준 이미지로 삼아 나머지를 같은 붓 터치·채도·밝기로 만든다.
3. 끝나면 모아보기 3장을 만들고, IMAGE_LOG.md 맨 위에 "완료 n/35, 다시 만든 것, 마음에 걸리는 것"을 세 줄로 적는다.
```

## Claude가 받은 뒤 하는 일

- 크기·알파·구도 검사, `_lit`과 `_unlit` 겹침 검사.
- 웹용 변환: 장면은 WebP(가로 1920·세로 1080 너비 두 벌, 각 250KB 안쪽 목표), 화로·물건은 WebP 알파.
- 사직서 봉투 같은 물건의 글자는 코드에서 언어별로 얹는다.
- OG 공유 이미지(1200×630)는 장면 그림에 언어별 제목을 얹어 Claude가 만든다. 따로 그리지 않는다.
- 2차 요청(나중): 숨은 장면 '성운 끝'과 화로, 비밀 불꽃 20종 도감 카드.
