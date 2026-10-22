// Modelos 3D das peças, construídos com formas do Three.js, com cores e materiais próximos dos reais.
// Cada malha clicável recebe userData.ponto = chave de P[i].pontos (pecas.js).
// Malhas com userData.capa = true somem no modo "ver por dentro".
// Unidades aproximadas em centímetros.
window.MODELOS3D=(function(){
var T=window.THREE;
if(!T||!T.OrbitControls)return null;/* sem 3D: as páginas mostram só o texto */

/* ---------- materiais ---------- */
function mat(c,o){o=o||{};var m=new T.MeshStandardMaterial({color:c,metalness:o.m!=null?o.m:.1,roughness:o.r!=null?o.r:.6,map:o.map||null,transparent:!!o.op,opacity:o.op||1,side:o.side||T.FrontSide});if(o.e){m.emissive=new T.Color(o.e);m.emissiveIntensity=o.ei||1;m.userData.emissiveBase=o.e}return m}
var C={
pcbVerde:0x1f5a35,pcbPreto:0x16171a,substrato:0x2c6b3f,ouro:0xd9b45a,cobre:0xc0784a,niquel:0xcfd2d6,aluminio:0xb9bdc2,aco:0x2a2b2f,
plastico:0x131315,chip:0x101113,capacitor:0x2b2340,choke:0x55575c,smd:0x9c7a52,branco:0xeeeeee,bege:0xd9c4a2,marrom:0x6e4a34,vidro:0x3a4652
};
var M={
ouro:function(){return mat(C.ouro,{m:1,r:.28})},
cobre:function(){return mat(C.cobre,{m:1,r:.32})},
niquel:function(){return mat(C.niquel,{m:1,r:.22})},
alu:function(){return mat(C.aluminio,{m:.9,r:.38})},
aco:function(){return mat(C.aco,{m:.6,r:.45})},
plast:function(){return mat(C.plastico,{m:0,r:.75})},
chip:function(){return mat(C.chip,{m:.05,r:.45})},
cap:function(){return mat(C.capacitor,{m:.4,r:.35})},
choke:function(){return mat(C.choke,{m:.5,r:.5})},
smd:function(){return mat(C.smd,{m:.1,r:.6})}
};

/* ---------- texturas desenhadas em canvas ---------- */
var cache={};
function tex(id,w,h,draw){if(cache[id])return cache[id];var c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);var t=new T.CanvasTexture(c);t.anisotropy=8;t.encoding=T.sRGBEncoding;return cache[id]=t}
/* placa de circuito com trilhas e serigrafia */
function pcbTex(id,base,linha,w,h,textos){return tex(id,w,h,function(g,W,H){g.fillStyle=base;g.fillRect(0,0,W,H);g.strokeStyle=linha;g.lineWidth=1.2;var s=7;for(var i=0;i<140;i++){var x=(i*97)%W,y=(i*53)%H;g.globalAlpha=.55;g.beginPath();g.moveTo(x,y);var dx=((i%3)-1)*s*6,dy=((i%5)-2)*s*3;g.lineTo(x+dx,y);g.lineTo(x+dx+dy,y+Math.abs(dy));g.stroke()}g.globalAlpha=1;g.fillStyle="rgba(255,255,255,.75)";(textos||[]).forEach(function(t){g.font=t[3]||"14px monospace";g.fillText(t[0],t[1],t[2])})})}
function chipTex(id,linhas,fundo){return tex(id,256,192,function(g,W,H){g.fillStyle=fundo||"#121315";g.fillRect(0,0,W,H);g.fillStyle="rgba(230,230,230,.8)";linhas.forEach(function(l,i){g.font=(i?"20px":"bold 26px")+" monospace";g.fillText(l,18,50+i*34)});g.beginPath();g.arc(28,H-24,7,0,7);g.fillStyle="rgba(255,255,255,.35)";g.fill()})}
function etiqueta(id,linhas,w,h,bg,fg){return tex(id,w,h,function(g,W,H){g.fillStyle=bg||"#eeeeee";g.fillRect(0,0,W,H);g.fillStyle=fg||"#111";linhas.forEach(function(l){g.font=l[1];g.fillText(l[0],l[2]||24,l[3])})})}
function colmeia(id,base){return tex(id,256,256,function(g,W,H){g.fillStyle=base;g.fillRect(0,0,W,H);g.fillStyle="#050505";for(var y=0;y<14;y++)for(var x=0;x<14;x++){var cx=x*19+(y%2?9.5:0)+6,cy=y*17+8;g.beginPath();for(var k=0;k<6;k++){var a=Math.PI/3*k+Math.PI/6;g.lineTo(cx+7*Math.cos(a),cy+7*Math.sin(a))}g.fill()}})}
function malha(id){return tex(id,256,512,function(g,W,H){g.fillStyle="#2a2b2f";g.fillRect(0,0,W,H);g.fillStyle="#060606";for(var y=0;y<70;y++)for(var x=0;x<34;x++){g.beginPath();g.arc(x*7.6+4+(y%2?3.8:0),y*7.4+4,2.5,0,7);g.fill()}})}

/* ---------- formas ---------- */
function add(p,geo,m,x,y,z,ponto,extra){var mesh=new T.Mesh(geo,m);mesh.position.set(x||0,y||0,z||0);if(ponto)mesh.userData.ponto=ponto;if(extra)Object.assign(mesh.userData,extra);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh}
function box(p,w,h,d,m,x,y,z,ponto,extra){return add(p,new T.BoxGeometry(w,h,d),m,x,y,z,ponto,extra)}
function cyl(p,rt,rb,h,m,x,y,z,ponto,seg,extra){return add(p,new T.CylinderGeometry(rt,rb,h,seg||28),m,x,y,z,ponto,extra)}
function plano(p,w,h,m,x,y,z,rx,ry,ponto){var o=add(p,new T.PlaneGeometry(w,h),m,x,y,z,ponto);o.rotation.set(rx||0,ry||0,0);o.castShadow=false;return o}
function inst(p,geo,m,lista,ponto,extra){var im=new T.InstancedMesh(geo,m,lista.length),o=new T.Object3D();lista.forEach(function(q,i){o.position.set(q[0],q[1],q[2]);o.rotation.set(q[3]||0,q[4]||0,q[5]||0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});if(ponto)im.userData.ponto=ponto;if(extra)Object.assign(im.userData,extra);im.castShadow=true;im.receiveShadow=true;p.add(im);return im}
/* capacitor sólido: corpo escuro com topo metálico */
function capacitor(p,x,y,z,r,h,ponto,corpo){cyl(p,r,r,h,mat(corpo||C.capacitor,{m:.5,r:.35}),x,y+h/2,z,ponto,16);cyl(p,r*.98,r*.98,.02,M.niquel(),x,y+h+.01,z,ponto,16)}
/* ventoinha deitada no plano XY (eixo em Z) */
function fan(p,r,x,y,z,ponto,extra,cores){
cores=cores||{};var g=new T.Group();g.position.set(x,y,z);p.add(g);
var aro=new T.Mesh(new T.TorusGeometry(r,r*.07,12,56),mat(cores.aro||0x1b1c1f,{r:.6}));g.add(aro);
var hub=new T.Mesh(new T.CylinderGeometry(r*.3,r*.3,r*.2,40),mat(cores.hub||0x1b1c1f,{r:.5}));hub.rotation.x=Math.PI/2;g.add(hub);
var selo=new T.Mesh(new T.CircleGeometry(r*.27,40),mat(cores.selo||0xd8d8dc,{r:.4}));selo.position.z=r*.101;g.add(selo);
var n=cores.pas||9,pm=mat(cores.pa||0x18191c,{r:.5,side:T.DoubleSide});
for(var i=0;i<n;i++){var b=new T.Mesh(new T.BoxGeometry(r*.64,r*.3,r*.025),pm);var a=i/n*Math.PI*2;b.position.set(Math.cos(a)*r*.6,Math.sin(a)*r*.6,0);b.rotation.set(.42,0,a+.25);g.add(b)}
if(cores.led){var led=new T.Mesh(new T.TorusGeometry(r*.94,r*.025,8,56),mat(0xffffff,{e:cores.led,ei:.9}));led.position.z=r*.05;g.add(led)}
g.traverse(function(c){if(!c.isMesh)return;c.castShadow=true;if(ponto)c.userData.ponto=ponto;if(extra)Object.assign(c.userData,extra)});
return g;
}
/* quadro de ventoinha 120 mm com cantos */
function quadro(p,s,x,y,z,ponto,cor){var m=mat(cor||0x1b1c1f,{r:.6}),t=s*.08;[[0,s/2-t/2],[0,-s/2+t/2]].forEach(function(q){box(p,s,t,s*.2,m,x+q[0],y+q[1],z,ponto)});[[s/2-t/2,0],[-s/2+t/2,0]].forEach(function(q){box(p,t,s,s*.2,m,x+q[0],y+q[1],z,ponto)})}

var B={};

/* ---------- processador ---------- */
B.cpu=function(){
var p=new T.Group();
box(p,4,.12,4,mat(0xffffff,{map:pcbTex("subst","#2c6b3f","#3f8a55",256,256),r:.55}),0,0,0,"substrato");
// tampa com o formato recortado das CPUs atuais
var ni=M.niquel();
box(p,3.1,.3,3.1,ni,0,.21,0,"ihs");
[[-1.62,-1.1],[-1.62,1.1],[1.62,-1.1],[1.62,1.1]].forEach(function(q){box(p,.25,.16,.55,ni,q[0],.13,q[1],"ihs")});
var g=etiqueta("cpu-grav",[["BANCADA","bold 64px Sora, sans-serif",38,104],["B-01  8C/16T  4.8 GHz","30px IBM Plex Mono, monospace",40,160],["2620SUS  L4X0B1  0042","26px IBM Plex Mono, monospace",40,206]],512,256,"#cfd2d6","#6a6d73");
plano(p,2.6,1.3,mat(0xffffff,{map:g,m:.9,r:.25}),0,.362,0,-Math.PI/2,0,"gravacao");
// capacitores SMD nos recortes
var sm=[];for(var i=0;i<9;i++){sm.push([-1.75,.08,-.9+i*.22]);sm.push([1.75,.08,-.9+i*.22])}
inst(p,new T.BoxGeometry(.12,.05,.08),M.smd(),sm,"smd");
var tri=add(p,new T.CylinderGeometry(.17,.17,.02,3),M.ouro(),-1.75,.07,1.75,"triangulo");tri.rotation.y=Math.PI/6;
// entalhes de orientação nas laterais
box(p,.25,.13,.18,mat(0x050505),-2,0,-.9);box(p,.25,.13,.18,mat(0x050505),2,0,-.9);
// contatos (LGA) embaixo
var ct=[],n=28;for(var a=0;a<n;a++)for(var b=0;b<n;b++){if(a>10&&a<17&&b>10&&b<17)continue;ct.push([-1.85+a*3.7/(n-1),-.07,-1.85+b*3.7/(n-1)])}
inst(p,new T.BoxGeometry(.075,.02,.075),M.ouro(),ct,"contatos");
inst(p,new T.BoxGeometry(.1,.04,.06),M.smd(),Array.from({length:24},function(_,i){return [-.55+(i%6)*.22,-.08,-.5+Math.floor(i/6)*.33]}),"smd");
return {g:p,cam:[5,5,6]};
};

/* ---------- memória ---------- */
B.ram=function(){
var p=new T.Group(),L=13.3,H=3.1,NX=.85;
var pcb=mat(0xffffff,{map:pcbTex("ram-pcb","#1f5a35","#2f7a4a",512,128,[["DDR5 UDIMM  PC5-48000  REV 1.0",14,118,"12px monospace"]]),r:.55});
box(p,7.4,H,.12,pcb,-L/2+3.7,0,0);box(p,5.7,H,.12,pcb,L/2-2.85,0,0);box(p,.2,H-.45,.12,pcb,NX,.22,0);
box(p,.2,.45,.14,mat(0x050505,{op:.01}),NX,-H/2+.22,0,"entalhe");
var ct=chipTex("ram-chip",["BANCADA","D5 16Gb","2621 B06"]);
for(var i=0;i<8;i++){var x=-L/2+1.25+i*1.55+(i>3?.35:0);box(p,1.15,.95,.11,mat(0xffffff,{map:ct,r:.45}),x,.38,.115,"chips")}
box(p,.62,.62,.1,mat(0xffffff,{map:chipTex("pmic",["PMIC","5100"]),r:.45}),5.85,-.5,.11,"pmic");
box(p,.36,.26,.08,M.chip(),-5.95,-.62,.1,"spd");
// resistores e capacitores minúsculos
var rs=[];for(i=0;i<36;i++)rs.push([-6.3+i*.36,-.25,.085]);inst(p,new T.BoxGeometry(.1,.05,.05),M.smd(),rs);
// contatos dourados frente e verso
var cs=[],n=72;for(var s=0;s<2;s++)for(var c=0;c<n;c++){var cx=-L/2+.3+c*(L-.6)/(n-1);if(Math.abs(cx-NX)<.18)continue;cs.push([cx,-H/2+.25,s?-.07:.07])}
inst(p,new T.BoxGeometry(.1,.42,.015),M.ouro(),cs,"contatos");
// dissipador preto no verso, com aleta superior e barra de luz
var hs=mat(0x1d1e22,{m:.7,r:.35});
box(p,L-.3,H-.7,.18,hs,0,.32,-.17,"dissipador");
box(p,L-.1,.5,.42,hs,0,H/2+.05,-.08,"dissipador");
box(p,L-.6,.12,.3,mat(0xffffff,{e:0xdfe6ff,ei:.85,op:.95}),0,H/2+.36,-.08,"dissipador");
var et=etiqueta("ram-et",[["BANCADA DDR5","bold 48px Sora, sans-serif",30,82],["32 GB (2x16)  6000 MT/s","30px IBM Plex Mono, monospace",30,138],["CL30-38-38-96  1.35 V","30px IBM Plex Mono, monospace",30,184]],640,220,"#d6d6da","#111");
var e=plano(p,6,1.9,mat(0xffffff,{map:et,r:.5}),0,.35,-.265,0,Math.PI,"etiqueta");
return {g:p,cam:[2,3,15]};
};

/* ---------- SSD ---------- */
B.armazenamento=function(){
var p=new T.Group();
box(p,8,.08,2.2,mat(0xffffff,{map:pcbTex("ssd-pcb","#141518","#2a2c31",512,160,[["M.2 2280  NVMe  PCIe 4.0 x4",300,150,"13px monospace"]]),r:.55}),0,0,0);
box(p,.5,.09,1.15,M.ouro(),-3.75,0,.42,"conector");box(p,.5,.09,.62,M.ouro(),-3.75,0,-.74,"conector");
var furo=add(p,new T.TorusGeometry(.2,.05,8,24,Math.PI),M.ouro(),4,.05,0,"furo");furo.rotation.set(-Math.PI/2,0,Math.PI/2);
box(p,1.45,.12,1.45,mat(0xffffff,{map:chipTex("ctrl",["BANCADA","SSD CTRL","PCIe 4.0"]),m:.3,r:.3}),-2.2,.1,0,"controlador");
box(p,.95,.1,1.3,mat(0xffffff,{map:chipTex("dram",["DRAM","LPDDR4"])}),-.75,.09,0,"dram");
var nt=chipTex("nand",["NAND","TLC 1Tb","3D 232L"]);
box(p,1.55,.12,1.6,mat(0xffffff,{map:nt}),.75,.1,0,"nand");box(p,1.55,.12,1.6,mat(0xffffff,{map:nt}),2.6,.1,0,"nand");
var cs=[];for(var i=0;i<14;i++)cs.push([-3.1+(i%7)*.13,.06,-.85+Math.floor(i/7)*1.7]);inst(p,new T.BoxGeometry(.08,.05,.05),M.smd(),cs);
var et=etiqueta("ssd-et",[["BANCADA NVMe","bold 40px Sora, sans-serif",24,64],["M.2 2280  PCIe 4.0 x4  2 TB","24px IBM Plex Mono, monospace",24,110]],640,140,"#e9e9ec","#111");
plano(p,6.6,1.4,mat(0xffffff,{map:et,r:.5}),.2,-.045,0,Math.PI/2,0,"etiqueta");
return {g:p,cam:[3,5,6]};
};

/* ---------- placa de vídeo ---------- */
B.gpu=function(){
var p=new T.Group(),L=13,H=4.6,cap={capa:true};
box(p,L,H-.2,.12,mat(0xffffff,{map:pcbTex("gpu-pcb","#141518","#2a2c31",512,192),r:.55}),0,0,0);
// pacote da GPU, VRAM e VRM (aparecem no modo "ver por dentro")
box(p,2.6,2.6,.06,mat(C.substrato,{r:.5}),0,.2,.09);
box(p,1.7,1.7,.08,mat(0x2a2c30,{m:.9,r:.15}),0,.2,.15,"gpu");
var vt=chipTex("vram",["GDDR7","16Gb","32Gbps"]);
for(var i=0;i<8;i++){var a=i/8*Math.PI*2;box(p,.85,.62,.08,mat(0xffffff,{map:vt}),Math.cos(a)*2.05,.2+Math.sin(a)*1.55,.1,"vram")}
for(i=0;i<8;i++)box(p,.42,.42,.3,M.choke(),3.6+(i%2)*.55,-1.3+Math.floor(i/2)*.75,.2);
// dissipador com heatpipes de cobre
for(var f=0;f<40;f++)box(p,.04,H-.6,1.7,M.alu(),-L/2+.6+f*(L-1.2)/39,0,1.1,"dissipador",cap);
for(i=0;i<4;i++){var hp=cyl(p,.12,.12,L-1.4,M.cobre(),0,-1.3+i*.85,.5,"dissipador",12,cap);hp.rotation.z=Math.PI/2}
// carenagem
var sh=mat(0x2b2d31,{m:.55,r:.35});
box(p,L,H,.18,sh,0,0,2.1,null,cap);box(p,L,.25,.9,sh,0,H/2-.12,1.65,null,cap);box(p,L,.25,.9,sh,0,-H/2+.12,1.65,null,cap);
box(p,L*.96,.08,.05,M.alu(),0,H/2-.35,2.21,null,cap);box(p,.08,H*.8,.05,M.alu(),-L/2+.5,0,2.21,null,cap);
fan(p,1.95,-3,0,2.32,"ventoinhas",cap);fan(p,1.95,3,0,2.32,"ventoinhas",cap);
// backplate com recortes
box(p,L,H-.2,.08,mat(0x3a3c41,{m:.75,r:.3}),0,0,-.22,"backplate");
for(i=0;i<6;i++)box(p,.9,.12,.02,mat(0x0b0b0c),3.2+(i%2)*1.1,1.2-Math.floor(i/2)*.4,-.27,"backplate");
// conectores
inst(p,new T.BoxGeometry(.08,.48,.02),M.ouro(),Array.from({length:44},function(_,i){var x=-4.6+i*.13+(i>10?.25:0);return [x,-H/2-.2,.07]}).concat(Array.from({length:44},function(_,i){var x=-4.6+i*.13+(i>10?.25:0);return [x,-H/2-.2,-.07]})),"pcie");
box(p,6.4,.5,.12,mat(0xffffff,{map:pcbTex("gpu-pcb","#141518","#2a2c31",512,192)}),-1.6,-H/2-.2,0);
box(p,1.45,.55,.62,M.plast(),3.6,H/2+.12,.35,"energia");
inst(p,new T.BoxGeometry(.12,.08,.12),mat(0x0a0a0a),Array.from({length:12},function(_,i){return [3.05+(i%6)*.22,H/2+.41,.2+Math.floor(i/6)*.3]}),"energia");
// espelho com saídas de vídeo
box(p,.1,H+1.3,2.9,mat(C.aluminio,{m:.9,r:.3}),-L/2-.1,.35,1.15,"saidas");
for(i=0;i<4;i++)box(p,.16,.55,.95,M.plast(),-L/2-.2,1.5-i*.9,1.4,"saidas");
for(i=0;i<6;i++)box(p,.12,.1,1.9,mat(0x0a0a0a),-L/2-.17,-1.9-i*.18+.9,2.45);
return {g:p,cam:[6,4,13],dentro:true};
};

/* ---------- placa-mãe ---------- */
B["placa-mae"]=function(){
var p=new T.Group();
box(p,12,.12,12,mat(0xffffff,{map:pcbTex("mb-pcb","#17181b","#26282d",1024,1024,[["BANCADA B650-P  ATX",620,980,"bold 22px monospace"],["DDR5_A1  A2  B1  B2",690,60,"14px monospace"],["PCIEX16_1",300,640,"14px monospace"],["M2_1",300,520,"14px monospace"]]),r:.6}),0,0,0);
// socket: moldura metálica, alavanca e plástico
box(p,2.7,.12,2.7,mat(0x1a1a1c),-1.2,.12,-2.5,"socket");
box(p,2.8,.22,.25,M.niquel(),-1.2,.24,-3.75,"socket");box(p,2.8,.22,.25,M.niquel(),-1.2,.24,-1.25,"socket");
box(p,.25,.22,2.5,M.niquel(),-2.47,.24,-2.5,"socket");box(p,.25,.22,2.5,M.niquel(),.07,.24,-2.5,"socket");
box(p,2.1,.06,2.1,mat(0x111111),-1.2,.2,-2.5,"socket");
var lev=cyl(p,.035,.035,2.9,M.niquel(),.3,.25,-2.5,"socket",8);lev.rotation.x=Math.PI/2;
// slots de memória com travas
for(var i=0;i<4;i++){box(p,.32,.36,9.6,M.plast(),1.9+i*.55,.24,.2,"dimm");box(p,.34,.4,.3,mat(0x8d9096,{r:.5}),1.9+i*.55,.3,5.05,"dimm");box(p,.34,.4,.3,mat(0x8d9096,{r:.5}),1.9+i*.55,.3,-4.65,"dimm")}
// VRM: dissipadores com aletas e chokes
var vr=mat(0x45484e,{m:.85,r:.35});
box(p,3.4,.75,1,vr,-1.4,.5,-4.65,"vrm");box(p,1,.75,3.2,vr,-3.65,.5,-2.4,"vrm");
for(i=0;i<8;i++){box(p,.06,.25,1,M.alu(),-2.9+i*.45,.98,-4.65,"vrm");box(p,1,.25,.06,M.alu(),-3.65,.98,-3.8+i*.4,"vrm")}
for(i=0;i<6;i++)box(p,.36,.3,.36,M.choke(),-2.7+i*.5,.2,-3.9);
for(i=0;i<5;i++)capacitor(p,-2.75,.06,-3.4+i*.38,.12,.32);
// painel de I/O
var io=mat(0x34363b,{m:.8,r:.3});
box(p,1.45,1.7,4.2,io,-5.2,.91,-3,"io");box(p,.05,1.2,3.6,mat(0xffffff,{map:etiqueta("io-txt",[["BANCADA","bold 44px Sora",40,90],["TUF-STYLE  PRO","22px IBM Plex Mono",40,130]],512,160,"#34363b","#9a9da3")}),-4.45,1.05,-3,"io");
// PCIe x16 reforçado, x1 e M.2 com dissipador
box(p,8.6,.42,.34,M.plast(),-1.2,.27,1.6,"pcie");
box(p,8.6,.06,.42,M.niquel(),-1.2,.5,1.6,"pcie");box(p,.04,.44,.42,M.niquel(),-5.5,.27,1.6,"pcie");
box(p,2.3,.38,.3,M.plast(),-4.3,.25,4.7,"pcie");box(p,7.4,.42,.32,M.plast(),-1.8,.27,4.7,"pcie");
var m2=mat(0x3d4046,{m:.85,r:.32});
box(p,6,.2,1.5,m2,-1.6,.16,.2,"m2");for(i=0;i<5;i++)box(p,5.6,.03,.05,M.alu(),-1.6,.27,-.35+i*.27,"m2");
box(p,4.4,.16,1.4,m2,-2.2,.14,3.1,"m2");
// chipset, áudio e bateria
box(p,2.3,.42,2.3,mat(0x3d4046,{m:.85,r:.32}),3.4,.27,4.2,"chipset");box(p,1.4,.02,1.4,mat(0xffffff,{map:etiqueta("chip-logo",[["B650","bold 54px Sora",36,96]],256,128,"#2a2c31","#c8cbd0")}),3.4,.49,4.2,"chipset");
for(i=0;i<5;i++)capacitor(p,-4.9+(i%3)*.38,.06,4.2+Math.floor(i/3)*.4,.14,.32,null,0xc9a227);
cyl(p,.55,.55,.16,M.niquel(),.9,.14,3.1,"bateria");
// conectores de energia e cabeçalhos
box(p,.7,.6,3,M.plast(),5.65,.36,-.6,"atx24");inst(p,new T.BoxGeometry(.18,.02,.18),mat(0x050505),Array.from({length:24},function(_,i){return [5.5+(i%2)*.3,.67,-1.95+Math.floor(i/2)*.245]}),"atx24");
box(p,1.4,.6,.6,M.plast(),-3.4,.36,-5.6,"eps");
box(p,.6,.35,.35,mat(0x0d0d0f),4.6,.24,5.6);box(p,.6,.35,.35,mat(0x0d0d0f),3.8,.24,5.6);
inst(p,new T.BoxGeometry(.55,.3,.35),mat(0x0d0d0f),[[5.6,.22,3.2],[5.6,.22,3.8],[5.6,.22,4.4],[5.6,.22,5]]);
return {g:p,cam:[2,11,9]};
};

/* ---------- fonte ---------- */
B.fonte=function(){
var p=new T.Group(),W=6,H=3.4,D=5.6;
var corpo=mat(0x1b1c1f,{m:.35,r:.55});
box(p,W,H,D,corpo,0,0,0);
var f=fan(p,2.2,0,H/2+.03,0,"ventoinha");f.rotation.x=-Math.PI/2;
for(var i=0;i<4;i++){var g=add(p,new T.TorusGeometry(.6+i*.45,.025,6,64),M.niquel(),0,H/2+.2,0,"ventoinha");g.rotation.x=Math.PI/2}
for(i=0;i<4;i++){var bar=box(p,4.6,.04,.04,M.niquel(),0,H/2+.2,0,"ventoinha");bar.rotation.y=i*Math.PI/4}
plano(p,3.8,2.7,mat(0xffffff,{map:colmeia("psu-grade","#26272b"),m:.5,r:.5}),.75,0,-D/2-.01,0,Math.PI,"grade");
box(p,.62,.95,.14,M.plast(),-1.85,.6,-D/2-.07,"chave");
box(p,.08,.3,.02,mat(0xeeeeee),-1.85,.75,-D/2-.15,"chave");
box(p,1.05,.75,.18,M.plast(),-1.85,-.62,-D/2-.09,"tomada");
inst(p,new T.BoxGeometry(.08,.22,.05),M.niquel(),[[-2.1,-.62,-D/2-.2],[-1.85,-.62,-D/2-.2],[-1.6,-.62,-D/2-.2]],"tomada");
box(p,W-.5,H-.5,.06,mat(0xffffff,{map:etiqueta("psu-mod",[["CPU/PCIe     CPU/PCIe     PCIe","20px IBM Plex Mono",30,40],["24 PIN      SATA/PERIF      12V-2x6","20px IBM Plex Mono",30,210]],512,256,"#141416","#cfcfd3"),r:.6}),0,0,D/2+.03,"modular");
[[-1.85,.55,1.25],[0,.55,1.25],[1.85,.55,1.05],[-1.6,-.55,1.6],[.35,-.55,.95],[1.85,-.55,1.05]].forEach(function(c){box(p,c[2],.48,.14,mat(0x0a0a0b),c[0],c[1],D/2+.1,"modular")});
var et=etiqueta("psu-et",[["BANCADA 850 W","bold 48px Sora, sans-serif",30,80],["AC 100-240 V  ATX 3.1","28px IBM Plex Mono, monospace",30,140],["+12V 70.8 A   +5V 22 A   +3.3V 22 A","24px IBM Plex Mono, monospace",30,190],["80 PLUS GOLD","bold 28px IBM Plex Mono, monospace",30,240]],640,280,"#d9dade","#111");
plano(p,4.2,1.85,mat(0xffffff,{map:et,m:.6,r:.35}),-W/2-.01,0,0,0,-Math.PI/2,"etiqueta");
inst(p,new T.CylinderGeometry(.07,.07,.04,10),M.niquel(),[[-2.7,1.4,-D/2-.02,Math.PI/2],[2.7,1.4,-D/2-.02,Math.PI/2],[-2.7,-1.4,-D/2-.02,Math.PI/2],[2.7,-1.4,-D/2-.02,Math.PI/2]]);
return {g:p,cam:[7,6,7]};
};

/* ---------- cooler ---------- */
B.refrigeracao=function(){
var p=new T.Group();
box(p,3.8,.5,4,M.cobre(),0,.25,0,"base");box(p,3.9,.08,4.1,M.niquel(),0,.54,0,"base");
for(var i=0;i<4;i++){var x=-1.2+i*.8;cyl(p,.15,.15,7.6,M.cobre(),x,4.2,-.6,"heatpipes",14);cyl(p,.15,.15,7.6,M.cobre(),x,4.2,.6,"heatpipes",14)}
for(var f=0;f<40;f++)box(p,5.8,.035,6.4,M.alu(),0,1.6+f*.16,0,"aletas");
box(p,5.9,.12,6.5,mat(0x1d1e22,{m:.6,r:.35}),0,8.05,0,"aletas");
plano(p,2.6,.6,mat(0xffffff,{map:etiqueta("cool-top",[["BANCADA","bold 52px Sora",24,72]],320,96,"#1d1e22","#c9ccd1")}),0,8.115,0,-Math.PI/2,0,"aletas");
quadro(p,6.2,0,4.7,3.45,"ventoinha",0x6e4a34);
fan(p,2.85,0,4.7,3.45,"ventoinha",null,{aro:0x6e4a34,hub:0x6e4a34,pa:0xd9c4a2,selo:0x6e4a34,pas:7});
inst(p,new T.CylinderGeometry(.22,.22,.12,16),mat(0x2a6f6b,{r:.8}),[[2.85,7.6,3.62,Math.PI/2],[-2.85,7.6,3.62,Math.PI/2],[2.85,1.8,3.62,Math.PI/2],[-2.85,1.8,3.62,Math.PI/2]],"ventoinha");
for(var s=-1;s<=1;s+=2)cyl(p,.03,.03,6.6,M.niquel(),s*2.95,4.7,3.2,"presilha",6);
var curve=new T.CatmullRomCurve3([new T.Vector3(2.6,2,3.7),new T.Vector3(3.6,1,3.9),new T.Vector3(4.4,0,3),new T.Vector3(5.2,-.2,1.5)]);
add(p,new T.TubeGeometry(curve,40,.07,8,false),mat(0x111112,{r:.8}),0,0,0,"cabo");
box(p,.5,.25,.15,M.plast(),5.2,-.25,1.4,"cabo");
return {g:p,cam:[9,7,10]};
};

/* ---------- gabinete ---------- */
B.gabinete=function(){
var p=new T.Group(),W=4.4,H=9.4,D=9.6;
var corpo=mat(0x16171a,{m:.5,r:.5});
box(p,W,.12,D,corpo,0,H/2,0);box(p,W,.12,D,corpo,0,-H/2,0);box(p,.12,H,D,corpo,-W/2,0,0);box(p,W,H,.12,corpo,0,0,-D/2);
box(p,W+.1,H+.1,.2,mat(0xffffff,{map:malha("case-malha"),r:.6}),0,0,D/2,"frente");
box(p,.06,H-.3,D-.3,mat(C.vidro,{m:.2,r:.05,op:.22}),W/2,0,0,"vidro");
for(var i=0;i<3;i++)fan(p,1.3,0,2.8-i*2.8,D/2-.45,"ventoinhas",null,{led:0xe8ecff});
fan(p,1.3,0,2.8,-D/2+.35,"ventoinhas",null,{led:0xe8ecff});
box(p,W-.2,.04,D-.6,mat(0x3a3b40,{op:.85}),0,-H/2-.08,0,"filtro");
box(p,W-.4,.12,1.6,M.plast(),0,H/2+.1,D/2-1.2,"io");
cyl(p,.22,.22,.1,M.niquel(),-1,H/2+.18,D/2-1.2,"io");inst(p,new T.BoxGeometry(.5,.05,.18),mat(0x050505),[[.2,H/2+.17,D/2-1.2],[.9,H/2+.17,D/2-1.2]],"io");
box(p,W-.2,2.2,D-.4,mat(0x202125,{m:.5,r:.5}),0,-H/2+1.2,0,"fonte");
for(var s=0;s<7;s++)box(p,2.4,.14,.08,M.alu(),-.3,-.3-s*.36,-D/2-.08,"traseira");
// peças dentro, para dar escala
box(p,.1,6.4,6.2,mat(0x17181b,{r:.6}),-W/2+.25,1.1,-.9);
for(i=0;i<2;i++)box(p,.5,1.7,.12,mat(0x1d1e22,{m:.6,r:.4}),-W/2+.6,2.4,.8+i*.35);
for(i=0;i<2;i++)box(p,.52,.08,.14,mat(0xffffff,{e:0xe8ecff,ei:.8}),-W/2+.6,3.28,.8+i*.35);
box(p,1.6,1.8,1.6,M.alu(),-W/2+1.2,2.6,-1.6);
box(p,2.6,1.1,5.6,mat(0x2b2d31,{m:.55,r:.35}),-W/2+1.6,-.4,-.4);
return {g:p,cam:[11,6,11]};
};

/* ================= variantes ================= */
function gravacao(id,l1,l2,cor){return etiqueta(id,[[l1,"bold 60px Sora, sans-serif",38,104],[l2,"28px IBM Plex Mono, monospace",40,160]],512,256,cor||"#cfd2d6","#6a6d73")}

/* processador Intel: retangular, entalhes laterais, LGA */
B["cpu-intel"]=function(){
var p=new T.Group(),W=3.75,D=4.5;
box(p,W,.12,D,mat(0xffffff,{map:pcbTex("subst-i","#24563a","#367a50",256,256),r:.55}),0,0,0,"substrato");
var ni=M.niquel();box(p,2.95,.28,3.55,ni,0,.2,0,"ihs");box(p,3.35,.14,1.2,ni,0,.13,0,"ihs");
plano(p,2.4,1.2,mat(0xffffff,{map:gravacao("cpu-i","BANCADA","ULTRA 7  B-02"),m:.9,r:.25}),0,.345,0,-Math.PI/2,0,"gravacao");
[[-1,1],[1,1]].forEach(function(s){box(p,.2,.14,.35,mat(0x050505),s[0]*1.9,0,.9)});
var tri=add(p,new T.CylinderGeometry(.16,.16,.02,3),M.ouro(),-1.7,.07,2.05,"triangulo");tri.rotation.y=Math.PI/6;
var ct=[];for(var a=0;a<26;a++)for(var b=0;b<32;b++){if(a>8&&a<17&&b>10&&b<21)continue;ct.push([-1.7+a*3.4/25,-.07,-2.1+b*4.2/31])}
inst(p,new T.BoxGeometry(.07,.02,.07),M.ouro(),ct,"contatos");
inst(p,new T.BoxGeometry(.1,.04,.06),M.smd(),Array.from({length:30},function(_,i){return [-.6+(i%6)*.24,-.08,-.9+Math.floor(i/6)*.42]}),"smd");
return {g:p,cam:[5,5,6]};
};
/* AMD AM4: pinos na CPU (PGA) */
B["cpu-am4"]=function(){
var p=new T.Group();
box(p,4,.12,4,mat(0xffffff,{map:pcbTex("subst-a4","#2c6b3f","#3f8a55",256,256),r:.55}),0,0,0,"substrato");
box(p,3.25,.32,3.25,M.niquel(),0,.22,0,"ihs");
plano(p,2.6,1.3,mat(0xffffff,{map:gravacao("cpu-a4","BANCADA","B-04  6C/12T"),m:.9,r:.25}),0,.385,0,-Math.PI/2,0,"gravacao");
var tri=add(p,new T.CylinderGeometry(.17,.17,.02,3),M.ouro(),-1.75,.07,1.75,"triangulo");tri.rotation.y=Math.PI/6;
var pin=[];for(var a=0;a<36;a++)for(var b=0;b<36;b++){if(a>12&&a<23&&b>12&&b<23)continue;if(a===0&&b===35)continue;pin.push([-1.85+a*3.7/35,-.22,-1.85+b*3.7/35])}
inst(p,new T.CylinderGeometry(.018,.018,.32,5),M.ouro(),pin,"pinos");
return {g:p,cam:[5,-2.5,6]};
};
/* notebook BGA: silício exposto e esferas de solda */
B["cpu-bga"]=function(){
var p=new T.Group();
box(p,3,.1,2.4,mat(0xffffff,{map:pcbTex("subst-b","#24563a","#367a50",256,256),r:.55}),0,0,0,"substrato");
box(p,1.25,.08,.95,mat(0x1d2026,{m:.95,r:.08}),-.35,.09,0,"die");box(p,.7,.07,.6,mat(0x1d2026,{m:.95,r:.08}),.75,.085,0,"die");
var sm=[];for(var i=0;i<16;i++)sm.push([-1.3+(i%8)*.33,.07,Math.floor(i/8)?.95:-.95]);inst(p,new T.BoxGeometry(.12,.05,.08),M.smd(),sm,"smd");
var bl=[];for(var a=0;a<22;a++)for(var b=0;b<17;b++)bl.push([-1.4+a*2.8/21,-.07,-1.1+b*2.2/16]);
inst(p,new T.SphereGeometry(.035,6,4),mat(0xc8cbd0,{m:1,r:.3}),bl,"esferas");
return {g:p,cam:[4,4,4]};
};

/* placa-mãe paramétrica: W = largura (x), D = altura (z), slots de memória e PCIe */
function placa(W,D,nDimm,nPcie,nome){
var p=new T.Group(),x0=-W/2,z0=-D/2;
box(p,W,.12,D,mat(0xffffff,{map:pcbTex("mb-"+nome,"#17181b","#26282d",1024,1024,[["BANCADA "+nome,560,980,"bold 22px monospace"]]),r:.6}),0,0,0);
var sx=x0+W*.42,sz=z0+3;
box(p,2.7,.12,2.7,mat(0x1a1a1c),sx,.12,sz,"socket");
box(p,2.8,.22,.25,M.niquel(),sx,.24,sz-1.25,"socket");box(p,2.8,.22,.25,M.niquel(),sx,.24,sz+1.25,"socket");
box(p,.25,.22,2.5,M.niquel(),sx-1.27,.24,sz,"socket");box(p,.25,.22,2.5,M.niquel(),sx+1.27,.24,sz,"socket");
box(p,2.1,.06,2.1,mat(0x111111),sx,.2,sz,"socket");
var lev=cyl(p,.035,.035,2.9,M.niquel(),sx+1.5,.25,sz,"socket",8);lev.rotation.x=Math.PI/2;
var dl=Math.min(9.6,D-2.2);
for(var i=0;i<nDimm;i++){var dx=sx+2.2+i*.55;box(p,.32,.36,dl,M.plast(),dx,.24,z0+.8+dl/2,"dimm");box(p,.34,.4,.3,mat(0x8d9096,{r:.5}),dx,.3,z0+.8+dl+.1,"dimm")}
var vr=mat(0x45484e,{m:.85,r:.35});
box(p,2.6,.75,.9,vr,sx-.2,.5,sz-2,"vrm");box(p,.9,.75,2.6,vr,sx-2.1,.5,sz,"vrm");
for(i=0;i<6;i++){box(p,.06,.25,.9,M.alu(),sx-1.3+i*.45,.98,sz-2,"vrm");box(p,.9,.25,.06,M.alu(),sx-2.1,.98,sz-1.1+i*.45,"vrm")}
box(p,1.4,1.7,Math.min(4.2,D*.42),mat(0x34363b,{m:.8,r:.3}),x0+.75,.91,z0+Math.min(4.2,D*.42)/2+.2,"io");
var pz=sz+2.4;
for(i=0;i<nPcie;i++){var len=i===0?8.5:(i===nPcie-1&&nPcie>2?2.3:7.2),z=pz+i*(D>9?1.9:1.6);if(z>D/2-.6)break;
box(p,Math.min(len,W-1.5),.42,.34,M.plast(),x0+.8+Math.min(len,W-1.5)/2,.27,z,"pcie");if(i===0)box(p,Math.min(len,W-1.5),.06,.42,M.niquel(),x0+.8+Math.min(len,W-1.5)/2,.5,z,"pcie")}
var m2=mat(0x3d4046,{m:.85,r:.32});box(p,Math.min(6,W-2.6),.2,1.4,m2,x0+.8+Math.min(6,W-2.6)/2,.16,pz-1.15,"m2");
if(W>8&&D>9){box(p,4.4,.16,1.3,m2,x0+3,.14,pz+.95,"m2")}
var cx=W/2-1.6,cz=D/2-1.6;box(p,2,.42,2,m2,cx,.27,cz,"chipset");
cyl(p,.5,.5,.16,M.niquel(),cx-2.2,.14,cz,"bateria");
box(p,.7,.6,2.8,M.plast(),W/2-.45,.36,sz+.6,"atx24");
box(p,1.4,.6,.6,M.plast(),x0+2.4,.36,z0+.45,"eps");
for(i=0;i<5;i++)capacitor(p,x0+.6+(i%3)*.38,.06,D/2-1+Math.floor(i/3)*.4,.13,.3,null,0xc9a227);
return {g:p,cam:[2,11,9]};
}
B["placa-atx"]=function(){return placa(9.8,12.2,4,3,"ATX")};
B["placa-matx"]=function(){return placa(9.8,9.8,4,2,"mATX")};
B["placa-itx"]=function(){return placa(6.8,6.8,2,1,"ITX")};

/* memória paramétrica */
function memoria(o){
var p=new T.Group(),L=o.L,H=o.H,NX=o.nx;
var pcb=mat(0xffffff,{map:pcbTex("pcb-"+o.id,o.verde?"#1f5a35":"#16171a",o.verde?"#2f7a4a":"#2a2c31",512,128,[[o.silk||"",14,118,"12px monospace"]]),r:.55});
var e=NX-.1,d=NX+.1;box(p,e+L/2,H,.12,pcb,(-L/2+e)/2,0,0);box(p,L/2-d,H,.12,pcb,(d+L/2)/2,0,0);box(p,.2,H-.45,.12,pcb,NX,.22,0);
box(p,.2,.45,.14,mat(0x050505,{op:.01}),NX,-H/2+.22,0,"entalhe");
var ct=chipTex("chip-"+o.id,["BANCADA",o.chip||"D5 16Gb","2621"]),n=o.chips,es=(L-1.6)/n;
if(!o.coberta)for(var i=0;i<n;i++)box(p,Math.min(1.1,es*.85),.9,.11,mat(0xffffff,{map:ct,r:.45}),-L/2+.8+es*(i+.5),.35,.115,"chips");
if(o.pmic&&!o.coberta)box(p,.55,.55,.1,mat(0xffffff,{map:chipTex("pmic",["PMIC","5100"])}),L/2-.6,-.5,.11,"pmic");
if(!o.coberta)box(p,.34,.24,.08,M.chip(),-L/2+.45,-.6,.1,"spd");
var cs=[],np=Math.round(L*5.4);for(var s=0;s<2;s++)for(var c=0;c<np;c++){var cx=-L/2+.25+c*(L-.5)/(np-1);if(Math.abs(cx-NX)<.16)continue;cs.push([cx,-H/2+.24,s?-.07:.07])}
inst(p,new T.BoxGeometry(Math.min(.1,(L-.5)/np*.7),.4,.015),M.ouro(),cs,"contatos");
if(o.coberta){var hs=mat(0x1d1e22,{m:.7,r:.35});box(p,L-.2,H-.55,.2,hs,0,.3,.18,"dissipador");box(p,L-.2,H-.55,.2,hs,0,.3,-.18,"dissipador");box(p,L-.1,.55,.6,hs,0,H/2+.1,0,"dissipador");
box(p,L-.5,.14,.4,mat(0xffffff,{e:0xf0f2ff,ei:.9,op:.95}),0,H/2+.45,0,"dissipador");
plano(p,L*.5,1.2,mat(0xffffff,{map:etiqueta("et-"+o.id,[["BANCADA DDR5","bold 48px Sora",30,82],["6400 MT/s  CL32","30px IBM Plex Mono",30,138]],640,180,"#d6d6da","#111")}),0,.35,.285,0,0,"etiqueta")}
return {g:p,cam:o.cam||[2,3,15]};
}
B["ram-ddr4"]=function(){return memoria({id:"ddr4",L:13.3,H:3.1,nx:-.5,chips:8,verde:true,chip:"D4 8Gb",silk:"DDR4 UDIMM  PC4-25600"})};
B["ram-rgb"]=function(){return memoria({id:"rgb",L:13.3,H:3.1,nx:.85,chips:8,coberta:true,pmic:true})};
B["ram-sodimm"]=function(){return memoria({id:"so",L:6.97,H:3,nx:-.9,chips:4,verde:true,pmic:true,silk:"DDR5 SODIMM",cam:[1.5,2.5,9]})};
B["ram-camm"]=function(){
var p=new T.Group();
box(p,7.8,.1,4,mat(0xffffff,{map:pcbTex("camm","#16171a","#2a2c31",512,256,[["CAMM2  LPDDR5X",20,240,"14px monospace"]]),r:.55}),0,0,0);
var ct=chipTex("lp",["LPDDR5X","16Gb"]);for(var i=0;i<4;i++)box(p,1.3,.1,1.1,mat(0xffffff,{map:ct}),-2.5+i*1.55,.1,-.8,"chips");
box(p,.55,.08,.55,mat(0xffffff,{map:chipTex("pmic",["PMIC","5100"])}),2.9,.09,.9,"pmic");
box(p,5.4,.14,.9,M.plast(),-.6,-.1,1.25,"conector");inst(p,new T.BoxGeometry(.05,.02,.6),M.ouro(),Array.from({length:60},function(_,i){return [-3.2+i*.088,-.03,1.25]}),"conector");
[[-3.5,1.6],[3.5,1.6],[-3.5,-1.6],[3.5,-1.6]].forEach(function(q){cyl(p,.16,.16,.12,M.niquel(),q[0],.1,q[1],"parafusos",16)});
return {g:p,cam:[3,6,6]};
};

/* armazenamento */
B["ssd-2230"]=function(){
var p=new T.Group();
box(p,3,.08,2.2,mat(0xffffff,{map:pcbTex("ssd30","#141518","#2a2c31",256,160),r:.55}),0,0,0);
box(p,.5,.09,1.15,M.ouro(),-1.25,0,.42,"conector");box(p,.5,.09,.62,M.ouro(),-1.25,0,-.74,"conector");
var furo=add(p,new T.TorusGeometry(.2,.05,8,24,Math.PI),M.ouro(),1.5,.05,0,"furo");furo.rotation.set(-Math.PI/2,0,Math.PI/2);
box(p,.9,.12,.9,mat(0xffffff,{map:chipTex("ctrl",["BANCADA","SSD CTRL","PCIe 4.0"]),m:.3,r:.3}),-.45,.1,0,"controlador");
box(p,1,.12,1.4,mat(0xffffff,{map:chipTex("nand",["NAND","TLC 1Tb","3D 232L"])}),.65,.1,0,"nand");
plano(p,2.4,1.4,mat(0xffffff,{map:etiqueta("ssd30-et",[["BANCADA 2230","bold 40px Sora",24,64],["1 TB  PCIe 4.0","24px IBM Plex Mono",24,110]],400,140,"#e9e9ec","#111"),r:.5}),.15,-.045,0,Math.PI/2,0,"etiqueta");
return {g:p,cam:[2,3,3.5]};
};
B["ssd-sata"]=function(){
var p=new T.Group(),cap={capa:true};
box(p,6.98,.7,10,mat(0x2a2b2f,{m:.7,r:.35}),0,0,0,"carcaca",cap);
plano(p,5.4,6.2,mat(0xffffff,{map:etiqueta("sata-et",[["BANCADA","bold 56px Sora",40,110],["SSD SATA 2,5\"","34px IBM Plex Mono",40,170],["1 TB  SATA III  6 Gb/s","28px IBM Plex Mono",40,230]],512,600,"#d9dade","#111"),r:.5}),0,.36,.4,-Math.PI/2,0,"carcaca").userData.capa=true;
box(p,6.4,.05,6,mat(0xffffff,{map:pcbTex("sata-pcb","#141518","#2a2c31",256,256)}),0,-.15,-1.6);
box(p,1.2,.1,1.2,mat(0xffffff,{map:chipTex("ctrl",["BANCADA","SSD CTRL","PCIe 4.0"])}),-1.5,-.08,-2.5,"controlador");box(p,1.5,.1,1.6,mat(0xffffff,{map:chipTex("nand",["NAND","TLC 1Tb","3D 232L"])}),1,-.08,-2.2,"nand");
box(p,1.2,.35,.25,M.plast(),-1.6,-.05,-5.1,"sata");box(p,2.2,.35,.25,M.plast(),.5,-.05,-5.1,"sata");
return {g:p,cam:[4,6,-9],dentro:true};
};
B.hd=function(){
var p=new T.Group(),cap={capa:true};
box(p,10.2,.4,14.7,mat(0xb9bdc2,{m:.7,r:.45}),0,-1,0,"carcaca");
box(p,10.2,1.6,.3,mat(0xb9bdc2,{m:.7,r:.45}),0,0,7.2,"carcaca");box(p,10.2,1.6,.3,mat(0xb9bdc2,{m:.7,r:.45}),0,0,-7.2,"carcaca");box(p,.3,1.6,14.7,mat(0xb9bdc2,{m:.7,r:.45}),5,0,0,"carcaca");box(p,.3,1.6,14.7,mat(0xb9bdc2,{m:.7,r:.45}),-5,0,0,"carcaca");
var tampa=box(p,10.2,.12,14.7,mat(0xc9ccd1,{m:.85,r:.3}),0,.86,0,"carcaca",cap);
plano(p,7,5,mat(0xffffff,{map:etiqueta("hd-et",[["BANCADA HD","bold 56px Sora",40,110],["4 TB  7200 RPM  SATA III","30px IBM Plex Mono",40,170],["NÃO ABRA: CONTÉM PARTES SENSÍVEIS","22px IBM Plex Mono",40,230]],600,420,"#e9e9ec","#111"),r:.5}),0,.93,2,-Math.PI/2,0,"carcaca").userData.capa=true;
var prato=mat(0xd9dce0,{m:1,r:.12});for(var i=0;i<3;i++)cyl(p,4.75,4.75,.08,prato,0,-.5+i*.38,1.6,"pratos",64);
cyl(p,.9,.9,1.2,M.niquel(),0,-.1,1.6,"pratos",32);
var braco=new T.Group();braco.position.set(3.6,.1,-4.6);p.add(braco);
var b1=new T.Mesh(new T.BoxGeometry(.7,.1,6.2),mat(0x8d9096,{m:.9,r:.3}));b1.position.set(-1.2,0,3);b1.rotation.y=.42;braco.add(b1);
var b2=new T.Mesh(new T.BoxGeometry(.25,.06,.5),mat(0x2a2b2f));b2.position.set(-2.4,-.05,5.8);braco.add(b2);
var b3=new T.Mesh(new T.CylinderGeometry(.7,.7,1.3,24),mat(0x3a3c41,{m:.8,r:.3}));braco.add(b3);
braco.traverse(function(c){if(c.isMesh){c.userData.ponto="cabeca";c.castShadow=true}});
box(p,9.6,.12,10,mat(0xffffff,{map:pcbTex("hd-pcb","#1f5a35","#2f7a4a",256,256)}),0,-1.26,-1.5,"placa");
box(p,1.2,.4,.3,M.plast(),-1.5,-.8,-7.45,"sata");box(p,2.2,.4,.3,M.plast(),.6,-.8,-7.45,"sata");
return {g:p,cam:[9,9,10],dentro:true};
};

/* placa de vídeo paramétrica */
function placaVideo(o){
var p=new T.Group(),L=o.L,H=o.H,cap={capa:true};
box(p,L,H-.2,.12,mat(0xffffff,{map:pcbTex("gpu-pcb","#141518","#2a2c31",512,192),r:.55}),0,0,0);
box(p,Math.min(2.6,H*.55),Math.min(2.6,H*.55),.06,mat(C.substrato,{r:.5}),0,.1,.09);box(p,Math.min(1.7,H*.36),Math.min(1.7,H*.36),.08,mat(0x2a2c30,{m:.9,r:.15}),0,.1,.15,"gpu");
var vt=chipTex("vram",["GDDR7","16Gb","32Gbps"]),nv=o.vram||8;for(var i=0;i<nv;i++){var a=i/nv*Math.PI*2;box(p,.7,.55,.08,mat(0xffffff,{map:vt}),Math.cos(a)*Math.min(2,H*.42),.1+Math.sin(a)*Math.min(1.5,H*.32),.1,"vram")}
var T2=o.esp||2.2,sh=mat(0x2b2d31,{m:.55,r:.35});
for(var f=0;f<Math.round(L*3);f++)box(p,.04,H-.5,T2-.5,M.alu(),-L/2+.4+f*(L-.8)/(Math.round(L*3)-1),0,(T2-.5)/2+.1,"dissipador",cap);
if(o.blower){box(p,L,H,T2,sh,0,0,T2/2+.1,null,cap);var r=add(p,new T.CylinderGeometry(1.5,1.5,.6,40),mat(0x16171a),L/2-2,0,T2+.15,"radial",cap);r.rotation.x=Math.PI/2;
for(i=0;i<24;i++){var bl=box(p,.06,.6,.55,mat(0x232428),L/2-2+Math.cos(i/24*Math.PI*2)*1.2,Math.sin(i/24*Math.PI*2)*1.2,T2+.2,"radial",cap);bl.rotation.z=i/24*Math.PI*2}}
else{box(p,L,H,.16,sh,0,0,T2,null,cap);box(p,L,.22,T2-.2,sh,0,H/2-.1,T2/2+.1,null,cap);box(p,L,.22,T2-.2,sh,0,-H/2+.1,T2/2+.1,null,cap);
var nf=o.fans,fr=Math.min((L-1)/nf/2*.92,H/2*.88);for(i=0;i<nf;i++)fan(p,fr,-L/2+.5+(L-1)/nf*(i+.5),0,T2+.12,"ventoinhas",cap)}
box(p,L,H-.2,.08,mat(0x3a3c41,{m:.75,r:.3}),0,0,-.22,"backplate");
var pins=[];for(i=0;i<(o.lp?36:44);i++){var x=-L/2+1.2+i*.13+(i>10?.25:0);pins.push([x,-H/2-.2,.07]);pins.push([x,-H/2-.2,-.07])}inst(p,new T.BoxGeometry(.08,.48,.02),M.ouro(),pins,"pcie");
if(!o.lp)box(p,1.45,.55,.62,M.plast(),L/2-2.2,H/2+.12,.35,"energia");
var bh=o.lp?H+.6:H+1.3;box(p,.1,bh,T2+.6,mat(C.aluminio,{m:.9,r:.3}),-L/2-.1,.2,T2/2,"saidas");
for(i=0;i<(o.lp?2:4);i++)box(p,.16,.5,.9,M.plast(),-L/2-.2,H/2-.6-i*.85,T2*.55,"saidas");
if(o.blower)for(i=0;i<6;i++)box(p,.12,.1,1.4,mat(0x0a0a0a),-L/2-.17,-1.6+i*.18,T2*.5);
return {g:p,cam:o.cam||[6,4,13],dentro:true};
}
B["gpu-3"]=function(){return placaVideo({L:15.5,H:5.4,fans:3,esp:2.9,vram:8,cam:[7,4,15]})};
B["gpu-lp"]=function(){return placaVideo({L:8,H:2.9,fans:1,esp:1.4,vram:4,lp:true,cam:[4,3,8]})};
B["gpu-blower"]=function(){return placaVideo({L:12.5,H:4.4,blower:true,esp:1.9,vram:8})};

/* fontes */
B["fonte-fixa"]=function(){
var r=B.fonte(),p=r.g;
p.children.filter(function(c){return c.userData.ponto==="modular"}).forEach(function(c){p.remove(c)});
box(p,5.5,2.9,.06,mat(0x1b1c1f,{m:.35,r:.55}),0,0,2.83);
var cor=mat(0x111112,{r:.8});[[-1.6,.6],[-.6,.5],[.5,.7],[1.5,.4],[-1,-.6],[.9,-.5]].forEach(function(q,i){
var curve=new T.CatmullRomCurve3([new T.Vector3(q[0]*.4,q[1]*.4,2.8),new T.Vector3(q[0],q[1],4),new T.Vector3(q[0]*1.3,q[1]-1.4-i*.3,5.4+i*.2)]);add(p,new T.TubeGeometry(curve,24,.16,8,false),cor,0,0,0,"cabos")});
return r;
};
B["fonte-sfx"]=function(){
var p=new T.Group(),W=5,H=2.54,D=4;
box(p,W,H,D,mat(0x1b1c1f,{m:.35,r:.55}),0,0,0);
var f=fan(p,1.6,0,H/2+.03,0,"ventoinha");f.rotation.x=-Math.PI/2;
for(var i=0;i<3;i++){var g=add(p,new T.TorusGeometry(.5+i*.45,.022,6,64),M.niquel(),0,H/2+.15,0,"ventoinha");g.rotation.x=Math.PI/2}
plano(p,2.6,2,mat(0xffffff,{map:colmeia("psu-grade","#26272b"),m:.5,r:.5}),.7,0,-D/2-.01,0,Math.PI,"grade");
box(p,.5,.8,.12,M.plast(),-1.6,.4,-D/2-.06,"chave");box(p,.9,.65,.15,M.plast(),-1.6,-.55,-D/2-.08,"tomada");
box(p,W-.5,H-.5,.06,mat(0x141416),0,0,D/2+.03,"modular");[[-1.4,.4],[0,.4],[1.4,.4],[-.7,-.5],[.8,-.5]].forEach(function(c){box(p,1,.42,.12,mat(0x0a0a0b),c[0],c[1],D/2+.09,"modular")});
plano(p,3.2,1.6,mat(0xffffff,{map:etiqueta("sfx-et",[["BANCADA SFX 750 W","bold 46px Sora",30,80],["80 PLUS GOLD  ATX 3.1","28px IBM Plex Mono",30,140]],640,200,"#d9dade","#111"),m:.6,r:.35}),-W/2-.01,0,0,0,-Math.PI/2,"etiqueta");
return {g:p,cam:[6,5,6]};
};

/* refrigeração */
B["cooler-box"]=function(){
var p=new T.Group();
cyl(p,1.4,1.4,.3,M.cobre(),0,.15,0,"base",40);
for(var i=0;i<40;i++){var a=i/40*Math.PI*2,f=box(p,1.7,1.8,.05,M.alu(),Math.cos(a)*1.55,1.2,Math.sin(a)*1.55,"aletas");f.rotation.y=-a}
cyl(p,.8,.8,1.9,M.alu(),0,1.2,0,"aletas",32);
var fg=fan(p,2.4,0,2.35,0,"ventoinha");fg.rotation.x=-Math.PI/2;
box(p,5.2,.18,5.2,mat(0x1b1c1f,{r:.6}),0,2.25,0,"ventoinha");
[[-2.5,-2.5],[2.5,2.5],[-2.5,2.5],[2.5,-2.5]].forEach(function(q){cyl(p,.25,.25,2.3,M.plast(),q[0]*.88,1.1,q[1]*.88,"presilha",12)});
var curve=new T.CatmullRomCurve3([new T.Vector3(2.4,2.3,0),new T.Vector3(3.2,1.2,.4),new T.Vector3(3.6,0,1.2)]);add(p,new T.TubeGeometry(curve,20,.06,8,false),mat(0x111112),0,0,0,"cabo");
return {g:p,cam:[7,6,7]};
};
B["cooler-dupla"]=function(){
var p=new T.Group();
box(p,3.8,.5,4,M.cobre(),0,.25,0,"base");box(p,3.9,.08,4.1,M.niquel(),0,.54,0,"base");
for(var i=0;i<6;i++){var x=-1.5+i*.6;cyl(p,.14,.14,7.6,M.cobre(),x,4.2,-3,"heatpipes",12);cyl(p,.14,.14,7.6,M.cobre(),x,4.2,3,"heatpipes",12);var u=cyl(p,.14,.14,6,M.cobre(),x,.9,0,"heatpipes",12);u.rotation.x=Math.PI/2}
for(var s=-1;s<=1;s+=2)for(var f=0;f<40;f++)box(p,5.8,.035,2.6,M.alu(),0,1.6+f*.16,s*3,"aletas");
for(s=-1;s<=1;s+=2)box(p,5.9,.12,2.7,mat(0x1d1e22,{m:.6,r:.35}),0,8.05,s*3,"aletas");
quadro(p,6.2,0,4.7,0,"ventoinha",0x6e4a34);fan(p,2.85,0,4.7,0,"ventoinha",null,{aro:0x6e4a34,hub:0x6e4a34,pa:0xd9c4a2,selo:0x6e4a34,pas:7});
quadro(p,6.2,0,4.7,4.6,"ventoinha",0x6e4a34);fan(p,2.85,0,4.7,4.6,"ventoinha",null,{aro:0x6e4a34,hub:0x6e4a34,pa:0xd9c4a2,selo:0x6e4a34,pas:7});
for(s=-1;s<=1;s+=2)cyl(p,.03,.03,6.6,M.niquel(),s*2.95,4.7,4.4,"presilha",6);
var curve=new T.CatmullRomCurve3([new T.Vector3(2.6,2,4.8),new T.Vector3(3.6,1,5),new T.Vector3(4.4,0,4),new T.Vector3(5.2,-.2,2.5)]);add(p,new T.TubeGeometry(curve,40,.07,8,false),mat(0x111112,{r:.8}),0,0,0,"cabo");
return {g:p,cam:[11,8,10]};
};
B["cooler-baixo"]=function(){
var p=new T.Group();
box(p,3.8,.4,4,M.cobre(),0,.2,0,"base");
for(var i=0;i<4;i++){var x=-1.2+i*.8,c=cyl(p,.13,.13,1.6,M.cobre(),x,1,0,"heatpipes",12);var h2=cyl(p,.13,.13,6.4,M.cobre(),x,1.75,0,"heatpipes",12);h2.rotation.x=Math.PI/2}
for(var f=0;f<38;f++)box(p,6.4,.9,.04,M.alu(),0,2.1,-3+f*.162,"aletas");
quadro(p,6.4,0,2.85,0,"ventoinha");var fg=fan(p,2.95,0,2.85,0,"ventoinha");fg.rotation.x=-Math.PI/2;
p.children.forEach(function(c){if(c.userData.ponto==="ventoinha"&&c.geometry&&c.geometry.type==="BoxGeometry"){var v=c.position.clone();c.rotation.x=-Math.PI/2;c.position.set(v.x,2.85,v.y-2.85)}});
var curve=new T.CatmullRomCurve3([new T.Vector3(3.1,2.8,0),new T.Vector3(3.8,1.6,.6),new T.Vector3(4.2,0,1.6)]);add(p,new T.TubeGeometry(curve,20,.06,8,false),mat(0x111112),0,0,0,"cabo");
return {g:p,cam:[8,7,8]};
};
function aio(n){
var p=new T.Group();
cyl(p,1.9,1.9,.35,M.cobre(),0,.18,0,"base",40);var bomba=cyl(p,1.8,1.8,1.4,mat(0x1b1c1f,{m:.4,r:.4}),0,1.05,0,"bomba",40);
var tp=add(p,new T.CircleGeometry(1.6,40),mat(0xffffff,{map:etiqueta("aio-logo",[["BANCADA","bold 44px Sora",20,72]],256,128,"#111113","#e6e6ea"),r:.4}),0,1.76,0,"bomba");tp.rotation.x=-Math.PI/2;
var ring=add(p,new T.TorusGeometry(1.78,.05,8,48),mat(0xffffff,{e:0xf0f2ff,ei:.8}),0,1.74,0,"bomba");ring.rotation.x=Math.PI/2;
var RL=n*6.3+.8,rx=-RL/2+1,ry=7,rz=-5;
var cxr=rx+RL/2-1;
box(p,RL,6.4,1.3,mat(0x1b1c1f,{m:.5,r:.45}),cxr,ry,rz,"radiador");
for(var f=0;f<Math.round(RL*4);f++)box(p,.03,5.9,1.32,M.alu(),cxr-RL/2+.3+f*(RL-.6)/(Math.round(RL*4)-1),ry,rz,"radiador");
for(var i=0;i<n;i++){var cxf=cxr-RL/2+.4+3.15+i*6.3;quadro(p,6,cxf,ry,rz+1.3,"ventoinhas");fan(p,2.75,cxf,ry,rz+1.3,"ventoinhas")}
[-.5,.5].forEach(function(s){var curve=new T.CatmullRomCurve3([new T.Vector3(1.6,1.2,s),new T.Vector3(4,3,s*1.5),new T.Vector3(cxr+RL/2+.3,ry-2.2,rz+s*.5)]);add(p,new T.TubeGeometry(curve,40,.22,10,false),mat(0x121214,{r:.85}),0,0,0,"mangueiras")});
return {g:p,cam:[10,11,13]};
}
B["aio-240"]=function(){return aio(2)};
B["aio-360"]=function(){return aio(3)};

/* gabinetes */
function gab(W,H,D,nFrente,vertical){
var p=new T.Group(),corpo=mat(0x16171a,{m:.5,r:.5});
box(p,W,.12,D,corpo,0,H/2,0);box(p,W,.12,D,corpo,0,-H/2,0);box(p,.12,H,D,corpo,-W/2,0,0);box(p,W,H,.12,corpo,0,0,-D/2);
box(p,W+.1,H+.1,.2,mat(0xffffff,{map:malha("case-malha"),r:.6}),0,0,D/2,"frente");
box(p,.06,H-.3,D-.3,mat(C.vidro,{m:.2,r:.05,op:.22}),W/2,0,0,"vidro");
var fr=Math.min(1.3,W*.3),passo=(H-1.2)/nFrente;for(var i=0;i<nFrente;i++)fan(p,fr,0,H/2-.8-passo*(i+.5)+.3,D/2-.45,"ventoinhas",null,{led:0xe8ecff});
fan(p,fr,0,H/2-fr-.4,-D/2+.35,"ventoinhas",null,{led:0xe8ecff});
box(p,W-.2,.04,D-.6,mat(0x3a3b40,{op:.85}),0,-H/2-.08,0,"filtro");
box(p,W-.4,.12,1.4,M.plast(),0,H/2+.1,D/2-1.1,"io");cyl(p,.2,.2,.1,M.niquel(),-W*.22,H/2+.18,D/2-1.1,"io");
if(!vertical)box(p,W-.2,Math.min(2.2,H*.22),D-.4,mat(0x202125,{m:.5,r:.5}),0,-H/2+Math.min(1.1,H*.11)+.1,0,"fonte");
for(var s=0;s<(vertical?2:7);s++)box(p,Math.min(2.4,W*.55),.14,.08,M.alu(),-.3,-.3-s*.36,-D/2-.08,"traseira");
box(p,.1,Math.min(6.4,H*.62),Math.min(6.2,D*.62),mat(0x17181b,{r:.6}),-W/2+.25,H*.1,-D*.08);
box(p,Math.min(1.6,W*.36),Math.min(1.8,H*.2),1.6,M.alu(),-W/2+Math.min(1.2,W*.28),H*.22,-D*.15);
return {g:p,cam:[11,6,11]};
}
B["gabinete-itx"]=function(){return gab(3.4,5.6,7,1,true)};
B["gabinete-full"]=function(){var r=gab(5.4,12.5,11.5,4);r.cam=[14,7,14];return r};

return B;
})();
