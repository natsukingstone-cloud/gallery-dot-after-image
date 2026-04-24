/* ================================================
   GALLERY DOT — reservation.js
   統合予約フォーム（来場 + イベント一本化）
   ================================================ */
(function () {
  'use strict';

  /* ★ GASデプロイURLをここに貼り付け */
  var GAS_URL = '【GASデプロイURL】';

  function postToGAS(data, callback) {
    if (!GAS_URL || GAS_URL.indexOf('【') !== -1) {
      setTimeout(function () { callback({ success: true, reservationId: generateId('visit') }); }, 1000);
      return;
    }
    fetch(GAS_URL, { method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(data) })
      .then(function(r){ return r.json(); })
      .then(function(res){ callback(res); })
      .catch(function(){ callback({ success:false, message:'ネットワークエラーが発生しました。' }); });
  }

  function generateId(type) {
    var prefix = {visit:'GD',talk1:'T1',talk2:'T2',live1:'LV',talk3:'T3',live2:'LV'}[type]||'GD';
    var chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var id = prefix + '-';
    for (var i=0; i<6; i++) id += chars[Math.floor(Math.random()*chars.length)];
    return id;
  }
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v){ return /^[0-9\-\+\(\)\s]{10,15}$/.test(v.replace(/\s/g,'')); }

  /* 日程データ */
  var DATES = [
    { val:'01-10', label:'1/10（土）', sub:'開幕日',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-11', label:'1/11（日）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'],
      events:[{ id:'talk1', label:'トークイベントにも参加する',
        title:'「AFTER IMAGE と、10年のキュレーション」', detail:'17:00–18:15 ／ 定員40名', hasNote:true }]
    },
    { val:'01-12', label:'1/12（月）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-13', label:'1/13（火）', sub:'休廊日', slots:[], soldOut:true },
    { val:'01-14', label:'1/14（水）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-15', label:'1/15（木）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-16', label:'1/16（金）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-17', label:'1/17（土）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'],
      events:[{ id:'talk2', label:'トークイベントにも参加する',
        title:'「記憶・物質・イメージの残り方」', detail:'18:00–19:00 ／ 定員35名 ／ 来場予約者優先', hasNote:true }]
    },
    { val:'01-18', label:'1/18（日）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'],
      events:[{ id:'live1', label:'ライブパフォーマンスにも参加する',
        title:'「AFTER IMAGE / Light Trace」', detail:'18:30–19:10 ／ 定員30名 ／ 撮影不可', hasNote:false }]
    },
    { val:'01-19', label:'1/19（月）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-21', label:'1/21（水）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-22', label:'1/22（木）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-23', label:'1/23（金）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
    { val:'01-24', label:'1/24（土）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30'],
      events:[{ id:'talk3', label:'トークイベントにも参加する',
        title:'「若手作家が語る "AFTER IMAGE"」', detail:'16:00–17:00 ／ 定員50名 ／ 当日参加も可', hasNote:true }]
    },
    { val:'01-25', label:'1/25（日）', sub:'',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'],
      events:[{ id:'live2', label:'ライブパフォーマンスを鑑賞する（予約不要）',
        title:'「Archive Body」— 牧村澪 × 井上湊', detail:'17:30–18:00 ／ 当日観覧可', hasNote:false, noReserve:true }]
    },
    { val:'01-26', label:'1/26（月）', sub:'最終日',
      slots:['12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'] },
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.getElementById('form-unified');
    if (!wrap) return;

    var state = { date:null, dateData:null, time:'', companions:0, events:[] };
    var dateGrid    = document.getElementById('u-date-grid');
    var timeWrap    = document.getElementById('u-time-wrap');
    var timeSlots   = document.getElementById('u-time-slots');
    var eventWrap   = document.getElementById('u-event-wrap');
    var eventChecks = document.getElementById('u-event-checks');
    var noteWrap    = document.getElementById('u-event-note-wrap');
    var counterVal  = wrap.querySelector('.gd-counter-val');
    var submitBtn   = wrap.querySelector('.gd-submit');
    var form        = wrap.querySelector('form');

    /* 日付ボタン生成 */
    DATES.forEach(function (d) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gd-date-btn' + (d.soldOut ? ' sold-out' : '');
      btn.dataset.val = d.val;
      var sublabel = d.sub ? ' — ' + d.sub : '';
      var dot = (d.events && d.events.length && !d.soldOut)
        ? '<span class="date-event-dot"></span>' : '';
      btn.innerHTML =
        '<span class="date-d">' + d.label + '</span>' +
        '<span class="date-label">' + sublabel + '</span>' + dot;
      if (!d.soldOut) {
        btn.addEventListener('click', function () {
          wrap.querySelectorAll('.gd-date-btn').forEach(function(b){b.classList.remove('selected');});
          btn.classList.add('selected');
          state.date = d.val; state.dateData = d; state.time = ''; state.events = [];
          renderTimeSlots(d.slots);
          renderEventSection(d.events);
        });
      }
      dateGrid.appendChild(btn);
    });

    /* 時間帯 */
    function renderTimeSlots(slots) {
      timeSlots.innerHTML = '';
      timeWrap.style.display = slots.length ? 'block' : 'none';
      slots.forEach(function (t) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'gd-time-btn'; btn.textContent = t;
        btn.addEventListener('click', function () {
          wrap.querySelectorAll('.gd-time-btn').forEach(function(b){b.classList.remove('selected');});
          btn.classList.add('selected'); state.time = t;
        });
        timeSlots.appendChild(btn);
      });
    }

    /* イベントセクション（日付選択に連動） */
    function renderEventSection(events) {
      if (!events || !events.length) {
        eventWrap.style.display = 'none';
        noteWrap.style.display  = 'none';
        eventChecks.innerHTML   = '';
        return;
      }
      eventChecks.innerHTML = '';
      events.forEach(function (ev) {
        if (ev.noReserve) {
          /* 予約不要イベントは情報のみ表示 */
          var info = document.createElement('div');
          info.className = 'event-info-only';
          info.innerHTML =
            '<div class="event-info-title">' + ev.title + '</div>' +
            '<div class="event-info-detail">' + ev.detail + '</div>' +
            '<div class="event-info-freenote">予約不要 — 当日そのままご参加いただけます</div>';
          eventChecks.appendChild(info);
          return;
        }
        var lbl = document.createElement('label');
        lbl.className = 'gd-check-item event-check-item';
        lbl.innerHTML =
          '<input type="checkbox" name="event_join" value="' + ev.id + '">' +
          '<span class="gd-check-box"></span>' +
          '<span class="gd-check-label">' +
            '<strong>' + ev.label + '</strong>' +
            '<span class="event-check-title">' + ev.title + '</span>' +
            '<small>' + ev.detail + '</small>' +
          '</span>';
        lbl.querySelector('input').addEventListener('change', function () {
          state.events = Array.from(eventChecks.querySelectorAll('input:checked')).map(function(c){return c.value;});
          var needNote = state.events.some(function(id){
            return events.some(function(e){return e.id===id && e.hasNote;});
          });
          noteWrap.style.display = needNote ? 'block' : 'none';
        });
        eventChecks.appendChild(lbl);
      });
      /* 表示アニメーション */
      eventWrap.style.opacity   = '0';
      eventWrap.style.transform = 'translateY(12px)';
      eventWrap.style.display   = 'block';
      requestAnimationFrame(function(){
        eventWrap.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        eventWrap.style.opacity    = '1';
        eventWrap.style.transform  = 'translateY(0)';
      });
    }

    /* カウンター */
    wrap.querySelector('.gd-counter-btn[data-action=minus]').addEventListener('click', function(){
      if (state.companions>0){ state.companions--; counterVal.textContent=state.companions; }
    });
    wrap.querySelector('.gd-counter-btn[data-action=plus]').addEventListener('click', function(){
      if (state.companions<2){ state.companions++; counterVal.textContent=state.companions; }
    });

    /* バリデーション */
    function validate() {
      var ok=true, msgs=[];
      var summary = wrap.querySelector('.gd-validation-summary');
      var name=wrap.querySelector('[name=name]'), email=wrap.querySelector('[name=email]'), phone=wrap.querySelector('[name=phone]');
      if (!name.value.trim())        { name.classList.add('error');  msgs.push('氏名を入力してください'); ok=false; }
      else name.classList.remove('error');
      if (!isValidEmail(email.value)){ email.classList.add('error'); msgs.push('正しいメールアドレスを入力してください'); ok=false; }
      else email.classList.remove('error');
      if (!isValidPhone(phone.value)){ phone.classList.add('error'); msgs.push('電話番号を入力してください'); ok=false; }
      else phone.classList.remove('error');
      if (!state.date) { msgs.push('来場日を選択してください'); ok=false; }
      if (!state.time) { msgs.push('時間帯を選択してください'); ok=false; }
      if (!wrap.querySelector('[name=consent]').checked){ msgs.push('個人情報の取り扱いへの同意が必要です'); ok=false; }
      if (!ok){ summary.innerHTML=msgs.join('<br>'); summary.classList.add('visible'); summary.scrollIntoView({behavior:'smooth',block:'center'}); }
      else summary.classList.remove('visible');
      return ok;
    }

    /* 送信 */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      submitBtn.disabled = true; submitBtn.textContent = '送信中…';
      var noteEl = wrap.querySelector('[name=note]');
      postToGAS({
        type:'visit',
        name:  wrap.querySelector('[name=name]').value.trim(),
        email: wrap.querySelector('[name=email]').value.trim(),
        phone: wrap.querySelector('[name=phone]').value.trim(),
        visit_date:  state.date,
        visit_time:  state.time,
        companions:  String(state.companions),
        talk_events: state.events,
        event_note:  noteEl ? noteEl.value.trim() : '',
        line_consent: wrap.querySelector('[name=line_consent]') ? wrap.querySelector('[name=line_consent]').checked : false,
        consent: wrap.querySelector('[name=consent]').checked
      }, function (res) {
        if (res && res.success) {
          showSuccess(wrap, res.reservationId || generateId('visit'));
        } else {
          submitBtn.disabled = false; submitBtn.textContent = '来場予約する — 無料';
          var s = wrap.querySelector('.gd-validation-summary');
          s.innerHTML = (res && res.message) ? res.message : '送信に失敗しました。再度お試しください。';
          s.classList.add('visible');
        }
      });
    });
  });

  function showSuccess(wrap, id) {
    wrap.querySelector('form').style.display = 'none';
    var suc = wrap.querySelector('.gd-success');
    suc.querySelector('.gd-success-id').textContent = '予約番号：' + id;
    suc.classList.add('visible');
    suc.scrollIntoView({ behavior:'smooth', block:'center' });
  }

})();