// 복운수호 3D — 향 연기 · 금빛 사리광 · 연꽃잎 비
import * as THREE from 'three';
import * as TX from './textures.js';

// ---------------------------------------------------------------------------
// 범용 포인트 파티클 (크기·투명도·회전을 입자마다)
// ---------------------------------------------------------------------------
class PointCloud {
  constructor(max, texture, { color = 0xffffff, blending = THREE.NormalBlending, scale = 300 } = {}) {
    this.max = max;
    this.items = [];
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.rot = new Float32Array(max);
    this.col = new Float32Array(max * 3).fill(1);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aRot', new THREE.BufferAttribute(this.rot, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending,
      uniforms: { uMap: { value: texture }, uColor: { value: new THREE.Color(color) }, uScale: { value: scale } },
      vertexShader: `
        attribute float aSize; attribute float aAlpha; attribute float aRot; attribute vec3 aColor;
        varying float vAlpha; varying float vRot; varying vec3 vColor;
        uniform float uScale;
        void main(){
          vAlpha = aAlpha; vRot = aRot; vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = aSize * uScale / max(0.1, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uMap; uniform vec3 uColor;
        varying float vAlpha; varying float vRot; varying vec3 vColor;
        void main(){
          vec2 p = gl_PointCoord - 0.5;
          float c = cos(vRot), s = sin(vRot);
          p = vec2(c*p.x - s*p.y, s*p.x + c*p.y) + 0.5;
          vec4 t = texture2D(uMap, p);
          gl_FragColor = vec4(uColor * vColor * t.rgb, t.a * vAlpha);
          if (gl_FragColor.a < 0.003) discard;
        }`,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.geometry = g;
  }
  spawn(p) { if (this.items.length < this.max) this.items.push(p); }
  flush() {
    const n = this.items.length;
    for (let i = 0; i < n; i++) {
      const p = this.items[i];
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.size[i] = p.size; this.alpha[i] = p.alpha; this.rot[i] = p.rot || 0;
      const c = p.color; if (c) { this.col[i * 3] = c[0]; this.col[i * 3 + 1] = c[1]; this.col[i * 3 + 2] = c[2]; }
      else { this.col[i * 3] = this.col[i * 3 + 1] = this.col[i * 3 + 2] = 1; }
    }
    this.geometry.setDrawRange(0, n);
    for (const k of ['position', 'aSize', 'aAlpha', 'aRot', 'aColor']) this.geometry.attributes[k].needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// 향 연기 — 소용돌이치며 피어오르는 연기
// ---------------------------------------------------------------------------
export class IncenseSmoke {
  constructor(scene, origin) {
    this.origin = origin.clone();
    this.cloud = new PointCloud(700, TX.smokePuff(), { color: 0xe9e2d6, scale: 520 });
    this.cloud.points.renderOrder = 5;
    scene.add(this.cloud.points);
    this.intensity = 1; this.target = 1; this.acc = 0; this.t = 0;
    this.extra = []; // 걸어가는 신도의 향 연기 발생원
  }
  boost(ms = 6000) { this.target = 3.2; clearTimeout(this._b); this._b = setTimeout(() => { this.target = 1; }, ms); }
  emitFrom(v, rate = 1) { this.extra.push({ v, rate }); }
  update(dt) {
    this.t += dt;
    this.intensity += (this.target - this.intensity) * Math.min(1, dt * 1.5);
    this.acc += dt * 22 * this.intensity;
    const make = (o, spread, big) => ({
      x: o.x + (Math.random() - 0.5) * spread, y: o.y, z: o.z + (Math.random() - 0.5) * spread,
      vx: (Math.random() - 0.5) * 0.04, vy: 0.32 + Math.random() * 0.22, vz: (Math.random() - 0.5) * 0.04,
      life: 0, max: 5 + Math.random() * 3, size: big ? 0.05 : 0.03, alpha: 0, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.6,
      ph: Math.random() * 6.28,
    });
    while (this.acc > 1) { this.acc -= 1; this.cloud.spawn(make(this.origin, 0.08, this.intensity > 1.5)); }
    for (const e of this.extra) if (Math.random() < e.rate * dt * 14) this.cloud.spawn({ ...make(e.v, 0.01, false), max: 2.5 });
    this.extra.length = 0;
    const items = this.cloud.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) { items.splice(i, 1); continue; }
      // 위로 갈수록 소용돌이 + 바람에 살짝 흘러감
      const swirl = Math.sin(this.t * 0.9 + p.ph + p.y * 2.2) * 0.12 * k;
      p.x += (p.vx + swirl + 0.03 * k) * dt;
      p.z += (p.vz + Math.cos(this.t * 0.7 + p.ph) * 0.05 * k) * dt;
      p.y += p.vy * dt * (1 - k * 0.45);
      p.size = (p.size < 0.05 ? 0.04 : 0.06) + k * 1.3;
      p.alpha = Math.min(1, p.life * 2.2) * Math.pow(1 - k, 1.6) * 0.55;
      p.rot += p.vr * dt;
    }
    this.cloud.flush();
  }
}

// ---------------------------------------------------------------------------
// 금빛 사리광 (향을 올릴 때 · 광배 주변 부유하는 빛가루)
// ---------------------------------------------------------------------------
export class GoldenMotes {
  constructor(scene, center) {
    this.center = center.clone();
    this.cloud = new PointCloud(500, TX.softDot('rgba(255,236,170,1)', 'rgba(255,190,90,0.35)'), { color: 0xffd98a, blending: THREE.AdditiveBlending, scale: 420 });
    scene.add(this.cloud.points);
    this.t = 0;
    for (let i = 0; i < 90; i++) this.cloud.spawn(this.ambient(true));
  }
  ambient(randomLife) {
    const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 3.6;
    return {
      x: this.center.x + Math.cos(a) * r, y: this.center.y - 2 + Math.random() * 6, z: this.center.z + Math.sin(a) * r * 0.6 + 1,
      vx: 0, vy: 0.08 + Math.random() * 0.12, vz: 0, life: randomLife ? Math.random() * 6 : 0, max: 6 + Math.random() * 4,
      size: 0.04 + Math.random() * 0.06, alpha: 0, ph: Math.random() * 6.28, kind: 'amb',
    };
  }
  burst(at, n = 80) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, el = Math.random() * 1.2, sp = 0.8 + Math.random() * 2.4;
      this.cloud.spawn({
        x: at.x, y: at.y, z: at.z,
        vx: Math.cos(a) * Math.cos(el) * sp, vy: Math.sin(el) * sp + 0.6, vz: Math.sin(a) * Math.cos(el) * sp,
        life: 0, max: 1.6 + Math.random() * 1.4, size: 0.05 + Math.random() * 0.08, alpha: 1, ph: 0, kind: 'burst',
      });
    }
  }
  update(dt) {
    this.t += dt;
    const items = this.cloud.items;
    let amb = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) { items.splice(i, 1); continue; }
      if (p.kind === 'amb') {
        amb++;
        p.x += Math.sin(this.t * 0.6 + p.ph) * 0.12 * dt;
        p.y += p.vy * dt;
        p.alpha = Math.sin(k * Math.PI) * (0.55 + 0.45 * Math.sin(this.t * 4 + p.ph));
      } else {
        p.vx *= 1 - dt * 1.4; p.vz *= 1 - dt * 1.4; p.vy = p.vy * (1 - dt * 1.4) - 0.3 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        p.alpha = Math.pow(1 - k, 1.4) * 1.4;
      }
    }
    while (amb++ < 90) items.push(this.ambient(false));
    this.cloud.flush();
  }
}

// ---------------------------------------------------------------------------
// 연꽃잎 비 (InstancedMesh — 팔랑이며 떨어지는 꽃잎)
// ---------------------------------------------------------------------------
export class LotusPetals {
  constructor(scene, area) {
    this.area = area; // {x0,x1,z0,z1,top}
    this.max = 260;
    const geo = new THREE.PlaneGeometry(0.11, 0.2, 1, 3);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.pow(p.getY(i) / 0.1, 2) * 0.02); // 살짝 오목
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: TX.lotusPetal(), transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, roughness: 0.6, emissive: 0x552030, emissiveIntensity: 0.35 });
    this.mesh = new THREE.InstancedMesh(geo, mat, this.max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    scene.add(this.mesh);
    this.items = [];
    this.base = 26;
    for (let i = 0; i < this.base; i++) this.items.push(this.make(true));
    this.dummy = new THREE.Object3D();
  }
  make(randomY) {
    const A = this.area;
    return {
      x: A.x0 + Math.random() * (A.x1 - A.x0), y: randomY ? Math.random() * A.top : A.top + Math.random() * 3,
      z: A.z0 + Math.random() * (A.z1 - A.z0),
      vy: 0.55 + Math.random() * 0.5, ph: Math.random() * 6.28, spin: (Math.random() - 0.5) * 3, flip: 1 + Math.random() * 2,
      rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6, ground: 0, extra: false,
    };
  }
  burst(n = 40) {
    for (let i = 0; i < n && this.items.length < this.max; i++) {
      const p = this.make(false); p.extra = true; p.vy *= 1.5; this.items.push(p);
    }
  }
  update(dt, t) {
    const d = this.dummy;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      if (p.y <= 0.02) {
        p.ground += dt;
        if (p.ground > 2.5) {
          if (p.extra) { this.items.splice(i, 1); continue; }
          Object.assign(p, this.make(false));
        }
      } else {
        p.y -= p.vy * dt;
        p.x += Math.sin(t * 1.3 + p.ph) * 0.35 * dt;
        p.z += Math.cos(t * 0.9 + p.ph) * 0.2 * dt;
        p.rx += p.flip * dt; p.rz += p.spin * dt;
        if (p.y < 0.02) { p.y = 0.02; p.rx = Math.PI / 2; }
      }
    }
    const n = Math.min(this.items.length, this.max);
    for (let i = 0; i < n; i++) {
      const p = this.items[i];
      d.position.set(p.x, p.y, p.z);
      d.rotation.set(p.rx, p.ry, p.rz);
      const s = p.ground > 0 ? Math.max(0, 1 - Math.max(0, p.ground - 1.8) / 0.7) : 1;
      d.scale.setScalar(s);
      d.updateMatrix();
      this.mesh.setMatrixAt(i, d.matrix);
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
