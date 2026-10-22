// Livro original do Bancada. Licença CC BY-SA 4.0.
(window.LIVROS=window.LIVROS||[]).push({
id:"por-dentro-do-pc",t:"Por dentro do PC moderno",a:"Equipe Bancada",nivel:"Intermediário",area:"Hardware e eletrônica",
resumo:"Como CPU, memória, PCIe, armazenamento, GPU e energia funcionam por dentro nos PCs atuais.",
l:"CC BY-SA 4.0",proprio:true,revisado:"out/2026",
caps:[
{t:"O processador por dentro",html:`
<p>Uma CPU moderna não executa uma instrução de cada vez. Ela funciona como uma linha de montagem com várias esteiras em paralelo.</p>
<h3>Pipeline</h3>
<p>Cada instrução passa por etapas: buscar, decodificar, executar, acessar memória e gravar o resultado. Enquanto uma instrução está sendo executada, a próxima já está sendo decodificada. Isso é o <b>pipeline</b>. Processadores atuais vão além e são <b>superescalares</b>: iniciam várias instruções por ciclo.</p>
<h3>Execução fora de ordem e previsão de desvios</h3>
<p>Se uma instrução está esperando um dado, a CPU adianta outras que não dependem dele e depois reorganiza os resultados na ordem certa. Quando o programa tem um <code>if</code>, ela tenta adivinhar o caminho para não parar a linha. Os preditores modernos acertam bem mais de 90% das vezes; cada erro custa dezenas de ciclos jogados fora.</p>
<h3>Cache</h3>
<p>Buscar um dado na RAM leva cerca de 70 a 100 nanossegundos, tempo em que a CPU poderia executar centenas de instruções. Por isso existe o cache, em níveis:</p>
<table><thead><tr><th>Nível</th><th>Tamanho típico</th><th>Latência aproximada</th></tr></thead><tbody>
<tr><td>L1</td><td>dezenas de KB por núcleo</td><td>cerca de 1 ns</td></tr>
<tr><td>L2</td><td>1 a 3 MB por núcleo</td><td>3 a 5 ns</td></tr>
<tr><td>L3</td><td>dezenas de MB, compartilhado</td><td>10 a 15 ns</td></tr>
<tr><td>RAM</td><td>gigabytes</td><td>70 a 100 ns</td></tr>
</tbody></table>
<p>Processadores com cache L3 extra empilhado sobre o chip, como os Ryzen X3D, rendem muito em jogos justamente porque erram menos o cache.</p>
<h3>Núcleos híbridos</h3>
<p>Desde a 12ª geração da Intel (2021), muitas CPUs misturam núcleos de desempenho (P) e de eficiência (E). O sistema operacional decide onde cada tarefa roda, com ajuda de informações que o próprio processador fornece.</p>`},
{t:"Memória: DDR5, canais e latência",html:`
<p>A RAM é organizada em <b>canais</b>, caminhos independentes entre a CPU e os módulos. PCs comuns têm dois canais; por isso dois módulos iguais rendem mais que um só.</p>
<h3>O que mudou na DDR5</h3>
<ul>
<li>Cada módulo tem <b>dois subcanais de 32 bits</b> em vez de um de 64, o que permite mais acessos simultâneos.</li>
<li>A regulação de tensão saiu da placa-mãe e foi para o próprio módulo, num chip chamado <b>PMIC</b>.</li>
<li>As velocidades começam em 4800 MT/s, contra 3200 MT/s no topo oficial da DDR4.</li>
<li>Há correção de erros dentro dos chips (on-die ECC), que protege as células mas não substitui a memória ECC completa de servidores.</li>
</ul>
<h3>Latência de verdade</h3>
<p>O CL é contado em ciclos, e ciclos ficam mais curtos quando a frequência sobe. Para comparar módulos, converta para nanossegundos:</p>
<p><code>latência (ns) = CL × 2000 ÷ velocidade (MT/s)</code></p>
<table><thead><tr><th>Módulo</th><th>Conta</th><th>Latência</th></tr></thead><tbody>
<tr><td>DDR4-3200 CL16</td><td>16 × 2000 ÷ 3200</td><td>10,0 ns</td></tr>
<tr><td>DDR5-6000 CL30</td><td>30 × 2000 ÷ 6000</td><td>10,0 ns</td></tr>
<tr><td>DDR5-4800 CL40</td><td>40 × 2000 ÷ 4800</td><td>16,7 ns</td></tr>
</tbody></table>
<p>A DDR5-6000 CL30 tem a mesma latência da boa DDR4, com quase o dobro de largura de banda. Por isso ela virou ponto de equilíbrio comum em plataformas AMD recentes.</p>
<h3>XMP e EXPO</h3>
<p>Sem configuração, a memória roda na velocidade padrão JEDEC, mais lenta. Ativar o perfil <b>XMP</b> (Intel) ou <b>EXPO</b> (AMD) na UEFI aplica a velocidade anunciada na caixa. É um ajuste testado pelo fabricante do módulo, mas a estabilidade final depende também da CPU e da placa.</p>`},
{t:"PCIe e armazenamento NVMe",html:`
<p><b>PCIe</b> é a via expressa que liga a CPU à placa de vídeo, aos SSDs NVMe e a outras placas. Ela é formada por <b>linhas</b> (lanes): uma conexão x16 usa 16 linhas, um SSD costuma usar x4.</p>
<table><thead><tr><th>Geração</th><th>Por linha</th><th>x4 (SSD)</th><th>x16 (vídeo)</th></tr></thead><tbody>
<tr><td>PCIe 3.0</td><td>~1 GB/s</td><td>~3,9 GB/s</td><td>~15,8 GB/s</td></tr>
<tr><td>PCIe 4.0</td><td>~2 GB/s</td><td>~7,9 GB/s</td><td>~31,5 GB/s</td></tr>
<tr><td>PCIe 5.0</td><td>~4 GB/s</td><td>~15,8 GB/s</td><td>~63 GB/s</td></tr>
</tbody></table>
<p>Cada geração dobra a anterior e todas são compatíveis entre si: a conexão funciona na geração mais antiga entre as duas pontas.</p>
<h3>De onde vêm as linhas</h3>
<p>Parte das linhas sai direto da CPU (para vídeo e o SSD principal) e parte sai do chipset, que conversa com a CPU por um link próprio. Dispositivos ligados ao chipset dividem esse link. É por isso que o manual indica qual slot M.2 é "da CPU".</p>
<h3>Por dentro de um SSD</h3>
<ul>
<li><b>Controlador:</b> o processador do SSD, que distribui as gravações e cuida do desgaste.</li>
<li><b>NAND:</b> os chips de memória flash. TLC guarda 3 bits por célula; QLC guarda 4, é mais barata e mais lenta em gravações longas.</li>
<li><b>Cache SLC:</b> parte da NAND funciona temporariamente guardando 1 bit por célula, muito mais rápido. Quando enche numa cópia grande, a velocidade cai bastante.</li>
<li><b>DRAM ou HMB:</b> SSDs com DRAM própria guardam ali o mapa dos dados. Os sem DRAM usam um pedaço da RAM do PC (HMB), o que funciona bem para uso comum.</li>
</ul>`},
{t:"A placa de vídeo",html:`
<p>A CPU tem poucos núcleos muito espertos; a GPU tem milhares de núcleos simples que fazem a mesma conta em muitos dados ao mesmo tempo. Gerar uma imagem é exatamente isso: calcular a cor de milhões de pixels.</p>
<h3>O que pesa na ficha</h3>
<ul>
<li><b>Arquitetura e número de unidades de cálculo:</b> a medida principal de força, comparável só dentro da mesma marca e geração.</li>
<li><b>VRAM:</b> a memória da placa. Texturas de jogos atuais e modelos de IA ocupam muita. Faltando VRAM, o desempenho despenca e aparecem travadas.</li>
<li><b>Largura de banda:</b> quanto dado a VRAM entrega por segundo.</li>
</ul>
<p>A largura de banda sai de uma conta simples:</p>
<p><code>banda (GB/s) = largura do barramento (bits) ÷ 8 × velocidade da memória (Gbps)</code></p>
<p>Uma placa com barramento de 256 bits e memória de 20 Gbps tem 256 ÷ 8 × 20 = 640 GB/s. Caches grandes dentro da GPU ajudam a compensar barramentos mais estreitos.</p>
<h3>Técnicas modernas</h3>
<p><b>Ray tracing</b> simula o caminho da luz e exige unidades dedicadas. <b>Upscaling</b> (DLSS, FSR, XeSS) renderiza em resolução menor e reconstrói a imagem, muitas vezes com IA. <b>Geração de quadros</b> cria quadros intermediários: aumenta a fluidez percebida, mas não reduz o atraso dos comandos.</p>`},
{t:"Energia: da tomada ao núcleo",html:`
<p>A energia passa por duas conversões importantes antes de chegar aos transistores.</p>
<h3>1. A fonte</h3>
<p>Transforma a corrente alternada da tomada (127 V ou 220 V) em 12 V, 5 V e 3,3 V contínuos. Quase toda a potência dos PCs atuais sai pelo trilho de 12 V. A certificação 80 Plus indica eficiência: uma fonte Gold a 50% de carga desperdiça cerca de 10% como calor.</p>
<p>Fontes do padrão <b>ATX 3.x</b> são projetadas para aguentar picos curtos de consumo das placas de vídeo atuais e trazem o conector <b>12V-2x6</b>, que entrega até 600 W. Ele deve ficar totalmente encaixado e sem dobras fortes perto do plugue.</p>
<h3>2. O VRM</h3>
<p>A CPU trabalha com cerca de 1 a 1,4 V, mas puxa muita corrente. O <b>VRM</b> da placa-mãe converte os 12 V nessa tensão baixa usando várias <b>fases</b> que se revezam. Mais fases e componentes melhores significam menos calor e tensão mais estável. Um VRM fraco esquenta e faz a CPU reduzir a velocidade.</p>
<h3>Limites de potência</h3>
<p>Processadores modernos aceleram até onde os limites deixam. Na Intel, os principais são <b>PL1</b> (potência sustentada) e <b>PL2</b> (picos curtos). Na AMD, <b>PPT</b>, <b>TDC</b> e <b>EDC</b>. Muitas placas vêm de fábrica com limites acima do padrão, o que aumenta consumo e temperatura para ganhos pequenos. O livro <i>Desempenho e diagnóstico</i> mostra como medir e ajustar isso.</p>`}
]});
