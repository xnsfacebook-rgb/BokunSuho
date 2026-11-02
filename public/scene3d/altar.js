// 복운수호 3D — 향로 (청동 삼족 향로) · 석조 향로대 · 촛대 · 공양물
import * as THREE from 'three';
import { Builder, mat, lathe } from './util.js';
import * as TX from './textures.js';

export function buildAltar() {
  const root = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({ color: 0x6b4a26, metalness: 0.95, roughness: 0.32, envMapIntensity: 1.2 });
  const bronzeHi = new THREE.MeshStandardMaterial({ color: 0xb8893e, metalness: 1, roughness: 0.25, envMapIntensity: 1.3 });
  const patina = new THREE.MeshStandardMaterial({ color: 0x3f5a48, metalness: 0.5, roughness: 0.55 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xcfc8bc, map: TX.cutStone(17, [168, 162, 152]), roughness: 0.88 });
  const ash = new THREE.MeshStandardMaterial({ color: 0x8c8780, roughness: 1 });
  const wax = new THREE.MeshStandardMaterial({ color: 0xf6efe0, roughness: 0.5, emissive: 0x5a3a10, emissiveIntensity: 0.25 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd2a54a, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 });
  const stick = new THREE.MeshStandardMaterial({ color: 0x7a3b22, roughness: 0.8 });
  const ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 1.4, 0.3) });
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.5, 2.6, 0.9), transparent: true, opacity: 0.95, depthWrite: false });
  const fruitR = new THREE.MeshStandardMaterial({ color: 0xb81e22, roughness: 0.35 });
  const fruitO = new THREE.MeshStandardMaterial({ color: 0xe08a1e, roughness: 0.45 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x2f6a2a, roughness: 0.6 });
  const silk = new THREE.MeshStandardMaterial({ color: 0xffffff, map: TX.carpet(), roughness: 0.7 });
  silk.map = silk.map.clone(); silk.map.repeat.set(1, 0.6); silk.map.needsUpdate = true;

  const b = new Builder();
  // ===== 석조 향로대 (팔각 받침 + 상판) =====
  b.add(stone, new THREE.CylinderGeometry(0.62, 0.68, 0.14, 8), mat([0, 0.07, 0], [0, Math.PI / 8, 0]));
  b.add(stone, new THREE.CylinderGeometry(0.42, 0.5, 0.2, 8), mat([0, 0.24, 0], [0, Math.PI / 8, 0]));
  b.add(stone, lathe([[0.0001, 0.34], [0.33, 0.34], [0.3, 0.5], [0.3, 0.62], [0.42, 0.68], [0.48, 0.74], [0.0001, 0.74]], 8), mat([0, 0, 0], [0, Math.PI / 8, 0]));
  // ===== 청동 향로 =====
  const y0 = 0.74;
  // 세 발 (짐승 발 모양)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2;
    b.add(bronze, new THREE.CylinderGeometry(0.03, 0.045, 0.16, 10), mat([x, y0 + 0.08, z], [0, 0, 0]));
    b.add(bronzeHi, new THREE.SphereGeometry(0.05, 10, 8), mat([x * 1.08, y0 + 0.02, z * 1.08], [0, 0, 0], [1, 0.6, 1]));
  }
  // 몸체 (배가 부른 솥 모양)
  const bodyY = y0 + 0.14;
  b.add(bronze, lathe([[0.0001, 0], [0.16, 0.0], [0.27, 0.06], [0.31, 0.16], [0.3, 0.25], [0.27, 0.3], [0.285, 0.33], [0.3, 0.35], [0.27, 0.35], [0.25, 0.32], [0.0001, 0.3]], 48), mat([0, bodyY, 0]));
  b.add(bronzeHi, new THREE.TorusGeometry(0.305, 0.012, 8, 64), mat([0, bodyY + 0.16, 0], [Math.PI / 2, 0, 0]));
  b.add(bronzeHi, new THREE.TorusGeometry(0.29, 0.012, 8, 64), mat([0, bodyY + 0.345, 0], [Math.PI / 2, 0, 0]));
  // 문양 띠 (운문 돌기)
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    b.add(bronzeHi, new THREE.SphereGeometry(0.018, 8, 6), mat([Math.cos(a) * 0.3, bodyY + 0.21, Math.sin(a) * 0.3], [0, 0, 0], [1, 1, 0.6]));
  }
  // 녹청
  b.add(patina, lathe([[0.15, 0.002], [0.26, 0.055], [0.3, 0.13]], 48), mat([0, bodyY - 0.004, 0], [0, 0, 0], [1.01, 1, 1.01]));
  // 양 귀 (손잡이)
  for (const s of [-1, 1]) {
    b.add(bronzeHi, new THREE.TorusGeometry(0.07, 0.016, 8, 20, Math.PI), mat([s * 0.3, bodyY + 0.36, 0], [0, Math.PI / 2, 0]));
  }
  // 재 + 향
  b.add(ash, new THREE.CylinderGeometry(0.255, 0.255, 0.01, 40), mat([0, bodyY + 0.31, 0]));
  root.add(b.build());

  // 향 (기본 꽂힌 향)
  const sticks = new THREE.Group();
  const stickGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.42, 5);
  const tipGeo = new THREE.SphereGeometry(0.007, 6, 4);
  const tips = [];
  const addStick = (x, z, lean) => {
    const g = new THREE.Group();
    const s = new THREE.Mesh(stickGeo, stick); s.position.y = 0.21; g.add(s);
    const t = new THREE.Mesh(tipGeo, ember); t.position.y = 0.42; g.add(t);
    g.position.set(x, bodyY + 0.31, z);
    g.rotation.set(lean[0], 0, lean[1]);
    sticks.add(g); tips.push(t);
    return g;
  };
  for (let i = 0; i < 3; i++) addStick((i - 1) * 0.035, 0, [0, (i - 1) * 0.05]);
  root.add(sticks);

  // ===== 촛대 (좌우) =====
  const candles = [];
  for (const s of [-1, 1]) {
    const cb = new Builder();
    cb.add(brass, lathe([[0.0001, 0], [0.13, 0], [0.13, 0.02], [0.06, 0.06], [0.03, 0.12], [0.025, 0.5], [0.045, 0.53], [0.09, 0.56], [0.08, 0.58], [0.0001, 0.58]], 24));
    cb.add(wax, new THREE.CylinderGeometry(0.04, 0.042, 0.32, 18), mat([0, 0.74, 0]));
    const g = cb.build();
    const flame = new THREE.Mesh(lathe([[0.0001, 0], [0.018, 0.02], [0.022, 0.05], [0.012, 0.09], [0.0001, 0.12]], 12), flameMat);
    flame.position.y = 0.91;
    g.add(flame);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.03), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    wick.position.y = 0.905; g.add(wick);
    g.position.set(s * 0.95, 0, 0.05);
    root.add(g);
    candles.push(flame);
  }
  // 촛대 받침 돌
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.0001, 8), stone);
    p.position.set(s * 0.95, 0.0, 0.05);
    root.add(p);
  }

  // ===== 공양물 (과일 굽다리 접시) =====
  const fruits = new Builder();
  for (const s of [-1, 1]) {
    const x = s * 0.55, z = 0.38;
    fruits.add(brass, lathe([[0.0001, 0], [0.09, 0], [0.04, 0.05], [0.035, 0.14], [0.14, 0.17], [0.15, 0.19], [0.0001, 0.18]], 20), mat([x, 0, z]));
    const fm = s < 0 ? fruitR : fruitO;
    const pile = [[0, 0.24, 0], [0.065, 0.24, 0.03], [-0.06, 0.24, 0.03], [0.0, 0.24, -0.065], [0.0, 0.32, 0.0]];
    for (const [px, py, pz] of pile) fruits.add(fm, new THREE.SphereGeometry(0.055, 14, 10), mat([x + px, py, z + pz]));
    fruits.add(leaf, new THREE.ConeGeometry(0.02, 0.05, 4), mat([x, 0.38, z], [0, 0, 0.3], [1, 1, 0.3]));
  }
  root.add(fruits.build());
  // 절 방석 (향로 앞)
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.07, 0.72, 4, 1, 4), silk);
  cushion.position.set(0, 0.035, 0.95);
  cushion.receiveShadow = true; cushion.castShadow = true;
  root.add(cushion);

  root.traverse((o) => { if (o.isMesh && o.material !== flameMat) { o.castShadow = true; o.receiveShadow = true; } });
  return {
    root, candles, tips, sticks, incenseTop: new THREE.Vector3(0, bodyY + 0.75, 0), ashY: bodyY + 0.31,
    addStick, cushionPos: new THREE.Vector3(0, 0.07, 0.95),
  };
}
