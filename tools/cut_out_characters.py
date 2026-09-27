# Cut the 6 poses out of a character sheet with clean edges (no light halo).
#
# 1. Flood-fill the grey background from the edges of the sheet.
# 2. Also remove grey pockets closed in by arms.
# 3. Shrink the edge by 2 pixels, so the grey-tinted outline is dropped.
# 4. "Color bleed": edge pixels take the color of the character just
#    inside them, so no grey or white shows through the soft edge.
# 5. Soften the edge a little so it does not look jagged.
from collections import deque
from PIL import Image, ImageFilter
import numpy as np, sys, os

def flood(candidate, seeds):
    h, w = candidate.shape
    seen = np.zeros((h, w), bool)
    q = deque()
    for y, x in seeds:
        if candidate[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and candidate[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen

def components(mask):
    h, w = mask.shape
    label = np.zeros((h, w), np.int32); comps = []; n = 0
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if label[sy, sx]: continue
        n += 1; q = deque([(sy, sx)]); label[sy, sx] = n
        pts = 0; box = [sx, sy, sx, sy]; sx_ = sy_ = 0
        while q:
            y, x = q.popleft(); pts += 1; sx_ += x; sy_ += y
            box = [min(box[0],x), min(box[1],y), max(box[2],x), max(box[3],y)]
            for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not label[ny, nx]:
                    label[ny, nx] = n; q.append((ny, nx))
        comps.append(dict(id=n, size=pts, box=box, cx=sx_/pts, cy=sy_/pts))
    return label, comps

def shrink(mask, times):
    m = mask.copy()
    for _ in range(times):
        p = np.pad(m, 1, constant_values=False)
        m = m & p[:-2,1:-1] & p[2:,1:-1] & p[1:-1,:-2] & p[1:-1,2:]
    return m

def bleed(rgb, known, steps):
    # Spread the colors of "known" pixels outward, one ring at a time.
    rgb = rgb.astype(float).copy(); known = known.copy()
    for _ in range(steps):
        total = np.zeros_like(rgb); count = np.zeros(known.shape)
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
            k = np.roll(np.roll(known, dy, 0), dx, 1)
            c = np.roll(np.roll(rgb, dy, 0), dx, 1)
            total += c * k[..., None]; count += k
        grow = (~known) & (count > 0)
        rgb[grow] = total[grow] / count[grow][:, None]
        known = known | grow
    return rgb

src, name, flip = sys.argv[1], sys.argv[2], sys.argv[3] == 'flip'
poses = ['idle', 'talking', 'welcome', 'pointing', 'laughing', 'confused']
img = Image.open(src).convert('RGB')
rgb = np.asarray(img).astype(int)
h, w, _ = rgb.shape
mx, mn, light = rgb.max(2), rgb.min(2), rgb.mean(2)

grey = ((mx - mn) <= 14) & (light >= 120) & (light <= 232)
border = [(y, x) for x in range(w) for y in (0, h-1)] + [(y, x) for y in range(h) for x in (0, w-1)]
bg = flood(grey, border)

# Grey pockets closed in by an arm or a leg.
bg_color = np.median(rgb[bg], axis=0)
pocket = grey & ~bg & (np.abs(rgb - bg_color).max(2) <= 22)
pocket_label, pockets = components(pocket)
for p in pockets:
    if p['size'] >= 40:
        bg |= pocket_label == p['id']

fg = ~bg
label, comps = components(fg)
big = sorted(comps, key=lambda c: -c['size'])[:6]
big.sort(key=lambda c: (c['cy'] > h / 2, c['cx']))

pieces = []
for c in big:
    x0, y0, x1, y1 = c['box']
    x0, y0, x1, y1 = max(0, x0-4), max(0, y0-4), min(w-1, x1+4), min(h-1, y1+4)
    mask = label[y0:y1+1, x0:x1+1] == c['id']
    mask = shrink(mask, 2)                      # drop the grey-tinted outline
    inside = shrink(mask, 2)                    # pixels we trust for color
    colors = bleed(rgb[y0:y1+1, x0:x1+1], inside, 6)
    alpha = Image.fromarray(mask.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(0.9))
    alpha = np.clip((np.asarray(alpha).astype(float) - 40) * 255 / 175, 0, 255)
    rgba = np.dstack([np.clip(colors, 0, 255), alpha]).astype(np.uint8)
    pieces.append(Image.fromarray(rgba, 'RGBA'))

W = max(p.width for p in pieces) + 8
H = max(p.height for p in pieces) + 8
os.makedirs('out2', exist_ok=True)
for pose, piece in zip(poses, pieces):
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.paste(piece, ((W - piece.width) // 2, H - piece.height - 4), piece)
    if flip:
        canvas = canvas.transpose(Image.FLIP_LEFT_RIGHT)
    canvas.save(f'out2/{name}-{pose}.webp', quality=92, method=6, exact=False)
print(name, 'canvas', W, H)
