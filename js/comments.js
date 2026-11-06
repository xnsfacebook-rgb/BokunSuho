/* 복운수호 — 댓글 (Google 계정 연동)
   ============================================================
   동작: 로그인한 Google 계정의 이름·사진으로 댓글을 남깁니다.
   저장은 브라우저 localStorage(페이지별) — 지금은 각 방문자의
   기기에만 저장됩니다. 전 방문자가 공유하는 댓글로 바꾸려면
   Firebase Firestore(무료)로 저장소를 교체하면 됩니다.
   (이 파일의 loadComments/saveComments만 바꾸면 됨) */
(function () {
  'use strict';

  var LS_USER = 'sajubit_user';

  function loadUser() {
    try { var r = localStorage.getItem(LS_USER); return r ? JSON.parse(r) : null; }
    catch (e) { return null; }
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function storeKey(pageKey) { return 'bokun_comments_' + pageKey; }
  function loadComments(pageKey) {
    try { var r = localStorage.getItem(storeKey(pageKey)); return r ? JSON.parse(r) : []; }
    catch (e) { return []; }
  }
  function saveComments(pageKey, list) {
    try { localStorage.setItem(storeKey(pageKey), JSON.stringify(list)); } catch (e) {}
  }
  function timeAgo(ts) {
    var d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60) return '방금 전';
    if (d < 3600) return Math.floor(d / 60) + '분 전';
    if (d < 86400) return Math.floor(d / 3600) + '시간 전';
    if (d < 86400 * 7) return Math.floor(d / 86400) + '일 전';
    var t = new Date(ts);
    return t.getFullYear() + '년 ' + (t.getMonth() + 1) + '월 ' + t.getDate() + '일';
  }
  function avatarHtml(user, size) {
    if (user && user.picture) {
      return '<img class="comment-avatar" src="' + escapeHtml(user.picture) + '" alt="" referrerpolicy="no-referrer">';
    }
    var initial = user && user.name ? escapeHtml(user.name.charAt(0)) : '?';
    return '<span class="comment-avatar comment-avatar-fallback">' + initial + '</span>';
  }

  function render(section) {
    var pageKey = section.getAttribute('data-page');
    var user = loadUser();
    var list = loadComments(pageKey);
    var countEl = section.querySelector('.comment-count');
    if (countEl) countEl.textContent = list.length;

    var listEl = section.querySelector('.comment-list');
    if (list.length === 0) {
      listEl.innerHTML = '<p class="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>';
    } else {
      listEl.innerHTML = list.map(function (c, i) {
        var mine = user && user.email && c.email && user.email === c.email;
        return '<div class="comment">' +
          avatarHtml({ name: c.name, picture: c.picture }) +
          '<div class="comment-body">' +
            '<div class="comment-head"><b>' + escapeHtml(c.name) + '</b>' +
            '<span class="comment-time">' + escapeHtml(timeAgo(c.time)) + '</span>' +
            (mine ? '<button type="button" class="comment-del" data-idx="' + i + '">삭제</button>' : '') +
            '</div>' +
            '<p class="comment-text">' + escapeHtml(c.text).replace(/\n/g, '<br>') + '</p>' +
          '</div></div>';
      }).join('');
    }
    listEl.querySelectorAll('.comment-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var cur = loadComments(pageKey);
        cur.splice(idx, 1);
        saveComments(pageKey, cur);
        render(section);
      });
    });

    var formArea = section.querySelector('.comment-form-area');
    if (user) {
      formArea.innerHTML =
        '<form class="comment-form">' +
          avatarHtml(user) +
          '<div class="comment-form-main">' +
            '<div class="comment-form-name">' + escapeHtml(user.name) + ' 님으로 댓글 쓰기</div>' +
            '<textarea class="comment-input" rows="3" maxlength="500" placeholder="따뜻한 댓글을 남겨주세요." required></textarea>' +
            '<div class="comment-form-row"><span class="note">Google 계정 이름·사진이 표시됩니다.</span>' +
            '<button type="submit" class="btn">댓글 남기기</button></div>' +
          '</div>' +
        '</form>';
      var form = formArea.querySelector('.comment-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ta = form.querySelector('.comment-input');
        var text = ta.value.trim();
        if (!text) return;
        var cur = loadComments(pageKey);
        cur.push({ name: user.name, email: user.email || '', picture: user.picture || '', text: text, time: Date.now() });
        saveComments(pageKey, cur);
        render(section);
      });
    } else {
      formArea.innerHTML =
        '<div class="comment-login-box">' +
          '<p>댓글을 남기려면 Google 계정으로 로그인하세요.</p>' +
          '<button type="button" class="btn" onclick="bokunOpenLogin()">🔐 Google로 로그인</button>' +
        '</div>';
    }
  }

  function init() {
    document.querySelectorAll('.comments').forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
