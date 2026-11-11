/* 복운수호 하늘 배경 — tuvi.tqd.me처럼 움직이는 별 하늘 (양쪽 대칭)
   - canvas 별: 반짝이며 천천히 표류 + 양쪽 별자리 점선 흐름 + 광자 이동
   - 글로우: 왼쪽 위·오른쪽 위·아래 가운데 3방향 (3.2s 펄스)
   - 네 귀퉁이 궤도 고리: 240s 시계 / 180s 반시계 번갈아 회전
   - 양쪽 세로 장식선: 데스크톱에서만
   - prefers-reduced-motion이면 전부 끔 */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CSS = [
    '#sky-layer{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}',
    '#sky-stars{position:absolute;inset:0;width:100%;height:100%}',
    '.sky-glow{position:absolute;inset:0;background:radial-gradient(circle at 82% 20%,rgba(201,168,106,.20) 0%,transparent 56%),radial-gradient(circle at 14% 24%,rgba(201,168,106,.16) 0%,transparent 48%),radial-gradient(ellipse at 50% 92%,rgba(201,168,106,.14) 0%,transparent 58%);animation:skyStarTwinkle 3.2s ease-in-out infinite}',
    '.sky-corner{position:absolute;width:150px;height:150px}',
    '@media (min-width:768px){.sky-corner{width:240px;height:240px}}',
    '@media (min-width:1280px){.sky-corner{width:320px;height:320px}}',
    '.sky-corner-tl{top:0;left:0}.sky-corner-tr{top:0;right:0}.sky-corner-bl{bottom:0;left:0}.sky-corner-br{bottom:0;right:0}',
    '.sky-corner svg{width:100%;height:100%;display:block}',
    '.sky-strip{position:absolute;top:50%;transform:translateY(-50%);width:20px;height:460px;opacity:.6;display:none}',
    '@media (min-width:1100px){.sky-strip{display:block}}',
    '.sky-strip-l{left:10px}.sky-strip-r{right:10px}',
    '.sky-orbit-slow{transform-box:view-box;animation:skyOrbitClockwise 240s linear infinite}',
    '.sky-orbit-reverse{transform-box:view-box;animation:skyOrbitCounterClockwise 180s linear infinite}',
    '@keyframes skyOrbitClockwise{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes skyOrbitCounterClockwise{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}',
    '@keyframes skyStarTwinkle{0%,100%{opacity:.45}50%{opacity:.95}}',
    '@media (prefers-reduced-motion:reduce){#sky-layer{display:none}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  function corner(cls, cx, cy, origin, orbitCls, dots) {
    return '<div class="sky-corner ' + cls + '"><svg viewBox="0 0 420 420" aria-hidden="true">'
      + '<g class="' + orbitCls + '" style="transform-origin:' + origin + '" fill="none" stroke="#c9a86a" stroke-width="1.3" opacity="0.38">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="115"/>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="190" stroke-dasharray="2 10"/>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="265"/>'
      + dots
      + '</g></svg></div>';
  }
  var dot = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#c9a86a" stroke="none"/>'; };
  var strip = function (cls) {
    return '<svg class="sky-strip ' + cls + '" viewBox="0 0 20 460" aria-hidden="true">'
      + '<line x1="10" y1="0" x2="10" y2="460" stroke="#c9a86a" stroke-width="1" opacity="0.35"/>'
      + '<circle cx="10" cy="40" r="2.5" fill="#c9a86a" opacity="0.5"/><circle cx="10" cy="130" r="2.5" fill="#c9a86a" opacity="0.5"/>'
      + '<path d="M10,215 L16,230 L10,245 L4,230 Z" fill="#c9a86a" opacity="0.55"/>'
      + '<circle cx="10" cy="330" r="2.5" fill="#c9a86a" opacity="0.5"/><circle cx="10" cy="420" r="2.5" fill="#c9a86a" opacity="0.5"/>'
      + '</svg>';
  };

  var layer = document.createElement('div');
  layer.id = 'sky-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<canvas id="sky-stars"></canvas><div class="sky-glow"></div>'
    + corner('sky-corner-tl', 0, 0, '0px 0px', 'sky-orbit-slow', dot(0, -115) + dot(115, 0))
    + corner('sky-corner-tr', 420, 0, '420px 0px', 'sky-orbit-reverse', dot(420, -115) + dot(305, 0))
    + corner('sky-corner-bl', 0, 420, '0px 420px', 'sky-orbit-reverse', dot(0, 535) + dot(115, 420))
    + corner('sky-corner-br', 420, 420, '420px 420px', 'sky-orbit-slow', dot(420, 535) + dot(305, 420))
    + strip('sky-strip-l') + strip('sky-strip-r');
  document.body.appendChild(layer);

  var cv = document.getElementById('sky-stars');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, stars = [], dashOff = 0, photonT = 0;
  var LEFT_PTS = [[0, 0], [38, -26], [72, 6], [48, 34]];
  var RIGHT_PTS = [[0, 0], [-36, -24], [-70, 8], [-44, 36]];
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
  function pathLen(pts) {
    var L = 0;
    for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  }
  function pointAt(pts, d) {
    for (var i = 1; i < pts.length; i++) {
      var seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (d <= seg) {
        var t = seg ? d / seg : 0;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
      d -= seg;
    }
    return pts[pts.length - 1];
  }
  function drawCluster(ax, ay, pts) {
    ctx.beginPath();
    ctx.moveTo(ax + pts[0][0], ay + pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(ax + pts[i][0], ay + pts[i][1]);
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = dashOff;
    ctx.strokeStyle = 'rgba(201,168,106,0.20)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    for (var j = 0; j < pts.length; j++) {
      ctx.beginPath();
      ctx.arc(ax + pts[j][0], ay + pts[j][1], 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,106,0.35)';
      ctx.fill();
    }
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    var i, s;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
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
    dashOff = (dashOff - 0.4) % 14;
    var lax = W * 0.07, lay = H * 0.32, rax = W * 0.93, ray = H * 0.62;
    drawCluster(lax, lay, LEFT_PTS);
    drawCluster(rax, ray, RIGHT_PTS);
    photonT = (photonT + 1 / 144) % 1;
    var p = pointAt(LEFT_PTS, photonT * pathLen(LEFT_PTS));
    ctx.beginPath();
    ctx.arc(lax + p[0], lay + p[1], 3.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(201,168,106,0.85)';
    ctx.fill();
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
