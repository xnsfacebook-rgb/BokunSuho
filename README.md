# 🌸 복운수호 온라인 사찰 — 향 공양 (9:16 세로형)

틱톡 LIVE용 **한국식 온라인 사찰** 무대입니다. 세로 **9:16** 규격으로 틱톡 LIVE Studio / OBS Studio / Electron 데스크톱 앱에 바로 쓸 수 있습니다.

> 베트남 원작(`chuaonline-electron-no-api`)의 구조를 그대로 살리고, 모든 화면·의식·점괘를 **한국 사찰 풍**으로 다시 지은 프로젝트입니다.

---

## ✨ 주요 기능

### 0. 🆕 실시간 3D 대웅전 (three.js)
무대 전체가 **실시간 3D**로 바뀌었습니다. 모든 모델은 이미지 파일 없이 코드로 직접 빚었습니다.

| 모델 | 디테일 |
|---|---|
| **금동 석가여래좌상** | SDF(점토 조형) 방식으로 다리·몸통·팔·머리가 매끄럽게 이어진 몸체, 항마촉지인, 우견편단 법의 주름, 군청빛 나발 1,400여 개, 육계·계주·백호, 긴 귓불, 삼도, 반쯤 감은 눈 |
| **광배 · 연화대좌** | 불꽃무늬 거신광배 + 두광·신광 동심원 + 화불 7구, 앙련 2겹 · 연밥 띠 · 팔각 중대석(안상) · 복련 · 하대석 |
| **대웅전** | 3단 장대석 기단과 소맷돌 계단, 배흘림기둥, 빛이 새어나오는 꽃살문, 단청 창방·평방, 다포식 공포, 처마 곡선과 추녀가 치켜 올라간 곡선 지붕, 서까래·막새, 용마루·취두·잡상, 풍경, 「大雄殿」 현판 |
| **한복 신도 48명** | 관절 리그(골반·허리·가슴·목·머리·팔·다리), 저고리·깃·동정·고름·끝동, 치마 스란단 금박(여) / 두루마기·바지·대님(남), 쪽머리와 금비녀, 흰 버선 |
| **동작** | 꿇어앉아 합장 · 숨쉬기 · 큰절(이마를 바닥에) · 향을 들고 걷기 · 향을 이마 높이로 받들기 |
| **향로 · 공양** | 청동 삼족 향로(녹청·운문 띠·양 귀), 석조 향로대, 놋 촛대와 일렁이는 촛불, 과일 공양 굽다리 접시 |
| **마당** | 팔각 석등 4기(화사석 불빛), 오색 연등 줄, 박석 마당, 붉은 융단, 적송, 겹겹 산, 보름달·별·은하수 |
| **효과** | 소용돌이치며 피어오르는 향 연기, 금빛 사리광, 3D 연꽃잎 비, 블룸 후광 |

- 선물을 받으면 신도가 **붉은 융단을 걸어 올라와** 향로 앞에 꿇어앉고 → 향을 이마 높이로 받들어 → **향로에 꽂으면** 연기가 크게 피어오르고 → **큰절**을 올리면 범종이 울리며 법당의 모든 신도가 함께 절합니다.
- 이름표와 댓글 말풍선은 각 신도의 머리 위 3D 위치를 따라다닙니다.
- **WebGL 을 쓸 수 없는 환경**에서는 자동으로 기존 2D 사진 무대로 전환됩니다.

**주소 옵션**
- `http://localhost:3000/?q=low` — 저사양 모드 (그림자·블룸 끔, 해상도 1배) : 방송 송출 PC 가 무거울 때
- `http://localhost:3000/?2d` — 기존 2D 사진 무대 강제 사용

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
│   ├── particles.js    # (2D 모드) 연꽃잎/향 연기/성광 파티클
│   ├── scene3d/        # 🆕 3D 무대
│   │   ├── stage.js    #   렌더러·카메라·조명·배치·향 공양 의식 애니메이션 (window.temple3D API)
│   │   ├── buddha.js   #   금동 석가여래좌상 · 광배 · 연화대좌
│   │   ├── sculpt.js   #   SDF 조형 → 마칭큐브 메쉬
│   │   ├── devotee.js  #   한복 신도 리그 + 자세 (합장/큰절/걷기/향 올리기)
│   │   ├── temple.js   #   대웅전 · 곡선 지붕 · 공포 · 석등 · 연등 · 밤하늘
│   │   ├── altar.js    #   청동 향로 · 촛대 · 공양물
│   │   ├── effects.js  #   향 연기 · 금빛 사리광 · 연꽃잎 비
│   │   ├── textures.js #   단청 · 꽃살문 · 기와 · 박석 · 융단 등 절차적 텍스처
│   │   └── util.js
│   ├── vendor/three/   # three.js r170 (MIT) — 인터넷 없이 동작하도록 로컬 포함
│   └── assets/
│       ├── images.js      # (2D 모드) 사진 에셋 — WebGL 불가 시에만 불러옴
│       └── temple_bg.svg  # 손그림 한국 사찰 배경 (대웅전·석등·연등·홍융단·향로)
├── audio/              # 배경 음악 폴더 (직접 추가)
└── start.sh / start_electron.sh
```

---

## 📝 참고

- 점괘 24괘의 괘사·풀이는 이 프로젝트를 위해 새로 지은 오리지널 한국어 텍스트입니다.
- 3D 모델은 모두 코드로 생성되므로 별도 3D 파일(.glb 등)이 필요 없습니다. 불상 몸체는 시작할 때 약 1초 동안 조형됩니다.

---

# 🌸 BokunSuho — Chùa Online Hàn Quốc (bản tóm tắt tiếng Việt)

Sân khấu chùa online phong cách Hàn Quốc cho TikTok LIVE, khung dọc 9:16.

**Chạy:** `npm install` rồi `./start_electron.sh` (app desktop) hoặc `node server.js` rồi mở `http://localhost:3000` (trình duyệt / nguồn Browser trong OBS 1080×1920).

**Kết nối TikTok:** không cần API key — bấm ⚙ 설정 & 연결, nhập `@username` hoặc link phòng LIVE.

**🆕 Sân khấu 3D (three.js):** toàn bộ cảnh đã chuyển sang 3D thời gian thực, mọi mô hình đều dựng bằng code (không cần file ảnh/3D): tượng Phật Thích Ca dát vàng ngồi kiết già bắt ấn xúc địa (thân tạc bằng SDF mượt như nặn đất, 1.400+ lọn tóc xoắn ốc, nhục kế, bạch hào, dái tai dài, ba ngấn cổ), hào quang hình lửa + toà sen 2 lớp, chánh điện Daeungjeon (bệ đá 3 cấp, cột bụng phình, cửa hoa văn hắt sáng, dancheong, đấu củng, mái cong vểnh góc, ngói đầu tròn, biển 大雄殿), 48 tín đồ hanbok có khớp xương (quỳ chắp tay, thở, lạy sát đất, cầm hương đi, nâng hương ngang trán), lư hương đồng ba chân, đèn đá, dây đèn hoa sen, trăng rằm, khói hương xoáy, mưa cánh sen 3D. Khi nhận quà: tín đồ đi trên thảm đỏ → quỳ → nâng hương → cắm vào lư → lạy, chuông vang, cả chánh điện cùng lạy. Máy không có WebGL sẽ tự quay về bản 2D cũ. Thêm `?q=low` để giảm tải (tắt bóng & bloom), `?2d` để ép dùng bản 2D.

**Tính năng:** 48 tín đồ hanbok hướng về Phật, tặng quà → rước 3 nén hương lên thảm đỏ quỳ lạy + thỉnh chuông 범종, comment chứa `점괘/관음점/신점/운세/뽑기` → gieo quẻ (24 quẻ Hàn tự soạn), 공덕함 top 10, like → mưa cánh sen, chế độ mô phỏng demo.
