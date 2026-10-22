import { describe, expect, it } from "vitest";
import {
  dividirTokens,
  especificidade,
  fatiaPython,
  juntarRetangulos,
  memoria,
  probabilidades,
} from "../../src/logica/calculos.js";

describe("especificidade", () => {
  it.each([
    ["p", [0, 0, 1]],
    ["p.destaque", [0, 1, 1]],
    ["nav a:hover", [0, 1, 2]],
    ["#menu .item", [1, 1, 0]],
    ["ul li::before", [0, 0, 3]],
    ['[type="email"]', [0, 1, 0]],
    ["#topo #logo img", [2, 0, 1]],
    [".a.b.c", [0, 3, 0]],
    ["div > p + span ~ em", [0, 0, 4]],
  ])("%s → %j", (sel, esperado) => {
    expect(especificidade(sel)).toEqual(esperado);
  });
  it(":where não conta e :is/:not contam o argumento", () => {
    expect(especificidade(":where(#x) p")).toEqual([0, 0, 1]);
    expect(especificidade("p:not(.oculto)")).toEqual([0, 1, 1]);
    expect(especificidade("div:is(span)")).toEqual([0, 0, 2]);
  });
  it("texto dentro de um atributo não conta como elemento", () => {
    expect(especificidade('a[title="ola mundo"]')).toEqual([0, 1, 1]);
  });
});

describe("fatiaPython", () => {
  const L = 7;
  it.each([
    [1, 5, 1, [1, 2, 3, 4]],
    [0, 7, 2, [0, 2, 4, 6]],
    [-3, 7, 1, [4, 5, 6]],
    [5, 1, -1, [5, 4, 3, 2]],
    [-1, -8, -1, [6, 5, 4, 3, 2, 1, 0]],
    [1, 5, -1, []],
    [10, 20, 1, []],
    [-20, 2, 1, [0, 1]],
    [0, -2, 1, [0, 1, 2, 3, 4]],
    [0, 0, 1, []],
    [0, -8, -1, [0]],
    [-10, 0, -1, []],
    [20, 0, -1, [6, 5, 4, 3, 2, 1]],
    [6, 0, -1, [6, 5, 4, 3, 2, 1]],
    [6, -3, -1, [6, 5]],
  ])("lista[%i:%i:%i]", (a, b, p, esperado) => {
    expect(fatiaPython(L, a, b, p)).toEqual(esperado);
  });
});

describe("dividirTokens", () => {
  it("quebra palavras longas em pedaços de até 4 letras", () => {
    expect(dividirTokens("informática")).toEqual(["info", "rmát", "ica"]);
  });
  it("mantém o espaço junto do pedaço seguinte e separa pontuação", () => {
    expect(dividirTokens("Oi, tudo")).toEqual(["Oi", ",", " tudo"]);
  });
  it("agrupa números em até 3 dígitos", () => {
    expect(dividirTokens("12345")).toEqual(["123", "45"]);
  });
  it("texto vazio não tem tokens", () => {
    expect(dividirTokens("")).toEqual([]);
  });
  it("espaços antes de pontuação vão junto dela e espaços no fim ficam num pedaço só", () => {
    expect(dividirTokens("a  !")).toEqual(["a", "  !"]);
    expect(dividirTokens("a   ")).toEqual(["a", "   "]);
  });
});

describe("probabilidades", () => {
  it("somam 1 e preservam a ordem", () => {
    const p = probabilidades([3, 1, 0], 1);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(p[0]).toBeGreaterThan(p[1]);
    expect(p[1]).toBeGreaterThan(p[2]);
  });
  it("temperatura baixa concentra na maior pontuação", () => {
    expect(probabilidades([2, 1], 0.1)[0]).toBeGreaterThan(0.99);
  });
  it("temperatura alta espalha", () => {
    const p = probabilidades([2, 1], 100);
    expect(Math.abs(p[0] - p[1])).toBeLessThan(0.01);
  });
  it("pontuações iguais dão probabilidades iguais", () => {
    expect(probabilidades([1, 1, 1, 1], 1)).toEqual([0.25, 0.25, 0.25, 0.25]);
  });
});

describe("memoria", () => {
  it("DDR5-6000 CL30 em dois canais", () => {
    expect(memoria(6000, 30, 2)).toEqual({ latenciaNs: 10, bandaGBs: 96 });
  });
  it("DDR4-3200 CL16 tem a mesma latência", () => {
    expect(memoria(3200, 16, 1).latenciaNs).toBe(10);
    expect(memoria(3200, 16, 1).bandaGBs).toBeCloseTo(25.6);
  });
});

describe("juntarRetangulos", () => {
  it("junta pedaços vizinhos da mesma linha", () => {
    expect(
      juntarRetangulos([
        [0.3, 0.1, 0.1, 0.02],
        [0.1, 0.1, 0.2, 0.02],
      ]),
    ).toEqual([[0.1, 0.1, 0.3, 0.02]]);
  });
  it("mantém linhas diferentes separadas, de cima para baixo", () => {
    expect(
      juntarRetangulos([
        [0.1, 0.2, 0.5, 0.02],
        [0.1, 0.1, 0.5, 0.02],
      ]),
    ).toEqual([
      [0.1, 0.1, 0.5, 0.02],
      [0.1, 0.2, 0.5, 0.02],
    ]);
  });
  it("não junta pedaços distantes na mesma linha", () => {
    expect(
      juntarRetangulos([
        [0.1, 0.1, 0.1, 0.02],
        [0.5, 0.1, 0.1, 0.02],
      ]).length,
    ).toBe(2);
  });
  it("estende a altura quando o pedaço é mais alto e arredonda em 4 casas", () => {
    expect(
      juntarRetangulos([
        [0.1, 0.1, 0.2, 0.02],
        [0.3, 0.105, 0.123456, 0.03],
      ]),
    ).toEqual([[0.1, 0.1, 0.3235, 0.035]]);
  });
  it("não altera a lista original, nem a ordem nem os retângulos", () => {
    const orig = [
      [0.3, 0.1, 0.1, 0.02],
      [0.1, 0.1, 0.2, 0.02],
    ];
    juntarRetangulos(orig);
    expect(orig).toEqual([
      [0.3, 0.1, 0.1, 0.02],
      [0.1, 0.1, 0.2, 0.02],
    ]);
  });
  it("só junta quando a diferença de altura é menor que metade da linha", () => {
    expect(
      juntarRetangulos([
        [0.1, 0.5, 0.2, 0.25],
        [0.3, 0.625, 0.1, 0.25],
      ]).length,
    ).toBe(2);
    expect(
      juntarRetangulos([
        [0.1, 0.1, 0.2, 0.02],
        [0.3, 0.115, 0.1, 0.02],
      ]).length,
    ).toBe(2);
  });
  it("junta pedaços encostados no limite de 0,01", () => {
    expect(
      juntarRetangulos([
        [0.25, 0.5, 0.25, 0.02],
        [0.51, 0.5, 0.1, 0.02],
      ]),
    ).toEqual([[0.25, 0.5, 0.36, 0.02]]);
  });
  it("mantém a largura e a altura do pedaço maior ao juntar", () => {
    expect(
      juntarRetangulos([
        [0.1, 0.1, 0.5, 0.04],
        [0.2, 0.1, 0.1, 0.02],
      ]),
    ).toEqual([[0.1, 0.1, 0.5, 0.04]]);
  });
});
