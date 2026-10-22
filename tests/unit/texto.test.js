import { describe, expect, it } from "vitest";
import { buscar, pad, semAcento } from "../../src/logica/texto.js";

describe("semAcento", () => {
  it("tira acentos e passa para minúsculas", () => {
    expect(semAcento("Memória ÇÃO Ênfase")).toBe("memoria cao enfase");
  });
  it("aceita valores vazios", () => {
    expect(semAcento(undefined)).toBe("");
    expect(semAcento(null)).toBe("");
  });
});

describe("pad", () => {
  it("completa com zero abaixo de 10", () => {
    expect(pad(3)).toBe("03");
    expect(pad(0)).toBe("00");
  });
  it("mantém dois dígitos ou mais", () => {
    expect(pad(10)).toBe("10");
    expect(pad(123)).toBe("123");
  });
});

describe("buscar", () => {
  const item = (t, s = "") => ({ t, k: semAcento(`${t} ${s}`) });
  const indice = [
    item("Cache", "memória rápida dentro da CPU"),
    item("Memória RAM", "memória de trabalho"),
    item("Processador", "executa instruções e usa cache"),
  ];

  it("devolve lista vazia sem termos", () => {
    expect(buscar(indice, "   ")).toEqual([]);
  });
  it("exige todos os termos", () => {
    expect(buscar(indice, "memoria trabalho").map((x) => x.t)).toEqual(["Memória RAM"]);
  });
  it("ignora acentos na busca", () => {
    expect(buscar(indice, "MEMÓRIA").length).toBe(2);
  });
  it("prioriza o termo no começo do título, depois no título, depois só no texto", () => {
    expect(buscar(indice, "cache").map((x) => x.t)).toEqual(["Cache", "Processador"]);
    const outro = [item("Sobre cache", ""), item("Cache L1", ""), item("Nada", "cache")];
    expect(buscar(outro, "cache").map((x) => x.t)).toEqual(["Cache L1", "Sobre cache", "Nada"]);
  });
  it("o termo no meio do título vale mais que só no texto, independentemente da ordem do índice", () => {
    const lista = [item("Nada aqui", "cache"), item("Sobre cache", "")];
    expect(buscar(lista, "cache").map((x) => x.t)).toEqual(["Sobre cache", "Nada aqui"]);
  });
  it("soma pontos de vários termos", () => {
    const dois = [item("RAM e cache", ""), item("Cache", "ram")];
    expect(buscar(dois, "cache ram").map((x) => x.t)).toEqual(["RAM e cache", "Cache"]);
  });
});
