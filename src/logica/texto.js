/* Funções de texto sem dependência da página: normalização, números com dois dígitos e busca. */

/** Minúsculas e sem acentos, para comparar textos em português. */
export function semAcento(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** 1 → "01"; usado na numeração de questões e módulos. */
export function pad(n) {
  return (n < 10 ? "0" : "") + n;
}

/**
 * Busca em itens já indexados ({t: título, k: texto normalizado}).
 * Todos os termos precisam aparecer; termos no título valem mais, e no começo do título mais ainda.
 */
export function buscar(indice, q) {
  const termos = semAcento(q).split(/\s+/).filter(Boolean);
  if (!termos.length) return [];
  return indice
    .map((x) => {
      const nt = semAcento(x.t);
      let pts = 0;
      for (const termo of termos) {
        if (x.k.indexOf(termo) < 0) return null;
        const pos = nt.indexOf(termo);
        pts += pos === 0 ? 5 : pos > 0 ? 3 : 1;
      }
      return { x, p: pts };
    })
    .filter(Boolean)
    .sort((a, b) => b.p - a.p)
    .map((o) => o.x);
}
