"""Colour-match a background frame to its slide's stage colour, then save a web JPG.

    python tools/grade_bg.py gen/brazil-bg-123.png img/brazil-bg.jpg "#1E1714" [contrast]

Gemini gets close to a requested hex but never exactly, and the stage colour has
to agree with the panel beside it. So each channel is shifted until the image's
average sits on the target, keeping the light and leaf-shadow pattern
(optionally softened with contrast < 1). A soft vignette-free centre is left alone.
"""
import sys
import numpy as np
from PIL import Image

SIZE = 1400


def grade(src, dst, target, contrast=1.0):
    im = Image.open(src).convert('RGB')
    s = min(im.size)
    im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
    a = np.asarray(im).astype(np.float32)
    t = np.array([int(target[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    # match the median rather than the mean so a bright sun pool doesn't drag the whole wall darker
    med = np.median(a.reshape(-1, 3), axis=0)
    out = (a - med) * contrast + t
    out = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    if s != SIZE:
        out = out.resize((SIZE, SIZE), Image.LANCZOS)
    out.save(dst, quality=84, optimize=True, progressive=True)
    got = np.median(np.asarray(out).reshape(-1, 3), axis=0)
    print(dst, out.size, 'target', target, 'median now', '#%02X%02X%02X' % tuple(int(v) for v in got))


if __name__ == '__main__':
    grade(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 1.0)
