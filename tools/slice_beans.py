"""Slice a Gemini bean sheet into separate transparent bean sprites.

    python tools/slice_beans.py gen/light-beans-123.png img/beans-light

Writes <prefix>-1.png ... in reading order (rows top to bottom, then left to
right). Background = light neutral pixels connected to the border, as in
cutout.py; each remaining blob bigger than MIN_AREA is one bean.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SAT_MAX, DARK_MAX = 18, 55
MIN_AREA = 1500
MAX_SIDE = 240


def main(src, prefix):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    cand = ((a.max(2) - a.min(2) < SAT_MAX) & (255 - a.min(2) < DARK_MAX)).astype(np.uint8) * 255
    m = Image.fromarray(cand, 'L').copy()  # fromarray is read-only: floodfill on it silently does nothing
    px = m.load()
    for xy in [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]:
        if px[xy] == 255:
            ImageDraw.floodfill(m, xy, 128)
    fg = (np.asarray(m) != 128)

    # label blobs with repeated flood fills on a copy (no scipy here)
    lab = Image.fromarray(np.where(fg, 255, 0).astype(np.uint8), 'L').copy()
    blobs, value = [], 1
    arr = np.asarray(lab)
    while True:
        ys, xs = np.nonzero(arr == 255)
        if not len(ys):
            break
        ImageDraw.floodfill(lab, (int(xs[0]), int(ys[0])), value)
        arr = np.asarray(lab)
        ys2, xs2 = np.nonzero(arr == value)
        if len(ys2) >= MIN_AREA:
            blobs.append((ys2.min(), xs2.min(), ys2.max(), xs2.max(), value))
        value += 1
        if value >= 255:
            break

    # reading order: bucket rows by the blob's vertical centre
    blobs.sort(key=lambda b: ((b[0] + b[2]) / 2) // (h / 4) * 10000 + (b[1] + b[3]) / 2)
    alpha_all = Image.fromarray(np.where(fg, 255, 0).astype(np.uint8), 'L')
    # erode 2px before feathering: the white sheet leaves a pale rim that glows on the dark Brazil slide
    alpha_all = alpha_all.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.0))
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha_all)
    for i, (y0, x0, y1, x1, v) in enumerate(blobs, 1):
        pad = 6
        box = (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad + 1), min(h, y1 + pad + 1))
        only = Image.fromarray(np.where(arr == v, 255, 0).astype(np.uint8), 'L').filter(ImageFilter.MaxFilter(5))
        sprite = rgba.crop(box)
        mask = only.crop(box)
        sa = np.minimum(np.asarray(sprite)[..., 3], np.asarray(mask))
        sprite.putalpha(Image.fromarray(sa.astype(np.uint8)))
        if max(sprite.size) > MAX_SIDE:
            f = MAX_SIDE / max(sprite.size)
            sprite = sprite.resize((round(sprite.width * f), round(sprite.height * f)), Image.LANCZOS)
        out = f'{prefix}-{i}.png'
        sprite.save(out, optimize=True)
        print(out, sprite.size)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
