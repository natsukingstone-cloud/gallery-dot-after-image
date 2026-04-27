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

  /* ── 11. EVT RESERVE BUTTONS → scroll to unified reservation form ── */
  document.querySelectorAll('.evt-reserve-btn[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var resSection = document.querySelector('.res-section');
      if (resSection) resSection.scrollIntoView({ behavior: 'smooth' });
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
  /* ── Fixed bottom CTA: show after hero ── */
  var fixedCta     = document.getElementById('fixed-cta');
  var heroSection  = document.querySelector('.hero');
  var resSection   = document.querySelector('.res-section');
  if (fixedCta) {
    var ctaIo = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        /* Show after hero passes, hide when reservation form is visible */
        if (!e.isIntersecting && e.target === heroSection) {
          fixedCta.classList.add('visible');
        } else if (e.isIntersecting && e.target === heroSection) {
          fixedCta.classList.remove('visible');
        }
        if (e.isIntersecting && e.target === resSection) {
          fixedCta.classList.remove('visible');
        } else if (!e.isIntersecting && e.target === resSection && !heroSection.getBoundingClientRect().bottom > 0) {
          fixedCta.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    if (heroSection)  ctaIo.observe(heroSection);
    if (resSection)   ctaIo.observe(resSection);
    /* Fixed CTA button scroll */
    fixedCta.querySelector('.fixed-cta-btn').addEventListener('click', function(){
      if (resSection) resSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── Artists slider ── */
  var sliderWrap  = document.querySelector('.artists-slider');
  var dotsWrap    = document.getElementById('artist-dots');
  if (sliderWrap) {
    var cards = Array.from(sliderWrap.querySelectorAll('.artist-feature'));
    var total = cards.length;
    var current = 0;

    /* Create dots */
    if (dotsWrap) {
      cards.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'アーティスト ' + (i+1));
        dot.addEventListener('click', function(){ goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    /* Create arrows */
    var arrowWrap = document.createElement('div');
    arrowWrap.className = 'slider-arrows';
    arrowWrap.innerHTML =
      '<button class="slider-arrow" id="arrow-prev">&#8592;</button>' +
      '<button class="slider-arrow" id="arrow-next">&#8594;</button>';
    sliderWrap.parentNode.insertBefore(arrowWrap, sliderWrap.nextSibling);
    document.getElementById('arrow-prev').addEventListener('click', function(){ goTo(current - 1); });
    document.getElementById('arrow-next').addEventListener('click', function(){ goTo(current + 1); });

    function goTo(n) {
      current = (n + total) % total;
      sliderWrap.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (dotsWrap) {
        Array.from(dotsWrap.querySelectorAll('.slider-dot')).forEach(function(d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }

    /* Touch/swipe support */
    var touchStartX = 0;
    sliderWrap.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, { passive:true });
    sliderWrap.addEventListener('touchend', function(e){
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive:true });
  }