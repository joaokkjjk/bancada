"""Baixa PDFs candidatos e procura a licença no texto das primeiras e últimas páginas.

Uso: python -I verificar_licencas.py <candidatos.json> <pasta de downloads> <relatorio.json> [pasta do pypdf]
candidatos.json: lista de {"t": título, "u": endereço do PDF}
O relatório traz, para cada PDF, o tamanho, o número de páginas e os trechos que citam licença.
A decisão final de quais entram no site é feita à mão a partir do relatório.
"""
import hashlib
import json
import os
import re
import ssl
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

if len(sys.argv) > 4:
    sys.path.insert(0, sys.argv[4])
import pypdf  # noqa: E402

UA = "Mozilla/5.0 (BancadaLicencas/0.1; projeto educativo)"
LIMITE = 15_000_000
PADRAO = re.compile(r"(creative\s*commons|licen[cç]a|license|CC[\s-]?BY[\w\s.-]{0,12}|GNU|dom[ií]nio p[uú]blico|"
                    r"todos os direitos reservados|all rights reserved|proibida a reprodu)", re.I)


def baixar(item, pasta):
    nome = hashlib.sha1(item["u"].encode()).hexdigest()[:12] + ".pdf"
    destino = os.path.join(pasta, nome)
    if not os.path.exists(destino):
        req = urllib.request.Request(item["u"], headers={"User-Agent": UA})
        # Alguns repositórios públicos brasileiros usam cadeia de certificados incompleta;
        # BANCADA_SSL_TOLERANTE=1 aceita esses casos (o conteúdo é só PDF público e passa pela checagem abaixo).
        ctx = ssl._create_unverified_context() if os.environ.get("BANCADA_SSL_TOLERANTE") else None
        with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
            dados = r.read(LIMITE + 1)
        if len(dados) > LIMITE:
            raise ValueError("maior que 15 MB")
        if not dados.startswith(b"%PDF"):
            raise ValueError("não é PDF")
        with open(destino, "wb") as f:
            f.write(dados)
    return destino


def trechos(caminho):
    r = pypdf.PdfReader(caminho)
    n = len(r.pages)
    idx = list(range(min(6, n))) + list(range(max(6, n - 3), n))
    achados = []
    for i in idx:
        try:
            txt = re.sub(r"\s+", " ", r.pages[i].extract_text() or "")
        except Exception:
            continue
        for m in PADRAO.finditer(txt):
            a, b = max(0, m.start() - 90), min(len(txt), m.end() + 140)
            achados.append("p%d: …%s…" % (i + 1, txt[a:b]))
    return n, achados[:8]


def processar(item, pasta):
    try:
        cam = baixar(item, pasta)
        paginas, achados = trechos(cam)
        return dict(item, arquivo=cam, mb=round(os.path.getsize(cam) / 1e6, 1), paginas=paginas, achados=achados)
    except Exception as e:
        return dict(item, erro=str(e)[:120])


def main():
    itens = json.load(open(sys.argv[1], encoding="utf-8"))
    pasta = sys.argv[2]
    os.makedirs(pasta, exist_ok=True)
    with ThreadPoolExecutor(6) as ex:
        rel = list(ex.map(lambda i: processar(i, pasta), itens))
    json.dump(rel, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(sum(1 for r in rel if "erro" not in r), "PDFs lidos de", len(rel))


if __name__ == "__main__":
    main()
