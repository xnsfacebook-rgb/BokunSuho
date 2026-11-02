import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const AUDIO_DIR = path.join(__dirname, 'audio');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
};

// ============================================================================
// 복운수호 24괘 점괘 덱 (FORTUNE STICKS DECK — 오리지널 한국어)
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

// 점괘 키워드 (댓글에서 감지)
const FORTUNE_KEYWORDS = ['점괘', '관음점', '신점', '운세', '뽑기'];

// Application State
let tiktokConnection = null;
let currentUsername = '';
let isConnected = false;
let viewerCount = 0;
let roomInfo = null;

const giftComboTracker = new Map();

// Helper: Resolve username from raw input (@user, user, or TikTok live URL)
async function resolveTikTokUsername(rawInput) {
  let input = String(rawInput || '').trim();
  if (!input) {
    throw new Error('틱톡 @username 또는 LIVE 링크를 입력하세요');
  }
  if (input.startsWith('http://') || input.startsWith('https://') || input.includes('tiktok.com/')) {
    const urlToFetch = input.startsWith('http') ? input : `https://${input}`;
    const directMatch = urlToFetch.match(/tiktok\.com\/@([^/?#]+)/i);
    if (directMatch && directMatch[1]) {
      return directMatch[1];
    }
    try {
      const resp = await fetch(urlToFetch, { redirect: 'follow' });
      const finalUrl = resp.url || '';
      const resolvedMatch = finalUrl.match(/tiktok\.com\/@([^/?#]+)/i);
      if (resolvedMatch && resolvedMatch[1]) {
        return resolvedMatch[1];
      }
    } catch (e) {
      console.warn('[TikTok URL Resolve Warning]', e.message);
    }
  }
  return input.replace(/^@/, '').split(/[/?#]/)[0].trim();
}

// Helper: Extract clean user profile from incoming TikTok events
function extractUserFromEvent(data) {
  const u = data?.user || data?.userDetails || data || {};
  const uniqueId = u.uniqueId || u.displayId || data?.uniqueId || '';
  const user = u.nickname || uniqueId || data?.nickname || '신도';
  const avatar =
    u.profilePictureUrl ||
    u.avatarThumb?.urlList?.[0] ||
    u.avatarMedium?.urlList?.[0] ||
    u.avatarLarge?.urlList?.[0] ||
    data?.profilePictureUrl ||
    '';
  return { user, uniqueId, avatar };
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers for streaming overlays
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      isConnected,
      currentUsername,
      viewerCount,
      roomInfo,
      mode: 'direct_no_api',
      statusMessage: '틱톡 직접 연결 (API 불필요)'
    }));
    return;
  }

  if (pathname === '/api/connect' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { username } = JSON.parse(body || '{}');
        if (!username) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '틱톡 username 또는 LIVE 링크가 필요합니다' }));
          return;
        }

        const cleanUsername = await resolveTikTokUsername(username);
        console.log(`[TikTok] @${cleanUsername}의 LIVE에 직접 연결 중 (API 불필요)...`);

        if (tiktokConnection) {
          try {
            await tiktokConnection.disconnect();
          } catch (e) {}
          tiktokConnection = null;
        }
        giftComboTracker.clear();

        tiktokConnection = new TikTokLiveConnection(cleanUsername, {
          processInitialData: true,
          fetchRoomInfoOnConnect: false,
          enableExtendedGiftInfo: false
        });

        setupTikTokEvents(tiktokConnection, cleanUsername);

        const state = await tiktokConnection.connect();
        isConnected = true;
        currentUsername = cleanUsername;
        roomInfo = state;
        viewerCount = state?.viewerCount || 0;

        console.log(`[TikTok] @${cleanUsername} 방 연결 성공! (roomId: ${state?.roomId || tiktokConnection?.roomId})`);

        broadcast({
          type: 'connected',
          username: cleanUsername,
          roomId: state?.roomId || tiktokConnection?.roomId,
          viewerCount
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, roomId: state?.roomId, viewerCount }));
      } catch (err) {
        console.error('[TikTok] 연결 오류:', err.message);
        isConnected = false;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: err.message || '연결할 수 없습니다. 해당 계정이 LIVE 중인지 확인하세요.'
        }));
      }
    });
    return;
  }

  if (pathname === '/api/disconnect' && req.method === 'POST') {
    if (tiktokConnection) {
      try {
        tiktokConnection.disconnect();
      } catch (e) {}
      tiktokConnection = null;
    }
    giftComboTracker.clear();
    isConnected = false;
    currentUsername = '';
    viewerCount = 0;
    roomInfo = null;

    broadcast({ type: 'disconnected' });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Draw Fortune Endpoint (Manual / Simulation trigger)
  if (pathname === '/api/drawFortune' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username } = JSON.parse(body || '{}');
        const fortune = FORTUNE_DECK[Math.floor(Math.random() * FORTUNE_DECK.length)];
        const devotee = {
          nickname: username || '신도',
          uniqueId: 'draw_' + Date.now(),
          profilePictureUrl: null
        };
        broadcast({
          type: 'drawFortune',
          user: devotee,
          fortune
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, fortune }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Get Audio Tracks List from /audio folder
  if (pathname === '/api/audioList' && req.method === 'GET') {
    try {
      if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR, { recursive: true });
      }
      const files = fs.readdirSync(AUDIO_DIR);
      const audioFiles = files
        .filter(f => f.match(/\.(mp3|wav|ogg|m4a|aac)$/i))
        .map(f => {
          const nameWithoutExt = path.parse(f).name;
          return {
            filename: f,
            title: nameWithoutExt,
            url: `/audio/${encodeURIComponent(f)}`
          };
        });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, tracks: audioFiles }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Audio Files Serving with Range Requests Support
  if (pathname.startsWith('/audio/')) {
    const rawAudioFilename = decodeURIComponent(pathname.slice('/audio/'.length));
    const audioPath = path.join(AUDIO_DIR, rawAudioFilename);

    if (!audioPath.startsWith(AUDIO_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(audioPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Audio file not found');
        return;
      }

      const ext = path.extname(audioPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'audio/mpeg';
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        const stream = fs.createReadStream(audioPath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stats.size,
          'Accept-Ranges': 'bytes',
          'Content-Type': contentType,
        });
        fs.createReadStream(audioPath).pipe(res);
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[WS] 라이브 오버레이 스트림에 클라이언트 연결됨');

  ws.send(JSON.stringify({
    type: 'status',
    isConnected,
    currentUsername,
    viewerCount
  }));

  ws.on('close', () => {
    console.log('[WS] 클라이언트 연결 해제');
  });
});

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// Setup TikTok Live Direct Listeners (No API key needed)
function setupTikTokEvents(conn, cleanUsername) {
  conn.on(ControlEvent.CONNECTED, (state) => {
    isConnected = true;
    currentUsername = cleanUsername;
    roomInfo = state;
    viewerCount = state?.viewerCount || 0;
    console.log(`[TikTok] roomId 연결됨: ${state?.roomId || conn?.roomId}`);
    broadcast({
      type: 'connected',
      username: cleanUsername,
      roomId: state?.roomId || conn?.roomId,
      viewerCount
    });
  });

  conn.on(ControlEvent.DISCONNECTED, () => {
    console.log('[TikTok] 틱톡 LIVE 연결 해제됨');
    isConnected = false;
    currentUsername = '';
    viewerCount = 0;
    roomInfo = null;
    broadcast({ type: 'disconnected' });
  });

  conn.on(WebcastEvent.STREAM_END, () => {
    console.log('[TikTok] LIVE 방송 종료됨');
    isConnected = false;
    broadcast({ type: 'disconnected', reason: 'streamEnd' });
  });

  conn.on(ControlEvent.ERROR, (err) => {
    const errMsg = err?.message || err?.info || String(err);
    console.error('[TikTok Warning/Error]', errMsg);
    broadcast({
      type: 'error',
      message: errMsg
    });
  });

  // 시청자 입장 → 법당에 착석
  conn.on(WebcastEvent.MEMBER, (data) => {
    const { user, uniqueId, avatar } = extractUserFromEvent(data);
    console.log(`[TikTok Member] 신도 ${user} (${uniqueId}) 입장`);
    broadcast({
      type: 'member',
      user: {
        uniqueId,
        nickname: user,
        profilePictureUrl: avatar
      }
    });
  });

  // 댓글 → 절 + 기원 말풍선 + 목탁 소리 / 점괘 키워드 → 점괘 의식
  conn.on(WebcastEvent.CHAT, (data) => {
    const { user, uniqueId, avatar } = extractUserFromEvent(data);
    const comment = data?.content || data?.comment || '';
    console.log(`[TikTok Chat] ${user}: ${comment}`);

    const lower = comment.toLowerCase();
    const isFortune = FORTUNE_KEYWORDS.some(kw => lower.includes(kw));

    if (isFortune) {
      const fortune = FORTUNE_DECK[Math.floor(Math.random() * FORTUNE_DECK.length)];
      console.log(`[TikTok 점괘] ${user}님이 제${fortune.number}괘 (${fortune.rank})를 뽑으셨습니다`);
      broadcast({
        type: 'drawFortune',
        user: {
          uniqueId,
          nickname: user,
          profilePictureUrl: avatar
        },
        fortune,
        comment
      });
    }

    broadcast({
      type: 'chat',
      user: {
        uniqueId,
        nickname: user,
        profilePictureUrl: avatar
      },
      comment
    });
  });

  // 선물 → 향 공양 행렬 의식
  conn.on(WebcastEvent.GIFT, (data) => {
    const { user, uniqueId, avatar } = extractUserFromEvent(data);
    const giftObj = data?.gift || data?.giftDetails || {};
    const giftId = String(data?.giftId || giftObj?.id || 'rose');
    const groupId = String(data?.groupId || `${uniqueId}_${giftId}`);
    const repeatCount = Math.max(1, Number(data?.repeatCount || data?.comboCount || 1));

    const prevCount = giftComboTracker.get(groupId) || 0;
    if (repeatCount <= prevCount && data?.repeatEnd) {
      giftComboTracker.delete(groupId);
      return;
    }
    const deltaCount = Math.max(1, repeatCount - prevCount);
    giftComboTracker.set(groupId, repeatCount);
    if (giftComboTracker.size > 500) {
      const firstKey = giftComboTracker.keys().next().value;
      giftComboTracker.delete(firstKey);
    }

    const diamondCount = Math.max(1, Number(giftObj?.diamondCount || data?.diamondCount || 1));
    const totalCoins = diamondCount * deltaCount;
    const rawGiftName = giftObj?.name || data?.giftName || giftObj?.describe || '장미';
    const displayGiftName = deltaCount > 1 ? `${deltaCount}x ${rawGiftName}` : rawGiftName;

    console.log(`[TikTok Gift] ${user}님이 ${displayGiftName} 공양 (${totalCoins} 코인)`);

    broadcast({
      type: 'gift',
      user: {
        uniqueId,
        nickname: user,
        profilePictureUrl: avatar
      },
      giftName: rawGiftName,
      giftId,
      diamondCount,
      repeatCount: deltaCount,
      totalCoins
    });
  });

  // 좋아요 → 연꽃비
  conn.on(WebcastEvent.LIKE, (data) => {
    const { user, uniqueId } = extractUserFromEvent(data);
    const likeCount = Math.min(15, Math.max(1, Number(data?.likeCount ?? data?.count ?? 1)));
    broadcast({
      type: 'like',
      user: {
        uniqueId,
        nickname: user
      },
      likeCount,
      totalLikeCount: Number(data?.totalLikeCount ?? data?.total ?? 0)
    });
  });

  // 팔로우 / 공유
  conn.on(WebcastEvent.FOLLOW, (data) => {
    const { user, uniqueId, avatar } = extractUserFromEvent(data);
    broadcast({
      type: 'chat',
      user: { uniqueId, nickname: user, profilePictureUrl: avatar },
      comment: 'LIVE 방을 팔로우했습니다 🙏 나무아미타불'
    });
  });

  conn.on(WebcastEvent.SHARE, (data) => {
    const { user, uniqueId, avatar } = extractUserFromEvent(data);
    broadcast({
      type: 'chat',
      user: { uniqueId, nickname: user, profilePictureUrl: avatar },
      comment: 'LIVE 방송을 공유했습니다 🪷 공덕 무량'
    });
  });

  // 시청자 수 업데이트
  conn.on(WebcastEvent.ROOM_USER, (data) => {
    viewerCount = Number(data?.viewerCount ?? data?.total ?? 0);
    broadcast({
      type: 'roomUser',
      viewerCount
    });
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`🌸 복운수호 온라인 사찰 — 틱톡 LIVE 향 공양 🌸`);
  console.log(`🌐 서버 실행 중: http://localhost:${PORT}`);
  console.log(`⚡ 모드: 직접 연결 (100% 무료, API 불필요)`);
  console.log(`🎥 OBS 브라우저 소스용: http://localhost:${PORT}`);
  console.log(`=====================================================`);
});
