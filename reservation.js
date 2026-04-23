/* ================================================
   GALLERY DOT — AFTER IMAGE
   reservation.js  |  Form logic
   ================================================ */

(function () {
  'use strict';

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ★ GASのデプロイURLをここに貼り付けてください
     Gas→デプロイ→ウェブアプリのURLをコピー
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbzt-Jf4lAlPeIZkpIVToxM36jvtAOywTyHRG7Ldp16ZYV5fspzKS0ArXhTc4TLcIOSm/exec';

  /* GASへPOSTするヘルパー */
  function postToGAS(data, callback) {
    if (!GAS_URL || GAS_URL.indexOf('【') !== -1) {
      /* GAS未設定時はデモ動作 */
      setTimeout(function () {
        callback({ success: true, reservationId: generateId() });
      }, 1000);
      return;
    }
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    })
    .then(function(r) { return r.json(); })
    .then(function(res) { callback(res); })
    .catch(function(err) {
      console.error('GAS error:', err);
      callback({ success: false, message: 'ネットワークエラーが発生しました。' });
    });
  }

  /* ── Utility ── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function generateId() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var id = 'GD-';
    for (var i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) { return /^[0-9\-\+\(\)\s]{10,15}$/.test(v.replace(/\s/g,'')); }

  /* ── Date/Time slot data ── */
  var VISIT_DATES = [
    { val:'01-10', label:'1/10（土）', sub:'開幕日', slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-11', label:'1/11（日）', sub:'',       slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-12', label:'1/12（月）', sub:'',       slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-13', label:'1/13（火）', sub:'休廊日',  slots:[], soldOut:true },
    { val:'01-14', label:'1/14（水）', sub:'',       slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-15', label:'1/15（木）', sub:'',       slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-16', label:'1/16（金）', sub:'',       slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-17', label:'1/17（土）', sub:'トーク②', slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'] },
    { val:'01-18', label:'1/18（日）', sub:'ライブ①', slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'] },
    { val:'01-24', label:'1/24（土）', sub:'トーク③', slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30'] },
    { val:'01-25', label:'1/25（日）', sub:'ライブ②', slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'] },
    { val:'01-26', label:'1/26（月）', sub:'最終日',  slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
  ];

  /* ── Form state ── */
  function makeState() {
    return { date:'', time:'', companions:0, errors:{} };
  }

  /* ═════════════════════════════════════════
     VISIT FORM
     ═════════════════════════════════════════ */
  function initVisitForm() {
    var wrap = document.getElementById('form-visit');
    if (!wrap) return;
    var state = makeState();

    /* Date grid */
    var dateGrid = wrap.querySelector('.gd-date-grid');
    VISIT_DATES.forEach(function (d) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gd-date-btn' + (d.soldOut ? ' sold-out' : '');
      btn.dataset.val = d.val;
      btn.innerHTML = '<span class="date-d">' + d.label.split('（')[0].replace('1/','') + '</span>' +
                      '<span class="date-label">' + d.label + (d.sub ? '<br>' + d.sub : '') + '</span>';
      if (!d.soldOut) {
        btn.addEventListener('click', function () {
          $$('.gd-date-btn', wrap).forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.date = d.val;
          renderTimeSlots(d.slots);
        });
      }
      dateGrid.appendChild(btn);
    });

    /* Time slots */
    var timeWrap = wrap.querySelector('.gd-time-slot-wrap');
    var timeGrid = wrap.querySelector('.gd-time-slots');

    function renderTimeSlots(slots) {
      timeGrid.innerHTML = '';
      timeWrap.style.display = slots.length ? 'block' : 'none';
      slots.forEach(function (t) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gd-time-btn';
        btn.textContent = t;
        btn.addEventListener('click', function () {
          $$('.gd-time-btn', timeGrid).forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.time = t;
        });
        timeGrid.appendChild(btn);
      });
    }
    timeWrap.style.display = 'none';

    /* Companion counter */
    var counterVal = wrap.querySelector('.gd-counter-val');
    wrap.querySelector('.gd-counter-btn[data-action=minus]').addEventListener('click', function () {
      if (state.companions > 0) { state.companions--; counterVal.textContent = state.companions; }
    });
    wrap.querySelector('.gd-counter-btn[data-action=plus]').addEventListener('click', function () {
      if (state.companions < 2) { state.companions++; counterVal.textContent = state.companions; }
    });

    /* Submit */
    var submitBtn = wrap.querySelector('.gd-submit');
    var form = wrap.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateVisit(wrap, state)) return;
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中…';

      var data = {
        type:         'visit',
        name:         wrap.querySelector('[name=name]').value.trim(),
        email:        wrap.querySelector('[name=email]').value.trim(),
        phone:        wrap.querySelector('[name=phone]').value.trim(),
        visit_date:   state.date,
        visit_time:   state.time,
        companions:   String(state.companions),
        talk_events:  Array.from(wrap.querySelectorAll('[name=talk]:checked')).map(function(c){return c.value;}),
        line_consent: wrap.querySelector('[name=line_consent]') ? wrap.querySelector('[name=line_consent]').checked : false,
        consent:      wrap.querySelector('[name=consent]').checked
      };

      postToGAS(data, function(res) {
        if (res && res.success) {
          showSuccess(wrap, res.reservationId || generateId());
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = '来場予約する — 無料・3分';
          var summary = wrap.querySelector('.gd-validation-summary');
          summary.innerHTML = (res && res.message) ? res.message : '送信に失敗しました。再度お試しください。';
          summary.classList.add('visible');
        }
      });
    });
  }

  function validateVisit(wrap, state) {
    var ok = true;
    var summary = wrap.querySelector('.gd-validation-summary');
    var msgs = [];

    /* Name */
    var name = wrap.querySelector('[name=name]');
    if (!name.value.trim()) { name.classList.add('error'); msgs.push('氏名を入力してください'); ok = false; }
    else name.classList.remove('error');

    /* Email */
    var email = wrap.querySelector('[name=email]');
    if (!isValidEmail(email.value)) { email.classList.add('error'); msgs.push('メールアドレスを正しく入力してください'); ok = false; }
    else email.classList.remove('error');

    /* Phone */
    var phone = wrap.querySelector('[name=phone]');
    if (!isValidPhone(phone.value)) { phone.classList.add('error'); msgs.push('電話番号を正しく入力してください'); ok = false; }
    else phone.classList.remove('error');

    /* Date */
    if (!state.date) { msgs.push('来場日を選択してください'); ok = false; }

    /* Time */
    if (!state.time) { msgs.push('時間帯を選択してください'); ok = false; }

    /* Consent */
    var consent = wrap.querySelector('[name=consent]');
    if (!consent.checked) { msgs.push('個人情報の取り扱いへの同意が必要です'); ok = false; }

    if (!ok) {
      summary.innerHTML = msgs.join('<br>');
      summary.classList.add('visible');
      summary.scrollIntoView({ behavior:'smooth', block:'center' });
    } else {
      summary.classList.remove('visible');
    }
    return ok;
  }

  /* ═════════════════════════════════════════
     EVENT FORM (汎用 — talk/live共通)
     ═════════════════════════════════════════ */
  function initEventForm(formId) {
    var wrap = document.getElementById(formId);
    if (!wrap) return;
    var form = wrap.querySelector('form');
    var submitBtn = wrap.querySelector('.gd-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateEvent(wrap)) return;
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中…';

      var data = {
        type:    formId.replace('form-', ''),
        name:    wrap.querySelector('[name=name]').value.trim(),
        email:   wrap.querySelector('[name=email]').value.trim(),
        phone:   wrap.querySelector('[name=phone]') ? wrap.querySelector('[name=phone]').value.trim() : '',
        note:    wrap.querySelector('[name=note]') ? wrap.querySelector('[name=note]').value.trim() : '',
        reservation_id_ref: wrap.querySelector('[name=reservation_id_ref]') ? wrap.querySelector('[name=reservation_id_ref]').value.trim() : '',
        theme:   wrap.querySelector('[name=theme]') ? wrap.querySelector('[name=theme]').value.trim() : '',
        with_child: wrap.querySelector('[name=with_child]') ? wrap.querySelector('[name=with_child]').checked : false,
        consent: wrap.querySelector('[name=consent]').checked
      };

      postToGAS(data, function(res) {
        if (res && res.success) {
          showSuccess(wrap, res.reservationId || generateId());
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || '申し込む';
          var summary = wrap.querySelector('.gd-validation-summary');
          summary.innerHTML = (res && res.message) ? res.message : '送信に失敗しました。再度お試しください。';
          summary.classList.add('visible');
        }
      });
    });
  }

  function validateEvent(wrap) {
    var ok = true;
    var summary = wrap.querySelector('.gd-validation-summary');
    var msgs = [];

    var name = wrap.querySelector('[name=name]');
    if (!name || !name.value.trim()) {
      if (name) name.classList.add('error');
      msgs.push('氏名を入力してください'); ok = false;
    } else name.classList.remove('error');

    var email = wrap.querySelector('[name=email]');
    if (!email || !isValidEmail(email.value)) {
      if (email) email.classList.add('error');
      msgs.push('メールアドレスを正しく入力してください'); ok = false;
    } else email.classList.remove('error');

    var consent = wrap.querySelector('[name=consent]');
    if (!consent || !consent.checked) {
      msgs.push('個人情報の取り扱いへの同意が必要です'); ok = false;
    }

    if (!ok) {
      summary.innerHTML = msgs.join('<br>');
      summary.classList.add('visible');
      summary.scrollIntoView({ behavior:'smooth', block:'center' });
    } else {
      summary.classList.remove('visible');
    }
    return ok;
  }

  /* ═════════════════════════════════════════
     SUCCESS STATE
     ═════════════════════════════════════════ */
  function showSuccess(wrap, reservationId) {
    wrap.querySelector('form').style.display = 'none';
    var suc = wrap.querySelector('.gd-success');
    suc.querySelector('.gd-success-id').textContent = '予約番号：' + reservationId;
    suc.classList.add('visible');
    suc.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  /* ── Init all forms on load ── */
  document.addEventListener('DOMContentLoaded', function () {
    initVisitForm();
    ['form-talk1','form-talk2','form-live1','form-talk3'].forEach(initEventForm);
  });

})();