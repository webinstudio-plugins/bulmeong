"""Share image (1200x630) from the live scene: camp, fire stoked, buttons hidden. Local site, API stubbed.
usage: python tools/promo/og_shot.py OUT.png [taps]   (og.jpg = this at 2x, cropped 1440x756 around (1200, 590), resized to 1200x630)"""
import re, sys
from playwright.sync_api import sync_playwright
from localsite import serve, BASE

taps = int(sys.argv[2]) if len(sys.argv) > 2 else 8
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    ctx = b.new_context(viewport={'width': 1200, 'height': 630}, device_scale_factor=2, locale='en')
    serve(ctx)
    ctx.route(re.compile(r'lambda-url'), lambda r: r.fulfill(status=200, content_type='application/json', body='{}'))
    page = ctx.new_page()
    page.goto(f'{BASE}?lang=en', wait_until='networkidle')
    page.click('#btn-ignite-start'); page.wait_for_timeout(2500)
    fire = page.evaluate('({x: innerWidth/2, y: innerHeight*0.6})')
    for _ in range(taps):
        page.mouse.click(fire['x'], fire['y']); page.wait_for_timeout(110)
    page.evaluate("document.getElementById('btn-idle').click()")
    page.wait_for_timeout(5000)  # sleep-timer bar hides, smoke settles
    page.screenshot(path=sys.argv[1])
    b.close()
