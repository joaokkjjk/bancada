"""Converte a lista PT-BR do free-programming-books em data/biblioteca.js.

Uso: python -I gerar_biblioteca.py <pt_BR.md> <saida.js>
Fonte: github.com/EbookFoundation/free-programming-books (CC BY 4.0)
"""
import json
import re
import sys

FORMATOS = {"PDF", "EPUB", "MOBI", "HTML", "GITBOOK", "AZW3", "ODT", "DOCX", "MARKDOWN", "LATEX", "ZIP"}
LICENCA = re.compile(r"\b(CC|GPL|GFDL|LGPL|MIT|Apache|Dom[ií]nio p[uú]blico)\b", re.I)

# Área do site para cada tema da lista (o restante cai em "Programação")
AREAS = {
    "Agnósticos": None,  # decidido pelo subtema
    "Cloud Computing": "Infraestrutura",
    "IDE and editors": "Ferramentas",
    "Programação": "Fundamentos",
    "Sistemas Operacionais": "Sistemas operacionais",
    "Arduino": "Hardware e eletrônica",
    "Internet das Coisas": "Hardware e eletrônica",
    "Assembly": "Hardware e eletrônica",
    "Banco de Dados": "Dados e IA",
    "Inteligência Artificial": "Dados e IA",
    "R": "Dados e IA",
    "Docker": "Infraestrutura",
    "Kubernetes": "Infraestrutura",
    "Shell / Bash": "Sistemas operacionais",
    "Git": "Ferramentas",
    "LaTeX": "Ferramentas",
    "RegEx": "Ferramentas",
    "Engenharia de Software": "Engenharia de software",
    "Fundamentos Matemáticos Computacionais": "Fundamentos",
    "HTML and CSS": "Web",
    "JavaScript": "Web",
    "TypeScript": "Web",
    "PHP": "Web",
}
# Nível sugerido por tema, só onde a lista permite afirmar com segurança
NIVEIS = {"Arduino": "Básico", "Internet das Coisas": "Básico", "Programação": "Básico",
          "Assembly": "Avançado", "Sistemas Operacionais": "Intermediário",
          "Fundamentos Matemáticos Computacionais": "Intermediário"}
NOMES = {"HTML and CSS": "HTML e CSS", "IDE and editors": "Editores e IDEs", "Shell / Bash": "Shell e Bash"}

ITEM = re.compile(r"^\s*\* \[(?P<t>.+?)\]\((?P<u>[^)\s]+)\)\s*(?:-\s*(?P<r>.*))?$")


def limpar_titulo(s):
    return re.sub(r"<[^>]+>", "", s).replace("\\", "").strip()


def ler(caminho):
    tema = sub = None
    livros = []
    with open(caminho, encoding="utf-8") as f:
        for linha in f:
            linha = linha.rstrip("\n")
            m = re.match(r"^(#{3,4})\s+(.*)$", linha)
            if m:
                nome = limpar_titulo(m.group(2))
                if nome == "Índice":
                    tema = None
                    continue
                if len(m.group(1)) == 3:
                    tema, sub = nome, None
                else:
                    sub = nome
                continue
            if not tema:
                continue
            m = ITEM.match(linha)
            if not m:
                continue
            resto = m.group("r") or ""
            formatos, licencas, notas = [], [], []
            for g in re.findall(r"\(([^()]*)\)", resto):
                g = g.strip().strip("*").strip()
                partes = [p.strip() for p in g.split(",")]
                if g and all(p.upper() in FORMATOS for p in partes):
                    formatos += [p.upper() if p.upper() != "GITBOOK" else "GitBook" for p in partes]
                elif LICENCA.search(g):
                    licencas.append(g)
            # Observações longas da lista usam parênteses aninhados; resumimos as comuns
            if "Leanpub" in resto:
                notas.append("Requer conta grátis no Leanpub")
            if ":construction:" in resto:
                notas.append("Em desenvolvimento")
            autores = re.sub(r"\*?\(.*$", "", resto).strip().rstrip(",").strip()
            if tema == "Agnósticos":
                area = AREAS.get(sub, "Fundamentos")
                nome_tema = NOMES.get(sub, sub)
            else:
                area = AREAS.get(tema, "Programação")
                nome_tema = NOMES.get(tema, tema)
                if sub:
                    nome_tema += " · " + NOMES.get(sub, sub)
            livros.append({
                "t": limpar_titulo(m.group("t")),
                "u": m.group("u"),
                "a": autores,
                "area": area,
                "tema": nome_tema,
                "f": formatos,
                "l": "; ".join(licencas),
                "n": "; ".join(n for n in notas if n),
                "nivel": NIVEIS.get(sub if tema == "Agnósticos" else tema, ""),
                "i": "PT",
            })
    return livros


def main():
    livros = ler(sys.argv[1])
    cab = (
        "// Gerado por gerar_biblioteca.py a partir de free-programming-books (pt_BR).\n"
        "// Lista de origem: github.com/EbookFoundation/free-programming-books, licença CC BY 4.0.\n"
        "// Não edite à mão: rode o script de novo para atualizar.\n"
    )
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write(cab)
        f.write("window.BIBLIOTECA=")
        json.dump(livros, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    areas = {}
    for l in livros:
        areas[l["area"]] = areas.get(l["area"], 0) + 1
    print(len(livros), "livros")
    for a, n in sorted(areas.items(), key=lambda x: -x[1]):
        print(f"  {a}: {n}")


if __name__ == "__main__":
    main()
