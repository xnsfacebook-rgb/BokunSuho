// 복운수호 3D — 대웅전 · 마당 · 석등 · 연등 · 산 · 밤하늘
import * as THREE from 'three';
import { Builder, mat, lathe, std, lerp } from './util.js';
import * as TX from './textures.js';

// ---------------------------------------------------------------------------
// 공용 재질
// ---------------------------------------------------------------------------
export function makeMaterials() {
  const tiles = TX.roofTiles();
  const pav = TX.stonePavers();
  const stoneMap = TX.cutStone(3);
  const door = TX.flowerLatticeDoor();
  const M = {
    pavers: std(0xffffff, { map: pav.map, bumpMap: pav.bump, bumpScale: 1.2, roughness: 0.92 }),
    stone: std(0xd8d4cc, { map: stoneMap, roughness: 0.9 }),
    stoneDark: std(0x9a958c, { map: stoneMap, roughness: 0.95 }),
    tile: std(0xffffff, { map: tiles.map, bumpMap: tiles.bump, bumpScale: 2.0, roughness: 0.42, metalness: 0.2 }),
    tileDark: std(0x24262b, { roughness: 0.55, metalness: 0.1 }),
    ridgeWhite: std(0xe9e4d8, { roughness: 0.85 }),
    column: std(0x7a2a1c, { roughness: 0.55 }),
    redWood: std(0x8a2a1e, { roughness: 0.6 }),
    beam: std(0xffffff, { map: TX.dancheongBeam(), roughness: 0.65 }),
    green: std(0x2f8a6a, { roughness: 0.6 }),
    deep: std(0x1e5a52, { roughness: 0.6 }),
    blue: std(0x2f5f9e, { roughness: 0.6 }),
    red: std(0xb3262b, { roughness: 0.6 }),
    white: std(0xf4efe2, { roughness: 0.7 }),
    yellow: std(0xe8b33c, { roughness: 0.5, metalness: 0.2 }),
    soffit: std(0x1f4a3c, { roughness: 0.8 }),
    rafterEnd: std(0xffffff, { map: TX.rafterEnd(), roughness: 0.7 }),
    tileEnd: std(0xffffff, { map: TX.tileEnd(), roughness: 0.6 }),
    door: std(0xffffff, { map: door.map, emissive: 0xffffff, emissiveMap: door.emissive, emissiveIntensity: 1.25, roughness: 0.8 }),
    plaster: std(0xe9dfca, { roughness: 0.95 }),
    sign: std(0xffffff, { map: TX.signboard(), roughness: 0.5, emissive: 0x332200, emissiveIntensity: 0.25 }),
    bronze: std(0x8a6a3a, { roughness: 0.35, metalness: 0.9 }),
    pine: std(0x1d3324, { roughness: 0.95 }),
    pineDark: std(0x142319, { roughness: 0.95 }),
    bark: std(0x4b3426, { roughness: 1 }),
    wire: new THREE.LineBasicMaterial({ color: 0x2a2018 }),
  };
  M.tile.map.repeat.set(10, 3); M.tile.bumpMap.repeat.set(10, 3);
  M.door.map.repeat.set(1, 1);
  return M;
}

// ---------------------------------------------------------------------------
// 곡선 우진각 지붕 (처마 곡선 + 추녀 반전)
// ---------------------------------------------------------------------------
export function buildRoof(M, { A, B, R, eaveY, ridgeY, lift = 1.2, flare = 0.9, seg = 48, segT = 16 }) {
  const P = (k, u, t) => {
    const a = lerp(A, R, t), b = lerp(B, 0.0, t);
    let x, z;
    if (k === 0) { x = lerp(-a, a, u); z = b; }
    else if (k === 1) { x = a; z = lerp(b, -b, u); }
    else if (k === 2) { x = lerp(a, -a, u); z = -b; }
    else { x = -a; z = lerp(-b, b, u); }
    const f = 0.32 * t + 0.68 * t * t; // 오목한 지붕면
    let y = lerp(eaveY, ridgeY, f);
    const cx = Math.abs(x) / Math.max(a, 1e-4), cz = Math.abs(z) / Math.max(b, 1e-4);
    const fac = Math.pow(Math.min(cx, 1), 2.6) * Math.pow(Math.min(cz, 1), 2.6);
    const sideFac = Math.max(Math.pow(Math.min(cx, 1), 2.2) * (k % 2 === 0 ? 1 : 0), Math.pow(Math.min(cz, 1), 2.2) * (k % 2 === 1 ? 1 : 0));
    const w = Math.pow(1 - t, 2);
    const up = (lift * fac + lift * 0.35 * sideFac) * w;
    y += up;
    x += Math.sign(x) * flare * fac * w;
    z += Math.sign(z) * flare * fac * w;
    return new THREE.Vector3(x, y, z);
  };

  const b = new Builder();
  const sideGeo = (k, offsetY = 0, tMax = 1, flip = false) => {
    const pos = [], uv = [], idx = [];
    const len = (k % 2 === 0) ? 2 * A : 2 * B;
    for (let j = 0; j <= segT; j++) {
      const t = (j / segT) * tMax;
      for (let i = 0; i <= seg; i++) {
        const u = i / seg;
        const p = P(k, u, t);
        pos.push(p.x, p.y + offsetY, p.z);
        uv.push(u * len / 2.6, t * 3.2);
      }
    }
    for (let j = 0; j < segT; j++) for (let i = 0; i < seg; i++) {
      const a0 = j * (seg + 1) + i, a1 = a0 + 1, b0 = a0 + seg + 1, b1 = b0 + 1;
      if (!flip) idx.push(a0, a1, b0, a1, b1, b0); else idx.push(a0, b0, a1, a1, b0, b1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  const tileMat = M.tile.clone();
  tileMat.map = M.tile.map.clone(); tileMat.map.repeat.set(1, 1); tileMat.map.needsUpdate = true;
  tileMat.bumpMap = M.tile.bumpMap.clone(); tileMat.bumpMap.repeat.set(1, 1); tileMat.bumpMap.needsUpdate = true;
  for (let k = 0; k < 4; k++) {
    b.add(tileMat, sideGeo(k, 0, 1, false));
    b.add(M.soffit, sideGeo(k, -0.42, 0.42, true));
  }
  // 처마 끝 (평고대) 띠
  const fascia = (k) => {
    const pos = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const p = P(k, i / seg, 0);
      pos.push(p.x, p.y + 0.02, p.z, p.x, p.y - 0.44, p.z);
    }
    for (let i = 0; i < seg; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  for (let k = 0; k < 4; k++) b.add(M.red, fascia(k));

  // 서까래 (원형) + 부연 (각형) + 막새
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 4; k++) {
    const len = (k % 2 === 0) ? 2 * A : 2 * B;
    const n = Math.round(len / 0.36);
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const e = P(k, u, 0), inner = P(k, u, 0.2);
      const out = e.clone().sub(inner); out.y = 0; out.normalize();
      // 서까래
      const s0 = inner.clone().add(new THREE.Vector3(0, -0.62, 0));
      const s1 = e.clone().add(out.clone().multiplyScalar(-0.35)).add(new THREE.Vector3(0, -0.48, 0));
      const dir = s1.clone().sub(s0);
      const L = dir.length();
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
      const m = new THREE.Matrix4().compose(s0.clone().add(dir.clone().multiplyScalar(0.5)), q, new THREE.Vector3(1, 1, 1));
      b.add(M.green, new THREE.CylinderGeometry(0.085, 0.085, L, 8, 1, true), m);
      const cap = new THREE.CircleGeometry(0.085, 12);
      const qc = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
      b.add(M.rafterEnd, cap, new THREE.Matrix4().compose(s1, qc, new THREE.Vector3(1, 1, 1)));
      // 막새 (기와 끝)
      const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), out.clone().add(new THREE.Vector3(0, -0.15, 0)).normalize());
      b.add(M.tileEnd, new THREE.CircleGeometry(0.13, 12), new THREE.Matrix4().compose(e.clone().add(out.clone().multiplyScalar(0.02)).add(new THREE.Vector3(0, 0.06, 0)), tq, new THREE.Vector3(1, 1, 1)));
    }
  }

  // 용마루
  const ridgeLen = 2 * R + 0.6;
  b.box(M.tileDark, ridgeLen, 0.62, 0.62, [0, ridgeY + 0.3, 0]);
  b.box(M.ridgeWhite, ridgeLen + 0.02, 0.1, 0.64, [0, ridgeY + 0.18, 0]);
  b.box(M.ridgeWhite, ridgeLen + 0.02, 0.06, 0.64, [0, ridgeY + 0.42, 0]);
  b.box(M.tileDark, ridgeLen + 0.3, 0.14, 0.78, [0, ridgeY + 0.66, 0]);
  // 취두/치미 — 위로 휘어 오른 마루 끝
  for (const s of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * (R + 0.1), ridgeY + 0.2, 0),
      new THREE.Vector3(s * (R + 0.45), ridgeY + 0.75, 0),
      new THREE.Vector3(s * (R + 0.55), ridgeY + 1.35, 0),
      new THREE.Vector3(s * (R + 0.35), ridgeY + 1.75, 0),
    ]);
    b.add(M.tileDark, new THREE.TubeGeometry(curve, 16, 0.26, 10, false));
    b.add(M.tileDark, new THREE.SphereGeometry(0.26, 10, 8), mat([s * (R + 0.35), ridgeY + 1.75, 0]));
  }
  // 추녀마루 (내림마루) + 잡상
  for (let k = 0; k < 4; k++) {
    const pts = [];
    for (let j = 0; j <= 12; j++) {
      const t = j / 12;
      const p = P(k, 1, t);
      p.y += 0.22;
      pts.push(p);
    }
    // 끝을 살짝 치켜 올림
    const tip = pts[0].clone(); const d = pts[0].clone().sub(pts[1]).normalize();
    pts.unshift(tip.add(d.multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.28, 0)));
    const curve = new THREE.CatmullRomCurve3(pts);
    b.add(M.tileDark, new THREE.TubeGeometry(curve, 40, 0.2, 8, false));
    b.add(M.ridgeWhite, new THREE.TubeGeometry(curve, 40, 0.205, 8, false), mat([0, -0.12, 0]));
    // 잡상 3구
    for (let s = 0; s < 3; s++) {
      const p = curve.getPoint(0.12 + s * 0.07);
      b.add(M.tileDark, new THREE.SphereGeometry(0.11, 8, 6), mat([p.x, p.y + 0.24, p.z]));
      b.add(M.tileDark, new THREE.CylinderGeometry(0.07, 0.1, 0.22, 8), mat([p.x, p.y + 0.12, p.z]));
    }
  }
  const group = b.build();
  group.userData.P = P;
  return group;
}

// ---------------------------------------------------------------------------
// 공포 (다포식 포작) 1조
// ---------------------------------------------------------------------------
function bracketSet(b, M, x, y, z, scale = 1) {
  const s = scale;
  const add = (m, w, h, d, px, py, pz) => b.box(m, w * s, h * s, d * s, [x + px * s, y + py * s, z + pz * s]);
  add(M.green, 0.46, 0.26, 0.46, 0, 0.13, 0);          // 주두
  add(M.blue, 1.3, 0.2, 0.26, 0, 0.36, 0);             // 첨차 1
  add(M.green, 0.26, 0.2, 0.9, 0, 0.36, 0.2);          // 살미 1
  add(M.red, 0.28, 0.1, 0.5, 0, 0.27, 0.45);           // 살미 하부 (붉은 쇠서)
  add(M.green, 0.3, 0.16, 0.3, -0.52, 0.54, 0);        // 소로
  add(M.green, 0.3, 0.16, 0.3, 0.52, 0.54, 0);
  add(M.green, 0.3, 0.16, 0.3, 0, 0.54, 0.6);
  add(M.blue, 1.8, 0.2, 0.26, 0, 0.72, 0.0);           // 첨차 2
  add(M.blue, 1.3, 0.2, 0.26, 0, 0.72, 0.6);
  add(M.green, 0.26, 0.2, 1.5, 0, 0.72, 0.42);         // 살미 2
  add(M.white, 0.2, 0.08, 0.2, 0, 0.84, 1.18);
  add(M.red, 0.28, 0.1, 0.4, 0, 0.62, 1.0);
  add(M.green, 0.3, 0.16, 0.3, 0, 0.9, 1.1);
  add(M.deep, 2.3, 0.22, 0.28, 0, 1.08, 0.0);          // 첨차 3 (외목도리 받침)
  add(M.deep, 1.8, 0.22, 0.28, 0, 1.08, 1.1);
  add(M.green, 0.28, 0.22, 2.0, 0, 1.08, 0.7);         // 살미 3
  add(M.red, 0.3, 0.12, 0.3, 0, 0.94, 1.6);
}

// ---------------------------------------------------------------------------
// 전각 (대웅전 / 요사채) — 기단 + 기둥 + 꽃살문 + 단청 + 공포 + 지붕
// ---------------------------------------------------------------------------
export function buildHall(M, opts = {}) {
  const {
    bays = [3.0, 4.2, 3.0], depth = 8.4, podiumH = 1.2, colH = 4.4,
    overhang = 3.1, ridgeRatio = 0.55, roofRise = 5.4, sign = true, steps = true,
    lift = 1.25, flare = 1.0, bracketScale = 1,
  } = opts;
  const g = new THREE.Group();
  const W = bays.reduce((a, c) => a + c, 0);
  const halfW = W / 2, halfD = depth / 2;
  const b = new Builder();

  // 기단 (장대석 3단)
  const pw = halfW + 1.6, pd = halfD + 1.5;
  b.box(M.stone, pw * 2, podiumH * 0.34, pd * 2, [0, podiumH * 0.17, 0]);
  b.box(M.stone, pw * 2 - 0.12, podiumH * 0.33, pd * 2 - 0.12, [0, podiumH * 0.5, 0]);
  b.box(M.stone, pw * 2 - 0.24, podiumH * 0.33, pd * 2 - 0.24, [0, podiumH * 0.835, 0]);
  b.box(M.stoneDark, pw * 2 + 0.06, 0.04, pd * 2 + 0.06, [0, podiumH * 0.34, 0]);
  b.box(M.stoneDark, pw * 2 - 0.06, 0.04, pd * 2 - 0.06, [0, podiumH * 0.67, 0]);
  if (steps) {
    const sw = bays[Math.floor(bays.length / 2)] * 0.9;
    const n = 4;
    for (let i = 0; i < n; i++) {
      const h = podiumH * (i + 1) / n;
      const d = (n - i) * 0.36;
      b.box(M.stone, sw, h, d, [0, h / 2, pd + d / 2]);
    }
    // 소맷돌
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(n * 0.36 + 0.1, 0); sh.quadraticCurveTo(n * 0.36, podiumH * 0.3, 0.3, podiumH + 0.2); sh.lineTo(0, podiumH + 0.2); sh.lineTo(0, 0);
      const eg = new THREE.ExtrudeGeometry(sh, { depth: 0.32, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
      b.add(M.stone, eg, mat([s * (sw / 2 + 0.16) - 0.16, 0, pd], [0, -Math.PI / 2, 0]));
    }
  }

  // 초석 + 기둥 (배흘림)
  const colXs = [-halfW];
  let acc = -halfW;
  for (const w of bays) { acc += w; colXs.push(acc); }
  const colGeo = lathe([[0.0, 0], [0.31, 0], [0.33, colH * 0.33], [0.3, colH * 0.8], [0.27, colH], [0.0, colH]], 20);
  const baseGeo = lathe([[0, 0], [0.52, 0], [0.52, 0.1], [0.44, 0.22], [0, 0.22]], 16);
  const colTop = podiumH + colH;
  const rows = [halfD, -halfD];
  for (const zc of rows) for (const xc of colXs) {
    b.add(M.stone, baseGeo, mat([xc, podiumH, zc]));
    b.add(M.column, colGeo, mat([xc, podiumH + 0.2, zc]));
  }
  for (const xc of [-halfW, halfW]) for (const zc of [-halfD / 3, halfD / 3]) {
    b.add(M.stone, baseGeo, mat([xc, podiumH, zc]));
    b.add(M.column, colGeo, mat([xc, podiumH + 0.2, zc]));
  }

  // 몸체 벽 (측/후면 회벽 + 인방)
  b.box(M.plaster, W - 0.3, colH, depth - 0.3, [0, podiumH + 0.2 + colH / 2, 0]);
  // 정면 꽃살문 (각 칸 3~4짝)
  let xs = -halfW;
  bays.forEach((w) => {
    const leaves = w > 3.6 ? 4 : 3;
    const lw = (w - 0.6) / leaves;
    const dh = colH * 0.72;
    const y0 = podiumH + 0.2 + 0.32;
    for (let i = 0; i < leaves; i++) {
      const cx = xs + 0.3 + lw * (i + 0.5);
      b.add(M.door, new THREE.PlaneGeometry(lw - 0.04, dh), mat([cx, y0 + dh / 2, halfD - 0.05]));
    }
    // 머름 (문 아래 판)
    b.box(M.redWood, w - 0.5, 0.32, 0.12, [xs + w / 2, podiumH + 0.2 + 0.16, halfD - 0.02]);
    // 교창 (문 위 채광창)
    const th = colH - dh - 0.32 - 0.5;
    b.add(M.door, new THREE.PlaneGeometry(w - 0.62, th), mat([xs + w / 2, y0 + dh + 0.08 + th / 2, halfD - 0.05], [0, 0, 0], [1, 1, 1]));
    b.box(M.redWood, w - 0.5, 0.1, 0.14, [xs + w / 2, y0 + dh + 0.04, halfD - 0.02]);
    xs += w;
  });

  // 창방 · 평방 (단청)
  const beamM = M.beam;
  const addBeam = (y, h, d, zc, len) => {
    const geo = new THREE.BoxGeometry(len, h, d);
    b.add(beamM, geo, mat([0, y, zc]));
  };
  addBeam(colTop - 0.05, 0.5, 0.42, halfD, W + 0.5);
  addBeam(colTop - 0.05, 0.5, 0.42, -halfD, W + 0.5);
  b.box(M.green, 0.42, 0.5, depth + 0.5, [-halfW, colTop - 0.05, 0]);
  b.box(M.green, 0.42, 0.5, depth + 0.5, [halfW, colTop - 0.05, 0]);
  b.box(M.deep, W + 0.9, 0.22, 0.62, [0, colTop + 0.31, halfD]);
  b.box(M.deep, 0.62, 0.22, depth + 0.9, [-halfW, colTop + 0.31, 0]);
  b.box(M.deep, 0.62, 0.22, depth + 0.9, [halfW, colTop + 0.31, 0]);
  b.box(M.deep, W + 0.9, 0.22, 0.62, [0, colTop + 0.31, -halfD]);

  // 공포 (정면 + 측면 + 후면)
  const yb = colTop + 0.42;
  const bs = bracketScale;
  const sets = [];
  for (let i = 0; i < colXs.length; i++) {
    sets.push(colXs[i]);
    if (i < colXs.length - 1) {
      const w = colXs[i + 1] - colXs[i];
      const n = w > 3.6 ? 2 : 1;
      for (let j = 1; j <= n; j++) sets.push(colXs[i] + (w * j) / (n + 1));
    }
  }
  for (const xc of sets) bracketSet(b, M, xc, yb, halfD + 0.05, bs);
  // 측면 공포 — 회전시켜 배치
  const sideSets = [-halfD, -halfD / 3, halfD / 3, halfD];
  const sideB = new Builder();
  for (const zc of sideSets) bracketSet(sideB, M, zc, yb, halfW + 0.05, bs);
  const side1 = sideB.build(); side1.rotation.y = Math.PI / 2;
  const sideB2 = new Builder();
  for (const zc of sideSets) bracketSet(sideB2, M, -zc, yb, halfW + 0.05, bs);
  const side2 = sideB2.build(); side2.rotation.y = -Math.PI / 2;
  const backB = new Builder();
  for (const xc of sets) bracketSet(backB, M, xc, yb, halfD + 0.05, bs);
  const back = backB.build(); back.rotation.y = Math.PI;
  // 외목도리 + 장혀 (공포 위 수평 부재)
  const eaveBase = yb + 1.2 * bs;
  b.box(M.beam, W + 2.4, 0.34, 0.34, [0, eaveBase, halfD + 1.25 * bs]);
  b.box(M.beam, W + 1.2, 0.32, 0.32, [0, eaveBase, halfD]);

  g.add(b.build(), side1, side2, back);

  // 현판
  if (sign) {
    const sg = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 0.12), [M.redWood, M.redWood, M.redWood, M.redWood, M.sign, M.redWood]);
    sg.position.set(0, colTop + 0.95, halfD + 1.35);
    sg.rotation.x = -0.12;
    sg.castShadow = true;
    g.add(sg);
  }

  // 지붕
  const eaveY = eaveBase + 0.55;
  const roof = buildRoof(M, {
    A: halfW + overhang, B: halfD + overhang, R: (halfW + overhang) * ridgeRatio,
    eaveY, ridgeY: eaveY + roofRise, lift, flare,
  });
  g.add(roof);

  // 풍경 (처마 끝 종 + 물고기)
  const P = roof.userData.P;
  for (const [k, u] of [[0, 0.0], [0, 1.0]]) {
    const p = P(k, u, 0);
    const bell = new THREE.Group();
    const bellGeo = lathe([[0, 0.3], [0.05, 0.3], [0.08, 0.2], [0.12, 0.02], [0.14, 0], [0, 0]], 12);
    const bm = new THREE.Mesh(bellGeo, M.bronze); bm.position.y = -0.55; bell.add(bm);
    const fish = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), M.bronze); fish.rotation.z = Math.PI; fish.scale.set(1, 1, 0.2); fish.position.y = -0.82; bell.add(fish);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3), M.bronze); str.position.y = -0.27; bell.add(str);
    bell.position.copy(p).add(new THREE.Vector3(Math.sign(p.x) * 0.2, 0, 0.2));
    bell.userData.sway = Math.random() * 6;
    g.add(bell);
    (g.userData.bells ||= []).push(bell);
  }

  g.userData = { ...g.userData, halfW, halfD, podiumH, colTop, eaveY, front: halfD + 1.5 };
  return g;
}

// ---------------------------------------------------------------------------
// 석등 (팔각 석등 — 하대석·간주석·상대석·화사석·옥개석·보주)
// ---------------------------------------------------------------------------
export function buildStoneLantern(M, fireMat) {
  const g = new THREE.Group();
  const b = new Builder();
  const oct = (rt, rb, h, y) => b.add(M.stone, new THREE.CylinderGeometry(rt, rb, h, 8), mat([0, y + h / 2, 0], [0, Math.PI / 8, 0]));
  oct(0.62, 0.66, 0.18, 0);                    // 지대석
  oct(0.5, 0.56, 0.2, 0.18);                    // 하대석
  // 복련 (엎은 연꽃)
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    b.add(M.stone, new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat([Math.cos(a) * 0.36, 0.38, Math.sin(a) * 0.36], [0, -a, 0], [1, 0.7, 1.4]));
  }
  b.add(M.stone, new THREE.CylinderGeometry(0.12, 0.14, 1.05, 8), mat([0, 0.38 + 0.52, 0], [0, Math.PI / 8, 0])); // 간주석
  b.add(M.stone, new THREE.TorusGeometry(0.14, 0.04, 6, 8), mat([0, 0.9, 0], [Math.PI / 2, 0, 0]));
  oct(0.46, 0.24, 0.22, 1.42);                  // 상대석 (앙련)
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8;
    b.add(M.stone, new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat([Math.cos(a) * 0.3, 1.66, Math.sin(a) * 0.3], [0, -a, 0], [1, 0.8, 1.4]));
  }
  // 화사석 (네 화창)
  const fy = 1.66, fh = 0.62;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    if (i % 2 === 0) continue;
    b.box(M.stone, 0.16, fh, 0.12, [Math.cos(a) * 0.3, fy + fh / 2, Math.sin(a) * 0.3], [0, -a, 0]);
  }
  // 옥개석 (팔각 지붕 — 귀솟음)
  const roofGeo = lathe([[0.0, 0.42], [0.12, 0.38], [0.36, 0.2], [0.62, 0.08], [0.66, 0.0], [0.6, -0.04], [0.3, -0.02], [0, 0]], 8);
  b.add(M.stone, roofGeo, mat([0, fy + fh, 0], [0, Math.PI / 8, 0]));
  b.add(M.stone, new THREE.CylinderGeometry(0.1, 0.13, 0.12, 8), mat([0, fy + fh + 0.48, 0]));
  b.add(M.stone, new THREE.SphereGeometry(0.11, 10, 8), mat([0, fy + fh + 0.62, 0], [0, 0, 0], [1, 1.25, 1]));
  b.add(M.stone, new THREE.ConeGeometry(0.06, 0.14, 8), mat([0, fy + fh + 0.78, 0]));
  g.add(b.build());
  // 화사석 안의 불빛
  const fire = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, fh - 0.06, 8), fireMat);
  fire.position.y = fy + fh / 2;
  g.add(fire);
  g.userData.fireY = fy + fh / 2;
  return g;
}

// ---------------------------------------------------------------------------
// 연등 (연꽃 등) — 꽃잎이 겹겹이 붙은 둥근 등 + 꼬리표
// ---------------------------------------------------------------------------
export function lotusLanternGeometry() {
  const geos = [];
  const petal = new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI, 0, Math.PI);
  petal.scale(0.85, 1.25, 0.35);
  const rings = [[-0.14, 10, 0.17, 0.35], [-0.05, 12, 0.24, 0.8], [0.06, 12, 0.24, 1.05], [0.15, 10, 0.17, 1.4]];
  for (const [y, n, r, tilt] of rings) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + y * 3;
      const m = mat([Math.cos(a) * r, y, Math.sin(a) * r], [0, -a + Math.PI / 2, 0]);
      const t = new THREE.Matrix4().makeRotationX(-(tilt - 0.9) * 0.9);
      const g = petal.clone().applyMatrix4(t).applyMatrix4(m);
      geos.push(g);
    }
  }
  const core = new THREE.SphereGeometry(0.2, 14, 10); core.scale(1, 0.95, 1);
  geos.push(core);
  for (const g of geos) { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); }
  return geos;
}

// ---------------------------------------------------------------------------
// 밤하늘 돔 (그라데이션 + 별 + 은하수 결)
// ---------------------------------------------------------------------------
export function buildSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vDir; uniform float uTime;
      float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      void main(){
        float h = clamp(vDir.y, -0.1, 1.0);
        vec3 horizon = vec3(0.16,0.17,0.32);
        vec3 mid = vec3(0.05,0.07,0.18);
        vec3 zen = vec3(0.01,0.015,0.05);
        vec3 col = mix(horizon, mid, smoothstep(0.0,0.25,h));
        col = mix(col, zen, smoothstep(0.25,0.8,h));
        // 별
        vec3 p = vDir*420.0;
        vec3 cell = floor(p);
        float r = hash(cell);
        if (r > 0.9965) {
          vec3 f = fract(p)-0.5;
          float d = length(f);
          float tw = 0.65+0.35*sin(uTime*2.0 + r*80.0);
          col += vec3(1.0,0.95,0.85) * smoothstep(0.32,0.0,d) * tw * smoothstep(0.02,0.25,h) * 1.4;
        }
        // 은하수 결
        float band = exp(-pow((vDir.x*0.8+vDir.y*0.6-0.55)*5.0,2.0));
        col += vec3(0.08,0.07,0.12)*band*smoothstep(0.1,0.5,h);
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), mat);
  sky.renderOrder = -10;
  return sky;
}
