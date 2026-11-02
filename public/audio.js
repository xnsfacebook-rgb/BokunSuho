// 복운수호 — Web Audio API 불교 사찰 사운드 & 명상 음악 신디사이저
// 기능:
// - 범종 소리 (풍부한 배음이 있는 신성한 청동 범종)
// - 목탁 소리 (텅 빈 나무 목탁 타악기)
// - 점통 흔드는 소리 (대나무 점괘통)
// - 향 공양 옥쟁반 소리 (5음계 신성한 싱잉볼)
// - 명상 음악 (티베탄 싱잉볼 드론 코드 + 5음계 명상 배음)
// - 효과음(SFX)과 배경 음악(Music) 개별 음량 조절

class TempleAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // 저장된 음량 설정 불러오기 (기본값: 효과음 85%, 음악 60%)
    const savedSfxVol = localStorage.getItem('bokun_sfx_vol');
    const savedMusicVol = localStorage.getItem('bokun_music_vol');
    const savedMusicOn = localStorage.getItem('bokun_ambient_enabled');
    const savedSfxOn = localStorage.getItem('bokun_sfx_enabled');

    this.sfxVolume = savedSfxVol !== null ? parseFloat(savedSfxVol) : 0.85;
    this.bgMusicVolume = savedMusicVol !== null ? parseFloat(savedMusicVol) : 0.60;
    this.sfxEnabled = savedSfxOn !== 'false';
    this.bgMusicEnabled = savedMusicOn === 'true'; // 사용자가 켜기 전까지 꺼짐

    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this.ambientNodes = [];
    this.chimeTimer = null;

    // 배경 음악용 HTML5 오디오 플레이어 (mp3, wav 등)
    this.bgAudio = new Audio();
    this.bgAudio.loop = true;
    this.bgAudio.preload = 'auto';
    this.bgAudio.volume = this.bgMusicVolume;

    this.bgAudio.addEventListener('ended', () => {
      this.bgAudio.currentTime = 0;
      this.bgAudio.play().catch(e => console.warn('Audio loop retry:', e));
    });

    this.tracks = [];
    this.currentTrackUrl = localStorage.getItem('bokun_selected_audio_url') || '';
    this.currentTrackTitle = localStorage.getItem('bokun_selected_audio_title') || '';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.bgMusicEnabled && this.bgAudio.paused && this.currentTrackUrl && this.currentTrackUrl !== 'zen_synthetic') {
      this.playCurrentMusic();
    }
  }

  // /audio 폴더의 음악 파일 목록 불러오기
  async loadAudioTracks() {
    try {
      const res = await fetch('/api/audioList');
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        this.tracks = data.tracks;
        if (!this.currentTrackUrl && this.tracks.length > 0) {
          this.currentTrackUrl = this.tracks[0].url;
          this.currentTrackTitle = this.tracks[0].title;
          localStorage.setItem('bokun_selected_audio_url', this.currentTrackUrl);
          localStorage.setItem('bokun_selected_audio_title', this.currentTrackTitle);
        }
      }
    } catch (err) {
      console.warn('음악 목록을 불러올 수 없습니다:', err);
    }
    return this.tracks;
  }

  // 목록에서 특정 곡 선택
  selectTrack(url, title = '') {
    this.currentTrackUrl = url || '';
    this.currentTrackTitle = title || '';
    localStorage.setItem('bokun_selected_audio_url', this.currentTrackUrl);
    localStorage.setItem('bokun_selected_audio_title', this.currentTrackTitle);

    if (this.bgMusicEnabled) {
      this.playCurrentMusic();
    }
  }

  // 현재 곡 재생 (끝나면 자동 반복)
  playCurrentMusic() {
    if (!this.bgMusicEnabled || this.isMuted) return;

    if (this.currentTrackUrl === 'zen_synthetic' || !this.currentTrackUrl) {
      this.bgAudio.pause();
      this.startZenAmbient();
      return;
    }

    this.stopZenAmbient();

    const targetUrl = this.currentTrackUrl;
    if (this.bgAudio.src !== targetUrl && !this.bgAudio.src.endsWith(encodeURI(targetUrl)) && !this.bgAudio.src.endsWith(targetUrl)) {
      this.bgAudio.src = targetUrl;
    }

    this.bgAudio.loop = true;
    this.bgAudio.volume = Math.max(0, Math.min(1, this.bgMusicVolume));
    const playPromise = this.bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('오디오 재생에 사용자 동작이 필요합니다:', err.message);
      });
    }
  }

  stopCurrentMusic() {
    this.bgAudio.pause();
    this.stopZenAmbient();
  }

  // --- 음량 & 토글 ---

  setSfxEnabled(enabled) {
    this.sfxEnabled = Boolean(enabled);
    localStorage.setItem('bokun_sfx_enabled', String(this.sfxEnabled));
    return this.sfxEnabled;
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    localStorage.setItem('bokun_sfx_vol', String(this.sfxVolume));
  }

  setMusicEnabled(enabled) {
    this.bgMusicEnabled = Boolean(enabled);
    localStorage.setItem('bokun_ambient_enabled', String(this.bgMusicEnabled));
    if (this.bgMusicEnabled) {
      this.playCurrentMusic();
    } else {
      this.stopCurrentMusic();
    }
    return this.bgMusicEnabled;
  }

  setMusicVolume(vol) {
    this.bgMusicVolume = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    localStorage.setItem('bokun_music_vol', String(this.bgMusicVolume));
    if (this.bgAudio) {
      this.bgAudio.volume = this.bgMusicVolume;
    }
    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted || !this.bgMusicEnabled ? 0 : this.bgMusicVolume * 0.12;
      this.ambientGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted || !this.bgMusicEnabled ? 0 : this.bgMusicVolume * 0.12;
      this.ambientGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  // --------------------------------------------------------------------------
  // 1. 범종 소리 (신성한 청동 범종)
  // --------------------------------------------------------------------------
  playBell(pitchScale = 1.0) {
    if (this.isMuted || !this.sfxEnabled || this.sfxVolume <= 0.01) return;
    this.init();

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    const effGain = 0.8 * this.sfxVolume;
    masterGain.gain.setValueAtTime(effGain, t);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 6.5);
    masterGain.connect(this.ctx.destination);

    const baseFreq = 216 * pitchScale;
    const partials = [
      { ratio: 0.5, gain: 0.6, decay: 5.5 },
      { ratio: 1.0, gain: 1.0, decay: 5.0 },
      { ratio: 1.18, gain: 0.45, decay: 4.2 },
      { ratio: 1.5, gain: 0.5, decay: 3.8 },
      { ratio: 2.0, gain: 0.4, decay: 3.2 },
      { ratio: 2.74, gain: 0.35, decay: 2.5 },
      { ratio: 3.42, gain: 0.25, decay: 2.0 },
      { ratio: 4.15, gain: 0.15, decay: 1.4 },
      { ratio: 5.4, gain: 0.08, decay: 0.9 },
    ];

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(1.2, t);
    lfoGain.gain.setValueAtTime(4.0, t);
    lfo.connect(lfoGain);
    lfo.start(t);
    lfo.stop(t + 6.0);

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, t);
      lfoGain.connect(osc.frequency);

      pGain.gain.setValueAtTime(0.0001, t);
      pGain.gain.linearRampToValueAtTime(p.gain, t + 0.015);
      pGain.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);

      osc.connect(pGain);
      pGain.connect(masterGain);

      osc.start(t);
      osc.stop(t + p.decay + 0.1);
    });

    // 금속 타격음
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.06, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, t);
    noiseFilter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start(t);
  }

  // --------------------------------------------------------------------------
  // 2. 목탁 소리 (나무 목탁 타악기)
  // --------------------------------------------------------------------------
  playWoodenFish(pitchMultiplier = 1.0) {
    if (this.isMuted || !this.sfxEnabled || this.sfxVolume <= 0.01) return;
    this.init();

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    const effGain = 0.9 * this.sfxVolume;
    masterGain.gain.setValueAtTime(effGain, t);
    masterGain.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(780 * pitchMultiplier, t);
    osc1.frequency.exponentialRampToValueAtTime(620 * pitchMultiplier, t + 0.045);

    gain1.gain.setValueAtTime(0.85, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(t);
    osc1.stop(t + 0.06);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(360 * pitchMultiplier, t);
    osc2.frequency.exponentialRampToValueAtTime(290 * pitchMultiplier, t + 0.07);

    gain2.gain.setValueAtTime(0.6, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(t);
    osc2.stop(t + 0.08);

    const clickBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.015, this.ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickBuffer.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.003));
    }
    const click = this.ctx.createBufferSource();
    click.buffer = clickBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(2.0, t);

    click.connect(filter);
    filter.connect(masterGain);
    click.start(t);
  }

  // --------------------------------------------------------------------------
  // 3. 점통 흔드는 소리 (대나무 점괘통)
  // --------------------------------------------------------------------------
  playFortuneShake() {
    if (this.isMuted || !this.sfxEnabled || this.sfxVolume <= 0.01) return;
    this.init();

    // 점통을 흔드는 7연타
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        const pitch = 1.30 + (i % 3) * 0.16 + Math.random() * 0.08;
        this.playWoodenFish(pitch);
      }, i * 95);
    }
  }

  // --------------------------------------------------------------------------
  // 4. 향 공양 쟁반 소리 (5음계 싱잉볼)
  // --------------------------------------------------------------------------
  playIncenseChime() {
    if (this.isMuted || !this.sfxEnabled || this.sfxVolume <= 0.01) return;
    this.init();

    const t = this.ctx.currentTime;
    const notes = [587.33, 659.25, 880.00, 1046.50, 1318.51];

    notes.forEach((freq, idx) => {
      const delay = idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      const eff = 0.2 * this.sfxVolume;
      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(eff, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 1.3);
    });
  }

  // --------------------------------------------------------------------------
  // 5. 명상 음악 (젠 앰비언트 드론 & 차임)
  // --------------------------------------------------------------------------
  startZenAmbient() {
    this.init();
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;

    const t = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    const targetGain = this.isMuted || !this.bgMusicEnabled ? 0 : this.bgMusicVolume * 0.12;
    this.ambientGain.gain.setValueAtTime(0.0001, t);
    this.ambientGain.gain.linearRampToValueAtTime(targetGain, t + 1.5);
    this.ambientGain.connect(this.ctx.destination);

    // 따뜻한 싱잉볼 드론 코드
    const freqs = [136.1, 272.2, 408.3, 544.4];
    this.ambientNodes = [];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const lfo = this.ctx.createOscillator();
      const lfoG = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12 + idx * 0.04, t);
      lfoG.gain.setValueAtTime(1.5, t);
      lfo.connect(osc.frequency);
      lfo.start(t);

      g.gain.setValueAtTime(0.24 / (idx + 1), t);

      osc.connect(g);
      g.connect(this.ambientGain);
      osc.start(t);

      this.ambientNodes.push(osc, lfo);
    });

    // 주기적인 잔잔한 명상 차임
    const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    let noteIdx = 0;
    const playZenChime = () => {
      if (!this.isAmbientPlaying || !this.bgMusicEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const freq = PENTATONIC[noteIdx % PENTATONIC.length];
        noteIdx++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const chimeGain = this.bgMusicVolume * 0.04;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(chimeGain, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc.connect(gain);
        gain.connect(this.ambientGain);
        osc.start(now);
        osc.stop(now + 4.3);
      } catch (_) {}
    };

    this.chimeTimer = setInterval(playZenChime, 3800);
  }

  stopZenAmbient() {
    this.isAmbientPlaying = false;
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.ambientNodes.forEach(node => {
          try { node.stop(); } catch(e){}
        });
        this.ambientNodes = [];
      }, 1100);
    }
  }

  toggleZenAmbient(enable) {
    if (enable === undefined) {
      enable = !this.isAmbientPlaying;
    }
    return this.setMusicEnabled(enable);
  }
}

window.templeAudio = new TempleAudio();
