// 복운수호 3D — 지오메트리 도우미
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// 재질별로 지오메트리를 모았다가 한 번에 병합 → 드로우콜 최소화
export class Builder {
  constructor() { this.parts = new Map(); }
  add(material, geometry, matrix) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    if (!g.attributes.uv) {
      const n = g.attributes.position.count;
      g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
    }
    for (const k of Object.keys(g.attributes)) {
      if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    }
    if (matrix) g.applyMatrix4(matrix);
    if (!this.parts.has(material)) this.parts.set(material, []);
    this.parts.get(material).push(g);
    return this;
  }
  box(material, w, h, d, pos, rot, scl) {
    return this.add(material, new THREE.BoxGeometry(w, h, d), mat(pos, rot, scl));
  }
  build({ castShadow = true, receiveShadow = true } = {}) {
    const group = new THREE.Group();
    for (const [material, geos] of this.parts) {
      const merged = mergeGeometries(geos, false);
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = castShadow; mesh.receiveShadow = receiveShadow;
      group.add(mesh);
    }
    return group;
  }
}

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
export function mat(pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) {
  const m = new THREE.Matrix4();
  _e.set(rot[0], rot[1], rot[2], rot[3] || 'XYZ');
  _q.setFromEuler(_e);
  const s = typeof scl === 'number' ? [scl, scl, scl] : scl;
  m.compose(new THREE.Vector3(...pos), _q, new THREE.Vector3(...s));
  return m;
}

export function lathe(points, segments = 32, phiStart = 0, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), segments, phiStart, phiLength);
}

export const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// 표준 PBR 재질 단축
export function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...opts });
}
