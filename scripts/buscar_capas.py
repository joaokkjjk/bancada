"""Procura a capa de cada livro externo da biblioteca e gera data/capas.js.

Uso: python -I buscar_capas.py <pasta do projeto>
1. Lê a imagem de compartilhamento (og:image) da página do livro e aceita só imagens
   em pé (altura >= 1,2 x largura), que costumam ser capas; banners e logos ficam de fora.
2. Se não achar, procura o título na Open Library.
Livros sem capa encontrada continuam com a capa gerada pelo site.
"""
import hashlib
import json
import os
import re
import struct
import sys
import unicodedata
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (BancadaCapas/0.1; projeto educativo)"
MAX_PAGINA = 1_500_000
MAX_IMG = 450_000


def baixar(url, limite):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20) as r:
        tipo = r.headers.get("Content-Type", "")
        dados = r.read(limite + 1)
        return tipo, dados, r.geturl()


def dimensoes(b):
    """Largura e altura de PNG, JPEG, GIF ou WebP, sem bibliotecas externas."""
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    if b[:6] in (b"GIF87a", b"GIF89a"):
        return struct.unpack("<HH", b[6:10])
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        if b[12:16] == b"VP8 ":
            w, h = struct.unpack("<HH", b[26:30])
            return w & 0x3FFF, h & 0x3FFF
        if b[12:16] == b"VP8L":
            v = int.from_bytes(b[21:25], "little")
            return (v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1
        if b[12:16] == b"VP8X":
            return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
    if b[:2] == b"\xff\xd8":
        i = 2
        while i < len(b) - 9:
            if b[i] != 0xFF:
                i += 1
                continue
            m = b[i + 1]
            if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack(">HH", b[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", b[i + 2:i + 4])[0]
    return None


def extensao(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if b[:4] == b"RIFF":
        return ".webp"
    if b[:3] == b"GIF":
        return ".gif"
    if b[:2] == b"\xff\xd8":
        return ".jpg"
    return None


def capa_ok(b):
    if len(b) > MAX_IMG or not extensao(b):
        return False
    d = dimensoes(b)
    return bool(d) and d[0] >= 120 and d[1] >= d[0] * 1.2


def og_image(url):
    if url.lower().split("?")[0].endswith(".pdf"):
        return None
    tipo, html, final = baixar(url, MAX_PAGINA)
    if "html" not in tipo:
        return None
    html = html.decode("utf-8", "replace")
    for prop in ("og:image", "twitter:image", "og:image:url"):
        m = re.search(r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]*>' % re.escape(prop), html, re.I)
        if m:
            c = re.search(r'content=["\']([^"\']+)', m.group(0))
            if c:
                return urllib.parse.urljoin(final, c.group(1).replace("&amp;", "&"))
    return None


def normal(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return re.sub(r"[^a-z0-9]+", " ", "".join(c for c in s if not unicodedata.combining(c))).strip()


def open_library(titulo):
    q = urllib.parse.urlencode({"title": titulo, "limit": 5, "fields": "title,cover_i"})
    _, dados, _ = baixar("https://openlibrary.org/search.json?" + q, 500_000)
    for doc in json.loads(dados).get("docs", []):
        if doc.get("cover_i") and normal(doc.get("title", "")) == normal(titulo):
            return "https://covers.openlibrary.org/b/id/%d-M.jpg" % doc["cover_i"]
    return None


def google_books(titulo, autor):
    q = 'intitle:"%s"' % titulo
    if autor:
        q += ' inauthor:"%s"' % autor.split(",")[0].strip()
    _, dados, _ = baixar("https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode({"q": q, "maxResults": 5}), 800_000)
    for v in json.loads(dados).get("items", []):
        info = v.get("volumeInfo", {})
        img = info.get("imageLinks", {}).get("thumbnail")
        if img and normal(info.get("title", "")) == normal(titulo):
            return img.replace("http://", "https://").replace("&edge=curl", "")
    return None


def procurar(item):
    url, titulo, autor = item["u"], item["t"], item.get("a", "")
    for fonte in (lambda: og_image(url), lambda: open_library(titulo), lambda: google_books(titulo, autor)):
        try:
            img = fonte()
            if not img:
                continue
            _, b, _ = baixar(img, MAX_IMG)
            if capa_ok(b):
                return url, b, img
        except Exception:
            continue
    return url, None, None


def ler_lista(caminho, var):
    s = open(caminho, encoding="utf-8").read()
    if var == "BIBLIOTECA":
        return json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))
    # biblioteca-hardware.js é JS escrito à mão: extraímos só u e t
    return [{"u": u, "t": t.replace('\\u201c', "“").replace('\\u201d', "”"), "a": a}
            for t, u, a in re.findall(r'\{t:"((?:[^"\\]|\\.)*)",u:"([^"]+)",a:"([^"]*)"', s)]


def main():
    raiz = sys.argv[1]
    itens = ler_lista(os.path.join(raiz, "public", "data", "biblioteca.js"), "BIBLIOTECA")
    itens += ler_lista(os.path.join(raiz, "public", "data", "biblioteca-hardware.js"), "BIBLIOTECA_HW")
    pasta = os.path.join(raiz, "public", "data", "capas")
    os.makedirs(pasta, exist_ok=True)
    mapa = {}
    with ThreadPoolExecutor(8) as ex:
        for url, b, origem in ex.map(procurar, itens):
            if not b:
                continue
            nome = hashlib.sha1(url.encode()).hexdigest()[:12] + extensao(b)
            with open(os.path.join(pasta, nome), "wb") as f:
                f.write(b)
            mapa[url] = {"img": "data/capas/" + nome, "de": origem}
            print("capa:", url)
    with open(os.path.join(raiz, "public", "data", "capas.js"), "w", encoding="utf-8") as f:
        f.write("// Gerado por buscar_capas.py: capa encontrada para cada link (img local e endereço de origem).\n")
        f.write("window.CAPAS=")
        json.dump(mapa, f, ensure_ascii=False, indent=0)
        f.write(";\n")
    print(len(mapa), "capas de", len(itens), "itens")


if __name__ == "__main__":
    main()
