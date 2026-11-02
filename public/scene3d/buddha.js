// 복운수호 3D — 금동 석가여래좌상 (항마촉지인)
// 나발 · 육계 · 백호 · 삼도 · 긴 귓불 · 우견편단 법의 · 연화대좌 · 거신광배
// 단위: 앉은 키 1.0 → 무대에서 SCALE 배로 키움. 정면은 +Z.
import * as THREE from 'three';
import { Builder, mat, lathe } from './util.js';
import { sculpt, P } from './sculpt.js';
import * as TX from './textures.js';

function capsuleBetween(b, material, a, c, r0, r1 = r0, segs = 14) {
  const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
  const dir = C.clone().sub(A); const L = dir.length();
  const prof = [[0.0001, -r0], [r0 * 0.7, -r0 * 0.7], [r0, 0], [r1, L], [r1 * 0.7, L + r1 * 0.7], [0.0001, L + r1]];
  const g = lathe(prof, segs);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  b.add(material, g, new THREE.Matrix4().compose(A, q, new THREE.Vector3(1, 1, 1)));
}
function tube(b, material, pts, r, closed = false) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed);
  b.add(material, new THREE.TubeGeometry(curve, Math.max(16, pts.length * 8), r, 6, closed));
}

// 연꽃잎 한 장 (오목한 껍질 + 뾰족한 끝)
function petalGeometry(w, h, cup = 0.35) {
  const geo = new THREE.PlaneGeometry(w, h, 8, 10);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const v = (y / h) + 0.5;                 // 0 아래 → 1 끝
    const width = Math.sin(Math.PI * Math.min(1, v * 1.08)) * (1 - Math.pow(v, 6) * 0.85);
    const nx = x * width;
    const z = -Math.pow(Math.abs(nx) / (w / 2), 2) * cup * w + Math.sin(v * Math.PI) * cup * w * 0.6;
    p.setXYZ(i, nx, y + h / 2, z + (v > 0.85 ? (v - 0.85) * w * 0.9 : 0));
  }
  geo.computeVertexNormals();
  return geo;
}

export function buildBuddha(env) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xf1c062, metalness: 1, roughness: 0.3, envMapIntensity: 0.75 });
  const goldDeep = new THREE.MeshStandardMaterial({ color: 0xcf9233, metalness: 1, roughness: 0.38, envMapIntensity: 0.9 });
  const goldHair = new THREE.MeshStandardMaterial({ color: 0x3a3a52, metalness: 0.7, roughness: 0.35, envMapIntensity: 1.0 }); // 청색 나발 (군청)
  const lips = new THREE.MeshStandardMaterial({ color: 0xc8643c, metalness: 0.6, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1a10, metalness: 0.3, roughness: 0.6 });
  const stoneMap = TX.cutStone(41, [176, 170, 160]);
  const stone = new THREE.MeshStandardMaterial({ color: 0xddd6ca, map: stoneMap, roughness: 0.85 });
  const stoneShade = new THREE.MeshStandardMaterial({ color: 0x6d675e, map: stoneMap, roughness: 0.95 });
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.7, 0.7), transparent: true, opacity: 0.9 });
  const jewel = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 0.9, 0.3) });

  const root = new THREE.Group();
  const fig = new Builder();

  // ===== SDF 조형 몸체 — 다리·몸통·팔·목·머리가 하나로 매끄럽게 이어짐 =====
  const prims = [
    // 결가부좌 하체
    P.ell([0, 0.1, 0.1], [0.5, 0.12, 0.29]),
    P.ell([0.42, 0.085, 0.19], [0.15, 0.1, 0.16], 0.06),
    P.ell([-0.42, 0.085, 0.19], [0.15, 0.1, 0.16], 0.06),
    P.cone([-0.43, 0.1, 0.2], [0.1, 0.16, 0.33], 0.09, 0.07, 0.05),
    P.cone([0.43, 0.12, 0.2], [-0.1, 0.2, 0.32], 0.085, 0.065, 0.05),
    // 위로 향한 두 발바닥
    P.ell([0.15, 0.215, 0.29], [0.056, 0.03, 0.1], 0.03),
    P.ell([-0.16, 0.25, 0.3], [0.056, 0.03, 0.1], 0.03),
    // 대좌 앞으로 흘러내린 옷자락
    P.ell([0, 0.03, 0.37], [0.33, 0.06, 0.09], 0.05),
    // 몸통
    P.ell([0, 0.22, 0.0], [0.26, 0.13, 0.19], 0.08),
    P.ell([0, 0.4, 0.0], [0.255, 0.2, 0.165], 0.08),
    P.ell([0, 0.47, 0.04], [0.235, 0.11, 0.14], 0.06),
    P.ell([0, 0.45, -0.05], [0.24, 0.17, 0.13], 0.06),
    P.ell([0.235, 0.535, 0.0], [0.115, 0.085, 0.105], 0.07),
    P.ell([-0.235, 0.535, 0.0], [0.115, 0.085, 0.105], 0.07),
    // 왼어깨를 덮은 법의 두께
    P.ell([0.24, 0.5, -0.01], [0.135, 0.14, 0.13], 0.04),
    // 오른팔 — 항마촉지인
    P.cone([-0.27, 0.52, 0], [-0.345, 0.31, 0.07], 0.068, 0.056, 0.05),
    P.cone([-0.345, 0.31, 0.07], [-0.38, 0.19, 0.29], 0.052, 0.04, 0.03),
    P.ell([-0.39, 0.13, 0.35], [0.034, 0.07, 0.03], 0.025),
    P.cone([-0.39, 0.11, 0.37], [-0.395, 0.05, 0.4], 0.024, 0.018, 0.02),
    // 왼팔 — 선정인
    P.cone([0.27, 0.52, 0], [0.335, 0.3, 0.05], 0.075, 0.065, 0.05),
    P.cone([0.335, 0.3, 0.05], [0.12, 0.22, 0.23], 0.058, 0.045, 0.04),
    P.ell([0.03, 0.215, 0.26], [0.085, 0.024, 0.06], 0.03),
    P.ell([0.26, 0.25, 0.12], [0.09, 0.06, 0.09], 0.04),
    // 목 · 머리
    P.cone([0, 0.58, 0.005], [0, 0.7, 0.015], 0.064, 0.056, 0.04),
    P.ell([0, 0.785, 0.02], [0.106, 0.13, 0.116], 0.04),
    P.ell([0, 0.735, 0.05], [0.085, 0.075, 0.08], 0.03),
    P.cone([0, 0.812, 0.127], [0, 0.762, 0.149], 0.007, 0.017, 0.015),
    P.ell([0.108, 0.765, 0.0], [0.018, 0.07, 0.03], 0.012),
    P.ell([-0.108, 0.765, 0.0], [0.018, 0.07, 0.03], 0.012),
    P.sph([0, 0.905, 0.005], 0.068, 0.03),
    // 눈두덩 (반개한 눈꺼풀)
    P.ell([0.042, 0.796, 0.118], [0.03, 0.013, 0.012], 0.012),
    P.ell([-0.042, 0.796, 0.118], [0.03, 0.013, 0.012], 0.012),
    // 법의 옷깃과 주름 (돋을새김)
    P.curve([[0.33, 0.6, -0.04], [0.2, 0.56, 0.11], [0.03, 0.43, 0.165], [-0.13, 0.31, 0.17], [-0.25, 0.25, 0.12]], 0.016, 0.012),
    P.curve([[0.29, 0.57, 0.06], [0.13, 0.5, 0.14], [0.0, 0.39, 0.172], [-0.14, 0.28, 0.168]], 0.008, 0.01),
    P.curve([[0.32, 0.47, 0.07], [0.385, 0.44, 0.0], [0.36, 0.42, -0.07]], 0.008, 0.01),
    P.curve([[0.31, 0.4, 0.07], [0.38, 0.37, 0.0], [0.36, 0.35, -0.07]], 0.008, 0.01),
    P.curve([[0.3, 0.6, -0.06], [0.05, 0.53, -0.17], [-0.22, 0.4, -0.13]], 0.009, 0.01),
    P.curve([[0.3, 0.52, -0.08], [0.05, 0.43, -0.18], [-0.22, 0.3, -0.13]], 0.009, 0.01),
    P.curve([[-0.3, 0.03, 0.36], [0, 0.0, 0.46], [0.3, 0.03, 0.36]], 0.012, 0.02),
    P.curve([[-0.2, 0.07, 0.4], [0, 0.05, 0.455], [0.2, 0.07, 0.4]], 0.008, 0.015),
  ];
  const t0 = performance.now();
  const bodyGeo = sculpt(prims, { center: [0, 0.47, 0.08], half: 0.62, res: 128, maxPoly: 260000 });
  console.log(`[3D] 불상 조형 ${(performance.now() - t0).toFixed(0)}ms, 삼각형 ${bodyGeo.attributes.position.count / 3}`);
  const body = new THREE.Mesh(bodyGeo, gold);
  root.add(body);

  // 삼도 (목의 세 줄)
  for (let i = 0; i < 2; i++) fig.add(goldDeep, new THREE.TorusGeometry(0.062 - i * 0.003, 0.0035, 6, 32), mat([0, 0.64 + i * 0.022, 0.012], [Math.PI / 2 - 0.12, 0, 0]));

  // ===== 얼굴 =====
  for (const s of [-1, 1]) {
    // 내리뜬 눈선
    tube(fig, dark, [[s * 0.018, 0.79, 0.128], [s * 0.042, 0.786, 0.1305], [s * 0.066, 0.791, 0.12]], 0.0024);
    // 초승달 눈썹
    tube(fig, goldDeep, [[s * 0.01, 0.822, 0.13], [s * 0.042, 0.833, 0.127], [s * 0.076, 0.824, 0.11]], 0.0035);
  }
  // 입술 (온화한 미소)
  fig.add(lips, new THREE.SphereGeometry(0.019, 14, 8), mat([0, 0.727, 0.127], [0, 0, 0], [1.25, 0.42, 0.45]));
  tube(fig, dark, [[-0.02, 0.7285, 0.1305], [0, 0.7255, 0.135], [0.02, 0.7285, 0.1305]], 0.0016);
  // 백호
  fig.add(jewel, new THREE.SphereGeometry(0.0075, 10, 8), mat([0, 0.846, 0.132]));

  // 나발 바탕 (군청빛 머리)
  const capGeo = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
  fig.add(goldHair, capGeo, mat([0, 0.79, 0.02], [-0.42, 0, 0], [0.108, 0.13, 0.119]));
  // 나발 (소라 모양 곱슬머리) — 피보나치 분포
  const curlGeo = new THREE.SphereGeometry(0.0108, 7, 5);
  const curl = (cx, cy, cz, rx, ry, rz, n, cond) => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
      if (!cond(x, y, z)) continue;
      fig.add(goldHair, curlGeo, mat([cx + x * rx, cy + y * ry, cz + z * rz]));
    }
  };
  // 이마 선: 정면 높고 옆·뒤로 갈수록 낮아짐
  const hairline = (x, y, z) => {
    const yz = -0.42; // 모자 기울기와 같은 기준면
    const ny = y * Math.cos(yz) + z * Math.sin(yz);
    return ny > 0.02;
  };
  curl(0, 0.79, 0.02, 0.112, 0.134, 0.122, 1100, hairline);
  // 육계 (정수리의 솟은 부분)
  fig.add(goldHair, new THREE.SphereGeometry(0.066, 24, 16), mat([0, 0.905, 0.005]));
  curl(0, 0.905, 0.005, 0.071, 0.071, 0.071, 360, (x, y) => y > -0.45);
  // 계주 (육계 앞의 보주)
  fig.add(jewel, new THREE.SphereGeometry(0.013, 10, 8), mat([0, 0.878, 0.07]));

  const figure = fig.build();
  root.add(figure);

  // ===== 연화대좌 (앙련 2겹 + 중대석 + 복련 + 하대석) =====
  const ped = new Builder();
  const up1 = petalGeometry(0.2, 0.3, 0.3);
  const ringPetals = (geo, n, r, y, tilt, m, off = 0, flip = false) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + off;
      const mm = new THREE.Matrix4()
        .makeTranslation(Math.sin(a) * r, y, Math.cos(a) * r)
        .multiply(new THREE.Matrix4().makeRotationY(a))
        .multiply(new THREE.Matrix4().makeRotationX(flip ? Math.PI - tilt : tilt));
      ped.add(m, geo, mm);
    }
  };
  // 앙련 (위로 핀 연꽃 — 금)
  ped.add(goldDeep, lathe([[0.0001, -0.02], [0.56, -0.02], [0.6, -0.06], [0.5, -0.2], [0.3, -0.26], [0.0001, -0.27]], 48));
  ringPetals(up1, 16, 0.52, -0.21, 0.55, gold, 0);
  ringPetals(up1, 16, 0.44, -0.24, 0.35, goldDeep, Math.PI / 16);
  // 연밥 띠
  ped.add(gold, new THREE.TorusGeometry(0.56, 0.02, 8, 64), mat([0, -0.03, 0], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2;
    ped.add(gold, new THREE.SphereGeometry(0.014, 8, 6), mat([Math.sin(a) * 0.585, -0.06, Math.cos(a) * 0.585]));
  }
  // 중대석 (팔각, 안상 조각)
  ped.add(stone, new THREE.CylinderGeometry(0.34, 0.36, 0.08, 8), mat([0, -0.31, 0], [0, Math.PI / 8, 0]));
  ped.add(stone, new THREE.CylinderGeometry(0.27, 0.29, 0.26, 8), mat([0, -0.48, 0], [0, Math.PI / 8, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 0.275;
    ped.add(stoneShade, new THREE.CircleGeometry(0.055, 16, 0, Math.PI), mat([Math.sin(a) * r + Math.sin(a) * 0.003, -0.52, Math.cos(a) * r + Math.cos(a) * 0.003], [0, a, 0], [1, 1.3, 1]));
  }
  ped.add(stone, new THREE.CylinderGeometry(0.36, 0.34, 0.06, 8), mat([0, -0.64, 0], [0, Math.PI / 8, 0]));
  // 복련 (엎은 연꽃 — 돌)
  ped.add(stone, lathe([[0.0001, -0.66], [0.4, -0.66], [0.62, -0.8], [0.66, -0.86], [0.0001, -0.86]], 48));
  // 복련 꽃잎 — 경사면 위에 도드라진 돌 꽃잎 (끝이 살짝 들린 타원 돋을새김)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const r = 0.52;
    ped.add(stone, new THREE.SphereGeometry(0.1, 14, 10), mat([Math.sin(a) * r, -0.745, Math.cos(a) * r], [0.62, a, 0, 'YXZ'], [0.85, 0.34, 1.35]));
    ped.add(stone, new THREE.SphereGeometry(0.025, 8, 6), mat([Math.sin(a) * (r + 0.1), -0.79, Math.cos(a) * (r + 0.1)]));
  }
  // 하대석
  ped.add(stone, new THREE.CylinderGeometry(0.74, 0.78, 0.12, 8), mat([0, -0.92, 0], [0, Math.PI / 8, 0]));
  ped.add(stone, new THREE.CylinderGeometry(0.82, 0.86, 0.1, 8), mat([0, -1.03, 0], [0, Math.PI / 8, 0]));
  root.add(ped.build());

  // ===== 거신광배 (불꽃무늬 광배) =====
  const halo = new THREE.Group();
  const shape = new THREE.Shape();
  // 보주형 (위가 뾰족한 연잎/불꽃 모양)
  const Wd = 0.86, Ht = 1.75;
  shape.moveTo(0, -0.05);
  shape.bezierCurveTo(Wd, -0.05, Wd * 1.12, Ht * 0.55, Wd * 0.55, Ht * 0.82);
  shape.bezierCurveTo(Wd * 0.25, Ht * 0.93, 0.06, Ht * 0.97, 0, Ht);
  shape.bezierCurveTo(-0.06, Ht * 0.97, -Wd * 0.25, Ht * 0.93, -Wd * 0.55, Ht * 0.82);
  shape.bezierCurveTo(-Wd * 1.12, Ht * 0.55, -Wd, -0.05, 0, -0.05);
  const haloGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 48 });
  const haloBack = new THREE.Mesh(haloGeo, goldDeep);
  haloBack.position.set(0, -0.02, -0.32);
  halo.add(haloBack);
  // 안쪽 빛나는 면
  const innerShape = new THREE.Shape(shape.getPoints(96).map((p) => new THREE.Vector2(p.x * 0.9, p.y * 0.9 + 0.06)));
  const innerMat = new THREE.MeshStandardMaterial({ color: 0x5a2a10, emissive: new THREE.Color(0.9, 0.42, 0.12), emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.5 });
  const inner = new THREE.Mesh(new THREE.ShapeGeometry(innerShape, 48), innerMat);
  inner.position.set(0, -0.02, -0.27);
  halo.add(inner);
  // 두광 (머리 뒤 원광) + 신광 (몸 뒤 원광) — 동심원
  const ringB = new Builder();
  const headC = [0, 0.8, -0.24];
  for (const [r, w, m] of [[0.27, 0.014, gold], [0.23, 0.006, gold], [0.19, 0.012, gold], [0.1, 0.006, gold]]) ringB.add(m, new THREE.TorusGeometry(r, w, 8, 72), mat(headC));
  for (const [r, w] of [[0.56, 0.014], [0.5, 0.006]]) ringB.add(gold, new THREE.TorusGeometry(r, w, 8, 96, Math.PI * 1.1), mat([0, 0.3, -0.25], [0, 0, -Math.PI * 0.05]));
  // 두광 연꽃잎
  const hp = petalGeometry(0.05, 0.09, 0.2);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const mm = new THREE.Matrix4().makeTranslation(headC[0] + Math.sin(a) * 0.13, headC[1] + Math.cos(a) * 0.13, headC[2])
      .multiply(new THREE.Matrix4().makeRotationZ(-a))
      .multiply(new THREE.Matrix4().makeTranslation(0, -0.045, 0));
    ringB.add(gold, hp, mm);
  }
  // 가장자리 불꽃 (화염문)
  const pts = shape.getSpacedPoints(64);
  const flame = new THREE.ConeGeometry(0.045, 0.16, 6);
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    if (p.y < 0.25) continue;
    const prev = pts[i - 1], next = pts[i + 1];
    const tx = next.x - prev.x, ty = next.y - prev.y;
    const nrm = new THREE.Vector2(ty, -tx).normalize();
    const ang = Math.atan2(nrm.y, nrm.x) - Math.PI / 2;
    const curlBias = (i % 2 ? 0.25 : -0.1) * Math.sign(p.x || 1);
    ringB.add(gold, flame, mat([p.x + nrm.x * 0.06, p.y + nrm.y * 0.06 - 0.02, -0.305], [0, 0, ang + 0.35 * Math.sign(-p.x) + curlBias], [1, 1 + (i % 3) * 0.3, 0.45]));
  }
  // 화불 (작은 부처 7구) — 광배 둘레
  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.105;
    const idx = Math.round(t * 64);
    const p = pts[Math.min(63, idx)];
    const sx = p.x * 0.8, sy = p.y * 0.86 + 0.08;
    ringB.add(gold, new THREE.SphereGeometry(0.03, 10, 8), mat([sx, sy, -0.255], [0, 0, 0], [1.1, 0.7, 0.6]));
    ringB.add(gold, new THREE.SphereGeometry(0.016, 8, 6), mat([sx, sy + 0.035, -0.255]));
    ringB.add(gold, new THREE.CircleGeometry(0.035, 16), mat([sx, sy + 0.035, -0.262]));
  }
  halo.add(ringB.build({ castShadow: false }));
  // 광배 빛 (블룸에 걸리도록)
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.01, 8, 72), glowMat);
  glowRing.position.set(...headC); glowRing.position.z += 0.012;
  halo.add(glowRing);
  root.add(halo);

  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, halo, innerMat, glowRing };
}
