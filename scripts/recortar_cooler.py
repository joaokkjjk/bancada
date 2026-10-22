"""Tira o fundo branco da foto do cooler para ela ficar sobre o fundo escuro do site.

Uso: python -I recortar_cooler.py <entrada> <saida.webp> [pasta com pillow/numpy]
Só o branco ligado às bordas vira transparente (os logos brancos no produto ficam).
As bordas semitransparentes são escurecidas para não deixar halo claro no preto.
"""
import sys

if len(sys.argv) > 3:
    sys.path.insert(0, sys.argv[3])
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

LIMIAR = 22  # tolerância do preenchimento a partir do branco


def main():
    im = Image.open(sys.argv[1])
    if im.mode == "RGBA" and im.getextrema()[3][0] < 255:  # já tem fundo transparente: só recorta e reduz
        out = im.crop(im.getbbox())
        if out.width > 1400:
            out = out.resize((1400, round(out.height * 1400 / out.width)), Image.LANCZOS)
        out.save(sys.argv[2], "WEBP", quality=88, method=6)
        print(out.size)
        return
    im = im.convert("RGB")
    w, h = im.size
    marca = im.copy()
    for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if min(marca.getpixel(p)) > 230:
            ImageDraw.floodfill(marca, p, (255, 0, 255), thresh=LIMIAR)
    m = np.array(marca)
    fundo = (m[..., 0] == 255) & (m[..., 1] == 0) & (m[..., 2] == 255)
    alfa = Image.fromarray(np.where(fundo, 0, 255).astype("uint8")).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    a = np.array(alfa).astype(np.float32) / 255
    rgb = np.array(im).astype(np.float32)
    # nas bordas, puxa a cor para o escuro do produto em vez do branco do fundo
    rgb = rgb * (a[..., None] ** 1.5)
    out = Image.fromarray(np.dstack([rgb.clip(0, 255), a * 255]).astype("uint8"), "RGBA")
    out = out.crop(out.getbbox())
    if out.width > 1400:
        out = out.resize((1400, round(out.height * 1400 / out.width)), Image.LANCZOS)
    out.save(sys.argv[2], "WEBP", quality=88, method=6)
    print(out.size)


if __name__ == "__main__":
    main()
