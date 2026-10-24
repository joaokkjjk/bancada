import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DICIONARIOS, definirLingua, formatar, LINGUAS, lingua, linguaInicial, t, tv } from "../../src/i18n/index.js";

const pt = DICIONARIOS.pt;
const chaves = Object.keys(pt).sort();
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("dicionários", () => {
  it("as cinco línguas estão na lista e têm dicionário", () => {
    expect(LINGUAS.map((l) => l.id)).toEqual(["pt", "en", "es", "fr", "de"]);
    LINGUAS.forEach((l) => {
      expect(DICIONARIOS[l.id]).toBeTypeOf("object");
    });
  });

  it.each(LINGUAS.map((l) => l.id))("%s tem exatamente as mesmas chaves do português", (id) => {
    expect(Object.keys(DICIONARIOS[id]).sort()).toEqual(chaves);
  });

  it.each(LINGUAS.map((l) => l.id))("%s não tem texto vazio e mantém os mesmos {marcadores}", (id) => {
    const d = DICIONARIOS[id];
    chaves.forEach((k) => {
      expect(d[k].trim(), k).not.toBe("");
      expect(vars(d[k]), k).toEqual(vars(pt[k]));
      expect(d[k].includes("|"), k + " (singular|plural)").toBe(pt[k].includes("|"));
    });
  });

  it("toda chave usada no app.js e no index.html existe", () => {
    const app = readFileSync("src/app.js", "utf8");
    const html = readFileSync("index.html", "utf8");
    const usadas = [
      ...[...app.matchAll(/\bt\("([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/data-t(?:-aria|-ph)?="([^"]+)"/g)].map((m) => m[1]),
    ];
    expect(usadas.length).toBeGreaterThan(150);
    // "busca.grupo." + id: uma chave terminada em ponto é um prefixo, completado no código
    const falta = (k) => (k.endsWith(".") ? !chaves.some((c) => c.startsWith(k)) : !(k in pt));
    expect(usadas.filter(falta)).toEqual([]);
  });

  it("cada língua tem o próprio nome e sigla", () => {
    const nomes = LINGUAS.map((l) => t("lingua.nome", null, l.id));
    expect(nomes).toEqual(["Português", "English", "Español", "Français", "Deutsch"]);
    expect(LINGUAS.map((l) => l.curto)).toEqual(["PT", "EN", "ES", "FR", "DE"]);
  });

  it("termos técnicos seguem o uso de cada língua, não a tradução literal", () => {
    expect(t("pecas.titulo", null, "en")).toBe("Open the case.");
    expect(t("pecas.titulo", null, "fr")).toBe("Ouvrez le boîtier.");
    expect(t("pecas.titulo", null, "de")).toBe("Öffne das Gehäuse.");
    expect(t("area.Sistemas operacionais", null, "es")).toBe("Sistemas operativos");
  });
});

describe("formatar", () => {
  it("troca os marcadores pelos valores", () => {
    expect(formatar("Módulo {n} de {t}", { n: 2, t: 6 })).toBe("Módulo 2 de 6");
  });
  it("deixa o marcador sem valor como está", () => {
    expect(formatar("{a} e {b}", { a: 1 })).toBe("1 e {b}");
  });
  it("sem valores, devolve o texto", () => {
    expect(formatar("Olá {x}")).toBe("Olá {x}");
  });
  it("escolhe singular com 1 e plural com o resto", () => {
    const s = "{n} livro|{n} livros";
    expect(formatar(s, { n: 1 })).toBe("1 livro");
    expect(formatar(s, { n: "1" })).toBe("1 livro");
    expect(formatar(s, { n: 0 })).toBe("0 livros");
    expect(formatar(s, { n: 12 })).toBe("12 livros");
    expect(formatar(s)).toBe("{n} livros");
  });
});

describe("linguaInicial", () => {
  it("usa a língua salva quando existe", () => {
    expect(linguaInicial("de", ["en-US"])).toBe("de");
  });
  it("ignora uma língua salva que o site não tem", () => {
    expect(linguaInicial("it", ["fr-CA"])).toBe("fr");
  });
  it("pega a primeira língua do navegador que o site tem", () => {
    expect(linguaInicial(null, ["it-IT", "ES-mx", "en"])).toBe("es");
  });
  it("cai para o português", () => {
    expect(linguaInicial(null, ["ja-JP"])).toBe("pt");
    expect(linguaInicial(null, undefined)).toBe("pt");
    expect(linguaInicial(undefined, [])).toBe("pt");
  });
});

describe("t, tv e a língua atual", () => {
  const guardado = {};
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (k) => guardado[k] ?? null,
      setItem: (k, v) => {
        guardado[k] = v;
      },
    });
  });
  afterEach(() => {
    definirLingua("pt");
    vi.unstubAllGlobals();
  });

  it("em português, devolve o texto de referência", () => {
    definirLingua("pt");
    expect(lingua()).toBe("pt");
    expect(t("nav.livros")).toBe("Livros");
  });
  it("troca de língua e guarda a escolha", () => {
    definirLingua("en");
    expect(lingua()).toBe("en");
    expect(guardado["bancada-lingua"]).toBe("en");
    expect(t("comum.livros", { n: 3 })).toBe("3 books");
  });
  it("ignora uma língua desconhecida", () => {
    definirLingua("fr");
    definirLingua("xx");
    expect(lingua()).toBe("fr");
  });
  it("continua funcionando sem armazenamento", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("bloqueado");
      },
    });
    definirLingua("de");
    expect(lingua()).toBe("de");
  });
  it("aceita a língua como terceiro argumento", () => {
    definirLingua("pt");
    expect(t("nav.jogo", null, "es")).toBe("Juego");
    expect(lingua()).toBe("pt");
  });
  it("chave desconhecida volta como a própria chave", () => {
    expect(t("nao.existe")).toBe("nao.existe");
  });
  it("tv traduz valores dos dados e deixa os outros como estão", () => {
    definirLingua("de");
    expect(tv("comum.nivel", "Avançado")).toBe("Fortgeschritten");
    expect(tv(["comum.nivel", "area", "formato"], "Redes")).toBe("Netzwerke");
    expect(tv(["comum.nivel", "formato"], "Texto")).toBe("Text");
    expect(tv("area", "Robótica")).toBe("Robótica");
  });
});
