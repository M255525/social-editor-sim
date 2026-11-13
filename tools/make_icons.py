# 產生 PWA 圖示：深紫底＋手機＋粉紅愛心通知
import os
from PIL import Image, ImageDraw
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
os.makedirs(out, exist_ok=True)
def heart(d, cx, cy, r, fill):
    d.ellipse([cx - r, cy - r * .9, cx, cy + r * .1], fill=fill)
    d.ellipse([cx, cy - r * .9, cx + r, cy + r * .1], fill=fill)
    d.polygon([(cx - r * .97, cy - r * .25), (cx + r * .97, cy - r * .25), (cx, cy + r * 1.05)], fill=fill)
def draw(size, pad):
    s = 4 * size
    im = Image.new('RGB', (s, s), '#2B1B5A')
    d = ImageDraw.Draw(im)
    w = s * (1 - 2 * pad)
    x0, y0 = s * pad + w * .22, s * pad + w * .06
    x1, y1 = s * pad + w * .7, s * pad + w * .94
    d.rounded_rectangle([x0, y0, x1, y1], radius=w * .08, fill='#120C26')
    d.rounded_rectangle([x0 + w * .03, y0 + w * .05, x1 - w * .03, y1 - w * .04], radius=w * .05, fill='#FFFFFF')
    for i, c in enumerate(['#E8F0FF', '#FFE3EE', '#E3F8F0']):
        yy = y0 + w * (.12 + i * .25)
        d.rounded_rectangle([x0 + w * .06, yy, x1 - w * .06, yy + w * .2], radius=w * .03, fill=c)
    # 愛心通知泡泡
    bx, by, br = s * pad + w * .72, s * pad + w * .3, w * .2
    d.ellipse([bx - br, by - br, bx + br, by + br], fill='#FF3D7F')
    heart(d, bx, by - br * .05, br * .5, '#FFFFFF')
    return im.resize((size, size), Image.LANCZOS)
draw(192, .06).save(os.path.join(out, 'icon-192.png'))
draw(512, .06).save(os.path.join(out, 'icon-512.png'))
draw(512, .18).save(os.path.join(out, 'icon-maskable-512.png'))
print('ok')
