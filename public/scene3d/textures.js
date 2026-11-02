// 복운수호 3D — 절차적 캔버스 텍스처 (이미지 파일 없이 코드로 생성)
import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// 결정적 난수 (매번 같은 무늬)
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTex(c, { repeat = [1, 1], srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function speckle(ctx, w, h, n, r, colorFn, rand) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colorFn(rand());
    const x = rand() * w, y = rand() * h, s = r * (0.4 + rand());
    ctx.fillRect(x, y, s, s);
  }
}

// ---------------------------------------------------------------------------
// 화강암 박석 마당 (color + bump)
// ---------------------------------------------------------------------------
export function stonePavers() {
  const S = 1024;
  const [c, x] = canvas(S, S);
  const [b, bx] = canvas(S, S);
  const rand = rng(7);
  x.fillStyle = '#6d6a66'; x.fillRect(0, 0, S, S);
  bx.fillStyle = '#000'; bx.fillRect(0, 0, S, S);
  const rows = 6;
  const rh = S / rows;
  for (let r = 0; r < rows; r++) {
    let px = -rand() * 120;
    while (px < S) {
      const w = 130 + rand() * 120;
      const tone = 92 + rand() * 40;
      const g = x.createLinearGradient(px, r * rh, px + w, (r + 1) * rh);
      g.addColorStop(0, `rgb(${tone + 6},${tone + 3},${tone - 2})`);
      g.addColorStop(1, `rgb(${tone - 10},${tone - 12},${tone - 14})`);
      x.fillStyle = g;
      x.fillRect(px + 3, r * rh + 3, w - 6, rh - 6);
      bx.fillStyle = `rgb(${180 + rand() * 60 | 0},${180 + rand() * 60 | 0},200)`;
      bx.fillRect(px + 4, r * rh + 4, w - 8, rh - 8);
      px += w;
    }
  }
  speckle(x, S, S, 26000, 2.2, (v) => v > 0.5 ? `rgba(30,28,26,${0.15 + v * 0.2})` : `rgba(220,215,205,${0.08 + v * 0.18})`, rand);
  speckle(bx, S, S, 16000, 2, (v) => `rgba(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0},0.35)`, rand);
  // 이끼/얼룩
  for (let i = 0; i < 40; i++) {
    const gx = rand() * S, gy = rand() * S, gr = 30 + rand() * 90;
    const g = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, 'rgba(40,46,34,0.18)'); g.addColorStop(1, 'rgba(40,46,34,0)');
    x.fillStyle = g; x.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  }
  return { map: toTex(c, { repeat: [7, 7] }), bump: toTex(b, { repeat: [7, 7], srgb: false }) };
}

// 다듬은 돌 (기단·석등·대좌)
export function cutStone(seed = 3, base = [150, 146, 138]) {
  const S = 512;
  const [c, x] = canvas(S, S);
  const rand = rng(seed);
  x.fillStyle = `rgb(${base.join(',')})`; x.fillRect(0, 0, S, S);
  speckle(x, S, S, 14000, 2, (v) => v > 0.55 ? `rgba(40,38,36,${0.1 + v * 0.25})` : `rgba(240,236,228,${0.05 + v * 0.2})`, rand);
  for (let i = 0; i < 25; i++) {
    const gx = rand() * S, gy = rand() * S, gr = 20 + rand() * 80;
    const g = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, 'rgba(60,58,50,0.14)'); g.addColorStop(1, 'rgba(60,58,50,0)');
    x.fillStyle = g; x.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  }
  return toTex(c, { repeat: [1, 1] });
}

// ---------------------------------------------------------------------------
// 붉은 융단 (보상화문 + 금색 테두리)
// ---------------------------------------------------------------------------
export function carpet() {
  const W = 512, H = 1024;
  const [c, x] = canvas(W, H);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#5e0a10'); g.addColorStop(0.5, '#8e121b'); g.addColorStop(1, '#5e0a10');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // 테두리
  x.fillStyle = '#c99a3a'; x.fillRect(18, 0, 10, H); x.fillRect(W - 28, 0, 10, H);
  x.fillStyle = '#3c060a'; x.fillRect(32, 0, 26, H); x.fillRect(W - 58, 0, 26, H);
  x.strokeStyle = '#d9ab4a'; x.lineWidth = 3;
  for (let y = 0; y < H; y += 32) {
    x.beginPath(); x.moveTo(36, y); x.lineTo(54, y + 16); x.lineTo(36, y + 32); x.stroke();
    x.beginPath(); x.moveTo(W - 36, y); x.lineTo(W - 54, y + 16); x.lineTo(W - 36, y + 32); x.stroke();
  }
  // 보상화(연꽃) 메달리온
  const medal = (cx, cy, r) => {
    x.save(); x.translate(cx, cy);
    x.strokeStyle = 'rgba(214,170,80,0.85)'; x.lineWidth = 3;
    x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.stroke();
    x.fillStyle = 'rgba(214,170,80,0.55)';
    for (let i = 0; i < 8; i++) {
      x.rotate(Math.PI / 4);
      x.beginPath(); x.moveTo(0, -r * 0.18);
      x.quadraticCurveTo(r * 0.32, -r * 0.55, 0, -r * 0.9);
      x.quadraticCurveTo(-r * 0.32, -r * 0.55, 0, -r * 0.18); x.fill();
    }
    x.fillStyle = 'rgba(240,200,110,0.9)';
    x.beginPath(); x.arc(0, 0, r * 0.16, 0, Math.PI * 2); x.fill();
    x.restore();
  };
  for (let y = 128; y < H; y += 256) medal(W / 2, y, 120);
  x.fillStyle = 'rgba(214,170,80,0.35)';
  for (let y = 0; y < H; y += 256) {
    x.beginPath(); x.moveTo(W / 2, y - 22); x.lineTo(W / 2 + 22, y); x.lineTo(W / 2, y + 22); x.lineTo(W / 2 - 22, y); x.fill();
  }
  // 직물 결
  const rand = rng(11);
  speckle(x, W, H, 20000, 1.5, (v) => `rgba(0,0,0,${v * 0.12})`, rand);
  return toTex(c, { repeat: [1, 4] });
}

// ---------------------------------------------------------------------------
// 단청 (머리초 문양 보 텍스처)
// ---------------------------------------------------------------------------
const DC = { green: '#2f8a6a', deep: '#1e5a52', blue: '#2f5f9e', red: '#b3262b', vermil: '#d0532f', yellow: '#e8b33c', white: '#f4efe2', black: '#141414', pink: '#d9767c' };
export const DANCHEONG = DC;

export function dancheongBeam() {
  const W = 1024, H = 128;
  const [c, x] = canvas(W, H);
  x.fillStyle = DC.green; x.fillRect(0, 0, W, H);
  // 위아래 띠
  const bands = [[0, 6, DC.black], [6, 6, DC.white], [12, 8, DC.red], [H - 20, 8, DC.red], [H - 12, 6, DC.white], [H - 6, 6, DC.black]];
  for (const [y, h, col] of bands) { x.fillStyle = col; x.fillRect(0, y, W, h); }
  // 머리초 — 연꽃/석류동 문양 반복
  const unit = 256;
  for (let u = 0; u < W; u += unit) {
    const cx = u + unit / 2, cy = H / 2;
    // 녹색 바탕 위 청색 휘(물결)
    for (let k = 0; k < 4; k++) {
      x.fillStyle = [DC.blue, DC.white, DC.deep, DC.white][k];
      x.beginPath();
      const w0 = 112 - k * 14;
      x.ellipse(cx, cy, w0, 40 - k * 6, 0, 0, Math.PI * 2);
      x.fill();
    }
    // 연꽃 (주홍 + 분홍)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      x.save(); x.translate(cx, cy); x.rotate(a);
      x.fillStyle = i % 2 ? DC.pink : DC.vermil;
      x.beginPath(); x.ellipse(0, -18, 8, 16, 0, 0, Math.PI * 2); x.fill();
      x.restore();
    }
    x.fillStyle = DC.yellow; x.beginPath(); x.arc(cx, cy, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = DC.red; x.beginPath(); x.arc(cx, cy, 4, 0, Math.PI * 2); x.fill();
    // 양쪽 휘 문양 (V 꺾쇠)
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        x.strokeStyle = [DC.white, DC.blue, DC.white][k]; x.lineWidth = 4;
        const ox = cx + s * (122 - k * 7);
        x.beginPath(); x.moveTo(ox, 24); x.lineTo(ox - s * 10, cy); x.lineTo(ox, H - 24); x.stroke();
      }
    }
  }
  return toTex(c, { repeat: [1, 1] });
}

// 서까래 끝 (단청 원형 문양)
export function rafterEnd() {
  const S = 128;
  const [c, x] = canvas(S, S);
  const ring = [[64, DC.black], [58, DC.white], [52, DC.green], [40, DC.white], [34, DC.blue], [22, DC.white], [16, DC.red], [7, DC.yellow]];
  for (const [r, col] of ring) { x.fillStyle = col; x.beginPath(); x.arc(64, 64, r, 0, Math.PI * 2); x.fill(); }
  return toTex(c, {});
}

// ---------------------------------------------------------------------------
// 꽃살문 (빛이 새어나오는 창호지)
// ---------------------------------------------------------------------------
export function flowerLatticeDoor() {
  const W = 256, H = 512;
  const [c, x] = canvas(W, H);
  const [e, ex] = canvas(W, H);
  // 창호지 빛
  const g = ex.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, H * 0.6);
  g.addColorStop(0, '#ffd894'); g.addColorStop(1, '#c47a2c');
  ex.fillStyle = g; ex.fillRect(0, 0, W, H);
  x.fillStyle = '#f2d39a'; x.fillRect(0, 0, W, H);
  // 살대
  const wood = '#5a2c18';
  const drawLattice = (ctx, col, lw) => {
    ctx.strokeStyle = col; ctx.lineWidth = lw;
    const step = 32;
    for (let k = -H; k < W + H; k += step) {
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + H, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k + H, 0); ctx.lineTo(k, H); ctx.stroke();
    }
    ctx.lineWidth = lw * 0.8;
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // 교차점 꽃
    for (let yy = 0; yy <= H; yy += step) {
      for (let xx = (yy / step) % 2 ? step / 2 : 0; xx <= W; xx += step) {
        ctx.fillStyle = col;
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2;
          ctx.beginPath(); ctx.ellipse(xx + Math.cos(a) * 5, yy + Math.sin(a) * 5, 4, 2.5, a, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  };
  drawLattice(x, wood, 5);
  drawLattice(ex, '#000', 5);
  // 문틀
  for (const ctx of [x, ex]) {
    ctx.strokeStyle = ctx === x ? '#6b1f16' : '#000'; ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, W - 18, H - 18);
    ctx.fillStyle = ctx === x ? '#6b1f16' : '#000';
    ctx.fillRect(0, H * 0.72, W, 18);
  }
  return { map: toTex(c, {}), emissive: toTex(e, {}) };
}

// ---------------------------------------------------------------------------
// 기와 (암키와/수키와 골) — color + bump
// ---------------------------------------------------------------------------
export function roofTiles() {
  const W = 512, H = 512;
  const [c, x] = canvas(W, H);
  const [b, bx] = canvas(W, H);
  const rand = rng(21);
  const cols = 8, cw = W / cols;
  for (let i = 0; i < cols; i++) {
    const gx = x.createLinearGradient(i * cw, 0, (i + 1) * cw, 0);
    gx.addColorStop(0, '#1b1d22'); gx.addColorStop(0.5, '#4d525c'); gx.addColorStop(1, '#1b1d22');
    x.fillStyle = gx; x.fillRect(i * cw, 0, cw, H);
    const gb = bx.createLinearGradient(i * cw, 0, (i + 1) * cw, 0);
    gb.addColorStop(0, '#000'); gb.addColorStop(0.5, '#fff'); gb.addColorStop(1, '#000');
    bx.fillStyle = gb; bx.fillRect(i * cw, 0, cw, H);
  }
  // 기와 단 (가로 이음)
  for (let y = 0; y < H; y += 64) {
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(0, y, W, 5);
    bx.fillStyle = 'rgba(0,0,0,0.6)'; bx.fillRect(0, y, W, 5);
  }
  speckle(x, W, H, 6000, 2, (v) => `rgba(${v > 0.5 ? '200,205,215' : '0,0,0'},${0.05 + v * 0.08})`, rand);
  return { map: toTex(c, {}), bump: toTex(b, { srgb: false }) };
}

// 막새 (기와 끝, 연화문)
export function tileEnd() {
  const S = 128;
  const [c, x] = canvas(S, S);
  x.fillStyle = '#3b3f47'; x.beginPath(); x.arc(64, 64, 64, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#5a606b';
  for (let i = 0; i < 8; i++) {
    x.save(); x.translate(64, 64); x.rotate(i * Math.PI / 4);
    x.beginPath(); x.ellipse(0, -30, 9, 20, 0, 0, Math.PI * 2); x.fill(); x.restore();
  }
  x.fillStyle = '#6c7380'; x.beginPath(); x.arc(64, 64, 11, 0, Math.PI * 2); x.fill();
  return toTex(c, {});
}

// ---------------------------------------------------------------------------
// 현판 "大雄殿"
// ---------------------------------------------------------------------------
export function signboard(text = '大雄殿') {
  const W = 1024, H = 400;
  const [c, x] = canvas(W, H);
  x.fillStyle = DC.green; x.fillRect(0, 0, W, H);
  const fr = [[0, DC.red], [14, DC.yellow], [22, DC.blue], [42, DC.white], [48, '#101a2a']];
  for (const [o, col] of fr) { x.fillStyle = col; x.fillRect(o, o, W - o * 2, H - o * 2); }
  x.fillStyle = '#f2c55a';
  x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 8; x.shadowOffsetY = 4;
  x.font = '900 230px "Noto Serif KR", "Noto Serif CJK KR", "Noto Serif CJK", serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, W / 2, H / 2 + 8);
  return toTex(c, {});
}

// ---------------------------------------------------------------------------
// 공용 스프라이트 텍스처
// ---------------------------------------------------------------------------
export function softDot(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.35)') {
  const S = 128;
  const [c, x] = canvas(S, S);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(0.35, mid); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return toTex(c, {});
}

export function smokePuff() {
  const S = 128;
  const [c, x] = canvas(S, S);
  const rand = rng(5);
  for (let i = 0; i < 14; i++) {
    const px = 64 + (rand() - 0.5) * 50, py = 64 + (rand() - 0.5) * 50, r = 18 + rand() * 30;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
  }
  return toTex(c, {});
}

export function lotusPetal() {
  const W = 64, H = 128;
  const [c, x] = canvas(W, H);
  const g = x.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, '#fff2f5'); g.addColorStop(0.55, '#ffb3c6'); g.addColorStop(1, '#ff6f96');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(W / 2, H - 4);
  x.bezierCurveTo(-6, H * 0.6, 6, H * 0.18, W / 2, 2);
  x.bezierCurveTo(W - 6, H * 0.18, W + 6, H * 0.6, W / 2, H - 4); x.fill();
  x.strokeStyle = 'rgba(255,120,160,0.5)'; x.lineWidth = 1.5;
  for (const dx of [-8, 0, 8]) { x.beginPath(); x.moveTo(W / 2, H - 8); x.quadraticCurveTo(W / 2 + dx, H / 2, W / 2 + dx * 0.5, 14); x.stroke(); }
  return toTex(c, {});
}

export function moonGlow() {
  const S = 256;
  const [c, x] = canvas(S, S);
  const img = x.createImageData(S, S);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const r = Math.hypot(i - S / 2, j - S / 2) / (S / 2);
    const a = r >= 1 ? 0 : Math.exp(-r * 5.5) * 0.9 + Math.exp(-r * 2.2) * 0.18 * (1 - r);
    const k = (j * S + i) * 4;
    img.data[k] = 255; img.data[k + 1] = 244; img.data[k + 2] = 222; img.data[k + 3] = Math.min(255, a * 255);
  }
  x.putImageData(img, 0, 0);
  return toTex(c, {});
}

export function moonTex() {
  const S = 256;
  const [c, x] = canvas(S, S);
  const g = x.createRadialGradient(110, 110, 10, 128, 128, 118);
  g.addColorStop(0, '#fffbea'); g.addColorStop(0.8, '#f1ead2'); g.addColorStop(1, '#d9d0b4');
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 118, 0, Math.PI * 2); x.fill();
  const rand = rng(9);
  for (let i = 0; i < 26; i++) {
    const px = 128 + (rand() - 0.5) * 170, py = 128 + (rand() - 0.5) * 170, r = 6 + rand() * 26;
    if (Math.hypot(px - 128, py - 128) + r > 112) continue;
    x.fillStyle = `rgba(150,140,115,${0.12 + rand() * 0.16})`; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
  }
  return toTex(c, {});
}

// 한복 치마 (스란단 금박 띠)
export function chimaFabric(base, band = '#e6bf5c') {
  const W = 256, H = 256;
  const [c, x] = canvas(W, H);
  x.fillStyle = base; x.fillRect(0, 0, W, H);
  // 주름 음영
  for (let i = 0; i < 16; i++) {
    const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.10)');
    x.fillStyle = g; x.fillRect(i * 16, 0, 16, H);
  }
  // 금박 스란단
  x.fillStyle = band; x.fillRect(0, 18, W, 4); x.fillRect(0, 50, W, 4);
  x.fillStyle = 'rgba(230,191,92,0.85)';
  for (let i = 0; i < 16; i++) {
    const cx = i * 16 + 8;
    x.beginPath(); x.arc(cx, 36, 5, 0, Math.PI * 2); x.fill();
  }
  return toTex(c, { repeat: [1, 1] });
}

// 밤하늘 별 (스카이돔 보조)
export function mountainLayer(seed, color, top, rough) {
  const W = 2048, H = 512;
  const [c, x] = canvas(W, H);
  const rand = rng(seed);
  x.fillStyle = color;
  x.beginPath(); x.moveTo(0, H);
  let y = top + rand() * 80;
  for (let px = 0; px <= W; px += 8) {
    y += (rand() - 0.5) * rough;
    const ridge = top + Math.sin(px / 260 + seed) * 70 + Math.sin(px / 97 + seed * 2) * 22;
    y = y * 0.85 + ridge * 0.15;
    x.lineTo(px, y);
  }
  x.lineTo(W, H); x.closePath(); x.fill();
  // 소나무 실루엣
  for (let i = 0; i < 160; i++) {
    const px = rand() * W;
    x.beginPath();
    const h = 16 + rand() * 26;
    const baseY = H; // 아래쪽은 이미 칠해짐
    void baseY;
    x.ellipse(px, top + 60 + rand() * 140, 6 + rand() * 8, h / 2, 0, 0, Math.PI * 2);
    x.fill();
  }
  return toTex(c, { repeat: [1, 1] });
}
