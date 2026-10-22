"""Passa o CSS do bancada.html para um sistema de tokens: escala tipográfica, cinzas de texto,
raios e curva de movimento. O jogo (.gx) e a arte das capas (.cover, .brut) ficam de fora,
porque têm tamanhos de propósito (fonte pixel e miniaturas de capa).

Uso: python -I tokens_visuais.py   (na pasta do site)
"""
import re
import sys

ESCALA = [11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64]
CINZA = {  # cinzas de texto soltos -> dois níveis
    "#d4d4d6": "var(--text-2)", "#cfcfcf": "var(--text-2)", "#ddd": "var(--text-2)", "#ccc": "var(--text-2)",
    "#bdbdbd": "var(--text-2)", "#bbb": "var(--text-2)", "#aaa": "var(--muted)", "#999": "var(--muted)",
    "#9a9aa0": "var(--muted)", "#6b6b6b": "var(--muted)",
}
RAIO = {"8px": "var(--r-sm)", "12px": "var(--r-md)", "14px": "var(--r-lg)", "16px": "var(--r-lg)",
        "18px": "var(--r-lg)", "20px": "var(--r-lg)", "999px": "var(--r-pill)"}
TOKENS = """--text-2:#d4d4d4;
--fs-xs:12px;--fs-sm:14px;--fs-base:16px;--fs-lg:18px;--fs-xl:20px;--fs-2xl:24px;--fs-3xl:32px;--fs-4xl:48px;
--sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-5:20px;--sp-6:24px;--sp-8:32px;--sp-10:40px;--sp-12:48px;--sp-16:64px;
--r-sm:8px;--r-md:12px;--r-lg:18px;--r-pill:999px;
--ease:cubic-bezier(.2,.7,.2,1);--dur:.3s;
"""
cont = {"fonte": 0, "cinza": 0, "raio": 0, "curva": 0}


def perto(n):
    return min(ESCALA, key=lambda e: (abs(e - n), -e))


def tamanho(m):
    n = float(m.group(1))
    novo = perto(n)
    if novo != n:
        cont["fonte"] += 1
    return "%dpx" % novo


def regra(m):
    sel, dec = m.group(1), m.group(2)
    if re.search(r"\.gx|\.cover|\.brut|@keyframes|:root|^\s*(from|to|\d+%)", sel):
        return m.group(0)

    def fonte(d):
        txt = d.group(0)
        if "clamp(" in txt or "var(" in txt.split(":", 1)[1] and "px" not in txt:
            return txt
        return re.sub(r"(?<![\d.])(\d+(?:\.\d+)?)px(?=[\s/;!]|$)", tamanho, txt, count=1)
    dec = re.sub(r"(?<![-\w])font(?:-size)?:[^;}]*", fonte, dec)

    def cor(d):
        v = d.group(2).lower()
        if v in CINZA:
            cont["cinza"] += 1
            return d.group(1) + CINZA[v]
        return d.group(0)
    dec = re.sub(r"((?<![-\w])color:)(#[0-9a-fA-F]{3,6})\b", cor, dec)

    def raio(d):
        v = d.group(2).strip()
        if v in RAIO:
            cont["raio"] += 1
            return d.group(1) + RAIO[v]
        return d.group(0)
    dec = re.sub(r"(border-radius:)([^;}!]+)", raio, dec)
    n = dec.count("cubic-bezier(.2,.7,.2,1)")
    cont["curva"] += n
    dec = dec.replace("cubic-bezier(.2,.7,.2,1)", "var(--ease)")
    return sel + "{" + dec + "}"


def main():
    s = open("bancada.html", encoding="utf-8", newline="").read()
    fim = s.index("</style>")
    css = s[:fim]
    if "--fs-xs" not in css:
        css = css.replace("--rail:0px;", "--rail:0px;\n" + TOKENS, 1)
    css = re.sub(r"([^{}]+)\{([^{}]*)\}", regra, css)
    open("bancada.html", "w", encoding="utf-8", newline="").write(css + s[fim:])
    print(cont)


if __name__ == "__main__":
    sys.exit(main())
