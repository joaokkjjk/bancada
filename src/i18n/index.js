/* Línguas da interface. t(chave, vars) devolve o texto na língua atual, com {n}, {x} etc. trocados.
   Um texto com "|" tem singular e plural, escolhidos por vars.n. Chave ausente cai para o português. */
import de from "./de.js";
import en from "./en.js";
import es from "./es.js";
import fr from "./fr.js";
import pt from "./pt.js";

export const DICIONARIOS = { pt, en, es, fr, de };
export const LINGUAS = [
  { id: "pt", curto: "PT", html: "pt-BR" },
  { id: "en", curto: "EN", html: "en" },
  { id: "es", curto: "ES", html: "es" },
  { id: "fr", curto: "FR", html: "fr" },
  { id: "de", curto: "DE", html: "de" },
];
const CHAVE = "bancada-lingua";

/* Primeira visita: a primeira língua do navegador que o site tem; senão, português. */
export function linguaInicial(salva, preferidas) {
  if (salva && DICIONARIOS[salva]) return salva;
  for (const p of preferidas || []) {
    const id = String(p).slice(0, 2).toLowerCase();
    if (DICIONARIOS[id]) return id;
  }
  return "pt";
}

function lerSalva() {
  try {
    return localStorage.getItem(CHAVE);
  } catch (_) {
    return null;
  }
}

let atual = linguaInicial(
  lerSalva(),
  typeof navigator === "undefined" ? [] : navigator.languages || [navigator.language],
);

export function lingua() {
  return atual;
}

export function definirLingua(id) {
  if (!DICIONARIOS[id]) return;
  atual = id;
  try {
    localStorage.setItem(CHAVE, id);
  } catch (_) {
    /* sem armazenamento: vale só nesta visita */
  }
}

export function formatar(texto, vars) {
  let s = texto;
  if (s.includes("|")) {
    const [um, varios] = s.split("|");
    s = vars && Number(vars.n) === 1 ? um : varios;
  }
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}

export function t(chave, vars, id) {
  const d = DICIONARIOS[id || atual];
  const texto = d[chave] ?? pt[chave] ?? chave;
  return formatar(texto, vars);
}

/* Texto de um valor dos dados (nível, área, formato): traduz quando há chave com um dos prefixos,
   senão mostra o próprio valor. */
export function tv(prefixos, valor) {
  for (const p of [].concat(prefixos)) {
    const chave = p + "." + valor;
    if (chave in pt) return t(chave);
  }
  return valor;
}
