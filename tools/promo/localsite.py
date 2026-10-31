"""Serve the bulmeong repo to a Playwright context at http://bm.test/ straight from disk (no server process)."""
import mimetypes, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
TYPES = {'.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp',
         '.m4a': 'audio/mp4', '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml'}
BASE = 'http://bm.test/'


def serve(ctx):
    def handle(route):
        path = route.request.url[len(BASE):].split('?')[0].split('#')[0] or 'index.html'
        f = (ROOT / path).resolve()
        if f.is_dir():
            f = f / 'index.html'
        if ROOT not in f.parents or not f.is_file():
            return route.fulfill(status=404, body='')
        ctype = TYPES.get(f.suffix) or mimetypes.guess_type(f.name)[0] or 'application/octet-stream'
        route.fulfill(status=200, body=f.read_bytes(), headers={'content-type': ctype, 'access-control-allow-origin': '*'})
    ctx.route(re.compile(r'^http://bm\.test/'), handle)
