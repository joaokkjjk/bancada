# Bancada: instruções para agentes

Este arquivo vale para qualquer agente de IA (Claude, GPT, Gemini, Copilot, Cursor ou outro) e para pessoas que contribuam com o projeto. Siga este padrão em toda tarefa.

## O projeto

Bancada é um site gratuito, em português, que centraliza conteúdo de informática: biblioteca de livros com licença aberta, peças em 3D, guias, glossário, trilhas de estudo e o jogo Gargalo. Lema: "Toda a informática num lugar só. Grátis. Para sempre." Sem anúncios e sem nada pago.

## Fluxo obrigatório: Issue → branch → PR → deploy

1. **Toda tarefa começa com uma Issue no GitHub**, antes de qualquer código. Classifique com um dos rótulos:
   - `correcao`: algo que não funciona como deveria;
   - `melhoria`: muda algo que já existe;
   - `nova-funcao`: acrescenta algo que não existia.

   O título da Issue descreve o resultado esperado. O corpo traz contexto, critérios de aceite em lista de verificação e, para correções, os passos para reproduzir.
2. **Crie uma branch a partir da `main`**, com o tipo e o número da Issue: `correcao/12-leitor-pdf-zoom`, `melhoria/15-skeleton-livros`, `nova-funcao/20-trilha-redes`.
3. **Faça commits pequenos** no padrão Conventional Commits, em português: `fix: corrige zoom do leitor de PDF`, `feat: adiciona trilha de redes`, `refactor:`, `test:`, `docs:`, `chore:`. O commitlint confere isso.
4. **Abra um Pull Request para a `main`.** A descrição precisa mencionar a Issue com uma palavra de fechamento, por exemplo `Closes #12`, e explicar o que mudou e como foi testado. Um PR resolve uma Issue; se a tarefa cresceu, abra outra Issue.
5. **O PR só entra quando o CI passa:** lint (Biome), código morto (Knip), contrato de arquitetura, testes unitários e de integração (Vitest), testes de ponta a ponta (Playwright) e cobertura (Codecov). Não desative verificações para fazer o PR passar.
6. **Deploy acontece pelo merge na `main`.** Nunca publique direto de uma branch. O que está na `main` é o que está no ar.

Não faça push direto na `main`. Não feche Issues sem um PR que as resolva, exceto quando forem descartadas, com um comentário explicando o porquê.

## Padrões de código

- Interface em português do Brasil. Textos curtos, frases claras, sem jargão desnecessário.
- Identidade visual: preto #0B0B0B, branco, cinza claro #E5E5E5 e cinza médio #6B6B6B; Montserrat nos títulos e Inter nos textos. Use os tokens de `:root` (cores, `--fs-*`, `--sp-*`, `--r-*`, `--ease`) em vez de valores soltos.
- Toda tela tem estado de carregamento (skeleton), carregamento sob demanda (lazy loading) de imagens, 3D e PDFs, e animações de entrada, saída, carregamento e progresso. Respeite `prefers-reduced-motion`.
- Acessibilidade: contraste mínimo de 4,5:1, foco visível, navegação por teclado, `alt` em imagens com conteúdo.
- Conteúdo de terceiros só com licença aberta e crédito. Questões das trilhas não podem entregar a resposta (veja `scripts/balancear_trilhas.js`).
- Nenhum dado pessoal sai do navegador. A observabilidade (Sentry) registra erros sem coletar informações de quem usa o site.

## Antes de abrir o PR

Rode localmente o mesmo que o CI roda (os comandos ficam no `package.json`): lint, testes unitários e testes de ponta a ponta. Inclua na descrição do PR o que foi testado e, para mudanças visuais, uma captura de tela do computador e do celular.
