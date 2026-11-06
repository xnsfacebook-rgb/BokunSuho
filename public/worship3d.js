/* 복운수호 — 3D 불공 (three.js, 불자 12명, 탁 트인 마당) */
(function () {
'use strict';
var vp = document.getElementById('w3d-viewport');
if (!vp) return;
function $(id) { return document.getElementById(id); }

/* ================= 부처님 말씀 ================= */
var WORDS = [
    '마음에 자비를 품는 자에게 복이 깃듭니다. 오늘도 부드러운 마음으로 하루를 여세요.',
    '서두르지 마십시오. 연꽃도 때가 되어야 피어납니다.',
    '남을 미워하는 마음은 먼저 내 마음을 태웁니다. 놓아주면 내가 먼저 편해집니다.',
    '작은 선행 하나가 큰 그늘을 만듭니다. 오늘 누군가에게 따뜻한 말을 건네보세요.',
    '갖지 못한 것을 세지 말고, 가진 것에 감사하십시오. 감사하는 마음이 부자의 마음입니다.',
    '화는 잠깐의 손님이고, 평온은 집주인입니다. 손님에게 집을 내주지 마십시오.',
    '남의 허물을 보기 전에 내 마음의 거울을 먼저 닦으십시오.',
    '인내는 쓰지만 그 열매는 답니다. 오늘의 기다림이 내일의 기쁨이 됩니다.',
    '말 한마디가 천 냥 빚을 갚는다는 것을 기억하십시오. 부드러운 말이 복을 부릅니다.',
    '과거는 지나간 구름, 미래는 오지 않은 바람. 지금 이 순간에 충실하십시오.',
    '남을 이기려 하지 말고 어제의 나를 이기십시오. 그것이 진짜 승리입니다.',
    '베푸는 손은 비지 않습니다. 나누면 나눌수록 마음은 풍요로워집니다.',
    '고통은 스승입니다. 아픔을 통해 배우는 자는 지혜로워집니다.',
    '남을 판단하기 전에 그의 신발을 신어보십시오. 이해가 자비의 시작입니다.',
    '마음이 고요하면 세상도 고요해집니다. 밖을 탓하기 전에 안을 먼저 살피십시오.',
    '오늘 하루 감사할 일 세 가지를 떠올려보십시오. 마음이 따뜻해질 것입니다.',
    '욕심을 내려놓으면 얻을 것이 더 많아집니다. 빈 손이 가장 많은 것을 쥡니다.',
    '어둠을 탓하지 말고 작은 등불 하나를 켜십시오. 그것이 당신의 역할입니다.',
    '참된 강함은 부드러움에 있습니다. 물이 바위를 뚫는 것을 보십시오.',
    '남에게 대접받고 싶은 대로 남을 대접하십시오. 그것이 복 짓는 길입니다.',
    '실패는 끝이 아니라 방향을 바꾸라는 신호입니다. 다시 일어나십시오.',
    '남의 행복을 진심으로 빌어주는 마음이 나에게도 행복을 가져옵니다.',
    '하루에 한 번은 하늘을 올려다보십시오. 마음이 넓어집니다.',
    '가장 큰 적은 밖에 있지 않고 내 마음 안에 있습니다. 마음을 다스리십시오.',
    '친절은 돈 들지 않는 가장 값진 보시입니다. 오늘도 친절을 나누십시오.',
    '기다릴 줄 아는 자에게 좋은 것이 옵니다. 조급함은 복을 밀어냅니다.',
    '남을 용서하는 것은 상대를 위한 것이 아니라 나를 위한 선물입니다.',
    '작은 일에 성실한 자에게 큰 일이 맡겨집니다. 지금 하는 일에 정성을 다하십시오.',
    '마음의 밭에 좋은 씨앗을 뿌리십시오. 뿌린 대로 거두는 것이 세상의 이치입니다.',
    '오늘 당신이 웃으면 세상도 함께 웃습니다. 미소는 가장 아름다운 공양입니다.'
  ];
var lastWordIdx = -1;

/* ================= 종소리 ================= */
var actx = null, muted = false;
function ensureAudio() {
  if (!actx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
  }
  return actx;
}
function playBell(volume, freqBase) {
  if (muted) return;
  var c = ensureAudio();
  if (!c) return;
  try {
    if (c.state === 'suspended' && typeof c.resume === 'function') c.resume();
    var t = c.currentTime;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    g.connect(c.destination);
    var o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freqBase, t);
    o.connect(g); o.start(t); o.stop(t + 3.0);
    var o2 = c.createOscillator(); o2.type = 'sine';
    o2.frequency.setValueAtTime(freqBase * 1.004, t);
    var g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.35), t + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o2.connect(g2); g2.connect(c.destination);
    o2.start(t); o2.stop(t + 2.4);
  } catch (e) {}
}

/* ================= 공덕 (temple.html과 공유) ================= */
var LS_MERIT = 'sajubit_temple_merit';
function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
function loadMerit() {
  var m = { date: todayKey(), incense: 0, offerings: 0, bows: 0 };
  try {
    var raw = window.localStorage.getItem(LS_MERIT);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.date === m.date) { m.incense = p.incense | 0; m.offerings = p.offerings | 0; m.bows = p.bows | 0; }
    }
  } catch (e) {}
  return m;
}
function saveMerit() { try { window.localStorage.setItem(LS_MERIT, JSON.stringify(merit)); } catch (e) {} }
var merit = loadMerit();
if (merit.bows >= 108) merit.done108 = 1;
function paintMerit() { $('w3d-meritnum').textContent = merit.incense + merit.offerings + merit.bows; }
paintMerit();

/* ================= 나의 아바타 (방문객 동자승) ================= */
var LS_AVATAR = 'sajubit_avatar';
function loadAvatar() {
  try {
    var raw = window.localStorage.getItem(LS_AVATAR);
    if (raw) { var p = JSON.parse(raw); if (p && p.name) { p.isNew = false; return p; } }
  } catch (e) {}
  var adj = ['다정한', '고요한', '밝은', '따뜻한', '맑은', '자비로운', '평온한', '향기로운'];
  var noun = ['이끼', '연꽃', '달빛', '솔잎', '구름', '바람', '새벽', '별빛'];
  var a = { name: adj[(Math.random() * adj.length) | 0] + ' ' + noun[(Math.random() * noun.length) | 0], isNew: true };
  try { window.localStorage.setItem(LS_AVATAR, JSON.stringify(a)); } catch (e) {}
  return a;
}
var avatar = loadAvatar();

/* ================= 기도실 (불자 명단) ================= */
var DEVOTEES = [
  ['지광 스님', '지', '#8f8a82'], ['혜원 스님', '혜', '#848484'], ['도신 스님', '도', '#9a9590'],
  ['법연 스님', '법', '#7d7d7d'], ['명조 스님', '명', '#8a8580'], ['성안 스님', '성', '#939393'],
  ['우담 스님', '우', '#7f7b74'], ['자비 스님', '자', '#888888'], ['청허 스님', '청', '#918c85'],
  ['태고 스님', '태', '#7a7a7a'], ['일지 스님', '일', '#968f86'], ['무애 스님', '무', '#828282']
];
var AVA_PALETTE = ['#c0392b', '#2e7f8f', '#d9a62e', '#d4778e', '#5a9a5a', '#7a5f9e', '#d07a35', '#5f8fc4', '#7fb3a3', '#b74a5e', '#4f9a7d', '#c9a227'];
for (var ri = 0; ri < DEVOTEES.length; ri++) DEVOTEES[ri][2] = AVA_PALETTE[(Math.random() * AVA_PALETTE.length) | 0];
var roomGrid = $('w3d-roomgrid'), roomCount = $('w3d-roomcount');
var offeringIdx = [], meCard = null;
function paintRoom() {
  if (!roomGrid) return;
  var html = '';
  if (meCard) html += meCard;
  for (var i = 0; i < DEVOTEES.length; i++) {
    var d = DEVOTEES[i];
    var off = offeringIdx.indexOf(i) !== -1;
    html += '<div class="w3d-dev' + (off ? ' offering' : '') + '">' +
      '<div class="w3d-ava" style="background:' + d[2] + '">' + d[1] + '</div>' +
      '<div class="w3d-devname">' + d[0] + '</div>' +
      '<div class="w3d-devst">' + (off ? '향 공양 중' : '기도 중') + '</div></div>';
  }
  roomGrid.innerHTML = html;
  roomCount.textContent = '· ' + (DEVOTEES.length + (meCard ? 1 : 0)) + '명 함께';
}
function rotateOffering() {
  offeringIdx = [];
  var n = 3 + Math.floor(Math.random() * 2);
  while (offeringIdx.length < n) {
    var i = Math.floor(Math.random() * DEVOTEES.length);
    if (offeringIdx.indexOf(i) === -1) offeringIdx.push(i);
  }
  paintRoom();
}
if (roomGrid) {
  rotateOffering();
  setInterval(rotateOffering, 25000);
}
function addMeCard() {
  if (meCard) return;
  meCard = '<div class="w3d-dev me offering">' +
    '<div class="w3d-ava" style="background:linear-gradient(135deg,#e8c96a,#c9a227)">나</div>' +
    '<div class="w3d-devname">귀하</div>' +
    '<div class="w3d-devst">향 공양 중</div></div>';
  paintRoom();
}
function removeMeCard() { meCard = null; paintRoom(); }

/* ================= three.js 로드 대기 ================= */
var glBox = $('w3d-gl'), loaderBox = $('w3d-loader');
var started = false;
function fail3d(msg) {
  loaderBox.innerHTML = '<p style="padding:0 24px;line-height:2">' + msg + '</p>' +
    '<p><a href="temple.html" style="color:#c9a227">사찰 페이지에서 불공 드리기 →</a></p>';
}
function boot() {
  if (started) return;
  if ('IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { bio.disconnect(); init(); }
    }, { rootMargin: '400px' });
    bio.observe(vp);
  } else init();
}
if (window.THREE) { boot(); }
else {
  var waited = 0;
  var iv = setInterval(function () {
    waited += 500;
    if (window.THREE) { clearInterval(iv); boot(); }
    else if (waited > 9000) { clearInterval(iv); fail3d('3D를 불러오지 못했습니다.<br>인터넷 연결을 확인 후 새로고침 해주세요.'); }
  }, 500);
}

function init() {
  if (started) return; started = true;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = vp.clientWidth || 880, H = vp.clientHeight || 560;
  var isMobile = W < 640;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
  } catch (e) { fail3d('이 기기에서는 3D를 표시할 수 없습니다.'); return; }
  renderer.setPixelRatio(Math.min(isMobile ? 1.4 : 1.75, window.devicePixelRatio || 1));
  renderer.setSize(W, H);
  renderer.outputEncoding = THREE.sRGBEncoding;
  glBox.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0705);
  scene.fog = new THREE.FogExp2(0x0a0705, 0.034);
  var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 140);

  /* ---------- 조명 ---------- */
  scene.add(new THREE.AmbientLight(0x33405e, 0.62));
  var moon = new THREE.DirectionalLight(0x9db4ff, 0.5);
  moon.position.set(7, 11, 6); scene.add(moon);
  function pLight(color, i, dist, x, y, z) {
    var l = new THREE.PointLight(color, i, dist, 2);
    l.position.set(x, y, z); scene.add(l); return l;
  }
  pLight(0xffb45e, 0.95, 12, -3.7, 2.2, 0.9);
  pLight(0xffb45e, 0.95, 12, 3.7, 2.2, 0.9);
  pLight(0xffd9a0, 0.9, 11, 0, 4.4, -1.9);
  var spot = new THREE.SpotLight(0xffe2b0, 1.35, 20, 0.55, 0.65);
  spot.position.set(0, 7.6, 3.6);
  spot.target.position.set(0, 4.3, -3.3);
  scene.add(spot); scene.add(spot.target);
  var flameLight = pLight(0xff7a2a, 0.0, 7, 0, 3.1, 0.9);

  /* ---------- 재질 ---------- */
  function mat(c, r, m, e, ei) {
    return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.85 : r, metalness: m || 0, emissive: e || 0x000000, emissiveIntensity: ei == null ? 1 : ei });
  }
  var stoneM = mat(0x4a4640, 0.95), goldM = mat(0x8a6a2f, 0.5, 0.6), woodM = mat(0x4a2c16, 0.75);
  function blobShadow(parent, r, op) {
    var sh = new THREE.Mesh(new THREE.CircleGeometry(r, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: op || 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; parent.add(sh);
  }

  /* ---------- 바닥 · 기단 ---------- */
  var ground = new THREE.Mesh(new THREE.CircleGeometry(36, 40), mat(0x131009, 1));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  [[14, 0.5, 11, 0.25], [12.5, 0.5, 9.5, 0.75], [11, 0.5, 8, 1.25]].forEach(function (d) {
    var b = new THREE.Mesh(new THREE.BoxGeometry(d[0], d[1], d[2]), stoneM);
    b.position.y = d[3]; scene.add(b);
  });
  var PT = 1.5;

  /* ---------- 뒷벽 + 불화 ---------- */
  var wall = new THREE.Mesh(new THREE.BoxGeometry(9.8, 5.6, 0.35), mat(0x241a10, 0.9));
  wall.position.set(0, PT + 2.8, -3.55); scene.add(wall);
  var fy = PT + 2.80, fz = -3.32, fw = 3.6, fh = 5.4;
  var buddhaTex = new THREE.TextureLoader().load(window.W3D_TEXB || '', function (t) { t.encoding = THREE.sRGBEncoding; });
  var paint = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh),
    new THREE.MeshStandardMaterial({ map: buddhaTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: buddhaTex, emissiveIntensity: 0.70 }));
  paint.position.set(0, fy, fz); scene.add(paint);
  [[fw + 0.26, 0.13, 0, fy + fh / 2 + 0.065], [fw + 0.26, 0.13, 0, fy - fh / 2 - 0.065]].forEach(function (d) {
    var f = new THREE.Mesh(new THREE.BoxGeometry(d[0], d[1], 0.12), goldM);
    f.position.set(0, d[3], fz); scene.add(f);
  });
  [[0.13, fh + 0.26, -(fw / 2 + 0.065)], [0.13, fh + 0.26, fw / 2 + 0.065]].forEach(function (d) {
    var f = new THREE.Mesh(new THREE.BoxGeometry(d[0], d[1], 0.12), goldM);
    f.position.set(d[2], fy, fz); scene.add(f);
  });
  function radialTex(stops) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var g = cv.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }
  var haloTex = radialTex([[0, 'rgba(255,208,120,0.85)'], [0.45, 'rgba(255,180,80,0.28)'], [1, 'rgba(255,170,70,0)']]);
  var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(8.5, 8.5, 1); halo.position.set(0, fy + 0.4, fz - 0.15); scene.add(halo);

  /* ---------- 기둥 · 지붕 제거 (탁 트인 야외 마당) ---------- */

  /* ---------- 석등 ---------- */
  var lanternFires = [];
  function lantern(x) {
    var g = new THREE.Group();
    var b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.8), stoneM); b1.position.y = 0.14; g.add(b1);
    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 1.0, 10), stoneM); shaft.position.y = 0.78; g.add(shaft);
    var fire = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x3a2c1a, emissive: 0xffb45e, emissiveIntensity: 0.95, roughness: 0.8 }));
    fire.position.y = 1.55; g.add(fire); lanternFires.push(fire);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.45, 4), stoneM);
    cap.position.y = 2.06; cap.rotation.y = Math.PI / 4; g.add(cap);
    var jewel = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), stoneM); jewel.position.y = 2.36; g.add(jewel);
    blobShadow(g, 0.75);
    g.position.set(x, 0, 0.9); scene.add(g);
  }
  lantern(-3.7); lantern(3.7);

  /* ---------- 붉은 기둥 2개 + 주련 ---------- */
  function coupletTex(chars) {
    var cv = document.createElement('canvas'); cv.width = 128; cv.height = 512;
    var g = cv.getContext('2d');
    g.fillStyle = '#471310'; g.fillRect(0, 0, 128, 512);
    g.strokeStyle = '#c9a227'; g.lineWidth = 6; g.strokeRect(10, 10, 108, 492);
    g.fillStyle = '#e8c96a'; g.font = '700 88px "Noto Serif KR", "Apple SD Gothic Neo", serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    var n = chars.length;
    for (var i = 0; i < n; i++) g.fillText(chars[i], 64, 512 * (i + 1) / (n + 1));
    var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  function redPillar(x, chars) {
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), stoneM);
    base.position.y = 0.175; g.add(base);
    var col = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.31, 4.4, 16), mat(0x9e2f24, 0.65));
    col.position.y = 0.35 + 2.2; g.add(col);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.3, 0.75), goldM);
    cap.position.y = 0.35 + 4.4 + 0.15; g.add(cap);
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.6),
      new THREE.MeshStandardMaterial({ map: coupletTex(chars), roughness: 0.8 }));
    board.position.set(0, 2.6, 0.32); g.add(board);
    g.position.set(x, PT, 0.2); scene.add(g);
    blobShadow(g, 0.8);
  }
  redPillar(-4.3, '자비');
  redPillar(4.3, '지혜');

  /* ---------- 기와지붕 (Korean temple roof) ---------- */
  function tileTex() {
    var cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    var g = cv.getContext('2d');
    g.fillStyle = '#2c3844'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#1b232b'; g.lineWidth = 3;
    for (var x = 0; x <= 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    g.strokeStyle = '#222b34'; g.lineWidth = 4;
    for (var y = 0; y <= 256; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2;
    for (var x2 = 16; x2 <= 256; x2 += 32) { g.beginPath(); g.moveTo(x2, 0); g.lineTo(x2, 256); g.stroke(); }
    var t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 2);
    return t;
  }
  var tileM = new THREE.MeshStandardMaterial({ map: tileTex(), roughness: 0.85 });
  var ridgeM = mat(0x6e5626, 0.6, 0.4);
  // beam across the two red pillars
  var beam = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.35, 0.5), woodM);
  beam.position.set(0, PT + 5.2, 0.2); scene.add(beam);
  var roof = new THREE.Group();
  var ridge = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.36, 1.5), ridgeM);
  ridge.position.y = 1.25; roof.add(ridge);
  [-6.1, 6.1].forEach(function (x) {
    var c = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 1.7), ridgeM);
    c.position.set(x, 1.25, 0); roof.add(c);
  });
  [-1, 1].forEach(function (s) {
    var slope = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.22, 4.0), tileM);
    slope.position.set(0, 0.45, s * 1.9); slope.rotation.x = s * 0.42; roof.add(slope);
    var tip = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.18, 1.15), tileM);
    tip.position.set(0, 1.08, s * 3.55); tip.rotation.x = s * 1.02; roof.add(tip);
  });
  [-6.05, 6.05].forEach(function (x) {
    var end = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 7.9), tileM);
    end.position.set(x, 0.6, 0); roof.add(end);
  });
  roof.position.set(0, PT + 5.35, 0.2);
  scene.add(roof);

  /* ---------- 범종각 (bell pavilion) ---------- */
  (function bellTower(x, z) {
    var g = new THREE.Group();
    var postM = mat(0x5a3a22, 0.8);
    [[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]].forEach(function (p) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.4, 0.26), postM);
      post.position.set(p[0], 1.7, p[1]); g.add(post);
    });
    var bbeam = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.28, 0.3), postM);
    bbeam.position.y = 3.3; g.add(bbeam);
    var hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), postM);
    hanger.position.y = 3.05; g.add(hanger);
    var mr = new THREE.Group();
    var mridge = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.22, 0.7), ridgeM);
    mridge.position.y = 0.78; mr.add(mridge);
    [-1, 1].forEach(function (s) {
      var ms = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.12, 1.6), tileM);
      ms.position.set(0, 0.36, s * 0.78); ms.rotation.x = s * 0.5; mr.add(ms);
    });
    mr.position.y = 3.48; g.add(mr);
    var bprof = [[0.001, 0], [0.40, 0.02], [0.38, 0.12], [0.30, 0.5], [0.26, 0.8], [0.20, 1.0], [0.10, 1.08], [0.04, 1.12]]
      .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var bell = new THREE.Mesh(new THREE.LatheGeometry(bprof, 20),
      new THREE.MeshStandardMaterial({ color: 0x6a5a2a, roughness: 0.4, metalness: 0.8 }));
    bell.position.y = 1.75; g.add(bell);
    [0.35, 0.7].forEach(function (by) {
      var band = new THREE.Mesh(new THREE.TorusGeometry(0.35 - by * 0.1, 0.022, 6, 20), goldM);
      band.position.y = 1.75 + by; band.rotation.x = Math.PI / 2; g.add(band);
    });
    g.position.set(x, 0, z); scene.add(g);
    blobShadow(g, 1.7);
  })(8.6, -1.5);

  /* ---------- 선원 (Zen monastery backdrop) ---------- */
  function ridgeGeo(w, h, seed) {
    var geo = new THREE.PlaneGeometry(w, h, 28, 5);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i);
      var t = (y + h / 2) / h;
      if (t > 0.02) {
        var n = Math.abs(Math.sin(x * 0.11 + seed) * 0.55 + Math.sin(x * 0.27 + seed * 1.7) * 0.3 + Math.sin(x * 0.53 + seed * 2.3) * 0.15);
        pos.setY(i, y - n * h * 0.5 * t);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }
  function mountain(w, h, x, y, z, ry, color) {
    var m = new THREE.Mesh(ridgeGeo(w, h, Math.random() * 10),
      new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m);
  }
  mountain(150, 30, 0, 10, -50, 0, 0x090d15);
  mountain(120, 20, 0, 6, -37, 0, 0x0c1220);
  mountain(120, 24, -44, 8, -10, Math.PI / 2, 0x0a0f1a);
  mountain(120, 24, 44, 8, -10, -Math.PI / 2, 0x0a0f1a);
  var hallWinM = new THREE.MeshBasicMaterial({ color: 0xffb84d, fog: false });
  function distantHall(x, z, w, d, h) {
    var g = new THREE.Group();
    var darkM = new THREE.MeshBasicMaterial({ color: 0x10141d });
    var body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkM);
    body.position.y = h / 2; g.add(body);
    var rm = new THREE.MeshBasicMaterial({ color: 0x1a2230 });
    var rd = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.28, 1.1), rm);
    rd.position.y = h + 1.0; g.add(rd);
    [-1, 1].forEach(function (s) {
      var sl = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.16, d * 0.75), rm);
      sl.position.set(0, h + 0.5, s * (d * 0.28)); sl.rotation.x = s * 0.5; g.add(sl);
    });
    for (var i = -1; i <= 1; i++) {
      var win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), hallWinM);
      win.position.set(i * w * 0.28, h * 0.45, d / 2 + 0.02); g.add(win);
    }
    g.position.set(x, 0, z); scene.add(g);
  }
  distantHall(-13.5, -17, 7, 4.5, 3.2);
  distantHall(13.5, -18, 7.5, 4.5, 3.4);

  /* ---------- 밤하늘: 별 + 달 ---------- */
  var starN = 500, starPos = new Float32Array(starN * 3), starCol = new Float32Array(starN * 3);
  for (var sti = 0; sti < starN; sti++) {
    var th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.46;
    var R = 60;
    starPos[sti * 3] = R * Math.sin(ph) * Math.cos(th);
    starPos[sti * 3 + 1] = R * Math.cos(ph) * 0.9 + 2;
    starPos[sti * 3 + 2] = R * Math.sin(ph) * Math.sin(th);
    var sb = 0.45 + Math.random() * 0.55, tint = Math.random();
    starCol[sti * 3] = sb; starCol[sti * 3 + 1] = sb * (0.88 + tint * 0.12); starCol[sti * 3 + 2] = sb * (0.82 + tint * 0.18);
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
  scene.add(stars);
  var moonTex = radialTex([[0, 'rgba(240,244,255,1)'], [0.35, 'rgba(220,228,250,0.95)'], [0.45, 'rgba(200,210,240,0.22)'], [1, 'rgba(200,210,240,0)']]);
  var moonSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
  moonSpr.scale.set(10, 10, 1); moonSpr.position.set(22, 34, -45); scene.add(moonSpr);

  /* ---------- 연등 (lotus lantern strings) ---------- */
  var yeonColors = [0xff5a4a, 0xffb43c, 0xff7ab0, 0x4aa8ff, 0x7dd87d, 0xff8a5a];
  function pole(x, z, h) {
    var g = new THREE.Group();
    var p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, h, 8), woodM);
    p.position.y = h / 2; g.add(p);
    g.position.set(x, PT, z); scene.add(g);
    blobShadow(g, 0.4);
  }
  function lanternString(x1, z1, x2, z2, y, n) {
    var a = new THREE.Vector3(x1, y, z1), b = new THREE.Vector3(x2, y, z2);
    var mid = new THREE.Vector3((x1 + x2) / 2, y - 1.0, (z1 + z2) / 2);
    var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 6), mat(0x2a2018, 0.9)));
    for (var i = 0; i < n; i++) {
      var p = curve.getPoint((i + 0.5) / n);
      var lc = yeonColors[(Math.random() * yeonColors.length) | 0];
      var thread = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 4), mat(0x2a2018, 0.9));
      thread.position.set(p.x, p.y - 0.16, p.z); scene.add(thread);
      var l = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10),
        new THREE.MeshStandardMaterial({ color: lc, emissive: lc, emissiveIntensity: 0.9, roughness: 0.6 }));
      l.scale.y = 0.88; l.position.set(p.x, p.y - 0.48, p.z); scene.add(l);
      var capT = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 8), goldM);
      capT.position.set(p.x, p.y - 0.30, p.z); scene.add(capT);
    }
  }
  pole(-5.2, 4.2, 6.2); pole(5.2, 4.2, 6.2);
  lanternString(-5.2, 4.2, 5.2, 4.2, PT + 6.2, 11);

  /* ---------- 석탑 (stone pagoda) ---------- */
  (function pagoda(x, z) {
    var g = new THREE.Group();
    function pbox(w, h, d, y) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneM); m.position.y = y; g.add(m); }
    pbox(1.7, 0.3, 1.7, 0.15);
    pbox(1.25, 0.28, 1.25, 0.44);
    var y = 0.58;
    [[1.02, 0.5], [0.86, 0.44], [0.70, 0.38]].forEach(function (s) {
      pbox(s[0], s[1], s[0], y + s[1] / 2); y += s[1];
      pbox(s[0] + 0.55, 0.13, s[0] + 0.55, y + 0.065); y += 0.13;
    });
    pbox(0.16, 0.5, 0.16, y + 0.25);
    var jewel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), goldM);
    jewel.position.y = y + 0.56; g.add(jewel);
    g.position.set(x, 0, z); scene.add(g);
    blobShadow(g, 1.4);
  })(-8.6, -2.2);

  /* ---------- 소나무 제거 ---------- */

  /* ---------- 불단 ---------- */
  var altar = new THREE.Group();
  var atop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 1.15), woodM); atop.position.y = 0.78; altar.add(atop);
  [[-1.5, -0.45], [1.5, -0.45], [-1.5, 0.45], [1.5, 0.45]].forEach(function (p) {
    var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.78, 8), woodM);
    leg.position.set(p[0], 0.39, p[1]); altar.add(leg);
  });
  var candleFlames = [];
  [-1.15, 1.15].forEach(function (x) {
    var st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.55, 8), goldM);
    st.position.set(x, 1.13, 0); altar.add(st);
    var fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffd98a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.28, 0.36, 1); fl.position.set(x, 1.48, 0); altar.add(fl); candleFlames.push(fl);
  });
  var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.18, 0.14, 14), goldM);
  bowl.position.set(0.4, 0.93, 0.08); altar.add(bowl);
  [[0.32, 0xff8a3c], [0.46, 0xd63c3c], [0.39, 0x9ac25a]].forEach(function (d) {
    var fr = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), mat(d[1], 0.6));
    fr.position.set(d[0], 1.04, 0.08); altar.add(fr);
  });
  var lotus = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8a0b4, roughness: 0.7, emissive: 0x5e2438, emissiveIntensity: 0.35 }));
  lotus.scale.y = 0.55; lotus.position.set(-0.55, 0.95, 0.05); altar.add(lotus);
  altar.position.set(0, PT, -2.25); scene.add(altar);

  /* ---------- 향로 ---------- */
  var burner = new THREE.Group();
  var bronzeM = new THREE.MeshStandardMaterial({ color: 0x6a4e22, roughness: 0.45, metalness: 0.75 });
  var bbody = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.40, 0.48, 22), bronzeM);
  bbody.position.y = 0.55; burner.add(bbody);
  var brim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.055, 10, 26), bronzeM);
  brim.rotation.x = Math.PI / 2; brim.position.y = 0.79; burner.add(brim);
  var ash = new THREE.Mesh(new THREE.CircleGeometry(0.46, 22), mat(0x2b2118, 1));
  ash.rotation.x = -Math.PI / 2; ash.position.y = 0.795; burner.add(ash);
  for (var li = 0; li < 3; li++) {
    var la = (li - 1) * 0.55;
    var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.34, 8), bronzeM);
    leg.position.set(Math.sin(la) * 0.34, 0.17, Math.cos(la) * 0.34); burner.add(leg);
  }
  var stickTips = [], stickTops = [];
  [[-0.10, 0.06], [0, 0], [0.10, -0.05]].forEach(function (o, i) {
    var st = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 6), mat(0x6e4520, 0.9));
    st.position.set(o[0], 1.18, o[1]); st.rotation.z = (i - 1) * 0.03; burner.add(st);
    var tip = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x481f08, emissive: 0x000000, emissiveIntensity: 1.6, roughness: 0.6 }));
    tip.position.set(o[0] + (i - 1) * 0.012, 1.585, o[1]); burner.add(tip); stickTips.push(tip);
    stickTops.push(new THREE.Vector3(o[0] + (i - 1) * 0.012, 1.60, o[1]));
  });
  var flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffa63e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.scale.set(0.42, 0.55, 1); flame.position.set(0, 1.78, 0); burner.add(flame);
  burner.position.set(0, PT, 0.9); scene.add(burner);
  blobShadow(burner, 0.85);

  /* ---------- 동자승 12명 (Sansa-style chibi, 합장) ---------- */
  var disciples = [];
  var SKIN_M = mat(0xffd9b3, 0.65);
  var OUTER_M = mat(0xb8c4c4, 0.9);
  var INNER_Y_M = mat(0xf2e3a0, 0.9);
  var CUSHION_M = mat(0x8a8f8f, 0.95);
  var EYE_M = mat(0x2a2a2a, 0.5);
  function nameTag(text) {
    var cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
    function draw(t) {
      var g2 = cv.getContext('2d');
      g2.clearRect(0, 0, 256, 64);
      g2.fillStyle = 'rgba(8,6,3,0.55)';
      g2.beginPath();
      if (g2.roundRect) g2.roundRect(4, 6, 248, 52, 26); else g2.rect(4, 6, 248, 52);
      g2.fill();
      g2.fillStyle = '#e8c35a'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
      var fs = 26;
      g2.font = fs + 'px sans-serif';
      while (g2.measureText(t).width > 236 && fs > 13) { fs -= 2; g2.font = fs + 'px sans-serif'; }
      g2.fillText(t, 128, 33);
    }
    draw(text);
    var tex = new THREE.CanvasTexture(cv);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.92, depthWrite: false }));
    sp.scale.set(1.15, 0.29, 1);
    sp.userData.setText = function (t) { draw(t); tex.needsUpdate = true; };
    return sp;
  }
  function disciple(x, z, name, isVisitor) {
    var g = new THREE.Group(), inner = new THREE.Group();
    var cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.14, 12), CUSHION_M);
    cushion.position.y = 0.07; g.add(cushion);
    inner.position.y = 0.14; g.add(inner);
    var skirt = new THREE.Mesh(new THREE.SphereGeometry(0.40, 10, 8), OUTER_M);
    skirt.scale.set(1, 0.48, 1); skirt.position.y = 0.10; inner.add(skirt);
    var robe = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), OUTER_M);
    robe.scale.set(1, 0.82, 0.92); robe.position.y = 0.34; inner.add(robe);
    var collar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 6, 12), INNER_Y_M);
    collar.position.y = 0.62; collar.rotation.x = Math.PI / 2 - 0.25; inner.add(collar);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.14, 8), SKIN_M);
    neck.position.y = 0.66; inner.add(neck);
    [-1, 1].forEach(function (s) {
      var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.30, 6), OUTER_M);
      arm.position.set(s * 0.26, 0.40, 0.10); arm.rotation.z = s * 0.55; arm.rotation.x = -0.45; inner.add(arm);
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), SKIN_M);
      hand.position.set(s * 0.05, 0.30, 0.33); inner.add(hand);
    });
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.30, 12, 10), SKIN_M);
    head.position.y = 0.98; inner.add(head);
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), SKIN_M);
      ear.position.set(s * 0.285, 0.98, 0.0); inner.add(ear);
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), EYE_M);
      eye.position.set(s * 0.10, 1.03, 0.272); inner.add(eye);
    });
    var tag = nameTag(name);
    tag.position.y = 1.62; g.add(tag);
    var sc = isVisitor ? 1.04 : 0.95 + Math.random() * 0.08;
    g.scale.set(sc, sc, sc);
    g.position.set(x, PT, z); g.rotation.y = Math.PI;
    scene.add(g);
    var d = { inner: inner, tag: tag, phase: Math.random() * 6.28, bowK: 0, bowTarget: 0, bowTimer: 0, nextBow: 2 + Math.random() * 12, auto: !isVisitor };
    disciples.push(d);
    blobShadow(g, 0.9);
    return d;
  }
  disciple(-2.40, 1.60, DEVOTEES[0][0]);
  disciple(-1.20, 1.60, DEVOTEES[1][0]);
  disciple(1.20, 1.60, DEVOTEES[2][0]);
  disciple(2.40, 1.60, DEVOTEES[3][0]);
  disciple(-3.00, 2.90, DEVOTEES[4][0]);
  disciple(-1.50, 2.90, DEVOTEES[5][0]);
  disciple(1.50, 2.90, DEVOTEES[6][0]);
  disciple(3.00, 2.90, DEVOTEES[7][0]);
  disciple(-2.25, 3.80, DEVOTEES[8][0]);
  disciple(-0.75, 3.80, DEVOTEES[9][0]);
  disciple(0.75, 3.80, DEVOTEES[10][0]);
  disciple(2.25, 3.80, DEVOTEES[11][0]);
  /* 방문객 아바타: 맨 앞자리 */
  var visitor = disciple(0, 0.70, '나 ' + avatar.name, true);

  /* ---------- 족자 2개 ---------- */
  var scrollTex = new THREE.TextureLoader().load(window.W3D_TEXS || '', function (t) { t.encoding = THREE.sRGBEncoding; });
  [-1, 1].forEach(function (s) {
    var grp = new THREE.Group();
    var rodM = mat(0x3a2412, 0.8);
    var paper = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 2.24),
      new THREE.MeshStandardMaterial({ map: scrollTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: scrollTex, emissiveIntensity: 0.45 }));
    grp.add(paper);
    var r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.32, 8), rodM);
    r1.rotation.z = Math.PI / 2; r1.position.y = 1.16; grp.add(r1);
    var r2 = r1.clone(); r2.position.y = -1.16; grp.add(r2);
    grp.position.set(s * 3.2, 3.4, -1.5); grp.rotation.y = -s * 0.28;
    scene.add(grp);
  });

  /* ---------- 파티클 ---------- */
  var smokeTex = radialTex([[0, 'rgba(216,206,188,0.8)'], [0.55, 'rgba(210,200,180,0.28)'], [1, 'rgba(210,200,180,0)']]);
  var emberTex = radialTex([[0, 'rgba(255,190,100,1)'], [0.5, 'rgba(255,140,60,0.55)'], [1, 'rgba(255,120,40,0)']]);

  var dustN = 90, dustPos = new Float32Array(dustN * 3), dustVel = [];
  for (var di = 0; di < dustN; di++) {
    dustPos[di * 3] = (Math.random() - 0.5) * 15;
    dustPos[di * 3 + 1] = 0.4 + Math.random() * 7;
    dustPos[di * 3 + 2] = -4.5 + Math.random() * 9;
    dustVel.push(0.05 + Math.random() * 0.16);
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.055, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  var smokes = [];
  for (var si = 0; si < 22; si++) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false }));
    sp.scale.set(0.3, 0.3, 1); scene.add(sp);
    smokes.push({ sp: sp, life: 0, max: 1, active: false, vx: 0 });
  }
  var smokeIdx = 0;
  function spawnSmoke(worldPos) {
    var s = smokes[smokeIdx]; smokeIdx = (smokeIdx + 1) % smokes.length;
    s.active = true; s.life = 0; s.max = 2.8 + Math.random() * 1.6;
    s.sp.position.copy(worldPos);
    s.sp.position.x += (Math.random() - 0.5) * 0.08;
    s.vx = (Math.random() - 0.5) * 0.12;
  }
  var embers = [];
  for (var ei = 0; ei < 16; ei++) {
    var es = new THREE.Sprite(new THREE.SpriteMaterial({ map: emberTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    es.scale.set(0.09, 0.09, 1); scene.add(es);
    embers.push({ sp: es, life: 0, max: 1, active: false, vy: 0, vx: 0 });
  }
  var emberIdx = 0;

  /* ---------- 소원지 (자동 행운 문구) ---------- */
  var WISH_WORDS = ['행운 가득하세요', '소원 성취', '건강과 행복', '부자 되세요', '가정 화목',
    '사업 번창', '합격 기원', '사랑 성취', '재물운 상승', '무병장수',
    '대박 기원', '복 많이 받으세요', '마음의 평화', '만사형통', '길운 가득',
    '좋은 일만 가득', '소망 이루어지길', '평안하세요', '형통하세요', '귀인 만나세요'];
  var tablets = [];
  function spawnTablet(text, px, py, pz) {
    var cv = document.createElement('canvas'); cv.width = 512; cv.height = 168;
    var g = cv.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 512, 168);
    gr.addColorStop(0, '#f4e4bb'); gr.addColorStop(1, '#d9b96a');
    g.fillStyle = gr;
    g.beginPath(); if (g.roundRect) g.roundRect(6, 6, 500, 156, 22); else g.rect(6, 6, 500, 156); g.fill();
    g.strokeStyle = '#8a6a2f'; g.lineWidth = 5; g.stroke();
    g.fillStyle = '#3a2a10'; g.font = '600 40px "Noto Serif KR", "Apple SD Gothic Neo", serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    var label = text.length > 16 ? text.slice(0, 16) + '…' : text;
    g.fillText('❀ ' + label, 256, 88);
    var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.345),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
    m.position.set(px == null ? (Math.random() - 0.5) * 0.6 : px, py == null ? PT + 1.35 : py, pz == null ? 0.9 : pz);
    scene.add(m);
    tablets.push({ m: m, life: 0, max: 4.6 });
  }
  var ambientTimer = null;
  function ambientWish() {
    var text = WISH_WORDS[(Math.random() * WISH_WORDS.length) | 0];
    spawnTablet(text, (Math.random() - 0.5) * 6.4, PT + 1.2 + Math.random() * 0.6, 0.8 + Math.random() * 2.4);
  }
  function startAmbientWishes() {
    stopAmbientWishes();
    ambientWish();
    setTimeout(function () { if (burning) ambientWish(); }, 1400);
    setTimeout(function () { if (burning) ambientWish(); }, 2800);
    ambientTimer = setInterval(function () { if (burning) ambientWish(); }, 5200);
  }
  function stopAmbientWishes() { if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; } }

  /* ---------- 카메라 컨트롤 ---------- */
  var target = new THREE.Vector3(0, 2.6, -0.2);
  var az = 0, pol = 1.14, rad = 17, tAz = 0, tPol = 1.14, tRad = 13.2, bowDip = 0, bowDipT = 0;
  var introK = 0;
  function applyCam() {
    var p = pol + bowDip;
    camera.position.set(
      target.x + rad * Math.sin(p) * Math.sin(az),
      target.y + rad * Math.cos(p),
      target.z + rad * Math.sin(p) * Math.cos(az)
    );
    camera.lookAt(target);
  }
  var el = renderer.domElement;
  var dragging = false, movedPx = 0, lastX = 0, lastY = 0, idleT = 0, userMoved = false;
  var pinchD = 0;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', function (e) {
    dragging = true; movedPx = 0; lastX = e.clientX; lastY = e.clientY; idleT = 0;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    movedPx += Math.abs(dx) + Math.abs(dy); idleT = 0;
    if (movedPx > 9) userMoved = true;
    tAz -= dx * 0.0052; tPol -= dy * 0.0042;
    tAz = Math.max(-0.62, Math.min(0.62, tAz));
    tPol = Math.max(0.98, Math.min(1.42, tPol));
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (movedPx < 9) tapAt(e.clientX, e.clientY);
  }
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', function () { dragging = false; });
  el.addEventListener('wheel', function (e) {
    e.preventDefault(); idleT = 0;
    tRad *= 1 + e.deltaY * 0.001;
    tRad = Math.max(8, Math.min(17, tRad));
  }, { passive: false });
  el.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinchD > 0) { tRad *= pinchD / d; tRad = Math.max(8, Math.min(17, tRad)); }
      pinchD = d; idleT = 0;
    }
  }, { passive: true });
  el.addEventListener('touchend', function () { pinchD = 0; });

  var raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tapAt(cx, cy) {
    var r = el.getBoundingClientRect();
    ndc.x = ((cx - r.left) / r.width) * 2 - 1;
    ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    var hits = raycaster.intersectObject(burner, true);
    if (hits.length && !burning) $('w3d-light').click();
  }

  /* ---------- 의식 상태 ---------- */
  var burning = false, lit = false, bows = 0, bowing = false;
  var burnTimer = null, burnElapsed = 0, BURN_SEC = 90;
  var tmpV = new THREE.Vector3();
  function setHidden(elm, h) { elm.hidden = !!h; }

  $('w3d-light').addEventListener('click', function () {
    if (burning) return;
    burning = true; lit = true;
    playBell(0.18, 520);
    startMusic();
    toast('향이 피워졌습니다.');
    addMeCard();
    for (var i = 0; i < stickTips.length; i++) stickTips[i].material.emissive.setHex(0xff6a1e);
    flame.material.opacity = 0.95;
    merit.incense++; saveMerit(); paintMerit();
    setHidden($('w3d-light'), true);
    setHidden($('w3d-wishbtn'), false);
    bows = 0; paintBow();
    setHidden($('w3d-bow'), false);
    startAmbientWishes();
    var timer = $('w3d-timer'); setHidden(timer, false);
    var bar = $('w3d-bar'); bar.style.width = '0%';
    burnElapsed = 0;
    clearInterval(burnTimer);
    burnTimer = setInterval(function () {
      burnElapsed++;
      bar.style.width = Math.min(100, (burnElapsed / BURN_SEC) * 100) + '%';
      if (burnElapsed >= BURN_SEC) {
        clearInterval(burnTimer);
        timer.querySelector('span').textContent = '향이 다 타올랐습니다. 마음이 전해졌어요.';
      }
    }, 1000);
  });

  $('w3d-wishbtn').addEventListener('click', function () {
    setHidden($('w3d-wishrow'), false);
    setHidden($('w3d-wishbtn'), true);
    $('w3d-wishinput').focus();
  });
  function sendWish() {
    var inp = $('w3d-wishinput'), text = inp.value.trim();
    if (!text) { inp.focus(); return; }
    spawnTablet(text);
    playBell(0.10, 660);
    toast('소원이 하늘에 전해졌습니다.');
    setHidden($('w3d-wishrow'), true);
  }
  $('w3d-wishsend').addEventListener('click', sendWish);
  $('w3d-wishinput').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendWish(); });

  function paintBow() { $('w3d-bowcount').textContent = bows > 0 ? bows + ' / 3' : ''; }
  $('w3d-bow').addEventListener('click', function () {
    if (bowing || bows >= 3) return;
    bowing = true;
    playBell(0.14, 520);
    for (var i = 0; i < disciples.length; i++) disciples[i].bowTarget = 1;
    bowDipT = 1;
    setTimeout(function () {
      var nowS = performance.now() / 1000;
      for (var j = 0; j < disciples.length; j++) { disciples[j].bowTarget = 0; disciples[j].bowTimer = 0; disciples[j].nextBow = nowS + 7 + Math.random() * 9; }
      bowDipT = 0; bowing = false;
    }, 1600);
    bows++; paintBow();
    merit.bows++; saveMerit(); paintMerit(); check108();
    if (bows >= 3) setTimeout(showWord, reduceMotion ? 100 : 1000);
  });

  function showWord() {
    var idx = Math.floor(Math.random() * WORDS.length), guard = 0;
    while (WORDS.length > 1 && idx === lastWordIdx && guard++ < 10) idx = Math.floor(Math.random() * WORDS.length);
    lastWordIdx = idx;
    $('w3d-wordtext').textContent = WORDS[idx];
    setHidden($('w3d-bow'), true);
    setHidden($('w3d-word'), false);
    playBell(0.16, 440);
    saveMerit(); paintMerit();
    $('w3d-word').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  $('w3d-again').addEventListener('click', function () {
    stopMusic();
    burning = false; lit = false; bows = 0;
    for (var i = 0; i < stickTips.length; i++) stickTips[i].material.emissive.setHex(0x000000);
    flame.material.opacity = 0; flameLight.intensity = 0;
    for (var s = 0; s < smokes.length; s++) { smokes[s].active = false; smokes[s].sp.material.opacity = 0; }
    clearInterval(burnTimer);
    stopAmbientWishes();
    removeMeCard();
    setHidden($('w3d-word'), true);
    setHidden($('w3d-bow'), true);
    setHidden($('w3d-wishrow'), true);
    setHidden($('w3d-timer'), true);
    $('w3d-timer').querySelector('span').textContent = '향이 타오르고 있습니다…';
    $('w3d-wishinput').value = '';
    setHidden($('w3d-light'), false);
    paintBow();
  });
  /* ---------- 불교 배경음악 (Buddhist ambient, WebAudio) ---------- */
  var music = null;
  var PENTA = [174.61, 196.0, 220.0, 261.63, 293.66];
  function musicBell(f) {
    var c = actx, t = c.currentTime;
    [[1, 0.09], [2.01, 0.045], [2.94, 0.028], [4.16, 0.014]].forEach(function (p) {
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f * p[0];
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p[1], t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7);
      o.connect(g); g.connect(music.bus);
      o.start(t); o.stop(t + 7.5);
    });
  }
  function scheduleMusicBell() {
    if (!music) return;
    music.timer = setTimeout(function () {
      if (music && !muted) { try { musicBell(PENTA[(Math.random() * PENTA.length) | 0]); } catch (e) {} }
      scheduleMusicBell();
    }, 15000 + Math.random() * 18000);
  }
  function startMusic() {
    var c = ensureAudio(); if (!c || music) return;
    try { if (c.state === 'suspended' && typeof c.resume === 'function') c.resume(); } catch (e) {}
    try {
      var bus = c.createGain(); bus.gain.value = 0; bus.connect(c.destination);
      bus.gain.setTargetAtTime(muted ? 0 : 0.85, c.currentTime, 4);
      var dg = c.createGain(); dg.gain.value = 0.85;
      var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
      dg.connect(lp); lp.connect(bus);
      var oscs = [];
      [[55, 'sine', 0.05], [110, 'sine', 0.05], [164.81, 'sine', 0.035], [220, 'triangle', 0.014]].forEach(function (v) {
        var o = c.createOscillator(); o.type = v[1]; o.frequency.value = v[0];
        var og = c.createGain(); og.gain.value = v[2];
        o.connect(og); og.connect(dg); o.start(); oscs.push(o);
      });
      var lfo = c.createOscillator(); lfo.frequency.value = 0.06;
      var lg = c.createGain(); lg.gain.value = 0.2;
      lfo.connect(lg); lg.connect(dg.gain); lfo.start(); oscs.push(lfo);
      music = { bus: bus, oscs: oscs, timer: null };
      scheduleMusicBell();
      $('w3d-music').classList.add('on');
    } catch (e) {}
  }
  function stopMusic() {
    if (!music) return;
    var m = music; music = null;
    clearTimeout(m.timer);
    try {
      m.bus.gain.setTargetAtTime(0, actx.currentTime, 1.0);
      setTimeout(function () {
        m.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
        try { m.bus.disconnect(); } catch (e) {}
      }, 3500);
    } catch (e) {}
    $('w3d-music').classList.remove('on');
  }
  /* ---------- 토스트 ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('w3d-toast');
    el.textContent = msg;
    setHidden(el, false);
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { setHidden(el, true); }, 450);
    }, 2600);
  }

  /* ---------- 108배 ---------- */
  function paintBowProg() {
    var box = $('w3d-bowprog');
    if (!box) return;
    if (merit.bows <= 0) { setHidden(box, true); return; }
    setHidden(box, false);
    $('w3d-bowprog-text').textContent = Math.min(merit.bows, 108) + ' / 108배';
    $('w3d-bowprog-bar').style.width = Math.min(100, merit.bows / 108 * 100) + '%';
  }
  function check108() {
    paintBowProg();
    if (merit.bows >= 108 && !merit.done108) {
      merit.done108 = 1; saveMerit();
      playBell(0.22, 392);
      setTimeout(function () { playBell(0.22, 392); }, 900);
      toast('108배를 완성했습니다. 큰 공덕이 함께하길 바랍니다.');
    }
  }

  /* ---------- 염주 돌리기 ---------- */
  var beadsLit = 0, beadRounds = 0, BEAD_N = 108;
  function playTok() {
    if (muted) return;
    var c = ensureAudio(); if (!c) return;
    try {
      if (c.state === 'suspended' && typeof c.resume === 'function') c.resume();
      var t = c.currentTime;
      var o = c.createOscillator(); o.type = 'square'; o.frequency.value = 740;
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2;
      var g = c.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(f); f.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.12);
    } catch (e) {}
  }
  function buildBeads() {
    var svg = $('w3d-beads-svg'); if (!svg || svg.childNodes.length) return;
    var NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < BEAD_N; i++) {
      var a = (i / BEAD_N) * Math.PI * 2 - Math.PI / 2;
      var cc = document.createElementNS(NS, 'circle');
      cc.setAttribute('cx', 130 + 98 * Math.cos(a));
      cc.setAttribute('cy', 130 + 98 * Math.sin(a));
      cc.setAttribute('r', 5.2);
      cc.setAttribute('class', 'w3d-bead');
      svg.appendChild(cc);
    }
  }
  function paintBeads() {
    var circles = $('w3d-beads-svg').querySelectorAll('circle');
    for (var i = 0; i < circles.length; i++) circles[i].classList.toggle('lit', i < beadsLit);
    $('w3d-beads-num').textContent = beadsLit + ' / 108';
    $('w3d-beads-round').textContent = beadRounds + ' 바퀴';
  }
  /* ---------- 내 이름 ---------- */
  $('w3d-mename').textContent = avatar.name;
  $('w3d-rename').addEventListener('click', function () {
    var nv = window.prompt('법명을 입력하세요 (10자 이내)', avatar.name);
    if (nv === null) return;
    nv = nv.trim().slice(0, 10);
    if (!nv) return;
    avatar.name = nv; avatar.isNew = false;
    try { window.localStorage.setItem(LS_AVATAR, JSON.stringify(avatar)); } catch (e) {}
    visitor.tag.userData.setText('나 ' + nv);
    $('w3d-mename').textContent = nv;
    toast('법명이 바뀌었습니다.');
  });
  if (avatar.isNew) setTimeout(function () { toast(avatar.name + '님, 환영합니다.'); }, 2200);

  $('w3d-music').addEventListener('click', function () {
    ensureAudio();
    if (music) stopMusic(); else startMusic();
  });
  $('w3d-mute').addEventListener('click', function () {
    muted = !muted;
    $('w3d-mute').textContent = muted ? '🔕' : '🔔';
    if (music) { try { music.bus.gain.setTargetAtTime(muted ? 0 : 0.85, actx.currentTime, 0.4); } catch (e) {} }
  });

  /* ---------- 염주 UI ---------- */
  buildBeads(); paintBeads(); paintBowProg();
  $('w3d-beads-open').addEventListener('click', function () { setHidden($('w3d-beads'), false); });
  $('w3d-beads-close').addEventListener('click', function () { setHidden($('w3d-beads'), true); });
  $('w3d-beads-next').addEventListener('click', function () {
    playTok();
    beadsLit++;
    if (beadsLit >= BEAD_N) {
      beadRounds++;
      playBell(0.16, 520);
      toast('염주 한 바퀴를 돌았습니다.');
      beadsLit = 0;
    }
    paintBeads();
  });

  /* ---------- 리사이즈 ---------- */
  function onResize() {
    W = vp.clientWidth || 880; H = vp.clientHeight || 560;
    renderer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  /* ---------- 메인 루프 ---------- */
  var running = true, firstFrame = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });
  var prevT = performance.now(), smokeAcc = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!running) { prevT = now; return; }
    var dt = Math.min(0.05, (now - prevT) / 1000); prevT = now;
    var t = now / 1000;
    idleT += dt;

    if (introK < 1) { introK = Math.min(1, introK + dt / 2.6); rad = 17 + (13.2 - 17) * (1 - Math.pow(1 - introK, 3)); }
    else rad += (tRad - rad) * 0.08;
    if (!userMoved && idleT > 6 && !reduceMotion) tAz = Math.sin(t * 0.12) * 0.10;
    az += (tAz - az) * 0.07;
    pol += (tPol - pol) * 0.07;
    bowDip += ((bowDipT ? 0.13 : 0) - bowDip) * 0.08;
    applyCam();

    halo.material.opacity = 0.34 + Math.sin(t * 0.8) * 0.07;
    var cs = 0.26 + Math.sin(t * 2.2) * 0.03;
    for (var ci = 0; ci < candleFlames.length; ci++) candleFlames[ci].scale.set(cs, cs * 1.3, 1);

    var targetI = lit ? 1.55 : 0;
    flameLight.intensity += (targetI - flameLight.intensity) * 0.06;
    if (lit) {
      flameLight.intensity += Math.sin(t * 23) * 0.12 + (Math.random() - 0.5) * 0.08;
      flame.material.opacity = 0.85 + Math.sin(t * 19) * 0.1;
      var fs = 1 + Math.sin(t * 17) * 0.08;
      flame.scale.set(0.42 * fs, 0.55 * (2 - fs), 1);
    }

    if (lit && !reduceMotion) {
      smokeAcc += dt;
      while (smokeAcc > 0.12) {
        smokeAcc -= 0.12;
        var tip = stickTops[(Math.random() * stickTops.length) | 0];
        tmpV.copy(tip); burner.localToWorld(tmpV);
        spawnSmoke(tmpV);
      }
      if (Math.random() < dt * 6) {
        var e = embers[emberIdx]; emberIdx = (emberIdx + 1) % embers.length;
        var tp = stickTops[(Math.random() * stickTops.length) | 0];
        tmpV.copy(tp); burner.localToWorld(tmpV);
        e.active = true; e.life = 0; e.max = 0.7 + Math.random() * 0.7;
        e.sp.position.copy(tmpV);
        e.vy = 0.9 + Math.random() * 0.7; e.vx = (Math.random() - 0.5) * 0.25;
      }
    }
    var si2, s2;
    for (si2 = 0; si2 < smokes.length; si2++) {
      s2 = smokes[si2];
      if (!s2.active) continue;
      s2.life += dt;
      if (s2.life >= s2.max) { s2.active = false; s2.sp.material.opacity = 0; continue; }
      var kk = s2.life / s2.max;
      s2.sp.position.y += dt * 0.55;
      s2.sp.position.x += (s2.vx + Math.sin(s2.life * 2.4) * 0.12) * dt;
      var sc = 0.3 + kk * 1.15;
      s2.sp.scale.set(sc, sc, 1);
      s2.sp.material.opacity = 0.34 * Math.sin(Math.PI * Math.min(1, kk));
    }
    for (si2 = 0; si2 < embers.length; si2++) {
      s2 = embers[si2];
      if (!s2.active) continue;
      s2.life += dt;
      if (s2.life >= s2.max) { s2.active = false; s2.sp.material.opacity = 0; continue; }
      s2.sp.position.y += s2.vy * dt;
      s2.sp.position.x += s2.vx * dt;
      s2.sp.material.opacity = 0.9 * (1 - s2.life / s2.max);
    }

    if (!reduceMotion) {
      var pa = dustGeo.attributes.position.array;
      for (var ddi = 0; ddi < dustN; ddi++) {
        pa[ddi * 3 + 1] += dustVel[ddi] * dt;
        pa[ddi * 3] += Math.sin(t * 0.6 + ddi) * 0.0012;
        if (pa[ddi * 3 + 1] > 7.6) pa[ddi * 3 + 1] = 0.3;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    for (var qi = 0; qi < disciples.length; qi++) {
      var dc = disciples[qi];
      if (dc.auto !== false && !reduceMotion && !bowing && dc.bowTarget === 0 && dc.bowTimer <= 0 && t > dc.nextBow) {
        dc.bowTarget = 1; dc.bowTimer = 1.5 + Math.random() * 0.7;
      }
      if (dc.bowTimer > 0) {
        dc.bowTimer -= dt;
        if (dc.bowTimer <= 0) { dc.bowTarget = 0; dc.nextBow = t + 5 + Math.random() * 14; }
      }
      dc.bowK += ((dc.bowTarget ? 1 : 0) - dc.bowK) * 0.07;
      var sway = reduceMotion ? 0 : Math.sin(t * 0.9 + dc.phase) * 0.022;
      dc.inner.rotation.x = dc.bowK * 0.85 + sway * 0.4;
      dc.inner.rotation.z = sway;
    }

    for (var ti = tablets.length - 1; ti >= 0; ti--) {
      var tb = tablets[ti];
      tb.life += dt;
      if (tb.life >= tb.max) { scene.remove(tb.m); tb.m.material.map.dispose(); tb.m.material.dispose(); tb.m.geometry.dispose(); tablets.splice(ti, 1); continue; }
      var tk = tb.life / tb.max;
      tb.m.position.y += dt * 0.62;
      tb.m.position.x += Math.sin(tb.life * 1.8) * dt * 0.1;
      tb.m.material.opacity = tk < 0.12 ? tk / 0.12 : (tk > 0.72 ? 1 - (tk - 0.72) / 0.28 : 1);
    }

    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; loaderBox.style.display = 'none'; }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting && !document.hidden;
    }).observe(vp);
  }
  applyCam();
  requestAnimationFrame(loop);
}
})();
