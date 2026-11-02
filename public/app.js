// 복운수호 온라인 사찰 — 9:16 Vertical Engine
// 신도들이 부처님을 향해 예불 & 향 공양 행렬 효과

// ============================================================================
// 24괘 점괘 덱 (오리지널 한국어 점괘)
// ============================================================================
const FORTUNE_DECK = [
  { number: 1, rank: '대길', title: '해돋이 · 日出東方', poem: '동녘 하늘 해 솟으니\n어둠 걷히고 밝아오네\n뜻하는 바 모두 이루고\n귀인 나타나 도우네', meaning: '새로운 시작에 가장 좋은 때입니다. 오랫동안 준비해온 일이 있다면 지금 바로 실행하십시오. 귀인의 도움이 따르고 재물과 명예가 함께 옵니다.' },
  { number: 2, rank: '대길', title: '금련만개 · 金蓮滿開', poem: '황금 연꽃 활짝 피니\n향기 온 누리에 퍼지네\n마음의 소원 이루어지고\n병마 물러나 평안하네', meaning: '마음이 착하면 복이 저절로 옵니다. 재물을 구하면 재물을, 건강을 빌면 건강을 얻습니다. 가족 모두 평안하고 집안에 경사가 생깁니다.' },
  { number: 3, rank: '대길', title: '용문등천 · 龍門登天', poem: '푸른 용이 구름 타고\n하늘 높이 오르도다\n시험과 승진 앞둔 이여\n기뻐하라 때가 왔네', meaning: '운세가 힘차게 오르고 있습니다. 시험, 승진, 사업 확장 등 큰일을 도모하기에 최적기입니다. 주저하지 말고 도전하십시오.' },
  { number: 4, rank: '대길', title: '복성고조 · 福星高照', poem: '복된 별이 높이 비춰\n액운 물러나고 길하네\n재물은 문전성시하고\n집안 대대로 번창하네', meaning: '복성이 비추어 액운이 물러갑니다. 뜻밖의 재물이 들어오고 집안이 화목하며, 하는 일마다 순조롭습니다.' },
  { number: 5, rank: '길', title: '순풍만범 · 順風滿帆', poem: '돛을 달고 순풍 만나\n만 리 파도 헤쳐가네\n가는 길마다 형통하고\n돌아오는 길 복되도다', meaning: '가는 곳마다 일이 순조롭습니다. 여행, 이사, 이직 등 이동과 변화에 길합니다. 다만 방심하지 말고 초심을 지키십시오.' },
  { number: 6, rank: '길', title: '춘화추실 · 春花秋實', poem: '봄에 심은 꽃이 지고\n가을 열매 탐스럽도다\n그간의 노고 헛되지 않아\n이제 수확할 때로다', meaning: '그동안의 노력이 결실을 맺을 때입니다. 인내하며 기다린 보람이 옵니다. 겸손하게 거두어 이웃과 나누면 복이 배가됩니다.' },
  { number: 7, rank: '길', title: '명월청풍 · 明月淸風', poem: '밝은 달과 맑은 바람\n마음의 티끌 씻기네\n번뇌 놓으면 평안 오고\n가정 화목 웃음 가득', meaning: '마음이 평안해지는 시기입니다. 복잡했던 일이 정리되고 인간관계가 좋아집니다. 몸과 마음을 쉬게 하십시오.' },
  { number: 8, rank: '길', title: '감로법우 · 甘露法雨', poem: '단비가 마른 땅 적시듯\n은혜의 비가 내리도다\n병든 몸 차차 낫고\n막힌 일들 풀리도다', meaning: '힘들었던 시기가 지나갑니다. 건강이 회복되고 막혔던 일이 풀립니다. 주변의 도움을 고맙게 받으십시오.' },
  { number: 9, rank: '길', title: '화합가정 · 和合家庭', poem: '온 가족 한마음 되니\n웃음꽃 집안에 피고\n부모는 강녕하시고\n자손은 번창하도다', meaning: '가정에 화목이 찾아옵니다. 멀어졌던 가족과 화해하고, 집안에 경사가 생깁니다. 웃어른을 공경하면 복이 더합니다.' },
  { number: 10, rank: '중길', title: '우과천청 · 雨過天晴', poem: '비 개인 뒤 하늘이 개니\n먹구름 걷히고 밝아오네\n조금만 더 참고 견디면\n꽃길이 앞에 펼쳐지네', meaning: '어려움이 거의 끝나갑니다. 조금만 더 인내하십시오. 곧 운이 트이고 새로운 기회가 옵니다.' },
  { number: 11, rank: '중길', title: '고진감래 · 苦盡甘來', poem: '쓴 것이 다하면 단 것 오고\n겨울 지나면 봄이 오네\n포기하지 않은 자에게\n달콤한 열매 맺히리라', meaning: '고생 끝에 낙이 옵니다. 지금의 어려움은 성공으로 가는 과정입니다. 끝까지 포기하지 마십시오.' },
  { number: 12, rank: '중길', title: '수적천석 · 水滴穿石', poem: '물방울이 바위를 뚫듯\n꾸준함이 쇠를 녹이네\n하루하루 쌓은 정성이\n큰 산을 움직이리라', meaning: '급하게 서두르지 마십시오. 꾸준히 노력하면 반드시 결과가 옵니다. 작은 진전도 소중히 여기십시오.' },
  { number: 13, rank: '중길', title: '동행귀인 · 同行貴人', poem: '길 가는 나그네에게\n동행이 나타나도다\n혼자 끙끙 앓지 말고\n손 내밀면 잡아주리', meaning: '귀인이 나타날 운입니다. 어려운 일이 있으면 주위에 도움을 청하십시오. 좋은 인연이 찾아옵니다.' },
  { number: 14, rank: '중길', title: '정성감천 · 精誠感天', poem: '정성이 지극하면\n하늘도 감동하도다\n기도하는 마음으로\n매일 정진을 다하라', meaning: '진심으로 임하면 하늘이 돕습니다. 기도와 정성을 다하면 소원이 이루어집니다.' },
  { number: 15, rank: '중길', title: '묘향만리 · 妙香萬里', poem: '꽃향기 만 리에 퍼지듯\n그대의 명성 높아지네\n착한 행실 소문나고\n사람들 따르도다', meaning: '평판이 좋아지고 이름이 알려질 운입니다. 겸손하게 처신하면 더 큰 복이 옵니다.' },
  { number: 16, rank: '소길', title: '점진전행 · 漸進前行', poem: '한 걸음 한 걸음씩\n천 리 길도 가도다\n조급해 말고 나아가면\n목적지에 다다르리', meaning: '천천히 나아가도 됩니다. 조급해하지 말고 현재의 속도를 유지하십시오. 꾸준함이 답입니다.' },
  { number: 17, rank: '소길', title: '인내지덕 · 忍耐之德', poem: '참을 인자 가슴에 새겨\n마음에 깊이 두어라\n때 오기 전 움직이면\n일을 그르치느니라', meaning: '지금은 기다림의 미덕이 필요한 때입니다. 때가 오기 전 서두르면 일을 그르칩니다.' },
  { number: 18, rank: '소길', title: '소망성취 · 所願成就', poem: '작은 소원 하나하나\n하늘이 들어주시네\n큰 욕심 버리고 빌면\n반드시 이루어지리', meaning: '작은 소원은 이루어집니다. 큰 욕심보다 가까운 소망부터 빌어보십시오.' },
  { number: 19, rank: '소길', title: '안분지족 · 安分知足', poem: '제 분수 지키며 살면\n마음에 평안 깃드네\n남과 비교 말지어다\n족함을 알면 부자로다', meaning: '현재에 만족하면 평안이 옵니다. 남과 비교하지 말고 가진 것에 감사하십시오.' },
  { number: 20, rank: '평', title: '수심정기 · 隨心定機', poem: '마음 가는 대로 두어라\n억지로 애쓰지 말라\n흐르는 물과 같으니\n자연스레 풀리리라', meaning: '크게 좋지도 나쁘지도 않은 때입니다. 무리하지 말고 자연스럽게 지내십시오. 현상 유지가 최선입니다.' },
  { number: 21, rank: '평', title: '무위자연 · 無爲自然', poem: '하지 않음이 함이요\n비움이 곧 채움이네\n욕심을 내려놓으면\n하늘이 채워주시네', meaning: '애써 구하지 않아도 될 때입니다. 욕심을 내려놓고 자연에 맡기십시오.' },
  { number: 22, rank: '평', title: '관조자성 · 觀照自省', poem: '거울 보듯 나를 보고\n마음을 비추어 보라\n밖에서 찾지 말고\n안에서 답을 찾으라', meaning: '스스로를 돌아볼 때입니다. 답은 밖에 있지 않고 안에 있습니다. 조용히 명상하십시오.' },
  { number: 23, rank: '흉', title: '경거망동계 · 輕擧妄動戒', poem: '경솔히 움직이지 말라\n돌다리도 두드려라\n서두르면 발 헛디디고\n신중하면 화를 면하네', meaning: '경고의 점괘입니다. 지금 큰 결정이나 투자는 피하십시오. 돌다리도 두드려보고 건너듯 신중하십시오. 조심하면 액을 면합니다.' },
  { number: 24, rank: '흉', title: '탐욕경계 · 貪慾警戒', poem: '욕심이 화를 부르니\n탐욕을 경계하라\n나누면 복이 쌓이고\n독차지하면 잃느니라', meaning: '탐욕을 경계하라는 점괘입니다. 무리한 욕심을 부리면 손해를 봅니다. 나누고 베풀면 화가 복으로 바뀝니다.' }
];

// ============================================================================
// 한복 신도 SVG (뒷모습 3종: 앉음 / 향 들고 걸음 / 절)
// ============================================================================
const HANBOK_PALETTE = [
  { top: '#f4a7c3', bottom: '#7a9cc6' },
  { top: '#a8d5ba', bottom: '#e8c86a' },
  { top: '#c3b2e8', bottom: '#f6c6d0' },
  { top: '#f6d186', bottom: '#8fc1d4' },
  { top: '#9ad0c2', bottom: '#e8a2a2' },
  { top: '#d4a5a5', bottom: '#a5b8d4' },
  { top: '#f5f2ea', bottom: '#9aa5b1' },
  { top: '#f9c784', bottom: '#7fb069' }
];
const SKIN = '#f0c297';
const HAIR = '#1e1a16';

function devoteeSeatedImg() {
  return `<img class="devotee-photo" src="${BOKUN_IMAGES.devotee_seated}" alt="신도">`;
}

function devoteeWalkingImg() {
  return `<img class="devotee-photo" src="${BOKUN_IMAGES.devotee_walking}" alt="향 공양">`;
}

function devoteeBowingImg() {
  return `<img class="devotee-photo" src="${BOKUN_IMAGES.devotee_bowing}" alt="절">`;
}

class BokunSuhoApp {
  constructor() {
    this.seats = [];
    this.totalSeats = 48; // 24 left, 24 right (6 rows x 4 cols per side)
    this.devoteesMap = new Map(); // uniqueId -> { seatIndex, user, lastActive }
    this.leaderboard = []; // sorted top donors

    this.ws = null;
    this.isConnected = false;
    this.currentUsername = '';
    this.viewerCount = 0;

    this.isSimulating = false;
    this.simulationInterval = null;

    this.isCeremonyActive = false;
    this.recentGiftTimer = null;

    this.initDOM();
    this.initSeats();
    this.initParticleEngine();
    this.initAudioAndControls();
    this.initWebSocket();
    this.loadInitialDevotees();

    if (window.location.search.includes('modal')) {
      this.toggleModal(true);
    }
    if (window.location.search.includes('test') || window.location.search.includes('danghuong')) {
      setTimeout(() => {
        this.simulateGift(1);
      }, 400);
    }
    if (window.location.search.includes('fortune')) {
      setTimeout(() => {
        this.simulateFortune();
      }, 400);
    }
  }

  initDOM() {
    this.sanctuaryEl = document.getElementById('devotees-sanctuary');
    const buddhaImg = document.getElementById('buddha-statue');
    if (buddhaImg && typeof BOKUN_IMAGES !== 'undefined') buddhaImg.src = BOKUN_IMAGES.buddha;
    const bgImg = document.getElementById('temple-bg');
    if (bgImg && typeof BOKUN_IMAGES !== 'undefined' && BOKUN_IMAGES.bg) bgImg.src = BOKUN_IMAGES.bg;
    this.statusActionEl = document.getElementById('status-action-text');
    this.statusDotEl = document.getElementById('status-indicator-dot');
    this.statusBadgeEl = document.getElementById('status-right-badge');
    this.viewerCountEl = document.getElementById('viewer-count');
    this.giftFeedEl = document.getElementById('left-gift-feed');
    this.centerPopupEl = document.getElementById('center-gift-popup');
    this.popupIconEl = document.getElementById('popup-gift-icon');
    this.popupCountEl = document.getElementById('popup-combo-text');
    this.popupBadgeEl = document.getElementById('popup-badge-pill');
    this.leaderboardListEl = document.getElementById('leaderboard-list');

    // 향 공양 walking actor & toast
    this.walkingActor = document.getElementById('walking-devotee');
    this.walkingSprite = document.getElementById('walking-sprite');
    this.walkingNametag = document.getElementById('walking-nametag');
    this.ceremonyToast = document.getElementById('ceremony-toast');

    // Modals & Toolbar buttons
    this.connectModal = document.getElementById('connect-modal');
    this.tiktokInput = document.getElementById('tiktok-username-input');
    this.btnConnect = document.getElementById('btn-connect-tiktok');
    this.btnDisconnect = document.getElementById('btn-disconnect-tiktok');
    this.connectionStatusBadge = document.getElementById('modal-conn-status');

    // Fortune Oracle Modal elements
    this.fortuneModal = document.getElementById('fortune-modal');
    this.fortuneRankBadge = document.getElementById('fortune-rank-badge');
    this.fortuneTitle = document.getElementById('fortune-title');
    this.fortuneDevotee = document.getElementById('fortune-devotee');
    this.fortunePoem = document.getElementById('fortune-poem');
    this.fortuneMeaning = document.getElementById('fortune-meaning');
    this.btnCloseFortune = document.getElementById('btn-close-fortune');
    this.fortuneCloseTimer = null;

    // Audio & Volume controls in settings modal
    this.btnCfgAudio = document.getElementById('btn-cfg-audio');
    this.btnCfgAmbient = document.getElementById('btn-cfg-ambient');
    this.sliderSfxVol = document.getElementById('slider-sfx-vol');
    this.valSfxVol = document.getElementById('val-sfx-vol');
    this.sliderAmbientVol = document.getElementById('slider-ambient-vol');
    this.valAmbientVol = document.getElementById('val-ambient-vol');
    this.selectAudioTrack = document.getElementById('select-audio-track');
    this.btnTryFortune = document.getElementById('btn-try-fortune');
    this.btnCfgSim = document.getElementById('btn-cfg-sim');
  }

  // Pre-calculate realistic perspective seat positions in 9:16 Korean Temple Hall
  // Devotees sit symmetrically on left and right sides of the red carpet, FACING THE BUDDHA
  initSeats() {
    this.seats = [];
    const rows = 6;
    const colsPerSide = 4;

    for (let r = 0; r < rows; r++) {
      const rowProgress = r / (rows - 1);
      const scale = 0.48 + Math.pow(rowProgress, 1.2) * 0.54;
      const y = 70 + rowProgress * 25;

      for (let c = 0; c < colsPerSide; c++) {
        const colProgress = c / (colsPerSide - 1);
        const leftMin = 13 - rowProgress * 7;
        const leftMax = 42 - rowProgress * 2;
        const x = leftMin + colProgress * (leftMax - leftMin);
        this.seats.push({ id: `L_${r}_${c}`, side: 'left', row: r, col: c, x, y, scale, occupiedBy: null, element: null, colors: HANBOK_PALETTE[(r * colsPerSide + c) % HANBOK_PALETTE.length] });
      }

      for (let c = 0; c < colsPerSide; c++) {
        const colProgress = c / (colsPerSide - 1);
        const rightMin = 58 + rowProgress * 2;
        const rightMax = 87 + rowProgress * 7;
        const x = rightMin + colProgress * (rightMax - rightMin);
        this.seats.push({ id: `R_${r}_${c}`, side: 'right', row: r, col: c, x, y, scale, occupiedBy: null, element: null, colors: HANBOK_PALETTE[(r * colsPerSide + c + 4) % HANBOK_PALETTE.length] });
      }
    }

    this.sanctuaryEl.innerHTML = '';
    this.seats.forEach((seat, idx) => {
      const el = document.createElement('div');
      el.className = 'devotee-seat';
      el.id = `seat-${idx}`;
      el.style.left = `${seat.x}%`;
      el.style.top = `${seat.y}%`;
      el.style.zIndex = Math.round(seat.y * 10);
      el.style.transform = `translate(-50%, -100%) scale(${seat.scale.toFixed(2)})`;
      el.style.display = 'none';

      el.innerHTML = `
        <div class="devotee-sprite-wrap">
          ${devoteeSeatedImg()}
        </div>
        <div class="devotee-name-badge">
          <div class="devotee-badge-avatar">신</div>
          <span class="devotee-badge-name">신도</span>
        </div>
      `;

      seat.element = el;
      this.sanctuaryEl.appendChild(el);
    });
  }

  initParticleEngine() {
    const canvas = document.getElementById('particle-canvas');
    if (canvas && window.ParticleSystem) {
      this.particles = new window.ParticleSystem(canvas);
    }
  }

  initAudioAndControls() {
    document.getElementById('btn-open-connect')?.addEventListener('click', () => this.toggleModal(true));
    document.getElementById('btn-close-modal')?.addEventListener('click', () => this.toggleModal(false));
    this.connectModal?.addEventListener('click', (e) => {
      if (e.target === this.connectModal) this.toggleModal(false);
    });

    this.btnCloseFortune?.addEventListener('click', () => {
      this.fortuneModal?.classList.remove('visible');
    });
    this.fortuneModal?.addEventListener('click', (e) => {
      if (e.target === this.fortuneModal) {
        this.fortuneModal.classList.remove('visible');
      }
    });

    if (this.btnCfgAudio) {
      const isSfxOn = window.templeAudio?.sfxEnabled !== false;
      this.btnCfgAudio.textContent = isSfxOn ? '🔔 효과음: 켜짐' : '🔇 효과음: 꺼짐';
      this.btnCfgAudio.classList.toggle('active', isSfxOn);
      this.btnCfgAudio.addEventListener('click', () => {
        const next = !window.templeAudio?.sfxEnabled;
        window.templeAudio?.setSfxEnabled(next);
        this.btnCfgAudio.textContent = next ? '🔔 효과음: 켜짐' : '🔇 효과음: 꺼짐';
        this.btnCfgAudio.classList.toggle('active', next);
      });
    }

    if (this.sliderSfxVol && this.valSfxVol) {
      const sfxPct = Math.round((window.templeAudio?.sfxVolume || 0.85) * 100);
      this.sliderSfxVol.value = String(sfxPct);
      this.valSfxVol.textContent = `${sfxPct}%`;
      this.sliderSfxVol.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.valSfxVol.textContent = `${val}%`;
        window.templeAudio?.setSfxVolume(val / 100);
      });
    }

    if (this.btnCfgAmbient) {
      const isAmbOn = Boolean(window.templeAudio?.bgMusicEnabled);
      this.btnCfgAmbient.textContent = isAmbOn ? '🪷 명상 음악: 켜짐' : '🪷 명상 음악: 꺼짐';
      this.btnCfgAmbient.classList.toggle('active', isAmbOn);
      this.btnCfgAmbient.addEventListener('click', () => {
        const next = !window.templeAudio?.bgMusicEnabled;
        window.templeAudio?.setMusicEnabled(next);
        this.btnCfgAmbient.textContent = next ? '🪷 명상 음악: 켜짐' : '🪷 명상 음악: 꺼짐';
        this.btnCfgAmbient.classList.toggle('active', next);
      });
    }

    if (this.sliderAmbientVol && this.valAmbientVol) {
      const ambPct = Math.round((window.templeAudio?.bgMusicVolume || 0.60) * 100);
      this.sliderAmbientVol.value = String(ambPct);
      this.valAmbientVol.textContent = `${ambPct}%`;
      this.sliderAmbientVol.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.valAmbientVol.textContent = `${val}%`;
        window.templeAudio?.setMusicVolume(val / 100);
      });
    }

    if (this.selectAudioTrack) {
      window.templeAudio?.loadAudioTracks().then(tracks => {
        if (!tracks || tracks.length === 0) {
          this.selectAudioTrack.innerHTML = '<option value="">(audio/ 폴더에 파일이 없습니다)</option>' +
            '<option value="zen_synthetic" data-title="범종 명상음 (자동 생성)" selected>🪷 범종 명상음 (자동 생성)</option>';
          window.templeAudio?.selectTrack('zen_synthetic', '범종 명상음 (자동 생성)');
          return;
        }

        const currentUrl = window.templeAudio.currentTrackUrl;
        this.selectAudioTrack.innerHTML = tracks.map(t => {
          const selected = t.url === currentUrl ? 'selected' : '';
          const safeTitle = String(t.title).replace(/"/g, '&quot;');
          return `<option value="${t.url}" data-title="${safeTitle}" ${selected}>🎵 ${safeTitle}</option>`;
        }).join('');

        const isSynthetic = currentUrl === 'zen_synthetic' ? 'selected' : '';
        this.selectAudioTrack.innerHTML += `<option value="zen_synthetic" data-title="범종 명상음 (자동 생성)" ${isSynthetic}>🪷 범종 명상음 (자동 생성)</option>`;
      });

      this.selectAudioTrack.addEventListener('change', (e) => {
        const opt = e.target.selectedOptions[0];
        const url = opt ? opt.value : '';
        const title = opt ? opt.getAttribute('data-title') : '';
        window.templeAudio?.selectTrack(url, title);
      });
    }

    const unlockAudio = () => {
      window.templeAudio?.init();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });

    this.btnTryFortune?.addEventListener('click', () => {
      this.simulateFortune();
    });

    this.btnCfgSim?.addEventListener('click', () => this.toggleSimulation());

    const btnFullscreen = document.getElementById('btn-fullscreen');
    btnFullscreen?.addEventListener('click', () => {
      const container = document.querySelector('.stage-container');
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {});
        container.classList.add('fullscreen');
      } else {
        document.exitFullscreen().catch(() => {});
        container.classList.remove('fullscreen');
      }
    });

    this.btnConnect?.addEventListener('click', () => this.connectTikTok());
    this.btnDisconnect?.addEventListener('click', () => this.disconnectTikTok());
    this.tiktokInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.connectTikTok();
    });

    document.getElementById('sim-add-user')?.addEventListener('click', () => this.simulateUserJoin());
    document.getElementById('sim-chat')?.addEventListener('click', () => this.simulateChat());
    document.getElementById('sim-gift-1')?.addEventListener('click', () => this.simulateGift(1));
    document.getElementById('sim-gift-5')?.addEventListener('click', () => this.simulateGift(5));
    document.getElementById('sim-gift-10')?.addEventListener('click', () => this.simulateGift(10));
    document.getElementById('sim-fortune')?.addEventListener('click', () => this.simulateFortune());
  }

  toggleModal(open) {
    if (this.connectModal) {
      this.connectModal.classList.toggle('open', open);
    }
  }

  loadInitialDevotees() {
    const initialNames = [
      '김지훈', '이서연', '박민준', '최하은',
      '정도윤', '강시우', '조지아', '윤현우',
      '장수아', '임준서', '한예준', '오채원',
      '서지민', '신서준', '권하준', '황유나',
      '안태양', '송나연', '류건우', '홍다은',
      '김도현', '이지안', '박서연', '최준혁',
      '정예린', '강하늘', '조민서', '윤재민',
      '장예나', '임도윤', '한지우', '오서준',
      '서연우', '신시아', '권민재', '황지호',
      '안예서', '송민준', '류하린', '홍준서'
    ];

    initialNames.forEach((name, idx) => {
      if (idx < this.seats.length) {
        this.assignDevoteeToSeat(idx, {
          uniqueId: `user_${idx}`,
          nickname: name,
          profilePictureUrl: null
        });
      }
    });

    setTimeout(() => {
      const seat1 = this.seats.findIndex(s => s.occupiedBy?.nickname === '김도현');
      if (seat1 !== -1) this.showSpeechBubble(seat1, '시험 합격을 기원합니다', 60000);

      const seat2 = this.seats.findIndex(s => s.occupiedBy?.nickname === '박민준');
      if (seat2 !== -1) this.showSpeechBubble(seat2, '나무아미타불', 60000);

      const seat3 = this.seats.findIndex(s => s.occupiedBy?.nickname === '최하은');
      if (seat3 !== -1) this.showSpeechBubble(seat3, '관세음보살 🙏', 60000);
    }, 400);

    this.leaderboard = [];
    this.renderLeaderboard();

    this.addGiftAlert({ nickname: '조지아', initials: 'ㅈㅇ', giftName: '향', giftIcon: '🌹', count: 1 });
    this.addGiftAlert({ nickname: '윤현우', initials: 'ㅇㅎ', giftName: '향', giftIcon: '🌹', count: 1 });
    this.addGiftAlert({ nickname: '장수아', initials: 'ㅈㅅ', giftName: '향', giftIcon: '🌹', count: 1 });
  }

  getInitials(name) {
    if (!name) return '신도';
    const clean = name.trim().replace(/\s+/g, '');
    return clean.substring(0, 2);
  }

  assignDevoteeToSeat(seatIndex, user) {
    const seat = this.seats[seatIndex];
    if (!seat) return;

    seat.occupiedBy = user;
    this.devoteesMap.set(user.uniqueId, {
      seatIndex,
      user,
      lastActive: Date.now()
    });

    const el = seat.element;
    const nameEl = el.querySelector('.devotee-badge-name');
    const avatarEl = el.querySelector('.devotee-badge-avatar');

    nameEl.textContent = user.nickname || user.uniqueId;
    if (user.profilePictureUrl) {
      avatarEl.innerHTML = `<img src="${user.profilePictureUrl}" alt="${user.nickname}" />`;
    } else {
      avatarEl.textContent = this.getInitials(user.nickname || user.uniqueId);
    }

    el.style.display = 'flex';
  }

  getAvailableSeat(user) {
    if (this.devoteesMap.has(user.uniqueId)) {
      const data = this.devoteesMap.get(user.uniqueId);
      data.lastActive = Date.now();
      return data.seatIndex;
    }

    for (let i = 0; i < this.seats.length; i++) {
      if (!this.seats[i].occupiedBy) {
        return i;
      }
    }

    let oldestIndex = 0;
    let oldestTime = Infinity;

    for (const [uid, data] of this.devoteesMap.entries()) {
      if (data.lastActive < oldestTime) {
        oldestTime = data.lastActive;
        oldestIndex = data.seatIndex;
      }
    }

    for (const [uid, data] of this.devoteesMap.entries()) {
      if (data.seatIndex === oldestIndex) {
        this.devoteesMap.delete(uid);
        break;
      }
    }

    return oldestIndex;
  }

  handleUserJoin(user) {
    const seatIndex = this.getAvailableSeat(user);
    this.assignDevoteeToSeat(seatIndex, user);

    this.bowSeat(seatIndex);
    this.showSpeechBubble(seatIndex, '나무아미타불 🙏');
    this.updateStatusText(`${user.nickname || user.uniqueId} — 예불 입장`);
  }

  handleUserChat(user, comment) {
    const seatIndex = this.getAvailableSeat(user);
    this.assignDevoteeToSeat(seatIndex, user);

    this.bowSeat(seatIndex);
    window.templeAudio?.playWoodenFish();
    this.showSpeechBubble(seatIndex, comment);
  }

  // =========================================================================
  // 향 공양 의식: 붉은 융단 위를 걸어 올라가 부처님께 절 올리기 (9:16)
  // =========================================================================
  triggerIncenseWalkingCeremony(user, giftData) {
    if (!this.walkingActor) return;

    const nickname = user.nickname || user.uniqueId;
    const count = giftData.repeatCount || 1;
    const coins = (giftData.diamondCount || 1) * count;
    const colors = HANBOK_PALETTE[Math.floor(Math.random() * HANBOK_PALETTE.length)];

    this.walkingNametag.textContent = `${nickname} — 향 공양`;
    if (this.ceremonyToast) {
      this.ceremonyToast.textContent = `🙏 신도 ${nickname}님이 부처님께 마음의 향을 올리고 있습니다 🙏`;
      this.ceremonyToast.classList.add('show');
    }

    // Step 1: Place devotee at bottom of red carpet runner
    this.walkingActor.style.display = 'flex';
    this.walkingActor.style.opacity = '1';
    this.walkingActor.style.top = '93%';
    this.walkingActor.style.transform = 'translate(-50%, -100%) scale(1.02)';
    this.walkingSprite.innerHTML = devoteeWalkingImg();
    this.walkingActor.classList.add('is-walking');

    window.templeAudio?.playIncenseChime();

    // Step 2: Smoothly walk up the red carpet towards the incense burner at top: 77%
    setTimeout(() => {
      this.walkingActor.style.top = '77%';
      this.walkingActor.style.transform = 'translate(-50%, -100%) scale(0.68)';
    }, 50);

    // Step 3: Arrive at Altar (after ~3.2s) -> Kneel down & Prostrate
    setTimeout(() => {
      this.walkingActor.classList.remove('is-walking');
      this.walkingSprite.innerHTML = devoteeSeatedImg();

      setTimeout(() => {
        this.walkingSprite.innerHTML = devoteeBowingImg();

        // Incense urn bursts with sacred smoke & golden sparks!
        this.particles?.boostIncense(6000);
        window.templeAudio?.playBell(coins >= 5 ? 0.9 : 1.0);
        window.templeAudio?.playWoodenFish();

        this.triggerCenterPopup(coins >= 10 ? '🪷' : (coins >= 5 ? '🔔' : '🌹'), count, `신도 ${nickname} 향 공양`);

        // Other devotees bow together in reverence
        this.bowAllDevotees();

        // Step 4: Rise back up to prayer pose after bowing
        setTimeout(() => {
          this.walkingSprite.innerHTML = devoteeSeatedImg();

          setTimeout(() => {
            this.walkingActor.style.transition = 'opacity 1.2s, top 3.4s';
            this.walkingActor.style.opacity = '0';
            if (this.ceremonyToast) this.ceremonyToast.classList.remove('show');
            setTimeout(() => {
              this.walkingActor.style.display = 'none';
              this.walkingActor.style.transition = 'top 3.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
            }, 1300);
          }, 2400);

        }, 1800);

      }, 500);

    }, 3300);
  }

  handleUserGift(user, giftData) {
    const seatIndex = this.getAvailableSeat(user);
    this.assignDevoteeToSeat(seatIndex, user);

    const diamondCount = giftData.diamondCount || 1;
    const repeatCount = giftData.repeatCount || 1;
    const totalCoins = diamondCount * repeatCount;

    this.triggerIncenseWalkingCeremony(user, giftData);

    this.updateStatusText(`${user.nickname} — 향 공양 올림`);

    this.addGiftAlert({
      nickname: user.nickname || user.uniqueId,
      initials: this.getInitials(user.nickname || user.uniqueId),
      giftName: giftData.giftName || '향',
      giftIcon: totalCoins >= 10 ? '🪷' : (totalCoins >= 5 ? '🔔' : '🌹'),
      count: repeatCount
    });

    this.updateLeaderboard(user, totalCoins);
  }

  bowSeat(seatIndex) {
    const seat = this.seats[seatIndex];
    if (seat && seat.element) {
      seat.element.classList.remove('bowing');
      void seat.element.offsetWidth;
      seat.element.classList.add('bowing');

      setTimeout(() => {
        seat.element.classList.remove('bowing');
      }, 1600);
    }
  }

  bowAllDevotees() {
    this.seats.forEach((seat, idx) => {
      if (seat.occupiedBy) {
        setTimeout(() => this.bowSeat(idx), (seat.row * 80) + (Math.random() * 70));
      }
    });
  }

  showSpeechBubble(seatIndex, text, durationMs = 5000) {
    const seat = this.seats[seatIndex];
    if (!seat || !seat.element) return;

    const oldBubble = seat.element.querySelector('.speech-bubble');
    if (oldBubble) oldBubble.remove();

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    const displayComment = text.length > 32 ? text.substring(0, 30) + '...' : text;
    bubble.textContent = displayComment;

    seat.element.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
    }, durationMs);
  }

  updateStatusText(text) {
    if (this.statusActionEl) {
      this.statusActionEl.textContent = text;
    }
  }

  addGiftAlert(item) {
    if (!this.giftFeedEl) return;

    const card = document.createElement('div');
    card.className = 'gift-alert-card';
    card.innerHTML = `
      <div class="gift-alert-user">
        <div class="gift-alert-avatar">${item.initials}</div>
        <div class="gift-alert-text">
          <span class="gift-user-name">${item.nickname}</span>
          <span class="gift-action-desc">${item.giftName} 공양</span>
        </div>
      </div>
      <div class="gift-alert-icon-count">
        <span>${item.giftIcon}</span>
        <span class="combo-x">x${item.count}</span>
      </div>
    `;

    this.giftFeedEl.appendChild(card);

    while (this.giftFeedEl.children.length > 3) {
      this.giftFeedEl.removeChild(this.giftFeedEl.firstChild);
    }

    setTimeout(() => {
      card.style.transition = 'opacity 0.4s, transform 0.4s';
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      setTimeout(() => card.remove(), 400);
    }, 5000);
  }

  triggerCenterPopup(icon, count, badgeText) {
    if (!this.centerPopupEl) return;

    this.popupIconEl.textContent = icon;
    this.popupCountEl.textContent = `x${count}`;
    this.popupBadgeEl.textContent = badgeText;

    this.centerPopupEl.classList.add('show');

    clearTimeout(this.recentGiftTimer);
    this.recentGiftTimer = setTimeout(() => {
      this.centerPopupEl.classList.remove('show');
    }, 3200);
  }

  updateLeaderboard(user, coins) {
    const uniqueId = user.uniqueId || '';
    const nickname = user.nickname || uniqueId || '신도';
    const existing = this.leaderboard.find(item =>
      (uniqueId && item.uniqueId === uniqueId) || item.nickname === nickname
    );
    if (existing) {
      existing.score += coins;
      if (nickname && nickname !== existing.nickname) {
        existing.nickname = nickname;
        existing.initials = this.getInitials(nickname);
      }
    } else {
      this.leaderboard.push({
        uniqueId: uniqueId,
        nickname: nickname,
        initials: this.getInitials(nickname),
        score: coins
      });
    }

    this.leaderboard.sort((a, b) => b.score - a.score);
    this.renderLeaderboard();
  }

  resetLeaderboard() {
    this.leaderboard = [];
    this.renderLeaderboard();
  }

  renderLeaderboard() {
    if (!this.leaderboardListEl) return;
    this.leaderboardListEl.innerHTML = '';

    if (this.leaderboard.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'leaderboard-empty';
      emptyLi.textContent = '아직 공양하신 분이 없습니다';
      this.leaderboardListEl.appendChild(emptyLi);
      return;
    }

    const top10 = this.leaderboard.slice(0, 10);
    top10.forEach((item, index) => {
      const rank = index + 1;
      const li = document.createElement('li');
      li.className = `leaderboard-item rank-${rank}`;
      li.innerHTML = `
        <div class="rank-left">
          <span class="rank-num-badge">${rank}</span>
          <span class="rank-avatar-initials">${item.initials}</span>
          <span class="rank-username" title="${item.nickname}">${item.nickname}</span>
        </div>
        <span class="rank-score">${item.score}🪙</span>
      `;
      this.leaderboardListEl.appendChild(li);
    });
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('복운수호 백엔드 서버에 연결됨');
        this.fetchServerStatus();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerEvent(msg);
        } catch (e) {
          console.error('WS 메시지 파싱 오류', e);
        }
      };

      this.ws.onclose = () => {
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (e) {
      console.error('WebSocket 연결 오류:', e);
    }
  }

  async fetchServerStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      this.updateConnectionState(data.isConnected, data.currentUsername, data.viewerCount);
      const badge = document.getElementById('conn-mode-badge');
      if (badge) {
        badge.textContent = '🟢 직접 연결 (API 불필요)';
      }
    } catch (e) {}
  }

  handleServerEvent(msg) {
    switch (msg.type) {
      case 'status':
        this.updateConnectionState(msg.isConnected, msg.currentUsername, msg.viewerCount);
        break;

      case 'connected':
        this.updateConnectionState(true, msg.username, msg.viewerCount || 1);
        this.updateStatusText(`LIVE 연결됨: @${msg.username}`);
        window.templeAudio?.playBell(1.0);
        this.resetLeaderboard();
        break;

      case 'disconnected':
        this.updateConnectionState(false, '', 0);
        this.updateStatusText('틱톡 연결 안 됨');
        this.resetLeaderboard();
        break;

      case 'roomUser':
        this.setViewerCount(msg.viewerCount);
        break;

      case 'member':
        this.handleUserJoin(msg.user);
        break;

      case 'chat':
        this.handleUserChat(msg.user, msg.comment);
        break;

      case 'gift':
        this.handleUserGift(msg.user, msg);
        break;

      case 'like':
        this.particles?.burstLotusShower(3);
        break;

      case 'drawFortune':
        this.triggerFortuneCeremony(msg.user, msg.fortune);
        break;
    }
  }

  updateConnectionState(isConnected, username, viewerCount = 0) {
    this.isConnected = isConnected;
    this.currentUsername = username || '';
    this.setViewerCount(viewerCount);

    if (isConnected) {
      this.statusDotEl?.classList.remove('offline');
      this.statusBadgeEl?.classList.add('live');
      this.statusBadgeEl.innerHTML = `<span class="badge-dot"></span> LIVE <span id="viewer-count">${this.viewerCount}</span>`;

      if (this.connectionStatusBadge) {
        this.connectionStatusBadge.className = 'status-badge-live';
        this.connectionStatusBadge.textContent = `● 연결 중: @${username}`;
      }
      if (this.btnConnect) this.btnConnect.style.display = 'none';
      if (this.btnDisconnect) this.btnDisconnect.style.display = 'block';
    } else {
      this.statusDotEl?.classList.add('offline');
      this.statusBadgeEl?.classList.remove('live');
      this.statusBadgeEl.innerHTML = `<span class="badge-dot"></span> OFFLINE <span id="viewer-count">0</span>`;

      if (this.connectionStatusBadge) {
        this.connectionStatusBadge.className = 'status-badge-offline';
        this.connectionStatusBadge.textContent = `● 연결 안 됨`;
      }
      if (this.btnConnect) this.btnConnect.style.display = 'block';
      if (this.btnDisconnect) this.btnDisconnect.style.display = 'none';
    }
  }

  setViewerCount(count) {
    this.viewerCount = count || 0;
    const el = document.getElementById('viewer-count');
    if (el) el.textContent = this.viewerCount;
  }

  async connectTikTok() {
    let username = this.tiktokInput?.value.trim();
    if (!username) {
      alert('틱톡 username 또는 LIVE 링크를 입력하세요 (예: @bokunsuho 또는 LIVE 방 링크 붙여넣기)');
      return;
    }

    this.btnConnect.disabled = true;
    this.btnConnect.textContent = '연결 중...';

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        this.resetLeaderboard();
        this.toggleModal(false);
      } else {
        alert('연결 오류: ' + (data.message || 'LIVE 방에 연결할 수 없습니다'));
      }
    } catch (e) {
      alert('서버에 연결 요청을 보낼 수 없습니다');
    } finally {
      this.btnConnect.disabled = false;
      this.btnConnect.textContent = '연결';
    }
  }

  async disconnectTikTok() {
    try {
      await fetch('/api/disconnect', { method: 'POST' });
    } catch (e) {}
    this.resetLeaderboard();
  }

  toggleSimulation() {
    this.isSimulating = !this.isSimulating;

    if (this.btnCfgSim) {
      this.btnCfgSim.textContent = this.isSimulating
        ? '🤖 자동 시뮬레이션: 켜짐'
        : '🤖 자동 시뮬레이션: 꺼짐';
      this.btnCfgSim.classList.toggle('active', this.isSimulating);
    }

    if (this.isSimulating) {
      this.updateStatusText('라이브 시뮬레이션 실행 중');
      this.setViewerCount(Math.floor(50 + Math.random() * 80));

      this.simulationInterval = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.25) {
          this.simulateUserJoin();
        } else if (rand < 0.55) {
          this.simulateChat();
        } else if (rand < 0.78) {
          const coinTiers = [1, 1, 1, 5, 5, 10];
          const coins = coinTiers[Math.floor(Math.random() * coinTiers.length)];
          this.simulateGift(coins);
        } else {
          this.simulateFortune();
        }
      }, 4000);
    } else {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }
    }
  }

  // =========================================================================
  // 점괘 의식 (FORTUNE ORACLE CEREMONY)
  // =========================================================================
  triggerFortuneCeremony(user, fortune) {
    if (!fortune) {
      fortune = FORTUNE_DECK[Math.floor(Math.random() * FORTUNE_DECK.length)];
    }

    const nickname = user?.nickname || user?.uniqueId || '신도';

    // 1. 점통 흔드는 소리 + 옥쟁반 소리
    window.templeAudio?.playFortuneShake();
    setTimeout(() => {
      window.templeAudio?.playIncenseChime();
    }, 650);

    // 2. 착석 후 절 올리기
    const seatIndex = this.getAvailableSeat(user);
    this.assignDevoteeToSeat(seatIndex, user);
    this.bowSeat(seatIndex);
    this.showSpeechBubble(seatIndex, `🎋 점괘: 제${fortune.number}괘 (${fortune.rank})`, 8000);

    // 3. 안내 배너
    if (this.ceremonyToast) {
      this.ceremonyToast.textContent = `🎋 신도 ${nickname}님이 제${fortune.number}괘 — ${fortune.rank}을 뽑으셨습니다 🎋`;
      this.ceremonyToast.classList.add('show');
      setTimeout(() => {
        if (!this.isCeremonyActive) this.ceremonyToast.classList.remove('show');
      }, 7000);
    }

    // 4. 점괘 풀이 모달 열기
    if (this.fortuneModal) {
      if (this.fortuneRankBadge) this.fortuneRankBadge.textContent = fortune.rank;
      if (this.fortuneTitle) this.fortuneTitle.textContent = `제 ${fortune.number}괘 — ${fortune.title}`;
      if (this.fortuneDevotee) this.fortuneDevotee.textContent = `구하는 이: ${nickname}`;
      if (this.fortunePoem) this.fortunePoem.textContent = fortune.poem;
      if (this.fortuneMeaning) this.fortuneMeaning.textContent = `풀이: ${fortune.meaning}`;

      this.fortuneModal.classList.add('visible');

      clearTimeout(this.fortuneCloseTimer);
      this.fortuneCloseTimer = setTimeout(() => {
        this.fortuneModal.classList.remove('visible');
      }, 11000);
    }

    this.updateStatusText(`${nickname} — 점괘 뽑음`);
  }

  simulateFortune() {
    const user = this.getRandomSimulatedUser();
    const fortune = FORTUNE_DECK[Math.floor(Math.random() * FORTUNE_DECK.length)];
    this.triggerFortuneCeremony(user, fortune);
  }

  getRandomSimulatedUser() {
    const names = [
      '김지훈', '이서연', '박민준', '최하은',
      '정도윤', '강시우', '조지아', '윤현우',
      '장수아', '임준서', '한예준', '오채원',
      '서지민', '신서준', '권하준', '황유나'
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    return {
      uniqueId: 'sim_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      nickname: name,
      profilePictureUrl: null
    };
  }

  simulateUserJoin() {
    const user = this.getRandomSimulatedUser();
    this.handleUserJoin(user);
    this.setViewerCount(this.viewerCount + 1);
  }

  simulateChat() {
    const prayers = [
      '나무아미타불 🙏',
      '관세음보살 🙏',
      '가족의 건강을 기원합니다',
      '시험 합격을 기원합니다',
      '석가모니불',
      '사업 번창을 기원합니다',
      '부모님의 무병장수를 기원합니다',
      '공덕 회향합니다 🙏',
      '참회합니다 🙏',
      '국태민안을 기원합니다'
    ];
    const user = this.getRandomSimulatedUser();
    const comment = prayers[Math.floor(Math.random() * prayers.length)];
    this.handleUserChat(user, comment);
  }

  simulateGift(coins = 1) {
    const user = this.getRandomSimulatedUser();
    let giftName = '향';
    if (coins >= 10) giftName = '황금 연꽃';
    else if (coins >= 5) giftName = '범종';

    this.handleUserGift(user, {
      giftName,
      diamondCount: coins,
      repeatCount: 1
    });
  }
}

// Start application on page load
window.addEventListener('DOMContentLoaded', () => {
  window.bokunApp = new BokunSuhoApp();
});
