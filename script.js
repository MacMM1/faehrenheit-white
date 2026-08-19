var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Nav: blur/background intensify once the page has scrolled */
(function () {
  var header = document.getElementById('site-header');
  if (!header) return;
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* Stats: count up from 0 once scrolled into view. The DOM already holds the
   correct final value, so no-JS / reduced-motion / no-IntersectionObserver
   all just show the right number with nothing further to do. */
(function () {
  var values = document.querySelectorAll('.stat-value');
  if (!values.length || reduceMotion || !('IntersectionObserver' in window)) return;

  function animate(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  values.forEach(function (el) { observer.observe(el); });
})();

/* Hero particle network — ambient only, never blocks or hides real content.
   Darker, lower-contrast particles/lines than the black variant since they
   sit on white. */
(function () {
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var hero = canvas.closest('.hero');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var width, height, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    var count = width < 700 ? 18 : 38;
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);
    var linkDist = 130;
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = 'rgba(220, 38, 38, ' + (0.14 * (1 - dist / linkDist)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(10, 10, 10, 0.22)';
    particles.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function step() {
    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });
    drawFrame();
    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  makeParticles();
  drawFrame();
  if (!reduceMotion) requestAnimationFrame(step);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      makeParticles();
      drawFrame();
    }, 150);
  });
})();