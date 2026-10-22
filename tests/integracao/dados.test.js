/* Confere o conteúdo carregado pela página: os mesmos scripts de public/data, na mesma ordem do index.html. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const raiz = join(import.meta.dirname, "..", "..");
const html = readFileSync(join(raiz, "index.html"), "utf8");
const app = readFileSync(join(raiz, "src", "app.js"), "utf8");
// modelos3d.js depende do Three.js e é coberto pelos testes de ponta a ponta
const scripts = [...html.matchAll(/<script src="(data\/[^"]+)"/g)].map((m) => m[1]).filter((s) => !/modelos3d/.test(s));
const ctx = { window: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(readFileSync(join(raiz, "public", s), "utf8"), ctx, { filename: s });
const { TRILHAS, G, GU, P, BIBLIOTECA_PDF, LIVROS, VARIANTES } = ctx;
const BLOCOS = ["txt", "vis", "fato", "dica"];
const NIVEIS = ["Básico", "Intermediário", "Avançado"];

describe("index.html", () => {
  it("todo script de dados existe", () => {
    for (const s of scripts) expect(existsSync(join(raiz, "public", s)), s).toBe(true);
  });
});

describe("trilhas", () => {
  const ids = Object.keys(TRILHAS);

  it("tem as 7 trilhas", () => {
    expect(ids.sort()).toEqual(["armazenamento", "cpu", "html", "ia", "pc", "python", "ram"]);
  });

  for (const id of ids) {
    const t = TRILHAS[id];
    describe(t.n, () => {
      it("tem 6 módulos: 2 básicos, 2 intermediários e 2 avançados", () => {
        expect(t.modulos.map((m) => m.nivel)).toEqual([
          NIVEIS[0],
          NIVEIS[0],
          NIVEIS[1],
          NIVEIS[1],
          NIVEIS[2],
          NIVEIS[2],
        ]);
      });
      it("cada módulo tem nome, resumo, tempo e blocos válidos", () => {
        for (const m of t.modulos) {
          expect(m.n && m.resumo && m.min > 0).toBeTruthy();
          for (const b of m.blocos) expect(BLOCOS, `${m.n}: bloco ${b.t}`).toContain(b.t);
        }
      });
      it("todo visual usado existe no app", () => {
        const vis = t.modulos.flatMap((m) => m.blocos.filter((b) => b.t === "vis").map((b) => b.id));
        for (const v of vis) expect(new RegExp(`\\n\\s+${v}: \\(`).test(app), `visual ${v}`).toBe(true);
      });
      it("as questões são válidas e não entregam a resposta", () => {
        for (const m of t.modulos) {
          expect(m.q.length, m.n).toBeGreaterThanOrEqual(5);
          for (const q of m.q) {
            expect(q.o.length, q.p).toBe(4);
            expect(new Set(q.o).size, `alternativas repetidas: ${q.p}`).toBe(4);
            expect(q.c, q.p).toBeGreaterThanOrEqual(0);
            expect(q.c, q.p).toBeLessThan(4);
            expect(q.e.length, q.p).toBeGreaterThan(20);
            const tam = q.o.map((o) => o.length);
            const outras = Math.max(...tam.filter((_, i) => i !== q.c));
            expect(tam[q.c], `certa longa demais: ${q.p}`).toBeLessThanOrEqual(outras * 1.15);
          }
        }
      });
      it("a posição da resposta certa varia", () => {
        const pos = new Set(t.modulos.flatMap((m) => m.q.map((q) => q.c)));
        expect(pos.size).toBe(4);
      });
    });
  }
});

describe("glossário", () => {
  it("tem pelo menos 300 termos sem repetição", () => {
    expect(G.length).toBeGreaterThanOrEqual(300);
    expect(new Set(G.map((x) => x[0].toLowerCase())).size).toBe(G.length);
  });
  it("todo termo tem definição e categoria", () => {
    for (const [t, d, c] of G) expect(t && d && c, t).toBeTruthy();
  });
});

describe("guias e peças", () => {
  it("guias têm nome, categoria e descrição", () => {
    for (const g of GU) expect(g.n && g.cat && g.d, g.n).toBeTruthy();
  });
  it("peças têm id único e variantes", () => {
    expect(new Set(P.map((p) => p.id)).size).toBe(P.length);
    for (const p of P) expect(VARIANTES[p.id]?.lista.length, p.id).toBeGreaterThan(0);
  });
});

describe("biblioteca", () => {
  it("todo PDF e toda capa existem no disco", () => {
    for (const b of BIBLIOTECA_PDF) {
      expect(existsSync(join(raiz, "public", b.arquivo)), b.arquivo).toBe(true);
      expect(existsSync(join(raiz, "public", b.capa)), b.capa).toBe(true);
      expect(b.l, `licença de ${b.id}`).toBeTruthy();
    }
  });
  it("ids de livros e PDFs não se repetem", () => {
    const ids = [...LIVROS.map((l) => l.id), ...BIBLIOTECA_PDF.map((b) => b.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("livros para ler no site têm capítulos com conteúdo", () => {
    for (const l of LIVROS) {
      expect(l.caps.length, l.id).toBeGreaterThan(0);
      for (const c of l.caps) expect(c.t && c.html.length > 50, `${l.id}: ${c.t}`).toBeTruthy();
    }
  });
});
