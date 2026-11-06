/* 복운수호 — 운세 도구 공용 상수 & 헬퍼 (js/tools.js)
   tool-saju.html / tool-jami.html / tool-juyeok.html 에서 함께 사용.
   전역 스코프 const + 함수. 로드 시 DOM 부수효과 없음. */
"use strict";

/* ---------- 천간 · 지지 ---------- */
const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
/* 천간 → 오행 (목화토금수) */
const ELEMENT_OF_STEM = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
/* 천간 → 음양 */
const YINYANG_OF_STEM = ["양", "음", "양", "음", "양", "음", "양", "음", "양", "음"];
/* 지지 → 띠 동물 (쥐…돼지) */
const ZODIAC_ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

/* ---------- 자미두수 12궁 (명궁부터 시계 방향) ---------- */
const PALACE_NAMES_12 = ["명궁", "형제", "부부", "자녀", "재백", "질액", "천이", "노복", "관록", "전택", "복덕", "부모"];

/* ---------- 주역 8괘 (한글 + 한자) ---------- */
const TRIGRAMS = [
  { ko: "건", hanja: "乾" },
  { ko: "태", hanja: "兌" },
  { ko: "리", hanja: "離" },
  { ko: "진", hanja: "震" },
  { ko: "손", hanja: "巽" },
  { ko: "감", hanja: "坎" },
  { ko: "곤", hanja: "艮" },
  { ko: "중", hanja: "坤" }
];

/* ---------- 헬퍼 ---------- */
/* 양의 나머지 (음수 입력도 0 이상으로) */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/* 간지 문자열: ganzhi(0, 0) → "갑자" */
function ganzhi(stemIdx, branchIdx) {
  return STEMS[mod(stemIdx, 10)] + BRANCHES[mod(branchIdx, 12)];
}

/* id로 엘리먼트 조회 */
function el(id) {
  return document.getElementById(id);
}
