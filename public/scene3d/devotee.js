// 복운수호 3D — 한복 신도 (관절 리그 + 자세: 합장 · 큰절 · 걷기 · 향 올리기)
// 신도는 로컬 +Z 방향을 바라봅니다. (무대에서는 부처님 쪽으로 회전)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { lerp } from './util.js';

const SKIN = new THREE.Color('#f1c7a1');
const HAIR = new THREE.Color('#141010');
const WHITE = new THREE.Color('#f7f3ea');
const GOLD = new THREE.Color('#e2b650');

// 공유 재질 — 정점 색으로 칠하므로 신도 48명이 재질 하나를 함께 씀
let SHARED = null;
function sharedMaterials() {
  if (SHARED) return SHARED;
  SHARED = {
    cloth: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.0 }),
    skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 }),
    hair: new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.35, metalness: 0.1 }),
    gold: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 1 }),
    incense: new THREE.MeshStandardMaterial({ color: '#7a3b22', roughness: 0.8 }),
    ember: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.3, 0.3) }),
    faceDark: new THREE.MeshStandardMaterial({ color: '#3a2418', roughness: 0.6 }),
    lips: new THREE.MeshStandardMaterial({ color: '#c7646a', roughness: 0.5 }),
  };
  return SHARED;
}

// ---------------------------------------------------------------------------
// 지오메트리 도우미
// ---------------------------------------------------------------------------
function paint(geo, color) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
function T(geo, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...(typeof scl === 'number' ? [scl, scl, scl] : scl)));
  return geo.applyMatrix4(m);
}
function merged(list) { return mergeGeometries(list.map((g) => fixAttrs(g)), false); }

// 회전체 (프로필 × 각도) — 정점마다 변형 함수 적용 가능 (모프 타깃용)
function revolve(profile, segs, deform = null, colorFn = null) {
  const pos = [], col = [], idx = [];
  const rows = profile.length;
  for (let i = 0; i < rows; i++) {
    const [r, y] = profile[i];
    for (let j = 0; j <= segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      let x = Math.sin(a) * r, z = Math.cos(a) * r, yy = y;
      if (deform) [x, yy, z] = deform(x, yy, z, i / (rows - 1), a);
      pos.push(x, yy, z);
      const c = colorFn ? colorFn(i, rows) : WHITE;
      col.push(c.r, c.g, c.b);
    }
  }
  // 프로필이 위로 올라가면 감기는 방향을 뒤집어 법선이 항상 바깥을 향하게
  const up = profile[rows - 1][1] > profile[0][1];
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < segs; j++) {
    const a = i * (segs + 1) + j, b = a + 1, c = a + segs + 1, d = c + 1;
    if (up) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// 두 점을 잇는 캡슐 (소매·팔다리)
function limb(r0, r1, len, segs = 10) {
  const prof = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    prof.push([lerp(r0, r1, t), -t * len]);
  }
  prof.unshift([0.0001, r0 * 0.6]);
  prof.unshift([0.0001, r0 * 0.6]);
  prof[1] = [r0 * 0.7, r0 * 0.45];
  prof.push([r1 * 0.6, -len - r1 * 0.4]);
  prof.push([0.0001, -len - r1 * 0.55]);
  return revolve(prof, segs);
}

// ---------------------------------------------------------------------------
// 치수 (미터)
// ---------------------------------------------------------------------------
const D = {
  hipY: 0.94, spineLen: 0.2, chestLen: 0.24, neckLen: 0.07,
  shoulderX: 0.165, upperArm: 0.27, forearm: 0.24,
  hipX: 0.085, thigh: 0.43, shin: 0.42,
};

// ---------------------------------------------------------------------------
// 신도 생성
// ---------------------------------------------------------------------------
export function createDevotee({ gender = 'f', top = '#f4a6b8', bottom = '#2f5f9e', seed = 1 } = {}) {
  const S = sharedMaterials();
  const cTop = new THREE.Color(top), cBottom = new THREE.Color(bottom);
  const cTrim = cBottom.clone().lerp(new THREE.Color('#5a1020'), 0.35);
  const isF = gender === 'f';

  const root = new THREE.Group();
  const bones = {};
  const bone = (name, parent, pos) => {
    const o = new THREE.Object3D();
    o.name = name; o.position.set(...pos);
    parent.add(o); bones[name] = o;
    return o;
  };
  const hips = bone('hips', root, [0, D.hipY, 0]);
  const spine = bone('spine', hips, [0, 0, 0]);
  const chest = bone('chest', spine, [0, D.spineLen, 0]);
  const neck = bone('neck', chest, [0, D.chestLen, 0.0]);
  const head = bone('head', neck, [0, D.neckLen, 0.01]);
  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const sh = bone('shoulder' + L, chest, [s * D.shoulderX, D.chestLen - 0.05, -0.01]);
    const el = bone('elbow' + L, sh, [0, -D.upperArm, 0]);
    bone('wrist' + L, el, [0, -D.forearm, 0]);
    const th = bone('thigh' + L, hips, [s * D.hipX, -0.04, 0]);
    const kn = bone('knee' + L, th, [0, -D.thigh, 0]);
    bone('ankle' + L, kn, [0, -D.shin, 0]);
  }

  const meshes = [];
  const attach = (parent, geo, mat, shadow = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = shadow; m.receiveShadow = true;
    parent.add(m); meshes.push(m);
    return m;
  };

  // ---------------- 치마 / 두루마기 (모프: 서있기 ↔ 꿇어앉기) ----------------
  const hemY = isF ? -(D.hipY - 0.02) : -(D.hipY * 0.68);
  const rows = 14;
  const profStand = [], profKneel = [];
  const kneelHip = 0.29; // 꿇어앉았을 때 엉덩이 높이
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    // 서있기: 허리에서 종 모양으로 퍼지는 치마
    const yS = lerp(0.02, hemY, t);
    const rS = isF ? 0.115 + 0.29 * Math.pow(t, 0.75) : 0.12 + 0.17 * Math.pow(t, 0.9);
    profStand.push([rS, yS]);
    // 꿇어앉기: 무릎 위로 봉긋 → 바닥에 넓게 퍼짐
    // 봉긋한 둔덕: 위에서는 빠르게 퍼지고 아래에서 바닥으로 떨어짐
    const yK = lerp(0.02, -kneelHip + 0.012, Math.pow(t, 1.9));
    const rK = (isF ? 0.115 : 0.12) + (isF ? 0.355 : 0.315) * (1 - Math.pow(1 - t, 2.4));
    profKneel.push([rK, yK]);
  }
  profStand.unshift([0.0001, 0.03]); profKneel.unshift([0.0001, 0.03]);
  profStand.push([profStand[rows][0] - 0.02, hemY + 0.01]);
  profKneel.push([profKneel[rows][0] - 0.02, -kneelHip + 0.012]);
  const segs = 28;
  const bandColor = (i, n) => {
    if (!isF) return (i >= n - 3) ? cTrim : cBottom;
    return (i === n - 3 || i === n - 4) ? GOLD : cBottom;
  };
  const wave = (x, y, z, t, a) => {
    // 치마 주름 — 아래로 갈수록 깊어짐
    const f = 1 + Math.sin(a * 16) * 0.025 * t;
    return [x * f, y, z * f * 0.92];
  };
  const skirtGeo = revolve(profStand, segs, wave, bandColor);
  const kneelGeo = revolve(profKneel, segs, (x, y, z, t, a) => {
    const [x1, y1, z1] = wave(x, y, z, t, a);
    // 무릎 쪽(+Z)으로 길게, 뒤쪽은 발뒤꿈치만큼
    const fwd = z1 > 0 ? 1.22 : 0.9;
    const push = 0.1 * t;
    return [x1, y1, z1 * fwd + push];
  }, bandColor);
  skirtGeo.morphAttributes.position = [kneelGeo.attributes.position];
  skirtGeo.morphAttributes.normal = [kneelGeo.attributes.normal];
  const skirt = attach(hips, skirtGeo, S.cloth);
  skirt.morphTargetInfluences = [0];

  // ---------------- 엉덩이/허리 채움 ----------------
  // 가슴에서 허리까지 감싼 치마 윗부분 (아래는 둥글게 막혀 관절 틈이 보이지 않음)
  const waistParts = [
    revolve([[0.0001, -0.11], [0.08, -0.1], [0.125, -0.06], [0.142, 0.0], [0.146, 0.08], [0.142, 0.16], [0.135, D.spineLen + 0.02], [0.0001, D.spineLen + 0.03]], 20,
      (x, y, z) => [x * 1.12, y, z * 0.95], () => (isF ? cBottom : cTop)),
  ];
  if (!isF) {
    // 두루마기 띠 (고름 매듭)
    waistParts.push(paint(T(new THREE.TorusGeometry(0.15, 0.012, 6, 24), [0, D.spineLen * 0.75, 0], [Math.PI / 2, 0, 0], [1.08, 0.88, 1]), cTrim));
  }
  attach(spine, merged(waistParts), S.cloth);

  // ---------------- 저고리 (몸판 + 깃 + 동정 + 고름) ----------------
  const jacketLen = isF ? 0.2 : 0.26;
  const jProf = [];
  const jr = [[0.0001, -0.02], [0.15, -0.018], [0.158, -0.01], [0.162, 0.04], [0.16, 0.1], [0.158, 0.15], [0.15, 0.19], [0.125, 0.222], [0.085, 0.243], [0.058, 0.252], [0.0001, 0.254]];
  for (const [r, y] of jr) jProf.push([r, y + (isF ? 0 : -0.06)]);
  const jacket = revolve(jProf, 22, (x, y, z) => [x * 1.18, y, z * 0.86], () => cTop);
  const chestParts = [jacket];
  // 겉깃 (V자 깃) — 앞섶
  const collarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.055, 0.25, 0.04), new THREE.Vector3(-0.02, 0.18, 0.125), new THREE.Vector3(0.05, 0.1, 0.14), new THREE.Vector3(0.1, 0.05, 0.13),
  ]);
  chestParts.push(paint(new THREE.TubeGeometry(collarCurve, 16, 0.016, 6), cTrim));
  const collarCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.055, 0.25, 0.04), new THREE.Vector3(0.03, 0.2, 0.115), new THREE.Vector3(-0.0, 0.16, 0.135),
  ]);
  chestParts.push(paint(new THREE.TubeGeometry(collarCurve2, 10, 0.014, 6), cTrim));
  // 동정 (흰 깃)
  chestParts.push(paint(T(new THREE.TorusGeometry(0.06, 0.009, 6, 20, Math.PI * 1.25), [0, 0.252, 0.0], [Math.PI / 2, 0, Math.PI * 0.62]), WHITE));
  // 뒷깃
  chestParts.push(paint(T(new THREE.BoxGeometry(0.09, 0.03, 0.02), [0, 0.245, -0.06]), cTrim));
  // 고름 (리본)
  if (isF) {
    chestParts.push(paint(T(new THREE.SphereGeometry(0.022, 8, 6), [0.06, 0.09, 0.14], [0, 0, 0], [1.3, 1, 0.6]), cTrim));
    chestParts.push(paint(T(new THREE.BoxGeometry(0.035, 0.2, 0.006), [0.07, -0.02, 0.145], [0, 0, 0.12]), cTrim));
    chestParts.push(paint(T(new THREE.BoxGeometry(0.028, 0.15, 0.006), [0.04, 0.0, 0.147], [0, 0, -0.1]), cTrim));
    chestParts.push(paint(T(new THREE.BoxGeometry(0.06, 0.04, 0.015), [0.06, 0.1, 0.14], [0, 0, 0.6]), cTrim));
  } else {
    chestParts.push(paint(T(new THREE.BoxGeometry(0.03, 0.22, 0.006), [0.06, -0.05, 0.14], [0, 0, 0.08]), cTrim));
  }
  // 어깨 둥글게
  for (const s of [1, -1]) chestParts.push(paint(T(new THREE.SphereGeometry(0.062, 14, 10), [s * (D.shoulderX - 0.012), D.chestLen - 0.06, -0.01], [0, 0, 0], [1.05, 0.8, 0.95]), cTop));
  attach(chest, merged(chestParts.map((g) => (g.index ? g.toNonIndexed() : g)).map(fixAttrs)), S.cloth);

  // ---------------- 목 · 머리 ----------------
  attach(neck, T(new THREE.CylinderGeometry(0.042, 0.048, D.neckLen + 0.04, 12), [0, D.neckLen / 2 - 0.01, 0]), S.skin);
  const headR = 0.092;
  const headGeo = T(new THREE.SphereGeometry(headR, 24, 18), [0, 0.09, 0.012], [0, 0, 0], [0.9, 1.12, 1.0]);
  attach(head, headGeo, S.skin);
  // 귀
  for (const s of [1, -1]) attach(head, T(new THREE.SphereGeometry(0.02, 8, 6), [s * 0.083, 0.085, 0.0], [0, 0, 0], [0.45, 1, 0.7]), S.skin, false);
  // 코 · 눈썹 (정면에서 보일 때)
  attach(head, T(new THREE.ConeGeometry(0.012, 0.035, 6), [0, 0.08, 0.102], [Math.PI / 2 + 0.25, 0, 0]), S.skin, false);
  // 눈 (지그시 감은 눈) · 눈썹 · 입술
  const faceDark = S.faceDark, lipMat = S.lips;
  const faceParts = [];
  for (const s of [1, -1]) {
    faceParts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.016, 0.094, 0.1), new THREE.Vector3(s * 0.03, 0.09, 0.1), new THREE.Vector3(s * 0.045, 0.094, 0.093)]), 6, 0.0032, 4));
    faceParts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.014, 0.116, 0.097), new THREE.Vector3(s * 0.03, 0.121, 0.096), new THREE.Vector3(s * 0.048, 0.116, 0.088)]), 6, 0.003, 4));
  }
  attach(head, merged(faceParts.map(fixAttrs)), faceDark, false);
  attach(head, T(new THREE.SphereGeometry(0.012, 10, 6), [0, 0.05, 0.097], [0, 0, 0], [1.3, 0.5, 0.6]), lipMat, false);
  // 머리카락
  const hairParts = [];
  hairParts.push(T(new THREE.SphereGeometry(headR * 1.04, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), [0, 0.097, 0.004], [-0.32, 0, 0], [0.93, 1.14, 1.04]));
  if (isF) {
    // 쪽진 머리 (낮은 쪽) + 가르마 볼륨
    hairParts.push(T(new THREE.SphereGeometry(0.052, 16, 12), [0, 0.035, -0.1], [0, 0, 0], [1.25, 0.85, 0.85]));
    hairParts.push(T(new THREE.SphereGeometry(0.07, 14, 10), [0, 0.06, -0.06], [0, 0, 0], [1.05, 0.9, 0.9]));
  } else {
    hairParts.push(T(new THREE.SphereGeometry(headR * 1.03, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), [0, 0.088, -0.006], [-0.55, 0, 0], [0.92, 1.1, 1.0]));
  }
  attach(head, merged(hairParts.map(fixAttrs)), S.hair);
  if (isF) {
    // 비녀 (금)
    attach(head, T(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 8), [0, 0.035, -0.105], [0, 0, Math.PI / 2]), S.gold, false);
    for (const s of [1, -1]) attach(head, T(new THREE.SphereGeometry(0.011, 8, 6), [s * 0.1, 0.035, -0.105]), S.gold, false);
  }

  // ---------------- 팔 (배래 소매 + 끝동 + 손) ----------------
  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const upper = limb(0.06, 0.07, D.upperArm, 12);
    paintAll(upper, cTop);
    attach(bones['shoulder' + L], upper, S.cloth);
    // 배래: 아래로 곡선지게 넉넉한 소매
    // 배래 — 팔꿈치 아래로 둥글게 처진 소매
    const fore = revolve([[0.0001, 0.03], [0.05, 0.02], [0.064, -0.02], [0.07, -0.09], [0.068, -0.16], [0.06, -D.forearm + 0.04]], 14,
      (x, y, z, t) => [x, y, z + (z < 0 ? z * 0.25 * Math.sin(t * Math.PI) : 0)], () => cTop);
    const shade = cTrim.clone().multiplyScalar(0.35);
    const cuff = revolve([[0.06, -D.forearm + 0.042], [0.057, -D.forearm + 0.002], [0.05, -D.forearm + 0.0], [0.03, -D.forearm + 0.01]], 14, null, (i) => (i < 2 ? cTrim : shade));
    attach(bones['elbow' + L], merged([fore, cuff].map(fixAttrs)), S.cloth);
    // 손 (손가락 모은 손바닥)
    const hand = T(new THREE.SphereGeometry(0.036, 12, 10), [0, -0.05, 0.0], [0, 0, 0], [0.42, 1.25, 0.95]);
    const handMesh = attach(bones['wrist' + L], hand, S.skin, false);
    handMesh.position.x = s * -0.008;
  }

  // ---------------- 다리 (바지 · 버선) ----------------
  const legMeshes = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const thighGeo = limb(0.075, 0.06, D.thigh, 12); paintAll(thighGeo, isF ? cBottom : WHITE);
    legMeshes.push(attach(bones['thigh' + L], thighGeo, S.cloth));
    const shinGeo = limb(0.058, 0.042, D.shin, 12); paintAll(shinGeo, isF ? cBottom : WHITE);
    legMeshes.push(attach(bones['knee' + L], shinGeo, S.cloth));
    // 대님 (발목끈)
    if (!isF) legMeshes.push(attach(bones['knee' + L], paint(T(new THREE.TorusGeometry(0.045, 0.01, 6, 14), [0, -D.shin + 0.06, 0], [Math.PI / 2, 0, 0]), cTrim), S.cloth));
    // 버선 (코가 살짝 들린 흰 버선)
    const foot = merged([
      paint(T(new THREE.SphereGeometry(0.045, 12, 8), [0, -0.03, 0.05], [0, 0, 0], [0.85, 0.7, 2.0]), WHITE),
      paint(T(new THREE.ConeGeometry(0.02, 0.05, 8), [0, -0.012, 0.142], [-Math.PI / 2 - 0.5, 0, 0]), WHITE),
    ].map(fixAttrs));
    legMeshes.push(attach(bones['ankle' + L], foot, S.cloth));
  }

  // ---------------- 향 3자루 (오른손) ----------------
  const incense = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.34, 5), S.incense);
    st.position.set((i - 1) * 0.012, 0.13, 0);
    st.rotation.z = (i - 1) * 0.06;
    incense.add(st);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 4), S.ember);
    tip.position.set((i - 1) * 0.012 + Math.sin((i - 1) * 0.06) * -0.17, 0.3, 0);
    incense.add(tip);
  }
  incense.position.set(0.012, -0.07, 0.03);
  bones.wristR.add(incense);
  incense.visible = false;

  root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });

  const dev = {
    root, bones, skirt, legMeshes, incense, gender, isF,
    pose: clonePose(POSES.kneel),
    setPose(p) { applyPose(dev, p); },
  };
  applyPose(dev, dev.pose);
  return dev;
}

function fixAttrs(g) {
  const geo = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) geo.deleteAttribute(k);
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  if (!geo.attributes.color) paint(geo, WHITE);
  return geo;
}
function paintAll(geo, color) {
  const c = geo.attributes.color;
  for (let i = 0; i < c.count; i++) c.setXYZ(i, color.r, color.g, color.b);
}

// ---------------------------------------------------------------------------
// 자세 정의 (각 관절 오일러 회전 + 엉덩이 위치 + 치마 모프)
// ---------------------------------------------------------------------------
const Z = [0, 0, 0];
export const POSES = {
  stand: {
    hipsY: D.hipY, hipsZ: 0, morph: 0,
    spine: [0.02, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0.05, 0, 0],
    shoulderL: [-0.15, 0, 0.12], elbowL: [-0.3, 0, 0], wristL: Z,
    shoulderR: [-0.15, 0, -0.12], elbowR: [-0.3, 0, 0], wristR: Z,
    thighL: Z, kneeL: Z, ankleL: Z, thighR: Z, kneeR: Z, ankleR: Z,
  },
  // 합장 — 꿇어앉아 두 손을 가슴 앞에 모음
  kneel: {
    hipsY: 0.29, hipsZ: 0, morph: 1,
    spine: [0.06, 0, 0], chest: [-0.02, 0, 0], neck: [0.06, 0, 0], head: [0.12, 0, 0],
    shoulderL: [-0.6, -0.8, 0.1], elbowL: [-1.72, 0.0, 0.0], wristL: [0, 0, 0.55],
    shoulderR: [-0.6, 0.8, -0.1], elbowR: [-1.72, 0.0, 0.0], wristR: [0, 0, -0.55],
    thighL: [-1.18, 0, 0.08], kneeL: [2.72, 0, 0], ankleL: [0.9, 0, 0],
    thighR: [-1.18, 0, -0.08], kneeR: [2.72, 0, 0], ankleR: [0.9, 0, 0],
  },
  // 큰절 — 이마를 바닥에, 손바닥은 머리 옆 바닥에
  bow: {
    hipsY: 0.3, hipsZ: -0.02, morph: 1,
    spine: [0.95, 0, 0], chest: [0.45, 0, 0], neck: [0.15, 0, 0], head: [0.25, 0, 0],
    shoulderL: [-2.25, 0, -0.32], elbowL: [-0.55, 0, 0], wristL: [0.9, 0, 0],
    shoulderR: [-2.25, 0, 0.32], elbowR: [-0.55, 0, 0], wristR: [0.9, 0, 0],
    thighL: [-1.18, 0, 0.08], kneeL: [2.72, 0, 0], ankleL: [0.9, 0, 0],
    thighR: [-1.18, 0, -0.08], kneeR: [2.72, 0, 0], ankleR: [0.9, 0, 0],
  },
  // 향을 이마 높이로 받들어 올림
  offer: {
    hipsY: 0.29, hipsZ: 0, morph: 1,
    spine: [0.1, 0, 0], chest: [0.0, 0, 0], neck: [-0.05, 0, 0], head: [0.0, 0, 0],
    shoulderL: [-1.25, -0.8, 0.1], elbowL: [-1.5, 0, 0], wristL: [0, 0, 0.55],
    shoulderR: [-1.25, 0.8, -0.1], elbowR: [-1.5, 0, 0], wristR: [0, 0, -0.55],
    thighL: [-1.18, 0, 0.08], kneeL: [2.72, 0, 0], ankleL: [0.9, 0, 0],
    thighR: [-1.18, 0, -0.08], kneeR: [2.72, 0, 0], ankleR: [0.9, 0, 0],
  },
  // 걸으며 향을 가슴 앞에 받쳐 듦
  carry: {
    hipsY: D.hipY, hipsZ: 0, morph: 0,
    spine: [0.04, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0.06, 0, 0],
    shoulderL: [-0.6, -0.8, 0.1], elbowL: [-1.72, 0, 0], wristL: [0, 0, 0.55],
    shoulderR: [-0.6, 0.8, -0.1], elbowR: [-1.72, 0, 0], wristR: [0, 0, -0.55],
    thighL: Z, kneeL: Z, ankleL: Z, thighR: Z, kneeR: Z, ankleR: Z,
  },
};
const BONE_KEYS = Object.keys(POSES.stand).filter((k) => Array.isArray(POSES.stand[k]));

export function clonePose(p) {
  const o = { hipsY: p.hipsY, hipsZ: p.hipsZ, morph: p.morph };
  for (const k of BONE_KEYS) o[k] = [...p[k]];
  return o;
}
export function blendPose(a, b, t, out = clonePose(a)) {
  out.hipsY = lerp(a.hipsY, b.hipsY, t);
  out.hipsZ = lerp(a.hipsZ, b.hipsZ, t);
  out.morph = lerp(a.morph, b.morph, t);
  for (const k of BONE_KEYS) for (let i = 0; i < 3; i++) out[k][i] = lerp(a[k][i], b[k][i], t);
  return out;
}
// 걷기 주기 (phase 0..2π) — carry 자세 위에 다리 스윙을 더함
export function walkPose(phase, out = clonePose(POSES.carry)) {
  blendPose(POSES.carry, POSES.carry, 0, out);
  const s = Math.sin(phase), c = Math.cos(phase);
  out.thighL[0] = -0.38 * s; out.thighR[0] = 0.38 * s;
  out.kneeL[0] = Math.max(0, 0.65 * -c) * (s < 0 ? 1 : 0.35) + 0.08;
  out.kneeR[0] = Math.max(0, 0.65 * c) * (s > 0 ? 1 : 0.35) + 0.08;
  out.ankleL[0] = 0.15 * s; out.ankleR[0] = -0.15 * s;
  out.hipsY = D.hipY - 0.02 + Math.abs(Math.cos(phase)) * 0.025;
  out.spine[1] = 0.05 * s; out.chest[1] = -0.05 * s;
  return out;
}

export function applyPose(dev, p) {
  const B = dev.bones;
  B.hips.position.y = p.hipsY;
  B.hips.position.z = p.hipsZ;
  for (const k of BONE_KEYS) B[k].rotation.set(p[k][0], p[k][1], p[k][2]);
  dev.skirt.morphTargetInfluences[0] = p.morph;
  // 여성은 꿇어앉으면 다리가 치마 속에 완전히 숨음
  const legsVisible = !(dev.isF && p.morph > 0.85);
  for (const m of dev.legMeshes) m.visible = legsVisible;
  dev.pose = p;
}
