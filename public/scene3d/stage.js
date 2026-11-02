// 복운수호 3D 무대 — 렌더러 · 카메라 · 조명 · 배치 · 의식 애니메이션
// app.js 는 window.temple3D API 로 이 무대를 조종합니다.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as TX from './textures.js';
import { makeMaterials, buildHall, buildStoneLantern, lotusLanternGeometry, buildSky } from './temple.js';
import { buildBuddha } from './buddha.js';
import { buildAltar } from './altar.js';
import { createDevotee, POSES, clonePose, blendPose, walkPose, applyPose } from './devotee.js';
import { IncenseSmoke, GoldenMotes, LotusPetals } from './effects.js';
import { Builder, mat, lerp, easeInOut, clamp } from './util.js';

// ---------------------------------------------------------------------------
// 배치 상수 (미터)
// ---------------------------------------------------------------------------
const HALL_Z = -22;
const BUDDHA_Z = -10.4;
const BUDDHA_SCALE = 3.5;
const ALTAR_Z = -6.4;
const CARPET_HALF = 0.95;
const ROWS = 6, COLS = 4;
const ROW_Z0 = -4.0, ROW_DZ = 1.42;
const COL_X0 = 1.55, COL_DX = 0.86;

const CAM_POS = new THREE.Vector3(0, 6.6, 14.2);
const CAM_LOOK = new THREE.Vector3(0, 3.2, -10);
const CAM_FOV = 50;

// 한복 배색 (저고리 / 치마) — 전통 색
const WOMEN = [
  ['#f6d36b', '#c7243a'], ['#f6b9c7', '#1f3b7a'], ['#c3e5d8', '#7a2850'], ['#fbf4e4', '#d24a76'],
  ['#d7e7a1', '#8e1d3b'], ['#bcd7f0', '#b52a3a'], ['#f3c9a2', '#2d5c8a'], ['#e9c7ee', '#3b6a4c'],
  ['#fff1b8', '#2a4d8f'], ['#f7c0c0', '#5a2a74'],
];
const MEN = [
  ['#c9c5bb', '#c9c5bb'], ['#a9cbbf', '#a9cbbf'], ['#ece7db', '#ece7db'], ['#7d7f86', '#7d7f86'],
  ['#b9a07c', '#b9a07c'], ['#9fb6cf', '#9fb6cf'],
];

export class Temple3D {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.listeners = [];
    this.seats = [];
    this.bowQueue = [];

    // ===== 렌더러 =====
    // ?q=low → 그림자·블룸 끄고 해상도 낮춤 (저사양 PC / 방송 동시 송출용)
    this.low = /[?&]q=low/.test(location.search);
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: !this.low, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    r.setPixelRatio(this.low ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.92;
    r.shadowMap.enabled = !this.low;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.className = 'temple3d-canvas';
    container.prepend(r.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0b1024, 45, 140);
    this.camera = new THREE.PerspectiveCamera(CAM_FOV, 9 / 16, 0.1, 900);
    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_LOOK);

    this.buildEnvironmentMap();
    this.buildLights();
    this.buildWorld();
    this.buildSeats();
    this.buildWalker();
    this.buildPost();

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    new ResizeObserver(this.resize).observe(container);
    this.resize();

    this.loop = this.loop.bind(this);
    this.renderer.setAnimationLoop(this.loop);
  }

  // =========================================================================
  // 환경맵 — 금불상·청동 반사를 위한 따뜻한 법당 빛
  // =========================================================================
  buildEnvironmentMap() {
    const pm = new THREE.PMREMGenerator(this.renderer);
    const env = new THREE.Scene();
    const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec3 v; void main(){
        vec3 top = vec3(0.10,0.13,0.30); vec3 hor = vec3(0.55,0.36,0.22); vec3 bot = vec3(0.22,0.12,0.07);
        vec3 c = v.y > 0.0 ? mix(hor, top, pow(v.y,0.6)) : mix(hor, bot, pow(-v.y,0.5));
        gl_FragColor = vec4(c,1.0); }`,
    }));
    env.add(sky);
    const panel = (color, intensity, pos, size) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel('#ffcc88', 2.4, [0, 6, 30], [30, 6]);      // 앞쪽 등불
    panel('#ffb070', 1.6, [-25, 2, 10], [10, 10]);    // 왼쪽 연등
    panel('#ff9a8a', 1.4, [25, 3, 10], [10, 10]);   // 오른쪽 연등
    panel('#9fb8ff', 1.4, [0, 40, 0], [40, 40]);    // 달빛
    panel('#ffd9a0', 2, [0, 3, -30], [20, 4]);      // 뒤 법당 창호
    this.envMap = pm.fromScene(env, 0.02).texture;
    this.scene.environment = this.envMap;
    pm.dispose();
  }

  // =========================================================================
  // 조명
  // =========================================================================
  buildLights() {
    const S = this.scene;
    S.add(new THREE.HemisphereLight(0x6a7cc8, 0x24160e, 0.4));

    // 달빛 — 카메라 뒤쪽 위에서 비춤 (신도들의 등과 마당에 그림자)
    const moon = this.moonLight = new THREE.DirectionalLight(0xa9bcff, 0.85);
    moon.position.set(-10, 26, 22);
    moon.target.position.set(0, 0, -4);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    const sc = moon.shadow.camera;
    sc.left = -16; sc.right = 16; sc.top = 20; sc.bottom = -20; sc.near = 1; sc.far = 80;
    moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.03;
    S.add(moon, moon.target);

    // 부처님을 비추는 따뜻한 조명 (연등 빛)
    const key = this.buddhaKey = new THREE.SpotLight(0xffc27a, 70, 40, 0.42, 0.65, 1.6);
    key.position.set(4, 11, BUDDHA_Z + 9);
    key.target.position.set(0, 4.2, BUDDHA_Z);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0008;
    S.add(key, key.target);
    const fill = new THREE.SpotLight(0xff9f6a, 40, 30, 0.5, 0.8, 1.6);
    fill.position.set(-5, 6, BUDDHA_Z + 7);
    fill.target.position.set(0, 3.5, BUDDHA_Z);
    S.add(fill, fill.target);
    // 광배 뒤 역광 (테두리 빛)
    const rim = new THREE.PointLight(0xffd7a0, 25, 9, 1.6);
    rim.position.set(0, 6.2, BUDDHA_Z - 1.8);
    S.add(rim);

    // 법당 문에서 새어나오는 빛
    const door = new THREE.PointLight(0xffb066, 45, 22, 1.5);
    door.position.set(0, 3.2, HALL_Z + 7);
    S.add(door);

    // 향로 · 촛불
    this.candleLight = new THREE.PointLight(0xffa04a, 22, 9, 1.7);
    this.candleLight.position.set(0, 1.6, ALTAR_Z + 0.4);
    S.add(this.candleLight);
  }

  // =========================================================================
  // 세계 — 하늘 · 산 · 소나무 · 마당 · 대웅전 · 불상 · 향로 · 석등 · 연등
  // =========================================================================
  buildWorld() {
    const S = this.scene;
    const M = this.M = makeMaterials();

    // 하늘
    this.sky = buildSky(); S.add(this.sky);
    // 달
    const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.moonGlow(), color: 0x8a90a0, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    moonGlow.scale.set(48, 48, 1); moonGlow.position.set(0, 92, -300);
    const moonDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.moonTex(), color: new THREE.Color(1.5, 1.45, 1.3), fog: false, depthWrite: false }));
    moonDisc.scale.set(13, 13, 1); moonDisc.position.set(0, 92, -299);
    S.add(moonGlow, moonDisc);

    // 겹겹 산
    const layers = [[-260, '#141a33', 70, 30, 520], [-200, '#10162b', 46, 24, 440], [-150, '#0c1122', 30, 16, 360]];
    layers.forEach(([z, color, h, rough, w], i) => {
      const tex = TX.mountainLayer(31 + i * 7, color, 150 - i * 30, rough);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 2.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthWrite: false }));
      m.position.set(0, h * 0.75, z);
      m.renderOrder = -5 + i;
      S.add(m);
    });

    // 마당 (박석)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), M.pavers);
    ground.rotation.x = -Math.PI / 2; ground.position.z = -10;
    ground.receiveShadow = true;
    S.add(ground);
    // 마당 가장자리 흙/잔디 (멀리)
    const turf = new THREE.Mesh(new THREE.RingGeometry(45, 160, 48, 1), new THREE.MeshStandardMaterial({ color: 0x111a14, roughness: 1 }));
    turf.rotation.x = -Math.PI / 2; turf.position.set(0, -0.01, -10);
    S.add(turf);

    // 붉은 융단
    const carpetTex = TX.carpet();
    carpetTex.repeat.set(1, 6);
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(CARPET_HALF * 2, 0.02, 26), new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.85 }));
    carpet.position.set(0, 0.01, ALTAR_Z + 13.2);
    carpet.receiveShadow = true;
    S.add(carpet);

    // 대웅전
    const hall = this.hall = buildHall(M, { bays: [3.2, 4.4, 3.2], depth: 8.4, colH: 4.4, overhang: 3.0, ridgeRatio: 0.48, roofRise: 5.2 });
    hall.position.set(0, 0, HALL_Z);
    S.add(hall);
    // 양쪽 요사채 (작은 전각, 옆으로 돌아 마당을 향함)
    for (const s of [-1, 1]) {
      const side = buildHall(M, { bays: [2.6, 3.0, 2.6], depth: 6, colH: 3.4, overhang: 2.4, ridgeRatio: 0.5, roofRise: 3.8, sign: false, steps: false, bracketScale: 0.75, lift: 0.9, flare: 0.7 });
      side.position.set(s * 15.5, 0, -6);
      side.rotation.y = -s * Math.PI / 2;
      S.add(side);
    }

    // 석조 기단 (불단) + 금동불상
    const plinth = new Builder();
    plinth.add(M.stone, new THREE.CylinderGeometry(3.0, 3.2, 0.32, 8), mat([0, 0.16, 0], [0, Math.PI / 8, 0]));
    plinth.add(M.stone, new THREE.CylinderGeometry(2.6, 2.75, 0.32, 8), mat([0, 0.48, 0], [0, Math.PI / 8, 0]));
    plinth.add(M.stoneDark, new THREE.CylinderGeometry(3.22, 3.22, 0.03, 8), mat([0, 0.32, 0], [0, Math.PI / 8, 0]));
    const plinthG = plinth.build();
    plinthG.position.set(0, 0, BUDDHA_Z);
    S.add(plinthG);
    const B = this.buddha = buildBuddha(this.envMap);
    B.root.scale.setScalar(BUDDHA_SCALE);
    B.root.position.set(0, 0.64 + 1.08 * BUDDHA_SCALE, BUDDHA_Z);
    S.add(B.root);
    // 광배 뒤 후광 (블룸)
    const aura = this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.softDot('rgba(255,214,140,0.85)', 'rgba(255,170,80,0.22)'), color: 0xffc070, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
    aura.scale.set(11, 13, 1);
    aura.position.set(0, B.root.position.y + 0.65 * BUDDHA_SCALE, BUDDHA_Z - 1.6);
    S.add(aura);

    // 향로대
    const A = this.altar = buildAltar();
    A.root.position.set(0, 0, ALTAR_Z);
    S.add(A.root);
    this.incenseOrigin = new THREE.Vector3(0, A.ashY + 0.42, ALTAR_Z);

    // 석등 4기
    const fireMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.6, 0.6) });
    this.lanternLights = [];
    for (const [x, z] of [[-4.6, ALTAR_Z - 2.6], [4.6, ALTAR_Z - 2.6], [-8.5, HALL_Z + 7.4], [8.5, HALL_Z + 7.4]]) {
      const l = buildStoneLantern(M, fireMat);
      l.scale.setScalar(1.35);
      l.position.set(x, 0, z);
      S.add(l);
      const pl = new THREE.PointLight(0xffa860, 9, 7, 1.8);
      pl.position.set(x, l.userData.fireY * 1.35, z);
      S.add(pl); this.lanternLights.push(pl);
    }

    this.buildLotusLanterns();
    this.buildPines();

    // 효과
    this.smoke = new IncenseSmoke(S, this.incenseOrigin);
    this.motes = new GoldenMotes(S, new THREE.Vector3(0, 4.5, BUDDHA_Z + 0.5));
    this.petals = new LotusPetals(S, { x0: -7, x1: 7, z0: -9, z1: 10, top: 11 });
  }

  // 연등 줄 — 대웅전 처마에서 마당 쪽으로 늘어진 오색 연등
  buildLotusLanterns() {
    const S = this.scene;
    const geos = lotusLanternGeometry();
    // 꽃잎 끝을 어둡게 (안에서 빛이 나는 느낌)
    for (const g of geos) {
      const p = g.attributes.position; const c = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) {
        const r = Math.hypot(p.getX(i), p.getZ(i));
        const k = 0.55 + 0.45 * (1 - Math.min(1, r / 0.3));
        c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = k;
      }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    }
    const lanternGeo = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)), false);
    const tagGeo = new THREE.PlaneGeometry(0.07, 0.26); tagGeo.translate(0, -0.42, 0);
    const lines = [];
    const strings = [-4.4, -6.6, 4.4, 6.6];
    const palette = ['#ff5c7a', '#ffb347', '#ffe066', '#ff7eb6', '#7ee0a8', '#ff8a5c', '#9ec9ff', '#ff4f6d'];
    const items = [];
    for (const x of strings) {
      const z0 = HALL_Z + 7.6, z1 = 6.5;
      const y0 = 7.6 - Math.abs(x) * 0.08, y1 = 6.8;
      const pts = [];
      const N = 40;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const sag = Math.sin(t * Math.PI) * 1.15;
        pts.push(new THREE.Vector3(x, lerp(y0, y1, t) - sag, lerp(z0, z1, t)));
      }
      lines.push(pts);
      const count = 17;
      for (let i = 1; i < count; i++) {
        const t = i / count;
        const idx = t * N;
        const a = pts[Math.floor(idx)], b = pts[Math.min(N, Math.floor(idx) + 1)];
        const p = a.clone().lerp(b, idx % 1);
        items.push({ p: p.clone().add(new THREE.Vector3(0, -0.34, 0)), color: palette[(i + Math.round(x)) % palette.length], ph: Math.random() * 6 });
      }
    }
    const lmat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
    const inst = new THREE.InstancedMesh(lanternGeo, lmat, items.length);
    const tagMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.15, 1.05), side: THREE.DoubleSide });
    const tags = new THREE.InstancedMesh(tagGeo, tagMat, items.length);
    const d = new THREE.Object3D();
    items.forEach((it, i) => {
      d.position.copy(it.p); d.rotation.set(0, it.ph, 0); d.scale.setScalar(1.25); d.updateMatrix();
      inst.setMatrixAt(i, d.matrix); tags.setMatrixAt(i, d.matrix);
      inst.setColorAt(i, new THREE.Color(it.color).multiplyScalar(0.95));
    });
    S.add(inst, tags);
    this.lotusLanterns = { inst, tags, items };
    // 전선
    for (const pts of lines) {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      S.add(new THREE.Line(g, this.M.wire));
    }
    // 연등 빛 (몇 개만)
    for (const [x, z] of [[-5.5, -6], [5.5, -6], [-5.5, 4], [5.5, 4]]) {
      const pl = new THREE.PointLight(0xff8fa0, 7, 8, 1.6);
      pl.position.set(x, 5.6, z);
      S.add(pl);
    }
  }

  // 소나무 (적송 — 붉은 줄기 + 층층 솔잎 덩어리)
  buildPines() {
    const S = this.scene;
    const rand = TX.rng(77);
    const variants = [];
    for (let v = 0; v < 3; v++) {
      const b = new Builder();
      const h = 7 + v * 1.6;
      const pts = [];
      for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(new THREE.Vector3(Math.sin(t * 2.2 + v) * 0.5 * t, t * h, Math.cos(t * 1.7 + v) * 0.3 * t)); }
      const trunk = new THREE.CatmullRomCurve3(pts);
      b.add(this.M.bark, new THREE.TubeGeometry(trunk, 12, 0.22, 7, false));
      for (let k = 0; k < 6; k++) {
        const t = 0.5 + k * 0.09;
        const p = trunk.getPoint(Math.min(1, t));
        const off = new THREE.Vector3((rand() - 0.5) * 2.4, 0.2, (rand() - 0.5) * 2.4);
        const sz = 1.2 + rand() * 1.1;
        b.add(k % 2 ? this.M.pine : this.M.pineDark, new THREE.SphereGeometry(1, 10, 6), mat([p.x + off.x, p.y + off.y, p.z + off.z], [0, rand() * 3, 0], [sz * 1.6, sz * 0.55, sz * 1.3]));
      }
      variants.push(b);
    }
    const spots = [];
    for (let i = 0; i < 26; i++) {
      const s = i % 2 ? 1 : -1;
      spots.push([s * (12 + rand() * 14), -38 + rand() * 30]);
    }
    for (let i = 0; i < 10; i++) spots.push([(rand() - 0.5) * 36, -32 - rand() * 14]);
    for (const [x, z] of spots) {
      const v = variants[Math.floor(rand() * 3)];
      const g = v.build();
      g.position.set(x, 0, z); g.rotation.y = rand() * 6; g.scale.setScalar(0.9 + rand() * 0.6);
      S.add(g);
    }
  }

  // =========================================================================
  // 신도 48석 (좌우 24석씩, 방석 위에서 부처님을 향해 합장)
  // =========================================================================
  buildSeats() {
    const S = this.scene;
    // 도톰한 방석 (가운데가 볼록)
    const cushGeo = new THREE.BoxGeometry(0.66, 0.08, 0.7, 10, 1, 10);
    { const pp = cushGeo.attributes.position;
      for (let i = 0; i < pp.count; i++) {
        const x = pp.getX(i) / 0.33, z = pp.getZ(i) / 0.35;
        const bulge = (1 - x * x) * (1 - z * z);
        if (pp.getY(i) > 0) pp.setY(i, pp.getY(i) + bulge * 0.045);
        else pp.setY(i, pp.getY(i) - bulge * 0.005);
        pp.setX(i, pp.getX(i) * (1 - 0.06 * (1 - z * z) * Math.abs(pp.getY(i)) * 10));
      }
      cushGeo.computeVertexNormals(); }
    const cushMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
    const cushions = new THREE.InstancedMesh(cushGeo, cushMat, ROWS * COLS * 2);
    cushions.receiveShadow = true; cushions.castShadow = true;
    const d = new THREE.Object3D();
    const cushColors = ['#8c1c2c', '#5d2366', '#8c1c2c', '#243f6e'];
    const target = new THREE.Vector3(0, 0, BUDDHA_Z);
    let n = 0;
    for (let r = 0; r < ROWS; r++) {
      const z = ROW_Z0 + r * ROW_DZ;
      const spread = 1 + r * 0.035;
      const positions = [];
      for (let c = 0; c < COLS; c++) positions.push({ side: 'left', x: -(COL_X0 + (COLS - 1 - c) * COL_DX * spread), c });
      for (let c = 0; c < COLS; c++) positions.push({ side: 'right', x: COL_X0 + c * COL_DX * spread, c });
      for (const p of positions) {
        const pos = new THREE.Vector3(p.x, 0, z);
        const facing = Math.atan2(target.x - pos.x, target.z - pos.z);
        d.position.set(p.x, 0.04, z + 0.08); d.rotation.set(0, facing, 0); d.scale.set(1, 1, 1); d.updateMatrix();
        cushions.setMatrixAt(n, d.matrix);
        cushions.setColorAt(n, new THREE.Color(cushColors[(r + p.c) % cushColors.length]));
        const seat = { index: n, row: r, col: p.c, side: p.side, pos, facing, dev: null, state: 'empty', bowT: -1, appearT: -1, idlePh: Math.random() * 6, seed: n * 7 + 3 };
        this.seats.push(seat);
        n++;
      }
    }
    S.add(cushions);
  }

  makeDevoteeFor(seat, styleSeed) {
    const rnd = TX.rng(styleSeed * 131 + 17);
    const isF = rnd() < 0.62;
    const pal = isF ? WOMEN[Math.floor(rnd() * WOMEN.length)] : MEN[Math.floor(rnd() * MEN.length)];
    const dev = createDevotee({ gender: isF ? 'f' : 'm', top: pal[0], bottom: pal[1], seed: styleSeed });
    dev.root.position.copy(seat.pos).add(new THREE.Vector3(0, 0.07, 0));
    dev.root.rotation.y = seat.facing;
    const s = 0.96 + rnd() * 0.08;
    dev.root.scale.setScalar(s);
    dev.baseScale = s;
    applyPose(dev, clonePose(POSES.kneel));
    this.scene.add(dev.root);
    return dev;
  }

  // =========================================================================
  // 향 공양 행렬 배우 (붉은 융단 위를 걷는 신도)
  // =========================================================================
  buildWalker() {
    this.walker = null;      // 행렬 신도 (의식마다 새 한복으로 생성)
    this.walkerState = null;
  }

  buildPost() {
    const size = new THREE.Vector2(540, 960);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(size, 0.55, 0.5, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  resize() {
    const w = this.container.clientWidth || 540, h = this.container.clientHeight || 960;
    this.width = w; this.height = h;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = w + 'px';
    this.renderer.domElement.style.height = h + 'px';
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    // 9:16 보다 넓은 화면에서도 같은 구도가 보이도록 FOV 보정
    // 9:16 보다 넓으면 가로 화각을 9:16 과 같게 유지 (연속적으로 변함)
    const base = 9 / 16;
    const a = this.camera.aspect;
    this.camera.fov = a > base ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2)) * base / a)) : CAM_FOV;
    this.camera.updateProjectionMatrix();
  }

  // =========================================================================
  // 공개 API (app.js)
  // =========================================================================
  get seatCount() { return this.seats.length; }

  showSeat(i) {
    const seat = this.seats[i];
    if (!seat) return;
    if (!seat.dev) seat.dev = this.makeDevoteeFor(seat, seat.seed + Math.floor(Math.random() * 1000));
    if (seat.state !== 'shown') {
      seat.state = 'shown';
      seat.appearT = 0;
      seat.dev.root.visible = true;
    }
  }
  hideSeat(i) {
    const seat = this.seats[i];
    if (!seat || !seat.dev) return;
    seat.state = 'empty';
    seat.dev.root.visible = false;
  }
  // 자리 주인이 바뀌면 옷 색을 새로
  restyleSeat(i) {
    const seat = this.seats[i];
    if (!seat) return;
    if (seat.dev) { this.scene.remove(seat.dev.root); disposeTree(seat.dev.root); }
    seat.dev = this.makeDevoteeFor(seat, seat.seed + Math.floor(Math.random() * 100000));
    seat.state = 'shown'; seat.appearT = 0;
  }
  bowSeat(i, delay = 0) {
    const seat = this.seats[i];
    if (!seat || !seat.dev) return;
    if (seat.bowT >= 0 && seat.bowT < 1.4) return;
    seat.bowT = -delay;
    seat.bowing = true;
  }
  bowAll() {
    for (const s of this.seats) if (s.state === 'shown') this.bowSeat(s.index, s.row * 0.09 + Math.random() * 0.08);
  }
  boostIncense(ms = 6000) {
    this.smoke.boost(ms);
    this.motes.burst(this.incenseOrigin.clone().add(new THREE.Vector3(0, 0.3, 0)), 70);
    this.flash = 1;
  }
  burstLotusShower(n = 30) { this.petals.burst(n); }

  // 화면 좌표 (컨테이너 기준 px) — 이름표·말풍선 배치용
  projectToScreen(v, out = {}) {
    const p = v.clone().project(this.camera);
    out.x = (p.x * 0.5 + 0.5) * this.width;
    out.y = (-p.y * 0.5 + 0.5) * this.height;
    out.visible = p.z < 1 && p.z > -1;
    out.depth = this.camera.position.distanceTo(v);
    return out;
  }
  seatAnchor(i, out = {}) {
    const seat = this.seats[i];
    const v = new THREE.Vector3();
    if (seat.dev) {
      seat.dev.bones.head.getWorldPosition(v);
      v.y += 0.24;
    } else v.copy(seat.pos).add(new THREE.Vector3(0, 1.15, 0));
    this.projectToScreen(v, out);
    out.scale = clamp(10 / out.depth, 0.5, 0.86) * (this.height / 960);
    return out;
  }
  walkerAnchor(out = {}) {
    if (!this.walker || !this.walker.root.visible) { out.visible = false; return out; }
    const v = new THREE.Vector3();
    this.walker.bones.head.getWorldPosition(v);
    v.y += 0.3;
    this.projectToScreen(v, out);
    out.scale = clamp(13 / out.depth, 0.62, 1.0) * (this.height / 960);
    return out;
  }

  // 향 공양 의식 — {onBow, onDone} 콜백
  ceremony({ onStart, onArrive, onBow, onDone } = {}) {
    if (this.walkerState) {
      // 이미 진행 중이면 대기열에
      this.bowQueue.push({ onStart, onArrive, onBow, onDone });
      return;
    }
    onStart?.();
    if (this.walker) { this.scene.remove(this.walker.root); disposeTree(this.walker.root); }
    const seed = Math.floor(Math.random() * 100000);
    const rnd = TX.rng(seed);
    const isF = rnd() < 0.6;
    const pal = isF ? WOMEN[Math.floor(rnd() * WOMEN.length)] : MEN[Math.floor(rnd() * MEN.length)];
    const w = this.walker = createDevotee({ gender: isF ? 'f' : 'm', top: pal[0], bottom: pal[1], seed });
    w.root.rotation.y = Math.PI;
    w.incense.visible = true;
    this.scene.add(w.root);
    this.walkerState = { t: 0, onArrive, onBow, onDone, arrived: false, bowed: false, placed: false, pose: clonePose(POSES.carry) };
  }

  updateWalker(dt) {
    const st = this.walkerState;
    if (!st) return;
    const w = this.walker;
    st.t += dt;
    const t = st.t;
    const startZ = 12.5, endZ = ALTAR_Z + 1.32;
    const T_WALK = 4.2, T_KNEEL = 0.8, T_OFFER = 1.3, T_PLACE = 0.5, T_BOW = 2.4, T_RISE = 0.9, T_FADE = 1.6;
    const t1 = T_WALK, t2 = t1 + T_KNEEL, t3 = t2 + T_OFFER, t4 = t3 + T_PLACE, t5 = t4 + T_BOW, t6 = t5 + T_RISE, t7 = t6 + T_FADE;
    let pose = st.pose;
    if (t < t1) {
      const k = t / T_WALK;
      const z = lerp(startZ, endZ, easeInOut(k) * 0.25 + k * 0.75);
      w.root.position.set(0, 0.02, z);
      walkPose(t * 5.2, pose);
      // 걸을 때 향 연기
      const tipW = new THREE.Vector3(); w.incense.children[1].getWorldPosition(tipW);
      this.smoke.emitFrom(tipW, 1.2);
    } else if (t < t2) {
      if (!st.arrived) { st.arrived = true; st.onArrive?.(); }
      const k = easeInOut((t - t1) / T_KNEEL);
      blendPose(POSES.carry, POSES.offer, k, pose);
      pose.hipsY = lerp(POSES.carry.hipsY, POSES.kneel.hipsY, k);
      w.root.position.z = lerp(endZ, endZ + 0.05, k);
    } else if (t < t3) {
      blendPose(POSES.offer, POSES.offer, 0, pose);
      const k = (t - t2) / T_OFFER;
      pose.spine[0] = 0.1 + Math.sin(k * Math.PI) * 0.18;
      const tipW = new THREE.Vector3(); w.incense.children[1].getWorldPosition(tipW);
      this.smoke.emitFrom(tipW, 1);
    } else if (t < t4) {
      const k = easeInOut((t - t3) / T_PLACE);
      blendPose(POSES.offer, POSES.kneel, k, pose);
      if (!st.placed && k > 0.3) {
        st.placed = true;
        w.incense.visible = false;
        // 향로에 새 향 3자루 꽂기
        const A = this.altar;
        for (let i = 0; i < 3; i++) A.addStick((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.22, [(Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12]);
        while (A.sticks.children.length > 12) A.sticks.remove(A.sticks.children[0]);
        this.boostIncense(6500);
      }
    } else if (t < t5) {
      if (!st.bowed) { st.bowed = true; st.onBow?.(); }
      const k = (t - t4) / T_BOW;
      const b = k < 0.42 ? easeInOut(k / 0.42) : (k < 0.62 ? 1 : 1 - easeInOut((k - 0.62) / 0.38));
      blendPose(POSES.kneel, POSES.bow, b, pose);
    } else if (t < t6) {
      const k = easeInOut((t - t5) / T_RISE);
      blendPose(POSES.kneel, POSES.stand, k, pose);
    } else if (t < t7) {
      // 뒤로 물러나며 사라짐 (금빛 속으로)
      const k = (t - t6) / T_FADE;
      blendPose(POSES.stand, POSES.stand, 0, pose);
      w.root.position.y = 0.02;
      const s = 1 - easeInOut(k);
      w.root.scale.set(s, 1 - k * 0.15, s);
      if (!st.faded) { st.faded = true; this.motes.burst(w.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 60); }
    } else {
      w.root.visible = false;
      this.walkerState = null;
      st.onDone?.();
      const next = this.bowQueue.shift();
      if (next) setTimeout(() => this.ceremony(next), 300);
      return;
    }
    applyPose(w, pose);
    // 손에 든 향은 늘 하늘을 향해 곧게
    if (w.incense.visible) {
      w.root.updateMatrixWorld(true);
      const q = new THREE.Quaternion();
      w.bones.wristR.getWorldQuaternion(q);
      const want = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0));
      w.incense.quaternion.copy(q.invert().multiply(want));
    }
  }

  // =========================================================================
  // 매 프레임
  // =========================================================================
  onFrame(fn) { this.listeners.push(fn); }

  loop() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.update(dt);
    this.render(dt);
  }

  render(dt = 0.016) {
    if (this.low) this.renderer.render(this.scene, this.camera);
    else this.composer.render(dt);
    for (const fn of this.listeners) fn(this.time);
  }

  update(dt) {
    this.time += dt;
    const t = this.time;

    // 카메라 — 아주 느린 숨쉬기
    const co = this.camOverride;
    if (co) {
      this.camera.position.set(co.x, co.y, co.z); this.camera.lookAt(co.lx, co.ly, co.lz);
      if (co.fov && this.camera.fov !== co.fov) { this.camera.fov = co.fov; this.camera.updateProjectionMatrix(); }
    } else {
      this.camera.position.set(CAM_POS.x + Math.sin(t * 0.11) * 0.25, CAM_POS.y + Math.sin(t * 0.17) * 0.08, CAM_POS.z);
      this.camera.lookAt(CAM_LOOK.x + Math.sin(t * 0.11) * 0.1, CAM_LOOK.y, CAM_LOOK.z);
    }

    this.sky.material.uniforms.uTime.value = t;
    // 후광 맥동
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.3);
    this.flash = Math.max(0, (this.flash || 0) - dt * 0.5);
    this.aura.material.opacity = 0.4 + pulse * 0.12 + this.flash * 0.5;
    this.buddha.innerMat.emissiveIntensity = 0.8 + pulse * 0.25 + this.flash * 1.2;
    this.bloom.strength = 0.55 + this.flash * 0.45;
    // 촛불 일렁임
    const flick = 0.85 + Math.sin(t * 13) * 0.06 + Math.sin(t * 23.7) * 0.05 + Math.random() * 0.04;
    this.candleLight.intensity = 22 * flick;
    for (const f of this.altar.candles) { f.scale.set(1, flick, 1); f.rotation.z = Math.sin(t * 7 + f.id) * 0.06; }
    for (const l of this.lanternLights) l.intensity = 9 * (0.92 + Math.sin(t * 9 + l.id) * 0.04 + Math.random() * 0.04);
    for (const tip of this.altar.tips) tip.scale.setScalar(0.85 + Math.random() * 0.3);
    // 풍경 흔들림
    for (const b of (this.hall.userData.bells || [])) b.rotation.z = Math.sin(t * 1.7 + b.userData.sway) * 0.12;

    // 신도
    for (const seat of this.seats) {
      const dev = seat.dev;
      if (!dev || seat.state !== 'shown') continue;
      let p = dev._p || (dev._p = clonePose(POSES.kneel));
      if (seat.bowT !== -1 && seat.bowing) {
        seat.bowT += dt;
        const k = seat.bowT / 1.6;
        if (seat.bowT < 0) blendPose(POSES.kneel, POSES.kneel, 0, p);
        else if (k >= 1) { seat.bowing = false; seat.bowT = -1; blendPose(POSES.kneel, POSES.kneel, 0, p); }
        else {
          const b = k < 0.4 ? easeInOut(k / 0.4) : (k < 0.58 ? 1 : 1 - easeInOut((k - 0.58) / 0.42));
          blendPose(POSES.kneel, POSES.bow, b, p);
        }
      } else {
        blendPose(POSES.kneel, POSES.kneel, 0, p);
        // 숨쉬기
        const br = Math.sin(t * 1.4 + seat.idlePh);
        p.chest[0] += br * 0.015; p.head[0] += Math.sin(t * 0.5 + seat.idlePh) * 0.03;
      }
      applyPose(dev, p);
      if (seat.appearT >= 0) {
        seat.appearT += dt;
        const k = Math.min(1, seat.appearT / 0.6);
        const s = dev.baseScale * (0.7 + 0.3 * easeInOut(k));
        dev.root.scale.set(s, s, s);
        if (k >= 1) seat.appearT = -1;
      }
    }
    this.updateWalker(dt);

    this.smoke.update(dt);
    this.motes.update(dt);
    this.petals.update(dt, t);

  }
}

function disposeTree(o) {
  o.traverse((c) => { if (c.isMesh && c.geometry) c.geometry.dispose(); });
}

// ---------------------------------------------------------------------------
// 부팅 — WebGL 가능하면 window.temple3D 생성
// ---------------------------------------------------------------------------
function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

const host = document.querySelector('.stage-viewport');
if (host && webglOK() && !location.search.includes('2d')) {
  try {
    window.temple3D = new Temple3D(host);
    document.documentElement.classList.add('mode-3d');
  } catch (e) {
    console.error('3D 무대 초기화 실패 — 2D 모드로 전환', e);
    window.temple3D = null;
  }
}
window.dispatchEvent(new Event('temple3d-ready'));
