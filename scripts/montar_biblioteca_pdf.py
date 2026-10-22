"""Monta a biblioteca de PDFs do Bancada: baixa cada PDF, gera a capa a partir da 1ª página e escreve data/biblioteca-pdf.js.

Uso: python -I montar_biblioteca_pdf.py <pasta do projeto> <livros.json> [pasta das bibliotecas pypdfium2/pillow]
livros.json: lista de livros com licença conferida à mão (ver scripts/livros-abertos.json).
Campos: id, t (título), a (autores), nivel, area, l (licença), i (PT/EN), fonte (página oficial), pdf (endereço do PDF).
Só entram PDFs de até 15 MB, que é o limite por arquivo do artifact.
"""
import json
import os
import ssl
import sys
import urllib.request

if len(sys.argv) > 3:
    sys.path.insert(0, sys.argv[3])
import pypdfium2 as pdfium  # noqa: E402

UA = "Mozilla/5.0 (BancadaBiblioteca/0.1; projeto educativo)"
LIMITE = 15_000_000


def baixar(url, destino):
    if os.path.exists(destino):
        return
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    # alguns repositórios públicos brasileiros têm cadeia de certificados incompleta
    with urllib.request.urlopen(req, timeout=120, context=ssl._create_unverified_context()) as r:
        dados = r.read(LIMITE + 1)
    if len(dados) > LIMITE:
        raise ValueError("maior que 15 MB")
    if not dados.startswith(b"%PDF"):
        raise ValueError("não é PDF")
    with open(destino, "wb") as f:
        f.write(dados)


def capa(pdf, destino):
    doc = pdfium.PdfDocument(pdf)
    pag = doc[0]
    escala = 420 / pag.get_width()
    img = pag.render(scale=escala).to_pil().convert("RGB")
    img.save(destino, "JPEG", quality=80, optimize=True)
    return len(doc)


def main():
    raiz, lista = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8"))
    os.makedirs(os.path.join(raiz, "data", "pdfs"), exist_ok=True)
    os.makedirs(os.path.join(raiz, "data", "capas"), exist_ok=True)
    saida = []
    for b in lista:
        pdf = os.path.join(raiz, "data", "pdfs", b["id"] + ".pdf")
        try:
            baixar(b["pdf"], pdf)
            paginas = capa(pdf, os.path.join(raiz, "data", "capas", b["id"] + ".jpg"))
        except Exception as e:
            print("FORA:", b["id"], e)
            continue
        item = {k: b[k] for k in ("id", "t", "a", "nivel", "area", "l", "i", "fonte")}
        item.update(arquivo="data/pdfs/%s.pdf" % b["id"], capa="data/capas/%s.jpg" % b["id"],
                    paginas=paginas, mb=round(os.path.getsize(pdf) / 1e6, 1))
        if b.get("sem_capa"):  # 1ª página só com texto: o site gera a capa
            item["capa"] = None
        saida.append(item)
        print("ok:", b["id"], paginas, "páginas")
    with open(os.path.join(raiz, "data", "biblioteca-pdf.js"), "w", encoding="utf-8") as f:
        f.write("// Gerado por montar_biblioteca_pdf.py: livros em PDF hospedados no Bancada, com licença aberta conferida.\n")
        f.write("window.BIBLIOTECA_PDF=")
        json.dump(saida, f, ensure_ascii=False, indent=0)
        f.write(";\n")
    print(len(saida), "livros em PDF;", round(sum(i["mb"] for i in saida), 1), "MB")


if __name__ == "__main__":
    main()
