/* 복운수호 상점 — 어필리에이트 링크 + 띠 필터 + 구매 버튼 연결.
   AFFILIATE_LINKS는 구매 버튼용 AliExpress 어필리에이트 링크입니다.
   새 상품을 추가하면 양쪽 파일을 함께 업데이트하세요. */
const AFFILIATE_LINKS = {
  "jade-pixiu-bracelet": "https://s.click.aliexpress.com/e/_c3omDGrj", // 버마 비취 픽시우 팔찌 ($36.90)
  "jade-dragon-pendant": "https://s.click.aliexpress.com/e/_c3occYZR", // 천연 비취 용 펜던트 목걸이 ($39.30)
  "tiger-eye-bracelet": "https://s.click.aliexpress.com/e/_c3FNqvil", // 골든 타이거 아이 행운 팔찌 ($28.20)
  "jadeite-bangle": "https://s.click.aliexpress.com/e/_c3zjvZSV", // 버마 비취 뱅글 팔찌 ($22.10)
  "jade-silver-set": "https://s.click.aliexpress.com/e/_c3T9hA33", // 미얀마 경옥 925 실버 세트 ($40.40)
  "burma-jade-bracelet": "https://s.click.aliexpress.com/e/_c3P5cpl3", // 천연 버마 비취 팔찌 ($29.60)
  "jade-flower-bracelet": "https://s.click.aliexpress.com/e/_c40NPlUD", // 미얀마 경옥 꽃 팔찌 ($25.70)
  "silver-cuban-bracelet": "https://s.click.aliexpress.com/e/_c4tDQPqz", // S925 헤비 쿠반 팔찌 ($31.20)
  "lavender-pixiu-pendant": "https://s.click.aliexpress.com/e/_c4nee04V", // 천연 라벤더 비취 픽시우 펜던트 ($44.60)
  "blue-pixiu-pendant": "https://s.click.aliexpress.com/e/_c4SSfrjf", // 블루 워터 픽시우 펜던트 ($22.00)
  "imperial-jade-pendant": "https://s.click.aliexpress.com/e/_c4CGnjK9", // 황실 풀그린 비취 펜던트 ($44.80)

  "jade-buddha-pendant": "https://s.click.aliexpress.com/e/_c3JLzzop", // 불상 비취 펜던트 목걸이 ($55)
  "silver-pixiu-rope-bracelet": "https://s.click.aliexpress.com/e/_c3OOvAyH", // 999 실버 비휴 빨간 로프 팔찌 ($45)
  "jade-buddha-necklace": "https://s.click.aliexpress.com/e/_c3U7sYVB", // 미얀마 비취 부처 펜던트 목걸이 ($41)
  "jade-snake-pendant": "https://s.click.aliexpress.com/e/_c4bu46J3", // 비취 뱀 펜던트 목걸이 ($32)
  "horseshoe-jade-pendant": "https://s.click.aliexpress.com/e/_c3iyMViz", // 블루워터 비취 말굽 펜던트 ($31)
  "jade-buddha-pendant-2": "https://s.click.aliexpress.com/e/_c4SK6sL3", // 블루워터 부처 펜던트 목걸이 ($26)
  "jade-maitreya-pendant": "https://s.click.aliexpress.com/e/_c4cfnIi1", // 비취 미륵불 펜던트 ($25)
  "clover-jade-pendant": "https://s.click.aliexpress.com/e/_c4l8hQ85", // 미얀마 옥 네잎클로버 펜던트 ($20)
  "jade-bead-bracelet": "https://s.click.aliexpress.com/e/_c3pdkESt", // 비취 비즈 팔찌 ($18)
  "baby-buddha-pendant": "https://s.click.aliexpress.com/e/_c2uyjKYl", // 블루워터 아기부처 펜던트 ($18)
  "pixiu-bead-bracelet": "https://s.click.aliexpress.com/e/_c3wxGUlB", // 블루워터 픽시우 비즈 팔찌 ($17)
  "jade-mataray-pendant": "https://s.click.aliexpress.com/e/_c41kcX0h", // 미얀마 제이드 펜던트 목걸이 ($17)
  "jade-ring-earring-set": "https://s.click.aliexpress.com/e/_c3O4al0Z", // 미얀마 비취 반지·귀걸이 세트 ($16)
  "jade-pixiu-bracelet-2": "https://s.click.aliexpress.com/e/_c4nzTN9L", // 천연 비취 픽시우 팔찌 ($15)
  "obsidian-pixiu-bracelet": "https://s.click.aliexpress.com/e/_c3LppHl7", // 흑요석 픽시우 팔찌 ($15)
  "jade-pixiu-pendant-2": "https://s.click.aliexpress.com/e/_c3CamqzR", // 미얀마 경옥 픽시우 펜던트 ($14)
  "dragon-buddha-pendant": "https://s.click.aliexpress.com/e/_c3YNWYhf", // 더블드래곤 웃는부처 펜던트 ($14)
  "jade-pixiu-bangle": "https://s.click.aliexpress.com/e/_c4V83Ghr", // 버마 경옥 픽시우 뱅글 ($14)
  "jade-flower-ring": "https://s.click.aliexpress.com/e/_c3p4WtAH", // 버마 경옥 꽃 반지 ($14)
  "ice-jade-ring": "https://s.click.aliexpress.com/e/_c2uXgP5F", // 아이스블루 옥 반지 ($13)

  "store-home": "",
};

function filterProducts(zodiac, btn) {
  var filters = btn.closest ? btn.closest('.filters') : null;
  if (filters) {
    var btns = filters.querySelectorAll('.filter');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('on');
    btn.classList.add('on');
  }
  var grid = document.querySelector('.product-grid');
  if (!grid) return;
  var cards = grid.querySelectorAll('.card');
  for (var j = 0; j < cards.length; j++) {
    var z = cards[j].getAttribute('data-zodiac');
    cards[j].style.display = (zodiac === 'all' || z === zodiac) ? '' : 'none';
  }
}

(function () {
  'use strict';
  function wire() {
    var buys = document.querySelectorAll('[data-buy]');
    for (var i = 0; i < buys.length; i++) {
      var el = buys[i];
      var url = AFFILIATE_LINKS[el.getAttribute('data-buy')];
      if (url) {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'sponsored nofollow noopener');
      } else {
        el.style.display = 'none';
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
