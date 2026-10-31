"""Codex originals in _art/v9 (gitignored) -> web files in assets/.
usage: python -I tools/optimize_art.py   (run from the repo root)
Prints each output with its size; also prints where the firelight centres in each scene, which app.mjs uses as the pit anchor."""
import pathlib
import numpy as np
from PIL import Image

SRC = pathlib.Path('_art/v9')
OUT = pathlib.Path('assets')


def save(im, path, quality):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    print(f'{path}  {im.size[0]}x{im.size[1]}  {path.stat().st_size // 1024} KB')


def crop_alpha(im, pad_ratio=0.02):
    x0, y0, x1, y1 = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    pad = int(max(x1 - x0, y1 - y0) * pad_ratio)
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def fit(im, longest):
    s = longest / max(im.size)
    return im if s >= 1 else im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


for scene in ['forest', 'temple', 'snow']:
    for orient in ['land', 'port']:
        for light in ['unlit', 'lit']:
            im = Image.open(SRC / f'scenes/{scene}_{orient}_{light}.png').convert('RGB')
            save(im, OUT / f'scenes/{scene}-{orient}-{light}.webp', 76)
        u = np.asarray(Image.open(SRC / f'scenes/{scene}_{orient}_unlit.png').convert('L'), dtype=np.float32)
        l = np.asarray(Image.open(SRC / f'scenes/{scene}_{orient}_lit.png').convert('L'), dtype=np.float32)
        d = np.clip(l - u, 0, None)
        d[: int(d.shape[0] * 0.35)] = 0
        w = d ** 3
        ys, xs = np.mgrid[0:d.shape[0], 0:d.shape[1]]
        print(f'  anchor {scene}-{orient}: x={(w * xs).sum() / w.sum() / d.shape[1]:.3f} y={(w * ys).sum() / w.sum() / d.shape[0]:.3f}')

# Both pit states share one crop box so they stay pixel-aligned when cross-faded.
for pit in ['stone', 'snow', 'brazier']:
    u = Image.open(SRC / f'pit/pit_{pit}_unlit.png').convert('RGBA')
    l = Image.open(SRC / f'pit/pit_{pit}_lit.png').convert('RGBA')
    bx = u.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    pad = int(max(bx[2] - bx[0], bx[3] - bx[1]) * 0.02)
    box = (max(0, bx[0] - pad), max(0, bx[1] - pad), min(u.width, bx[2] + pad), min(u.height, bx[3] + pad))
    for name, im in [('unlit', u), ('lit', l)]:
        save(fit(im.crop(box), 900), OUT / f'pit/{pit}-{name}.webp', 82)

for f in sorted((SRC / 'objects').glob('obj_*.png')):
    save(fit(crop_alpha(Image.open(f).convert('RGBA')), 384), OUT / f'objects/{f.stem[4:].replace("_", "-")}.webp', 82)

save(fit(Image.open(SRC / 'ui/paper_sheet.png').convert('RGB'), 1024), OUT / 'ui/paper.webp', 72)

icon = Image.open(SRC / 'brand/app_icon.png').convert('RGB')
for size, name in [(180, 'apple-touch-icon.png'), (512, 'assets/icon-512.png'), (192, 'assets/icon-192.png')]:
    p = pathlib.Path(name)
    icon.resize((size, size), Image.LANCZOS).save(p, optimize=True)
    print(f'{p}  {size}x{size}  {p.stat().st_size // 1024} KB')
emblem = crop_alpha(Image.open(SRC / 'brand/emblem.png').convert('RGBA'), 0.04)
emblem.resize((64, 64), Image.LANCZOS).save('assets/emblem-64.png', optimize=True)
emblem.resize((48, 48), Image.LANCZOS).save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('favicon.ico, assets/emblem-64.png')
