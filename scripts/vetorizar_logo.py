"""Vetoriza o símbolo do Bancada (harpia) a partir da imagem de referência da identidade visual.

Uso: python -I vetorizar_logo.py <imagem> <saida.svg> [pasta com pillow/numpy/potracer]
Recorta o símbolo, amplia, binariza (branco = símbolo) e traça curvas com o potrace.
"""
import os
import sys

if len(sys.argv) > 3:
    sys.path.insert(0, sys.argv[3])
import numpy as np  # noqa: E402
import potrace  # noqa: E402
from PIL import Image, ImageFilter  # noqa: E402

CORTE = (290, 55, 480, 320)  # símbolo branco sobre preto, no quadro principal da referência
ESC = 6


def main():
    im = Image.open(sys.argv[1]).convert("L").crop(CORTE)
    im = im.resize((im.width * ESC, im.height * ESC), Image.LANCZOS).filter(ImageFilter.GaussianBlur(ESC * .6))
    bits = np.array(im) <= 128  # o potracer preenche onde o valor é falso: o símbolo branco vira a forma
    plano = potrace.Bitmap(bits).trace(turdsize=40 * ESC, alphamax=1.0, opticurve=True, opttolerance=0.4)
    partes = []
    for curva in plano:
        p = curva.start_point
        d = ["M%.1f %.1f" % (p.x, p.y)]
        for seg in curva.segments:
            if seg.is_corner:
                d.append("L%.1f %.1f L%.1f %.1f" % (seg.c.x, seg.c.y, seg.end_point.x, seg.end_point.y))
            else:
                d.append("C%.1f %.1f %.1f %.1f %.1f %.1f" % (seg.c1.x, seg.c1.y, seg.c2.x, seg.c2.y, seg.end_point.x, seg.end_point.y))
        partes.append("".join(d) + "Z")
    w, h = im.size
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"><path fill="currentColor" fill-rule="evenodd" d="%s"/></svg>'
           % (w, h, "".join(partes)))
    open(sys.argv[2], "w", encoding="utf-8").write(svg)
    print(len(plano), "curvas;", round(len(svg) / 1024, 1), "KB")


if __name__ == "__main__":
    main()
