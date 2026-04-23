/* ================================================
   GALLERY DOT — AFTER IMAGE
   script.js  |  Artistic scroll-driven version
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* 1. SPLIT TEXT — char by char */
  function splitChars(el, baseDelay) {
    /* <br>/<em>などHTMLタグを保持しながら文字単位でspanに分解 */
    var tokens = el.innerHTML.match(/<[^>]*>|[^<]/g) || [];
    var n = 0;
    el.innerHTML = tokens.map(function (token) {
      if (token.charAt(0) === '<') return token; /* タグはそのまま */
      if (token.trim() === '') return token;      /* 空白はそのまま */
      var d = (baseDelay || 0) + n * 0.045;
      n++;
      var ch = token === ' ' ? '&nbsp;' : token;
      return '<span class="ch" style="animation-delay:' + d + 's">' + ch + '</span>';
    }).join('');
  }
  var heroTitle = document.querySelector('.hero-ttl');
  if (heroTitle) splitChars(heroTitle, 0.15);

  /* 2. SCROLL PROGRESS BAR */
  var progFill = document.getElementById('prog-fill');

  /* 3. PARALLAX + SCROLL TRANSFORMS */
  var heroBg      = document.querySelector('.hero-bg');
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  var scrollNums  = document.querySelectorAll('.scroll-num');
  var stickyWraps = document.querySelectorAll('.sticky-scene');

  /* 9. STICKY ARTWORK PROGRESS — defined first so onScroll can call it */
  function updateStickyProgress() {
    stickyWraps.forEach(function (wrap) {
      var rect   = wrap.getBoundingClientRect();
      var height = wrap.offsetHeight - window.innerHeight;
      if (height <= 0) return;
      var prog   = Math.max(0, Math.min(1, -rect.top / height));
      var img    = wrap.querySelector('.sticky-img');
      if (img) {
        img.style.transform = 'scale(' + (1 + prog * 0.1) + ')';
        img.style.filter    = 'brightness(' + (0.45 + prog * 0.35) + ')';
      }
      var items = wrap.querySelectorAll('.sticky-text-item');
      items.forEach(function (t, i) {
        var ip = Math.max(0, Math.min(1, prog * items.length - i));
        t.style.opacity   = ip;
        t.style.transform = 'translateY(' + ((1 - ip) * 50) + 'px)';
      });
    });
  }

  function onScroll() {
    var sy    = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (progFill) progFill.style.width = (sy / total * 100) + '%';
    if (heroBg) heroBg.style.transform = 'scale(1.1) translateY(' + (sy * 0.3) + 'px)';
    parallaxEls.forEach(function (el) {
      var speed  = parseFloat(el.dataset.parallax) || 0.2;
      var rect   = el.getBoundingClientRect();
      var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = 'translateY(' + offset + 'px)';
    });
    scrollNums.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var prog = 1 - rect.top / window.innerHeight;
      el.style.transform = 'rotate(' + (prog * 10) + 'deg) scale(' + (1 + prog * 0.05) + ')';
    });
    updateStickyProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 4. INTERSECTION OBSERVER — reveals */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-clip,.stagger-parent,.word-reveal')
    .forEach(function (el) { io.observe(el); });

  /* stagger children */
  var staggerIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.stagger-child').forEach(function (ch, i) {
        ch.style.transitionDelay = (i * 0.11) + 's';
        ch.classList.add('in');
      });
      staggerIo.unobserve(e.target);
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.stagger-parent').forEach(function (el) { staggerIo.observe(el); });

  /* word-by-word reveal */
  document.querySelectorAll('.word-reveal').forEach(function (el) {
    var words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(function (w, i) {
      return '<span class="word" style="transition-delay:' + (i * 0.07) + 's">' + w + '\u00a0</span>';
    }).join('');
  });

  /* 5. FAQ */
  document.querySelectorAll('.fq').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.fi');
      var open = item.classList.contains('open');
      document.querySelectorAll('.fi').forEach(function (i) { i.classList.remove('open'); });
      if (!open) item.classList.add('open');
    });
  });

  /* 6. SCROLL-TO */
  /* ── Nav anchor links: smooth scroll ── */
  document.querySelectorAll('.nav-link[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('[data-scroll-to]').forEach(function (el) {
    el.addEventListener('click', function () {
      var t = document.querySelector(el.getAttribute('data-scroll-to'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* 7. COUNTER ANIMATION */
  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var begin  = performance.now();
    var dur    = 1400;
    (function step(now) {
      var p = Math.min((now - begin) / dur, 1);
      el.textContent = Math.round(p * p * target);
      if (p < 1) requestAnimationFrame(step);
    })(begin);
  }
  var cntIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCounter(e.target); cntIo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cntIo.observe(el); });

  /* 8. MAGNETIC BUTTON */
  document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
    btn.addEventListener('touchstart', function () { btn.style.transform = 'scale(0.96)'; }, { passive: true });
    btn.addEventListener('touchend',   function () { btn.style.transform = ''; });
  });


});

  /* ── 10. RESERVATION TABS ── */
  var resTabs   = document.querySelectorAll('.res-tab');
  var resPanels = document.querySelectorAll('.res-panel');

  resTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.tab;
      resTabs.forEach(function (t) { t.classList.remove('active'); });
      resPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── 11. EVT RESERVE BUTTONS → jump to reservation tab ── */
  document.querySelectorAll('.evt-reserve-btn[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabId = btn.dataset.tab;
      var resSection = document.querySelector('.res-section');
      if (resSection) resSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () {
        var tab = document.querySelector('.res-tab[data-tab="' + tabId + '"]');
        if (tab) tab.click();
      }, 600);
    });
  });


  /* ── Google Form: lazy load iframe when section is visible ── */
  var gformIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var iframe = e.target.querySelector('#gform-iframe');
      var placeholder = e.target.querySelector('#gform-placeholder');
      if (!iframe) return;
      var src = iframe.dataset.src || '';
      /* Only load if a real Google Form URL has been set */
      if (src && src.indexOf('docs.google.com') !== -1) {
        iframe.src = src;
        iframe.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        e.target.classList.add('loaded');
      }
      gformIo.unobserve(e.target);
    });
  }, { threshold: 0.05 });

  var gformWrap = document.querySelector('.gform-wrap');
  if (gformWrap) gformIo.observe(gformWrap);