"""Importa livros do Wikilivros (pt.wikibooks.org) e dos Wikibooks em outras línguas para leitura dentro do Bancada.

Uso: python -I importar_wikilivros.py <pasta data/livros> [ids...]
O texto dos Wikibooks é CC BY-SA 4.0: o crédito e o link para o original vão junto
de cada livro, e o HTML é simplificado (sem imagens, predefinições e links internos).
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from html.parser import HTMLParser

# língua: (endereço, nome do projeto, autoria, separador entre livro e capítulo nos títulos)
WIKIS = {
    "pt": ("pt.wikibooks.org", "Wikilivros", "Colaboradores do Wikilivros", "/"),
    "es": ("es.wikibooks.org", "Wikilibros", "Colaboradores de Wikilibros", "/"),
    "fr": ("fr.wikibooks.org", "Wikilivres", "Contributeurs de Wikilivres", "/"),
    "de": ("de.wikibooks.org", "Wikibooks", "Wikibooks-Autorinnen und -Autoren", ": "),
}
UA = "BancadaImporter/0.1 (projeto educativo sem fins lucrativos)"

# id, título no Wikilivros, nível, área, resumo, capítulos a pular, aviso[, língua (padrão: pt)[, separador próprio]]
LIVROS = [
    ("eletronica-digital", "Eletrônica Digital", "Intermediário", "Hardware e eletrônica",
     "Sistemas de numeração, álgebra de Boole, portas lógicas e circuitos digitais: a base de tudo que acontece dentro de um chip.",
     [], ""),
    ("arquitetura-computadores", "Introdução à Arquitetura de Computadores", "Avançado", "Hardware e eletrônica",
     "Modelo de Von Neumann, representação numérica, a ULA e o conjunto de instruções MIPS, usado no ensino de arquitetura.",
     ["Capa"], ""),
    ("como-montar-computador", "Como montar um computador", "Básico", "Hardware e eletrônica",
     "Escolha de peças, montagem, instalação do sistema, overclock e manutenção preventiva.",
     ["Capa", "Autores", "Ligações externas", "Imprimir"],
     "Texto escrito por volta de 2008. Os conceitos de montagem continuam valendo, mas modelos, padrões e preços citados estão desatualizados."),
    ("programar-em-c", "Programar em C", "Básico", "Programação",
     "A linguagem C do zero: tipos, operadores, controle de fluxo, funções, ponteiros, vetores, estruturas e arquivos.",
     ["Capa", "Autores", "Imprimir", "Índice", "Índice remissivo"], ""),
    ("python", "Python", "Básico", "Programação",
     "Introdução ao Python: sintaxe, tipos de dados, estruturas de controle, funções, módulos e orientação a objetos.",
     ["Capa", "Autores", "Imprimir", "Índice"], ""),
    ("java", "Java", "Intermediário", "Programação",
     "Java da sintaxe básica à orientação a objetos, com classes, herança, exceções e coleções.",
     ["Capa", "Autores", "Imprimir", "Índice"], ""),
    ("redes-de-computadores", "Redes de computadores", "Básico", "Redes",
     "Como as redes funcionam: modelos em camadas, endereçamento, protocolos e equipamentos.",
     ["Capa", "Autores", "Imprimir", "Índice"], ""),
    # outras línguas: o resumo segue em português, como os demais dados da biblioteca
    ("programacion-en-c", "Programación en C", "Básico", "Programação",
     "A linguagem C em espanhol: compilação, tipos, controle de fluxo, ponteiros, estruturas e arquivos.",
     ["Bibliografía"], "", "es"),
    ("programmation-c", "Programmation C", "Básico", "Programação",
     "A linguagem C em francês: bases, tipos, ponteiros, memória, pré-processador e biblioteca padrão.",
     ["Version imprimable", "Bibliographie"], "", "fr"),
    ("c-programmierung", "C-Programmierung", "Básico", "Programação",
     "A linguagem C em alemão: tipos, operadores, funções, arrays, ponteiros, arquivos e compilação.",
     ["Druckversion"], "", "de"),
    ("linux-praxisbuch", "Linux-Praxisbuch", "Intermediário", "Sistemas operacionais",
     "Linux na prática, em alemão: shell, sistema de arquivos, usuários, rede e administração.",
     [], "", "de", "/ "),
]

KEEP = {"p", "h2", "h3", "h4", "ul", "ol", "li", "dl", "dt", "dd", "b", "strong", "i", "em",
        "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "sub", "sup", "br", "blockquote"}
DROP_TAGS = {"style", "script", "figure", "noscript"}
DROP_CLASSES = {"mw-editsection", "reference", "noprint", "navbox", "toc", "thumb", "mw-references-wrap",
                "printfooter", "metadata", "mbox-small", "ambox", "references", "catlinks"}
VOID = {"br", "img", "hr", "input", "meta", "link", "wbr"}


class Limpa(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0  # profundidade dentro de um elemento descartado

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.skip:
            if tag not in VOID:
                self.skip += 1
            return
        cls = set((a.get("class") or "").split())
        if tag in DROP_TAGS or cls & DROP_CLASSES or a.get("id") == "toc":
            if tag not in VOID:
                self.skip = 1
            return
        if tag == "img":
            alt = a.get("alt", "")
            if "mwe-math-fallback-image" in (a.get("class") or "") and alt:
                self.out.append("<code>" + esc(alt) + "</code>")
            return
        if tag in KEEP:
            self.out.append("<br>" if tag == "br" else "<%s>" % tag)

    def handle_endtag(self, tag):
        if self.skip:
            if tag not in VOID:
                self.skip -= 1
            return
        if tag in KEEP and tag != "br":
            self.out.append("</%s>" % tag)

    def handle_data(self, data):
        if not self.skip:
            self.out.append(esc(data))


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def limpar(html):
    p = Limpa()
    p.feed(html)
    s = "".join(p.out)
    s = re.sub(r"<(p|li|h[234]|td|th)>\s*</\1>", "", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


def api(lingua="pt", **params):
    params.update(format="json", formatversion="2", maxlag="5")
    url = "https://%s/w/api.php?" % WIKIS[lingua][0] + urllib.parse.urlencode(params)
    for tentativa in range(6):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                time.sleep(2)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(15 * (tentativa + 1))
                continue
            raise
    raise RuntimeError("API recusou repetidamente: " + url)


def capitulos(titulo, pular, lingua="pt", sep="/"):
    html = api(lingua, action="parse", page=titulo, prop="text")["parse"]["text"]
    vistos = []
    for href in re.findall(r'href="(/wiki/[^"#?]+)"', html):
        pagina = urllib.parse.unquote(href[len("/wiki/"):]).replace("_", " ")
        if not pagina.startswith(titulo + sep):
            continue
        nome = pagina[len(titulo + sep):]
        # subpáginas de um capítulo (exercícios, partes de impressão) ficam de fora
        if nome not in vistos and nome not in pular and sep not in nome:
            vistos.append(nome)
    return vistos


def main():
    pasta, so = sys.argv[1], set(sys.argv[2:])  # ids opcionais: importa só esses livros
    os.makedirs(pasta, exist_ok=True)
    hoje = date.today().isoformat()
    for id_, titulo, nivel, area, resumo, pular, aviso, *resto in LIVROS:
        if so and id_ not in so:
            continue
        lingua = resto[0] if resto else "pt"
        host, projeto, autoria, sep = WIKIS[lingua]
        sep = resto[1] if len(resto) > 1 else sep
        caps = []
        for nome in capitulos(titulo, pular, lingua, sep):
            pagina = titulo + sep + nome
            d = api(lingua, action="parse", page=pagina, prop="text|revid")
            html = limpar(d["parse"]["text"])
            if len(re.sub(r"<[^>]+>", "", html).strip()) < 80:
                continue  # página vazia ou só de navegação
            caps.append({"t": nome, "html": html})
            print("  ", pagina, len(html))
        livro = {
            "id": id_, "t": titulo, "a": autoria, "nivel": nivel, "area": area,
            "resumo": resumo, "aviso": aviso, "l": "CC BY-SA 4.0",
            "fonte": "https://%s/wiki/" % host + urllib.parse.quote(titulo.replace(" ", "_")),
            "importado": hoje, "caps": caps,
        }
        if lingua != "pt":
            livro.update(i=lingua.upper(), projeto=projeto, sep=sep)
        gravar(pasta, livro, projeto, hoje, separar=lingua != "pt")
        print(titulo, len(caps), "capítulos")


def gravar(pasta, livro, projeto, hoje, separar=False):
    """Grava o livro em data/livros/<id>.js. Com separar, esse arquivo leva só a ficha e os títulos dos
    capítulos, e o texto vai para data/livros/textos/<id>.js, que a página baixa quando o livro é aberto."""
    cab = "// Importado do %s por importar_wikilivros.py em %s. Licença CC BY-SA 4.0.\n" % (projeto, hoje)
    if separar:
        os.makedirs(os.path.join(pasta, "textos"), exist_ok=True)
        with open(os.path.join(pasta, "textos", livro["id"] + ".js"), "w", encoding="utf-8", newline="\n") as f:
            f.write(cab)
            f.write("(window.LIVROS_TEXTO=window.LIVROS_TEXTO||{})[%s]=" % json.dumps(livro["id"]))
            json.dump([c["html"] for c in livro["caps"]], f, ensure_ascii=False, separators=(",", ":"))
            f.write(";\n")
        livro = dict(livro, caps=[{"t": c["t"]} for c in livro["caps"]], textos="data/livros/textos/%s.js" % livro["id"])
    with open(os.path.join(pasta, livro["id"] + ".js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(cab)
        f.write("(window.LIVROS=window.LIVROS||[]).push(")
        json.dump(livro, f, ensure_ascii=False, separators=(",", ":"))
        f.write(");\n")


if __name__ == "__main__":
    main()
