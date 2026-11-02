// 복운수호 3D — SDF 조형 (점토로 빚듯 부드럽게 이어진 표면을 마칭큐브로 메쉬화)
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

export const sd = {
  // 타원체 (근사)
  ellipsoid(px, py, pz, c, r) {
    const x = (px - c[0]), y = (py - c[1]), z = (pz - c[2]);
    const k0 = Math.sqrt((x / r[0]) ** 2 + (y / r[1]) ** 2 + (z / r[2]) ** 2);
    const k1 = Math.sqrt((x / (r[0] * r[0])) ** 2 + (y / (r[1] * r[1])) ** 2 + (z / (r[2] * r[2])) ** 2);
    return k1 === 0 ? -Math.min(...r) : k0 * (k0 - 1) / k1;
  },
  sphere(px, py, pz, c, r) {
    return Math.hypot(px - c[0], py - c[1], pz - c[2]) - r;
  },
  // 둥근 원뿔 (반지름이 변하는 캡슐)
  cone(px, py, pz, a, b, ra, rb) {
    const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
    const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
    const L2 = bax * bax + bay * bay + baz * baz;
    let h = (pax * bax + pay * bay + paz * baz) / L2;
    h = h < 0 ? 0 : h > 1 ? 1 : h;
    const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h);
  },
  // 곡선 위를 따라가는 가는 관 (옷주름)
  polyline(px, py, pz, pts, r) {
    let d = 1e9;
    for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, sd.cone(px, py, pz, pts[i], pts[i + 1], r, r));
    return d;
  },
};
export function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
export function smax(a, b, k) { return -smin(-a, -b, k); }

// prims: [{ d:(x,y,z)=>dist, k:blend, bbox:[minx,miny,minz,maxx,maxy,maxz], sub:false }]
export function sculpt(prims, { center, half, res = 112, maxPoly = 200000 }) {
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, maxPoly);
  mc.isolation = 0;
  const f = mc.field;
  const size = mc.size, size2 = mc.size2, hs = mc.halfsize;
  const far = 0.08; // 경계 상자 바깥 여유
  const evalAt = (wx, wy, wz) => {
    let d = 1;
    for (let i = 0; i < prims.length; i++) {
      const p = prims[i];
      const bb = p.bbox;
      if (bb && (wx < bb[0] - far || wy < bb[1] - far || wz < bb[2] - far || wx > bb[3] + far || wy > bb[4] + far || wz > bb[5] + far)) continue;
      const di = p.d(wx, wy, wz);
      if (p.sub) d = smax(d, -di, p.k || 0.01);
      else d = p.k ? smin(d, di, p.k) : Math.min(d, di);
    }
    return d;
  };
  const W = (i) => ((i - hs) / hs) * half;
  // 1단계: 4×4×4 블록 중심에서 거리 측정 → 표면에서 먼 블록은 통째로 채움 (빈 공간 건너뛰기)
  const B = 4, step = (2 * half) / size, blockR = step * B * 0.9;
  for (let bz = 0; bz < size; bz += B) for (let by = 0; by < size; by += B) for (let bx = 0; bx < size; bx += B) {
    const cx = center[0] + W(bx + B / 2 - 0.5), cy = center[1] + W(by + B / 2 - 0.5), cz = center[2] + W(bz + B / 2 - 0.5);
    const dc = evalAt(cx, cy, cz);
    const coarse = Math.abs(dc) > blockR * 1.8;
    for (let z = bz; z < Math.min(size, bz + B); z++) {
      const wz = center[2] + W(z);
      for (let y = by; y < Math.min(size, by + B); y++) {
        const wy = center[1] + W(y);
        const row = y * size + z * size2;
        for (let x = bx; x < Math.min(size, bx + B); x++) {
          f[x + row] = -(coarse ? dc : evalAt(center[0] + W(x), wy, wz)) * 100;
        }
      }
    }
  }
  mc.update();
  const n = mc.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i += 3) {
    pos[i] = center[0] + mc.positionArray[i] * half;
    pos[i + 1] = center[1] + mc.positionArray[i + 1] * half;
    pos[i + 2] = center[2] + mc.positionArray[i + 2] * half;
    const nx = mc.normalArray[i], ny = mc.normalArray[i + 1], nz = mc.normalArray[i + 2];
    const l = Math.hypot(nx, ny, nz) || 1;
    nor[i] = nx / l; nor[i + 1] = ny / l; nor[i + 2] = nz / l;
  }
  mc.geometry.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  g.computeBoundingSphere();
  return g;
}

// 프리미티브 생성 도우미 (경계 상자 자동 계산)
export const P = {
  ell(c, r, k = 0) {
    return { d: (x, y, z) => sd.ellipsoid(x, y, z, c, r), k, bbox: [c[0] - r[0], c[1] - r[1], c[2] - r[2], c[0] + r[0], c[1] + r[1], c[2] + r[2]] };
  },
  sph(c, r, k = 0) {
    return { d: (x, y, z) => sd.sphere(x, y, z, c, r), k, bbox: [c[0] - r, c[1] - r, c[2] - r, c[0] + r, c[1] + r, c[2] + r] };
  },
  cone(a, b, ra, rb, k = 0) {
    const m = Math.max(ra, rb);
    return { d: (x, y, z) => sd.cone(x, y, z, a, b, ra, rb), k, bbox: [Math.min(a[0], b[0]) - m, Math.min(a[1], b[1]) - m, Math.min(a[2], b[2]) - m, Math.max(a[0], b[0]) + m, Math.max(a[1], b[1]) + m, Math.max(a[2], b[2]) + m] };
  },
  // 부드러운 곡선 관 (CatmullRom 샘플링)
  curve(pts, r, k = 0.01, samples = 10) {
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const s = c.getPoints(samples * (pts.length - 1)).map((p) => [p.x, p.y, p.z]);
    const bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (const p of s) for (let i = 0; i < 3; i++) { bb[i] = Math.min(bb[i], p[i] - r); bb[i + 3] = Math.max(bb[i + 3], p[i] + r); }
    return { d: (x, y, z) => sd.polyline(x, y, z, s, r), k, bbox: bb };
  },
  sub(prim, k = 0.01) { return { ...prim, sub: true, k }; },
};
