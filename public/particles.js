// Particle System for Lotus Petals, Golden Incense Smoke & Halo Radiance (9:16 Vertical)

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.petals = [];
    this.smokeParticles = [];
    this.sparkles = [];
    this.incenseIntensity = 1.0;
    this.targetIncenseIntensity = 1.0;

    this.maxPetals = 45;
    this.initPetals();

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx.scale(dpr, dpr);
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
  }

  initPetals() {
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    const w = this.cssWidth || 540;
    const h = this.cssHeight || 960;
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -30 - Math.random() * 40,
      size: 10 + Math.random() * 11,
      speedY: 0.9 + Math.random() * 1.3,
      speedX: -0.3 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.04,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.65 + Math.random() * 0.35,
      color: Math.random() > 0.3 ? '#ff9ebb' : '#ffb6c1'
    };
  }

  boostIncense(durationMs = 5000) {
    this.targetIncenseIntensity = 3.4;
    for (let i = 0; i < 35; i++) {
      this.sparkles.push(this.createSparkle(true));
    }
    setTimeout(() => {
      this.targetIncenseIntensity = 1.0;
    }, durationMs);
  }

  burstLotusShower(count = 35) {
    for (let i = 0; i < count; i++) {
      const p = this.createPetal(false);
      p.y = -10 - Math.random() * 50;
      p.speedY = 1.7 + Math.random() * 2.1;
      this.petals.push(p);
    }
    setTimeout(() => {
      if (this.petals.length > this.maxPetals) {
        this.petals.splice(this.maxPetals);
      }
    }, 8000);
  }

  createSmoke() {
    const w = this.cssWidth || 540;
    const h = this.cssHeight || 960;
    // Incense burner center in 9:16 vertical temple background is at x = 50.5%, y = 57%
    const originX = w * 0.505;
    const originY = h * 0.57;

    return {
      x: originX + (Math.random() - 0.5) * 16,
      y: originY + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.55,
      vy: -(1.2 + Math.random() * 1.4) * (this.incenseIntensity > 1.5 ? 1.4 : 1.0),
      radius: 5 + Math.random() * 8,
      growth: 0.18 + Math.random() * 0.15,
      alpha: (0.35 + Math.random() * 0.25) * Math.min(1.8, this.incenseIntensity),
      life: 0,
      maxLife: 95 + Math.random() * 55,
      glow: Math.random() > 0.35
    };
  }

  createSparkle(isBurst = false) {
    const w = this.cssWidth || 540;
    const h = this.cssHeight || 960;
    const originX = w * 0.505;
    const originY = isBurst ? h * 0.56 : h * 0.45;

    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? 1.5 + Math.random() * 3.5 : 0.4 + Math.random() * 1.2;

    return {
      x: originX + (isBurst ? (Math.random() - 0.5) * 40 : (Math.random() - 0.5) * 120),
      y: originY + (isBurst ? (Math.random() - 0.5) * 35 : (Math.random() - 0.5) * 160),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? 0.8 : 0.4),
      radius: 1.5 + Math.random() * 2.5,
      alpha: 0.9,
      decay: 0.012 + Math.random() * 0.015,
      color: Math.random() > 0.3 ? '#ffe680' : '#ffffff'
    };
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.angle);
    this.ctx.scale(1, Math.cos(p.flip));

    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size);
    this.ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size);

    const grad = this.ctx.createLinearGradient(0, -p.size, 0, p.size);
    grad.addColorStop(0, '#ff6b9d');
    grad.addColorStop(0.5, '#ffa8cb');
    grad.addColorStop(1, '#ffffff');

    this.ctx.fillStyle = grad;
    this.ctx.globalAlpha = p.opacity;
    this.ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.fill();

    this.ctx.restore();
  }

  animate() {
    const w = this.cssWidth || 540;
    const h = this.cssHeight || 960;

    this.ctx.clearRect(0, 0, w, h);

    this.incenseIntensity += (this.targetIncenseIntensity - this.incenseIntensity) * 0.05;

    // 1. Incense Smoke Column
    const smokeSpawnRate = this.incenseIntensity > 1.5 ? 4 : 2;
    for (let k = 0; k < smokeSpawnRate; k++) {
      if (Math.random() < 0.85) {
        this.smokeParticles.push(this.createSmoke());
      }
    }

    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const s = this.smokeParticles[i];
      s.life++;
      s.x += s.vx + Math.sin(s.life * 0.04) * 0.3;
      s.y += s.vy;
      s.radius += s.growth;

      const progress = s.life / s.maxLife;
      const alpha = (1 - progress) * s.alpha;

      if (progress >= 1 || alpha <= 0.01) {
        this.smokeParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

      const grad = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
      if (s.glow || this.incenseIntensity > 1.5) {
        grad.addColorStop(0, `rgba(255, 235, 170, ${alpha * 0.85})`);
        grad.addColorStop(0.5, `rgba(255, 220, 140, ${alpha * 0.45})`);
        grad.addColorStop(1, `rgba(255, 200, 100, 0)`);
      } else {
        grad.addColorStop(0, `rgba(240, 240, 245, ${alpha * 0.65})`);
        grad.addColorStop(0.5, `rgba(220, 220, 230, ${alpha * 0.35})`);
        grad.addColorStop(1, `rgba(200, 200, 210, 0)`);
      }

      this.ctx.fillStyle = grad;
      this.ctx.globalAlpha = 1.0;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Sacred Sparkles
    if (Math.random() < 0.25 || this.incenseIntensity > 1.5) {
      this.sparkles.push(this.createSparkle(false));
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= sp.decay;

      if (sp.alpha <= 0.02) {
        this.sparkles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = sp.color;
      this.ctx.globalAlpha = sp.alpha;
      this.ctx.shadowColor = '#ffeaa7';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Falling Lotus Petals
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.02) * 0.4;
      p.angle += p.angularSpeed;
      p.flip += p.flipSpeed;

      if (p.y > h + 30) {
        Object.assign(p, this.createPetal(false));
      }

      this.drawPetal(p);
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleSystem = ParticleSystem;
