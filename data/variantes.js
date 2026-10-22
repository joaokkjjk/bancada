// Variantes de cada peça e tabelas de gerações (o conteúdo da antiga aba Fichas veio para cá).
// lista: id, n (nome), modelo (chave em modelos3d.js), d (o que muda), specs [campo, valor], pontos extras do 3D.
// tabelas: t (título), nota, h (cabeçalho), r (linhas). Valores de referência, revisados em out/2026.
window.VARIANTES={
cpu:{lista:[
{id:"am5",n:"AMD AM5",modelo:"cpu",d:"Processadores Ryzen atuais. A tampa tem recortes nas bordas que deixam à mostra pequenos capacitores. Os contatos são planos e os pinos ficam no socket da placa (LGA).",
specs:[["Socket","AM5 (LGA 1718)"],["Contatos","1718 pads planos na CPU"],["Memória","DDR5"],["PCIe","5.0"],["Desde","2022"],["Exemplos","Ryzen 7000 e 9000"]]},
{id:"intel",n:"Intel LGA 1851",modelo:"cpu-intel",d:"Processadores Core Ultra de desktop. Formato retangular, com dois entalhes laterais que impedem a montagem invertida. Também LGA: os pinos ficam na placa.",
specs:[["Socket","LGA 1851"],["Contatos","1851 pads planos na CPU"],["Memória","DDR5"],["PCIe","5.0"],["Desde","2024"],["Exemplos","Core Ultra 200S"]]},
{id:"am4",n:"AMD AM4 (pinos)",modelo:"cpu-am4",d:"Geração anterior da AMD, ainda muito comum. Os pinos ficam no próprio processador (PGA): encaixam em furos no socket e podem entortar se a CPU cair.",
specs:[["Socket","AM4 (PGA 1331)"],["Contatos","1331 pinos na CPU"],["Memória","DDR4"],["PCIe","3.0 ou 4.0, conforme o modelo"],["Desde","2017"],["Exemplos","Ryzen 1000 a 5000"]],
pontos:{pinos:["Pinos (PGA)","1331 pinos dourados na própria CPU. Encaixam em furos no socket. Pino torto pode impedir o boot ou desativar um canal de memória."]}},
{id:"bga",n:"Notebook (BGA)",modelo:"cpu-bga",d:"Em notebooks finos, o processador é soldado na placa. Não há tampa metálica: o cooler encosta direto no silício. Não dá para trocar.",
specs:[["Encapsulamento","BGA (soldado)"],["Troca","Não é possível"],["Tampa (IHS)","Não tem; o silício fica exposto"],["Memória","LPDDR5/5X ou DDR5, conforme o projeto"],["Consumo típico","15 a 45 W"],["Exemplos","Processadores de notebook Intel e AMD"]],
pontos:{die:["Silício exposto (die)","O chip propriamente dito. Sem tampa, o cooler do notebook encosta direto nele, com pasta ou metal líquido."],esferas:["Esferas de solda","Centenas de pequenas esferas que soldam o processador na placa-mãe do notebook."]}}
],tabelas:[
{t:"Plataformas de processador",nota:"Socket e memória definem a compatibilidade. Anos de lançamento das primeiras CPUs de cada plataforma.",h:["Plataforma","Socket","Memória","PCIe","Desde"],r:[["Intel 10ª e 11ª geração","LGA 1200","DDR4","3.0 / 4.0","2020"],["Intel 12ª a 14ª geração","LGA 1700","DDR4 ou DDR5","4.0 / 5.0","2021"],["Intel Core Ultra 200S","LGA 1851","DDR5","5.0","2024"],["AMD Ryzen 1000 a 5000","AM4","DDR4","3.0 / 4.0","2017"],["AMD Ryzen 7000 e 9000","AM5","DDR5","5.0","2022"]]}
]},
"placa-mae":{lista:[
{id:"atx",n:"ATX",modelo:"placa-atx",d:"O tamanho mais comum. Mais slots de expansão, mais M.2 e mais espaço para VRM e dissipadores.",
specs:[["Tamanho","30,5 × 24,4 cm"],["Slots de memória","4"],["Slots PCIe","3 a 4"],["M.2","3 a 5"],["Gabinete","Torre média ou maior"]]},
{id:"matx",n:"Micro-ATX",modelo:"placa-matx",d:"Mais curta e mais barata. Mantém quatro slots de memória na maioria dos modelos, mas tem menos slots PCIe.",
specs:[["Tamanho","24,4 × 24,4 cm"],["Slots de memória","2 a 4"],["Slots PCIe","2 a 3"],["M.2","1 a 2"],["Gabinete","Micro-ATX ou maior"]]},
{id:"itx",n:"Mini-ITX",modelo:"placa-itx",d:"Para PCs compactos. Só dois slots de memória e um PCIe; o segundo M.2 costuma ficar no verso da placa.",
specs:[["Tamanho","17 × 17 cm"],["Slots de memória","2"],["Slots PCIe","1"],["M.2","1 a 2 (um no verso)"],["Gabinete","Mini-ITX ou maior"]]}
],tabelas:[
{t:"Formatos de placa-mãe",nota:"Um gabinete aceita o seu formato e todos os menores.",h:["Formato","Medidas","Memória","PCIe"],r:[["E-ATX","30,5 × 33 cm","4 a 8","4 ou mais"],["ATX","30,5 × 24,4 cm","4","3 a 4"],["Micro-ATX","24,4 × 24,4 cm","2 a 4","2 a 3"],["Mini-ITX","17 × 17 cm","2","1"]]},
{t:"Chipsets intermediários por geração",nota:"Os chipsets da série B atendem a maioria das pessoas. Os das séries X e Z trazem mais conexões e overclock.",h:["Chipset","Plataforma","Desde"],r:[["AMD B550","AM4","2020"],["Intel B660 / B760","LGA 1700","2022 / 2023"],["AMD B650","AM5","2022"],["AMD B850","AM5","2025"],["Intel B860","LGA 1851","2025"]]}
]},
ram:{lista:[
{id:"ddr5",n:"DDR5",modelo:"ram",d:"Padrão atual. Dois subcanais por módulo e regulador de tensão (PMIC) no próprio pente.",
specs:[["Pinos","288"],["Tensão","1,1 V (padrão)"],["Velocidade","4800 MT/s ou mais"],["Regulador","No módulo (PMIC)"],["Desde","2021"]]},
{id:"ddr4",n:"DDR4",modelo:"ram-ddr4",d:"Geração anterior. Mesmo número de pinos da DDR5, mas o entalhe fica em outra posição, por isso não encaixa em placa DDR5. Não tem PMIC.",
specs:[["Pinos","288"],["Tensão","1,2 V (padrão)"],["Velocidade","1600 a 3200 MT/s (oficial)"],["Regulador","Na placa-mãe"],["Desde","2014"]]},
{id:"ddr5-rgb",n:"DDR5 com dissipador",modelo:"ram-rgb",d:"Os chips ficam cobertos por um dissipador dos dois lados, comum em kits de alta velocidade. A barra de luz é só estética.",
specs:[["Pinos","288"],["Tensão","1,25 a 1,4 V (com perfil EXPO/XMP)"],["Velocidade","6000 MT/s ou mais"],["Altura","Maior: confira a folga do cooler"],["Desde","2021"]]},
{id:"sodimm",n:"SO-DIMM (notebook)",modelo:"ram-sodimm",d:"Versão curta para notebooks e mini PCs, com cerca de metade do comprimento.",
specs:[["Pinos","262 (DDR5) ou 260 (DDR4)"],["Comprimento","~7 cm"],["Uso","Notebooks, mini PCs"],["Troca","Possível quando não é soldada"]]},
{id:"camm2",n:"CAMM2",modelo:"ram-camm",d:"Formato novo para notebooks: o módulo fica deitado e é preso por parafusos sobre um conector de pressão. É mais fino e permite memórias mais rápidas que o SO-DIMM.",
specs:[["Encaixe","Por compressão, com parafusos"],["Memória","DDR5 ou LPDDR5X"],["Vantagem","Mais fino e mais rápido que SO-DIMM"],["Desde","2024"]],
pontos:{parafusos:["Parafusos de fixação","Pressionam o módulo contra o conector. Não há pinos de encaixe como no SO-DIMM."],conector:["Conector de compressão","Contatos que fazem ligação só pela pressão do módulo, com trilhas mais curtas e sinal mais limpo."]}}
],tabelas:[
{t:"Gerações de memória",nota:"Cada geração tem o entalhe em posição diferente e não encaixa na placa de outra. Velocidades do padrão oficial (JEDEC).",h:["Geração","Pinos (desktop)","Tensão","Velocidade","Desde"],r:[["DDR","184","2,5 V","200 a 400 MT/s","2000"],["DDR2","240","1,8 V","400 a 1066 MT/s","2003"],["DDR3","240","1,5 V","800 a 2133 MT/s","2007"],["DDR4","288","1,2 V","1600 a 3200 MT/s","2014"],["DDR5","288","1,1 V","4800 a 8800 MT/s","2021"]]}
]},
armazenamento:{lista:[
{id:"nvme",n:"SSD M.2 NVMe",modelo:"armazenamento",d:"O padrão atual para sistema e jogos. Usa linhas PCIe e chega a vários GB/s.",
specs:[["Formato","M.2 2280 (22 × 80 mm)"],["Interface","PCIe 4.0 x4 (NVMe)"],["Leitura","Até ~7000 MB/s"],["Partes móveis","Nenhuma"]]},
{id:"m2-2230",n:"SSD M.2 2230",modelo:"ssd-2230",d:"Versão curta do M.2, usada em portáteis de jogo, notebooks finos e alguns consoles. Mesma interface, menos espaço para chips.",
specs:[["Formato","M.2 2230 (22 × 30 mm)"],["Interface","PCIe 4.0 x4 (NVMe)"],["Uso","Portáteis, notebooks finos"],["Capacidade","Geralmente até 2 TB"]]},
{id:"sata",n:"SSD SATA 2,5\"",modelo:"ssd-sata",d:"Mesmo formato de HD de notebook, ligado por cabo SATA. Bem mais rápido que um HD, mas limitado a cerca de 550 MB/s.",
specs:[["Formato","2,5 polegadas, 7 mm"],["Interface","SATA III"],["Leitura","~550 MB/s"],["Cabos","Dados SATA + energia SATA"]],
pontos:{sata:["Conectores SATA","O menor leva os dados; o maior, a energia vinda da fonte."],carcaca:["Carcaça","Caixa de metal ou plástico. Dentro há uma placa pequena com controlador e chips NAND."]}},
{id:"hd",n:"HD 3,5\"",modelo:"hd",d:"Disco rígido de desktop. Pratos magnéticos giram a 5400 ou 7200 rpm e um braço move a cabeça de leitura. Ainda é o mais barato por terabyte.",
specs:[["Formato","3,5 polegadas"],["Interface","SATA III"],["Leitura","~150 a 280 MB/s"],["Rotação","5400 ou 7200 rpm"],["Acesso","Vários milissegundos (contra microssegundos do SSD)"]],
pontos:{pratos:["Pratos","Discos de vidro ou alumínio com camada magnética. Os dados ficam em trilhas circulares."],cabeca:["Braço e cabeça de leitura","Flutua a nanômetros do prato, movida por um atuador. É por isso que HDs não gostam de pancadas."],sata:["Conectores SATA","Dados e energia, iguais aos do SSD SATA."],carcaca:["Carcaça lacrada","Mantém poeira longe dos pratos. Nunca abra um HD que você quer continuar usando."],placa:["Placa controladora","Fica embaixo do HD e comanda motor, braço e interface."]}}
],tabelas:[
{t:"Interfaces de armazenamento",nota:"Valores teóricos de referência. O desempenho real depende do drive.",h:["Interface","Limite teórico","Onde aparece"],r:[["SATA III","~600 MB/s","HDs e SSDs de 2,5\""],["PCIe 3.0 x4","~3,9 GB/s","SSDs NVMe mais antigos"],["PCIe 4.0 x4","~7,9 GB/s","SSDs NVMe atuais"],["PCIe 5.0 x4","~15,8 GB/s","SSDs de topo"]]},
{t:"Unidades de medida",nota:"Por isso um SSD de 1 TB aparece com cerca de 931 GB no Windows.",h:["Unidade","Valor","Observação"],r:[["Byte","8 bits","256 valores possíveis"],["KB","1000 bytes","Usado por fabricantes de armazenamento"],["KiB","1024 bytes","Base 2, usada pelo Windows"],["MB/s × Mb/s","Mb/s é 8× menor","Internet usa megabits"]]}
]},
gpu:{lista:[
{id:"duas",n:"Duas ventoinhas",modelo:"gpu",d:"Formato mais comum em placas de entrada e intermediárias.",
specs:[["Ventoinhas","2"],["Comprimento","~24 a 28 cm"],["Espessura","2 a 2,5 slots"],["Consumo típico","150 a 250 W"]]},
{id:"tres",n:"Três ventoinhas",modelo:"gpu-3",d:"Placas mais fortes precisam de dissipador maior. Ficam mais longas e grossas: confira o espaço no gabinete.",
specs:[["Ventoinhas","3"],["Comprimento","~30 a 36 cm"],["Espessura","2,5 a 3,5 slots"],["Consumo típico","250 a 575 W"]]},
{id:"baixa",n:"Perfil baixo",modelo:"gpu-lp",d:"Placas de meia altura para PCs pequenos e de escritório. Consomem pouco e muitas nem precisam de cabo de energia.",
specs:[["Altura","Meia altura (~6,9 cm)"],["Ventoinhas","1 ou 2 pequenas"],["Consumo típico","Até 75 W (só pelo slot)"],["Uso","PCs compactos, servidores"]]},
{id:"blower",n:"Blower",modelo:"gpu-blower",d:"Uma ventoinha radial puxa ar e o expulsa direto pela traseira do gabinete. É mais barulhenta, mas boa para várias placas lado a lado.",
specs:[["Ventoinha","1 radial"],["Saída do ar","Pela traseira, para fora do gabinete"],["Uso","Estações de trabalho, várias GPUs"],["Ruído","Maior que o modelo aberto"]],
pontos:{radial:["Ventoinha radial (blower)","Puxa o ar de cima e o empurra de lado, por dentro da carenagem, até sair pela traseira."]}}
],tabelas:[
{t:"Algumas gerações de placas de vídeo",nota:"Marcos de cada geração; lançamentos aproximados.",h:["Geração","Ano","O que trouxe"],r:[["NVIDIA GTX 10","2016","Grande salto de eficiência"],["NVIDIA RTX 20","2018","Primeiros núcleos de ray tracing e DLSS"],["AMD RX 6000","2020","Ray tracing na AMD e Infinity Cache"],["NVIDIA RTX 40","2022","Geração de quadros (DLSS 3)"],["NVIDIA RTX 50 / AMD RX 9000","2025","Memória GDDR7 (NVIDIA), FSR 4 com IA (AMD)"]]}
]},
fonte:{lista:[
{id:"modular",n:"ATX modular",modelo:"fonte",d:"Os cabos são destacáveis: você liga só os necessários, o que facilita a organização.",
specs:[["Formato","ATX (15 × 8,6 × 14 a 16 cm)"],["Cabos","Destacáveis"],["Padrão","ATX 3.1"],["Conector de vídeo","12V-2x6"]]},
{id:"fixa",n:"ATX não modular",modelo:"fonte-fixa",d:"Todos os cabos saem presos da fonte. Mais barata, mas sobram cabos sem uso dentro do gabinete.",
specs:[["Formato","ATX"],["Cabos","Fixos"],["Vantagem","Preço menor"],["Desvantagem","Organização mais difícil"]],
pontos:{cabos:["Feixe de cabos fixos","Saem direto de dentro da fonte. Os que não forem usados precisam ser guardados no gabinete."]}},
{id:"sfx",n:"SFX (compacta)",modelo:"fonte-sfx",d:"Fonte pequena para gabinetes mini-ITX. Usa ventoinha menor e costuma ser mais cara por watt.",
specs:[["Formato","SFX (12,5 × 6,35 × 10 cm)"],["Ventoinha","92 mm"],["Potência típica","450 a 1000 W"],["Uso","PCs compactos"]]}
],tabelas:[
{t:"Eficiência 80 Plus",nota:"Valores a 50% de carga em rede de 115 V. Mais eficiência significa menos calor e menos desperdício.",h:["Certificação","Eficiência"],r:[["Bronze","85%"],["Silver","88%"],["Gold","90%"],["Platinum","92%"],["Titanium","94%"]]},
{t:"Padrões ATX recentes",nota:"",h:["Padrão","Ano","Novidade"],r:[["ATX 2.x","2003 em diante","Base das fontes por quase 20 anos"],["ATX 3.0","2022","Suporte a picos de consumo e conector 12VHPWR"],["ATX 3.1","2023","Conector revisado 12V-2x6, mais seguro"]]}
]},
refrigeracao:{lista:[
{id:"torre",n:"Torre simples",modelo:"refrigeracao",d:"Uma torre de aletas e uma ventoinha. Ótimo custo-benefício para a maioria dos processadores.",
specs:[["Tipo","Ar, torre simples"],["Altura","~15 a 16 cm"],["Ventoinhas","1 (120 mm)"],["Capacidade típica","150 a 220 W"]]},
{id:"box",n:"Cooler box",modelo:"cooler-box",d:"O cooler que vem na caixa de alguns processadores. Baixo e simples, suficiente para modelos de consumo moderado.",
specs:[["Tipo","Ar, radial"],["Altura","~5 a 7 cm"],["Ventoinhas","1 (~90 mm)"],["Capacidade típica","65 a 95 W"]]},
{id:"dupla",n:"Torre dupla",modelo:"cooler-dupla",d:"Duas torres de aletas com duas ventoinhas. Rivaliza com water coolers de 240 a 280 mm, com menos peças que podem falhar.",
specs:[["Tipo","Ar, torre dupla"],["Altura","~16 cm"],["Ventoinhas","2"],["Capacidade típica","220 a 300 W"]]},
{id:"baixo",n:"Perfil baixo",modelo:"cooler-baixo",d:"Para gabinetes compactos. A ventoinha sopra de cima para baixo e também refresca a placa-mãe ao redor.",
specs:[["Tipo","Ar, top-down"],["Altura","~4 a 7 cm"],["Ventoinhas","1 (92 ou 120 mm)"],["Capacidade típica","65 a 130 W"]]},
{id:"aio240",n:"Water cooler 240",modelo:"aio-240",d:"Uma bomba no bloco sobre a CPU circula líquido até um radiador de 240 mm, resfriado por duas ventoinhas.",
specs:[["Tipo","Líquido (AIO)"],["Radiador","240 mm"],["Ventoinhas","2"],["Capacidade típica","200 a 280 W"]],
pontos:{bomba:["Bloco da bomba","Fica sobre a CPU. A base de cobre recebe o calor e a bomba faz o líquido circular."],mangueiras:["Mangueiras","Levam o líquido quente ao radiador e trazem de volta o líquido frio."],radiador:["Radiador","Aletas finas por onde o líquido passa e troca calor com o ar empurrado pelas ventoinhas."]}},
{id:"aio360",n:"Water cooler 360",modelo:"aio-360",d:"Radiador maior, com três ventoinhas. Indicado para processadores de consumo muito alto.",
specs:[["Tipo","Líquido (AIO)"],["Radiador","360 mm"],["Ventoinhas","3"],["Capacidade típica","250 a 350 W"]],
pontos:{bomba:["Bloco da bomba","Fica sobre a CPU. A base de cobre recebe o calor e a bomba faz o líquido circular."],mangueiras:["Mangueiras","Levam o líquido quente ao radiador e trazem de volta o líquido frio."],radiador:["Radiador","Aletas finas por onde o líquido passa e troca calor com o ar empurrado pelas ventoinhas."]}}
],tabelas:[
{t:"Qual refrigeração para cada consumo",nota:"Referência geral; compare sempre com o consumo real medido em reviews.",h:["Consumo da CPU","Sugestão"],r:[["Até 95 W","Cooler box ou perfil baixo"],["95 a 180 W","Torre simples"],["180 a 250 W","Torre dupla ou water cooler 240"],["Acima de 250 W","Water cooler 280 ou 360"]]}
]},
gabinete:{lista:[
{id:"mid",n:"Torre média",modelo:"gabinete",d:"O tamanho mais comum. Aceita placas ATX, placas de vídeo longas e radiadores de até 360 mm na maioria dos modelos.",
specs:[["Placas","ATX, micro-ATX, mini-ITX"],["Altura","~45 a 50 cm"],["Radiador","Até 360 mm"],["Ventoinhas","3 a 7"]]},
{id:"itx",n:"Mini-ITX",modelo:"gabinete-itx",d:"Compacto, para levar ou para mesas pequenas. Exige atenção ao tamanho de cada peça.",
specs:[["Placas","Mini-ITX"],["Volume","~10 a 20 litros"],["Fonte","Geralmente SFX"],["Ventoinhas","1 a 3"]]},
{id:"full",n:"Torre grande",modelo:"gabinete-full",d:"Muito espaço para refrigeração, discos e placas E-ATX. Bom para estações de trabalho e water cooling customizado.",
specs:[["Placas","Até E-ATX"],["Altura","~55 a 65 cm"],["Radiador","Até 420 mm, vários"],["Ventoinhas","Até 10 ou mais"]]}
],tabelas:[
{t:"Tamanhos de gabinete",nota:"",h:["Tipo","Placas aceitas","Volume aproximado"],r:[["Mini-ITX","Mini-ITX","10 a 20 L"],["Micro-ATX","Micro-ATX e menores","25 a 40 L"],["Torre média","ATX e menores","40 a 60 L"],["Torre grande","E-ATX e menores","60 a 90 L"]]}
]}
};
