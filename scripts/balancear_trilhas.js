// Confere as questões das trilhas para que a resposta certa não se entregue:
// posição da certa (A, B, C, D) e se ela é a alternativa mais longa.
// Com --balancear, reposiciona a certa em rodízio dentro de cada trilha e regrava os arquivos.
// Listas só de números ficam em ordem crescente.
// Uso: node scripts/balancear_trilhas.js [--balancear] [trilha ...]
const fs = require("fs");
const path = require("path");
global.window = {};
const pasta = path.join(__dirname, "..", "data", "trilhas");
const args = process.argv.slice(2);
const balancear = args.includes("--balancear");
const so = args.filter(a => !a.startsWith("--"));
const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith(".js"));
arquivos.forEach(f => require(path.join(pasta, f)));
const num = s => /^[\d.,\-–\s]+(%|ns|GB|MB|px|vezes|ciclos?|GB\/s|MB\/s)?$/.test(s.trim());
const longas = [];
const pos = {};
Object.keys(window.TRILHAS).forEach(id => {
  if (so.length && !so.includes(id)) return;
  const arq = path.join(pasta, id + ".js");
  let txt = fs.readFileSync(arq, "utf8");
  let alvo = 0;
  pos[id] = [0, 0, 0, 0];
  window.TRILHAS[id].modulos.forEach((m, mi) => m.q.forEach(q => {
    const antes = JSON.stringify(q);
    if (balancear) {
      const certa = q.o[q.c];
      if (q.o.every(num)) {
        q.o.sort((a, b) => parseFloat(a.replace(",", ".")) - parseFloat(b.replace(",", ".")));
        q.c = q.o.indexOf(certa);
      } else {
        const t = alvo++ % 4;
        [q.o[q.c], q.o[t]] = [q.o[t], q.o[q.c]];
        q.c = t;
      }
      const depois = JSON.stringify(q);
      if (!txt.includes(antes)) console.log("não achei no arquivo:", id, q.p);
      else txt = txt.replace(antes, depois);
    }
    pos[id][q.c]++;
    const tam = q.o.map(o => o.length), maior = Math.max(...tam.filter((_, i) => i !== q.c));
    if (tam[q.c] > maior * 1.15) longas.push(id + " m" + (mi + 1) + ": " + q.p + " → " + q.o[q.c]);
  }));
  if (balancear) fs.writeFileSync(arq, txt);
});
console.log("posição da certa (A B C D):", pos);
console.log(longas.length ? "certa bem mais longa que as outras:\n" + longas.join("\n") : "nenhuma certa se destaca pelo tamanho");
