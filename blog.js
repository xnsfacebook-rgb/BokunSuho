/* 복운수호 블로그 — 오늘의 띠별 운세 위젯 + 글 카테고리 필터 */
(function () {
  'use strict';

  var ZODIAC = [
    { id: 'rat',     name: '쥐',  emoji: '🐀', years: '1948·60·72·84·96·08', fortune: '재물운이 밝은 날입니다. 미뤄둔 일, 특히 돈과 관련된 결정을 오늘 처리하면 좋은 결과가 따라옵니다. 다만 말 한마디가 구설이 될 수 있으니, 중요한 자리에서는 한 번 더 생각하고 말하세요.', color: '하늘색', number: 7 },
    { id: 'ox',      name: '소',  emoji: '🐂', years: '1949·61·73·85·97·09', fortune: '묵묵히 해온 노력이 눈에 띄기 시작합니다. 윗사람이나 귀인의 눈에 들 수 있는 날이니, 평소보다 한 발 먼저 움직여 보세요. 건강은 어깨와 목의 긴장을 풀어주는 것이 좋습니다.', color: '녹색', number: 3 },
    { id: 'tiger',   name: '호랑이', emoji: '🐅', years: '1950·62·74·86·98·10', fortune: '기운이 왕성한 날입니다. 새로운 일에 도전하기 좋고, 경쟁에서 이길 힘이 있습니다. 다만 성급한 판단은 손해로 이어질 수 있으니, 큰 결정은 오후로 미루세요.', color: '주황색', number: 9 },
    { id: 'rabbit',  name: '토끼', emoji: '🐇', years: '1951·63·75·87·99·11', fortune: '인간관계에서 좋은 소식이 들려옵니다. 오래 연락이 뜸했던 사람과의 재회가 행운을 가져다줍니다. 집안의 작은 정리가 마음의 안정으로 이어지는 날입니다.', color: '분홍색', number: 2 },
    { id: 'dragon',  name: '용',  emoji: '🐉', years: '1952·64·76·88·00·12', fortune: '귀인의 도움을 받을 수 있는 날입니다. 막혔던 일이 의외의 곳에서 풀리니, 주변의 조언을 귀담아들으세요. 금전은 들어오는 것보다 나가는 것을 먼저 점검하는 것이 좋습니다.', color: '금색', number: 8 },
    { id: 'snake',   name: '뱀',  emoji: '🐍', years: '1953·65·77·89·01·13', fortune: '직감과 통찰력이 빛나는 날입니다. 복잡한 문제를 한 번에 꿰뚫어 볼 수 있으니, 중요한 판단을 오늘 하세요. 다만 몸이 보내는 피로 신호를 무시하지 마세요.', color: '보라색', number: 5 },
    { id: 'horse',   name: '말',  emoji: '🐎', years: '1954·66·78·90·02·14', fortune: '움직임이 행운을 부릅니다. 외출, 미팅, 여행 등 발이 닿는 곳마다 기회가 있습니다. 이동 중 만나는 사람이 좋은 인연이 될 수 있으니, 낯선 사람에게도 미소를 건네보세요.', color: '빨간색', number: 1 },
    { id: 'goat',    name: '양',  emoji: '🐐', years: '1955·67·79·91·03·15', fortune: '예술적 감각과 따뜻한 마음이 빛나는 날입니다. 가족과의 시간이 특히 복이 되니, 저녁 식사를 함께하세요. 오래된 고민이 뜻밖의 위로로 풀릴 수 있습니다.', color: '흰색', number: 6 },
    { id: 'monkey',  name: '원숭이', emoji: '🐒', years: '1956·68·80·92·04·16', fortune: '재치와 순발력이 빛을 발하는 날입니다. 어려운 협상이나 대화에서 유리한 고지를 점할 수 있습니다. 문서나 계약은 꼼꼼히 읽고 서명하세요.', color: '노란색', number: 4 },
    { id: 'rooster', name: '닭',  emoji: '🐓', years: '1957·69·81·93·05·17', fortune: '정리정돈의 운이 강한 날입니다. 책상, 서류, 통장을 정리하면 막힌 재물운이 트입니다. 주변의 칭찬이 따르니, 자존감이 높아지는 하루가 됩니다.', color: '파란색', number: 10 },
    { id: 'dog',     name: '개',  emoji: '🐕', years: '1958·70·82·94·06·18', fortune: '신뢰가 복이 되는 날입니다. 약속을 지키면 더 큰 기회가 돌아옵니다. 오랜 친구의 연락에 답장을 하면, 뜻밖의 좋은 소식이 이어집니다.', color: '갈색', number: 11 },
    { id: 'pig',     name: '돼지', emoji: '🐖', years: '1959·71·83·95·07·19', fortune: '복이 들어오는 날입니다. 작은 행운이 연달아 찾아오니, 오늘은 평소보다 조금 더 욕심을 내도 좋습니다. 다만 과식은 피하고, 저녁은 가볍게 드세요.', color: '은색', number: 12 }
  ];

  function todayKo() {
    var d = new Date();
    var week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + week + '요일';
  }

  function initWidget() {
    var dateEl = document.getElementById('hero-date');
    if (dateEl) dateEl.textContent = todayKo();
    var picker = document.getElementById('zodiac-picker');
    var result = document.getElementById('fortune-result');
    if (!picker || !result) return;
    picker.innerHTML = '';
    ZODIAC.forEach(function (z) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zodiac-btn';
      b.innerHTML = '<span class="z-emoji">' + z.emoji + '</span>' +
        '<span class="z-name">' + z.name + '띠</span>' +
        '<span class="z-year">' + z.years.split('·')[2] + '년생</span>';
      b.addEventListener('click', function () {
        picker.querySelectorAll('.zodiac-btn').forEach(function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
        result.innerHTML =
          '<h3>' + z.emoji + ' ' + z.name + '띠 오늘의 운세</h3>' +
          '<p>' + z.fortune + '</p>' +
          '<div class="fortune-meta"><span>행운의 색 <b>' + z.color + '</b></span>' +
          '<span>행운의 숫자 <b>' + z.number + '</b></span>' +
          '<span>출생년도 <b>' + z.years + '</b></span></div>';
        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      picker.appendChild(b);
    });
  }

  function initFilter() {
    var chips = document.querySelectorAll('.filter-chips .chip');
    if (!chips.length) return;
    var cards = document.querySelectorAll('.post-grid .post-card');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('selected'); });
        chip.classList.add('selected');
        var cat = chip.getAttribute('data-cat');
        cards.forEach(function (card) {
          card.style.display = (cat === 'all' || card.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initWidget(); initFilter(); });
  } else { initWidget(); initFilter(); }
})();
