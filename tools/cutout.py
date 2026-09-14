"""Cut a bag render off its flat white studio background -> trimmed transparent PNG.

    python tools/cutout.py gen/brazil-123.png img/brazil-bag.png

Background = low-saturation light pixels connected to the image border (so a
white label inside the bag survives). The grey contact shadow counts as
background too: the slider draws its own shadow.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SAT_MAX = 16     # max(r,g,b) - min(r,g,b) below this = neutral
DARK_MAX = 60    # 255 - min(r,g,b) below this = light enough to be backdrop/shadow
SHADOW_BAND = 0.72     # rows below this fraction of the height may hold contact shadow
SHADOW_DARK_MAX = 150
MAX_H = 1200


def cut(src, dst):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    sat = a.max(2) - a.min(2)
    dark = 255 - a.min(2)
    cand = (sat < SAT_MAX) & (dark < DARK_MAX)
    # the contact shadow under the bag is a darker neutral grey: accept it, but
    # only in the bottom band so a matte black pouch body can never be eaten
    band = np.zeros_like(cand)
    band[int(a.shape[0] * SHADOW_BAND):] = True
    cand |= band & (sat < SAT_MAX + 6) & (dark < SHADOW_DARK_MAX)
    cand = cand.astype(np.uint8) * 255

    m = Image.fromarray(cand, 'L').copy()  # fromarray is read-only: floodfill on it silently does nothing
    h, w = cand.shape
    border = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + \
             [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    px = m.load()
    for xy in border:
        if px[xy] == 255:
            ImageDraw.floodfill(m, xy, 128)
    bg = np.asarray(m) == 128

    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), 'L')
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    out = im.convert('RGBA')
    out.putalpha(alpha)

    bbox = alpha.point(lambda v: 255 if v > 10 else 0).getbbox()
    pad = 6
    out = out.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    if out.height > MAX_H:
        out = out.resize((round(out.width * MAX_H / out.height), MAX_H), Image.LANCZOS)
    out.save(dst, optimize=True)
    print(dst, out.size, 'ratio %.3f' % (out.width / out.height))


if __name__ == '__main__':
    cut(sys.argv[1], sys.argv[2])
