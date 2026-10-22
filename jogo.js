/* Gargalo: idle clicker educativo de hardware, em pixel art preto e branco, tela cheia.
   - A produção é limitada pela peça mais fraca (CPU, memória ou armazenamento) e pela temperatura.
   - Peças e melhorias são desbloqueadas em sequência, como na história do computador.
   - A cada nível aparece um chefe (ameaças reais da informática): ele mostra uma definição do
     glossário e você precisa acertar o termo. 3 corações para cada lado.
   - Perguntas relâmpago das trilhas e o bit dourado dão bônus temporários e itens.
   - Música e efeitos chiptune originais, gerados com Web Audio.
   API: window.Gargalo.montar(raiz, questoes, glossario) -> função de limpeza; Gargalo.zerar(). */
window.Gargalo=(function(){
var SALVO="bancada-gargalo-v2",PREF="bancada-gargalo-som";

/* ================= som ================= */
var AC=null,mestre,musG,sfxG,pref={som:true,mus:true};
try{var pp=JSON.parse(localStorage.getItem(PREF));if(pp)pref=pp}catch(e){}
function salvarPref(){try{localStorage.setItem(PREF,JSON.stringify(pref))}catch(e){}}
function ligarAudio(){if(AC)return;var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();mestre=AC.createGain();mestre.gain.value=.5;mestre.connect(AC.destination);
musG=AC.createGain();musG.gain.value=pref.mus?.32:0;musG.connect(mestre);sfxG=AC.createGain();sfxG.gain.value=pref.som?.55:0;sfxG.connect(mestre)}
function hz(m){return 440*Math.pow(2,(m-69)/12)}
function tom(f,t,d,tipo,v,dest,f2){if(!AC)return;var o=AC.createOscillator(),g=AC.createGain();o.type=tipo||"square";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.2,t+.005);g.gain.setValueAtTime(v||.2,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(dest||sfxG);o.start(t);o.stop(t+d+.02)}
var ruidoBuf=null;function ruido(t,d,v,dest,alto){if(!AC)return;if(!ruidoBuf){ruidoBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);var x=ruidoBuf.getChannelData(0);for(var i=0;i<x.length;i++)x[i]=Math.random()*2-1}
var s=AC.createBufferSource(),g=AC.createGain(),fl=AC.createBiquadFilter();s.buffer=ruidoBuf;fl.type=alto?"highpass":"lowpass";fl.frequency.value=alto?6000:900;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(dest||sfxG);s.start(t);s.stop(t+d)}
var SFX={
clique:function(){var t=AC.currentTime;tom(1046,t,.04,"square",.12,null,1568)},
compra:function(){var t=AC.currentTime;tom(988,t,.06,"square",.15);tom(1319,t+.06,.12,"square",.15)},
libera:function(){var t=AC.currentTime;[72,76,79,84].forEach(function(n,i){tom(hz(n),t+i*.07,.09,"square",.13)})},
nivel:function(){var t=AC.currentTime;[60,64,67,72,76,79].forEach(function(n,i){tom(hz(n),t+i*.06,.1,"square",.14)})},
acerto:function(){var t=AC.currentTime;tom(hz(76),t,.07,"square",.16);tom(hz(83),t+.07,.14,"square",.16)},
erro:function(){var t=AC.currentTime;tom(196,t,.25,"sawtooth",.15,null,98)},
dano:function(){var t=AC.currentTime;ruido(t,.25,.4);tom(110,t,.2,"square",.12,null,55)},
chefe:function(){var t=AC.currentTime;[57,56,55,54].forEach(function(n,i){tom(hz(n-12),t+i*.16,.15,"square",.16)})},
vitoria:function(){var t=AC.currentTime;[[72,0],[72,.12],[72,.24],[79,.36],[76,.6],[79,.72],[84,.84]].forEach(function(q){tom(hz(q[0]),t+q[1],q[0]===84?.5:.1,"square",.15)})},
ouro:function(){var t=AC.currentTime;[84,88,91,96].forEach(function(n,i){tom(hz(n),t+i*.05,.06,"triangle",.18)})},
throttle:function(){var t=AC.currentTime;tom(60,t,.4,"sawtooth",.06,null,58)}
};
function sfx(n){if(AC&&pref.som)try{SFX[n]()}catch(e){}}
/* trilhas originais: lead (quadrada), baixo (triângulo) e ruído; 0 = pausa */
var TEMAS={
calmo:{bpm:112,lead:[69,0,72,0,76,0,72,0,74,0,76,0,79,0,76,0, 77,0,76,0,74,0,72,0,71,0,72,0,74,0,0,0, 69,0,72,0,76,0,81,0,79,0,76,0,74,0,72,0, 71,0,72,0,74,0,71,0,69,0,0,0,0,0,0,0],
raiz:[45,41,48,40],baixo:[0,null,null,null,12,null,null,null,0,null,null,null,7,null,null,null],bat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
batalha:{bpm:152,lead:[62,65,69,65,62,65,69,72,70,69,65,62,61,62,64,65, 62,65,69,74,72,70,69,65,67,65,64,61,62,0,62,0, 65,69,72,69,65,69,72,77,76,74,72,69,67,69,70,72, 74,0,72,0,70,0,69,0,67,65,64,62,61,0,62,0],
raiz:[38,38,41,37],baixo:[0,12,0,12,0,12,0,12,0,12,0,12,0,12,0,12],bat:[2,0,1,0,3,0,1,0,2,0,1,2,3,0,1,0]}
};
var musica={tema:null,passo:0,prox:0,timer:0};
function tocar(nome){if(!AC)return;if(musica.tema===nome)return;musica.tema=nome;musica.passo=0;musica.prox=AC.currentTime+.05;if(!musica.timer)musica.timer=setInterval(agendar,25)}
function pararMusica(){clearInterval(musica.timer);musica.timer=0;musica.tema=null}
function agendar(){if(!AC||!musica.tema)return;var T=TEMAS[musica.tema],dur=60/T.bpm/4;
while(musica.prox<AC.currentTime+.12){var i=musica.passo%64,b=Math.floor(i/16),j=i%16,t=musica.prox;
var n=T.lead[i];if(n)tom(hz(n),t,dur*.9,"square",.09,musG);
var bx=T.baixo[j];if(bx!=null)tom(hz(T.raiz[b]+bx),t,dur*(musica.tema==="calmo"?3.5:.9),"triangle",.22,musG);
var k=T.bat[j];if(k===1)ruido(t,.04,.12,musG,true);else if(k===2)ruido(t,.12,.35,musG);else if(k===3)ruido(t,.1,.25,musG,true);
musica.passo++;musica.prox+=dur}}

/* ================= regras ================= */
var PECAS={
clock:{n:"Processador",cat:"CPU",base:12,cres:1.45,nomes:["desligado","1 MHz","4 MHz","33 MHz","200 MHz","1 GHz","3 GHz","5 GHz","6 GHz"],fato:"Clock é o ritmo da CPU: cada ciclo é um passo de trabalho. Mais clock exige mais tensão e gera mais calor."},
cooler:{n:"Refrigeração",cat:"TÉRMICA",base:20,cres:1.5,nomes:["passivo","cooler box","torre simples","torre dupla","water 240","water 360","custom loop","nitrogênio"],fato:"Quanto mais frio o chip, mais tempo ele sustenta o boost. No limite de temperatura, a CPU reduz o clock (thermal throttling)."},
ram:{n:"Memória",cat:"MEM",base:25,cres:1.48,nomes:["sem RAM","64 KB","1 MB SDRAM","256 MB DDR","2 GB DDR2","8 GB DDR3","16 GB DDR4","32 GB DDR5","64 GB DDR5"],fato:"Se a memória não entrega dados rápido, a CPU fica parada esperando. É o gargalo de memória."},
disco:{n:"Armazenamento",cat:"E/S",base:30,cres:1.47,nomes:["fita","disquete","HD 5400 rpm","HD 7200 rpm","SSD SATA","NVMe PCIe 3.0","NVMe PCIe 4.0","NVMe PCIe 5.0"],fato:"O armazenamento guarda tudo de forma permanente, mas é o nível mais lento da hierarquia."},
cache:{n:"Cache",cat:"CPU",base:300,cres:1.7,nomes:["sem cache","L1 8 KB","L2 256 KB","L3 2 MB","L3 8 MB","L3 32 MB","L3 96 MB (3D)","L3 128 MB"],fato:"O cache guarda perto da CPU o que ela vai usar em seguida, evitando esperar a RAM."},
nucleos:{n:"Núcleos",cat:"CPU",base:4e4,cres:2.2,nomes:["1 núcleo","2 núcleos","4 núcleos","8 núcleos","12 núcleos","16 núcleos","24 núcleos","32 núcleos"],fato:"Mais núcleos só ajudam na parte do trabalho que pode ser dividida (lei de Amdahl)."},
gpu:{n:"GPU",cat:"GPU",base:3e7,cres:1.9,nomes:["nenhuma","GPU de entrada","GPU intermediária","GPU forte","GPU topo","duas GPUs"],fato:"A GPU tem milhares de núcleos simples que fazem a mesma conta em muitos dados ao mesmo tempo."},
npu:{n:"NPU",cat:"IA",base:2e9,cres:1.9,nomes:["nenhuma","NPU 10 TOPS","NPU 40 TOPS","NPU 80 TOPS","NPU 120 TOPS"],fato:"A NPU acelera cálculos de IA gastando pouca energia."}
};
var ORDEM=["clock","cooler","ram","disco","cache","nucleos","gpu","npu"];
var ERAS=[[0,"8 bits"],[2e3,"16 bits"],[8e4,"32 bits"],[4e6,"64 bits"],[2e8,"Multinúcleo"],[1e10,"GPU e IA"]];
function era(s){var e=0;ERAS.forEach(function(x,i){if(s.total>=x[0])e=i});return e}
var LIBERA={
clock:{ok:function(){return true}},cooler:{ok:function(){return true}},
ram:{ok:function(s){return s.total>=25},dica:"Junte 25 ciclos: a CPU precisa de onde buscar dados."},
disco:{ok:function(s){return s.niv.ram>=1},dica:"Compre a primeira memória."},
cache:{ok:function(s){return s.viuMem||s.total>=3e3},dica:"Apareça um gargalo de memória."},
nucleos:{ok:function(s){return era(s)>=2},dica:"Chegue à era de 32 bits."},
gpu:{ok:function(s){return era(s)>=4},dica:"Chegue à era multinúcleo."},
npu:{ok:function(s){return era(s)>=5},dica:"Chegue à era de GPU e IA."}
};
var MELHORIAS=[
{id:"pasta",n:"Pasta térmica nova",c:150,ok:function(s){return s.niv.cooler>=2},ef:"Refrigeração +50%",f:"A pasta preenche as falhas microscópicas entre a CPU e o cooler e melhora a passagem de calor."},
{id:"dual",n:"Dual channel",c:600,ok:function(s){return s.niv.ram>=3},ef:"Memória ×2",f:"Dois módulos iguais em canais diferentes dobram a largura de banda da memória."},
{id:"ssd",n:"Trocar HD por SSD",c:2500,ok:function(s){return s.niv.disco>=4},ef:"Armazenamento ×2",f:"Sem partes móveis, o SSD acessa dados centenas de vezes mais rápido que o HD."},
{id:"xmp",n:"Perfil XMP/EXPO",c:8e3,ok:function(s){return s.niv.ram>=6},ef:"Memória ×1,5",f:"Sem o perfil, a memória roda abaixo da velocidade anunciada na caixa."},
{id:"pipeline",n:"Pipeline",c:2e4,ok:function(s){return s.niv.clock>=7},ef:"CPU ×1,5",f:"Como numa linha de montagem, cada etapa trabalha em uma instrução diferente ao mesmo tempo."},
{id:"preditor",n:"Previsão de desvios",c:3e5,ok:function(s){return s.mel.indexOf("pipeline")>=0&&s.niv.clock>=10},ef:"CPU ×1,4",f:"A CPU adivinha o caminho dos ifs para não parar o pipeline. Errar custa 10 a 20 ciclos."},
{id:"smt",n:"SMT (Hyper-Threading)",c:2e5,ok:function(s){return s.niv.nucleos>=2},ef:"CPU ×1,25",f:"Cada núcleo atende duas threads, aproveitando os momentos em que uma espera dados."},
{id:"nvme",n:"SSD NVMe",c:5e5,ok:function(s){return s.mel.indexOf("ssd")>=0&&s.niv.disco>=7},ef:"Armazenamento ×2",f:"O NVMe usa linhas PCIe e passa de 7 GB/s, contra cerca de 550 MB/s do SATA."},
{id:"undervolt",n:"Undervolt",c:2e6,ok:function(s){return s.niv.cooler>=6},ef:"Calor −30%",f:"Menos tensão na mesma frequência: o consumo cai com o quadrado da tensão."},
{id:"pcie5",n:"PCIe 5.0",c:8e7,ok:function(s){return s.niv.gpu>=1},ef:"Armazenamento ×1,6",f:"Cada geração do PCIe dobra a largura de banda por linha."}
];
var CHEFES=[
{n:"Vírus de boot",fala:"Infectei o setor de inicialização!",cats:["Hardware","Software"],m:["   #     #     #    ","    #    #    #     ","     #########      ","   #############    ","  ###############   ","  ###  #####  ###   ","#####  #####  #####","  ###############   ","  ##.#.#.#.#.#.##   ","  ###############   ","   ##  ##  ##  ##   ","   #############    ","     #########      ","    #    #    #     ","   #     #     #    "]},
{n:"Worm",fala:"Vou me copiar por toda a sua rede!",cats:["Redes"],m:["          #####     ","         #######    ","         ## # ##    ","   ###   #######    ","  #####  #######    "," ####### ##.#.##    "," ###############    "," #####.#####.###    ","  ###########       ","   ###.###.##       ","   #########        ","    #######         ","     ###            "]},
{n:"Cavalo de Troia",fala:"Pareço um programa útil... mas não sou.",cats:["Software","Segurança"],m:["        ######      ","       ########     ","      ### ######    ","      ##########    ","        ########    ","        #######     ","   ############     ","  ##############    "," ###.#.#.#.#.###    "," ###############    "," ##  ##    ##  ##   "," ##  ##    ##  ##   ","#### ####  #### ####"]},
{n:"Superaquecimento",fala:"Seu cooler não dá conta de mim!",cats:["Hardware"],m:["         #          ","        ##          ","        ###   #     ","   #   ####   ##    ","   ##  #####  ###   ","   ### ############ ","   ################ ","  #####.....####### ","  ####.......###### ","  ###...#.#...####  ","  ###.........####  ","   ##..#####..###   ","    ##.......##     ","      #######       "]},
{n:"Phishing",fala:"Clique aqui para confirmar sua senha!",cats:["Segurança","Redes"],m:["   ###########      ","   #.........#      ","   ##.......##      ","   #.##...##.#      ","   #...###...#      ","   ###########      ","         #          ","         #          ","         #          ","   #     #          ","   ##    #          ","    ##  ##          ","     ####           "]},
{n:"Ransomware",fala:"Seus arquivos são meus. Pague o resgate!",cats:["Segurança","Software","Programação"],m:["      ######        ","     ##    ##       ","    ##      ##      ","    ##      ##      ","  ##############    ","  ##############    ","  ###  ####  ###    ","  ###  ####  ###    ","  ######..######    ","  #####.##.#####    ","  ##############    ","  ###.#.#.#.####    ","  ##############    "]}
];
var CONQUISTAS=[
{id:"c100",n:"Dedo rápido",f:"Você clicou 100 vezes. Uma CPU faz isso em menos de um nanossegundo.",ok:function(s){return s.cliques>=100}},
{id:"throttle",n:"Primeiro throttling",f:"Calor demais fez a CPU reduzir o clock. Refrigeração também é desempenho.",ok:function(s,r){return r.throttle<1}},
{id:"memgar",n:"A CPU está esperando",f:"Primeiro gargalo de memória: a CPU para quando os dados não chegam a tempo.",ok:function(s){return s.viuMem}},
{id:"mil",n:"Mil por segundo",f:"Mil ciclos por segundo. Um processador real faz bilhões.",ok:function(s,r){return r.prod>=1000}},
{id:"q10",n:"Estudioso",f:"10 perguntas certas. Saber o porquê vale mais que decorar.",ok:function(s){return s.acertos>=10}},
{id:"v1",n:"Primeira defesa",f:"Você venceu seu primeiro chefe.",ok:function(s){return s.vitorias>=1}}
];
var ITENS={antivirus:["Antivírus","Elimina duas alternativas erradas"],firewall:["Firewall","Bloqueia o dano do próximo erro"],backup:["Backup","Recupera um coração"],patch:["Patch","Mostra a área do termo como dica"]};

function novo(hard){return {c:0,total:0,nivel:1,xp:0,niv:{clock:0,cooler:0,ram:0,disco:0,cache:0,nucleos:0,gpu:0,npu:0},mel:[],itens:{antivirus:1,firewall:0,backup:0,patch:0},cartas:[],conq:[],vitorias:0,infec:false,hard:!!hard,acertos:0,cliques:0,viuMem:false,iniciado:false,t:Date.now(),liberadas:["clock","cooler"]}}
function carregar(){try{var s=JSON.parse(localStorage.getItem(SALVO));if(s&&s.niv)return s}catch(e){}return null}
function salvar(s){try{s.t=Date.now();localStorage.setItem(SALVO,JSON.stringify(s))}catch(e){}}
function fmt(n){if(n<1000)return n<10?(Math.floor(n*10)/10).toFixed(1).replace(".",","):Math.floor(n).toString();var u=["mil","mi","bi","tri","qa","qi","sx"],i=-1;while(n>=1000&&i<u.length-1){n/=1000;i++}return n.toFixed(n<10?2:1).replace(".",",")+" "+u[i]}
function custo(k,s){var p=PECAS[k];return Math.ceil(p.base*Math.pow(p.cres,s.niv[k]))}
function nome(k,l){var nm=PECAS[k].nomes;return nm[Math.min(nm.length-1,l)]}
function tem(s,id){return s.mel.indexOf(id)>=0}
function reqNivel(n){return 60*Math.pow(5,n-1)}

/* o modelo: quem entrega quanto e quem limita */
function calcular(s,bonus){
var n=s.niv;if(!n.clock)return {cpu:0,mem:0,io:0,prod:0,gar:"CPU",calor:0,capac:1,throttle:1,mult:1,nucleos:1};
var nuc=[1,2,4,8,12,16,24,32][Math.min(7,n.nucleos)],amd=1/((1-.85)+.85/nuc);
var calor=Math.pow(n.clock,1.3)*(1+n.nucleos*.3)*(tem(s,"undervolt")?.7:1);
var capac=3.2*Math.pow(1.42,n.cooler)*(tem(s,"pasta")?1.5:1);
var thr=calor>capac?Math.max(.3,capac/calor):1;
var cpu=.8*Math.pow(1.32,n.clock-1)*amd*(1+n.cache*.25)*thr*(tem(s,"pipeline")?1.5:1)*(tem(s,"preditor")?1.4:1)*(tem(s,"smt")?1.25:1);
var mem=.9*Math.pow(1.36,n.ram)*(1+n.cache*.12)*(tem(s,"dual")?2:1)*(tem(s,"xmp")?1.5:1);
var io=1.1*Math.pow(1.35,n.disco)*(tem(s,"ssd")?2:1)*(tem(s,"nvme")?2:1)*(tem(s,"pcie5")?1.6:1);
var mult=Math.pow(1.15,s.vitorias)*(1+n.gpu*.6)*(s.hard?1.5:1)*(s.infec?.7:1)*(bonus||1);
var base=Math.min(cpu,mem,io),gar=cpu<=mem&&cpu<=io?(thr<1?"TÉRMICA":"CPU"):mem<=io?"MEM":"E/S";
return {cpu:cpu,mem:mem,io:io,prod:base*mult,gar:gar,calor:calor,capac:capac,throttle:thr,mult:mult,nucleos:nuc};
}

/* ================= desenho 1-bit ================= */
function pont(g,x,y,w,h,d){for(var j=0;j<h;j++)for(var i=0;i<w;i++){if(d<.3?((i+j*2)%4===0&&j%2===0):d<.6?((i+j)%2===0):((i+j)%2===0||i%2===0))g.fillRect(x+i,y+j,1,1)}}
function sprite(g,m,ox,oy,esc){m.forEach(function(l,y){for(var x=0;x<l.length;x++){var c=l[x];if(c==="#")g.fillRect(ox+x*esc,oy+y*esc,esc,esc);else if(c===".")for(var a=0;a<esc;a++)for(var b=0;b<esc;b++)if((a+b)%2===0)g.fillRect(ox+x*esc+a,oy+y*esc+b,1,1)}})}

function montar(raiz,questoes,glossario){
var s=carregar(),bonus=1,bonusAte=0,cliqueX=1,sequencia=0,vivo=true,frame=0,ultimo=performance.now(),proxQuiz=0,proxOuro=0,ouroAte=0,bits=[],flash=0,chefe=null,emChefe=false,aviso="",avisoAte=0,lojaAba="pecas",abaMob="loja";
document.body.classList.add("modo-jogo");
raiz.innerHTML=
'<div class="gx" tabindex="-1">'+
'<div class="gx-inicio"><div class="gx-caixa"><canvas class="gx-logo" width="128" height="40"></canvas><h1>GARGALO</h1>'+
'<p>Clique no PC para processar. Compre peças para ele trabalhar sozinho.</p><p>A produção sempre para na peça mais fraca: descubra qual é e resolva.</p><p>A cada nível, um chefe aparece. Vença acertando os termos do glossário.</p>'+
'<p class="gx-ctl">CLIQUE OU ESPAÇO = PROCESSAR</p><div class="gx-ops"><label><input type="checkbox" id="gx-hard"> Modo Hardcore: perder para um chefe reinicia tudo, mas a produção é 50% maior</label></div>'+
'<p class="gx-fora" hidden></p><button class="gx-btn gx-iniciar">[ INICIAR ]</button><button class="gx-btn gx-sec gx-novo" hidden>COMEÇAR DO ZERO</button><div class="gx-confirma" hidden><p>Apagar todo o progresso?</p><button class="gx-btn gx-sec gx-sim">SIM, APAGAR</button><button class="gx-btn gx-sec gx-nao">CANCELAR</button></div>'+
'<a class="gx-sair-ini" href="#/">voltar ao Bancada</a></div></div>'+
'<div class="gx-jogo" hidden>'+
'<header class="gx-top"><span class="gx-k" title="Ciclos"><canvas class="ic" data-i="bit"></canvas><b class="gx-c">0</b></span><span class="gx-k" title="Ciclos por segundo"><canvas class="ic" data-i="raio"></canvas><b class="gx-ps">0</b><small>/s</small></span>'+
'<span class="gx-k gx-niv" title="Nível: quando a barra enche, um chefe aparece"><canvas class="ic" data-i="caveira"></canvas><b class="gx-nivt">NV 1</b><span class="gx-barra"><i></i></span></span><span class="gx-k gx-bon"></span>'+
'<span class="gx-bts"><button class="gx-ic gx-som" aria-label="Efeitos sonoros" title="Efeitos sonoros"><canvas class="ic" data-i="som"></canvas></button><button class="gx-ic gx-mus" aria-label="Música" title="Música"><canvas class="ic" data-i="nota"></canvas></button><a class="gx-ic" href="#/" title="Sair do jogo">SAIR</a></span></header>'+
'<section class="gx-pecas" aria-label="Peças principais"></section>'+
'<section class="gx-quadro"><div class="gx-tela"><canvas class="gx-pc" width="160" height="112" aria-label="Seu computador. Clique para processar."></canvas></div><div class="gx-balao"></div><span class="gx-era"></span><button class="gx-ouro" hidden aria-label="Bit dourado">1</button></section>'+
'<section class="gx-lado"><div class="gx-med"></div><div class="gx-avanc" aria-label="Peças avançadas"></div><div class="gx-mapa" title="Chefes: preenchido = vencido, listrado = o próximo"></div>'+
'<div class="gx-menu"><button class="gx-ic2 gx-bmel"><canvas class="ic" data-i="estrela"></canvas><span>MELHORIAS</span><b class="gx-nmel"></b></button><button class="gx-ic2 gx-bcar"><canvas class="ic" data-i="livro"></canvas><span>CARTAS</span><b class="gx-ncar"></b></button></div></section>'+
'<section class="gx-base"><div class="gx-itens" aria-label="Itens"></div><button class="gx-proc">PROCESSAR</button></section>'+
'<p class="gx-dica" aria-live="polite"></p>'+
'</div>'+
'<div class="gx-modal" hidden><div class="gx-cx"><div class="gx-mt"><b class="gx-mtt"></b><button class="gx-ic gx-fechar" aria-label="Fechar">X</button></div><div class="gx-mc"></div></div></div>'+
'<div class="gx-chefe" hidden><div class="gx-cx"><div class="gx-ch-top"><b class="gx-ch-n"></b><span class="gx-ch-hp"></span></div><canvas class="gx-ch-cv" width="120" height="72"></canvas><p class="gx-ch-fala"></p>'+
'<div class="gx-ch-def"></div><div class="gx-ch-ops"></div><div class="gx-ch-pe"><span class="gx-ch-voce"></span><div class="gx-ch-itens"></div></div><p class="gx-ch-msg"></p></div></div>'+
'</div>';
var $=function(q){return raiz.querySelector(q)},$$=function(q){return raiz.querySelectorAll(q)};
var gx=$(".gx"),pc=$(".gx-pc"),g=pc.getContext("2d"),cc=$(".gx-ch-cv"),gc=cc.getContext("2d");
g.imageSmoothingEnabled=false;gc.imageSmoothingEnabled=false;
/* o PC ocupa o maior tamanho que cabe na área, em múltiplos inteiros quando possível (pixels nítidos) */
var tela=$(".gx-tela"),ajustar=function(){var w=tela.clientWidth,hh=tela.clientHeight;if(!w||!hh)return;var esc=Math.min(w/160,hh/112);if(esc>=2)esc=Math.floor(esc);pc.style.width=Math.floor(160*esc)+"px";pc.style.height=Math.floor(112*esc)+"px"};
var ro=window.ResizeObserver?new ResizeObserver(ajustar):null;if(ro)ro.observe(tela);window.addEventListener("resize",ajustar);

/* ---------- tela de início ---------- */
(function(){var lg=$(".gx-logo").getContext("2d");lg.fillStyle="#fff";sprite(lg,["  ##########  "," #..........# "," #.########.# "," #.#      #.# "," #.#  ##  #.# "," #.########.# "," #..........# ","  ####  ####  ","   ########   "],36,2,4)})();
if(s&&s.iniciado){$(".gx-iniciar").textContent="[ CONTINUAR ]";$(".gx-novo").hidden=false;$("#gx-hard").checked=!!s.hard;$("#gx-hard").disabled=true;
var fora=Math.min(8*3600,(Date.now()-(s.t||Date.now()))/1000);if(fora>30){var gf=calcular(s).prod*fora*.5;s.ganhoFora=gf;$(".gx-fora").hidden=false;$(".gx-fora").textContent="Enquanto você estava fora, seu PC processou "+fmt(gf)+" ciclos."}}
$(".gx-novo").onclick=function(){$(".gx-confirma").hidden=false};$(".gx-nao").onclick=function(){$(".gx-confirma").hidden=true};
$(".gx-sim").onclick=function(){try{localStorage.removeItem(SALVO)}catch(e){}s=null;$(".gx-confirma").hidden=true;$(".gx-novo").hidden=true;$(".gx-fora").hidden=true;$(".gx-iniciar").textContent="[ INICIAR ]";$("#gx-hard").disabled=false;$("#gx-hard").checked=false};
$(".gx-iniciar").onclick=function(){
ligarAudio();if(AC&&AC.state==="suspended")AC.resume();
if(!s)s=novo($("#gx-hard").checked);if(s.ganhoFora){s.c+=s.ganhoFora;s.total+=s.ganhoFora;s.xp+=s.ganhoFora;delete s.ganhoFora}
s.iniciado=true;$(".gx-inicio").hidden=true;$(".gx-jogo").hidden=false;if(pref.mus)tocar("calmo");sfx("libera");
proxQuiz=Date.now()+60000;proxOuro=Date.now()+40000+Math.random()*40000;montarSlots();desenharItens();atualizarSom();gx.focus();salvar(s)};

/* ---------- controles ---------- */
function atualizarSom(){$(".gx-som").classList.toggle("off",!pref.som);$(".gx-mus").classList.toggle("off",!pref.mus)}
$(".gx-som").onclick=function(){pref.som=!pref.som;if(sfxG)sfxG.gain.value=pref.som?.55:0;salvarPref();atualizarSom()};
$(".gx-mus").onclick=function(){pref.mus=!pref.mus;if(musG)musG.gain.value=pref.mus?.32:0;if(pref.mus)tocar(emChefe?"batalha":"calmo");salvarPref();atualizarSom()};
$(".gx-bmel").onclick=abrirMelhorias;$(".gx-bcar").onclick=abrirCartas;
$(".gx-fechar").onclick=fecharModal;

function clique(){if(!s||emChefe||$(".gx-jogo").hidden)return;var r=calcular(s,bonus);var v=Math.max(1,r.prod*.35+1)*(1+s.niv.npu*.5)*cliqueX;s.c+=v;s.total+=v;s.xp+=v;s.cliques++;flash=3;sfx("clique");
for(var i=0;i<2;i++)bits.push({x:80+Math.random()*30-15,y:60,vx:Math.random()*1.6-.8,vy:-1-Math.random(),t:Math.random()<.5?"0":"1",v:36})}
pc.addEventListener("click",clique);$(".gx-proc").addEventListener("click",clique);
function tecla(e){if(e.code==="Space"&&!emChefe&&s&&!$(".gx-jogo").hidden&&e.target.tagName!=="BUTTON"&&e.target.tagName!=="INPUT"){e.preventDefault();clique()}}
document.addEventListener("keydown",tecla);

/* ---------- ícones 12×12 em 1 bit ---------- */
function icone(cv,k){if(!cv)return;cv.width=12;cv.height=12;var c=cv.getContext("2d");c.clearRect(0,0,12,12);c.fillStyle="#fff";sprite(c,IC[k]||IC.bit,0,0,1)}
var IC={
clock:["  # # # #   "," ########## ","##        ##"," # ###### # ","## #    # ##"," # # ## # # ","## # ## # ##"," # #    # # ","## ###### ##"," #        # "," ########## ","  # # # #   "],
ram:["            ","            ","############","#          #","# ## ## ## #","# ## ## ## #","#          #","############","# # #  # # #","############","            ","            "],
disco:["            ","            ","            ","############","#  ##  ### #","## ##  ### #","#  ##  ### #","############","            ","            ","            ","            "],
cooler:["############","#    ##    #","#  # ## #  #","#   #  #   #","#  ##  ##  #","###  ##  ###","###  ##  ###","#  ##  ##  #","#   #  #   #","#  # ## #  #","#    ##    #","############"],
cache:["            ","  ########  ","  #      #  ","  ########  ","    ####    "," ########## "," #        # "," ########## ","    ####    ","############","#          #","############"],
nucleos:["############","#    ##    #","# ## ## ## #","# ## ## ## #","#    ##    #","############","############","#    ##    #","# ## ## ## #","# ## ## ## #","#    ##    #","############"],
gpu:["            ","############","#  ##  ##  #","# #  ## #  #","# #  ## #  #","#  ##  ##  #","############","#   ######  ","    ######  ","            ","            ","            "],
npu:["  # # # #   "," ########## ","##        ##"," #   ##   # ","##   ##   ##"," # ###### # ","## ###### ##"," #   ##   # ","##   ##   ##"," #        # "," ########## ","  # # # #   "],
bit:["   ######   ","  #      #  "," #   ##   # ","#   ###    #","#    ##    #","#    ##    #","#    ##    #","#    ##    #","#   ####   #"," #        # ","  #      #  ","   ######   "],
raio:["      ###   ","     ###    ","    ###     ","   ###      ","  ########  ","     ###    ","    ###     ","   ###      ","  ###       "," ##         ","            ","            "],
caveira:["  ########  "," ########## ","############","###  ##  ###","###  ##  ###","############"," ##### #### ","  ## ## ##  ","  ########  ","   # # # #  ","            ","            "],
som:["     #      ","    ##   #  ","   ###    # ","######  # # ","######   # #","######   # #","######  # # ","   ###    # ","    ##   #  ","     #      ","            ","            "],
nota:["     ###### ","     #    # ","     ###### ","     #    # ","     #    # ","     #    # ","  ####  ### "," #####  ####"," ####    ## ","            ","            ","            "],
antivirus:["############","#          #","#        # #","#       #  #","# #    #   #","#  #  #    #"," #  ##    # "," #       #  ","  #     #   ","   #   #    ","    ###     ","            "],
firewall:["############","#   #   #  #","############","#  #   #   #","############","#   #   #  #","############","#  #   #   #","############","            ","            ","            "],
backup:[" ###   ###  ","##### ##### ","########### ","########### ","########### "," #########  ","  #######   ","   #####    ","    ###     ","     #      ","            ","            "],
patch:["   ####     ","  #    #    ","  # ## #    ","  #    #    ","   ####     ","    ##      ","    ##      ","    ####    ","    ##      ","    ###     ","            ","            "],
termo:["    ##      ","   #  #     ","   #  #  ## ","   #  #     ","   #  #  #  ","   ####     ","   ####  ## ","  ######    ","  ######    ","   ####     ","            ","            "],
estrela:["     ##     ","     ##     ","    ####    ","############"," ########## ","  ########  ","   ######   ","  ###  ###  ","  ##    ##  "," ##      ## ","            ","            "],
livro:["            "," ##### #####","#     #    #","# ### # ## #","#     #    #","# ### # ## #","#     #    #","# ### # ## #","#     #    #"," ##### #####","     ##     ","            "]
};
var CURTO={clock:"CPU",ram:"RAM",disco:"SSD",cooler:"COOLER",cache:"CACHE",nucleos:"NÚCLEOS",gpu:"GPU",npu:"NPU"};
var PRINCIPAIS=["clock","ram","disco","cooler"],AVANCADAS=["cache","nucleos","gpu","npu"];
$$("canvas.ic[data-i]").forEach(function(c){icone(c,c.dataset.i)});

/* ---------- peças como slots de ícone: mouse compra no clique; no toque, o 1º toque explica e o 2º compra ---------- */
var tipoPonteiro="mouse",selecionada=null,dicaFixa="",dicaAte=0;
function slot(k){var b=document.createElement("button");b.className="gx-s";b.dataset.k=k;
b.innerHTML='<span class="glv"></span><span class="gq"></span><canvas class="ic"></canvas><span class="nm"></span>';icone(b.querySelector("canvas"),k);
b.addEventListener("pointerdown",function(e){tipoPonteiro=e.pointerType||"mouse"});
b.addEventListener("mouseenter",function(){explicar(k)});b.addEventListener("focus",function(){explicar(k)});
b.onclick=function(){if(s.liberadas.indexOf(k)<0){explicar(k);return}if(tipoPonteiro!=="mouse"&&selecionada!==k){selecionada=k;explicar(k);estadoSlots(calcular(s,bonus));return}comprar(k)};
return b}
function explicar(k){var p=PECAS[k];if(s.liberadas.indexOf(k)<0){dica("??? · "+(LIBERA[k].dica||""));return}var l=s.niv[k];
dica(p.n+" · nv "+l+" ("+nome(k,l)+(l<p.nomes.length-1?" → "+nome(k,l+1):"")+") · custo "+fmt(custo(k,s))+(tipoPonteiro!=="mouse"?" · toque de novo para comprar":""))}
function montarSlots(){var a=$(".gx-pecas"),b=$(".gx-avanc");a.textContent="";b.textContent="";PRINCIPAIS.forEach(function(k){a.appendChild(slot(k))});AVANCADAS.forEach(function(k){b.appendChild(slot(k))});estadoSlots(calcular(s,bonus))}
function limitante(r){if(!s.niv.clock)return "clock";return {CPU:"clock",MEM:"ram","E/S":"disco","TÉRMICA":"cooler"}[r.gar]}
function estadoSlots(r){var lim=limitante(r);
$$(".gx-s[data-k]").forEach(function(b){var k=b.dataset.k,lib=s.liberadas.indexOf(k)>=0,c2=custo(k,s);
b.classList.toggle("bloq",!lib);b.classList.toggle("pode",lib&&s.c>=c2);b.classList.toggle("lim",lib&&k===lim);b.classList.toggle("sel",selecionada===k);
b.querySelector(".nm").textContent=lib?CURTO[k]:"???";b.querySelector(".gq").textContent=lib?fmt(c2):"";b.querySelector(".glv").textContent=lib?s.niv[k]:""})}
function comprar(k){var c2=custo(k,s);if(s.c<c2){dica("Faltam "+fmt(c2-s.c)+" ciclos para "+PECAS[k].n+".");return}s.c-=c2;s.niv[k]++;sfx("compra");selecionada=null;if(s.niv[k]===1)carta(PECAS[k].n,PECAS[k].fato);explicar(k);estadoSlots(calcular(s,bonus));salvar(s)}
function liberar(){ORDEM.forEach(function(k){if(s.liberadas.indexOf(k)<0&&LIBERA[k].ok(s)){s.liberadas.push(k);sfx("libera");noticia("NOVO: "+PECAS[k].n.toUpperCase());carta(PECAS[k].n,PECAS[k].fato)}})}

/* ---------- janelas: melhorias, cartas e pergunta relâmpago ---------- */
var modalAberto=null;
function abrirModal(titulo,id){modalAberto=id;$(".gx-mtt").textContent=titulo;$(".gx-mc").textContent="";$(".gx-modal").hidden=false;$(".gx-fechar").hidden=false;return $(".gx-mc")}
function fecharModal(){if(modalAberto==="quiz"&&evAtivo)return;$(".gx-modal").hidden=true;modalAberto=null}
function abrirMelhorias(){var c=abrirModal("MELHORIAS","mel"),vis=MELHORIAS.filter(function(m){return tem(s,m.id)||m.ok(s)});
if(!vis.length){c.innerHTML='<p class="gx-vazio">As melhorias aparecem conforme suas peças evoluem. Suba a refrigeração para ver a primeira.</p>';return}
vis.forEach(function(m){var b=document.createElement("button");b.className="gx-u";b.innerHTML='<canvas class="ic"></canvas><span class="gx-un"></span><span class="gx-ul"></span><span class="gx-uc"></span>';icone(b.querySelector("canvas"),"estrela");
b.querySelector(".gx-un").textContent=m.n;b.querySelector(".gx-ul").textContent=m.ef+" · "+m.f;
if(tem(s,m.id)){b.disabled=true;b.classList.add("feito");b.querySelector(".gx-uc").textContent="OK"}else{b.querySelector(".gx-uc").textContent=fmt(m.c);b.disabled=s.c<m.c;b.onclick=function(){comprarMel(m)}}c.appendChild(b)})}
function comprarMel(m){if(s.c<m.c||tem(s,m.id))return;s.c-=m.c;s.mel.push(m.id);sfx("libera");carta(m.n,m.f);noticia(m.n.toUpperCase()+"!");abrirMelhorias();salvar(s)}
function abrirCartas(){var c=abrirModal("CARTAS ("+s.cartas.length+")","car");if(!s.cartas.length){c.innerHTML='<p class="gx-vazio">Cada peça, melhoria e chefe vencido vira uma carta com o que ela ensina.</p>';return}
s.cartas.forEach(function(t){var p=document.createElement("p");p.className="gx-carta";var i=t.indexOf(": ");var b=document.createElement("b");b.textContent=t.slice(0,i);p.appendChild(b);p.appendChild(document.createTextNode(t.slice(i+1)));c.appendChild(p)})}

/* ---------- cartas, avisos, itens ---------- */
function carta(t,f){var txt=t+": "+f;if(s.cartas.indexOf(txt)>=0)return;s.cartas.unshift(txt);s.cartas=s.cartas.slice(0,80)}
function noticia(t){aviso=t;avisoAte=Date.now()+3500}
function dica(t){dicaFixa=t;dicaAte=Date.now()+6000;$(".gx-dica").textContent=t}
function ganharItem(){var ks=Object.keys(ITENS),k=ks[Math.floor(Math.random()*ks.length)];s.itens[k]=(s.itens[k]||0)+1;desenharItens();return ITENS[k][0]}
function desenharItens(){var el=$(".gx-itens");el.textContent="";Object.keys(ITENS).forEach(function(k){var d=document.createElement("button");d.className="gx-s gx-it"+(s.itens[k]?"":" zero");d.innerHTML='<span class="gq"></span><canvas class="ic"></canvas><span class="nm"></span>';
d.querySelector(".gq").textContent=s.itens[k]||0;d.querySelector(".nm").textContent=ITENS[k][0].toUpperCase();icone(d.querySelector("canvas"),k);
d.onmouseenter=d.onfocus=d.onclick=function(){dica(ITENS[k][0]+" · "+ITENS[k][1]+". Use nas batalhas contra chefes.")};el.appendChild(d)})}
function desenharIcone(cv,k){icone(cv,k)}

/* ---------- gargalo: medidores, balão e frase ---------- */
var FRASE={CPU:["A CPU ESTÁ NO LIMITE","A CPU é o gargalo: suba o processador, o cache ou os núcleos."],MEM:["A CPU ESPERA A MEMÓRIA","A CPU está parada esperando dados: melhore a RAM."],"E/S":["O DISCO ESTÁ LENTO","Os dados demoram a sair do disco: melhore o armazenamento."],"TÉRMICA":["QUENTE DEMAIS!","Calor demais: a CPU reduziu o clock. Melhore a refrigeração."]};
function painelGargalo(r){
var mx=Math.max(r.cpu,r.mem,r.io)||1,t=Math.min(1,r.calor/r.capac),lim=limitante(r);
var h="";[["clock",r.cpu/mx,fmt(r.cpu*r.mult)+"/s"],["ram",r.mem/mx,fmt(r.mem*r.mult)+"/s"],["disco",r.io/mx,fmt(r.io*r.mult)+"/s"],["cooler",t,r.throttle<1?"!!":Math.round(t*100)+"%"]].forEach(function(l){
h+='<div class="gx-m'+(s.niv.clock&&l[0]===lim?" lim":"")+'" data-i="'+(l[0]==="cooler"?"termo":l[0])+'"><canvas class="ic"></canvas><span class="gx-mb"><i style="width:'+Math.max(4,l[1]*100)+'%"></i></span><em>'+l[2]+'</em></div>'});
var med=$(".gx-med");med.innerHTML=h;med.querySelectorAll(".gx-m").forEach(function(m){icone(m.querySelector("canvas"),m.dataset.i)});
var f=s.niv.clock?FRASE[r.gar]:["CLIQUE PARA LIGAR","Clique no PC para processar. Com 12 ciclos, compre o processador para ele trabalhar sozinho."];
var bal=$(".gx-balao");bal.textContent=aviso&&Date.now()<avisoAte?aviso:(s.infec?"PC INFECTADO!":f[0]);bal.classList.toggle("aviso",!!(aviso&&Date.now()<avisoAte));
if(Date.now()>dicaAte)$(".gx-dica").textContent=s.infec?"PC infectado: produção −30% até vencer o chefe na revanche.":f[1];
var mp=$(".gx-mapa");if(mp.dataset.n!==String(s.nivel)){mp.dataset.n=s.nivel;mp.textContent="";var ini=Math.floor((s.nivel-1)/12)*12;for(var i=0;i<12;i++){var c=document.createElement("i");if(ini+i<s.nivel-1)c.className="f";else if(ini+i===s.nivel-1)c.className="b";mp.appendChild(c)}}
var novas=MELHORIAS.filter(function(m){return !tem(s,m.id)&&m.ok(s)}).length;$(".gx-nmel").textContent=novas?novas:"";$(".gx-bmel").classList.toggle("novo",novas>0);$(".gx-ncar").textContent=s.cartas.length||"";
$(".gx-era").textContent="ERA "+ERAS[era(s)][1].toUpperCase();
}

/* ---------- eventos: pergunta relâmpago e bit dourado ---------- */
var evAtivo=false;
function perguntaRelampago(){
if(!questoes||!questoes.length||modalAberto)return;evAtivo=true;var q=questoes[Math.floor(Math.random()*questoes.length)],ev=abrirModal("PERGUNTA RELÂMPAGO","quiz");$(".gx-fechar").hidden=true;ev.innerHTML='<p class="gx-qp"></p><div class="gx-qo"></div><p class="gx-qr"></p>';
ev.querySelector(".gx-qp").textContent=q.p;sfx("libera");
q.o.forEach(function(o,i){var b=document.createElement("button");b.textContent=String.fromCharCode(65+i)+") "+o;b.onclick=function(){
ev.querySelectorAll("button").forEach(function(x,j){x.disabled=true;if(j===q.c)x.classList.add("certa");else if(j===i)x.classList.add("errada")});
var ok=i===q.c,r=ev.querySelector(".gx-qr");
if(ok){sequencia++;s.acertos++;var mult=sequencia>=3?3:2;bonus=mult;cliqueX=mult;bonusAte=Date.now()+45000;var item=Math.random()<.35?ganharItem():null;sfx("acerto");
r.textContent="Certo! Produção e cliques ×"+mult+" por 45 s"+(item?" e você ganhou: "+item:"")+". "+q.e}else{sequencia=0;sfx("erro");r.textContent="Não foi dessa vez. "+q.e}
evAtivo=false;var fe=document.createElement("button");fe.className="gx-btn";fe.textContent="CONTINUAR";fe.onclick=fecharModal;ev.appendChild(fe);fe.focus()};ev.querySelector(".gx-qo").appendChild(b)});
}
var ouro=$(".gx-ouro");
ouro.onclick=function(){ouro.hidden=true;sfx("ouro");var r=Math.random(),pr=calcular(s,1).prod;
if(r<.45){bonus=5;bonusAte=Date.now()+20000;noticia("Bit dourado: produção ×5 por 20 s!")}else if(r<.75){noticia("Bit dourado: você ganhou "+ganharItem()+"!")}else{var v=Math.max(50,pr*90);s.c+=v;s.total+=v;s.xp+=v;noticia("Bit dourado: +"+fmt(v)+" ciclos!")}};

/* ---------- chefes ---------- */
function termosValidos(cats){
var norm=function(t){return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")};
return glossario.filter(function(t){if(cats&&cats.indexOf(t[2])<0)return false;var d=norm(t[1]);return norm(t[0]).replace(/\(.*?\)/g," ").split(/[^a-z0-9]+/).filter(function(w){return w.length>=4}).every(function(w){return d.indexOf(w)<0})});
}
function iniciarChefe(){
var base=CHEFES[(s.nivel-1)%CHEFES.length],volta=Math.floor((s.nivel-1)/CHEFES.length);
var cats=volta?null:base.cats,pool=termosValidos(cats);if(pool.length<8)pool=termosValidos(null);
chefe={b:base,nome:(volta?["Mega ","Ultra ","Giga "][Math.min(2,volta-1)]:"")+base.n,hp:3,voce:3,pool:pool.slice().sort(function(){return Math.random()-.5}),i:0,escudo:false,treme:0};
emChefe=true;$(".gx-chefe").hidden=false;$(".gx-ch-n").textContent=chefe.nome.toUpperCase();$(".gx-ch-fala").textContent="“"+base.fala+"”";$(".gx-ch-msg").textContent="";
if(pref.mus)tocar("batalha");sfx("chefe");rodada();
}
function coracoes(n){var t="";for(var i=0;i<3;i++)t+=i<n?"♥":"♡";return t}
function rodada(){
if(!chefe)return;var t=chefe.pool[chefe.i++%chefe.pool.length],mesma=chefe.pool.filter(function(x){return x!==t&&x[2]===t[2]}),outros=chefe.pool.filter(function(x){return x!==t&&x[2]!==t[2]});
mesma.sort(function(){return Math.random()-.5});var dist=mesma.slice(0,3);if(dist.length<3)dist=dist.concat(outros.slice(0,3-dist.length));
var ops=dist.concat([t]).sort(function(){return Math.random()-.5});chefe.atual=t;
$(".gx-ch-hp").textContent="CHEFE "+coracoes(chefe.hp);$(".gx-ch-voce").textContent="VOCÊ "+coracoes(chefe.voce);
$(".gx-ch-def").textContent="“"+t[1]+"”";var box=$(".gx-ch-ops");box.textContent="";
ops.forEach(function(o){var b=document.createElement("button");b.textContent=o[0];b.dataset.c=o===t?"1":"";b.onclick=function(){responder(o===t,b)};box.appendChild(b)});
var it=$(".gx-ch-itens");it.textContent="";Object.keys(ITENS).forEach(function(k){var b=document.createElement("button");b.className="gx-it";b.disabled=!s.itens[k];b.title=ITENS[k][1];b.innerHTML='<canvas width="12" height="12"></canvas><span></span>';b.querySelector("span").textContent=ITENS[k][0]+" ×"+(s.itens[k]||0);desenharIcone(b.querySelector("canvas"),k);b.onclick=function(){usarItem(k)};it.appendChild(b)});
}
function usarItem(k){if(!s.itens[k]||!chefe)return;s.itens[k]--;sfx("compra");var msg=$(".gx-ch-msg");
if(k==="antivirus"){var erradas=[].slice.call($$(".gx-ch-ops button")).filter(function(b){return !b.dataset.c&&!b.disabled});erradas.slice(0,2).forEach(function(b){b.disabled=true;b.classList.add("riscada")});msg.textContent="Antivírus eliminou duas alternativas."}
else if(k==="firewall"){chefe.escudo=true;msg.textContent="Firewall ativo: o próximo erro não tira coração."}
else if(k==="backup"){chefe.voce=Math.min(3,chefe.voce+1);msg.textContent="Backup restaurado: +1 coração.";$(".gx-ch-voce").textContent="VOCÊ "+coracoes(chefe.voce)}
else{msg.textContent="Patch: o termo é da área "+chefe.atual[2]+"."}
desenharItens();$$(".gx-ch-itens .gx-it").forEach(function(b,i){var kk=Object.keys(ITENS)[i];b.disabled=!s.itens[kk];b.querySelector("span").textContent=ITENS[kk][0]+" ×"+(s.itens[kk]||0)})}
function responder(ok,b){
var msg=$(".gx-ch-msg");$$(".gx-ch-ops button").forEach(function(x){x.disabled=true;if(x.dataset.c)x.classList.add("certa")});
if(ok){chefe.hp--;chefe.treme=14;sfx("acerto");s.acertos++;msg.textContent="Acertou! "+chefe.atual[0]+" é a resposta."}
else{b.classList.add("errada");if(chefe.escudo){chefe.escudo=false;msg.textContent="O firewall bloqueou o dano. A resposta era "+chefe.atual[0]+"."}else{chefe.voce--;sfx("dano");gx.classList.add("dano");setTimeout(function(){gx.classList.remove("dano")},300);msg.textContent="Errou. A resposta era "+chefe.atual[0]+"."}}
$(".gx-ch-hp").textContent="CHEFE "+coracoes(chefe.hp);$(".gx-ch-voce").textContent="VOCÊ "+coracoes(chefe.voce);
setTimeout(function(){if(!chefe)return;if(chefe.hp<=0)vencer();else if(chefe.voce<=0)perder();else rodada()},1700);
}
function vencer(){var nome=chefe.b.n;s.vitorias++;s.infec=false;s.nivel++;s.xp=0;var item=ganharItem();sfx("vitoria");
carta(nome,{"Vírus de boot":"Infecta o início do disco para rodar antes do sistema. Secure Boot e antivírus ajudam a barrar.","Worm":"Se copia sozinho pela rede, explorando falhas. Atualizações e firewall reduzem o risco.","Cavalo de Troia":"Se disfarça de programa legítimo. Baixe software só de fontes oficiais.","Superaquecimento":"Calor reduz desempenho e vida útil. Fluxo de ar, pasta térmica e limpeza resolvem.","Phishing":"Imita sites e mensagens confiáveis para roubar dados. Confira o endereço e use verificação em duas etapas.","Ransomware":"Sequestra arquivos e pede resgate. A melhor defesa é backup 3-2-1, com uma cópia desconectada."}[nome]);
fimChefe("VITÓRIA! "+chefe.nome+" derrotado. Produção +15% para sempre e você ganhou: "+item+".")}
function perder(){sfx("erro");
if(s.hard){var cartas=s.cartas;s=novo(true);s.cartas=cartas;s.iniciado=true;fimChefe("DERROTA NO HARDCORE. O sistema foi formatado: recomeçando do zero.");montarSlots();desenharItens();return}
s.xp=0;s.infec=true;fimChefe("DERROTA. O PC foi infectado: produção −30% e a barra do nível recomeça. Vença a revanche para limpar o sistema.")}
function fimChefe(t){$(".gx-ch-def").textContent=t;$(".gx-ch-ops").textContent="";$(".gx-ch-msg").textContent="";var b=document.createElement("button");b.textContent="CONTINUAR";b.className="gx-btn";
b.onclick=function(){chefe=null;emChefe=false;$(".gx-chefe").hidden=true;if(pref.mus)tocar("calmo");salvar(s)};$(".gx-ch-ops").appendChild(b);b.focus()}
function desenharChefe(){gc.fillStyle="#000";gc.fillRect(0,0,120,72);gc.fillStyle="#fff";if(!chefe)return;
var dx=chefe.treme>0?(chefe.treme%2?2:-2):0,dy=Math.round(Math.sin(frame*.08)*1.5);chefe.treme=Math.max(0,chefe.treme-1);
if(!(chefe.treme>0&&chefe.treme%4<2))sprite(gc,chefe.b.m,20+dx,6+dy,4);pont(gc,0,66,120,6,.25)}

/* ---------- PC em pixel art ---------- */
function desenhar(r){
var e=era(s);g.fillStyle="#000";g.fillRect(0,0,160,112);g.fillStyle="#fff";g.strokeStyle="#fff";
g.fillRect(0,96,160,1);pont(g,0,97,160,15,.25);
var cw=26+e*4,ch=36+e*6,cx=104,cy=96-ch;
g.fillRect(cx,cy,cw,1);g.fillRect(cx,cy+ch-1,cw,1);g.fillRect(cx,cy,1,ch);g.fillRect(cx+cw-1,cy,1,ch);
for(var i=0;i<3;i++)g.fillRect(cx+3,cy+4+i*3,cw-6,1);
var fx=cx+cw/2,fy=cy+ch*.6,fr=Math.min(cw,ch)*.22,vel=s.niv.clock?.3*(r.throttle<1?.35:1):0;
for(var a=0;a<4;a++){var an=frame*vel+a*Math.PI/2;for(var t=2;t<fr;t++)g.fillRect(Math.round(fx+Math.cos(an)*t),Math.round(fy+Math.sin(an)*t),1,1)}
for(a=0;a<36;a++){var a2=a/36*Math.PI*2;g.fillRect(Math.round(fx+Math.cos(a2)*fr),Math.round(fy+Math.sin(a2)*fr),1,1)}
if(s.niv.clock&&frame%24<14)g.fillRect(cx+cw-5,cy+ch-5,2,2);
if(s.niv.gpu)for(i=0;i<s.niv.gpu&&i<3;i++)g.fillRect(cx+3,cy+ch-9-i*3,cw-10,2);
var mx=12,my=34,mw=78,mh=50;g.fillRect(mx,my,mw,1);g.fillRect(mx,my+mh,mw+1,1);g.fillRect(mx,my,1,mh);g.fillRect(mx+mw,my,1,mh);g.fillRect(mx+mw/2-5,my+mh+1,10,6);g.fillRect(mx+mw/2-14,my+mh+7,28,2);
var vals=[r.cpu,r.mem,r.io],mxv=Math.max.apply(null,vals)||1,lab=["CPU","MEM","E/S"];g.font="6px monospace";g.textBaseline="top";
for(i=0;i<3;i++){var bw=Math.max(1,(vals[i]/mxv)*44),by=my+6+i*12;g.fillText(lab[i],mx+4,by);pont(g,mx+26,by,46,5,.25);g.fillRect(mx+26,by,bw,5);
if(s.niv.clock&&(r.gar===lab[i]||(r.gar==="TÉRMICA"&&i===0))&&frame%30<15){g.fillRect(mx+24,by-2,50,1);g.fillRect(mx+24,by+6,50,1)}}
g.fillText(s.niv.clock?"ERA "+ERAS[e][1].toUpperCase():"CLIQUE PARA LIGAR",mx+4,my+mh-9);
if(r.throttle<1)for(i=0;i<4;i++){var ox=cx+4+i*(cw-8)/3;for(var k=0;k<7;k++)g.fillRect(Math.round(ox+Math.sin(frame*.2+k*.8)*2),cy-4-k,1,1)}
bits.forEach(function(b){g.fillText(b.t,b.x,b.y);b.x+=b.vx;b.y+=b.vy;b.vy+=.05;b.v--});bits=bits.filter(function(b){return b.v>0});
if(flash){g.fillRect(0,0,160,1);g.fillRect(0,111,160,1);g.fillRect(0,0,1,112);g.fillRect(159,0,1,112);flash--}
}

/* ---------- laço principal ---------- */
var throttleAvisado=false;
function laco(agora){
if(!vivo)return;requestAnimationFrame(laco);
var dt=Math.min(1,(agora-ultimo)/1000);ultimo=agora;frame++;
if(!s||$(".gx-jogo").hidden)return;
if(bonusAte&&Date.now()>bonusAte){bonus=1;cliqueX=1;bonusAte=0}
var r=calcular(s,bonus);
if(!emChefe){var gnh=r.prod*dt;s.c+=gnh;s.total+=gnh;s.xp+=gnh}
if(r.gar==="MEM"&&s.niv.clock)s.viuMem=true;
if(r.throttle<1&&!throttleAvisado){throttleAvisado=true;sfx("throttle");noticia("THROTTLING! Melhore a refrigeração.")}if(r.throttle>=1)throttleAvisado=false;
if(frame%6===0){
$(".gx-c").textContent=fmt(s.c);$(".gx-ps").textContent=fmt(r.prod);
var req=reqNivel(s.nivel);$(".gx-nivt").textContent="NV "+s.nivel;$(".gx-barra i").style.width=Math.min(100,s.xp/req*100)+"%";
$(".gx-bon").textContent=bonusAte?"×"+bonus+" · "+Math.ceil((bonusAte-Date.now())/1000)+"s":"";
liberar();estadoSlots(r);painelGargalo(r);
CONQUISTAS.forEach(function(c){if(s.conq.indexOf(c.id)<0&&c.ok(s,r)){s.conq.push(c.id);carta("Conquista: "+c.n,c.f);noticia("Conquista: "+c.n);sfx("libera")}});
if(!emChefe&&s.xp>=req&&s.niv.clock){sfx("nivel");iniciarChefe()}
}
if(frame%2===0){desenhar(r);if(emChefe)desenharChefe()}
if(!emChefe&&!evAtivo&&!modalAberto&&Date.now()>proxQuiz&&s.niv.clock){perguntaRelampago();proxQuiz=Date.now()+75000+Math.random()*40000}
if(!emChefe&&Date.now()>proxOuro&&s.niv.clock){var tl=$(".gx-tela");ouro.style.left=(10+Math.random()*75)+"%";ouro.style.top=(10+Math.random()*60)+"%";ouro.hidden=false;ouroAte=Date.now()+9000;proxOuro=Date.now()+55000+Math.random()*50000}
if(!ouro.hidden&&Date.now()>ouroAte)ouro.hidden=true;
}
requestAnimationFrame(laco);
var auto=setInterval(function(){if(s&&s.iniciado)salvar(s)},5000);
function visib(){if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()}
document.addEventListener("visibilitychange",visib);
return function(){vivo=false;clearInterval(auto);if(ro)ro.disconnect();window.removeEventListener("resize",ajustar);if(s&&s.iniciado)salvar(s);pararMusica();document.removeEventListener("keydown",tecla);document.removeEventListener("visibilitychange",visib);document.body.classList.remove("modo-jogo")};
}
return {montar:montar,zerar:function(){try{localStorage.removeItem(SALVO)}catch(e){}}};
})();
