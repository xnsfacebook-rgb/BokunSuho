/* 사주팔자 도구 (tool-saju.html) — 만세력 기반 사주 계산 + 결과 렌더링.
 * Plain script, 외부 의존성 없음. 로드 순서: js/tools.js 다음.
 * 만세력 구현 선택(2026-10-31, 공개 만세력과 대조 검증):
 *  1) 일주: 기준일 1900-01-01 = 갑술. dayIndex = floor((Date.UTC(y,m-1,d) - Date.UTC(1900,0,1))/86400000),
 *     간지 = (dayIndex + 10) % 60. 검증 앵커: 2000-01-01=무오(54), 2024-01-01=갑자(0),
 *     2026-10-31=무인(14), 1949-10-01=갑자(0).
 *  2) 연주: 입춘에 바뀜. 한국천문연구원 기준 입춘일(양력) 근사 테이블 —
 *     기본 2/4, LICHUN_FEB3 년도는 2/3, LICHUN_FEB5 년도는 2/5.
 *     (m,d) < 입춘 → 연주 = Y-1. 연간지 = (Y - 4) % 60 (1984=갑자 기준).
 *  3) 월주: 12절기 고정일 근사. 경계 (m,d,지지): (2,4,寅)(3,6,卯)(4,5,辰)(5,6,巳)(6,6,午)
 *     (7,7,未)(8,8,申)(9,8,酉)(10,9,戌)(11,8,亥)(12,7,子)(1,6,丑). (m,d) 이하의 가장 늦은 경계.
 *     월간은 입춘 보정 연간 기준 五虎遁: 연천간%5 → 0병 1무 2경 3임 4갑이 寅월 천간,
 *     월간 = (시작 + (월지지-2+12)%12) % 10.
 *  4) 시주: 시지 = floor(((hour+1)%24)/2) — 23시·0시=子. 시간 기준 KST 입력.
 *     시간은 五子遁: 일천간%5 → 0갑 1병 2무 3경 4임이 子시 천간, 시간 = (시작 + 시지) % 10.
 *     자시는 23:00~01:00. 일주는 00:00에 바뀜 (야자시를 23시에 넘기는 학파도 있으나
 *     여기서는 子正(00:00) 전환을 채택 — 간이 도구의 선택임을 명시).
 *  5) 십신: 일간(천간) 기준. 목→화→토→금→수→목 생(生), 목→토→수→화→금→목 극(剋).
 *     동오행 동음양=비견, 동오행 이음양=겁재 / 생아 동=편인 이=정인 / 아생 동=식신 이=상관 /
 *     아극 동=편재 이=정재 / 극아 동=편관 이=정관.
 *  6) 오행 분포: 8자(천간4+지지4) 단순 개수. 지지 오행: 자수 축토 인목 묘목 진토
 *     사화 오화 미토 신금 유금 술토 해수. 지장간은 계산하지 않음(간이 표시).
 *  7) 대운(간이): 방향 = (연간 짝수=양간 && 남자) || (연간 홀수=음간 && 여자) → 顺, 아니면 逆.
 *     시작 나이 ≈ 출생일~다음(顺)/이전(逆) 절기까지 일수 ÷ 3, 반올림.
 *     대운 k (k=1..8): 월주에서 stem·branch 각각 ±k 이동. "약 N세 ~ N+9세" 표시.
 *     실제 만세력의 절입 시각·삼일일운(一日一運) 정밀 계산이 아닌 근사임을 명시.
 */
(function () {
  "use strict";

  /* ---------- 상수 (js/tools.js 재사용, 없으면 폴백) ---------- */
  var TOOLS = (typeof window !== "undefined" && window.TOOLS) || {};
  function pickGlobal(name, fb) {
    if (TOOLS[name]) return TOOLS[name];
    /* tools.js 의 전역 const (window에 붙지 않지만 식별자로 접근 가능) */
    try {
      if (typeof window !== "undefined" && typeof window[name] !== "undefined") return window[name];
    } catch (e) {}
    return fb;
  }
  var STEMS = pickGlobal("STEMS", ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]);
  var BRANCHES = pickGlobal("BRANCHES", ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]);
  var STEM_HANJA = pickGlobal("STEM_HANJA", ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]);
  var BRANCH_HANJA = pickGlobal("BRANCH_HANJA", ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]);
  var ELEMENT_OF_STEM = pickGlobal("ELEMENT_OF_STEM", ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"]);
  var YINYANG_OF_STEM = pickGlobal("YINYANG_OF_STEM", ["양", "음", "양", "음", "양", "음", "양", "음", "양", "음"]);
  var ZODIAC_ANIMALS = pickGlobal("ZODIAC_ANIMALS", ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]);

  /* 지지 → 오행 (자수 축토 인목 묘목 진토 사화 오화 미토 신금 유금 술토 해수) */
  var ELEMENT_OF_BRANCH = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
  var ELEM_HANJA = { "목": "木", "화": "火", "토": "土", "금": "金", "수": "水" };
  var ELEMS = ["목", "화", "토", "금", "수"];
  /* 생: 목→화→토→금→수→목 */
  var GENERATES = { "목": "화", "화": "토", "토": "금", "금": "수", "수": "목" };
  /* 극: 목→토→수→화→금→목 */
  var CONTROLS = { "목": "토", "토": "수", "수": "화", "화": "금", "금": "목" };
  /* 시간 → 시지 이름 */
  var HOUR_BRANCH_NAMES = ["자시", "축시", "인시", "묘시", "진시", "사시", "오시", "미시", "신시", "유시", "술시", "해시"];

  function mod(n, m) { return ((n % m) + m) % m; }
  function ganzhiStr(stemIdx, branchIdx) {
    return STEMS[mod(stemIdx, 10)] + BRANCHES[mod(branchIdx, 12)];
  }

  /* ---------- 1) 일주 ---------- */
  /* 기준일 1900-01-01 = 갑술. (dayIndex + 10) % 60: 0=갑자 … 59=계해 */
  function dayPillar(y, m, d) {
    var dayIndex = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
    var g = mod(dayIndex + 10, 60);
    return { stem: mod(g, 10), branch: mod(g, 12), ganzhi: g };
  }

  /* ---------- 2) 연주 (입춘 기준) ---------- */
  /* 입춘이 2/3인 해 (한국천문연구원 기준, 2021~2099 검증 리스트) */
  var LICHUN_FEB3 = [2021, 2025, 2029, 2033, 2037, 2041, 2045, 2049, 2053, 2057, 2058, 2061, 2062, 2065, 2066, 2069, 2070, 2073, 2074, 2077, 2078, 2081, 2082, 2085, 2086, 2089, 2090, 2091, 2093, 2094, 2095, 2097, 2098, 2099];
  /* 입춘이 2/5인 해 (1902~1984 검증 리스트) */
  var LICHUN_FEB5 = [1902, 1903, 1904, 1906, 1907, 1908, 1910, 1911, 1912, 1914, 1915, 1916, 1919, 1920, 1923, 1924, 1927, 1928, 1931, 1932, 1935, 1936, 1939, 1940, 1943, 1944, 1947, 1948, 1951, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984];
  function lichunDay(year) {
    if (LICHUN_FEB3.indexOf(year) !== -1) return 3;
    if (LICHUN_FEB5.indexOf(year) !== -1) return 5;
    return 4;
  }
  function yearPillar(y, m, d) {
    /* (m,d)가 그 해 입춘 이전이면 전년도의 연주를 씀 */
    var gy = (m < 2 || (m === 2 && d < lichunDay(y))) ? y - 1 : y;
    var g = mod(gy - 4, 60); /* 1984=갑자=(1984-4)%60=0 */
    return { year: gy, stem: mod(g, 10), branch: mod(g, 12), ganzhi: g };
  }

  /* ---------- 3) 월주 (12절기 고정일 근사) ---------- */
  /* [m*100+d, branchIdx]: (2,4,寅)(3,6,卯)(4,5,辰)(5,6,巳)(6,6,午)(7,7,未)
     (8,8,申)(9,8,酉)(10,9,戌)(11,8,亥)(12,7,子)(1,6,丑). 실제 절입 시각이 아닌
     고정일 근사이므로 경계일(±1일) 전후 출생은 오차 가능 — 코드 상단에 명시. */
  var MONTH_BOUNDARIES = [
    [106, 1], [204, 2], [306, 3], [405, 4], [506, 5], [606, 6],
    [707, 7], [808, 8], [908, 9], [1009, 10], [1108, 11], [1207, 0]
  ];
  function monthBranch(m, d) {
    var key = m * 100 + d;
    var b = 0; /* 1/6 이전 = 子월 (전년 12/7 대설 이후) */
    for (var i = 0; i < MONTH_BOUNDARIES.length; i++) {
      if (MONTH_BOUNDARIES[i][0] <= key) b = MONTH_BOUNDARIES[i][1];
      else break;
    }
    return b;
  }
  /* 五虎遁: 입춘 보정 연천간 → 寅월 천간 */
  var TIGER_MONTH_STEM = [2, 4, 6, 8, 0]; /* 연간%5 → 병 무 경 임 갑 */
  function monthPillar(m, d, yearStem) {
    var branch = monthBranch(m, d);
    var start = TIGER_MONTH_STEM[mod(yearStem, 5)];
    var stem = mod(start + mod(branch - 2, 12), 10);
    return { stem: stem, branch: branch };
  }

  /* ---------- 4) 시주 ---------- */
  /* 시지 = floor(((hour+1)%24)/2): 23·0시=子 … 22시=亥. 자시 = 23:00~01:00. */
  function hourBranch(hour) { return Math.floor(mod(hour + 1, 24) / 2); }
  /* 五子遁: 일천간 → 子시 천간. 일간%5 → 갑 병 무 경 임(0,2,4,6,8) */
  var RAT_HOUR_STEM = [0, 2, 4, 6, 8];
  function hourPillar(hour, dayStem) {
    var branch = hourBranch(hour);
    var stem = mod(RAT_HOUR_STEM[mod(dayStem, 5)] + branch, 10);
    return { stem: stem, branch: branch };
  }

  /* ---------- 5) 십신 (기둥 천간 vs 일간) ---------- */
  function tenGod(stemIdx, dayStemIdx) {
    var e = ELEMENT_OF_STEM[mod(stemIdx, 10)];
    var de = ELEMENT_OF_STEM[mod(dayStemIdx, 10)];
    var yy = YINYANG_OF_STEM[mod(stemIdx, 10)];
    var dyy = YINYANG_OF_STEM[mod(dayStemIdx, 10)];
    var sameYY = (yy === dyy);
    if (e === de) return sameYY ? "비견" : "겁재";
    if (GENERATES[e] === de) return sameYY ? "편인" : "정인"; /* 타생아 */
    if (GENERATES[de] === e) return sameYY ? "식신" : "상관"; /* 아생타 */
    if (CONTROLS[de] === e) return sameYY ? "편재" : "정재";  /* 아극타 */
    if (CONTROLS[e] === de) return sameYY ? "편관" : "정관";  /* 타극아 */
    return "";
  }

  /* ---------- 6) 오행 분포 (8자) ---------- */
  function elementCounts(pillars) {
    var c = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
    var keys = ["hour", "day", "month", "year"];
    for (var i = 0; i < keys.length; i++) {
      var p = pillars[keys[i]];
      c[ELEMENT_OF_STEM[mod(p.stem, 10)]]++;
      c[ELEMENT_OF_BRANCH[mod(p.branch, 12)]]++;
    }
    return c;
  }

  /* ---------- 7) 대운 (간이) ---------- */
  /* 방향: (양간 && 남자) || (음간 && 여자) → 顺, 그 외 逆 */
  function daeunDirection(yearStem, isMale) {
    var yang = (mod(yearStem, 2) === 0); /* 갑병무경임 = 짝수 인덱스 */
    return (yang && isMale) || (!yang && !isMale);
  }
  /* 출생일 기준 다음(顺)/이전(逆) 절기까지의 일수 → ÷3 반올림 = 시작 나이 */
  function daeunStartAge(y, m, d, forward) {
    var birth = Date.UTC(y, m - 1, d);
    var best = null;
    for (var yy = y - 1; yy <= y + 1; yy++) {
      for (var i = 0; i < MONTH_BOUNDARIES.length; i++) {
        var bm = Math.floor(MONTH_BOUNDARIES[i][0] / 100);
        var bd = MONTH_BOUNDARIES[i][0] % 100;
        var t = Date.UTC(yy, bm - 1, bd);
        var diff = Math.round((t - birth) / 86400000);
        if (forward && diff > 0 && (best === null || diff < best)) best = diff;
        if (!forward && diff < 0 && (best === null || diff > best)) best = diff;
      }
    }
    if (best === null) best = 0;
    return Math.max(0, Math.round(Math.abs(best) / 3));
  }
  /* 대운 k (1..8): 월주에서 stem·branch 각각 ±k */
  function daeunList(month, forward, startAge) {
    var list = [];
    for (var k = 1; k <= 8; k++) {
      var s = forward ? 1 : -1;
      var stem = mod(month.stem + s * k, 10);
      var branch = mod(month.branch + s * k, 12);
      var age = startAge + (k - 1) * 10;
      list.push({ stem: stem, branch: branch, age: age, label: "약 " + age + "세 ~ " + (age + 9) + "세" });
    }
    return list;
  }

  /* ---------- 8) 일간 성격 (오리지널 해설, 천간별 1종) ---------- */
  var DAYMASTER_TEXT = [
    /* 갑 */ "갑목은 큰 나무의 기운을 품고 있습니다. 곧은 성품으로 목표를 향해 꾸준히 나아가는 당신은 주위 사람들에게 든든한 버팀목이 됩니다. 원칙을 중시하고 책임감이 강하지만, 때로는 고집이 세다는 말을 듣기도 합니다. 융통성을 조금만 더하면 큰일을 이루기에 부족함이 없습니다. 꾸준히 뿌리를 내리듯 실력을 쌓아가세요.",
    /* 을 */ "을목은 풀과 꽃처럼 유연하고 섬세한 기운을 가졌습니다. 부드러운 카리스마로 사람들의 마음을 얻는 당신은 어디서든 인기가 많습니다. 역경 앞에서도 꺾이지 않고 다시 일어나는 생명력이 가장 큰 강점입니다. 다만 결정을 미루거나 눈치를 보느라 기회를 놓치지 않도록 하세요. 당신의 유연함이야말로 어떤 풍파도 이겨내는 무기입니다.",
    /* 병 */ "병화는 태양의 기운을 품고 있습니다. 밝고 열정적인 성격으로 주변을 환하게 밝히는 당신은 타고난 리더의 기질을 가졌습니다. 솔직하고 당당한 태도가 신뢰를 불러오지만, 때로는 성급함이 실수를 부르기도 합니다. 한 번 내뱉은 말은 끝까지 지키는 사람이 되세요. 당신의 열정이 세상을 따뜻하게 만듭니다.",
    /* 정 */ "정화는 촛불과 등불처럼 은은하게 비추는 기운입니다. 세심하고 다정한 당신은 다른 사람의 마음을 헤아리는 데 탁월한 재능이 있습니다. 겉으로는 조용하지만 속에는 뜨거운 열정을 품고 있어 꾸준히 빛을 냅니다. 너무 남을 배려하느라 자신을 소진하지 않도록 주의하세요. 당신의 따뜻함은 오래도록 기억됩니다.",
    /* 무 */ "무토는 넓은 대지의 기운을 품고 있습니다. 듬직하고 포용력 있는 성격으로 많은 사람이 당신에게 의지합니다. 성실하고 꾸준한 노력으로 신뢰를 쌓아가는 당신은 어느 조직에서든 중심이 됩니다. 다만 변화에 적응이 더딘 면이 있으니 가끔은 과감한 도전을 해보세요. 흔들림 없는 당신의 성실함이 가장 큰 자산입니다.",
    /* 기 */ "기토는 기름진 논밭처럼 모든 것을 길러내는 기운입니다. 섬세하고 사려 깊은 당신은 주변 사람들의 든든한 조력자가 됩니다. 실속 있고 계획적인 성격으로 재물을 모으는 재주도 뛰어납니다. 다만 걱정이 많아 시작을 망설이는 경우가 있으니, 한 걸음 내딛는 용기를 내보세요. 당신의 성실한 돌봄이 풍요를 부릅니다.",
    /* 경 */ "경금은 벼린 칼처럼 강하고 결단력 있는 기운입니다. 정의감이 강하고 옳고 그름이 분명한 당신은 어려운 일에도 주저하지 않고 나섭니다. 리더십과 추진력이 뛰어나 큰일을 맡기에 손색이 없습니다. 다만 날카로운 언행이 상처를 줄 수 있으니 부드러운 표현을 연습하세요. 당신의 결단력이 세상을 바로 세웁니다.",
    /* 신 */ "신금은 정교하게 다듬은 보석처럼 섬세하고 예민한 기운을 품고 있습니다. 분석력과 통찰력이 뛰어난 당신은 복잡한 문제도 꿰뚫어 보는 눈을 가졌습니다. 완벽을 추구하는 성격으로 늘 높은 수준의 결과물을 만들어냅니다. 다만 예민함이 스트레스가 되지 않도록 마음을 풀어주는 시간을 가지세요. 당신의 날카로운 감각은 소중한 재능입니다.",
    /* 임 */ "임수는 넓은 바다처럼 깊고 포용적인 기운입니다. 지혜롭고 총명한 당신은 흐름을 읽는 능력이 뛰어나 어느 자리에서든 중심을 잡습니다. 유연한 사고로 변화에 잘 적응하고, 사람을 끌어당기는 매력을 가졌습니다. 다만 깊이 생각하느라 행동이 늦어지지 않도록 하세요. 당신의 지혜는 많은 사람에게 등대가 됩니다.",
    /* 계 */ "계수는 이슬과 빗방울처럼 맑고 섬세한 기운을 품고 있습니다. 감수성이 풍부하고 창의적인 당신은 예술적 감각이 뛰어납니다. 조용하지만 내면이 강해 어려움 속에서도 자신을 지켜냅니다. 다만 감정에 휩쓸려 우울해지지 않도록 마음을 돌보는 것이 중요합니다. 당신의 맑은 감성이 세상을 아름답게 합니다."
  ];

  /* ---------- 전체 계산 ---------- */
  function calcSaju(y, m, d, hour, minute, isMale) {
    var day = dayPillar(y, m, d);
    var year = yearPillar(y, m, d);
    var month = monthPillar(m, d, year.stem);
    var hm = hourPillar(hour, day.stem);
    var pillars = {
      hour: { stem: hm.stem, branch: hm.branch },
      day: { stem: day.stem, branch: day.branch },
      month: { stem: month.stem, branch: month.branch },
      year: { stem: year.stem, branch: year.branch }
    };
    var forward = daeunDirection(year.stem, isMale);
    var startAge = daeunStartAge(y, m, d, forward);
    return {
      pillars: pillars,
      dayStem: day.stem,
      yearStem: year.stem,
      zodiac: ZODIAC_ANIMALS[mod(year.branch, 12)],
      tenGods: {
        hour: tenGod(hm.stem, day.stem),
        month: tenGod(month.stem, day.stem),
        year: tenGod(year.stem, day.stem)
      },
      elements: elementCounts(pillars),
      daeunForward: forward,
      daeunStartAge: startAge,
      daeun: daeunList({ stem: month.stem, branch: month.branch }, forward, startAge)
    };
  }

  /* ---------- 렌더링 ---------- */
  function $(id) { return document.getElementById(id); }
  function setText(node, s) { if (node) node.textContent = s; }
  function mk(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.setAttribute("class", cls);
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function renderPillarTable(tbody, r) {
    if (!tbody) return;
    tbody.innerHTML = "";
    var cols = [
      { key: "hour", name: "시", god: r.tenGods.hour },
      { key: "day", name: "일", god: "일간" },
      { key: "month", name: "월", god: r.tenGods.month },
      { key: "year", name: "년", god: r.tenGods.year }
    ];
    function row(label, cells) {
      var tr = document.createElement("tr");
      var th = mk("th", "row-label", label);
      tr.appendChild(th);
      for (var i = 0; i < cells.length; i++) tr.appendChild(cells[i]);
      tbody.appendChild(tr);
    }
    /* 십신 행 */
    row("십신", cols.map(function (c) { return mk("td", "sub", c.god); }));
    /* 천간 행 */
    row("천간", cols.map(function (c) {
      var p = r.pillars[c.key];
      var td = mk("td", "stem", STEMS[mod(p.stem, 10)]);
      td.appendChild(mk("span", "hanja", STEM_HANJA[mod(p.stem, 10)]));
      return td;
    }));
    /* 지지 행 */
    row("지지", cols.map(function (c) {
      var p = r.pillars[c.key];
      var td = mk("td", "branch", BRANCHES[mod(p.branch, 12)]);
      td.appendChild(mk("span", "hanja", BRANCH_HANJA[mod(p.branch, 12)]));
      return td;
    }));
    /* 오행 행 */
    row("오행", cols.map(function (c) {
      var p = r.pillars[c.key];
      var s = ELEMENT_OF_STEM[mod(p.stem, 10)] + "·" + ELEMENT_OF_BRANCH[mod(p.branch, 12)];
      return mk("td", "sub", s);
    }));
  }

  function renderDaymaster(box, dayStem) {
    if (!box) return;
    box.innerHTML = "";
    var ds = mod(dayStem, 10);
    box.appendChild(mk("div", "dm", STEMS[ds]));
    box.appendChild(mk("div", "dmt", STEM_HANJA[ds] + " · " + ELEMENT_OF_STEM[ds] + ELEM_HANJA[ELEMENT_OF_STEM[ds]] + " · " + YINYANG_OF_STEM[ds]));
    var p = mk("p", "dmt", DAYMASTER_TEXT[ds]);
    p.style.marginTop = "14px";
    p.style.lineHeight = "1.9";
    box.appendChild(p);
  }

  function renderElements(box, counts) {
    if (!box) return;
    box.innerHTML = "";
    for (var i = 0; i < ELEMS.length; i++) {
      var e = ELEMS[i];
      var row = mk("div", "elem-bar");
      row.appendChild(mk("span", "lbl", e + "(" + ELEM_HANJA[e] + ")"));
      var track = mk("div", "track");
      var fill = mk("div", "fill e-" + e);
      fill.style.width = Math.round(counts[e] / 8 * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(mk("span", "val", counts[e] + "개"));
      box.appendChild(row);
    }
  }

  /* 만 나이 (KST 기준 오늘) */
  function fullAge(y, m, d) {
    try {
      var now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      var age = now.getFullYear() - y;
      if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
      return age;
    } catch (e) { return null; }
  }

  function renderDaeun(box, r, y, m, d) {
    if (!box) return;
    box.innerHTML = "";
    var age = fullAge(y, m, d);
    for (var i = 0; i < r.daeun.length; i++) {
      var lu = r.daeun[i];
      var chip = mk("div", "luck-chip");
      if (age !== null && age >= lu.age && age <= lu.age + 9) chip.setAttribute("class", "luck-chip now");
      chip.appendChild(mk("div", "age", lu.label));
      chip.appendChild(mk("div", "gz", ganzhiStr(lu.stem, lu.branch)));
      box.appendChild(chip);
    }
  }

  function renderResult(y, m, d, hour, minute, gender) {
    var isMale = (gender === "남");
    var r = calcSaju(y, m, d, hour, minute, isMale);
    var hb = hourBranch(hour);

    setText($("saju-title"), y + "년 " + m + "월 " + d + "일 출생의 사주");
    var yp = r.pillars.year;
    setText($("saju-zodiac"),
      ganzhiStr(yp.stem, yp.branch) + "년 · " + r.zodiac + "띠 · " +
      (isMale ? "남자" : "여자") + " · " + hour + "시 " + minute + "분(" + HOUR_BRANCH_NAMES[hb] + ") 출생");

    renderPillarTable($("saju-tbody"), r);
    renderDaymaster($("saju-daymaster"), r.dayStem);
    renderElements($("saju-elems"), r.elements);
    renderDaeun($("saju-luck"), r, y, m, d);

    var dirTxt = r.daeunForward ? "순행" : "역행";
    setText($("saju-note"),
      "년주는 입춘, 월주는 절기(고정일 근사) 기준이며 자시는 23시~다음날 1시, 일주는 자정(子正)에 바뀝니다. " +
      "대운은 " + dirTxt + " · 약 " + r.daeunStartAge + "세 시작(절기 간격 간이 계산). " +
      "오행 분포는 지장간을 제외한 8자 단순 집계입니다.");

    var wrap = $("saju-result");
    if (wrap) {
      wrap.hidden = false;
      wrap.classList.add("show");
      if (wrap.scrollIntoView) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------- 폼 초기화 ---------- */
  var gender = "남";

  function fillHourMinute() {
    var hSel = $("saju-hour"), mSel = $("saju-minute");
    if (hSel && hSel.options.length === 0) {
      for (var h = 0; h < 24; h++) {
        var o = document.createElement("option");
        o.value = String(h);
        o.textContent = h + "시 (" + HOUR_BRANCH_NAMES[hourBranch(h)] + ")";
        if (h === 12) o.selected = true;
        hSel.appendChild(o);
      }
    }
    if (mSel && mSel.options.length === 0) {
      for (var mi = 0; mi < 60; mi++) {
        var o2 = document.createElement("option");
        o2.value = String(mi);
        o2.textContent = mi + "분";
        if (mi === 0) o2.selected = true;
        mSel.appendChild(o2);
      }
    }
  }

  function initGender() {
    var box = $("saju-gender");
    if (!box) return;
    var btns = box.querySelectorAll("button[data-g]");
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener("click", function () {
          gender = b.getAttribute("data-g") || "남";
          for (var j = 0; j < btns.length; j++) btns[j].classList.remove("on");
          b.classList.add("on");
        });
      })(btns[i]);
    }
  }

  function parseDateInput(v) {
    /* type=date 값 "YYYY-MM-DD" → [y, m, d]. 구형 브라우저 대비 수동 파싱. */
    var mt = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v || "");
    if (!mt) return null;
    var y = parseInt(mt[1], 10), mo = parseInt(mt[2], 10), da = parseInt(mt[3], 10);
    if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;
    var chk = new Date(Date.UTC(y, mo - 1, da));
    if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== mo - 1 || chk.getUTCDate() !== da) return null;
    return [y, mo, da];
  }

  function onSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var dEl = $("saju-date");
    var hEl = $("saju-hour");
    var mEl = $("saju-minute");
    if (!dEl || !hEl || !mEl) return;
    var parts = parseDateInput(dEl.value);
    if (!parts) {
      setText($("saju-title"), "생년월일을 올바르게 입력해주세요.");
      var w = $("saju-result");
      if (w) { w.hidden = false; w.classList.add("show"); }
      return;
    }
    var hour = parseInt(hEl.value, 10);
    var minute = parseInt(mEl.value, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) hour = 12;
    if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;
    renderResult(parts[0], parts[1], parts[2], hour, minute, gender);
  }

  function init() {
    fillHourMinute();
    initGender();
    var form = $("saju-form");
    if (form) form.addEventListener("submit", onSubmit);
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  /* 테스트/디버그용 노출 (node --check + require 테스트 가능) */
  var API = {
    calcSaju: calcSaju,
    dayPillar: dayPillar,
    yearPillar: yearPillar,
    monthPillar: monthPillar,
    monthBranch: monthBranch,
    hourPillar: hourPillar,
    hourBranch: hourBranch,
    tenGod: tenGod,
    elementCounts: elementCounts,
    daeunDirection: daeunDirection,
    daeunStartAge: daeunStartAge,
    daeunList: daeunList,
    ganzhiStr: ganzhiStr,
    DAYMASTER_TEXT: DAYMASTER_TEXT
  };
  if (typeof window !== "undefined" && window) window.SAJU = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})();
