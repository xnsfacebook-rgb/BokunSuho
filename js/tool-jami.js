/* 자미두수 명반 (tool-jami.html) — plain script, no deps.
 * 양력 생년월일시 → 음력 변환 → 명궁/신궁/12궁/14주성/13보조성/오행국/대운 계산 후
 * 4×4 명반 차트로 렌더링. 클릭한 궁의 해석 패널 제공.
 *
 * ===== 학교(流派)·단순화 선택 — 코드 주석으로 문서화 =====
 * [1] 음력: 1900–2100년 표준 lunarInfo 16진 테이블(중국력 고전 JS 구현과 동일한
 *     210개 코드)을 그대로 내장. leapMonth = code & 0xf, 윤달대월 = code & 0x10000,
 *     k월 대월 = code & (0x8000 >> (k-1)).
 * [2] 연도 천간지지: 설날(음력 1월 1일) 기준 음력 연도 사용 — 입춘 기준이 아님.
 * [3] 윤달 정책(단순화): 생일이 윤달에 들면 음력 1–15일은 해당 월,
 *     16일 이후는 다음 월로 계산.
 *     예: 양력 1990-07-10 = 음력 윤5월 18일 → 6월로 계산 (위키백과 1990년 음양력 대조표 확인).
 * [4] 시지(時支): floor(((hour+1)%24)/2), 子時=23:00–01:00. 분(分)은 시지에 영향 없음.
 * [5] 명궁: M=(음력월+1)%12 (=寅+(월−1) 순행), 명궁=(M−시지)%12.
 * [6] 신궁: (M+시지)%12.
 * [7] 12궁: 궁 i(0=명궁)의 지지 = (명궁−i)%12 (역행 배치).
 *     궁간: 五虎遁 — 연 천간%5 → 寅궁 간 (0→丙,1→戊,2→庚,3→壬,4→甲), 이후 순행.
 * [8] 오행국: 定局표(연 천간 × 명궁 지지) 사용. 2=水二局 3=木三局 4=金四局 5=土五局 6=火六局.
 * [9] 자미: n=국수, d=음력일, r=(n−(d%n))%n, q=(d+r)/n, pos=(q+1)%12,
 *     r홀수 → (pos−r)%12, r짝수 → (pos+r)%12.
 * [10] 14주성: 자미 기준 역행 — 천기−1 태양−3 무곡−4 천동−5 염정−8,
 *      천부=(4−자미)%12 기준 순행 — 태음+1 탐랑+2 거문+3 천상+4 천량+5 칠살+6 파군+10.
 * [11] 보조성: 과제 지정 공식 그대로 (문창·문곡·좌보·우필·화성·영성·천괴·천월·
 *      삼태·팔좌·천형·천요·음살).
 * [12] 대운(간단 버전): 시작 나이 = 국수(세는나이). 방향 = (연천간 양 && 남) ||
 *      (연천간 음 && 여) → 순행, 그 외 역행. 10년 단위 8개 궁만 표시.
 */
(function () {
  "use strict";

  /* ================= 기본 상수 ================= */
  var STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  var BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  var STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  var PALACES = [
    { name: "명궁", hanja: "命宮" }, { name: "형제", hanja: "兄弟" },
    { name: "부부", hanja: "夫妻" }, { name: "자녀", hanja: "子女" },
    { name: "재백", hanja: "財帛" }, { name: "질액", hanja: "疾厄" },
    { name: "천이", hanja: "遷移" }, { name: "노복", hanja: "奴僕" },
    { name: "관록", hanja: "官祿" }, { name: "전택", hanja: "田宅" },
    { name: "복덕", hanja: "福德" }, { name: "부모", hanja: "父母" }
  ];

  /* 양의 나머지 (음수 입력도 0 이상) */
  function mod(n, m) { return ((n % m) + m) % m; }
  function ganzhi(s, b) { return STEMS[mod(s, 10)] + BRANCHES[mod(b, 12)]; }
  function ganzhiHanja(s, b) { return STEM_HANJA[mod(s, 10)] + BRANCH_HANJA[mod(b, 12)]; }

  /* ================= [1] 음력 테이블 ================= */
  /* 1900–2100 표준 lunarInfo 16진 코드 210개 (고전 중국력 구현과 동일).
   * code & 0xf = 윤달(없으면 0), code & 0x10000 = 윤달이 대월(30일),
   * code & (0x8000 >> (k-1)) = k월이 대월(30일). */
  var LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x0b5a0,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,
    0x0f252,0x0d520
  ];

  function leapMonthOf(y) { return LUNAR_INFO[y - 1900] & 0xf; }
  function leapDaysOf(y) {
    if (leapMonthOf(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
    return 0;
  }
  function monthDaysOf(y, m) { /* m: 1–12 */
    return (LUNAR_INFO[y - 1900] & (0x8000 >> (m - 1))) ? 30 : 29;
  }
  function yearDaysOf(y) {
    var sum = 348, i, code = LUNAR_INFO[y - 1900];
    for (i = 0x8000; i > 0x8; i >>= 1) sum += (code & i) ? 1 : 0;
    return sum + leapDaysOf(y);
  }

  /* 양력 → 음력 (고전 알고리즘). 반환 {year, month, day, isLeap} */
  function solar2lunar(y, m, d) {
    var offset = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);
    var i, temp = 0, leap;
    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = yearDaysOf(i);
      offset -= temp;
    }
    if (offset < 0) { offset += temp; i--; }
    var ly = i;
    leap = leapMonthOf(ly);
    var isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === leap + 1 && !isLeap) {
        i--; isLeap = true; temp = leapDaysOf(ly);
      } else {
        temp = monthDaysOf(ly, i);
      }
      if (isLeap && i === leap + 1) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) { isLeap = false; } else { isLeap = true; i--; }
    }
    if (offset < 0) { offset += temp; i--; }
    return { year: ly, month: i, day: offset + 1, isLeap: isLeap };
  }

  /* ================= [2]–[12] 명반 계산 ================= */
  /* 定局표: 행=연 천간(갑…계), 열=명궁 지지(자…해). 값 2/3/4/5/6 */
  var DINGJU = [
    [2,2,6,6,3,3,5,5,4,4,6,6], /* 갑 */
    [6,6,5,5,4,4,3,3,2,2,5,5], /* 을 */
    [5,5,3,3,2,2,4,4,6,6,3,3], /* 병 */
    [3,3,4,4,6,6,2,2,5,5,4,4], /* 정 */
    [4,4,2,2,5,5,6,6,3,3,2,2], /* 무 */
    [2,2,6,6,3,3,5,5,4,4,6,6], /* 기 */
    [6,6,5,5,4,4,3,3,2,2,5,5], /* 경 */
    [5,5,3,3,2,2,4,4,6,6,3,3], /* 신 */
    [3,3,4,4,6,6,2,2,5,5,4,4], /* 임 */
    [4,4,2,2,5,5,6,6,3,3,2,2]  /* 계 */
  ];
  var JU_LABEL = { 2: "수2국", 3: "목3국", 4: "금4국", 5: "토5국", 6: "화6국" };
  var JU_MEAN = {
    2: "지혜와 유연함의 기운으로, 상황에 맞게 흐르듯 살아가는 국입니다.",
    3: "성장과 인내의 기운으로, 꾸준히 뻗어 나가 큰 나무가 되는 국입니다.",
    4: "결단과 의리의 기운으로, 옳다고 믿는 길을 곧게 가는 국입니다.",
    5: "안정과 신뢰의 기운으로, 묵묵히 쌓아 올려 중심이 되는 국입니다.",
    6: "열정과 명예의 기운으로, 밝게 드러나 많은 사람의 주목을 받는 국입니다."
  };

  /* 14주성 표시 순서 */
  var MAIN_ORDER = ["자미","천기","태양","무곡","천동","염정","천부","태음","탐랑","거문","천상","천량","칠살","파군"];
  var MAIN_HANJA = { 자미:"紫微", 천기:"天機", 태양:"太陽", 무곡:"武曲", 천동:"天同", 염정:"廉貞",
    천부:"天府", 태음:"太陰", 탐랑:"貪狼", 거문:"巨門", 천상:"天相", 천량:"天梁", 칠살:"七殺", 파군:"破軍" };
  var AUX_ORDER = ["문창","문곡","좌보","우필","화성","영성","천괴","천월","삼태","팔좌","천형","천요","음살"];
  var AUX_HANJA = { 문창:"文昌", 문곡:"文曲", 좌보:"左輔", 우필:"右弼", 화성:"火星", 영성:"鈴星",
    천괴:"天魁", 천월:"天鉞", 삼태:"三台", 팔좌:"八座", 천형:"天刑", 천요:"天姚", 음살:"陰煞" };

  function compute(y, mo, d, hh, gender) {
    var lunar = solar2lunar(y, mo, d);
    /* [3] 윤달 정책: 1–15일은 해당 월, 16일 이후는 다음 월 */
    var m = lunar.month;
    if (lunar.isLeap) m = (lunar.day <= 15) ? lunar.month : lunar.month + 1;
    if (m > 12) m = 12;
    var day = lunar.day;

    var yStem = mod(lunar.year - 4, 10);   /* [2] 설날 기준 */
    var yBranch = mod(lunar.year - 4, 12);
    var h = Math.floor((mod(hh + 1, 24)) / 2); /* [4] 시지, 子時=23–01 */

    var M = mod(m + 1, 12);                 /* [5] 寅 + (m−1) 순행 */
    var ming = mod(M - h, 12);              /* 명궁 */
    var shen = mod(M + h, 12);              /* [6] 신궁 */

    /* [7] 12궁 지지 (역행) + 궁간 (五虎遁) */
    var yinStem = [2, 4, 6, 8, 0][mod(yStem, 5)]; /* 0→丙 1→戊 2→庚 3→壬 4→甲 */
    var palaces = [];
    for (var i = 0; i < 12; i++) {
      var b = mod(ming - i, 12);
      palaces.push({
        idx: i, name: PALACES[i].name, hanja: PALACES[i].hanja,
        branch: b, stem: mod(yinStem + (b - 2), 10),
        main: [], aux: []
      });
    }
    function palaceOfBranch(b) { return palaces[mod(ming - b, 12)]; }

    /* [8] 오행국 */
    var n = DINGJU[yStem][ming];

    /* [9] 자미 */
    var r = mod(n - mod(day, n), n);
    var q = (day + r) / n;
    var zw = mod(q + 1, 12);
    zw = (r % 2 === 1) ? mod(zw - r, 12) : mod(zw + r, 12);

    /* [10] 14주성 */
    var pos = {};
    pos["자미"] = zw;
    pos["천기"] = mod(zw - 1, 12);
    pos["태양"] = mod(zw - 3, 12);
    pos["무곡"] = mod(zw - 4, 12);
    pos["천동"] = mod(zw - 5, 12);
    pos["염정"] = mod(zw - 8, 12);
    var tf = mod(4 - zw, 12); /* 천부 */
    pos["천부"] = tf;
    pos["태음"] = mod(tf + 1, 12);
    pos["탐랑"] = mod(tf + 2, 12);
    pos["거문"] = mod(tf + 3, 12);
    pos["천상"] = mod(tf + 4, 12);
    pos["천량"] = mod(tf + 5, 12);
    pos["칠살"] = mod(tf + 6, 12);
    pos["파군"] = mod(tf + 10, 12);
    MAIN_ORDER.forEach(function (st) { palaceOfBranch(pos[st]).main.push(st); });

    /* [11] 보조성 */
    var aux = {};
    aux["문창"] = mod(10 - h, 12);
    aux["문곡"] = mod(4 + h, 12);
    var zuo = mod(4 + (m - 1), 12), you = mod(10 - (m - 1), 12);
    aux["좌보"] = zuo;
    aux["우필"] = you;
    var huoStart = (yBranch === 2 || yBranch === 6 || yBranch === 10) ? 1
      : (yBranch === 8 || yBranch === 0 || yBranch === 4) ? 2
      : (yBranch === 5 || yBranch === 9 || yBranch === 1) ? 3 : 9;
    aux["화성"] = mod(huoStart + h, 12);
    aux["영성"] = mod(((yBranch === 2 || yBranch === 6 || yBranch === 10) ? 3 : 9) + h, 12);
    var kuiMap = { 0: 1, 4: 1, 6: 1, 1: 0, 5: 0, 2: 11, 3: 11, 8: 3, 9: 3, 7: 6 };
    var yueMap = { 0: 7, 4: 7, 6: 7, 1: 8, 5: 8, 2: 9, 3: 9, 8: 5, 9: 5, 7: 2 };
    aux["천괴"] = kuiMap[yStem];
    aux["천월"] = yueMap[yStem];
    aux["삼태"] = mod(zuo + day - 1, 12);
    aux["팔좌"] = mod(you - (day - 1), 12);
    aux["천형"] = mod(9 + (m - 1), 12);
    aux["천요"] = mod(1 + (m - 1), 12);
    var yinshaMap = { 1: 2, 2: 0, 3: 9, 4: 8, 5: 6, 0: 4 };
    aux["음살"] = yinshaMap[m % 6];
    AUX_ORDER.forEach(function (st) { palaceOfBranch(aux[st]).aux.push(st); });

    /* [12] 대운 */
    var stemYang = (yStem % 2 === 0);
    var forward = (stemYang && gender === "M") || (!stemYang && gender === "F");
    var dayun = [];
    for (var k = 0; k < 8; k++) {
      var db = forward ? mod(ming + k, 12) : mod(ming - k, 12);
      dayun.push({ age: n + 10 * k, branch: db, palace: PALACES[mod(ming - db, 12)].name });
    }

    return {
      solar: { y: y, mo: mo, d: d, hh: hh },
      lunar: lunar, monthEff: m, day: day,
      yStem: yStem, yBranch: yBranch, hBranch: h,
      M: M, ming: ming, shen: shen,
      palaces: palaces, n: n,
      ju: JU_LABEL[n], juMean: JU_MEAN[n],
      ziwei: zw, mainPos: pos, auxPos: aux,
      gender: gender, genderLabel: (stemYang ? "양" : "음") + (gender === "M" ? "남" : "녀"),
      dayun: dayun, dayunForward: forward
    };
  }

  /* ================= 해석 텍스트 (오리지널) ================= */
  var STAR_INFO = {
    자미: "북극성의 제왕별입니다. 명궁에 자미가 있으면 자존감과 책임감이 강하고 이끄는 자리에 설 운을 타고납니다. 다만 고집이 세어지면 주변과 부딪히니, 권위를 나누는 법을 배우면 크게 성공합니다.",
    천기: "기틀 천(天機), 변화와 지혜의 별입니다. 머리가 빠르고 임기응변에 능해 기획·분석·기술 분야에서 두각을 나타냅니다. 생각이 많아 결정을 미루는 경향이 있으니, 때로는 직관을 믿고 밀어붙이세요.",
    태양: "태양처럼 밝고 따뜻한 별입니다. 명궁에 있으면 명예를 중시하고 베푸는 마음이 커서 많은 사람의 신뢰를 얻습니다. 드러나는 자리에서 빛나며, 지나친 헌신이 자신을 태우지 않도록 쉬는 법도 필요합니다.",
    무곡: "재물과 결단의 별입니다. 돈을 다루는 감각이 뛰어나고 한 번 정하면 밀어붙이는 추진력이 강합니다. 재물궁과 만나면 큰 재를 모으며, 고집스러운 면은 융통성으로 보완하면 좋습니다.",
    천동: "복덕의 별, 온화함의 상징입니다. 마음이 너그럽고 사람들과 잘 어울려 평생 귀인의 도움을 받습니다. 안정을 추구하는 성향이 강해 큰 모험보다는 꾸준한 길에서 복이 쌓입니다.",
    염정: "청렴할 렴(廉貞), 열정과 절개의 별입니다. 옳고 그름이 분명하고 승부욕이 강해 한 분야에서 최고를 노립니다. 감정의 기복과 도화의 기운이 있으니 열정을 다스리면 큰 명예를 얻습니다.",
    천부: "하늘의 창고별입니다. 재물을 모으고 지키는 힘이 강해 안정적인 부를 이룹니다. 보수적이지만 믿음직스러워 주변의 신뢰가 두텁고, 부동산·저축형 재물과 인연이 깊습니다.",
    태음: "달의 별입니다. 부드럽고 섬세한 감성으로 예술·부동산 분야에서 재능을 발휘합니다. 밤의 달처럼 조용히 빛나며, 내면의 불안을 다스리면 재물과 평안을 함께 얻습니다.",
    탐랑: "욕망과 재능의 별입니다. 다재다능하고 사교적이며 변화에 강해 새로운 분야를 개척하는 데 뛰어납니다. 욕심을 절제하고 한 우물을 파면 재물과 인기를 함께 거머쥡니다.",
    거문: "입의 별입니다. 언변이 뛰어나 말로 하는 일(강연·상담·방송)에 재능이 있습니다. 다만 구설에 오르기 쉬우니 비밀을 지키고, 말의 힘을 바르게 쓰면 큰 명성을 얻습니다.",
    천상: "재상의 보좌별입니다. 성실하고 공명정대해 윗사람의 신임을 얻고 조직에서 핵심 역할을 맡습니다. 중재 능력이 뛰어나며, 원칙을 지키면서도 유연함을 갖추면 크게 출세합니다.",
    천량: "어른별, 해결사의 별입니다. 덕이 있고 남을 돕는 마음이 커서 어려운 일을 맡으면 귀인처럼 해결합니다. 의료·법률·상담 분야에서 빛나며, 남을 돕다 자신을 돌보는 것도 잊지 마세요.",
    칠살: "장수의 별입니다. 돌파력과 결단력이 남달라 위기의 순간에 빛을 발합니다. 위험을 무릅쓰는 기질이 있으니 건강과 안전에 유의하고, 힘을 바른 목표에 쓰면 큰 성취를 이룹니다.",
    파군: "파괴와 개척의 별입니다. 낡은 것을 부수고 새로 세우는 힘이 있어 변화의 시대에 강합니다. 잦은 변화로 기반이 흔들릴 수 있으니, 부술 것과 지킬 것을 가리면 큰 재물을 이룹니다."
  };
  var AUX_INFO = {
    문창: "문운의 별로 학업·시험·문서 운이 좋아 글이나 자격증에서 빛을 봅니다.",
    문곡: "예능의 별로 감성과 표현력이 뛰어나 예술·창작 분야에서 재능을 발휘합니다.",
    좌보: "왼편의 돕는 별로 평생 귀인의 도움을 받고 협력자와 함께 성공합니다.",
    우필: "오른편의 돕는 별로 조력자가 따르고 혼자보다 함께할 때 운이 열립니다.",
    화성: "불의 별로 성격이 급하고 충동적이나 순발력과 추진력이 남다릅니다.",
    영성: "방울의 별로 예민하고 고집이 세나 위기에서 번뜩이는 직관이 살아납니다.",
    천괴: "하늘의 귀인별로 어려운 순간에 윗사람의 도움이 나타납니다.",
    천월: "달의 귀인별로 인기가 많고 좋은 인연의 도움으로 일이 풀립니다.",
    삼태: "명예의 별자리로 지위가 오르고 이름이 알려지는 운입니다.",
    팔좌: "안정의 별로 조직 안에서 자리를 얻고 꾸준히 지위를 쌓습니다.",
    천형: "원칙의 별로 법과 규율을 지키면 길하고, 어기면 손해를 보니 조심하세요.",
    천요: "매력의 별로 이성에게 인기가 많고 사교적인 자리에 복이 있습니다.",
    음살: "숨은 방해의 별로 보이지 않는 경쟁이나 구설을 조심해야 합니다."
  };
  var PALACE_INFO = {
    명궁: "인생 전체의 기틀입니다. 성격과 운의 흐름, 인생의 방향을 보여주는 가장 중요한 궁으로 명반 해석의 중심이 됩니다.",
    형제: "형제자매와 가까운 친구의 자리입니다. 형제와의 인연, 동료·친구 관계의 흐름을 보여줍니다.",
    부부: "배우자와 연애의 자리입니다. 결혼 시기와 배우자의 성향, 연애운의 흐름을 읽을 수 있습니다.",
    자녀: "자녀와 창작의 자리입니다. 자녀 인연은 물론 자신의 작품·사업 같은 창조물과의 인연도 보여줍니다.",
    재백: "재물의 흐름을 보는 자리입니다. 돈을 버는 방식과 재물의 많고 적음, 씀씀이의 경향을 알려줍니다.",
    질액: "건강의 자리입니다. 몸의 약한 부분과 주의할 점, 사고수를 미리 살펴 대비할 수 있습니다.",
    천이: "밖으로 나아가는 자리입니다. 이사·이직·여행·유학 등 외부 활동과 타지에서의 운을 보여줍니다.",
    노복: "부하와 조력자의 자리입니다. 직원·후배 중 나를 돕는 사람과 경계할 사람을 가려줍니다.",
    관록: "직업과 명예의 자리입니다. 어울리는 직업, 승진·합격운, 사회적 지위의 흐름을 보여줍니다.",
    전택: "부동산과 가정의 자리입니다. 집·땅과의 인연, 가정생활의 안정, 물려받는 재산을 읽을 수 있습니다.",
    복덕: "정신적 행복의 자리입니다. 취미·신앙·여가에서 오는 마음의 평화와 노년의 복을 보여줍니다.",
    부모: "부모와 윗사람의 자리입니다. 부모님의 건강과 인연, 직장 상사·스승 같은 윗분과의 관계를 보여줍니다."
  };

  /* ================= 렌더링 ================= */
  /* 4×4 격자 위치 → 지지 (중앙 2×2 제외) */
  var GRID = [
    [5, 6, 7, 8],
    [4, -1, -1, 9],
    [3, -1, -1, 10],
    [2, 1, 0, 11]
  ];

  function starSpan(name, cls) {
    var hanja = MAIN_HANJA[name] || AUX_HANJA[name] || "";
    return '<span class="p-star ' + cls + '">' + name +
      (hanja ? '<span style="opacity:.55"> ' + hanja + "</span>" : "") + "</span>";
  }

  function renderChart(c) {
    var grid = document.getElementById("jami-grid");
    grid.innerHTML = "";
    var r, col, b, frag = document.createDocumentFragment();
    for (r = 0; r < 4; r++) {
      for (col = 0; col < 4; col++) {
        b = GRID[r][col];
        if (b < 0) continue;
        var p = c.palaces[mod(c.ming - b, 12)];
        var cell = document.createElement("div");
        cell.className = "palace";
        cell.style.gridRow = (r + 1);
        cell.style.gridColumn = (col + 1);
        cell.setAttribute("data-palace", p.idx);
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", p.name + "궁(" + BRANCHES[b] + ")");
        var html = '<div class="p-branch">' + BRANCHES[b] + "</div>" +
          '<div class="p-name">' + p.name + "</div>" +
          '<div class="p-stars">';
        html += '<span class="p-star aux">' + ganzhi(p.stem, p.branch) + "</span>";
        p.main.forEach(function (st) { html += starSpan(st, "main"); });
        p.aux.forEach(function (st) { html += starSpan(st, "aux"); });
        html += "</div>";
        cell.innerHTML = html;
        cell.addEventListener("click", function () { selectPalace(c, parseInt(this.getAttribute("data-palace"), 10)); });
        cell.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPalace(c, parseInt(this.getAttribute("data-palace"), 10)); }
        });
        frag.appendChild(cell);
      }
    }
    /* 중앙 셀 */
    var center = document.createElement("div");
    center.className = "palace center";
    center.style.gridRow = "2 / 4";
    center.style.gridColumn = "2 / 4";
    var L = c.lunar;
    center.innerHTML =
      '<div class="p-name">명반 주인</div>' +
      '<div class="p-info">' + c.genderLabel +
      "<br>양력 " + c.solar.y + "-" + pad(c.solar.mo) + "-" + pad(c.solar.d) +
      "<br>음력 " + L.year + "-" + pad(c.monthEff) + "-" + pad(c.day) + (L.isLeap ? " (윤" + L.month + "월)" : "") +
      "<br>" + c.ju + " · " + ganzhi(c.yStem, c.yBranch) + "년</div>";
    frag.appendChild(center);
    grid.appendChild(frag);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function selectPalace(c, idx, scroll) {
    var cells = document.querySelectorAll("#jami-grid .palace[data-palace]");
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.toggle("active", parseInt(cells[i].getAttribute("data-palace"), 10) === idx);
    }
    var p = c.palaces[idx];
    var panel = document.getElementById("jami-interp");
    var html = "<h3>" + p.name + "(" + p.hanja + ") · " + ganzhi(p.stem, p.branch) +
      "(" + ganzhiHanja(p.stem, p.branch) + ")" + BRANCHES[p.branch] + "궁</h3>";
    html += "<p>" + PALACE_INFO[p.name] + "</p>";
    if (p.main.length === 0 && p.aux.length === 0) {
      html += "<p>이 궁에는 주성·보조성이 들어 있지 않습니다. 비어 있는 궁은 마주 보는 궁(대궁)의 별을 빌려 읽습니다.</p>";
    }
    p.main.forEach(function (st) {
      html += "<p><strong>" + st + "(" + MAIN_HANJA[st] + ")</strong> — " + STAR_INFO[st] + "</p>";
    });
    p.aux.forEach(function (st) {
      html += "<p><strong>" + st + "(" + AUX_HANJA[st] + ")</strong> — " + AUX_INFO[st] + "</p>";
    });
    panel.innerHTML = html;
    if (scroll !== false && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function joinNames(arr) { return arr.length ? arr.join("·") : "없음"; }

  function renderSummary(c) {
    var L = c.lunar;
    var leapNote = L.isLeap ? "(윤" + L.month + "월 " + L.day + "일)" : "";
    var s = document.getElementById("jami-summary");
    s.innerHTML = "음력 " + L.year + "년 " + c.monthEff + "월 " + c.day + "일" + leapNote +
      " · 명궁 <strong>" + BRANCHES[c.ming] + "</strong>" +
      " · 신궁 <strong>" + BRANCHES[c.shen] + "</strong>" +
      " · <strong>" + c.ju + "</strong>";

    /* 명궁/신궁 총평 */
    var mp = c.palaces[0];
    var sp = c.palaces[mod(c.ming - c.shen, 12)];
    var out = "<h3>명궁 · 신궁 총평</h3>";
    out += "<p>명궁(" + ganzhi(mp.stem, mp.branch) + BRANCHES[mp.branch] + ")에는 주성 " +
      joinNames(mp.main) + "이 자리합니다. " +
      (mp.main.length ? "이 별들의 기운이 성격과 인생의 중심 흐름을 이룹니다. " : "주성이 비어 있어 마주 보는 천이궁의 별을 빌려 읽습니다. ") +
      "보조성 " + joinNames(mp.aux) + "이 함께해 " +
      (mp.aux.length ? "주변의 도움을 받는 요소가 됩니다." : "스스로 개척하는 힘이 강조됩니다.") + "</p>";
    if (sp.idx !== 0) {
      out += "<p>신궁(" + ganzhi(sp.stem, sp.branch) + BRANCHES[sp.branch] + "·" + sp.name + "궁)에는 주성 " +
        joinNames(sp.main) + "이 있어, 후천적으로 만들어가는 운과 중년 이후의 흐름을 보여줍니다. " +
        "명궁이 타고난 바탕이라면 신궁은 스스로 일구어가는 모습입니다.</p>";
    } else {
      out += "<p>신궁이 명궁과 같은 궁에 겹쳐 있어, 타고난 바탕과 스스로 일구는 모습이 하나로 이어지는 명반입니다.</p>";
    }
    out += "<p>" + c.ju + " — " + c.juMean + " " +
      c.dayun[0].age + "세부터 10년 단위로 대운이 " + (c.dayunForward ? "순행" : "역행") +
      "하며, 아래 대운에서 지금의 운을 확인해 보세요.</p>";
    document.getElementById("jami-mingshen").innerHTML = out;
  }

  function renderDayun(c) {
    var now = new Date();
    var kAge = now.getFullYear() - c.solar.y + 1; /* 세는나이 */
    var box = document.getElementById("jami-dayun");
    box.innerHTML = "";
    c.dayun.forEach(function (d) {
      var chip = document.createElement("div");
      chip.className = "luck-chip" + ((kAge >= d.age && kAge < d.age + 10) ? " now" : "");
      chip.innerHTML = '<div class="age">' + d.age + "세~</div>" +
        '<div class="gz">' + d.palace + "</div>" +
        '<div class="age">' + BRANCHES[d.branch] + "</div>";
      box.appendChild(chip);
    });
  }

  function renderAll(c) {
    document.getElementById("jami-title").textContent = c.genderLabel + " · " + c.ju + " 명반";
    renderSummary(c);
    renderChart(c);
    renderDayun(c);
    selectPalace(c, 0, false);
    var wrap = document.getElementById("jami-result");
    wrap.hidden = false;
    wrap.classList.add("show");
    if (wrap.scrollIntoView) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ================= 폼 ================= */
  function validDate(y, mo, d) {
    if (!(y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return false;
    var t = new Date(Date.UTC(y, mo - 1, d));
    return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
  }

  function init() {
    var form = document.getElementById("jami-form");
    if (!form) return;
    /* 성별 세그먼트 */
    var segBtns = form.querySelectorAll(".seg button");
    for (var i = 0; i < segBtns.length; i++) {
      segBtns[i].addEventListener("click", function () {
        for (var j = 0; j < segBtns.length; j++) segBtns[j].classList.remove("on");
        this.classList.add("on");
      });
    }
    form.addEventListener("submit", function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var y = parseInt(document.getElementById("jami-y").value, 10);
      var mo = parseInt(document.getElementById("jami-m").value, 10);
      var d = parseInt(document.getElementById("jami-d").value, 10);
      var hh = parseInt(document.getElementById("jami-h").value, 10);
      var mi = parseInt(document.getElementById("jami-mi").value, 10);
      var on = form.querySelector(".seg button.on");
      var gender = on ? on.getAttribute("data-g") : "M";
      if (!validDate(y, mo, d) || !(hh >= 0 && hh <= 23) || !(mi >= 0 && mi <= 59)) {
        var note = document.getElementById("jami-err");
        if (note) {
          note.textContent = "날짜(1900–2100)와 시간(0–23시, 0–59분)을 올바르게 입력해 주세요.";
          note.hidden = false;
        }
        return;
      }
      var err = document.getElementById("jami-err");
      if (err) err.hidden = true;
      renderAll(compute(y, mo, d, hh, gender));
    });
  }

  if (typeof document !== "undefined" && document.getElementById) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  /* node 테스트·디버그용 */
  if (typeof window !== "undefined") {
    window.JAMI = {
      compute: compute, solar2lunar: solar2lunar,
      renderAll: renderAll, selectPalace: selectPalace,
      BRANCHES: BRANCHES, STEMS: STEMS, LUNAR_INFO: LUNAR_INFO
    };
  }
})();
