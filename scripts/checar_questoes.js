// Confere se as questões não entregam a resposta: tamanho da alternativa certa contra as outras
// e distribuição da posição da certa. Com --balancear, reposiciona a certa (A, B, C, D em rodízio)
// e reescreve os arquivos; listas numéricas ficam em ordem crescente.
// Uso: node scripts/checar_questoes.js [--balancear]
const fs = require("fs");
global.window = {};
require("../data/trilhas/cpu.js");
require("../data/questoes.js");
const listas = [];
window.TRILHAS.cpu.modulos.forEach(m => listas.push(...m.q));
listas.push(...window.QUESTOES);
const num = s => /^[\d,.]+\s*(%|ns|GB|MB|vezes|ciclos?)?/.test(s) && !/[a-z]{6,}/i.test(s.replace(/^[\d,.]+\s*\S*/, ""));
if (process.argv.includes("--balancear")) {
  let alvo = 0;
  listas.forEach(q => {
    const certa = q.o[q.c];
    if (q.o.every(num)) {
      q.o.sort((a, b) => parseFloat(a.replace(",", ".")) - parseFloat(b.replace(",", ".")));
      q.c = q.o.indexOf(certa);
      return;
    }
    const t = alvo++ % 4;
    [q.o[q.c], q.o[t]] = [q.o[t], q.o[q.c]];
    q.c = t;
  });
  // grava de volta
  const js = o => JSON.stringify(o);
  let cpu = fs.readFileSync("data/trilhas/cpu.js", "utf8");
  window.TRILHAS.cpu.modulos.forEach(m => m.q.forEach(q => {
    const re = new RegExp('\\{"p":\\s*' + JSON.stringify(q.p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '[^\\n]*?"e":\\s*' + JSON.stringify(q.e).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}");
    cpu = cpu.replace(re, js({ p: q.p, o: q.o, c: q.c, e: q.e }));
  }));
  fs.writeFileSync("data/trilhas/cpu.js", cpu);
  let qs = fs.readFileSync("data/questoes.js", "utf8");
  const ini = qs.indexOf("window.QUESTOES=");
  qs = qs.slice(0, ini) + "window.QUESTOES=[\n" + window.QUESTOES.map(q => "{tema:" + js(q.tema) + ",nivel:" + js(q.nivel) + ",p:" + js(q.p) + ",o:" + js(q.o) + ",c:" + q.c + ",e:" + js(q.e) + "}").join(",\n") + "\n];\n";
  fs.writeFileSync("data/questoes.js", qs);
}
const pos = [0, 0, 0, 0];
const longas = [];
let maior = 0;
listas.forEach(q => {
  pos[q.c]++;
  const outras = q.o.filter((_, i) => i !== q.c).map(s => s.length);
  const media = outras.reduce((a, b) => a + b, 0) / outras.length;
  const r = q.o[q.c].length / media;
  if (q.o[q.c].length === Math.max(...q.o.map(s => s.length)) && q.o.filter(s => s.length === q.o[q.c].length).length === 1) maior++;
  if (r > 1.25) longas.push(r.toFixed(2) + "  " + q.p);
});
console.log(listas.length + " questões");
console.log("Posição da certa (A, B, C, D):", pos.join(", "));
console.log("Certa é a única mais longa em " + maior + " questões (" + Math.round(maior / listas.length * 100) + "%; ao acaso seria ~25%)");
console.log("Certa mais de 25% maior que a média das outras:", longas.length ? "\n  " + longas.join("\n  ") : "nenhuma");
