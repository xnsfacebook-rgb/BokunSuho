# 🌸 복운수호 온라인 사찰 — 향 공양 (9:16 세로형)

틱톡 LIVE용 **한국식 온라인 사찰** 무대입니다. 세로 **9:16** 규격으로 틱톡 LIVE Studio / OBS Studio / Electron 데스크톱 앱에 바로 쓸 수 있습니다.

> 베트남 원작(`chuaonline-electron-no-api`)의 구조를 그대로 살리고, 모든 화면·의식·점괘를 **한국 사찰 풍**으로 다시 지은 프로젝트입니다.

---

## ✨ 주요 기능

### 1. 9:16 세로 무대 (틱톡 LIVE & Electron)
- 1080x1920 / 540x960 세로 규격 — 휴대폰 틱톡 LIVE 화면과 완벽 호환
- **Electron** 데스크톱 앱으로 바로 실행하거나 **OBS Studio / 틱톡 LIVE Studio** 브라우저 소스로 사용

### 2. 부처님을 향한 신도들
- 붉은 융단 좌우에 48석 — 한복 입은 신도들이 모두 **부처님을 향해** 합장하고 앉습니다
- 범종 소리·댓글·공양이 있을 때마다 신도들이 함께 **절**을 올립니다

### 3. 향 공양 의식 — 붉은 융단 행렬
선물(공양)을 받으면:
1. 신도가 붉은 융단 끝에 **향 3자루**를 들고 나타납니다
2. 안내 배너: `🙏 신도 [이름]님이 부처님께 마음의 향을 올리고 있습니다 🙏`
3. 융단을 따라 걸어 올라가 향로 앞에서 **꿇어앉아 큰절**을 올립니다
4. 향로에서 성스러운 연기가 피어오르고 **범종**과 **목탁** 소리가 울리며, 모든 신도가 함께 절합니다
5. 의식이 끝나면 신도가 자리로 돌아갑니다

### 4. 점괘 뽑기 (24괘)
- 댓글에 `점괘`, `관음점`, `신점`, `운세`, `뽑기`가 들어오면 자동으로 점통을 흔들고 **점괘 풀이**를 열어드립니다
- 대길 4 · 길 5 · 중길 6 · 소길 4 · 평 3 · 흉 2 — **오리지널 한국어 24괘** (괘사 4행시 + 풀이)

### 5. 그 외
- **공덕함**: 코인 공양 Top 10 자동 집계
- **연꽃비**: 좋아요를 누르면 연꽃잎이 흩날립니다
- **댓글**: 신도가 절하며 기원 말풍선 + 목탁 소리
- **시뮬레이션 모드**: LIVE 연결 없이도 데모·방송 테스트 가능

---

## 🚀 실행 방법

### 1. Electron 데스크톱 앱 (9:16 세로 창)
```bash
npm install
./start_electron.sh
# 또는: npm run electron
```

### 2. 브라우저 / OBS Studio / 틱톡 LIVE Studio
```bash
npm install
node server.js
```
브라우저에서 **`http://localhost:3000`** 접속.
OBS에서는 **브라우저 소스** 추가 → URL `http://localhost:3000`, 너비 1080 × 높이 1920.

---

## ⚙ 틱톡 LIVE 연결 (API 불필요)

> **⚡ 100% 직접 연결:** WebSocket/스크래핑 방식의 차세대 직접 연결로 **API 키가 전혀 필요 없습니다.**

1. 우상단 **⚙ 설정 & 연결** 버튼 클릭
2. `@username` 또는 LIVE 방 링크 붙여넣기 (예: `https://www.tiktok.com/@계정/live`)
3. **연결** 클릭 → 실시간 동기화:
   - **입장**: 한복 신도가 법당에 착석
   - **댓글**: 신도가 절 + 기원 말풍선 + 목탁 소리
   - **점괘 키워드**: 점통 의식 + 점괘 풀이 공개
   - **좋아요**: 연꽃비
   - **선물**: 향 공양 행렬 + 범종 + 전체 합장절
   - **공덕함**: 코인 공양 Top 10

---

## 🎵 배경 음악

`audio/` 폴더에 `.mp3` / `.wav` / `.ogg` / `.m4a` 파일을 넣고 서버를 재시작하면
설정 창의 배경 음악 목록에 자동 표시됩니다. 파일이 없어도 **🪷 범종 명상음 (자동 생성)**이 기본 제공됩니다.

## 🛠 구조

```
bokunsuho/
├── main.cjs            # Electron 셸 (9:16 창)
├── preload.cjs         # Electron preload
├── server.js           # Node 서버 + 틱톡 연결 + WebSocket + 24괘 덱
├── public/
│   ├── index.html      # 무대 화면 (한국어 UI)
│   ├── style.css       # 단청 테마 스타일
│   ├── app.js          # 무대 엔진 + 한복 신도 SVG + 24괘
│   ├── audio.js        # 범종/목탁/점통/명상음 신디사이저
│   ├── particles.js    # 연꽃잎/향 연기/성광 파티클
│   └── assets/
│       └── temple_bg.svg  # 손그림 한국 사찰 배경 (대웅전·석등·연등·홍융단·향로)
├── audio/              # 배경 음악 폴더 (직접 추가)
└── start.sh / start_electron.sh
```

---

## 📝 참고

- 점괘 24괘의 괘사·풀이는 이 프로젝트를 위해 새로 지은 오리지널 한국어 텍스트입니다.
- 배경·신도는 코드로 직접 그린 SVG라 이미지 파일이 필요 없고 가볍습니다.

---

# 🌸 BokunSuho — Chùa Online Hàn Quốc (bản tóm tắt tiếng Việt)

Sân khấu chùa online phong cách Hàn Quốc cho TikTok LIVE, khung dọc 9:16.

**Chạy:** `npm install` rồi `./start_electron.sh` (app desktop) hoặc `node server.js` rồi mở `http://localhost:3000` (trình duyệt / nguồn Browser trong OBS 1080×1920).

**Kết nối TikTok:** không cần API key — bấm ⚙ 설정 & 연결, nhập `@username` hoặc link phòng LIVE.

**Tính năng:** 48 tín đồ hanbok hướng về Phật, tặng quà → rước 3 nén hương lên thảm đỏ quỳ lạy + thỉnh chuông 범종, comment chứa `점괘/관음점/신점/운세/뽑기` → gieo quẻ (24 quẻ Hàn tự soạn), 공덕함 top 10, like → mưa cánh sen, chế độ mô phỏng demo.
