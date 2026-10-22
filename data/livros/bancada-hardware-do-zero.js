// Livro original do Bancada. Licença CC BY-SA 4.0. Cada capítulo é HTML simples: p, h3, ul, ol, table, b, code.
(window.LIVROS=window.LIVROS||[]).push({
id:"hardware-do-zero",t:"Hardware do zero",a:"Equipe Bancada",nivel:"Básico",area:"Hardware e eletrônica",
resumo:"O que cada peça faz, como elas conversam e como ler uma ficha técnica sem se perder nos números.",
l:"CC BY-SA 4.0",proprio:true,revisado:"out/2026",
caps:[
{t:"O que acontece quando você liga o PC",html:`
<p>Apertar o botão de ligar dispara uma sequência curta e muito organizada. Entender essa sequência ajuda a montar, a escolher peças e, principalmente, a descobrir o que deu errado quando o PC não liga.</p>
<ol>
<li><b>A fonte acorda.</b> Mesmo desligado da tela, o PC recebe um pouco de energia de espera. O botão avisa a placa-mãe, que pede à fonte para entregar energia completa.</li>
<li><b>O firmware assume.</b> Um programa gravado num chip da placa-mãe, a <b>UEFI</b> (sucessora da antiga BIOS), começa a rodar na CPU.</li>
<li><b>O POST testa o básico.</b> O autoteste confere se há processador, memória e vídeo funcionando. Se algo falha aqui, a placa costuma avisar com bipes ou luzes de diagnóstico.</li>
<li><b>A memória é treinada.</b> A placa ajusta os tempos da RAM. Com DDR5, o primeiro boot depois de montar ou trocar memória pode levar mais de um minuto com a tela preta, e isso é normal.</li>
<li><b>O sistema é carregado.</b> A UEFI procura um disco com sistema operacional e entrega o controle a ele. A partir daí, quem manda é o Windows, o Linux ou outro sistema.</li>
</ol>
<p>Repare que só três peças são indispensáveis para chegar ao POST: CPU, memória e algum vídeo (integrado ou placa dedicada). É por isso que, em diagnóstico, a primeira coisa a fazer é deixar o PC com o mínimo e ir adicionando peças.</p>
<h3>Para guardar</h3>
<ul><li>Tela preta não significa PC morto: pode ser só treinamento de memória ou cabo na saída errada.</li>
<li>A UEFI é onde ficam configurações como ordem de boot, perfil de memória e ventoinhas.</li></ul>`},
{t:"As peças e o papel de cada uma",html:`
<p>Um jeito útil de pensar no PC é como uma oficina. Cada peça tem uma função, e o desempenho depende de todas trabalharem no mesmo ritmo.</p>
<table><thead><tr><th>Peça</th><th>Na oficina seria</th><th>O que faz</th></tr></thead><tbody>
<tr><td>CPU</td><td>O artesão</td><td>Executa as instruções dos programas.</td></tr>
<tr><td>RAM</td><td>A bancada</td><td>Guarda o que está em uso agora. Rápida, mas esquece tudo ao desligar.</td></tr>
<tr><td>SSD ou HD</td><td>O armário</td><td>Guarda arquivos de forma permanente. Mais lento que a RAM.</td></tr>
<tr><td>GPU</td><td>Uma equipe de ajudantes</td><td>Faz muitos cálculos simples ao mesmo tempo, ideal para imagens e IA.</td></tr>
<tr><td>Placa-mãe</td><td>O galpão</td><td>Liga todas as peças e distribui energia e dados.</td></tr>
<tr><td>Fonte</td><td>A rede elétrica</td><td>Converte a energia da tomada nas tensões que as peças usam.</td></tr>
<tr><td>Refrigeração</td><td>A ventilação</td><td>Tira o calor para as peças não reduzirem a velocidade.</td></tr>
</tbody></table>
<p>A analogia da bancada explica um sintoma comum: com pouca RAM, o sistema precisa buscar coisas no armário (o SSD) o tempo todo, e tudo fica lento, mesmo com uma CPU forte.</p>
<h3>Vídeo integrado ou dedicado?</h3>
<p>Muitos processadores trazem uma GPU simples embutida. Ela basta para uso de escritório, vídeos e jogos leves. Para jogos atuais, edição pesada ou IA local, uma placa de vídeo dedicada faz enorme diferença, porque tem a própria memória (a <b>VRAM</b>) e milhares de núcleos de cálculo.</p>`},
{t:"Os números das fichas técnicas",html:`
<p>Fichas técnicas assustam porque misturam unidades. Quase todas cabem em cinco grupos.</p>
<h3>Velocidade: Hz e transferências</h3>
<p><b>GHz</b> (bilhões de ciclos por segundo) mede o ritmo da CPU. Só serve para comparar processadores da mesma família: uma arquitetura mais nova faz mais trabalho por ciclo. Na memória, o número correto é <b>MT/s</b> (milhões de transferências por segundo). Uma DDR5-6000 faz 6000 MT/s, embora muita loja escreva "6000 MHz".</p>
<h3>Capacidade: bytes</h3>
<p>Um byte tem 8 bits. Fabricantes de armazenamento usam múltiplos de 1000; o Windows usa múltiplos de 1024. Por isso um SSD de 1 TB aparece com cerca de 931 GB. Nada sumiu.</p>
<h3>Taxa de dados: MB/s e GB/s</h3>
<p>Diz quanto dado passa por segundo. SSD SATA fica perto de 550 MB/s; SSD NVMe PCIe 4.0 passa de 7000 MB/s em leitura sequencial. Atenção: <b>Mb/s</b> (megabits, usado em internet) é oito vezes menor que <b>MB/s</b> (megabytes).</p>
<h3>Energia: watts</h3>
<p>O <b>TDP</b> da CPU e o consumo da placa de vídeo dizem quanto calor precisa ser removido e quanta energia a fonte precisa entregar. São referências: o consumo real varia com a carga.</p>
<h3>Atraso: latência</h3>
<p>Latência é o tempo de espera até a resposta começar. Na RAM aparece como <b>CL</b> (em ciclos); em armazenamento, em microssegundos. Pouca latência importa tanto quanto muita velocidade, assunto que o livro <i>Por dentro do PC moderno</i> aprofunda.</p>`},
{t:"Compatibilidade: o que encaixa com o quê",html:`
<p>A maior parte dos problemas de quem monta o primeiro PC é compra incompatível. Confira nesta ordem:</p>
<ol>
<li><b>CPU e placa-mãe:</b> o <b>socket</b> precisa ser o mesmo (por exemplo AM5 para Ryzen recentes, LGA 1851 para Intel Core Ultra de desktop). O chipset também precisa suportar aquela geração, e às vezes exige atualizar a UEFI.</li>
<li><b>Placa-mãe e RAM:</b> a placa aceita só DDR4 ou só DDR5. Os encaixes são diferentes de propósito.</li>
<li><b>Placa-mãe e SSD:</b> o slot M.2 pode aceitar NVMe, SATA ou ambos. Veja no manual.</li>
<li><b>Fonte e placa de vídeo:</b> potência suficiente e os conectores certos. Placas recentes podem usar o conector 12V-2x6.</li>
<li><b>Gabinete:</b> formato da placa (ATX, micro-ATX, mini-ITX), comprimento da placa de vídeo e altura do cooler.</li>
<li><b>Cooler e CPU:</b> o cooler precisa ter suporte ao socket e dar conta do calor da CPU.</li>
</ol>
<p>O manual da placa-mãe é o documento mais importante da montagem. Ele lista as memórias testadas, quais slots M.2 desativam portas SATA e em quais slots de RAM colocar dois módulos (normalmente o 2º e o 4º, contando a partir da CPU).</p>`},
{t:"Cuidados e primeiros diagnósticos",html:`
<p>Hardware é mais resistente do que parece, mas alguns cuidados evitam a maioria dos danos.</p>
<ul>
<li><b>Estática:</b> toque numa parte metálica do gabinete antes de mexer nas peças e evite trabalhar sobre tapete.</li>
<li><b>Sempre desligado da tomada</b> antes de trocar qualquer peça interna.</li>
<li><b>Sem força:</b> se uma peça não encaixa com pressão leve, ela está virada ou não é compatível. A CPU, em especial, entra sem nenhuma pressão.</li>
<li><b>Cabos da fonte:</b> use só os cabos que vieram com a própria fonte. Cabos modulares de outras marcas podem ter a pinagem diferente e queimar peças.</li>
</ul>
<h3>Quando algo não funciona</h3>
<p>Teste uma coisa de cada vez e anote o que mudou. Os sintomas mais comuns e a primeira suspeita:</p>
<table><thead><tr><th>Sintoma</th><th>Primeira suspeita</th></tr></thead><tbody>
<tr><td>Nada acende</td><td>Tomada, chave da fonte, cabo do botão no painel frontal</td></tr>
<tr><td>Liga mas não dá imagem</td><td>Cabo do monitor na saída errada, RAM mal encaixada, treinamento de memória</td></tr>
<tr><td>Reinicia sozinho em jogos</td><td>Temperatura alta ou fonte insuficiente</td></tr>
<tr><td>Tela azul aleatória</td><td>Perfil de memória (XMP/EXPO) instável ou driver</td></tr>
</tbody></table>
<p>O guia <i>Tela preta: por onde começar</i>, na aba Guias, traz o passo a passo completo.</p>`}
]});
