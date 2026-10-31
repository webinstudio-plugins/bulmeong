"""Record 9:16 promo clips from the local site, frame by frame on a fake clock (smooth 30 fps), API stubbed.
usage: python tools/promo/record.py FRAMESDIR CLIP...   clips: <ko|en|ja>-<stock|resign|karma|dev|sakura>, ambient
Writes OUTDIR/<clip>/f00000.jpg ... and OUTDIR/<clip>/burn_at.txt (seconds into the clip when the note was thrown)."""
import json, re, sys, pathlib
from playwright.sync_api import sync_playwright
from localsite import serve, BASE

FPS = 30
ROOT = pathlib.Path(__file__).resolve().parents[2]
out = pathlib.Path(sys.argv[1])
clips = sys.argv[2:]


def word(lang, egg):
    return json.loads((ROOT / f'i18n/{lang}.json').read_text(encoding='utf-8'))[f'egg.{egg}.sampleTrigger']


with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    for clip in clips:
        lang, kind = (clip.split('-') + ['ko'])[:2] if clip != 'ambient' else ('en', 'ambient')
        d = out / clip; d.mkdir(parents=True, exist_ok=True)
        for f in d.glob('f*.jpg'): f.unlink()
        ctx = b.new_context(viewport={'width': 432, 'height': 768}, device_scale_factor=2.5, is_mobile=True, has_touch=True, locale=lang)
        serve(ctx)
        # never touch the shared server from a recording
        ctx.route(re.compile(r'lambda-url'), lambda r: r.fulfill(status=200, content_type='application/json', body='{}'))
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)[:160]))
        page.clock.install()
        page.goto(f'{BASE}?lang={lang}', wait_until='load')
        page.wait_for_timeout(1500)  # real time for fonts and images
        page.clock.run_for(1500)
        cdp = ctx.new_cdp_session(page)
        cdp.send('Animation.enable')
        # shortcut: CSS transitions run on real time while JS runs on the fake clock; slowing them roughly matches capture speed
        cdp.send('Animation.setPlaybackRate', {'playbackRate': 0.25})
        page.click('#btn-ignite-start')
        page.clock.run_for(4000)
        n = [0]

        def frames(k):
            for _ in range(k):
                page.clock.run_for(34 if n[0] % 3 == 2 else 33)  # integer ms only; 33+33+34 keeps 30 fps
                page.screenshot(path=str(d / f'f{n[0]:05d}.jpg'), type='jpeg', quality=90)
                n[0] += 1

        fire = page.evaluate('({x: innerWidth/2, y: innerHeight*0.58})')
        for _ in range(5):  # off camera: a livelier fire to start from
            page.mouse.click(fire['x'], fire['y']); page.clock.run_for(120)
        page.clock.run_for(1500)
        if kind == 'ambient':
            page.evaluate("document.getElementById('btn-idle').click()"); page.clock.run_for(3000)  # the button sits in the closed menu
            frames(15 * FPS)
        else:
            text = word(lang, {'stock': 'egg_bull', 'resign': 'egg_fireworks', 'karma': 'egg_lightning', 'dev': 'egg_matrix', 'sakura': 'egg_sakura'}[kind])
            frames(10)
            for _ in range(3):
                page.mouse.click(fire['x'], fire['y']); frames(5)
            frames(8)
            page.click('#btn-open-hanji'); frames(14)
            for ch in text:
                page.keyboard.type(ch); frames(2)
            frames(14)
            (d / 'burn_at.txt').write_text(f'{n[0] / FPS:.2f}')
            page.click('#burn-btn')
            frames(int(3.8 * FPS))
        print(clip, n[0], 'frames', 'errors', errs, flush=True)
        ctx.close()
    b.close()
