// Livro original do Bancada. Licença CC BY-SA 4.0.
(window.LIVROS=window.LIVROS||[]).push({
id:"desempenho-diagnostico",t:"Desempenho e diagnóstico",a:"Equipe Bancada",nivel:"Avançado",area:"Hardware e eletrônica",
resumo:"Medir antes de mexer: gargalos, temperatura, limites de potência, ajuste fino e testes de estabilidade.",
l:"CC BY-SA 4.0",proprio:true,revisado:"out/2026",
caps:[
{t:"Medir antes de mexer",html:`
<p>A regra de ouro do ajuste de hardware: nenhuma mudança sem uma medição antes e outra depois, nas mesmas condições.</p>
<h3>O que medir</h3>
<ul>
<li><b>Uso por componente:</b> CPU (por núcleo, não só o total), GPU, RAM e disco.</li>
<li><b>Frequências reais</b> durante a carga, não as da caixa.</li>
<li><b>Temperaturas</b> e <b>consumo</b> da CPU e da GPU.</li>
<li><b>Em jogos:</b> a média de quadros por segundo e o <b>1% low</b>, a média dos piores quadros. É o 1% low que mostra travadas.</li>
</ul>
<h3>Ferramentas comuns</h3>
<p>No Windows, o HWiNFO mostra praticamente todos os sensores; o Gerenciador de Tarefas já dá uma boa visão de uso. Em jogos, sobreposições como a do MSI Afterburner com RTSS ou as dos próprios drivers mostram quadros e tempos de quadro. No Linux, <code>htop</code>, <code>sensors</code> e MangoHud cumprem papel parecido.</p>
<h3>Como testar de forma justa</h3>
<ol><li>Use sempre o mesmo trecho de jogo ou o mesmo teste.</li>
<li>Repita pelo menos três vezes e use a média.</li>
<li>Feche programas em segundo plano.</li>
<li>Anote a temperatura ambiente: 5 °C a mais no quarto mudam o resultado.</li></ol>`},
{t:"Encontrando o gargalo",html:`
<p>Gargalo é a peça que limita o conjunto. Ele muda conforme o programa, a resolução e as configurações, então não existe "CPU que gargala GPU" de forma absoluta.</p>
<h3>Leitura rápida em jogos</h3>
<table><thead><tr><th>O que você vê</th><th>Provável limite</th></tr></thead><tbody>
<tr><td>GPU perto de 97 a 100% de uso</td><td>GPU. É o cenário normal e desejável.</td></tr>
<tr><td>GPU bem abaixo de 90% e um ou dois núcleos da CPU no máximo</td><td>CPU, em especial desempenho por núcleo.</td></tr>
<tr><td>Baixar a resolução quase não aumenta os quadros</td><td>CPU: ela já entrega o máximo de quadros que consegue preparar.</td></tr>
<tr><td>Travadas com uso de VRAM no limite</td><td>Falta de VRAM.</td></tr>
<tr><td>Travadas e disco em 100%</td><td>Pouca RAM ou carregamento de dados.</td></tr>
</tbody></table>
<p>Atenção ao uso total da CPU: 40% de uso numa CPU de 16 threads pode significar que a thread principal do jogo está no limite e o resto está ocioso.</p>
<h3>Teste da resolução</h3>
<p>Baixe a resolução ou ative upscaling. Se os quadros sobem bastante, a GPU era o limite. Se mal mudam, a CPU (ou a memória) era o limite. É o teste mais simples e confiável que existe.</p>`},
{t:"Temperatura e limites de potência",html:`
<p>Processadores e placas de vídeo atuais aceleram até encostar em algum limite: temperatura, potência ou corrente. Chegar a 90 °C sob carga pesada pode ser comportamento previsto, não defeito.</p>
<h3>Thermal throttling</h3>
<p>Quando atinge a temperatura máxima (o <b>Tjmax</b>, em geral entre 95 e 105 °C), o chip reduz a frequência para se proteger. O sinal é a frequência caindo junto com a temperatura travada no topo. As causas comuns são cooler subdimensionado, pasta térmica mal aplicada, fluxo de ar ruim no gabinete ou poeira.</p>
<h3>Limites de potência</h3>
<p>Um limite de potência alto demais faz a CPU consumir muito mais para ganhar pouco. A relação não é linear: os últimos 5% de desempenho podem custar 30% a mais de energia. Reduzir o limite (PL1/PL2 na Intel, PPT na AMD, ou o modo "Eco" da AMD) costuma baixar muito a temperatura com perda pequena.</p>
<h3>Fluxo de ar</h3>
<ul><li>Entrada pela frente e por baixo; saída por trás e por cima.</li>
<li>Um pouco mais de entrada que de saída (pressão positiva) reduz a poeira.</li>
<li>Radiador de water cooler no topo, exaurindo, evita bolhas de ar na bomba.</li></ul>`},
{t:"Undervolt, overclock e estabilidade",html:`
<p>Todo chip sai de fábrica com uma margem de segurança. Ajuste fino é explorar parte dessa margem, com testes.</p>
<h3>Undervolt</h3>
<p>Reduzir a tensão mantendo a frequência diminui consumo e temperatura, e como o chip esquenta menos, ele pode até sustentar frequências maiores. Na AMD isso se faz com o <b>Curve Optimizer</b>; em placas de vídeo, ajustando a curva de tensão e frequência. É a modificação com melhor custo-benefício hoje.</p>
<h3>Overclock</h3>
<p>Aumentar frequências além do padrão. Em CPUs atuais o ganho costuma ser pequeno, porque o boost automático já explora bem o chip. Em memória, apertar timings e subir a velocidade ainda pode render bem em jogos limitados por CPU. Ajustes de tensão acima do recomendado reduzem a vida útil: pesquise os limites seguros da sua plataforma.</p>
<h3>Testando a estabilidade</h3>
<table><thead><tr><th>Ajuste</th><th>Como testar</th></tr></thead><tbody>
<tr><td>CPU</td><td>Cargas pesadas e variadas (por exemplo Cinebench em loop, y-cruncher, OCCT) por pelo menos uma hora</td></tr>
<tr><td>Memória</td><td>TestMem5, Karhu ou MemTest86. Memória instável corrompe arquivos sem avisar.</td></tr>
<tr><td>GPU</td><td>Os jogos que você usa, mais um teste de estresse</td></tr>
</tbody></table>
<p>Um erro em qualquer teste significa instável, mesmo que o PC pareça funcionar. Volte um passo, reteste e só então siga em frente.</p>`},
{t:"Roteiro de diagnóstico avançado",html:`
<p>Quando o problema é intermitente (travamentos, telas azuis, reinícios), o caminho é eliminar variáveis de forma metódica.</p>
<ol>
<li><b>Volte ao padrão.</b> Desative XMP/EXPO, overclock e undervolt. Se o problema sumir, o ajuste era a causa.</li>
<li><b>Leia os registros.</b> No Windows, o Visualizador de Eventos registra erros "WHEA" de hardware e o motivo das telas azuis. O código de parada (como <code>MEMORY_MANAGEMENT</code>) dá a primeira pista.</li>
<li><b>Teste a memória</b> sozinha, com um módulo de cada vez se necessário.</li>
<li><b>Observe temperaturas</b> no momento da falha, com registro em arquivo no HWiNFO.</li>
<li><b>Suspeite da fonte</b> quando o PC desliga de vez sob carga, sem tela azul.</li>
<li><b>Atualize a UEFI</b> e os drivers de chipset e vídeo. Muitas falhas de estabilidade são corrigidas por firmware.</li>
<li><b>Troque por peça conhecida.</b> No fim, emprestar uma peça que funciona é o teste mais definitivo.</li>
</ol>
<p>Anote cada mudança e o resultado. Problemas intermitentes enganam a memória de quem está testando, e um registro escrito evita andar em círculos.</p>`}
]});
