/* 복운수호 하늘 배경 — tuvi.tqd.me처럼 움직이는 별 하늘
   - canvas 별: 반짝이며 천천히 표류
   - 빛나는 글로우: 3.2s 펄스
   - 궤도 고리: 240s 시계 / 180s 반시계 회전
   - 별자리 점선: 1.4s 흐름
   - 고리 펄스: 1.6s / 광자 이동: 2.4s
   - prefers-reduced-motion이면 전부 끔 */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CSS = [
    '#sky-layer{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}',
    '#sky-stars{position:absolute;inset:0;width:100%;height:100%}',
    '.sky-glow{position:absolute;top:-160px;right:-120px;width:560px;height:560px;background:radial-gradient(circle,rgba(201,168,106,.16) 0%,rgba(201,168,106,.06) 42%,transparent 72%);animation:skyStarTwinkle 3.2s ease-in-out infinite}',
    '.sky-svg{position:absolute;inset:0;width:100%;height:100%}',
    '.sky-orbit-slow{transform-box:fill-box;transform-origin:center;animation:skyOrbitClockwise 240s linear infinite}',
    '.sky-orbit-reverse{transform-box:fill-box;transform-origin:center;animation:skyOrbitCounterClockwise 180s linear infinite}',
    '.sky-flow{animation:skyDashFlow 1.4s linear infinite}',
    '.sky-pulse{transform-box:fill-box;transform-origin:center;animation:skyRingPulse 1.6s ease-out infinite}',
    '.sky-twinkle{animation:skyStarTwinkle 3.2s ease-in-out infinite}',
    '.sky-travel{offset-rotate:0deg;animation:skyPhotonTravel 2.4s linear infinite}',
    '@keyframes skyOrbitClockwise{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes skyOrbitCounterClockwise{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}',
    '@keyframes skyDashFlow{from{stroke-dashoffset:14}to{stroke-dashoffset:0}}',
    '@keyframes skyRingPulse{0%{opacity:.85;transform:scale(1)}to{opacity:0;transform:scale(1.45)}}',
    '@keyframes skyStarTwinkle{0%,100%{opacity:.45}50%{opacity:.95}}',
    '@keyframes skyPhotonTravel{from{offset-distance:0%}to{offset-distance:100%}}',
    '@media (prefers-reduced-motion:reduce){#sky-layer{display:none}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var SVG = '<svg class="sky-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
    + '<g fill="none" stroke="#c9a86a" stroke-width="1">'
    + '<g class="sky-orbit-slow" opacity="0.14">'
    + '<circle cx="1100" cy="80" r="110" stroke-dasharray="2 10"/><circle cx="1100" cy="80" r="190" stroke-dasharray="2 10"/><circle cx="1100" cy="80" r="270" stroke-dasharray="2 10"/>'
    + '<circle cx="1100" cy="-30" r="3" fill="#c9a86a" stroke="none"/><circle cx="1210" cy="80" r="3" fill="#c9a86a" stroke="none"/>'
    + '</g>'
    + '<g class="sky-orbit-reverse" opacity="0.14">'
    + '<circle cx="90" cy="720" r="110" stroke-dasharray="2 10"/><circle cx="90" cy="720" r="190" stroke-dasharray="2 10"/><circle cx="90" cy="720" r="270" stroke-dasharray="2 10"/>'
    + '<circle cx="90" cy="830" r="3" fill="#c9a86a" stroke="none"/><circle cx="-20" cy="720" r="3" fill="#c9a86a" stroke="none"/>'
    + '</g>'
    + '<polyline class="sky-flow" points="180,180 240,140 300,180 260,240" stroke-dasharray="6 8" opacity="0.20"/>'
    + '<polyline class="sky-flow" points="900,560 960,520 1020,560 980,620" stroke-dasharray="6 8" opacity="0.20"/>'
    + '<circle class="sky-pulse" cx="600" cy="400" r="26" opacity="0.20"/>'
    + '</g>'
    + '<g fill="#c9a86a">'
    + '<circle cx="180" cy="180" r="2.4" opacity="0.35"/><circle cx="240" cy="140" r="2.4" opacity="0.35"/><circle cx="300" cy="180" r="2.4" opacity="0.35"/><circle cx="260" cy="240" r="2.4" opacity="0.35"/>'
    + '<circle cx="900" cy="560" r="2.4" opacity="0.35"/><circle cx="960" cy="520" r="2.4" opacity="0.35"/><circle cx="1020" cy="560" r="2.4" opacity="0.35"/><circle cx="980" cy="620" r="2.4" opacity="0.35"/>'
    + '<path class="sky-twinkle" d="M0,-6 L1.7,-1.7 L6,0 L1.7,1.7 L0,6 L-1.7,1.7 L-6,0 L-1.7,-1.7 Z" opacity="0.5" transform="translate(480,300)"/>'
    + '<path class="sky-twinkle" d="M0,-6 L1.7,-1.7 L6,0 L1.7,1.7 L0,6 L-1.7,1.7 L-6,0 L-1.7,-1.7 Z" opacity="0.5" transform="translate(760,180)" style="animation-delay:1.1s"/>'
    + '<path class="sky-twinkle" d="M0,-6 L1.7,-1.7 L6,0 L1.7,1.7 L0,6 L-1.7,1.7 L-6,0 L-1.7,-1.7 Z" opacity="0.5" transform="translate(150,620)" style="animation-delay:2s"/>'
    + '<circle class="sky-travel" cx="180" cy="180" r="3.2" style="offset-path:path(\'M180 180 L240 140 L300 180 L260 240\')"/>'
    + '</g></svg>';

  var layer = document.createElement('div');
  layer.id = 'sky-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<canvas id="sky-stars"></canvas><div class="sky-glow"></div>' + SVG;
  document.body.appendChild(layer);

  var cv = document.getElementById('sky-stars');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, stars = [];
  function seed() {
    var n = Math.min(90, Math.floor(W * H / 16000));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.6 + Math.random() * 1.3,
        p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.03
      });
    }
  }
  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    seed();
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.p += 0.02 * s.s;
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x += W; if (s.x > W) s.x -= W;
      if (s.y < 0) s.y += H; if (s.y > H) s.y -= H;
      var a = 0.25 + 0.55 * Math.abs(Math.sin(s.p));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,106,' + a.toFixed(3) + ')';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
