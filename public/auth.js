/* 복운수호 — Google 로그인 (Google Identity Services, 정적 사이트용)
   ============================================================
   Client ID는 복운수호 전용입니다 (사주빛과 다름 — anh tạo 2026-11-06):
   565064645551-ht8gdl9m0fl5jnft244vcc2p8d9q0eqk.apps.googleusercontent.com
   Authorized JavaScript origin: https://bokunsuho.xnsfacebook.workers.dev
   (도메인을 바꾸면 Google Cloud Console에서 origin을 추가하세요.)
   ----------------------------------------------------------------
   동작: 로그인하면 이름·이메일·프로필 사진만 localStorage에 저장
   (서버 없음 — 토큰 검증 없음, 가벼운 식별용). 로그아웃하면 삭제.
   로그인하면 app.js가 본인 이름+사진으로 전면 좌석에 가상 캐릭터를 앉힌다.
   환영 모달은 공개 사이트에서만 뜹니다 — localhost/OBS·Electron
   스테이지에서는 뜨지 않아 방송 화면을 가리지 않습니다. */
(function () {
  'use strict';

  var GOOGLE_CLIENT_ID = '565064645551-ht8gdl9m0fl5jnft244vcc2p8d9q0eqk.apps.googleusercontent.com'; // 복운수호 전용 Client ID
  var LS_USER = 'sajubit_user';
  var SS_WELCOME = 'sajubit_welcome_seen';

  function loadUser() {
    try { var r = localStorage.getItem(LS_USER); return r ? JSON.parse(r) : null; }
    catch (e) { return null; }
  }
  function saveUser(u) { try { localStorage.setItem(LS_USER, JSON.stringify(u)); } catch (e) {} }
  function clearUser() { try { localStorage.removeItem(LS_USER); } catch (e) {} }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function decodeJwt(token) {
    try {
      var payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(payload))));
    } catch (e) { return null; }
  }

  function onGoogleSignIn(resp) {
    var p = resp && resp.credential ? decodeJwt(resp.credential) : null;
    if (!p) return;
    var user = { name: p.name || '', email: p.email || '', picture: p.picture || '' };
    saveUser(user);
    paintAuthArea();
    closeWelcome();
    /* 새로고침하면 app.js가 본인 이름+사진으로 전면 좌석에 캐릭터를 앉힌다 */
    location.reload();
  }

  function logout() { clearUser(); location.reload(); }
  window.bokunLogout = logout;

  /* ---------- 상단 로그인 영역 (스테이지 타이틀바 / 상점 헤더) ---------- */
  function paintAuthArea() {
    var user = loadUser();
    /* 스테이지 타이틀바 */
    var controls = document.querySelector('.window-controls');
    if (controls) {
      var old = document.getElementById('auth-area');
      if (old) old.remove();
      var span = document.createElement('span');
      span.id = 'auth-area';
      span.className = 'auth-area';
      if (user) {
        var img = user.picture
          ? '<img class="auth-avatar" src="' + escapeHtml(user.picture) + '" alt="" referrerpolicy="no-referrer">'
          : '<span class="auth-avatar auth-avatar-fallback">' + escapeHtml((user.name || '?').charAt(0)) + '</span>';
        span.innerHTML = img +
          '<span class="auth-name">' + escapeHtml(user.name) + '</span>' +
          '<button class="win-btn auth-logout" type="button" onclick="bokunLogout()">로그아웃</button>';
      } else {
        span.innerHTML = '<button class="win-btn" type="button" onclick="bokunOpenLogin()">🔐 로그인</button>';
      }
      controls.insertBefore(span, controls.firstChild);
      return;
    }
    /* 상점 페이지 헤더 */
    var slot = document.getElementById('auth-area');
    if (slot) {
      if (user) {
        var img2 = user.picture
          ? '<img class="auth-avatar" src="' + escapeHtml(user.picture) + '" alt="" referrerpolicy="no-referrer">'
          : '<span class="auth-avatar auth-avatar-fallback">' + escapeHtml((user.name || '?').charAt(0)) + '</span>';
        slot.innerHTML = img2 +
          '<span class="auth-name">' + escapeHtml(user.name) + '</span>' +
          '<button class="auth-logout-btn" type="button" onclick="bokunLogout()">로그아웃</button>';
      } else {
        slot.innerHTML = '<button class="auth-login-btn" type="button" onclick="bokunOpenLogin()">🔐 로그인</button>';
      }
    }
  }

  /* ---------- 환영 모달 (처음 들어올 때, 공개 사이트에서만) ---------- */
  function buildWelcome() {
    if (document.getElementById('auth-modal')) return;
    var div = document.createElement('div');
    div.id = 'auth-modal';
    div.className = 'modal-backdrop auth-modal';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.innerHTML =
      '<div class="modal-card auth-modal-card">' +
        '<div class="auth-modal-seal">福</div>' +
        '<h2>복운수호에 오신 것을 환영합니다</h2>' +
        '<p>Google로 로그인하면 나만의 이름으로<br>온라인 사찰에 참여할 수 있어요.</p>' +
        '<div id="auth-gsi-btn"></div>' +
        '<p id="auth-setup-note" class="auth-setup-note" hidden>Google 로그인은 곧 준비됩니다.<br>관리자가 연동을 마치는 대로 이용할 수 있어요.</p>' +
        '<button class="auth-skip" type="button" id="auth-skip">나중에 하기</button>' +
      '</div>';
    var host = document.querySelector('.stage-container') || document.body;
    host.appendChild(div);
    div.addEventListener('click', function (e) { if (e.target === div) closeWelcome(); });
    var skip = document.getElementById('auth-skip');
    if (skip) skip.addEventListener('click', closeWelcome);
  }
  function openWelcome() { buildWelcome(); var m = document.getElementById('auth-modal'); if (m) { m.classList.add('open'); renderGsiButton(); } }
  function closeWelcome() {
    var m = document.getElementById('auth-modal');
    if (m) m.classList.remove('open');
    try { sessionStorage.setItem(SS_WELCOME, '1'); } catch (e) {}
  }
  window.bokunOpenLogin = openWelcome;

  /* ---------- Google Identity Services 버튼 ---------- */
  var gsiLoading = false;
  function drawGsiButton(slot) {
    if (!slot || !window.google || !window.google.accounts) return;
    try {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleSignIn });
      window.google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', width: 280, text: 'signin_with', locale: 'ko' });
    } catch (e) {}
  }
  function renderGsiButton() {
    var slot = document.getElementById('auth-gsi-btn');
    var note = document.getElementById('auth-setup-note');
    if (!slot) return;
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('YOUR_GOOGLE') === 0) {
      if (note) note.hidden = false;
      slot.innerHTML = '';
      return;
    }
    if (note) note.hidden = true;
    if (window.google && window.google.accounts) { drawGsiButton(slot); return; }
    if (gsiLoading) return;
    gsiLoading = true;
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = function () { drawGsiButton(document.getElementById('auth-gsi-btn')); };
    document.head.appendChild(s);
  }

  /* ---------- 시작 ---------- */
  function isStageHost() {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '';
  }
  function init() {
    paintAuthArea();
    /* localhost = OBS·Electron 스테이지: 모달을 띄우지 않음 */
    if (!loadUser() && !isStageHost()) {
      var seen = false;
      try { seen = !!sessionStorage.getItem(SS_WELCOME); } catch (e) {}
      if (!seen) openWelcome();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
