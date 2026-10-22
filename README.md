# Bancada

**Toda a informática num lugar só. Grátis. Para sempre.**

Livros com licença aberta, peças de computador em 3D, guias, glossário, trilhas de estudo (hardware, HTML e CSS, Python, IA) e o jogo Gargalo, tudo em português, sem anúncios.

Site: https://joaokkjjk.github.io/bancada/

## Rodar localmente

```bash
npm install
npm run dev
```

## Verificações

| Comando | O que faz |
|---|---|
| `npm run lint` | Biome: lint e formatação |
| `npm run knip` | Knip: dependências, arquivos e exports sem uso |
| `npm run arquitetura` | dependency-cruiser: contrato de arquitetura |
| `npm run questoes` | Confere se nenhuma questão entrega a resposta |
| `npm run verificar` | Tudo acima |
| `npm run build` | Gera o site em `dist/` |

## Como contribuir

Leia o [AGENTS.md](AGENTS.md). Toda tarefa começa com uma Issue e entra por um Pull Request que cita a Issue (`Closes #N`). O deploy no GitHub Pages acontece a cada merge na `main`.

## Estrutura

- `index.html`: marcação da página.
- `src/app.js`: interface (rotas, telas, componentes); `src/jogo.js`: o jogo Gargalo.
- `src/logica/`: funções puras, sem acesso à página, testáveis isoladamente.
- `src/estilos.css`: estilos e tokens de design.
- `public/data/`: conteúdo (livros, peças, trilhas, glossário) e PDFs.
- `scripts/`: ferramentas para gerar e conferir o conteúdo.

## Licenças

Textos próprios em CC BY-SA 4.0. Obras de terceiros mantêm a licença original, indicada em cada livro.
