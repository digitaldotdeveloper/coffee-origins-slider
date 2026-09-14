"""Build the web images the slider loads: art/ (PNG/JPG masters) -> img/ (WebP).

    python tools/optimize.py

- bags   art/<origin>-bag.png   -> img/<origin>-bag.webp      native size. A phone shows the bag
                                                               ~300 css px tall at 3x, so it needs it
- bgs    art/<origin>-bg.jpg    -> img/<origin>-bg.webp       1400 px, desktop
                                -> img/<origin>-bg-m.webp     800 px, phones (soft photo, no visible loss)
- beans  art/beans-<roast>-N.png -> img/beans-<roast>-N.webp  160 px max side (largest bean is 74 css px)

The masters come from cutout.py, grade_bg.py and slice_beans.py; write those into art/.
"""
import glob
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
ART, IMG = os.path.join(ROOT, 'art'), os.path.join(ROOT, 'img')


def save(im, dst, size=None, q=80):
    if size and max(im.size) > size:
        f = size / max(im.size)
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    kw = dict(quality=q, method=6)
    if im.mode == 'RGBA':
        kw['alpha_quality'] = 90
    im.save(dst, 'WEBP', **kw)
    return os.path.getsize(dst)


def main():
    os.makedirs(IMG, exist_ok=True)
    before = after = 0
    for src in sorted(glob.glob(os.path.join(ART, '*'))):
        name, ext = os.path.splitext(os.path.basename(src))
        im = Image.open(src)
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        before += os.path.getsize(src)
        if name.endswith('-bag'):
            outs = [(name, None, 84)]
        elif name.endswith('-bg'):
            outs = [(name, 1400, 78), (name + '-m', 800, 74)]
        elif name.startswith('beans-'):
            outs = [(name, 160, 84)]
        else:
            continue
        for out, size, q in outs:
            n = save(im, os.path.join(IMG, out + '.webp'), size, q)
            after += n
            print(f'{out}.webp  {n / 1024:.0f} KB')
    print(f'masters {before / 1024:.0f} KB -> webp {after / 1024:.0f} KB (all variants)')


if __name__ == '__main__':
    main()
