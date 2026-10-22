/* Interface do Bancada: rotas, telas e componentes. A lógica pura fica em src/logica. */
import "./jogo.js";
import {
  dividirTokens,
  especificidade,
  fatiaPython,
  juntarRetangulos,
  memoria,
  probabilidades,
} from "./logica/calculos.js";
import { buscar as buscarEm, pad, semAcento } from "./logica/texto.js";

var LIVROS = window.LIVROS || [],
  PDFS = window.BIBLIOTECA_PDF || [],
  NIV = ["Básico", "Intermediário", "Avançado"];
LIVROS.sort((a, b) => NIV.indexOf(a.nivel) - NIV.indexOf(b.nivel) || (b.proprio ? 1 : 0) - (a.proprio ? 1 : 0));
var VOL = 0;
LIVROS.forEach((b) => {
  if (b.proprio) b.vol = ++VOL;
});

/* ---------- utilidades ---------- */
function h(t, c, x) {
  var e = document.createElement(t);
  if (c) e.className = c;
  if (x != null) {
    if (Array.isArray(x))
      x.forEach((k) => {
        if (k != null) e.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
      });
    else e.textContent = x;
  }
  return e;
}
function ln(href, c, x) {
  var a = h("a", c, x);
  a.href = href;
  if (/^https?:/.test(href)) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  return a;
}
function svg(s) {
  var d = h("div");
  d.innerHTML = s;
  return d.firstChild;
}
var ICO_SEC = {
  Biblioteca: "livros",
  Peças: "pecas",
  "Guias práticos": "guias",
  Glossário: "glossario",
  Trilhas: "trilhas",
  Trilha: "trilhas",
  "Banco de questões": "trilhas",
};
function head(eb, t, l) {
  var e = null;
  if (eb) {
    e = h("div", "eyebrow", eb);
    var ic = ICO_SEC[eb] || (/^Peça/.test(eb) ? "pecas" : null);
    if (ic) {
      var sp = h("span");
      sp.innerHTML = ICO[ic];
      e.insertBefore(sp.firstChild, e.firstChild);
    }
  }
  return h("div", "pg-head", [e, h("h1", null, t), l ? h("p", "lead", l) : null]);
}
function page(eb, t, l, k) {
  return h("div", "wrap pg", [head(eb, t, l)].concat(k));
}
function chipRow(box, items, get, set, counts) {
  var bs = [];
  items.forEach((v) => {
    var b = h("button", "chip", [v || "Todos", counts ? h("span", "ct", String(counts[v] || 0)) : null]);
    b.onclick = () => {
      set(v);
    };
    b.dataset.v = v;
    bs.push(b);
    box.appendChild(b);
  });
  return () => {
    bs.forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.v === get()));
    });
  };
}
var limpar = []; /* funções chamadas ao trocar de página (ex.: liberar o 3D) */

/* ---------- ilustrações das peças para a lista (SVG em cinza) ---------- */
var ART = {
  cpu: '<svg viewBox="0 0 400 400" aria-hidden="true"><defs><linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f2f2"/><stop offset=".45" stop-color="#b9b9bc"/><stop offset="1" stop-color="#6d6d70"/></linearGradient><pattern id="pads" width="9" height="9" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="4" rx="1" fill="#8a8a8d"/></pattern></defs><g transform="rotate(-14 200 200)"><rect x="70" y="70" width="260" height="260" rx="10" fill="#1d1d20"/><rect x="78" y="78" width="244" height="244" rx="8" fill="url(#pads)" opacity=".35"/><path d="M110 92h180a18 18 0 0 1 18 18v180a18 18 0 0 1-18 18H110a18 18 0 0 1-18-18V110a18 18 0 0 1 18-18z" fill="url(#ihs)"/><text x="200" y="196" text-anchor="middle" font-family="Sora,sans-serif" font-weight="700" font-size="26" fill="#3a3a3d">BANCADA</text></g></svg>',
  ram:
    '<svg viewBox="0 0 400 400" aria-hidden="true"><g transform="rotate(-24 200 200)"><rect x="20" y="150" width="360" height="110" rx="6" fill="#1d1d20"/>' +
    Array.from(
      { length: 8 },
      (_, i) => '<rect x="' + (34 + i * 44) + '" y="166" width="34" height="40" fill="#0b0b0c" stroke="#3a3a3d"/>',
    ).join("") +
    '<g fill="#c9c9cc">' +
    Array.from(
      { length: 30 },
      (_, i) => '<rect x="' + (30 + i * 11.6) + '" y="236" width="7" height="20" rx="1"/>',
    ).join("") +
    '</g><rect x="196" y="236" width="10" height="24" fill="#1d1d20"/></g></svg>',
  armazenamento:
    '<svg viewBox="0 0 400 400" aria-hidden="true"><g transform="rotate(-30 200 200)"><rect x="30" y="165" width="340" height="70" rx="6" fill="#1d1d20"/><rect x="60" y="178" width="60" height="44" fill="#0b0b0c" stroke="#3a3a3d"/><rect x="140" y="176" width="80" height="48" fill="#0b0b0c" stroke="#3a3a3d"/><rect x="236" y="176" width="80" height="48" fill="#0b0b0c" stroke="#3a3a3d"/><circle cx="354" cy="200" r="8" fill="none" stroke="#9c9c9f" stroke-width="3"/></g></svg>',
  gpu:
    '<svg viewBox="0 0 400 400" aria-hidden="true"><g transform="rotate(-12 200 200)"><rect x="20" y="120" width="360" height="150" rx="16" fill="#2a2a2d"/>' +
    [120, 280]
      .map(
        (cx) =>
          '<circle cx="' +
          cx +
          '" cy="195" r="62" fill="#0d0d0e" stroke="#4a4a4d"/><circle cx="' +
          cx +
          '" cy="195" r="15" fill="#d9d9dc"/>',
      )
      .join("") +
    '<rect x="110" y="270" width="170" height="10" fill="#c9c9cc"/></g></svg>',
};
function partArt(id) {
  return ART[id]
    ? svg(ART[id])
    : svg(
        '<svg viewBox="0 0 200 130" aria-hidden="true"><text x="100" y="98" text-anchor="middle" font-family="Sora,sans-serif" font-weight="800" font-size="96" fill="none" stroke="#949497" stroke-width="1.2">' +
          id.charAt(0).toUpperCase() +
          "</text></svg>",
      );
}

/* ---------- visualizador 3D ---------- */
/* cena comum ao visualizador e às miniaturas: luz de estúdio com reflexos (RoomEnvironment) e sombra no chão */
function montarCena(id, R) {
  var T = THREE;
  R.outputEncoding = T.sRGBEncoding;
  R.toneMapping = T.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true;
  R.shadowMap.type = T.PCFSoftShadowMap;
  var scene = new T.Scene(),
    cam = new T.PerspectiveCamera(32, 1, 0.1, 500);
  if (T.RoomEnvironment) {
    var pm = new T.PMREMGenerator(R);
    scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
    pm.dispose();
  }
  scene.add(new T.HemisphereLight(0xffffff, 0x111113, scene.environment ? 0.25 : 0.6));
  var built = MODELOS3D[id](),
    model = built.g,
    piv = new T.Group();
  var bb = new T.Box3().setFromObject(model),
    ctr = bb.getCenter(new T.Vector3()),
    dim = bb.getSize(new T.Vector3()),
    size = dim.length();
  model.position.sub(ctr);
  piv.add(model);
  scene.add(piv);
  /* reflexos mais contidos: metais brilham, superfícies pintadas continuam escuras */
  model.traverse((o) => {
    if (o.material && o.material.isMeshStandardMaterial)
      o.material.envMapIntensity = o.material.metalness > 0.8 ? 0.9 : 0.35;
  });
  var k1 = new T.DirectionalLight(0xffffff, scene.environment ? 1.1 : 1.3);
  k1.position.set(size * 0.5, size * 1.2, size * 0.7);
  k1.castShadow = true;
  k1.shadow.mapSize.set(1024, 1024);
  var sc = k1.shadow.camera;
  sc.left = sc.bottom = -size;
  sc.right = sc.top = size;
  sc.near = 0.1;
  sc.far = size * 4;
  k1.shadow.bias = -0.0005;
  k1.shadow.radius = 4;
  scene.add(k1);
  var k2 = new T.DirectionalLight(0xdfe6ff, 0.35);
  k2.position.set(-size, size * 0.4, -size * 0.8);
  scene.add(k2);
  var chao = new T.Mesh(new T.PlaneGeometry(size * 4, size * 4), new T.ShadowMaterial({ opacity: 0.35 }));
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -dim.y / 2 - 0.02;
  chao.receiveShadow = true;
  scene.add(chao);
  return { scene: scene, cam: cam, built: built, model: model, size: size };
}
/* miniaturas dos cards da aba Peças, desenhadas uma vez a partir dos modelos 3D */
var MINI = {};
function miniatura(id, img) {
  if (MINI[id]) {
    img.src = MINI[id];
    return;
  }
  if (!window.MODELOS3D || !MODELOS3D[id]) return;
  miniatura.fila = (miniatura.fila || Promise.resolve()).then(
    () =>
      new Promise((ok) => {
        setTimeout(() => {
          try {
            var T = THREE,
              R =
                miniatura.R ||
                (miniatura.R = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }));
            R.setPixelRatio(1);
            R.setSize(560, 420, false);
            var c = montarCena(id, R),
              d = new T.Vector3()
                .fromArray(c.built.cam || [5, 5, 8])
                .normalize()
                .multiplyScalar(c.size * 1.75);
            c.cam.position.copy(d);
            c.cam.aspect = 4 / 3;
            c.cam.lookAt(0, 0, 0);
            c.cam.updateProjectionMatrix();
            R.render(c.scene, c.cam);
            MINI[id] = R.domElement.toDataURL("image/png");
            img.src = MINI[id];
            c.scene.traverse((o) => {
              if (o.geometry) o.geometry.dispose();
              if (o.material) {
                if (o.material.map) o.material.map.dispose();
                o.material.dispose();
              }
            });
          } catch (e) {}
          ok();
        }, 0);
      }),
  );
}
function viewer3d(a, mini, op) {
  op = op || {};
  var mid = op.modelo || a.id,
    PT = op.pontos || a.pontos || {};
  var stage = h("div", "v3d-stage");
  if (!window.MODELOS3D || !MODELOS3D[mid]) {
    stage.appendChild(
      h("div", "v3d-fallback", "O modelo 3D não carregou neste navegador. O texto sobre a peça continua abaixo."),
    );
    return mini ? stage : h("div", "v3d", [stage]);
  }
  var T = THREE,
    R;
  try {
    R = new T.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    stage.appendChild(h("div", "v3d-fallback", "Seu navegador não ativou o 3D (WebGL)."));
    return mini ? stage : h("div", "v3d", [stage]);
  }
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var cena = montarCena(mid, R),
    scene = cena.scene,
    cam = cena.cam,
    built = cena.built,
    model = cena.model,
    size = cena.size;
  var dir = new T.Vector3().fromArray(built.cam || [5, 5, 8]).normalize();
  var DIST = mini ? 2.1 : 1.9;
  cam.position.copy(dir.multiplyScalar(size * DIST));
  stage.appendChild(R.domElement);
  R.domElement.setAttribute("aria-label", "Modelo 3D: " + a.n + ". Arraste para girar.");
  R.domElement.setAttribute("role", "img");
  var ctl = new T.OrbitControls(cam, R.domElement);
  ctl.enableDamping = true;
  ctl.dampingFactor = 0.08;
  ctl.enablePan = false;
  ctl.minDistance = size * 0.6;
  ctl.maxDistance = size * 3.2;
  ctl.autoRotate = true;
  ctl.autoRotateSpeed = mini ? 1.6 : 1;
  if (mini) ctl.enableZoom = false;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) ctl.autoRotate = false;
  ctl.addEventListener("start", () => {
    ctl.autoRotate = false;
  });

  /* pontos clicáveis */
  var keys = mini ? [] : Object.keys(PT),
    grupos = {},
    marks = {},
    info,
    itens = {},
    sel = null,
    dentro = false;
  model.traverse((o) => {
    var k = o.userData.ponto;
    if (k && o.material) {
      (grupos[k] = grupos[k] || []).push(o);
    }
  });
  keys = keys.filter((k) => grupos[k]);
  /* o número fica no centro da primeira malha visível da parte (não no meio do grupo, para não se sobrepor) */
  function ancora(k) {
    var o = grupos[k].filter((x) => x.visible)[0];
    if (!o) return null;
    return new T.Box3().setFromObject(o).getCenter(new T.Vector3());
  }
  function brilho(k, on) {
    (grupos[k] || []).forEach((o) => {
      if (o.material.emissive) o.material.emissive.setHex(on ? 0x5a5a60 : o.material.userData.emissiveBase || 0);
    });
  }
  function escolher(k) {
    if (sel) brilho(sel, false);
    sel = k;
    brilho(k, true);
    keys.forEach((x) => {
      marks[x].setAttribute("aria-pressed", String(x === k));
      itens[x].setAttribute("aria-pressed", String(x === k));
    });
    var i = keys.indexOf(k),
      p = PT[k];
    info.textContent = "";
    info.appendChild(h("div", "n", "Parte " + pad(i + 1) + " de " + pad(keys.length)));
    info.appendChild(h("h3", null, p[0]));
    info.appendChild(h("p", null, p[1]));
    ctl.autoRotate = false;
  }
  var layer = h("div");
  stage.appendChild(layer);
  keys.forEach((k, i) => {
    var m = h("button", "mk", pad(i + 1));
    m.setAttribute("aria-label", PT[k][0]);
    m.onclick = () => {
      escolher(k);
    };
    marks[k] = m;
    layer.appendChild(m);
  });

  /* clique direto na peça */
  var ray = new T.Raycaster(),
    ptr = new T.Vector2(),
    down = null;
  R.domElement.addEventListener("pointerdown", (e) => {
    down = [e.clientX, e.clientY];
  });
  R.domElement.addEventListener("pointerup", (e) => {
    if (mini || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    var r = R.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    var hit = ray
      .intersectObject(model, true)
      .filter((x) => x.object.visible && x.object.userData.ponto && grupos[x.object.userData.ponto])[0];
    if (hit) escolher(hit.object.userData.ponto);
  });

  /* tamanho e laço de desenho */
  var W = 0,
    H = 0,
    raf = 0,
    vivo = true,
    v = new T.Vector3(),
    tick = 0,
    oc = new T.Raycaster();
  function medir() {
    var w = stage.clientWidth,
      hh = stage.clientHeight;
    if (w && hh && (w !== W || hh !== H)) {
      W = w;
      H = hh;
      R.setSize(w, hh, false);
      cam.aspect = w / hh;
      cam.updateProjectionMatrix();
    }
  }
  /* número atrás da peça fica apagado; a checagem roda a cada 8 quadros para economizar */
  function oculto(k, c) {
    var d = c.clone().sub(cam.position),
      dist = d.length();
    oc.set(cam.position, d.normalize());
    var hit = oc.intersectObject(model, true).filter((x) => x.object.visible)[0];
    return hit && hit.distance < dist - 0.05 && hit.object.userData.ponto !== k;
  }
  function frame() {
    if (!vivo) return;
    raf = requestAnimationFrame(frame);
    medir();
    ctl.update();
    R.render(scene, cam);
    tick++;
    keys.forEach((k) => {
      var c = ancora(k),
        m = marks[k];
      if (!c) {
        m.hidden = true;
        return;
      }
      if (tick % 8 === 1) m.style.opacity = oculto(k, c) ? ".35" : "1";
      v.copy(c).project(cam);
      m.hidden = v.z > 1;
      m.style.transform = "translate(" + ((v.x + 1) / 2) * W + "px," + ((1 - v.y) / 2) * H + "px)";
    });
  }
  frame();
  var destruir = () => {
    if (!vivo) return;
    vivo = false;
    cancelAnimationFrame(raf);
    ctl.dispose();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    R.dispose();
    R.forceContextLoss();
  };
  limpar.push(destruir);
  stage._destruir = destruir;
  if (mini) return stage;

  /* ferramentas e painel */
  var tools = h("div", "v3d-tools"),
    rb = h("button", null, "Girar sozinho");
  rb.setAttribute("aria-pressed", String(ctl.autoRotate));
  rb.onclick = () => {
    ctl.autoRotate = !ctl.autoRotate;
    rb.setAttribute("aria-pressed", String(ctl.autoRotate));
  };
  var rs = h("button", null, "Recentralizar");
  rs.onclick = () => {
    cam.position.copy(
      new T.Vector3()
        .fromArray(built.cam || [5, 5, 8])
        .normalize()
        .multiplyScalar(size * DIST),
    );
    ctl.target.set(0, 0, 0);
  };
  tools.appendChild(rb);
  tools.appendChild(rs);
  if (built.dentro) {
    var dn = h("button", null, "Ver por dentro");
    dn.setAttribute("aria-pressed", "false");
    dn.onclick = () => {
      dentro = !dentro;
      dn.setAttribute("aria-pressed", String(dentro));
      model.traverse((o) => {
        if (o.userData.capa) o.visible = !dentro;
      });
    };
    tools.appendChild(dn);
  }
  stage.appendChild(tools);
  stage.appendChild(h("div", "v3d-help", "Arraste · role para aproximar"));
  info = h("div", "v3d-info", [
    h("div", "n", keys.length + " partes para explorar"),
    h("h3", null, "Toque num número"),
    h("p", null, "Ou clique direto na peça. Cada parte tem uma explicação curta."),
  ]);
  var ul = h("ul", "v3d-list");
  keys.forEach((k, i) => {
    var b = h("button", null, PT[k][0]);
    b.dataset.n = pad(i + 1);
    b.onclick = () => {
      escolher(k);
    };
    itens[k] = b;
    ul.appendChild(h("li", null, [b]));
  });
  var el = h("div", "v3d", [stage, h("div", "v3d-side", [info, ul])]);
  el._destruir = destruir;
  return el;
}

/* ---------- capas ---------- */
var CORES = {
  "Hardware e eletrônica": "var(--c-hw)",
  Web: "var(--c-web)",
  Programação: "var(--c-prog)",
  "Dados e IA": "var(--c-dados)",
  "Sistemas operacionais": "var(--c-so)",
  Infraestrutura: "var(--c-so)",
};
var CURTO = {
  "Hardware e eletrônica": "Hardware",
  "Sistemas operacionais": "Sistemas",
  "Engenharia de software": "Engenharia",
};
var S = ' fill="none" stroke="#fff" stroke-width="1" vector-effect="non-scaling-stroke"';
var MOTIF = [
  (k) => {
    var y = 8 + (k % 24),
      x = 30 + (k % 60);
    return (
      '<svg class="mo" viewBox="0 0 200 120" preserveAspectRatio="none"><path d="M0 ' +
      (y + 40) +
      "H" +
      x +
      "L" +
      (x + 14) +
      " " +
      (y + 26) +
      "H" +
      (x + 70) +
      "L" +
      (x + 84) +
      " " +
      (y + 56) +
      'H200"' +
      S +
      '/><path d="M0 ' +
      (y + 70) +
      "H" +
      (x + 30) +
      "L" +
      (x + 44) +
      " " +
      (y + 84) +
      'H200"' +
      S +
      ' opacity=".5"/><circle cx="' +
      (x + 14) +
      '" cy="' +
      (y + 26) +
      '" r="2.5" fill="#fff"/><circle cx="' +
      (x + 84) +
      '" cy="' +
      (y + 56) +
      '" r="2.5" fill="#fff"/></svg>'
    );
  },
  (k) => {
    var s = "",
      n = 5 + (k % 4);
    for (var i = 0; i < n; i++)
      for (var j = 0; j < n; j++)
        s +=
          '<rect x="' +
          (40 + (i * 120) / n) +
          '" y="' +
          (14 + (j * 92) / n) +
          '" width="4" height="4" fill="#fff" opacity="' +
          ((i * 7 + j * 3 + k) % 5 ? 0.25 : 0.9) +
          '"/>';
    return '<svg class="mo" viewBox="0 0 200 120">' + s + "</svg>";
  },
  (k) => {
    var s = "",
      a = 8 + (k % 10);
    for (var i = 0; i < 4; i++) {
      var d = "M0 " + (30 + i * 18);
      for (var x = 0; x <= 200; x += 20)
        d +=
          " Q" +
          (x + 5) +
          " " +
          (30 + i * 18 - a) +
          " " +
          (x + 10) +
          " " +
          (30 + i * 18) +
          " T" +
          (x + 20) +
          " " +
          (30 + i * 18);
      s += '<path d="' + d + '"' + S + ' opacity="' + (1 - i * 0.22) + '"/>';
    }
    return '<svg class="mo" viewBox="0 0 200 120" preserveAspectRatio="none">' + s + "</svg>";
  },
  (k) => {
    var x = 60 + (k % 40);
    return (
      '<svg class="mo" viewBox="0 0 200 120"><rect x="' +
      x +
      '" y="22" width="76" height="76" rx="6"' +
      S +
      '/><rect x="' +
      (x + 18) +
      '" y="40" width="40" height="40"' +
      S +
      ' opacity=".6"/>' +
      [0, 1, 2, 3, 4]
        .map((i) => {
          var p = x + 10 + i * 14;
          return '<path d="M' + p + " 22v-12M" + p + ' 98v12"' + S + ' opacity=".6"/>';
        })
        .join("") +
      "</svg>"
    );
  },
];
function cover(b, href) {
  var c = href ? ln(href, "cover") : h("div", "cover");
  c.setAttribute("aria-hidden", "true");
  if (href) c.tabIndex = -1;
  var k = NIV.indexOf(b.nivel);
  if (b.proprio) {
    c.classList.add("brut");
    var bl = h("span", "bl");
    [0, 1, 2].forEach((i) => {
      bl.appendChild(h("i", i <= k ? "f" : null));
    });
    c.appendChild(h("div", "bh", [h("span", null, "BANCADA"), h("span", null, "VOL." + pad(b.vol || 0))]));
    c.appendChild(h("div", "bt2", b.t));
    c.appendChild(h("div", "bf", [h("span", "bn", pad(b.vol || 0)), bl]));
    return c;
  }
  if (b.capa) {
    c.classList.add("real");
    var im = h("img");
    im.src = b.capa;
    im.alt = "";
    im.loading = "lazy";
    c.appendChild(im);
    return c;
  }
  c.style.setProperty("--cc", CORES[b.area] || "var(--c-outro)");
  var lv = h("span", "lv3");
  [0, 1, 2].forEach((i) => {
    lv.appendChild(h("i", k >= 0 && i <= k ? "f" : null));
  });
  c.appendChild(h("div", "ck", [h("span", null, CURTO[b.area] || b.area || ""), k >= 0 ? lv : h("span", null, "")]));
  var hs = 0;
  for (var i = 0; i < b.t.length; i++) hs = (hs * 31 + b.t.charCodeAt(i)) >>> 0;
  c.appendChild(svg(MOTIF[hs % MOTIF.length](hs)));
  c.appendChild(h("div", null, [h("div", "ctt", b.t), h("div", "ca", b.a || "")]));
  return c;
}

/* ---------- trilho: pontos de navegação ---------- */
var dots = document.getElementById("dots");
function setDots(n, cur, fn) {
  dots.textContent = "";
  for (var i = 0; i < n; i++) {
    ((i) => {
      var d = h("button", "dot");
      d.setAttribute("aria-label", "Ir para " + (i + 1));
      d.setAttribute("aria-current", String(i === cur));
      d.onclick = () => {
        fn(i);
      };
      dots.appendChild(d);
    })(i);
  }
}

/* ---------- ícones de linha da identidade ---------- */
var ICO = {
  livros:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 5.5c3-1.3 6-1.3 9 .6 3-1.9 6-1.9 9-.6V19c-3-1.3-6-1.3-9 .6-3-1.9-6-1.9-9-.6z"/><path d="M12 6.1v13.5"/></svg>',
  pecas:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9z"/><path d="M3.5 7.5 12 12.2l8.5-4.7M12 12.2v9"/></svg>',
  guias:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M14.5 2.8v4.5H19M9 11h7M9 14.5h7M9 18h4.5"/></svg>',
  glossario:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M6.5 16.5 9.5 8l3 8.5M7.5 13.8h4"/><path d="M17.5 12.4c-.6-.6-2.8-.8-2.8 1.2 0 2 2.2 1.8 2.8 1.1M17.5 11.5v5"/></svg>',
  trilhas:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.5 18.5h6a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7h6"/></svg>',
  jogo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5h10a4.5 4.5 0 0 1 4.4 5.5l-1 4.4a2.3 2.3 0 0 1-4 .9L15 16.5H9l-1.4 1.8a2.3 2.3 0 0 1-4-.9l-1-4.4A4.5 4.5 0 0 1 7 7.5z"/><path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01"/></svg>',
  busca:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
};
var SECOES = [
  ["biblioteca", "Livros", "Conhecimento para consultar e aprender.", "livros"],
  ["pecas", "Peças 3D", "Modelos e referências para seus projetos.", "pecas"],
  ["guias", "Guias", "Tutoriais diretos e práticos.", "guias"],
  ["glossario", "Glossário", "Termos técnicos explicados em português.", "glossario"],
  ["trilhas", "Trilhas", "Do básico ao avançado, com questões.", "trilhas"],
  ["jogo", "Gargalo", "Jogo: monte um PC e vença os chefes.", "jogo"],
];

/* ---------- início ---------- */
function vHome() {
  var total = LIVROS.length + PDFS.length,
    cont = {
      biblioteca: total + " livros",
      pecas:
        P.length +
        " peças, " +
        (window.VARIANTES ? Object.keys(VARIANTES).reduce((a, k) => a + VARIANTES[k].lista.length, 0) : P.length) +
        " variantes",
      guias: GU.length + " guias",
      glossario: G.length + " termos",
    };
  var txt = h("div", "ih-txt", [
    h("h1", null, [h("span", "l1", "Toda a informática"), h("span", "l2", "num lugar só.")]),
    h("p", "sub", "Grátis. Para sempre."),
    h(
      "p",
      "txt",
      "Livros, peças em 3D, guias e um glossário que estavam espalhados pela internet, reunidos e explicados em português.",
    ),
    h("div", "ih-acoes", [
      ln("#/biblioteca", "bt-pri", "Começar pelos livros"),
      ln("#/pecas", "bt-sec", "Explorar as peças 3D"),
    ]),
  ]);
  /* imagem do cooler da identidade visual; acompanha levemente o mouse */
  var foto = h("img");
  foto.src = "marca/cooler.webp";
  foto.alt = "Water cooler preto com o símbolo da harpia na bomba e na ventoinha";
  foto.width = 1400;
  foto.height = 923;
  var palco = ln("#/pecas/refrigeracao", "ih-img", [foto]);
  palco.setAttribute("aria-label", "Ver a refrigeração em 3D");
  palco.addEventListener("pointermove", (e) => {
    var r = palco.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    foto.style.transform = "translate(" + x * -14 + "px," + y * -10 + "px) scale(1.03)";
  });
  palco.addEventListener("pointerleave", () => {
    foto.style.transform = "";
  });
  var cats = h("div", "cats");
  SECOES.slice(0, 4).forEach((x) => {
    var a = ln("#/" + x[0], "cat", [h("i"), h("b", null, x[1]), h("span", null, x[2]), h("em", null, cont[x[0]])]);
    a.querySelector("i").outerHTML = ICO[x[3]];
    cats.appendChild(a);
  });
  var duo = h("div", "duo-cards");
  SECOES.slice(4).forEach((x) => {
    var a = ln("#/" + x[0], null, [h("i", "ic"), h("b", null, x[1]), h("span", null, x[2]), h("i", null, "→")]);
    a.querySelector("i.ic").outerHTML = ICO[x[3]];
    duo.appendChild(a);
  });
  var shelf = h("div", "shelf");
  todos()
    .filter((b) => b.area === "Hardware e eletrônica")
    .slice(0, 12)
    .forEach((b) => {
      shelf.appendChild(bookCard(b));
    });
  return h("div", "inicio", [
    h("section", "wrap inicio-hero", [txt, palco]),
    h("section", "wrap", [cats, duo]),
    h("section", "wrap sec", [
      h("div", "sec-head", [h("h2", null, "Para ler aqui, agora"), ln("#/biblioteca", "", "Ver todos os livros →")]),
      shelf,
    ]),
    h("section", "wrap", [
      h("div", "lema", [
        h("p", null, ["CONHECER", document.createElement("br"), "CONSTRUIR", document.createElement("br"), "EXPLORAR"]),
        h("p", null, "Um espaço livre, completo e feito para quem aprende, constrói e explora."),
      ]),
    ]),
  ]);
}

/* ---------- busca geral: livros, peças e variantes, guias, glossário e módulos das trilhas ---------- */
var INDICE = null;
function indice() {
  if (INDICE) return INDICE;
  var r = [];
  todos().forEach((b) => {
    r.push({ g: "Livros", i: "livros", t: b.t, s: b.a + " · " + b.formato + " · " + b.nivel, href: b.href });
  });
  P.forEach((a) => {
    r.push({ g: "Peças 3D", i: "pecas", t: a.n, s: a.r, href: "#/pecas/" + a.id });
    ((window.VARIANTES || {})[a.id] || { lista: [] }).lista.forEach((v) => {
      r.push({ g: "Peças 3D", i: "pecas", t: a.n + ": " + v.n, s: v.d, href: "#/pecas/" + a.id });
    });
  });
  GU.forEach((x) => {
    r.push({ g: "Guias", i: "guias", t: x.n, s: x.d, href: "#/guias" });
  });
  G.forEach((x) => {
    r.push({ g: "Glossário", i: "glossario", t: x[0], s: x[1], href: "#/glossario/" + encodeURIComponent(x[0]) });
  });
  Object.keys(TRN).forEach((k) => {
    TRN[k].modulos.forEach((m, i) => {
      r.push({
        g: "Trilhas",
        i: "trilhas",
        t: TRN[k].n + ": " + m.n,
        s: m.resumo,
        href: "#/trilhas/" + k + "/" + (i + 1),
      });
    });
  });
  r.forEach((x) => {
    x.k = semAcento(x.t + " " + x.s);
  });
  return (INDICE = r);
}
function buscar(q) {
  return buscarEm(indice(), q);
}
var bov = document.getElementById("busca-ov"),
  bin = document.getElementById("busca-in"),
  bres = document.getElementById("busca-res");
function abrirBusca(q) {
  fecharMenu();
  bov.hidden = false;
  bin.value = q || "";
  mostrarBusca();
  setTimeout(() => {
    bin.focus();
  }, 30);
  document.body.style.overflow = "hidden";
}
function fecharBusca() {
  bov.hidden = true;
  document.body.style.overflow = "";
}
function mostrarBusca() {
  var q = bin.value.trim();
  bres.textContent = "";
  if (!q) {
    var sug = h("div");
    sug.appendChild(h("h3", null, "Sugestões"));
    ["memória ram", "cache", "python", "placa-mãe", "ssd nvme", "redes"].forEach((t) => {
      var a = h("a", null, [h("i"), h("b", null, t), h("span", null, "Buscar por " + t)]);
      a.href = "#";
      a.querySelector("i").outerHTML = ICO.busca;
      a.onclick = (e) => {
        e.preventDefault();
        bin.value = t;
        mostrarBusca();
      };
      sug.appendChild(a);
    });
    bres.appendChild(sug);
    return;
  }
  var r = buscar(q);
  if (!r.length) {
    bres.appendChild(
      h("p", "busca-vazia", "Nada encontrado para “" + q + "”. Tente outra palavra, como cache, Linux ou fonte."),
    );
    return;
  }
  var grupos = {};
  r.forEach((x) => {
    (grupos[x.g] = grupos[x.g] || []).push(x);
  });
  ["Glossário", "Peças 3D", "Livros", "Trilhas", "Guias"].forEach((gn) => {
    var lst = grupos[gn];
    if (!lst) return;
    var sec = h("div");
    sec.appendChild(h("h3", null, gn + " · " + lst.length));
    lst.slice(0, gn === "Glossário" ? 4 : 5).forEach((x) => {
      var a = ln(x.href, null, [h("i"), h("b", null, x.t), h("span", null, x.s)]);
      a.querySelector("i").outerHTML = ICO[x.i];
      a.onclick = () => {
        fecharBusca();
      };
      sec.appendChild(a);
    });
    bres.appendChild(sec);
  });
}
bin.addEventListener("input", mostrarBusca);
bin.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    var a = bres.querySelector("a[href^='#/']");
    if (a) {
      location.hash = a.getAttribute("href");
      fecharBusca();
    }
  }
});
document.getElementById("abrir-busca").onclick = () => {
  abrirBusca("");
};
document.getElementById("fechar-busca").onclick = fecharBusca;
bov.addEventListener("click", (e) => {
  if (e.target === bov) fecharBusca();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!bov.hidden) fecharBusca();
    fecharMenu();
  } else if (
    e.key === "/" &&
    bov.hidden &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) &&
    !document.body.classList.contains("modo-jogo")
  ) {
    e.preventDefault();
    abrirBusca("");
  }
});

/* ---------- menu do celular ---------- */
var mm = document.getElementById("menu-mob"),
  mb = document.getElementById("abrir-menu");
SECOES.forEach((x) => {
  var a = ln("#/" + x[0], null, [h("i"), h("b", null, x[1]), h("span", null, x[2])]);
  a.dataset.r = x[0];
  a.querySelector("i").outerHTML = ICO[x[3]];
  a.onclick = fecharMenu;
  mm.firstChild.appendChild(a);
});
function fecharMenu() {
  mm.hidden = true;
  mb.setAttribute("aria-expanded", "false");
  mb.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  document.body.style.overflow = bov.hidden ? "" : "hidden";
}
mb.onclick = () => {
  if (!mm.hidden) {
    fecharMenu();
    return;
  }
  mm.hidden = false;
  mb.setAttribute("aria-expanded", "true");
  mb.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  document.body.style.overflow = "hidden";
};

/* ---------- trilhas ---------- */
var TRN = window.TRILHAS || {},
  QS = window.QUESTOES || [];
/* ordem das trilhas na página: hardware primeiro, depois programação e IA */
var ORDEM = ["pc", "cpu", "ram", "armazenamento", "html", "python", "ia"]
  .filter((k) => TRN[k])
  .concat(Object.keys(TRN).filter((k) => ["pc", "cpu", "ram", "armazenamento", "html", "python", "ia"].indexOf(k) < 0));
/* todas as questões num formato só: as dos módulos novos e as das trilhas de 3 níveis */
function todasQuestoes() {
  var r = [];
  Object.keys(TRN).forEach((k) => {
    TRN[k].modulos.forEach((m, mi) => {
      m.q.forEach((q, qi) => {
        r.push({
          id: k + "-m" + (mi + 1) + "-" + qi,
          tema: k,
          temaN: TRN[k].n,
          nivel: m.nivel,
          origem: "Módulo " + (mi + 1) + ": " + m.n,
          link: "#/trilhas/" + k + "/" + (mi + 1),
          p: q.p,
          o: q.o,
          c: q.c,
          e: q.e,
        });
      });
    });
  });
  QS.forEach((q, i) => {
    if (TRN[q.tema]) return;
    r.push({
      id: q.tema + "-q" + i,
      tema: q.tema,
      temaN: TR[q.tema] ? TR[q.tema].n : q.tema,
      nivel: q.nivel,
      origem: "Nível " + q.nivel.toLowerCase(),
      link: "#/trilhas/" + q.tema,
      p: q.p,
      o: q.o,
      c: q.c,
      e: q.e,
    });
  });
  return r;
}
var PROG = "bancada-questoes";
function progresso() {
  try {
    return JSON.parse(localStorage.getItem(PROG) || "{}");
  } catch (e) {
    return {};
  }
}
function marcar(id, ok) {
  try {
    var m = progresso();
    m[id] = ok ? 1 : 0;
    localStorage.setItem(PROG, JSON.stringify(m));
  } catch (e) {}
}
/* uma questão: alternativas, correção na hora e explicação */
function questao(q, n, aoResponder) {
  var feito = progresso()[q.id],
    box = h("div", "q"),
    ops = h("div", "q-ops"),
    exp = h("div", "q-exp");
  exp.hidden = true;
  box.appendChild(h("div", "q-n", [h("span", null, "Questão " + pad(n)), h("span", null, q.nivel)]));
  box.appendChild(h("p", "q-p", q.p));
  q.o.forEach((o, i) => {
    var b = h("button", "q-o", [h("span", "q-l", String.fromCharCode(65 + i)), h("span", null, o)]);
    b.onclick = () => {
      if (box.dataset.r) return;
      box.dataset.r = 1;
      var ok = i === q.c;
      marcar(q.id, ok);
      ops.querySelectorAll("button").forEach((x, j) => {
        x.disabled = true;
        if (j === q.c) x.classList.add("certa");
        else if (j === i) x.classList.add("errada");
      });
      exp.hidden = false;
      exp.textContent = "";
      exp.appendChild(h("b", null, ok ? "Correto. " : "Não foi dessa vez. "));
      exp.appendChild(document.createTextNode(q.e));
      box.classList.add(ok ? "ok" : "no");
      if (aoResponder) aoResponder(ok);
    };
    ops.appendChild(b);
  });
  box.appendChild(ops);
  box.appendChild(exp);
  if (feito != null)
    box.appendChild(
      h("div", "q-hist", feito ? "Você já acertou esta antes." : "Você errou esta antes. Tente de novo."),
    );
  return box;
}

/* ---------- trilhas ---------- */
function vTrilhas() {
  var g = h("div", "tiles trilhas-g"),
    prog = progresso(),
    qs = todasQuestoes();
  ORDEM.forEach((k, i) => {
    var nova = TRN[k],
      qt = qs.filter((q) => q.tema === k),
      ac = qt.filter((q) => prog[q.id] === 1).length;
    var bar = h("div", "prog", [h("i")]);
    bar.firstChild.style.width = (qt.length ? (ac / qt.length) * 100 : 0) + "%";
    g.appendChild(
      ln("#/trilhas/" + k, "tile trilha", [
        h("span", "n", nova.modulos.length + " módulos · " + qt.length + " questões"),
        h("b", null, nova.n),
        h("span", null, nova.r),
        bar,
        h("span", "pc", ac + " de " + qt.length + " acertos"),
      ]),
    );
  });
  g.appendChild(
    ln("#/questoes", "tile trilha banco", [
      h("span", "n", "Todas as trilhas"),
      h("b", null, "Banco de questões"),
      h("span", null, qs.length + " questões por tema e dificuldade, com treino e simulado"),
      h("span", "pc", "Abrir →"),
    ]),
  );
  return page(
    "Trilhas",
    "Aprenda em sequência.",
    "Cada trilha vai do básico ao avançado, com explicações visuais, simulações e questões no fim de cada etapa. Seu progresso fica salvo neste navegador.",
    [g],
  );
}
function vTrilha(k) {
  var nova = TRN[k];
  if (!nova && !TR[k]) return null;
  if (!nova) return vTrilhaAntiga(k);
  var prog = progresso(),
    mods = h("div", "mods");
  nova.modulos.forEach((m, i) => {
    var tot = m.q.length,
      ac = m.q.filter((_, qi) => prog[k + "-m" + (i + 1) + "-" + qi] === 1).length,
      bar = h("div", "prog", [h("i")]);
    bar.firstChild.style.width = (ac / tot) * 100 + "%";
    mods.appendChild(
      ln("#/trilhas/" + k + "/" + (i + 1), "mod", [
        h("div", "mod-n", pad(i + 1)),
        h("div", "mod-b", [
          h("div", "mod-k", [h("span", "tag", m.nivel), h("span", null, m.min + " min · " + tot + " questões")]),
          h("h3", null, m.n),
          h("p", null, m.resumo),
          bar,
        ]),
      ]),
    );
  });
  return h("div", "wrap pg", [
    head("Trilha", nova.n, nova.r + ". Seis módulos: dois básicos, dois intermediários e dois avançados."),
    mods,
    nova.peca ? ln("#/pecas/" + nova.peca, "back", nova.pecaTxt || "Ver o " + nova.n.toLowerCase() + " em 3D →") : null,
    ln("#/trilhas", "back", "← Todas as trilhas"),
  ]);
}
function vTrilhaAntiga(k) {
  var t = TR[k],
    lv = h("div", "levels"),
    qs = todasQuestoes().filter((q) => q.tema === k);
  t.l.forEach((d, i) => {
    var col = h("div", "lvl", [h("div", "on", pad(i + 1)), h("h3", null, d[0]), h("p", "txt", d[1])]);
    var ul = h("ul", "pts");
    d[2].forEach((s) => {
      ul.appendChild(h("li", null, s));
    });
    col.appendChild(ul);
    var lb = LIVROS.filter((b) => b.proprio && b.nivel === NIV[i])[0];
    if (lb) col.appendChild(ln("#/ler/" + lb.id + "/1", "btn line", "Ler: " + lb.t));
    lv.appendChild(col);
  });
  var qb = h("div", "qlist");
  NIV.forEach((nv) => {
    var sub = qs.filter((q) => q.nivel === nv);
    if (!sub.length) return;
    qb.appendChild(h("h2", "q-sec", "Questões · " + nv));
    sub.forEach((q, i) => {
      qb.appendChild(questao(q, i + 1));
    });
  });
  return h("div", "wrap pg", [
    head(
      "Trilha",
      t.n,
      "Três níveis em sequência, com questões no fim. Esta trilha ainda vai ganhar o formato de 6 módulos.",
    ),
    lv,
    qb,
    t.a ? ln("#/pecas/" + t.a, "back", "Ver " + t.n.toLowerCase() + " em 3D →") : null,
    ln("#/trilhas", "back", "← Todas as trilhas"),
  ]);
}
function vModulo(k, n) {
  var tr = TRN[k];
  if (!tr) return null;
  n = Math.min(Math.max(1, +n || 1), tr.modulos.length);
  var m = tr.modulos[n - 1];
  var nav = h("ol", "mod-nav");
  tr.modulos.forEach((x, i) => {
    var a = ln("#/trilhas/" + k + "/" + (i + 1), null, [
      h("span", "mn", pad(i + 1)),
      h("span", null, x.n),
      h("span", "mk2", x.nivel),
    ]);
    a.setAttribute("aria-current", String(i + 1 === n));
    nav.appendChild(h("li", null, [a]));
  });
  var corpo = h("article", "mod-corpo", [
    h("div", "chap", "Módulo " + n + " de " + tr.modulos.length + " · " + m.nivel + " · " + m.min + " min"),
    h("h1", null, m.n),
    h("p", "lead", m.resumo),
  ]);
  m.blocos.forEach((b) => {
    if (b.t === "txt") {
      var d = h("div", "body");
      d.innerHTML = b.h;
      corpo.appendChild(d);
    } else if (b.t === "fato") corpo.appendChild(h("div", "fato", [h("b", null, b.n), h("span", null, b.d)]));
    else if (b.t === "dica")
      corpo.appendChild(h("div", "dica", [h("span", "eyebrow", "Na prática"), h("p", null, b.h)]));
    else if (b.t === "vis" && VIS[b.id]) {
      var v = h("figure", "vis");
      try {
        VIS[b.id](v, b.d || {});
      } catch (e) {
        v.textContent = "";
      }
      corpo.appendChild(v);
    }
  });
  var qs = todasQuestoes().filter((q) => q.tema === k && q.link === "#/trilhas/" + k + "/" + n),
    placar = h("div", "placar"),
    acertos = 0,
    feitas = 0;
  function upd() {
    placar.textContent = feitas
      ? acertos + " de " + feitas + " respondidas corretamente"
      : qs.length + " questões. Responda para fixar o módulo.";
  }
  upd();
  var ql = h("div", "qlist");
  qs.forEach((q, i) => {
    ql.appendChild(
      questao(q, i + 1, (ok) => {
        feitas++;
        if (ok) acertos++;
        upd();
      }),
    );
  });
  corpo.appendChild(h("section", "mod-q", [h("h2", null, "Teste o que você aprendeu"), placar, ql]));
  var pn = h("div", "chapnav");
  if (n > 1)
    pn.appendChild(
      ln("#/trilhas/" + k + "/" + (n - 1), null, [
        h("span", null, "← Módulo anterior"),
        h("b", null, tr.modulos[n - 2].n),
      ]),
    );
  if (n < tr.modulos.length)
    pn.appendChild(
      ln("#/trilhas/" + k + "/" + (n + 1), "nx", [h("span", null, "Próximo módulo →"), h("b", null, tr.modulos[n].n)]),
    );
  else
    pn.appendChild(
      ln("#/questoes", "nx", [h("span", null, "Trilha concluída →"), h("b", null, "Praticar no banco de questões")]),
    );
  corpo.appendChild(pn);
  setDots(tr.modulos.length, n - 1, (j) => {
    location.hash = "#/trilhas/" + k + "/" + (j + 1);
  });
  return h("div", "wrap modulo", [h("aside", "mod-side", [ln("#/trilhas/" + k, "back-t", "← " + tr.n), nav]), corpo]);
}
function vQuestoes() {
  var all = todasQuestoes(),
    tema = "",
    nv = "",
    modo = "treino",
    ct = h("div", "chips"),
    cn = h("div", "chips"),
    cm = h("div", "chips"),
    lista = h("div", "qlist"),
    info = h("p", "count");
  var temas = [""].concat(ORDEM),
    cont = { "": all.length };
  all.forEach((q) => {
    cont[q.tema] = (cont[q.tema] || 0) + 1;
  });
  var nomes = { "": "Todos" };
  ORDEM.forEach((k) => {
    nomes[k] = TRN[k].n;
  });
  var bsT = [];
  temas.forEach((v) => {
    var b = h("button", "chip", [nomes[v], h("span", "ct", String(cont[v] || 0))]);
    b.onclick = () => {
      tema = v;
      d();
    };
    b.dataset.v = v;
    bsT.push(b);
    ct.appendChild(b);
  });
  var syncN = chipRow(
    cn,
    [""].concat(NIV),
    () => nv,
    (v) => {
      nv = v;
      d();
    },
  );
  var syncM = chipRow(
    cm,
    ["treino", "simulado"],
    () => modo,
    (v) => {
      modo = v;
      d();
    },
  );
  cm.querySelectorAll("button").forEach((b) => {
    b.firstChild.textContent =
      b.dataset.v === "treino" ? "Treino: todas, com resposta na hora" : "Simulado: 10 sorteadas, nota no fim";
  });
  function d() {
    bsT.forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.v === tema));
    });
    syncN();
    syncM();
    lista.textContent = "";
    var r = all.filter((q) => (!tema || q.tema === tema) && (!nv || q.nivel === nv));
    if (modo === "simulado") {
      r = r
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      var ok = 0,
        res = 0;
      info.textContent = "Simulado com " + r.length + " questões.";
      r.forEach((q, i) => {
        lista.appendChild(
          questao(q, i + 1, (c) => {
            res++;
            if (c) ok++;
            info.textContent =
              res < r.length
                ? res + " de " + r.length + " respondidas"
                : "Nota final: " + ok + " de " + r.length + " (" + Math.round((ok / r.length) * 100) + "%)";
          }),
        );
      });
      var nova = h("button", "btn line", "Sortear outro simulado");
      nova.onclick = d;
      lista.appendChild(nova);
      return;
    }
    info.textContent = r.length + " questões";
    r.forEach((q, i) => {
      var el = questao(q, i + 1);
      el.insertBefore(h("div", "q-orig", [ln(q.link, null, q.temaN + " · " + q.origem)]), el.children[1]);
      lista.appendChild(el);
    });
  }
  d();
  return page(
    "Banco de questões",
    "Pratique por tema e nível.",
    "Questões de todas as trilhas, com explicação de cada resposta. Seus acertos ficam salvos neste navegador.",
    [h("div", "label", "Tema"), ct, h("div", "label", "Dificuldade"), cn, h("div", "label", "Modo"), cm, info, lista],
  );
}

/* ---------- visuais das trilhas: SVG e controles simples, só em tons de cinza ---------- */
function svgEl(t, a) {
  var e = document.createElementNS("http://www.w3.org/2000/svg", t);
  for (var k in a) e.setAttribute(k, a[k]);
  return e;
}
function legenda(f, t) {
  f.appendChild(h("figcaption", null, t));
}
function controle(rot, min, max, val, passo, fmt, fn) {
  var i = h("input");
  i.type = "range";
  i.min = min;
  i.max = max;
  i.step = passo;
  i.value = val;
  i.id = "r-" + rot.replace(/\W+/g, "");
  var o = h("output", null, fmt(val));
  i.oninput = () => {
    o.textContent = fmt(+i.value);
    fn(+i.value);
  };
  var l = h("label", "ctl", [h("span", null, rot), i, o]);
  l.htmlFor = i.id;
  return l;
}
/* barras horizontais com rótulo e valor; escala linear ou log10 */
function barras(f, dados, o) {
  o = o || {};
  var box = h("div", "bars");
  dados.forEach((d) => {
    var v = o.log ? Math.log10(d[1] * 10) / Math.log10(o.max * 10) : d[1] / o.max;
    var bar = h("div", "bar" + (d[3] ? " hi" : ""), [
      h("span", "bl", d[0]),
      h("div", "bt", [h("i")]),
      h("span", "bv", d[2]),
    ]);
    bar.querySelector("i").style.width = Math.max(1.5, v * 100) + "%";
    bar.title = d[0] + ": " + d[2];
    box.appendChild(bar);
  });
  f.appendChild(box);
  return box;
}
var VIS = {
  /* ---- componentes genéricos: o conteúdo vem do bloco da trilha (b.d) ---- */
  passos: (f, d) => {
    var cur = 0,
      row = h("div", "gpassos"),
      txt = h("p", "vtxt"),
      bs = [],
      nx = h("button", "btn line", "Próxima etapa →");
    d.itens.forEach((it, i) => {
      var b = h("button", "gp", [h("span", "gpn", pad(i + 1)), h("span", null, it[0])]);
      b.type = "button";
      b.onclick = () => {
        cur = i;
        show();
      };
      bs.push(b);
      row.appendChild(b);
    });
    function show() {
      bs.forEach((b, i) => {
        b.setAttribute("aria-pressed", String(i === cur));
        b.classList.toggle("feito", i < cur);
      });
      txt.textContent = d.itens[cur][1];
    }
    nx.onclick = () => {
      cur = (cur + 1) % d.itens.length;
      show();
    };
    show();
    f.appendChild(row);
    f.appendChild(txt);
    f.appendChild(h("div", "vctl", [nx]));
    legenda(f, d.leg);
  },
  opcoes: (f, d) => {
    var u = "0",
      out = h("div", "dica"),
      cs = h("div", "chips"),
      sync = chipRow(
        cs,
        d.itens.map((_, i) => String(i)),
        () => u,
        (v) => {
          u = v;
          draw();
        },
      );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = d.itens[+b.dataset.v][0];
    });
    function draw() {
      sync();
      out.textContent = "";
      var it = d.itens[+u];
      out.appendChild(h("span", "eyebrow", (d.rot ? d.rot + " " : "") + it[0]));
      it.slice(1).forEach((p) => {
        var e = h("p");
        e.innerHTML = p;
        out.appendChild(e);
      });
    }
    f.appendChild(cs);
    f.appendChild(out);
    draw();
    legenda(f, d.leg);
  },
  grafico: (f, d) => {
    barras(f, d.dados, { max: d.max, log: d.log });
    legenda(f, d.leg);
  },
  tabela: (f, d) => {
    var tb = h("table", "ficha"),
      exp = h("p", "vtxt", d.dica || "Clique numa linha para ver a explicação.");
    d.linhas.forEach((r) => {
      var tr = h("tr", null, [h("td", null, r[0]), h("td", null, r[1])]);
      tr.tabIndex = 0;
      tr.onclick = tr.onkeydown = (e) => {
        if (e.type === "keydown" && e.key !== "Enter") return;
        tb.querySelectorAll("tr").forEach((x) => {
          x.classList.remove("sel");
        });
        tr.classList.add("sel");
        exp.textContent = r[0] + ": " + r[2];
      };
      tb.appendChild(tr);
    });
    f.appendChild(h("div", "tw", [tb]));
    f.appendChild(exp);
    legenda(f, d.leg);
  },
  /* editor de HTML e CSS com resultado ao vivo; sem scripts no resultado */
  codigo: (f, d) => {
    var ta = h("textarea", "gcod"),
      fr = h("iframe", "gprev"),
      pv = h("div", "gprev-w", [fr]),
      t = 0,
      sombra = null;
    ta.value = d.html;
    ta.spellcheck = false;
    ta.setAttribute("aria-label", "Código editável");
    ta.setAttribute("wrap", "off");
    ta.rows = 12;
    fr.setAttribute("sandbox", "allow-same-origin");
    fr.title = "Resultado do código";
    fr.style.height = (d.alt || 240) + "px";
    /* se a página não puder usar iframe, mostra o resultado num shadow DOM */
    function plano() {
      if (!sombra) {
        fr.remove();
        var c = h("div", "gprev-s");
        c.style.minHeight = (d.alt || 240) + "px";
        pv.appendChild(c);
        sombra = c.attachShadow({ mode: "open" });
      }
      sombra.innerHTML =
        "<style>:host{display:block;background:#fff;color:#111;font:16px/1.4 system-ui,sans-serif}</style>" +
        ta.value.replace(/(^|[\s,}])(html|body)(?=[\s,{.:#[])/g, "$1:host");
    }
    function up() {
      if (sombra) {
        plano();
        return;
      }
      fr.srcdoc = ta.value;
    }
    fr.addEventListener("load", () => {
      try {
        var b = fr.contentDocument && fr.contentDocument.body;
        if (ta.value.trim() && b && !b.childElementCount && !b.textContent.trim()) plano();
      } catch (e) {
        plano();
      }
    });
    ta.oninput = () => {
      clearTimeout(t);
      t = setTimeout(up, 250);
    };
    ta.onkeydown = (e) => {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        var s = ta.selectionStart;
        ta.setRangeText("  ", s, ta.selectionEnd, "end");
        ta.oninput();
      }
    };
    var rs = h("button", "btn line", "Restaurar o exemplo");
    rs.onclick = () => {
      ta.value = d.html;
      up();
    };
    f.appendChild(
      h("div", "gcod-w", [
        h("div", "gcod-c", [h("div", "glab", "Código (edite à vontade)"), ta]),
        h("div", "gcod-c", [h("div", "glab", "Resultado"), pv]),
      ]),
    );
    if (d.redim)
      f.appendChild(
        controle(
          "Largura da tela",
          280,
          900,
          900,
          10,
          (v) => v + " px",
          (v) => {
            pv.style.maxWidth = v + "px";
          },
        ),
      );
    f.appendChild(h("div", "vctl", [rs]));
    up();
    legenda(f, d.leg);
  },
  /* executa um programa linha a linha: linha atual, variáveis e saída */
  rastreio: (f, d) => {
    var i = 0,
      pre = h("div", "grast"),
      vars = h("table", "gvars"),
      saida = h("pre", "gsaida"),
      nota = h("p", "vtxt"),
      ant = h("button", "btn line", "← Voltar"),
      prox = h("button", "btn solid", "Executar linha →");
    var linhas = d.codigo.map((l, j) => {
      var e = h("div", "gl", [h("span", "gln", String(j + 1)), h("code", null, l || " ")]);
      pre.appendChild(e);
      return e;
    });
    function show() {
      var p = d.passos[i];
      linhas.forEach((l, j) => {
        l.classList.toggle("atual", j === p[0]);
      });
      vars.textContent = "";
      var ks = Object.keys(p[1]);
      if (!ks.length) vars.appendChild(h("tr", null, [h("td", "vazio", "nenhuma ainda")]));
      ks.forEach((k) => {
        vars.appendChild(h("tr", null, [h("td", null, k), h("td", null, String(p[1][k]))]));
      });
      saida.textContent = p[2] || "";
      nota.textContent = "Passo " + (i + 1) + " de " + d.passos.length + ". " + (p[3] || "");
      ant.disabled = i === 0;
      prox.textContent = i === d.passos.length - 1 ? "Recomeçar ↺" : "Executar linha →";
    }
    ant.onclick = () => {
      if (i > 0) {
        i--;
        show();
      }
    };
    prox.onclick = () => {
      i = i === d.passos.length - 1 ? 0 : i + 1;
      show();
    };
    f.appendChild(
      h("div", "grast-w", [
        pre,
        h("div", "gpainel", [h("div", "glab", "Variáveis"), vars, h("div", "glab", "Saída"), saida]),
      ]),
    );
    f.appendChild(nota);
    f.appendChild(h("div", "vctl", [ant, prox]));
    show();
    legenda(f, d.leg);
  },
  /* monta um prompt peça por peça e mostra como a resposta muda */
  prompt: (f, d) => {
    var on = d.partes.map(() => false),
      box = h("pre", "gprompt"),
      res = h("div", "dica"),
      med = h("div", "prog", [h("i")]),
      cks = h("div", "chips"),
      nivel = h("p", "vtxt");
    d.partes.forEach((p, i) => {
      var b = h("button", "chip", ["+ " + p[0]]);
      b.setAttribute("aria-pressed", "false");
      b.onclick = () => {
        on[i] = !on[i];
        b.setAttribute("aria-pressed", String(on[i]));
        draw();
      };
      cks.appendChild(b);
    });
    function draw() {
      var t = [d.base];
      d.partes.forEach((p, i) => {
        if (on[i]) t.push(p[1]);
      });
      box.textContent = t.join("\n\n");
      var n = on.filter(Boolean).length;
      res.textContent = "";
      res.appendChild(h("span", "eyebrow", "Resposta típica do modelo"));
      res.appendChild(h("p", null, d.respostas[n]));
      med.firstChild.style.width = (n / d.partes.length) * 100 + "%";
      nivel.textContent = n + " de " + d.partes.length + " elementos no prompt";
    }
    f.appendChild(h("div", "glab", "Acrescente partes ao prompt"));
    f.appendChild(cks);
    f.appendChild(box);
    f.appendChild(med);
    f.appendChild(nivel);
    f.appendChild(res);
    draw();
    legenda(f, d.leg);
  },
  /* divisão aproximada em tokens, só para ter noção do tamanho */
  tokens: (f, d) => {
    var inp = h("textarea", "gtok-in"),
      out = h("div", "gtok"),
      nota = h("p", "vtxt");
    inp.value = d.texto;
    inp.rows = 3;
    inp.setAttribute("aria-label", "Texto para dividir em tokens");
    function draw() {
      var ts = dividirTokens(inp.value);
      out.textContent = "";
      ts.forEach((t, i) => {
        var s = h("span", "t" + (i % 4), t.replace(/ /g, "·"));
        out.appendChild(s);
      });
      nota.textContent =
        inp.value.length +
        " caracteres ≈ " +
        ts.length +
        " tokens nesta aproximação (" +
        (ts.length ? (inp.value.length / ts.length).toFixed(1).replace(".", ",") : "0") +
        " caracteres por token).";
    }
    inp.oninput = draw;
    f.appendChild(inp);
    f.appendChild(out);
    f.appendChild(nota);
    draw();
    legenda(f, d.leg);
  },
  /* probabilidade da próxima palavra e o efeito da temperatura */
  temperatura: (f, d) => {
    var T = 1,
      box = h("div"),
      frase = h("p", "gfrase"),
      gerada = "",
      nota = h("p", "vtxt");
    function probs() {
      return probabilidades(
        d.cands.map((c) => c[1]),
        T,
      );
    }
    function draw() {
      var p = probs();
      box.textContent = "";
      barras(
        box,
        d.cands.map((c, i) => [c[0], p[i], (p[i] * 100).toFixed(p[i] < 0.01 ? 1 : 0).replace(".", ",") + "%", i === 0]),
        { max: 1 },
      );
      frase.textContent = "";
      frase.appendChild(document.createTextNode(d.frase + " "));
      frase.appendChild(h("b", null, gerada || "…"));
    }
    var sortear = h("button", "btn solid", "Sortear a próxima palavra");
    sortear.onclick = () => {
      var p = probs(),
        r = Math.random(),
        a = 0;
      for (var i = 0; i < p.length; i++) {
        a += p[i];
        if (r <= a) break;
      }
      gerada = d.cands[Math.min(i, p.length - 1)][0];
      draw();
    };
    f.appendChild(frase);
    f.appendChild(
      controle(
        "Temperatura",
        0.1,
        2,
        1,
        0.05,
        (v) => v.toFixed(2).replace(".", ","),
        (v) => {
          T = v;
          draw();
        },
      ),
    );
    f.appendChild(box);
    f.appendChild(h("div", "vctl", [sortear]));
    draw();
    legenda(f, d.leg);
  },
  /* palavras como pontos: perto = significado parecido */
  vetores: (f, d) => {
    var s = svgEl("svg", {
        viewBox: "0 0 520 300",
        class: "vsvg",
        role: "img",
        "aria-label": "Mapa de palavras por significado",
      }),
      linhas = svgEl("g", {}),
      nota = h("p", "vtxt", "Clique numa palavra para ver as mais próximas.");
    s.appendChild(linhas);
    var pts = d.pontos.map((p) => {
      var g = svgEl("g", { class: "gvp" }),
        x = 20 + p[1] * 4.8,
        y = 280 - p[2] * 2.6;
      g.appendChild(svgEl("circle", { cx: x, cy: y, r: 5 }));
      var t = svgEl("text", { x: x + 9, y: y + 4, "font-size": 13, "font-family": "Inter, sans-serif" });
      t.textContent = p[0];
      g.appendChild(t);
      s.appendChild(g);
      return { p: p, g: g, x: x, y: y };
    });
    pts.forEach((a) => {
      a.g.addEventListener("click", () => {
        linhas.textContent = "";
        pts.forEach((b) => {
          b.g.classList.remove("on", "perto");
        });
        a.g.classList.add("on");
        var ord = pts
          .filter((b) => b !== a)
          .sort((b, c) => Math.hypot(b.x - a.x, b.y - a.y) - Math.hypot(c.x - a.x, c.y - a.y))
          .slice(0, 3);
        ord.forEach((b) => {
          b.g.classList.add("perto");
          linhas.appendChild(
            svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "var(--muted)", "stroke-dasharray": "3 4" }),
          );
        });
        nota.textContent = "Mais perto de “" + a.p[0] + "”: " + ord.map((b) => b.p[0]).join(", ") + ".";
      });
    });
    f.appendChild(s);
    f.appendChild(nota);
    legenda(f, d.leg);
  },
  /* ---- componentes próprios de cada trilha ---- */
  binario: (f) => {
    var v = 65,
      bits = h("div", "gbits"),
      out = h("p", "vtxt");
    [128, 64, 32, 16, 8, 4, 2, 1].forEach((p) => {
      var b = h("button", "gbit", [h("b"), h("span", null, String(p))]);
      b.type = "button";
      b.onclick = () => {
        v ^= p;
        draw();
      };
      b.dataset.p = p;
      bits.appendChild(b);
    });
    function draw() {
      bits.querySelectorAll("button").forEach((b) => {
        var on = (v & +b.dataset.p) > 0;
        b.firstChild.textContent = on ? "1" : "0";
        b.setAttribute("aria-pressed", String(on));
      });
      out.textContent =
        "Binário " +
        v.toString(2).padStart(8, "0") +
        " = decimal " +
        v +
        " = hexadecimal " +
        v.toString(16).toUpperCase().padStart(2, "0") +
        (v >= 32 && v < 127 ? " = letra “" + String.fromCharCode(v) + "” na tabela ASCII" : "");
    }
    f.appendChild(bits);
    f.appendChild(out);
    draw();
    legenda(f, "Clique nos bits para ligar e desligar. Cada posição vale o dobro da posição à direita.");
  },
  gargalo: (f) => {
    var cpu = 120,
      gpu = 160,
      res = 1,
      box = h("div"),
      nota = h("p", "vtxt"),
      cs = h("div", "chips"),
      R = { 1: "1080p", 0.62: "1440p", 0.3: "4K" },
      rk = "1";
    var sync = chipRow(
      cs,
      Object.keys(R),
      () => rk,
      (v) => {
        rk = v;
        res = +v;
        draw();
      },
    );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = R[b.dataset.v];
    });
    function draw() {
      sync();
      var g = Math.round(gpu * res),
        fps = Math.min(cpu, g);
      box.textContent = "";
      barras(
        box,
        [
          ["CPU prepara", cpu, cpu + " quadros/s", cpu <= g],
          ["GPU desenha", g, g + " quadros/s", g < cpu],
          ["Você vê", fps, fps + " quadros/s"],
        ],
        { max: 300 },
      );
      nota.textContent =
        cpu <= g
          ? "O processador é o limite: baixar a resolução quase não muda nada, porque a CPU continua preparando " +
            cpu +
            " quadros por segundo."
          : "A placa de vídeo é o limite (o normal em jogos): ela fica perto de 99% de uso. Uma GPU mais forte ou uma resolução menor aumentam os quadros.";
    }
    f.appendChild(
      controle(
        "CPU: quadros possíveis",
        30,
        240,
        120,
        5,
        (v) => v,
        (v) => {
          cpu = v;
          draw();
        },
      ),
    );
    f.appendChild(
      controle(
        "GPU em 1080p",
        30,
        300,
        160,
        5,
        (v) => v,
        (v) => {
          gpu = v;
          draw();
        },
      ),
    );
    f.appendChild(cs);
    f.appendChild(box);
    f.appendChild(nota);
    draw();
    legenda(f, "Os quadros por segundo são o menor dos dois valores. Mude a resolução e veja quem limita.");
  },
  ramcalc: (f) => {
    var mt = 6000,
      cl = 30,
      can = 2,
      cs = h("div", "chips"),
      out = h("div", "bars"),
      nota = h("p", "vtxt");
    var sync = chipRow(
      cs,
      ["1", "2"],
      () => String(can),
      (v) => {
        can = +v;
        draw();
      },
    );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = b.dataset.v === "1" ? "Um canal" : "Dois canais";
    });
    function draw() {
      sync();
      var mm = memoria(mt, cl, can),
        lat = mm.latenciaNs,
        bw = mm.bandaGBs;
      out.textContent = "";
      barras(
        out,
        [
          ["Latência", lat, lat.toFixed(1).replace(".", ",") + " ns"],
          ["Banda", bw, bw.toFixed(1).replace(".", ",") + " GB/s", 1],
        ],
        { max: Math.max(110, lat) },
      );
      nota.textContent =
        "Latência real = CL × 2000 ÷ MT/s. Banda = MT/s × 8 bytes × canais. Uma DDR" +
        (mt > 4800 ? "5" : "4") +
        "-" +
        mt +
        " CL" +
        cl +
        " leva " +
        lat.toFixed(1).replace(".", ",") +
        " ns para começar a entregar dados.";
    }
    f.appendChild(
      controle(
        "Velocidade",
        2133,
        8400,
        6000,
        100,
        (v) => v + " MT/s",
        (v) => {
          mt = v;
          draw();
        },
      ),
    );
    f.appendChild(
      controle(
        "Latência CAS (CL)",
        14,
        50,
        30,
        1,
        (v) => "CL" + v,
        (v) => {
          cl = v;
          draw();
        },
      ),
    );
    f.appendChild(cs);
    f.appendChild(out);
    f.appendChild(nota);
    draw();
    legenda(f, "Mais MT/s aumenta a banda; a latência em nanossegundos depende da relação entre CL e velocidade.");
  },
  celulas: (f) => {
    var T = {
        SLC: [1, "100 mil", "muito alta"],
        MLC: [2, "10 mil", "alta"],
        TLC: [3, "3 mil", "média"],
        QLC: [4, "1 mil", "baixa fora do cache"],
      },
      k = "TLC",
      cs = h("div", "chips"),
      s = svgEl("svg", {
        viewBox: "0 0 520 170",
        class: "vsvg",
        role: "img",
        "aria-label": "Níveis de tensão numa célula de memória flash",
      }),
      nota = h("p", "vtxt");
    var sync = chipRow(
      cs,
      Object.keys(T),
      () => k,
      (v) => {
        k = v;
        draw();
      },
    );
    function draw() {
      sync();
      s.textContent = "";
      var n = 2 ** T[k][0],
        hh = 140 / n;
      for (var i = 0; i < n; i++) {
        var y = 15 + i * hh;
        s.appendChild(
          svgEl("rect", {
            x: 150,
            y: y + 1,
            width: 220,
            height: Math.max(2, hh - 2),
            fill: i % 2 ? "var(--soft)" : "var(--raised)",
            stroke: "var(--line)",
          }),
        );
        if (n <= 8) {
          var t = svgEl("text", {
            x: 385,
            y: y + hh / 2 + 4,
            "font-size": 11,
            "font-family": "IBM Plex Mono, monospace",
            fill: "var(--muted)",
          });
          t.textContent = (n - 1 - i).toString(2).padStart(T[k][0], "0");
          s.appendChild(t);
        }
      }
      var l = svgEl("text", {
        x: 140,
        y: 90,
        "text-anchor": "end",
        "font-size": 12,
        "font-family": "Inter, sans-serif",
        fill: "var(--muted)",
      });
      l.textContent = "tensão";
      s.appendChild(l);
      nota.textContent =
        k +
        ": " +
        T[k][0] +
        " bit" +
        (T[k][0] > 1 ? "s" : "") +
        " por célula, " +
        n +
        " níveis de tensão para distinguir. Cerca de " +
        T[k][1] +
        " ciclos de gravação por célula; velocidade de gravação " +
        T[k][2] +
        ".";
    }
    f.appendChild(cs);
    f.appendChild(s);
    f.appendChild(nota);
    draw();
    legenda(f, "Cada bit a mais dobra os níveis que o controlador precisa diferenciar dentro da mesma célula.");
  },
  slc: (f) => {
    var gb = 150,
      tipo = "TLC",
      V = { TLC: 1.6, QLC: 0.35 },
      cache = 60,
      s = svgEl("svg", {
        viewBox: "0 0 520 200",
        class: "vsvg",
        role: "img",
        "aria-label": "Velocidade de gravação ao longo de uma cópia",
      }),
      p = svgEl("path", { fill: "none", stroke: "var(--text)", "stroke-width": 2.5 }),
      nota = h("p", "vtxt"),
      cs = h("div", "chips");
    s.appendChild(svgEl("line", { x1: 40, y1: 170, x2: 510, y2: 170, stroke: "var(--line)" }));
    s.appendChild(p);
    var sync = chipRow(
      cs,
      ["TLC", "QLC"],
      () => tipo,
      (v) => {
        tipo = v;
        draw();
      },
    );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = "SSD " + b.dataset.v;
    });
    function draw() {
      sync();
      var max = 6,
        y = (v) => 170 - (v / max) * 150,
        x = (g) => 40 + (g / gb) * 470,
        ate = Math.min(gb, cache),
        dep = V[tipo];
      p.setAttribute("d", "M40 " + y(5.5) + " H" + x(ate) + (gb > cache ? " V" + y(dep) + " H510" : ""));
      var t = ate / 5.5 + Math.max(0, gb - cache) / dep;
      nota.textContent =
        "Copiar " +
        gb +
        " GB: " +
        (gb <= cache
          ? "tudo cabe no cache SLC, cerca de 5,5 GB/s o tempo todo."
          : "5,5 GB/s até encher o cache de " +
            cache +
            " GB, depois cai para " +
            String(dep).replace(".", ",") +
            " GB/s, a velocidade real das células " +
            tipo +
            ".") +
        " Tempo total: " +
        (t < 60 ? Math.round(t) + " s" : Math.floor(t / 60) + " min " + Math.round(t % 60) + " s") +
        ".";
    }
    f.appendChild(
      controle(
        "Tamanho da cópia",
        10,
        400,
        150,
        10,
        (v) => v + " GB",
        (v) => {
          gb = v;
          draw();
        },
      ),
    );
    f.appendChild(cs);
    f.appendChild(s);
    f.appendChild(nota);
    draw();
    legenda(f, "Velocidade de gravação (eixo vertical) conforme a cópia avança. Valores típicos de SSDs PCIe 4.0.");
  },
  boxmodel: (f) => {
    var m = 20,
      b = 6,
      p = 20,
      w = 160,
      bs = "content-box",
      cx = h("div", "gbox-w"),
      mg = h("div", "gbox-m", [h("span", null, "margin")]),
      bd = h("div", "gbox-b"),
      pd = h("div", "gbox-p", [h("span", null, "padding")]),
      ct = h("div", "gbox-c", "conteúdo");
    pd.appendChild(ct);
    bd.appendChild(pd);
    mg.appendChild(bd);
    cx.appendChild(mg);
    var nota = h("p", "vtxt"),
      cs = h("div", "chips"),
      code = h("pre", "gcss");
    var sync = chipRow(
      cs,
      ["content-box", "border-box"],
      () => bs,
      (v) => {
        bs = v;
        draw();
      },
    );
    function draw() {
      sync();
      var cw = bs === "border-box" ? Math.max(0, w - 2 * b - 2 * p) : w,
        tot = cw + 2 * p + 2 * b;
      mg.style.padding = m + "px";
      bd.style.borderWidth = b + "px";
      pd.style.padding = p + "px";
      ct.style.width = cw + "px";
      code.textContent =
        ".caixa {\n  box-sizing: " +
        bs +
        ";\n  width: " +
        w +
        "px;\n  padding: " +
        p +
        "px;\n  border: " +
        b +
        "px solid;\n  margin: " +
        m +
        "px;\n}";
      nota.textContent =
        "Largura visível da caixa: " +
        tot +
        " px" +
        (bs === "content-box"
          ? " (" + w + " de width + " + 2 * p + " de padding + " + 2 * b + " de borda)."
          : " (o width já inclui padding e borda).") +
        " A margem empurra os vizinhos, mas não faz parte da caixa.";
    }
    [
      [
        "margin",
        0,
        40,
        20,
        (v) => {
          m = v;
        },
      ],
      [
        "border",
        0,
        20,
        6,
        (v) => {
          b = v;
        },
      ],
      [
        "padding",
        0,
        40,
        20,
        (v) => {
          p = v;
        },
      ],
    ].forEach((c) => {
      f.appendChild(
        controle(
          c[0],
          c[1],
          c[2],
          c[3],
          1,
          (v) => v + " px",
          (v) => {
            c[4](v);
            draw();
          },
        ),
      );
    });
    f.appendChild(cs);
    f.appendChild(h("div", "gbox-lado", [cx, code]));
    f.appendChild(nota);
    draw();
    legenda(f, "Toda caixa tem conteúdo, padding, borda e margem, de dentro para fora.");
  },
  flex: (f) => {
    var st = { "flex-direction": "row", "justify-content": "flex-start", "align-items": "stretch" },
      ops = {
        "flex-direction": ["row", "column"],
        "justify-content": ["flex-start", "center", "space-between", "space-around"],
        "align-items": ["stretch", "flex-start", "center", "flex-end"],
      },
      gap = 8;
    var palco = h("div", "gflex"),
      code = h("pre", "gcss");
    [1, 2, 3].forEach((i) => {
      palco.appendChild(h("div", "gfi gfi" + i, String(i)));
    });
    Object.keys(ops).forEach((k) => {
      var cs = h("div", "chips"),
        sync = chipRow(
          cs,
          ops[k],
          () => st[k],
          (v) => {
            st[k] = v;
            sync();
            draw();
          },
        );
      sync();
      f.appendChild(h("div", "glab", k));
      f.appendChild(cs);
    });
    function draw() {
      Object.keys(st).forEach((k) => {
        palco.style.setProperty(k, st[k]);
      });
      palco.style.gap = gap + "px";
      code.textContent =
        ".pai {\n  display: flex;\n" +
        Object.keys(st)
          .map((k) => "  " + k + ": " + st[k] + ";")
          .join("\n") +
        "\n  gap: " +
        gap +
        "px;\n}";
    }
    f.appendChild(
      controle(
        "gap",
        0,
        40,
        8,
        1,
        (v) => v + " px",
        (v) => {
          gap = v;
          draw();
        },
      ),
    );
    f.appendChild(h("div", "gbox-lado", [palco, code]));
    draw();
    legenda(f, "Os itens 1, 2 e 3 são filhos do mesmo elemento com display: flex.");
  },
  seletor: (f) => {
    var inp = h("input", "gsel-in"),
      out = h("div", "gspec"),
      nota = h("p", "vtxt"),
      cs = h("div", "chips"),
      ex = ["p", "p.destaque", "nav a:hover", "#menu .item", "ul li::before", '[type="email"]', "#topo #logo img"];
    inp.value = "nav a:hover";
    inp.setAttribute("aria-label", "Seletor CSS");
    function calc(s) {
      return especificidade(s);
    }
    function draw() {
      var r = calc(inp.value);
      out.textContent = "";
      [
        ["IDs", r[0]],
        ["Classes, atributos e pseudoclasses", r[1]],
        ["Elementos e pseudoelementos", r[2]],
      ].forEach((x) => {
        out.appendChild(h("div", null, [h("b", null, String(x[1])), h("span", null, x[0])]));
      });
      nota.textContent =
        "Especificidade (" +
        r.join(", ") +
        "). Compare da esquerda para a direita: um único ID vence qualquer quantidade de classes.";
    }
    ex.forEach((e) => {
      var b = h("button", "chip", [e]);
      b.onclick = () => {
        inp.value = e;
        draw();
      };
      cs.appendChild(b);
    });
    inp.oninput = draw;
    f.appendChild(inp);
    f.appendChild(cs);
    f.appendChild(out);
    f.appendChild(nota);
    draw();
    legenda(f, "Digite um seletor ou escolha um exemplo.");
  },
  fatiar: (f) => {
    var L = ["p", "y", "t", "h", "o", "n", "!"],
      a = 1,
      b = 5,
      p = 1,
      cel = h("div", "gfat"),
      expr = h("pre", "gcss"),
      out = h("p", "vtxt"),
      cs = h("div", "chips");
    L.forEach((x, i) => {
      cel.appendChild(
        h("div", "gfc", [h("span", "gi", String(i)), h("b", null, x), h("span", "gi", String(i - L.length))]),
      );
    });
    var sync = chipRow(
      cs,
      ["1", "2", "-1"],
      () => String(p),
      (v) => {
        p = +v;
        draw();
      },
    );
    cs.querySelectorAll("button").forEach((x) => {
      x.firstChild.textContent = "passo " + x.dataset.v;
    });
    function idx() {
      return fatiaPython(L.length, a, b, p);
    }
    function draw() {
      sync();
      var r = idx();
      Array.prototype.forEach.call(cel.children, (c, i) => {
        c.classList.toggle("on", r.indexOf(i) >= 0);
      });
      expr.textContent = 'letras = list("python!")\nletras[' + a + ":" + b + (p !== 1 ? ":" + p : "") + "]";
      out.textContent =
        "Resultado: [" +
        r.map((i) => "'" + L[i] + "'").join(", ") +
        "]" +
        (r.length ? "" : " (lista vazia: com esse passo, o início nunca chega ao fim)");
    }
    f.appendChild(cel);
    f.appendChild(
      controle("início", -7, 7, 1, 1, String, (v) => {
        a = v;
        draw();
      }),
    );
    f.appendChild(
      controle("fim (não incluso)", -7, 7, 5, 1, String, (v) => {
        b = v;
        draw();
      }),
    );
    f.appendChild(cs);
    f.appendChild(expr);
    f.appendChild(out);
    draw();
    legenda(f, "Índices positivos contam do começo (0) e negativos do fim (-1). O fim da fatia nunca entra.");
  },
  ciclo: (f) => {
    var et = [
      ["Buscar", "Lê a próxima instrução na memória, no endereço do program counter."],
      ["Decodificar", "Descobre o que a instrução pede: aqui, somar dois registradores."],
      ["Executar", "A ULA faz a conta: 7 + 5 = 12."],
      ["Gravar", "Guarda o resultado no registrador de destino e avança para a próxima instrução."],
    ];
    var s = svgEl("svg", {
      viewBox: "0 0 520 220",
      class: "vsvg",
      role: "img",
      "aria-label": "Ciclo de uma instrução em quatro etapas",
    });
    var pos = [
        [260, 40],
        [440, 110],
        [260, 180],
        [80, 110],
      ],
      nos = [];
    s.appendChild(
      svgEl("ellipse", {
        cx: 260,
        cy: 110,
        rx: 180,
        ry: 70,
        fill: "none",
        stroke: "var(--line)",
        "stroke-width": 2,
        "stroke-dasharray": "4 6",
      }),
    );
    pos.forEach((p, i) => {
      var g = svgEl("g", {});
      var r = svgEl("rect", {
        x: p[0] - 62,
        y: p[1] - 20,
        width: 124,
        height: 40,
        rx: 20,
        fill: "var(--surface)",
        stroke: "var(--muted)",
        "stroke-width": 1.5,
      });
      var t = svgEl("text", {
        x: p[0],
        y: p[1] + 5,
        "text-anchor": "middle",
        fill: "var(--text)",
        "font-size": 14,
        "font-family": "Sora, sans-serif",
        "font-weight": 600,
      });
      t.textContent = et[i][0];
      g.appendChild(r);
      g.appendChild(t);
      s.appendChild(g);
      nos.push(r);
    });
    var ins = svgEl("text", {
      x: 260,
      y: 116,
      "text-anchor": "middle",
      fill: "var(--muted)",
      "font-size": 13,
      "font-family": "IBM Plex Mono, monospace",
    });
    ins.textContent = "SOMA R3, R1, R2";
    s.appendChild(ins);
    var txt = h("p", "vtxt"),
      cur = 0,
      b = h("button", "btn line", "Próxima etapa →");
    function show() {
      nos.forEach((r, i) => {
        r.setAttribute("fill", i === cur ? "var(--text)" : "var(--surface)");
        r.nextSibling.setAttribute("fill", i === cur ? "var(--ink)" : "var(--text)");
      });
      txt.textContent = pad(cur + 1) + " · " + et[cur][1];
    }
    b.onclick = () => {
      cur = (cur + 1) % 4;
      show();
    };
    show();
    f.appendChild(s);
    f.appendChild(txt);
    f.appendChild(h("div", "vctl", [b]));
    legenda(f, "Clique para avançar as etapas de uma instrução de soma.");
  },
  clock: (f) => {
    var ghz = 4,
      s = svgEl("svg", { viewBox: "0 0 520 120", class: "vsvg", role: "img", "aria-label": "Sinal de clock" }),
      p = svgEl("path", { fill: "none", stroke: "var(--text)", "stroke-width": 2 });
    s.appendChild(p);
    for (var i = 0; i <= 4; i++) {
      var x = 20 + i * 120;
      s.appendChild(svgEl("line", { x1: x, y1: 96, x2: x, y2: 104, stroke: "var(--muted)" }));
      var t = svgEl("text", {
        x: x,
        y: 116,
        "text-anchor": "middle",
        fill: "var(--muted)",
        "font-size": 11,
        "font-family": "IBM Plex Mono, monospace",
      });
      t.textContent = i * 0.25 + " ns";
      s.appendChild(t);
    }
    var nota = h("p", "vtxt");
    function draw(g) {
      var per = 480 / (g * 1),
        d = "M20 80",
        x = 20;
      while (x < 500) {
        d += " V30 H" + Math.min(500, x + per / 2) + " V80 H" + Math.min(500, x + per);
        x += per;
      }
      p.setAttribute("d", d);
      nota.textContent =
        g.toFixed(1).replace(".", ",") +
        " GHz = " +
        g.toFixed(1).replace(".", ",") +
        " ciclos a cada nanossegundo. Cada ciclo dura " +
        (1000 / g).toFixed(0) +
        " picossegundos.";
    }
    draw(ghz);
    f.appendChild(s);
    f.appendChild(controle("Clock", 1, 6, 4, 0.1, (v) => v.toFixed(1).replace(".", ",") + " GHz", draw));
    f.appendChild(nota);
    legenda(f, "Cada subida do sinal é um ciclo. A régua mostra 1 nanossegundo.");
  },
  amdahl: (f) => {
    var p = 0.9,
      box = h("div"),
      nota = h("p", "vtxt");
    function draw() {
      box.textContent = "";
      var ns = [1, 2, 4, 8, 16, 32],
        dados = ns.map((n) => {
          var t = 1 - p + p / n;
          return [
            n + (n > 1 ? " núcleos" : " núcleo"),
            t,
            Math.round(t * 100) + "% do tempo · " + (1 / t).toFixed(1).replace(".", ",") + "x",
            n === 8,
          ];
        });
      barras(box, dados, { max: 1 });
      nota.textContent =
        "Com " +
        Math.round(p * 100) +
        "% de trabalho paralelizável, o ganho máximo possível é " +
        (1 / (1 - p)).toFixed(0) +
        "x, mesmo com infinitos núcleos.";
    }
    f.appendChild(
      controle(
        "Parte paralelizável",
        0,
        0.99,
        0.9,
        0.01,
        (v) => Math.round(v * 100) + "%",
        (v) => {
          p = v;
          draw();
        },
      ),
    );
    f.appendChild(box);
    f.appendChild(nota);
    draw();
    legenda(f, "Tempo de execução relativo a um núcleo, pela lei de Amdahl.");
  },
  piramide: (f) => {
    var n = [
      ["Registradores", "bytes", "< 1 ns"],
      ["Cache L1", "~48 KB por núcleo", "~1 ns"],
      ["Cache L2", "1 a 3 MB por núcleo", "~4 ns"],
      ["Cache L3", "16 a 128 MB", "~12 ns"],
      ["RAM", "16 a 64 GB", "~80 ns"],
      ["SSD NVMe", "1 a 4 TB", "~80 µs"],
    ];
    var s = svgEl("svg", {
      viewBox: "0 0 560 300",
      class: "vsvg",
      role: "img",
      "aria-label": "Pirâmide da hierarquia de memória",
    });
    n.forEach((d, i) => {
      var y = 10 + i * 46,
        w = 90 + i * 78,
        x = 280 - w / 2,
        g = svgEl("g", {});
      g.appendChild(
        svgEl("rect", {
          x: x,
          y: y,
          width: w,
          height: 40,
          fill: i < 1 ? "var(--text)" : "var(--soft)",
          opacity: 1 - i * 0.1,
          stroke: "var(--line)",
        }),
      );
      var t = svgEl("text", {
        x: 280,
        y: y + 25,
        "text-anchor": "middle",
        "font-size": 13,
        "font-family": "Sora, sans-serif",
        "font-weight": 600,
        fill: i < 1 ? "var(--ink)" : "var(--text)",
      });
      t.textContent = d[0];
      g.appendChild(t);
      var l = svgEl("text", {
        x: 8,
        y: y + 25,
        "font-size": 11,
        "font-family": "IBM Plex Mono, monospace",
        fill: "var(--muted)",
      });
      l.textContent = d[2];
      g.appendChild(l);
      var r = svgEl("text", {
        x: 552,
        y: y + 25,
        "text-anchor": "end",
        "font-size": 11,
        "font-family": "IBM Plex Mono, monospace",
        fill: "var(--muted)",
      });
      r.textContent = d[1];
      g.appendChild(r);
      s.appendChild(g);
    });
    f.appendChild(s);
    legenda(f, "Quanto mais perto do topo, mais rápido e menor. À esquerda, a latência; à direita, o tamanho típico.");
  },
  latencias: (f) => {
    barras(
      f,
      [
        ["Cache L1", 1, "1 segundo"],
        ["Cache L2", 4, "4 segundos"],
        ["Cache L3", 12, "12 segundos"],
        ["RAM", 80, "1 min 20 s", 1],
        ["SSD NVMe", 80000, "22 horas"],
        ["HD", 8000000, "3 meses"],
      ],
      { max: 8000000, log: true },
    );
    legenda(f, "Escala logarítmica: cada marca da barra é 10 vezes maior que a anterior. Valores aproximados.");
  },
  cachesim: (f) => {
    var padrao = "seq",
      box = h("div", "cgrid"),
      nota = h("p", "vtxt"),
      tam = 8;
    function sim() {
      box.textContent = "";
      var linhas = [],
        acertos = 0,
        seq = [];
      for (var i = 0; i < 48; i++)
        seq.push(padrao === "seq" ? Math.floor(i / 4) : padrao === "laco" ? i % 6 : Math.floor(Math.random() * 40));
      seq.forEach((l) => {
        var hit = linhas.indexOf(l) >= 0;
        if (hit) {
          acertos++;
          linhas.splice(linhas.indexOf(l), 1);
        } else if (linhas.length >= tam) linhas.shift();
        linhas.push(l);
        var c = h("span", hit ? "hit" : "miss", hit ? "A" : "F");
        c.title = "Linha " + l + ": " + (hit ? "acerto" : "falta");
        box.appendChild(c);
      });
      nota.textContent =
        "Taxa de acerto: " +
        Math.round((acertos / seq.length) * 100) +
        "% (" +
        acertos +
        " acertos em " +
        seq.length +
        " acessos). A = acerto, F = falta.";
    }
    var cs = h("div", "chips");
    chipRow(
      cs,
      ["seq", "laco", "alea"],
      () => padrao,
      (v) => {
        padrao = v;
        sync();
        sim();
      },
    );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = { seq: "Em ordem", laco: "Laço repetido", alea: "Aleatório" }[b.dataset.v];
    });
    var sync = () => {
      cs.querySelectorAll("button").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.v === padrao));
      });
    };
    f.appendChild(cs);
    f.appendChild(box);
    f.appendChild(nota);
    sync();
    sim();
    legenda(f, "Simulação de um cache com 8 linhas. Em ordem, cada linha de 64 bytes atende 4 acessos seguidos.");
  },
  ficha: (f) => {
    var rows = [
      [
        "Núcleos / threads",
        "8 / 16",
        "Quantas tarefas avançam ao mesmo tempo. Ajuda em renderização, compilação e multitarefa.",
      ],
      [
        "Clock base / boost",
        "4,2 / 5,4 GHz",
        "O base é garantido; o boost é o máximo, por pouco tempo e em poucos núcleos.",
      ],
      ["Cache L3", "32 MB", "Memória rápida compartilhada. Muito importante em jogos."],
      ["TDP", "105 W", "Referência térmica para o cooler. O consumo real pode passar disso."],
      ["Socket", "AM5", "O encaixe na placa-mãe. Precisa ser igual ao da placa."],
      [
        "Memória",
        "DDR5 até 5600 MT/s (oficial)",
        "Geração e velocidade validadas pelo fabricante. Perfis EXPO podem ir além.",
      ],
      ["Vídeo integrado", "Sim (2 núcleos gráficos)", "Dá imagem sem placa de vídeo, suficiente para uso básico."],
      ["Linhas PCIe", "24 × PCIe 5.0", "Ligações diretas para placa de vídeo e SSDs."],
    ];
    var tb = h("table", "ficha"),
      exp = h("p", "vtxt", "Clique numa linha para ver a explicação.");
    rows.forEach((r) => {
      var tr = h("tr", null, [h("td", null, r[0]), h("td", null, r[1])]);
      tr.tabIndex = 0;
      tr.onclick = tr.onkeydown = (e) => {
        if (e.type === "keydown" && e.key !== "Enter") return;
        tb.querySelectorAll("tr").forEach((x) => {
          x.classList.remove("sel");
        });
        tr.classList.add("sel");
        exp.textContent = r[0] + ": " + r[2];
      };
      tb.appendChild(tr);
    });
    f.appendChild(h("div", "tw", [tb]));
    f.appendChild(exp);
    legenda(f, "Ficha de exemplo de um processador de desktop de 8 núcleos.");
  },
  escolha: (f) => {
    var usos = {
      jogos: [
        "Jogos",
        "6 a 8 núcleos rápidos e muito cache L3. É o caso dos modelos com cache empilhado.",
        "Placa de vídeo dedicada é obrigatória.",
      ],
      edicao: [
        "Edição de vídeo e 3D",
        "12 núcleos ou mais; o tempo de renderização cai quase na proporção dos núcleos.",
        "32 GB de RAM ou mais.",
      ],
      escritorio: [
        "Escritório e estudo",
        "4 a 6 núcleos com vídeo integrado já sobram.",
        "Um SSD faz mais diferença que uma CPU cara.",
      ],
      ia: [
        "IA local",
        "A CPU importa menos que a GPU e a VRAM. Uma NPU ajuda em tarefas leves no notebook.",
        "Priorize a placa de vídeo com bastante VRAM.",
      ],
    };
    var u = "jogos",
      out = h("div", "dica");
    var cs = h("div", "chips");
    var sync = chipRow(
      cs,
      Object.keys(usos),
      () => u,
      (v) => {
        u = v;
        draw();
      },
    );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = usos[b.dataset.v][0];
    });
    function draw() {
      sync();
      out.textContent = "";
      out.appendChild(h("span", "eyebrow", "Para " + usos[u][0].toLowerCase()));
      out.appendChild(h("p", null, usos[u][1]));
      out.appendChild(h("p", null, usos[u][2]));
    }
    f.appendChild(cs);
    f.appendChild(out);
    draw();
    legenda(f, "Escolha um uso para ver o que priorizar.");
  },
  pipeline: (f) => {
    var com = true,
      box = h("div", "pipe"),
      nota = h("p", "vtxt"),
      E = ["B", "D", "X", "M", "G"];
    function draw() {
      box.textContent = "";
      var n = 5,
        ciclos = com ? n + 4 : n * 5,
        grid = h("div", "pgrid");
      grid.style.gridTemplateColumns = "70px repeat(" + ciclos + ",minmax(22px,1fr))";
      grid.appendChild(h("span", "ph", ""));
      for (var c = 1; c <= ciclos; c++) grid.appendChild(h("span", "ph", String(c)));
      for (var i = 0; i < n; i++) {
        grid.appendChild(h("span", "pl", "Instr. " + (i + 1)));
        for (c = 0; c < ciclos; c++) {
          var ini = com ? i : i * 5,
            k = c - ini,
            cell = h("span", k >= 0 && k < 5 ? "pc on" : "pc", k >= 0 && k < 5 ? E[k] : "");
          cell.style.setProperty("--d", c * 60 + "ms");
          grid.appendChild(cell);
        }
      }
      box.appendChild(grid);
      nota.textContent =
        (com ? "Com pipeline: " : "Sem pipeline: ") +
        ciclos +
        " ciclos para 5 instruções. " +
        (com ? "Depois da primeira, sai uma instrução por ciclo." : "Cada instrução espera a anterior terminar.");
    }
    var cs = h("div", "chips"),
      sync = chipRow(
        cs,
        ["com", "sem"],
        () => (com ? "com" : "sem"),
        (v) => {
          com = v === "com";
          sync();
          draw();
        },
      );
    cs.querySelectorAll("button").forEach((b) => {
      b.firstChild.textContent = b.dataset.v === "com" ? "Com pipeline" : "Sem pipeline";
    });
    f.appendChild(cs);
    f.appendChild(h("div", "tw", [box]));
    f.appendChild(nota);
    sync();
    draw();
    legenda(f, "B = buscar, D = decodificar, X = executar, M = memória, G = gravar.");
  },
  ipc: (f) => {
    var a = [5, 1],
      b = [4, 1.4],
      box = h("div");
    function draw() {
      box.textContent = "";
      barras(
        box,
        [
          ["CPU A", a[0] * a[1], (a[0] * a[1]).toFixed(1).replace(".", ",") + " bi instr./s"],
          ["CPU B", b[0] * b[1], (b[0] * b[1]).toFixed(1).replace(".", ",") + " bi instr./s", 1],
        ],
        { max: 8.5 },
      );
    }
    f.appendChild(
      h("div", "duo", [
        h("div", null, [
          h("b", null, "CPU A"),
          controle(
            "Clock A",
            3,
            6,
            5,
            0.1,
            (v) => v.toFixed(1).replace(".", ",") + " GHz",
            (v) => {
              a[0] = v;
              draw();
            },
          ),
          controle(
            "IPC A",
            0.6,
            2,
            1,
            0.1,
            (v) => v.toFixed(1).replace(".", ","),
            (v) => {
              a[1] = v;
              draw();
            },
          ),
        ]),
        h("div", null, [
          h("b", null, "CPU B"),
          controle(
            "Clock B",
            3,
            6,
            4,
            0.1,
            (v) => v.toFixed(1).replace(".", ",") + " GHz",
            (v) => {
              b[0] = v;
              draw();
            },
          ),
          controle(
            "IPC B",
            0.6,
            2,
            1.4,
            0.1,
            (v) => v.toFixed(1).replace(".", ","),
            (v) => {
              b[1] = v;
              draw();
            },
          ),
        ]),
      ]),
    );
    f.appendChild(box);
    draw();
    legenda(f, "Desempenho ≈ IPC × clock. Ajuste os dois processadores e compare.");
  },
  curva: (f) => {
    var W = 520,
      H = 230,
      L = 46,
      B = 36,
      s = svgEl("svg", {
        viewBox: "0 0 " + W + " " + H,
        class: "vsvg",
        role: "img",
        "aria-label": "Consumo relativo por frequência",
      });
    var pts = [];
    for (var g = 3; g <= 5.6001; g += 0.2) {
      var v = 0.75 + 0.12 * (g - 3) + 0.03 * (g - 3) ** 2.2;
      pts.push([g, g * v * v]);
    }
    var p0 = pts[0][1],
      pmax = pts[pts.length - 1][1] / p0;
    function X(g) {
      return L + ((g - 3) / 2.6) * (W - L - 16);
    }
    function Y(r) {
      return H - B - ((r - 1) / (pmax - 1)) * (H - B - 16);
    }
    [1, 1.5, 2, 2.5, 3].forEach((r) => {
      if (r > pmax + 0.1) return;
      s.appendChild(svgEl("line", { x1: L, x2: W - 16, y1: Y(r), y2: Y(r), stroke: "var(--line)" }));
      var t = svgEl("text", {
        x: L - 8,
        y: Y(r) + 4,
        "text-anchor": "end",
        "font-size": 11,
        fill: "var(--muted)",
        "font-family": "IBM Plex Mono, monospace",
      });
      t.textContent = r.toFixed(1).replace(".", ",") + "x";
      s.appendChild(t);
    });
    [3, 3.5, 4, 4.5, 5, 5.5].forEach((g) => {
      var t = svgEl("text", {
        x: X(g),
        y: H - B + 18,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "var(--muted)",
        "font-family": "IBM Plex Mono, monospace",
      });
      t.textContent = g.toFixed(1).replace(".", ",") + " GHz";
      s.appendChild(t);
    });
    var d = pts.map((q, i) => (i ? "L" : "M") + X(q[0]).toFixed(1) + " " + Y(q[1] / p0).toFixed(1)).join(" ");
    s.appendChild(
      svgEl("path", {
        d: d + " L" + X(5.6) + " " + (H - B) + " L" + L + " " + (H - B) + "Z",
        fill: "var(--text)",
        opacity: 0.08,
      }),
    );
    s.appendChild(svgEl("path", { d: d, fill: "none", stroke: "var(--text)", "stroke-width": 2 }));
    var dr = svgEl("path", {
      d: "M" + X(3) + " " + Y(1) + " L" + X(5.6) + " " + Y(5.6 / 3),
      fill: "none",
      stroke: "var(--muted)",
      "stroke-width": 1.5,
      "stroke-dasharray": "5 5",
    });
    s.appendChild(dr);
    var u = pts[pts.length - 1];
    s.appendChild(svgEl("circle", { cx: X(u[0]), cy: Y(u[1] / p0), r: 5, fill: "var(--text)" }));
    var tip = h("p", "vtxt", "Passe o mouse sobre a curva para ver os valores.");
    var hit = svgEl("rect", { x: L, y: 0, width: W - L - 16, height: H - B, fill: "transparent" });
    hit.addEventListener("pointermove", (e) => {
      var r = s.getBoundingClientRect(),
        gx = 3 + ((((e.clientX - r.left) / r.width) * W - L) / (W - L - 16)) * 2.6;
      gx = Math.min(5.6, Math.max(3, gx));
      var v = 0.75 + 0.12 * (gx - 3) + 0.03 * (gx - 3) ** 2.2,
        pr = (gx * v * v) / p0;
      tip.textContent =
        gx.toFixed(1).replace(".", ",") +
        " GHz: desempenho " +
        (gx / 3).toFixed(2).replace(".", ",") +
        "x, consumo " +
        pr.toFixed(2).replace(".", ",") +
        "x em relação a 3 GHz.";
    });
    s.appendChild(hit);
    f.appendChild(s);
    f.appendChild(tip);
    legenda(
      f,
      "Linha cheia: consumo relativo (modelo P ∝ f × V²). Tracejada: desempenho, que cresce só na proporção da frequência. Curva ilustrativa.",
    );
  },
  undervolt: (f) => {
    var red = 0,
      box = h("div"),
      nota = h("p", "vtxt");
    function draw() {
      box.textContent = "";
      var v = 1 - red / 100,
        p = v * v;
      barras(
        box,
        [
          ["Tensão", v, Math.round(v * 100) + "%"],
          ["Consumo", p, Math.round(p * 100) + "%", 1],
          ["Calor a dissipar", p, Math.round(p * 100) + "%"],
        ],
        { max: 1 },
      );
      nota.textContent = red
        ? "Reduzindo a tensão em " +
          red +
          "%, o consumo cai cerca de " +
          Math.round((1 - p) * 100) +
          "% na mesma frequência."
        : "Arraste para reduzir a tensão.";
    }
    f.appendChild(
      controle(
        "Redução de tensão",
        0,
        15,
        0,
        1,
        (v) => v + "%",
        (v) => {
          red = v;
          draw();
        },
      ),
    );
    f.appendChild(box);
    f.appendChild(nota);
    draw();
    legenda(
      f,
      "Estimativa com P ∝ V² na mesma frequência. O ganho real depende de cada chip e precisa de teste de estabilidade.",
    );
  },
};

/* ---------- guias ---------- */
function vGuias() {
  var cat = "",
    cats = [""],
    ct = { "": GU.length },
    list = h("div"),
    cb = h("div", "chips");
  GU.forEach((g) => {
    if (cats.indexOf(g.cat) < 0) cats.push(g.cat);
    ct[g.cat] = (ct[g.cat] || 0) + 1;
  });
  var sync = chipRow(
    cb,
    cats,
    () => cat,
    (v) => {
      cat = v;
      d();
    },
    ct,
  );
  function d() {
    sync();
    list.textContent = "";
    var first = true;
    GU.forEach((g) => {
      if (cat && g.cat !== cat) return;
      var o = h("ol");
      g.s.forEach((s) => {
        o.appendChild(h("li", null, s));
      });
      var el = h("details", "g", [
        h("summary", null, [h("span", "k", g.cat), g.n, h("span", "st", g.s.length + " passos")]),
        h("p", "note", g.d),
        o,
      ]);
      if (first) el.open = true;
      first = false;
      list.appendChild(el);
    });
  }
  d();
  return page(
    "Guias práticos",
    "Passo a passo.",
    "Hardware, sistema, rede, segurança e programação, na ordem em que as coisas acontecem.",
    [cb, list],
  );
}

/* ---------- glossário ---------- */
function vGlos(q0) {
  var q = h("input", "search"),
    l = h("div"),
    cat = "",
    cats = [""],
    ct = { "": G.length },
    cb = h("div", "chips"),
    cn = h("p", "count");
  q.id = "q";
  q.type = "search";
  q.value = q0 || "";
  q.placeholder = "Buscar termo (ex.: cache, DNS, commit)";
  q.setAttribute("aria-label", "Buscar no glossário");
  G.forEach((t) => {
    if (cats.indexOf(t[2]) < 0) cats.push(t[2]);
    ct[t[2]] = (ct[t[2]] || 0) + 1;
  });
  var sync = chipRow(
    cb,
    cats,
    () => cat,
    (v) => {
      cat = v;
      d();
    },
    ct,
  );
  function d() {
    sync();
    var s = q.value.trim().toLowerCase();
    l.textContent = "";
    var r = G.filter((t) => (!cat || t[2] === cat) && (!s || (t[0] + " " + t[1]).toLowerCase().indexOf(s) > -1));
    cn.textContent = r.length === 1 ? "1 termo" : r.length + " termos";
    if (!r.length) l.appendChild(h("p", "txt", "Nenhum termo encontrado. Tente outra palavra ou outra categoria."));
    var ult = "";
    r.forEach((t) => {
      var L = t[0].charAt(0).toUpperCase().normalize("NFD").charAt(0);
      if (!s && L !== ult) {
        ult = L;
        l.appendChild(h("div", "letter", L));
      }
      l.appendChild(h("div", "term", [h("b", null, t[0]), h("span", null, t[1]), h("i", null, t[2])]));
    });
  }
  q.oninput = d;
  d();
  return page(
    "Glossário",
    "Termos sem mistério.",
    "Vocabulário de hardware, software, redes, programação, segurança e IA em linguagem simples.",
    [q, cb, cn, l],
  );
}

/* ---------- jogo ---------- */
/* o jogo ocupa a tela inteira; o menu do site some enquanto ele está aberto */
function vJogo() {
  var caixa = h("div", "jogo");
  if (window.Gargalo) limpar.push(Gargalo.montar(caixa, todasQuestoes(), G));
  else caixa.textContent = "O jogo não carregou. Recarregue a página.";
  return caixa;
}

/* ---------- fichas ---------- */
function vFichas() {
  var k = F.map((f) => {
    var tb = h("table");
    tb.appendChild(
      h("thead", null, [
        h(
          "tr",
          null,
          f.h.map((c) => h("th", null, c)),
        ),
      ]),
    );
    tb.appendChild(
      h(
        "tbody",
        null,
        f.r.map((r) =>
          h(
            "tr",
            null,
            r.map((c) => h("td", null, c)),
          ),
        ),
      ),
    );
    return h("div", "panel", [h("h2", null, f.t), h("p", "note", f.n), h("div", "tw", [tb])]);
  });
  return page("Fichas rápidas", "Consulta rápida.", "Tabelas para os padrões que mudam com o tempo.", [
    h("div", "fichas", k),
  ]);
}

/* ---------- peças ---------- */
function vPecas() {
  var g = h("div", "parts");
  P.forEach((a, i) => {
    var pic = h("div", "pic");
    var VL = ((window.VARIANTES || {})[a.id] || {}).lista || [];
    if (window.MODELOS3D && MODELOS3D[a.id]) {
      var im = h("img");
      im.alt = "";
      im.width = 560;
      im.height = 420;
      pic.appendChild(im);
      miniatura(a.id, im);
    } else pic.appendChild(partArt(a.id));
    var card = ln("#/pecas/" + a.id, "part", [
      pic,
      h("span", "k3", "3D · " + (VL.length || 1) + " variantes · " + Object.keys(a.pontos || {}).length + " partes"),
      h("b", null, a.n),
      h("span", null, VL.length ? VL.map((v) => v.n).join(" · ") : a.r),
    ]);
    card.style.setProperty("--i", i);
    g.appendChild(card);
  });
  return page(
    "Peças",
    "Uma peça de cada vez.",
    "Gire cada componente em 3D, clique nas partes e leia o que cada uma faz.",
    [g],
  );
}
/* página da peça: variantes com 3D, ficha, comparação lado a lado e tabelas de gerações */
function vArtigo(a) {
  var V = (window.VARIANTES || {})[a.id] || {
    lista: [{ id: "padrao", n: a.n, modelo: a.id, d: "", specs: [] }],
    tabelas: [],
  };
  var lista = V.lista,
    cur = lista[0],
    outra = lista[1] || null,
    comparando = false,
    ativos = [];
  var chips = h("div", "chips var-chips"),
    holder = h("div", "var-palco"),
    ficha = h("div", "var-ficha"),
    cmpBtn = h("button", "chip cmp-btn", "Comparar variantes");
  var syncV = chipRow(
    chips,
    lista.map((v) => v.id),
    () => cur.id,
    (id) => {
      cur = lista.filter((v) => v.id === id)[0];
      if (comparando && outra === cur) outra = lista.filter((v) => v !== cur)[0];
      render();
    },
  );
  chips.querySelectorAll("button").forEach((b, i) => {
    b.firstChild.textContent = lista[i].n;
  });
  if (lista.length < 2) cmpBtn.hidden = true;
  cmpBtn.onclick = () => {
    comparando = !comparando;
    render();
  };
  function pontosDe(v) {
    var o = {};
    Object.keys(a.pontos || {}).forEach((k) => {
      o[k] = a.pontos[k];
    });
    Object.keys(v.pontos || {}).forEach((k) => {
      o[k] = v.pontos[k];
    });
    return o;
  }
  function soltar() {
    ativos.forEach((el) => {
      if (el._destruir) {
        el._destruir();
        var k = limpar.indexOf(el._destruir);
        if (k >= 0) limpar.splice(k, 1);
      }
    });
    ativos = [];
  }
  function tabelaSpecs(vs) {
    var campos = [];
    vs.forEach((v) => {
      v.specs.forEach((s) => {
        if (campos.indexOf(s[0]) < 0) campos.push(s[0]);
      });
    });
    var tb = h("table", "specs");
    if (vs.length > 1)
      tb.appendChild(h("thead", null, [h("tr", null, [h("th", null, "")].concat(vs.map((v) => h("th", null, v.n))))]));
    campos.forEach((c) => {
      var vals = vs.map((v) => {
        var s = v.specs.filter((x) => x[0] === c)[0];
        return s ? s[1] : "—";
      });
      var tr = h(
        "tr",
        vs.length > 1 && vals.some((x) => x !== vals[0]) ? "dif" : null,
        [h("td", null, c)].concat(vals.map((x) => h("td", null, x))),
      );
      tb.appendChild(tr);
    });
    return h("div", "tw", [tb]);
  }
  function render() {
    soltar();
    syncV();
    cmpBtn.setAttribute("aria-pressed", String(comparando));
    holder.textContent = "";
    ficha.textContent = "";
    if (!comparando) {
      var v = viewer3d(a, false, { modelo: cur.modelo, pontos: pontosDe(cur) });
      ativos.push(v);
      holder.appendChild(v);
      ficha.appendChild(
        h("div", "var-txt", [h("div", "eyebrow", "Variante"), h("h2", null, cur.n), h("p", "txt", cur.d)]),
      );
      ficha.appendChild(tabelaSpecs([cur]));
    } else {
      var sel = h("select", "cmp-sel");
      sel.id = "cmp-" + a.id;
      lista.forEach((v) => {
        if (v === cur) return;
        var o = h("option", null, v.n);
        o.value = v.id;
        if (v === outra) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = () => {
        outra = lista.filter((v) => v.id === sel.value)[0];
        render();
      };
      if (!outra || outra === cur) outra = lista.filter((v) => v !== cur)[0];
      var g = h("div", "cmp");
      [cur, outra].forEach((v, i) => {
        var st = viewer3d(a, true, { modelo: v.modelo });
        ativos.push(st);
        g.appendChild(
          h("div", "cmp-cel", [
            h(
              "div",
              "cmp-top",
              i
                ? [h("span", "eyebrow", "Comparar com"), sel]
                : [h("span", "eyebrow", "Variante escolhida"), h("b", null, v.n)],
            ),
            h("div", "cmp-palco", [st]),
          ]),
        );
      });
      holder.appendChild(g);
      ficha.appendChild(
        h("div", "var-txt", [
          h("div", "eyebrow", "O que muda"),
          h("p", "txt", [h("b", null, cur.n + ": "), cur.d]),
          h("p", "txt", [h("b", null, outra.n + ": "), outra.d]),
        ]),
      );
      ficha.appendChild(tabelaSpecs([cur, outra]));
      ficha.appendChild(h("p", "note", "Linhas destacadas mostram onde as variantes diferem."));
    }
  }
  var tabs = V.tabelas.map((f) => {
    var tb = h("table");
    tb.appendChild(
      h("thead", null, [
        h(
          "tr",
          null,
          f.h.map((c) => h("th", null, c)),
        ),
      ]),
    );
    tb.appendChild(
      h(
        "tbody",
        null,
        f.r.map((r) =>
          h(
            "tr",
            null,
            r.map((c) => h("td", null, c)),
          ),
        ),
      ),
    );
    return h("div", "panel", [h("h3", null, f.t), f.nota ? h("p", "note", f.nota) : null, h("div", "tw", [tb])]);
  });
  var body = h("div", "art-body");
  a.s.forEach((s) => {
    body.appendChild(h("section", null, [h("h2", null, s[0]), h("p", "txt", s[1])]));
  });
  var i = P.indexOf(a);
  setDots(P.length, i, (j) => {
    location.hash = "#/pecas/" + P[j].id;
  });
  render();
  return h("div", "wrap pg", [
    head(
      "Peça " + pad(i + 1) + " de " + pad(P.length) + " · " + lista.length + " variantes · revisado em out/2026",
      a.n,
      a.r,
    ),
    h("div", "var-bar", [chips, cmpBtn]),
    holder,
    ficha,
    tabs.length ? h("section", "geracoes", [h("h2", null, "Gerações e padrões"), h("div", "fichas", tabs)]) : null,
    body,
    ln("#/pecas", "back", "← Voltar para as peças"),
  ]);
}

/* ---------- biblioteca ---------- */
/* tudo na biblioteca abre aqui: livros em HTML (próprios e Wikilivros) e PDFs com licença aberta */
function todos() {
  var a = LIVROS.map((b) => ({
    t: b.t,
    a: b.a,
    area: b.area,
    tema: b.proprio ? "Livro do Bancada" : "Wikilivros",
    formato: "Texto",
    l: b.l,
    nivel: b.nivel,
    i: "PT",
    proprio: b.proprio,
    vol: b.vol,
    href: "#/ler/" + b.id + "/1",
    caps: b.caps.length + " capítulos",
  }));
  var p = PDFS.map((b) => ({
    t: b.t,
    a: b.a,
    area: b.area,
    tema: "PDF",
    formato: "PDF",
    l: b.l,
    nivel: b.nivel,
    i: b.i,
    capa: b.capa,
    href: "#/pdf/" + b.id,
    caps: b.paginas + " páginas",
  }));
  return a.concat(p);
}
function bookCard(b) {
  if (!b.href) b = todos().filter((x) => x.t === b.t)[0];
  var tg = h("div", "tags");
  if (b.nivel) tg.appendChild(h("span", "tag", b.nivel));
  tg.appendChild(h("span", "tag", b.formato));
  if (b.i === "EN") tg.appendChild(h("span", "tag", "Inglês"));
  if (b.l) tg.appendChild(h("span", "tag lic", b.l));
  var meta = h("div", "meta", [ln(b.href, "bt", b.t), b.a ? h("span", "by", b.a) : null, h("span", "by", b.caps), tg]);
  return h("div", "book", [cover(b, b.href), meta]);
}
function vBiblioteca(foco) {
  var all = todos(),
    ar = "",
    nv = "",
    q = h("input", "search"),
    ca = h("div", "chips"),
    cn = h("div", "chips"),
    ct = h("p", "count"),
    grid = h("div", "books"),
    cont = { "": all.length };
  q.id = "qb";
  q.type = "search";
  q.placeholder = "Buscar título, autor ou tema (ex.: memória, Python, Linux)";
  q.setAttribute("aria-label", "Buscar na biblioteca");
  all.forEach((b) => {
    cont[b.area] = (cont[b.area] || 0) + 1;
  });
  var areas = [""].concat(
    Object.keys(cont)
      .filter(Boolean)
      .sort((a, b) => cont[b] - cont[a]),
  );
  var syncA = chipRow(
    ca,
    areas,
    () => ar,
    (v) => {
      ar = v;
      d();
    },
    cont,
  );
  var syncN = chipRow(
    cn,
    [""].concat(NIV),
    () => nv,
    (v) => {
      nv = v;
      d();
    },
  );
  var fm = "",
    cf = h("div", "chips"),
    syncF = chipRow(
      cf,
      ["", "Texto", "PDF"],
      () => fm,
      (v) => {
        fm = v;
        d();
      },
    );
  function d() {
    syncA();
    syncN();
    syncF();
    var s = q.value.trim().toLowerCase();
    grid.textContent = "";
    var r = all.filter(
      (b) =>
        (!ar || b.area === ar) &&
        (!nv || b.nivel === nv) &&
        (!fm || b.formato === fm) &&
        (!s || (b.t + " " + b.a + " " + b.tema + " " + b.area).toLowerCase().indexOf(s) > -1),
    );
    ct.textContent = (r.length === 1 ? "1 livro" : r.length + " livros") + (nv ? " · nível " + nv.toLowerCase() : "");
    if (!r.length) grid.appendChild(h("p", "txt", "Nada encontrado. Tente outra palavra ou limpe os filtros."));
    r.forEach((b, i) => {
      var c = bookCard(b);
      c.style.setProperty("--i", Math.min(i, 16));
      grid.appendChild(c);
    });
  }
  q.oninput = d;
  d();
  if (foco)
    setTimeout(() => {
      q.focus();
    }, 0);
  var src = h("p", "src", [
    "Todos os livros abrem aqui no Bancada. Os livros em texto são do Bancada (CC BY-SA 4.0) ou do ",
    ln("https://pt.wikibooks.org", "", "Wikilivros"),
    " (CC BY-SA 4.0), com crédito em cada capítulo. Os PDFs vêm de autores e repositórios como o ",
    ln("https://educapes.capes.gov.br", "", "eduCAPES"),
    ", sempre com licença aberta conferida no próprio arquivo, e são mostrados sem alteração. Clique em ",
    h("b", null, "Página oficial"),
    " no leitor para ver a origem de cada um.",
  ]);
  return page(
    "Biblioteca",
    "Leia tudo aqui.",
    "Livros gratuitos e de licença aberta, do básico ao avançado, para ler no próprio site, em texto ou PDF.",
    [q, h("div", "label", "Área"), ca, h("div", "label", "Nível"), cn, h("div", "label", "Formato"), cf, ct, grid, src],
  );
}

/* ---------- leitor ---------- */
var POS = "bancada-leitura";
function vLer(id, n) {
  var b = LIVROS.filter((x) => x.id === id)[0];
  if (!b) return null;
  n = Math.min(Math.max(1, +n || 1), b.caps.length);
  var c = b.caps[n - 1];
  try {
    var m = JSON.parse(localStorage.getItem(POS) || "{}");
    m[id] = n;
    localStorage.setItem(POS, JSON.stringify(m));
  } catch (e) {}
  var ol = h("ol");
  b.caps.forEach((x, i) => {
    var a = ln("#/ler/" + id + "/" + (i + 1), null, x.t);
    a.dataset.n = pad(i + 1);
    a.setAttribute("aria-current", String(i + 1 === n));
    ol.appendChild(h("li", null, [a]));
  });
  var toc = h("aside", "toc", [
    cover(b),
    h("div", null, [h("b", null, b.t), h("div", "by", [b.nivel + " · " + b.caps.length + " capítulos"])]),
    ol,
  ]);
  var body = h("div", "body");
  body.innerHTML = c.html;
  var art = h("article", "prose", [
    h("div", "chap", "Capítulo " + n + " de " + b.caps.length),
    h("h1", null, c.t),
    h("p", "by", b.t + " · " + b.a + (b.revisado ? " · revisado em " + b.revisado : "")),
  ]);
  if (b.aviso) art.appendChild(h("div", "warn", b.aviso));
  if (!b.proprio)
    art.appendChild(
      h(
        "div",
        "warn",
        "As imagens do original não foram trazidas. Se um trecho citar uma figura, veja o capítulo no Wikilivros pelo link no fim da página.",
      ),
    );
  art.appendChild(body);
  var nav = h("div", "chapnav");
  if (n > 1)
    nav.appendChild(
      ln("#/ler/" + id + "/" + (n - 1), null, [h("span", null, "← Anterior"), h("b", null, b.caps[n - 2].t)]),
    );
  if (n < b.caps.length)
    nav.appendChild(ln("#/ler/" + id + "/" + (n + 1), "nx", [h("span", null, "Próximo →"), h("b", null, b.caps[n].t)]));
  art.appendChild(nav);
  art.appendChild(
    b.proprio
      ? h(
          "p",
          "credit",
          "Texto original do Bancada, licença CC BY-SA 4.0. Pode copiar e adaptar, dando crédito e mantendo a mesma licença.",
        )
      : h("p", "credit", [
          "Texto de ",
          ln(b.fonte + "/" + encodeURIComponent(c.t.replace(/ /g, "_")), "", "“" + c.t + "”"),
          " no livro ",
          ln(b.fonte, "", b.t),
          " do Wikilivros, por colaboradores do projeto, licença CC BY-SA 4.0. Adaptado pelo Bancada: formatação simplificada, imagens e predefinições removidas. Importado em " +
            b.importado +
            ".",
        ]),
  );
  setDots(b.caps.length, n - 1, (j) => {
    location.hash = "#/ler/" + id + "/" + (j + 1);
  });
  return h("div", "wrap reader", [toc, art]);
}

/* ---------- leitor de PDF (PDF.js, carregado só quando alguém abre um PDF) ---------- */
var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
function carregarScript(src) {
  return new Promise((ok, erro) => {
    if (document.querySelector('script[src="' + src + '"]')) return ok();
    var s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = erro;
    document.head.appendChild(s);
  });
}
function pdfLib() {
  /* o worker roda como script comum: o PDF.js usa o "worker falso" na própria página */
  return carregarScript(PDFJS + "pdf.min.js")
    .then(() => carregarScript(PDFJS + "pdf.worker.min.js"))
    .then(() => window.pdfjsLib);
}
function vPdf(id, pg) {
  var b = PDFS.filter((x) => x.id === id)[0];
  if (!b) return null;
  var salvo = 1;
  try {
    salvo = +JSON.parse(localStorage.getItem(POS) || "{}")["pdf:" + id] || 1;
  } catch (e) {}
  var ini = Math.min(Math.max(1, +pg || salvo), b.paginas),
    zoom = 1,
    doc = null,
    slots = [],
    feitos = {},
    vivo = true,
    atual = ini;
  var inp = h("input");
  inp.id = "pg";
  inp.type = "number";
  inp.min = 1;
  inp.max = b.paginas;
  inp.value = ini;
  inp.setAttribute("aria-label", "Página");
  var ant = h("button", null, "‹"),
    prox = h("button", null, "›"),
    menos = h("button", null, "−"),
    mais = h("button", null, "+"),
    larg = h("button", null, "Largura");
  ant.setAttribute("aria-label", "Página anterior");
  prox.setAttribute("aria-label", "Próxima página");
  menos.setAttribute("aria-label", "Diminuir zoom");
  mais.setAttribute("aria-label", "Aumentar zoom");
  var bar = h("div", "pdf-bar", [
    h("div", "pdf-t", [h("b", null, b.t), h("span", null, b.a)]),
    h("div", "pdf-ctl", [
      ant,
      h("label", "pdf-pg", [inp, h("span", null, " / " + b.paginas)]),
      prox,
      h("span", "sep"),
      menos,
      larg,
      mais,
    ]),
  ]);
  var folhas = h("div", "pdf-folhas"),
    status = h("p", "pdf-status", "Abrindo o PDF…");
  var info = h("div", "pdf-info", [
    cover(b),
    h("div", null, [
      h("div", "eyebrow", b.nivel + " · " + b.area),
      h("h1", null, b.t),
      h("p", "by", b.a),
      h("div", "tags", [
        h("span", "tag", "PDF · " + b.paginas + " páginas"),
        h("span", "tag lic", b.l),
        b.i === "EN" ? h("span", "tag", "Inglês") : null,
      ]),
      h("p", "credit", [
        "Distribuído pelo Bancada sem alterações, conforme a licença ",
        b.l,
        ". ",
        ln(b.fonte, "", "Página oficial ↗"),
      ]),
    ]),
  ]);
  function irPara(n, suave) {
    n = Math.min(Math.max(1, n), b.paginas);
    var s = slots[n - 1];
    if (s)
      window.scrollTo({
        top: s.getBoundingClientRect().top + window.scrollY - 130,
        behavior: suave ? "smooth" : "auto",
      });
  }
  function guardar(n) {
    atual = n;
    inp.value = n;
    try {
      var m = JSON.parse(localStorage.getItem(POS) || "{}");
      m["pdf:" + id] = n;
      localStorage.setItem(POS, JSON.stringify(m));
    } catch (e) {}
  }
  function desenhar(n) {
    if (feitos[n] || !doc) return;
    feitos[n] = "…";
    doc
      .getPage(n)
      .then((p) => {
        if (!vivo) return;
        var s = slots[n - 1],
          w = s.clientWidth,
          v0 = p.getViewport({ scale: 1 }),
          esc = w / v0.width,
          dpr = Math.min(window.devicePixelRatio || 1, 2),
          v = p.getViewport({ scale: esc * dpr });
        s.style.aspectRatio = v0.width + "/" + v0.height;
        var c = h("canvas");
        c.width = v.width;
        c.height = v.height;
        return p.render({ canvasContext: c.getContext("2d"), viewport: v }).promise.then(() => {
          if (!vivo || feitos[n] !== "…") return;
          s.textContent = "";
          s.appendChild(c);
          s.classList.add("ok");
          feitos[n] = c;
          /* camadas: marcações por baixo do texto invisível (que permite selecionar) e os ícones de comentário por cima */
          var tl = h("div", "textLayer");
          tl.style.setProperty("--scale-factor", esc);
          s.appendChild(h("div", "pdf-marcas"));
          s.appendChild(tl);
          s.appendChild(h("div", "pdf-icones"));
          desenharMarcas(n);
          return p.getTextContent().then((tc) => {
            if (vivo && feitos[n] === c)
              return window.pdfjsLib.renderTextLayer({
                textContentSource: tc,
                container: tl,
                viewport: p.getViewport({ scale: esc }),
                textDivs: [],
              }).promise;
          });
        });
      })
      .catch(() => {
        if (feitos[n] === "…") feitos[n] = null;
      });
  }
  function limparLonge() {
    Object.keys(feitos).forEach((k) => {
      if (Math.abs(k - atual) > 8 && feitos[k] && feitos[k] !== "…") {
        slots[k - 1].textContent = String(k);
        slots[k - 1].classList.remove("ok");
        delete feitos[k];
      }
    });
  }
  var obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) desenhar(+e.target.dataset.n);
      });
    },
    { rootMargin: "900px 0px" },
  );
  function aplicarZoom() {
    folhas.style.setProperty("--z", zoom);
    Object.keys(feitos).forEach((k) => {
      slots[k - 1].textContent = String(k);
      slots[k - 1].classList.remove("ok");
    });
    feitos = {};
    slots.forEach((s) => {
      obs.unobserve(s);
      obs.observe(s);
    });
    setTimeout(() => {
      irPara(atual);
    }, 30);
  }
  ant.onclick = () => {
    irPara(atual - 1, true);
  };
  prox.onclick = () => {
    irPara(atual + 1, true);
  };
  inp.onchange = () => {
    irPara(+inp.value, true);
  };
  menos.onclick = () => {
    zoom = Math.max(0.5, +(zoom - 0.15).toFixed(2));
    aplicarZoom();
  };
  mais.onclick = () => {
    zoom = Math.min(2, +(zoom + 0.15).toFixed(2));
    aplicarZoom();
  };
  larg.onclick = () => {
    zoom = 1;
    aplicarZoom();
  };
  var rolar = () => {
    var y = 130,
      melhor = atual;
    for (var i = 0; i < slots.length; i++) {
      var r = slots[i].getBoundingClientRect();
      if (r.bottom > y) {
        melhor = i + 1;
        break;
      }
    }
    if (melhor !== atual) {
      guardar(melhor);
      limparLonge();
    }
  };
  var tick = 0,
    onScroll = () => {
      if (tick) return;
      tick = requestAnimationFrame(() => {
        tick = 0;
        rolar();
      });
    };
  window.addEventListener("scroll", onScroll, { passive: true });
  function tecla(e) {
    if (e.key === "Escape") {
      fecharPop();
      fecharCaderno();
      modoPara(null);
      return;
    }
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight" || (e.key === "PageDown" && e.altKey)) {
      irPara(atual + 1, true);
    } else if (e.key === "ArrowLeft") {
      irPara(atual - 1, true);
    }
  }
  document.addEventListener("keydown", tecla);
  /* ---- anotações: marcador em 3 cores, comentários em trechos e bloco de notas, salvos neste navegador ---- */
  var CORES = { a: ["#ffd84d", "amarelo"], v: ["#7be08f", "verde"], r: ["#ff8fb3", "rosa"] },
    ANOT = "bancada:anotacoes",
    an = { m: [], n: "" },
    modo = null,
    pend = null,
    ultimoPonteiro = "mouse";
  try {
    var t0 = JSON.parse(localStorage.getItem(ANOT) || "{}")["pdf:" + id];
    if (t0) an = { m: t0.m || [], n: t0.n || "" };
  } catch (e) {}
  function salvarAnot() {
    try {
      var t = JSON.parse(localStorage.getItem(ANOT) || "{}");
      t["pdf:" + id] = an;
      localStorage.setItem(ANOT, JSON.stringify(t));
    } catch (e) {}
  }
  var SVG = {
    com: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    notas:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 3.5h10l4 4v13H5z"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg>',
    lista:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  function bIco(cls, ico, rot, txt) {
    var x = h("button", cls, txt ? [h("i"), h("span", null, txt)] : [h("i")]);
    x.type = "button";
    x.querySelector("i").outerHTML = SVG[ico];
    x.setAttribute("aria-label", rot);
    x.title = rot;
    return x;
  }
  function curto(t, n) {
    t = String(t || "").replace(/\s+/g, " ");
    return t.length > n ? t.slice(0, n - 1) + "…" : t;
  }
  function desenharMarcas(n) {
    var s = slots[n - 1];
    if (!s || !s.classList.contains("ok")) return;
    var cam = s.querySelector(".pdf-marcas"),
      ic = s.querySelector(".pdf-icones");
    if (!cam) return;
    cam.textContent = "";
    ic.textContent = "";
    an.m.forEach((m, i) => {
      if (m.p !== n) return;
      m.r.forEach((r) => {
        var d = h("div", "amk" + (m.c === "c" ? " amk-c" : ""));
        if (m.c !== "c") d.style.background = CORES[m.c][0];
        d.style.cssText +=
          ";left:" + r[0] * 100 + "%;top:" + r[1] * 100 + "%;width:" + r[2] * 100 + "%;height:" + r[3] * 100 + "%";
        cam.appendChild(d);
      });
      if (m.nota) {
        var u = m.r[m.r.length - 1],
          b = bIco("amk-ic", "com", "Ver comentário");
        b.style.left = (u[0] + u[2]) * 100 + "%";
        b.style.top = u[1] * 100 + "%";
        b.onclick = (e) => {
          e.stopPropagation();
          abrirMarca(i);
        };
        ic.appendChild(b);
      }
    });
  }
  /* seleção atual -> retângulos normalizados (0 a 1) dentro da página, juntando os pedaços da mesma linha */
  function capturar() {
    var sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return null;
    var rg = sel.getRangeAt(0),
      el = rg.startContainer.nodeType === 1 ? rg.startContainer : rg.startContainer.parentNode,
      f = el && el.closest && el.closest(".folha");
    if (!f || !folhas.contains(f)) return null;
    var fr = f.getBoundingClientRect(),
      rs = [];
    Array.prototype.forEach.call(rg.getClientRects(), (r) => {
      if (
        r.width < 1 ||
        r.height < 1 ||
        r.bottom < fr.top ||
        r.top > fr.bottom ||
        r.right < fr.left ||
        r.left > fr.right
      )
        return;
      rs.push([(r.left - fr.left) / fr.width, (r.top - fr.top) / fr.height, r.width / fr.width, r.height / fr.height]);
    });
    var j = juntarRetangulos(rs);
    var t = sel.toString().trim();
    if (!t || !j.length) return null;
    return { p: +f.dataset.n, r: j, t: t.slice(0, 500) };
  }
  function aplicar(c) {
    if (!c || !modo) return;
    getSelection().removeAllRanges();
    okBt.hidden = true;
    pend = null;
    if (modo === "c") {
      editarNota(c, null);
      return;
    }
    c.c = modo;
    an.m.push(c);
    salvarAnot();
    desenharMarcas(c.p);
    atualizarListas();
  }
  /* balão que fica dentro da própria página, perto do trecho */
  var popAtual = null;
  function fecharPop() {
    if (popAtual) {
      popAtual.remove();
      popAtual = null;
    }
  }
  function pop(m, filhos) {
    fecharPop();
    var f = slots[m.p - 1];
    if (!f) return;
    var u = m.r[m.r.length - 1],
      fw = f.clientWidth,
      w = Math.min(300, fw - 16),
      p = h("div", "anot-pop", filhos);
    p.style.width = w + "px";
    p.style.left = Math.max(8, Math.min(fw - w - 8, (u[0] + u[2] / 2) * fw - w / 2)) + "px";
    p.style.top = (u[1] + u[3]) * f.clientHeight + 8 + "px";
    f.appendChild(p);
    popAtual = p;
    return p;
  }
  function editarNota(m, i) {
    var ta = h("textarea");
    ta.rows = 3;
    ta.placeholder = "Escreva seu comentário sobre este trecho";
    ta.value = i == null ? "" : an.m[i].nota || "";
    var ok = h("button", "bt-mini on", "Salvar"),
      nao = h("button", "bt-mini", "Cancelar");
    ok.type = nao.type = "button";
    nao.onclick = fecharPop;
    ok.onclick = () => {
      var v = ta.value.trim();
      if (i == null) {
        if (!v) {
          fecharPop();
          return;
        }
        m.c = "c";
        m.nota = v;
        an.m.push(m);
      } else an.m[i].nota = v || undefined;
      salvarAnot();
      fecharPop();
      desenharMarcas(m.p);
      atualizarListas();
    };
    pop(m, [h("p", "ap-t", "“" + curto(m.t, 90) + "”"), ta, h("div", "ap-acoes", [nao, ok])]);
    setTimeout(() => {
      ta.focus();
    }, 30);
  }
  function abrirMarca(i) {
    var m = an.m[i],
      cores = h("div", "ap-cores");
    Object.keys(CORES).forEach((k) => {
      var b = h("button", "fr-cor");
      b.type = "button";
      b.style.setProperty("--c", CORES[k][0]);
      b.setAttribute("aria-label", "Trocar para " + CORES[k][1]);
      b.setAttribute("aria-pressed", String(m.c === k));
      b.onclick = () => {
        m.c = k;
        salvarAnot();
        desenharMarcas(m.p);
        atualizarListas();
        fecharPop();
      };
      cores.appendChild(b);
    });
    var com = h("button", "bt-mini", m.nota ? "Editar comentário" : "Comentar"),
      rem = h("button", "bt-mini", "Remover");
    com.type = rem.type = "button";
    com.onclick = () => {
      editarNota(m, i);
    };
    rem.onclick = () => {
      an.m.splice(i, 1);
      salvarAnot();
      fecharPop();
      desenharMarcas(m.p);
      atualizarListas();
    };
    pop(m, [
      h("p", "ap-t", "“" + curto(m.t, 90) + "”"),
      m.nota ? h("p", "ap-nota", m.nota) : null,
      h("div", "ap-acoes", [cores, com, rem]),
    ]);
  }
  /* clique numa marcação existente abre o balão dela */
  folhas.addEventListener("click", (e) => {
    if (e.target.closest(".anot-pop,.amk-ic")) return;
    var sel = getSelection();
    if (sel && !sel.isCollapsed) return;
    var f = e.target.closest(".folha");
    if (!f) return;
    var r = f.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height,
      n = +f.dataset.n,
      ach = -1;
    an.m.forEach((m, i) => {
      if (m.p === n && m.r.some((q) => x >= q[0] && x <= q[0] + q[2] && y >= q[1] && y <= q[1] + q[3])) ach = i;
    });
    if (ach >= 0) abrirMarca(ach);
    else fecharPop();
  });
  folhas.addEventListener("pointerdown", (e) => {
    ultimoPonteiro = e.pointerType;
  });
  folhas.addEventListener("pointerup", (e) => {
    if (modo && e.pointerType === "mouse")
      setTimeout(() => {
        aplicar(capturar());
      }, 0);
  });
  /* no toque a seleção termina sem pointerup confiável: mostra um botão para confirmar */
  var okBt = h("button", "anot-ok", "Marcar trecho");
  okBt.type = "button";
  okBt.hidden = true;
  okBt.addEventListener("pointerdown", (e) => {
    e.preventDefault();
  });
  okBt.onclick = () => {
    aplicar(pend);
  };
  var selT = 0;
  function aoSelecionar() {
    clearTimeout(selT);
    selT = setTimeout(() => {
      if (!modo || ultimoPonteiro === "mouse") {
        okBt.hidden = true;
        return;
      }
      pend = capturar();
      okBt.hidden = !pend;
      okBt.textContent = modo === "c" ? "Comentar trecho" : "Marcar trecho";
    }, 250);
  }
  document.addEventListener("selectionchange", aoSelecionar);
  /* ferramentas: lateral no computador, pílula no celular (o mesmo elemento, o CSS decide) */
  var dica = h("p", "fr-dica"),
    botoesModo = {};
  dica.hidden = true;
  function modoPara(k) {
    modo = modo === k ? null : k;
    Object.keys(botoesModo).forEach((x) => {
      botoesModo[x].setAttribute("aria-pressed", String(x === modo));
    });
    folhas.classList.toggle("anotando", !!modo);
    dica.hidden = !modo;
    dica.textContent = !modo
      ? ""
      : modo === "c"
        ? "Selecione um trecho para comentar"
        : "Selecione um trecho para marcar em " + CORES[modo][1];
    if (!modo) {
      okBt.hidden = true;
      pend = null;
    }
  }
  var cores = h("div", "fr-cores");
  Object.keys(CORES).forEach((k) => {
    var b = h("button", "fr-cor");
    b.type = "button";
    b.style.setProperty("--c", CORES[k][0]);
    b.setAttribute("aria-label", "Marcador " + CORES[k][1]);
    b.title = "Marcador " + CORES[k][1];
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => {
      modoPara(k);
    };
    botoesModo[k] = b;
    cores.appendChild(b);
  });
  var bCom = bIco("fr-bt", "com", "Comentar um trecho", "Comentar");
  bCom.setAttribute("aria-pressed", "false");
  bCom.onclick = () => {
    modoPara("c");
  };
  botoesModo.c = bCom;
  var bNotas = bIco("fr-bt", "notas", "Abrir o bloco de notas", "Notas");
  bNotas.onclick = () => {
    abrirCaderno("n");
  };
  var bLista = bIco("fr-bt so-cel", "lista", "Ver marcações", "Marcações");
  bLista.onclick = () => {
    abrirCaderno("m");
  };
  var listaLado = h("div", "fr-lista"),
    contLado = h("span", "fr-n");
  var ferr = h("aside", "pdf-ferr", [
    h("h3", "so-pc", ["Marcador"]),
    cores,
    h("span", "fr-sep"),
    bCom,
    bNotas,
    bLista,
    dica,
    h("h3", "so-pc fr-h-lista", ["Marcações ", contLado]),
    listaLado,
  ]);
  ferr.setAttribute("aria-label", "Ferramentas de leitura");
  function preencher(cx) {
    cx.textContent = "";
    if (!an.m.length) {
      cx.appendChild(h("p", "fr-vazio", "Nada marcado ainda. Escolha uma cor ou Comentar e selecione um trecho."));
      return;
    }
    an.m
      .map((m, i) => [m, i])
      .sort((a, b) => a[0].p - b[0].p || a[0].r[0][1] - b[0].r[0][1])
      .forEach((par) => {
        var m = par[0],
          it = h("button", "fr-item", [
            h("i"),
            h("span", null, [h("b", null, "p. " + m.p + " "), "“" + curto(m.t, 70) + "”"]),
            m.nota ? h("em", null, curto(m.nota, 90)) : null,
          ]);
        it.type = "button";
        var bola = it.querySelector("i");
        if (m.c === "c") bola.className = "c";
        else bola.style.background = CORES[m.c][0];
        it.onclick = () => {
          fecharCaderno();
          irPara(m.p, true);
          setTimeout(() => {
            abrirMarca(par[1]);
          }, 500);
        };
        cx.appendChild(it);
      });
  }
  /* caderno: bloco de notas e lista de marcações num pop-up que abre e fecha */
  var ta = h("textarea", "cad-ta");
  ta.placeholder = "Suas anotações sobre este livro. Tudo fica salvo neste navegador.";
  ta.value = an.n;
  var salvoTx = h("span", "cad-salvo", an.n ? "Salvo" : "");
  var tSalva = 0;
  ta.oninput = () => {
    salvoTx.textContent = "Salvando…";
    clearTimeout(tSalva);
    tSalva = setTimeout(() => {
      an.n = ta.value;
      salvarAnot();
      salvoTx.textContent = "Salvo";
    }, 400);
  };
  var abaN = h("button", "cad-aba", "Notas"),
    abaM = h("button", "cad-aba", "Marcações"),
    listaCad = h("div", "fr-lista"),
    fechaCad = bIco("icon-btn", "x", "Fechar");
  abaN.type = abaM.type = "button";
  var corpoN = h("div", "cad-corpo", [ta, salvoTx]),
    corpoM = h("div", "cad-corpo", [listaCad]);
  var caderno = h("div", "caderno", [
    h("div", "cad-topo", [h("div", "cad-abas", [abaN, abaM]), fechaCad]),
    corpoN,
    corpoM,
  ]);
  caderno.hidden = true;
  caderno.setAttribute("role", "dialog");
  caderno.setAttribute("aria-label", "Caderno do livro");
  function abrirCaderno(qual) {
    var sel = qual === "m";
    abaN.setAttribute("aria-selected", String(!sel));
    abaM.setAttribute("aria-selected", String(sel));
    corpoN.hidden = sel;
    corpoM.hidden = !sel;
    if (!caderno.hidden && caderno.dataset.aba === qual) {
      fecharCaderno();
      return;
    }
    caderno.dataset.aba = qual;
    caderno.hidden = false;
    bNotas.setAttribute("aria-expanded", String(!sel));
    bLista.setAttribute("aria-expanded", String(sel));
    if (!sel)
      setTimeout(() => {
        ta.focus();
      }, 60);
  }
  function fecharCaderno() {
    if (caderno.hidden) return;
    an.n = ta.value;
    salvarAnot();
    caderno.hidden = true;
    bNotas.setAttribute("aria-expanded", "false");
    bLista.setAttribute("aria-expanded", "false");
  }
  abaN.onclick = () => {
    abrirCaderno("n");
  };
  abaM.onclick = () => {
    abrirCaderno("m");
  };
  fechaCad.onclick = fecharCaderno;
  function atualizarListas() {
    preencher(listaLado);
    preencher(listaCad);
    contLado.textContent = an.m.length ? String(an.m.length) : "";
  }
  atualizarListas();
  limpar.push(() => {
    vivo = false;
    obs.disconnect();
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("keydown", tecla);
    document.removeEventListener("selectionchange", aoSelecionar);
    an.n = ta.value;
    salvarAnot();
    if (doc) doc.destroy();
  });
  for (var i = 1; i <= b.paginas; i++) {
    var s = h("div", "folha", String(i));
    s.dataset.n = i;
    slots.push(s);
    folhas.appendChild(s);
  }
  pdfLib()
    .then((lib) => lib.getDocument({ url: b.arquivo, disableRange: true, disableStream: true }).promise)
    .then((d) => {
      if (!vivo) {
        d.destroy();
        return;
      }
      doc = d;
      status.remove();
      slots.forEach((s) => {
        obs.observe(s);
      });
      setTimeout(() => {
        irPara(ini);
      }, 60);
    })
    .catch(() => {
      status.textContent =
        "Não foi possível abrir este PDF agora. Tente recarregar a página ou veja a página oficial do livro.";
    });
  return h("div", "wrap pg leitor-pdf", [info, bar, status, h("div", "pdf-corpo", [folhas, ferr]), caderno, okBt]);
}

/* ---------- rotas ---------- */
var app = document.getElementById("app"),
  links = document.querySelectorAll("nav.main a, #menu-mob a");
function route() {
  limpar.splice(0).forEach((f) => {
    try {
      f();
    } catch (e) {}
  });
  var p = location.hash.replace(/^#\/?/, "").split("/"),
    r = p[0],
    n,
    t,
    sec = r;
  dots.textContent = "";
  if (r === "trilhas") {
    n = p[2] ? vModulo(p[1], p[2]) : p[1] ? vTrilha(p[1]) : vTrilhas();
    if (!n) n = vTrilhas();
    t = "Trilhas";
  } else if (r === "questoes") {
    n = vQuestoes();
    t = "Banco de questões";
    sec = "trilhas";
  } else if (r === "guias") {
    n = vGuias();
    t = "Guias";
  } else if (r === "glossario") {
    n = vGlos(p[1] ? decodeURIComponent(p[1]) : "");
    t = "Glossário";
  } else if (r === "jogo") {
    n = vJogo();
    t = "Gargalo";
  } else if (r === "fichas") {
    n = vPecas();
    t = "Peças";
    sec = "pecas";
  } else if (r === "biblioteca") {
    n = vBiblioteca(p[1] === "buscar");
    t = "Biblioteca";
  } else if (r === "ler" && (n = vLer(p[1], p[2]))) {
    t = LIVROS.filter((x) => x.id === p[1])[0].t;
    sec = "biblioteca";
  } else if (r === "pdf" && (n = vPdf(p[1], p[2]))) {
    t = PDFS.filter((x) => x.id === p[1])[0].t;
    sec = "biblioteca";
  } else if (r === "pecas") {
    var a = P.filter((x) => x.id === p[1])[0];
    n = a ? vArtigo(a) : vPecas();
    t = a ? a.n : "Peças";
  } else {
    n = vHome();
    t = null;
    sec = "";
  }
  app.textContent = "";
  app.classList.remove("saindo");
  app.appendChild(n);
  ["books", "parts", "tiles", "shelf", "levels", "mods", "fichas", "qlist", "stats"].forEach((c) => {
    app.querySelectorAll("." + c).forEach((g) => {
      Array.prototype.forEach.call(g.children, (el, i) => {
        el.style.setProperty("--i", Math.min(i, 14));
      });
    });
  });
  document.title = t ? "Bancada · " + t : "Bancada";
  links.forEach((a) => {
    if (a.dataset.r === sec) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  contar(app);
}
/* números das categorias sobem de zero quando a página abre */
function contar(raiz) {
  if (calmo) return;
  raiz.querySelectorAll(".cat em").forEach((em) => {
    var m = em.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    var fim = +m[1],
      resto = m[2],
      t0 = performance.now();
    (function passo(t) {
      var k = Math.min(1, (t - t0) / 900),
        v = Math.round(fim * (1 - (1 - k) ** 3));
      em.textContent = v + resto;
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  });
}
/* cabeçalho compacta ao rolar; barra fina no topo durante a troca de aba */
var topo = document.querySelector("header.top"),
  barra = document.createElement("div");
barra.id = "barra-nav";
document.body.appendChild(barra);
window.addEventListener(
  "scroll",
  () => {
    topo.classList.toggle("rolou", scrollY > 24);
  },
  { passive: true },
);
window.addEventListener("hashchange", () => {
  barra.classList.remove("vai");
  void barra.offsetWidth;
  barra.classList.add("vai");
});
/* troca de aba: a página atual sai rápido antes da nova entrar */
var calmo = matchMedia("(prefers-reduced-motion: reduce)").matches,
  trocando = 0;
window.addEventListener("hashchange", () => {
  if (calmo || !app.firstChild) {
    route();
    return;
  }
  clearTimeout(trocando);
  app.classList.add("saindo");
  trocando = setTimeout(route, 150);
});
route();
