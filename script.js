/* ═══════════════════════════════════════════
   открытка — интерактив
   без зависимостей
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  window.cardReady = true;

  var root = document.documentElement;
  var anim = root.classList.contains('anim');

  /* ─── 1. Нет фото — показываем заглушку ──── */
  document.querySelectorAll('.shot img').forEach(function (img) {
    function drop() { img.remove(); }
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

  /* ─── 2. Имя по буквам ───────────────────── */
  var name = document.querySelector('.cover__name');
  if (name && anim) {
    var text = name.textContent;
    name.textContent = '';
    Array.prototype.forEach.call(text, function (ch, i) {
      var span = document.createElement('span');
      span.className = 'ch';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = ch;
      name.appendChild(span);
    });
  }

  /* ─── 3. Обложка играет, когда готовы шрифты и фото */
  if (anim) {
    var hero = document.querySelector('.frame img');
    var waits = [document.fonts ? document.fonts.ready : null];
    if (hero && hero.decode) waits.push(hero.decode().catch(function () {}));
    var timeout = new Promise(function (r) { setTimeout(r, 1500); });

    Promise.race([Promise.all(waits), timeout]).then(function () {
      requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
    });
  }

  /* ─── 4. Конфетти из-под печати ──────────── */
  var colors = ['#F7C3D2', '#EC8FAB', '#D0607F', '#FFE39A', '#D8CBF2', '#FFFFFF'];

  function burst(el) {
    if (!anim || !el.animate) return;
    var r = el.getBoundingClientRect();
    var box = document.createElement('div');
    box.className = 'burst';
    box.style.left = (r.left + r.width / 2 + window.scrollX) + 'px';
    box.style.top = (r.top + r.height / 2 + window.scrollY) + 'px';
    document.body.appendChild(box);

    for (var i = 0; i < 22; i++) {
      var p = document.createElement('i');
      var w = 5 + Math.random() * 5;
      p.style.width = w + 'px';
      p.style.height = (Math.random() < .4 ? w : w * 1.7) + 'px';
      p.style.background = colors[i % colors.length];
      if (Math.random() < .35) p.style.borderRadius = '50%';
      box.appendChild(p);

      var a = Math.random() * Math.PI * 2;
      var dist = 50 + Math.random() * 70;
      var dx = Math.cos(a) * dist;
      var dy = Math.sin(a) * dist * .8 - 30;
      var spin = (Math.random() - .5) * 720;
      p.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + spin / 2 + 'deg)', opacity: 1, offset: .45 },
        { transform: 'translate(' + dx * 1.2 + 'px, ' + (dy + 90) + 'px) rotate(' + spin + 'deg)', opacity: 0 }
      ], { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(.2, .7, .4, 1)', fill: 'forwards' });
    }
    setTimeout(function () { box.remove(); }, 2300);
  }

  // печать на обложке: конфетти, когда опустится, и ещё раз по нажатию
  var coverStamp = document.querySelector('.cover .hanko');
  if (coverStamp) {
    coverStamp.addEventListener('animationend', function () { burst(coverStamp); });
    coverStamp.addEventListener('click', function () {
      if (!anim) return;
      coverStamp.style.animation = 'none';
      void coverStamp.getBoundingClientRect();
      coverStamp.style.animation = 'stamp .55s var(--ease-out) both';
    });
  }

  var finaleStamp = document.querySelector('.finale .hanko');
  if (finaleStamp) finaleStamp.addEventListener('animationend', function () { burst(finaleStamp); });

  /* ─── 5. Появление при прокрутке ─────────── */
  var revealables = document.querySelectorAll('.sheet__head, .polaroid, .letter, .letter mark, .letter__sign, .finale');

  if (!anim || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var reveal = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // полароиды одной пачки ложатся по очереди
        if (el.classList.contains('polaroid')) el.style.setProperty('--d', (k++ * 110) + 'ms');
        el.classList.add('is-in');
        reveal.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });

    revealables.forEach(function (el) { reveal.observe(el); });
  }

  /* ─── 6. Живые полароиды ─────────────────
     видео играют, только пока на экране */
  var videos = document.querySelectorAll('.shot video');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });

  videos.forEach(function (v) { io.observe(v); });
})();
