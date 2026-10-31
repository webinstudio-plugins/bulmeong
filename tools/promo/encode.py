"""Turn the recorded frames into 1080x1920 mp4s: hook text until the note is thrown, the address at the end,
fire + rain bed from the site's own sounds, the chime when the secret flame opens.
usage: python tools/promo/encode.py FRAMESDIR _promo   (needs ffmpeg; clips listed in HOOKS must be recorded first)"""
import pathlib, shutil, subprocess, sys

FPS = 30
SITE = pathlib.Path(__file__).resolve().parents[2]
frames, out = pathlib.Path(sys.argv[1]).resolve(), pathlib.Path(sys.argv[2]).resolve()
out.mkdir(parents=True, exist_ok=True)
work = frames / '_enc'; work.mkdir(exist_ok=True)
FONTS = {'ko': 'malgunbd.ttf', 'en': 'segoeuib.ttf', 'ja': 'YuGothB.ttc'}
for f in FONTS.values():
    shutil.copy(pathlib.Path(r'C:\Windows\Fonts') / f, work / f)  # relative font paths dodge drawtext's drive-colon escaping

HOOKS = {
    'ko-stock': "모닥불에 '상한가 떡상'이라고\n적어서 태웠더니",
    'ko-karma': '날 괴롭힌 악연을\n종이에 적어 태웠더니',
    'ko-sakura': '타고 남은 자리에\n벚꽃이 피길 빌었더니',
    'en-stock': 'Wrote "to the moon" on paper\nand threw it in the fire',
    'en-karma': 'Burned a note for everyone\nwho made my life hell',
    'en-sakura': 'Burned a wish for\ncherry blossoms',
    'ja-stock': '焚き火に「爆上げ」って\n書いて燃やしたら',
    'ja-karma': 'わたしを苦しめた悪縁を\n紙に書いて燃やしたら',
    'ja-sakura': '燃えたあとに\n桜が咲きますように',
    'ko-ambient': '작업할 때 켜 두는 모닥불',
    'en-ambient': 'A campfire to leave on\nwhile you work',
    'ja-ambient': '作業中につけっぱなしの焚き火',
}
(work / 'url.txt').write_text('bulmeong.web.app', encoding='utf-8')
(work / 'credit.txt').write_text('Fire sound: Glaneur de sons (CC BY 3.0)', encoding='utf-8')
audio = SITE / 'assets/audio'

for name, hook in HOOKS.items():
    lang, kind = name.split('-')
    src = frames / ('ambient' if kind == 'ambient' else name)
    skip = 45 if kind == 'ambient' else 0  # the ambient take opens with the sleep-timer bar still showing
    n = len(list(src.glob('f*.jpg'))) - skip
    dur = n / FPS
    burn = float((src / 'burn_at.txt').read_text()) if kind != 'ambient' else None
    hook_end = burn if burn is not None else 3.0
    url_from = burn + 2.2 if burn is not None else dur - 3.0
    (work / f'{name}.txt').write_bytes(hook.encode())  # text mode would write CRLF, which drawtext draws as an extra blank line
    font = FONTS[lang]
    vf = (f"drawtext=fontfile={font}:textfile={name}.txt:fontsize=56:fontcolor=white:line_spacing=16:text_align=C:"
          f"box=1:boxcolor=black@0.5:boxborderw=28:x=(w-text_w)/2:y=h*0.11:enable='lt(t,{hook_end:.2f})',"
          f"drawtext=fontfile=segoeuib.ttf:textfile=url.txt:fontsize=64:fontcolor=white:shadowcolor=black@0.8:shadowy=3:"
          f"x=(w-text_w)/2:y=h*0.2:enable='gte(t,{url_from:.2f})',"
          f"drawtext=fontfile=segoeuib.ttf:textfile=credit.txt:fontsize=24:fontcolor=white@0.75:"
          f"x=(w-text_w)/2:y=h*0.2+92:enable='gte(t,{url_from:.2f})',format=yuv420p")
    inputs = ['-framerate', str(FPS), '-start_number', str(skip), '-i', str(src / 'f%05d.jpg'),
              '-i', str(audio / 'fire.m4a'), '-i', str(audio / 'rain.m4a')]
    af = '[1:a]volume=1.0[f];[2:a]volume=0.35[r];'
    mix = '[f][r]'
    if burn is not None:
        inputs += ['-i', str(audio / 'chime.m4a')]
        af += f'[3:a]atrim=0:3,afade=t=out:st=1.8:d=1.2,adelay={int((burn + 0.3) * 1000)}:all=1,volume=0.7[c];'
        mix += '[c]'
    af += (f"{mix}amix=inputs={mix.count('[')}:normalize=0:duration=first,atrim=0:{dur:.3f},"
           f"afade=t=in:d=0.15,afade=t=out:st={dur - 0.4:.3f}:d=0.4[a]")
    dst = out / f'bulmeong-{name}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', f'[0:v]{vf}[v];{af}',
                    '-map', '[v]', '-map', '[a]', '-t', f'{dur:.3f}', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
                    '-r', str(FPS), '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(dst)],
                   cwd=work, check=True)
    print(dst.name, f'{dur:.1f}s', f'{dst.stat().st_size / 1e6:.1f} MB', flush=True)
