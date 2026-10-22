/* Cálculos usados pelos visuais das trilhas e pelo leitor de PDF. Sem acesso à página. */

/** Especificidade CSS aproximada: [IDs, classes/atributos/pseudoclasses, elementos/pseudoelementos]. */
export function especificidade(seletor) {
  const s = seletor
    .replace(/:where\([^)]*\)/g, "")
    .replace(/:(is|not|has)\(/g, " ")
    .replace(/\)/g, " ");
  const a = (s.match(/#[\w-]+/g) || []).length;
  const b = (s.match(/\.[\w-]+|\[[^\]]*\]|(?<!:):(?!:)[\w-]+/g) || []).length;
  const c = (s.replace(/\[[^\]]*\]/g, "").match(/(^|[\s>+~(])[a-zA-Z][\w-]*|::[\w-]+/g) || []).length;
  return [a, b, c];
}

/** Índices escolhidos por lista[inicio:fim:passo] numa lista de tamanho n, com a mesma regra do Python. */
export function fatiaPython(n, inicio, fim, passo) {
  let s;
  let e;
  if (passo > 0) {
    s = inicio < 0 ? Math.max(0, n + inicio) : Math.min(inicio, n);
    e = fim < 0 ? Math.max(0, n + fim) : Math.min(fim, n);
  } else {
    s = inicio < 0 ? Math.max(-1, n + inicio) : Math.min(inicio, n - 1);
    e = fim < 0 ? Math.max(-1, n + fim) : Math.min(fim, n - 1);
  }
  const r = [];
  for (let i = s; passo > 0 ? i < e : i > e; i += passo) r.push(i);
  return r;
}

/** Divisão aproximada em tokens (pedaços de até 4 letras), só para dar noção de tamanho. */
export function dividirTokens(texto) {
  return texto.match(/\s*[A-Za-zÀ-ÿ]{1,4}|\s*\d{1,3}|\s*[^\sA-Za-zÀ-ÿ\d]|\s+/g) || [];
}

/** Probabilidades a partir de pontuações, com temperatura (softmax). */
export function probabilidades(pontos, temperatura) {
  const ex = pontos.map((p) => Math.exp(p / temperatura));
  const soma = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / soma);
}

/** Latência real (ns) e banda (GB/s) de uma memória DDR. */
export function memoria(mts, cl, canais) {
  return { latenciaNs: (cl * 2000) / mts, bandaGBs: (mts * 8 * canais) / 1000 };
}

/**
 * Junta os retângulos de uma seleção de texto ([x, y, largura, altura], de 0 a 1) que estão na mesma linha
 * e se tocam, e arredonda para 4 casas. Devolve uma lista nova, de cima para baixo.
 */
export function juntarRetangulos(rs) {
  const ord = rs.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const j = [];
  for (const r of ord) {
    const u = j[j.length - 1];
    if (u && Math.abs(r[1] - u[1]) < u[3] * 0.5 && r[0] <= u[0] + u[2] + 0.01) {
      const fim = Math.max(u[0] + u[2], r[0] + r[2]);
      const base = Math.max(u[1] + u[3], r[1] + r[3]);
      u[1] = Math.min(u[1], r[1]);
      u[2] = fim - u[0];
      u[3] = base - u[1];
    } else j.push(r.slice());
  }
  return j.map((r) => r.map((v) => Math.round(v * 1e4) / 1e4));
}
