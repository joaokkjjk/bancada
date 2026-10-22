"""Procura livros no eduCAPES e lista os que têm licença Creative Commons e PDF.

Uso: python -I buscar_educapes.py <saida.json> "busca 1" "busca 2" ...
Para cada resultado, lê a página completa do item (?mode=full) e guarda título, autores,
licença (dc.rights / dc.rights.uri), tipo e os PDFs anexados com o tamanho informado.
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://educapes.capes.gov.br"
UA = "Mozilla/5.0 (BancadaBusca/0.1; projeto educativo)"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def buscar(q):
    url = BASE + "/simple-search?" + urllib.parse.urlencode({"query": q, "rpp": 100})
    return list(dict.fromkeys(re.findall(r'href="(/handle/capes/\d+)"', get(url))))


def campo(pagina, nome):
    # rótulos aparecem como "Direitos: dc.rights"; o valor vem na célula seguinte
    vals = re.findall(r'class="metadataFieldLabel[^"]*">[^<]*\b%s</td>\s*<td[^>]*class="metadataFieldValue[^"]*">(.*?)</td>' % re.escape(nome), pagina, re.S)
    return [html.unescape(re.sub(r"<[^>]+>", " ", v)).strip() for v in vals]


def item(handle):
    try:
        p = get(BASE + handle + "?mode=full")
    except Exception as e:
        return {"handle": handle, "erro": str(e)[:80]}
    pdfs = []
    for href, resto in re.findall(r'href="(/bitstream/[^"]+?\.pdf)"(.{0,600})', p, re.S | re.I):
        tam = re.search(r"([\d.,]+\s*[kKMG]B)", resto)
        pdfs.append({"u": BASE + html.unescape(href), "tam": tam.group(1) if tam else ""})
    uniq = {d["u"]: d for d in pdfs}
    return {
        "handle": handle,
        "t": (campo(p, "dc.title") or [""])[0],
        "a": "; ".join(campo(p, "dc.contributor.author") or campo(p, "dc.creator")),
        "rights": " | ".join(campo(p, "dc.rights") + campo(p, "dc.rights.uri") + campo(p, "dc.rights.license")),
        "tipo": "; ".join(campo(p, "dc.type")),
        "ano": (campo(p, "dc.date.issued") or [""])[0],
        "pdfs": list(uniq.values()),
    }


def main():
    saida, buscas = sys.argv[1], sys.argv[2:]
    handles = []
    for q in buscas:
        try:
            handles += buscar(q)
        except Exception as e:
            print("falhou:", q, e)
        time.sleep(1)
    handles = list(dict.fromkeys(handles))
    with ThreadPoolExecutor(4) as ex:
        itens = list(ex.map(item, handles))
    json.dump(itens, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    abertos = [i for i in itens if "creativecommons" in i.get("rights", "").lower() and i.get("pdfs")]
    print(len(itens), "itens;", len(abertos), "com Creative Commons e PDF")


if __name__ == "__main__":
    main()

