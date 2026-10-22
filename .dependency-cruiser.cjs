/* Contrato de arquitetura do Bancada.
   src/logica: funções puras, sem página nem rede. Podem ser testadas isoladamente.
   src/app.js e src/jogo.js: interface. Podem usar a lógica, nunca o contrário. */
module.exports = {
  forbidden: [
    {
      name: "logica-sem-interface",
      severity: "error",
      comment: "A lógica pura não pode depender da interface (app.js, jogo.js) nem de componentes de tela.",
      from: { path: "^src/logica" },
      to: { path: "^src/(app|jogo)\\.js$" },
    },
    {
      name: "sem-ciclos",
      severity: "error",
      comment: "Dependências circulares deixam o carregamento imprevisível.",
      from: {},
      to: { circular: true },
    },
    {
      name: "sem-orfaos",
      severity: "error",
      comment: "Todo módulo em src precisa ser usado por alguém.",
      from: { orphan: true, path: "^src", pathNot: "^src/app\\.js$" },
      to: {},
    },
    {
      name: "sem-dependencias-de-desenvolvimento-no-site",
      severity: "error",
      comment: "O código do site não pode importar ferramentas de desenvolvimento.",
      from: { path: "^src" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^(public|docs)" },
  },
};
