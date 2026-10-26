/* home-preview engine - scene STAGE architecture:
   scroll-linked crossfades over SHORT travel (0.7 viewport-height per scene change).
   No scroll-snap, no snap offsets, no touch interception, no per-frame JS scrolling.
   A normal swipe changes the scene BY ITSELF (progress-driven); the only JS-initiated
   scrolling is debounced native scrollTo (tap-to-advance and the rest-position tidy). */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var wrap = document.getElementById('stageWrap');
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var ticking = false;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function wrapTop() { var r = wrap.getBoundingClientRect(); return r.top + scrollY; }
  function travel() { return Math.round(innerHeight * 0.7); }
  function progress() { return clamp((scrollY - wrapTop()) / travel(), 0, panels.length - 1); }

  function render() {
    ticking = false;
    if (reduced || !wrap) return;
    var p = progress();
    for (var i = 0; i < panels.length; i++) {
      var el = panels[i];
      var vis = clamp(1 - Math.abs(p - i), 0, 1);
      var e = ease(vis);
      var dir = (i >= p ? 1 : -1);
      el.style.opacity = e.toFixed(3);
      el.style.transform = 'translate3d(0,' + (dir * (1 - e) * 26).toFixed(1) + 'px,0) scale(' + (0.985 + 0.015 * e).toFixed(3) + ')';
      el.style.pointerEvents = e > 0.5 ? 'auto' : 'none';
      el.inert = e <= 0.5;
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  render();

  /* tap-to-advance: plain click (the browser itself cancels click on swipes) + ONE native
     smooth scrollTo. Always moves exactly one scene forward from the visible position. */
  var tapTarget = null; /* chains rapid taps: each tap = one MORE scene, even mid-ride */
  document.addEventListener('click', function (ev) {
    if (reduced || !wrap) return;
    if (ev.target.closest && ev.target.closest('a,button,input,textarea,select,label,dialog')) return;
    var maxY = wrapTop() + (panels.length - 1) * travel();
    if (scrollY > maxY + 10) return; /* below the stage: normal page taps */
    var base = tapTarget !== null ? tapTarget : Math.round(progress());
    var nxt = base + 1;
    if (nxt > panels.length - 1) { /* on the last scene: a tap carries on to the tools below */
      tapTarget = null;
      scrollTo({ top: maxY + Math.round(innerHeight * 0.45), behavior: 'smooth' });
      return;
    }
    tapTarget = nxt;
    scrollTo({ top: wrapTop() + nxt * travel(), behavior: 'smooth' });
  });

  /* rest tidy: after scrolling fully stops AND no finger is down, glide to the nearest full
     scene with one native smooth scroll. Never acts below the stage. The scene CHANGE itself
     never depends on this - it is driven by the swipe through the crossfade above. */
  var settleT = 0, touchDown = false;
  document.addEventListener('touchstart', function () { touchDown = true; tapTarget = null; }, { passive: true });
  document.addEventListener('touchend', function () { touchDown = false; }, { passive: true });
  addEventListener('scroll', function () {
    clearTimeout(settleT);
    settleT = setTimeout(function () {
      if (reduced || touchDown || !wrap) return;
      var maxY = wrapTop() + (panels.length - 1) * travel();
      if (scrollY > maxY + 10) return;
      var p = progress(), target = Math.round(p);
      if (Math.abs(p - target) * travel() > 40) scrollTo({ top: wrapTop() + target * travel(), behavior: 'smooth' });
      tapTarget = null;
    }, 180);
  }, { passive: true });

  /* starfield: same budget as the approved scroll-preview (34 dots mobile / 70 desktop) */
  var cv = document.getElementById('skyStars');
  var ctx = cv.getContext('2d');
  var W, H, dpr, dots = [], running = false, raf = 0;
  var N = reduced ? 0 : (innerWidth <= 700 ? 34 : 70);
  var LINK = 92;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = cv.width = Math.round(innerWidth * dpr);
    H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
  }
  function seed() {
    dots = [];
    for (var i = 0; i < N; i++) {
      dots.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12 * dpr, vy: (Math.random() - 0.5) * 0.12 * dpr,
        r: (Math.random() * 1.9 + 0.9) * dpr,
        g: Math.random() < 0.55
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var i, j, d, dx, dy;
    for (i = 0; i < dots.length; i++) {
      d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
    }
    ctx.lineWidth = dpr * 0.6;
    for (i = 0; i < dots.length; i++) {
      for (j = i + 1; j < dots.length; j++) {
        dx = dots[i].x - dots[j].x; dy = dots[i].y - dots[j].y;
        var dist = dx * dx + dy * dy;
        if (dist < LINK * LINK * dpr * dpr) {
          var a = 0.18 * (1 - Math.sqrt(dist) / (LINK * dpr));
          ctx.strokeStyle = 'rgba(189,121,255,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < dots.length; i++) {
      d = dots[i];
      ctx.fillStyle = d.g ? 'rgba(246,201,105,.9)' : 'rgba(189,121,255,.8)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
    }
  }
  var frozen = false, lastDraw = 0;
  function frame(now) {
    raf = 0;
    sample(now);
    if (frozen) return;
    if (!document.body.classList.contains('scrolling') && !document.body.classList.contains('picker-open') && (innerWidth > 700 || now - lastDraw >= 80)) { draw(); lastDraw = now; }
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (!running && N && !document.hidden && !frozen) { running = true; if (!raf) raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* adaptive calm trigger (passive sampler; fx-slow pauses ambient CSS, stars freeze) */
  var ticks = 0, sampleStart = 0, sampledOnce = false;
  function sample(now) {
    if (frozen || innerWidth > 700) return;
    if (!sampleStart) sampleStart = now;
    ticks++;
    if (now - sampleStart > 2500) {
      var fps = ticks / ((now - sampleStart) / 1000);
      sampleStart = 0; ticks = 0;
      if (fps < 45) {
        if (sampledOnce) {
          if (fps < 24) document.body.classList.add('fx-slow');
          frozen = true; stop();
        }
        sampledOnce = true;
      }
    }
  }

  resize(); seed(); start();
  addEventListener('resize', function () { resize(); seed(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();

/* feedback: opens the visitor's mail app with the message prefilled; no backend, nothing uploaded.
   DISABLED until the real SKY address exists: no mailto may point at an unowned address. */
var FB_EMAIL='skystudio.feedback@gmail.com'; /* set to the real SKY address once created - one line re-enables the feature */
var fbForm=document.getElementById('feedbackForm');
if(fbForm){
  var fbNote=fbForm.querySelector('.feedback-note');
  if(!FB_EMAIL){
    var fbBtn=fbForm.querySelector('button[type="submit"]');
    if(fbBtn){fbBtn.disabled=true;fbBtn.style.opacity='.55';}
    if(fbNote){fbNote.textContent='Feedback email is being set up - coming soon.';}
  } else {
    fbForm.addEventListener('submit',function(e){
      e.preventDefault();
      var n=(document.getElementById('fbName').value||'').trim();
      var m=(document.getElementById('fbMsg').value||'').trim();
      if(!m)return;
      var body=(n?('From: '+n+'\n\n'):'')+m;
      location.href='mailto:'+FB_EMAIL+'?subject='+encodeURIComponent('SKY website feedback')+'&body='+encodeURIComponent(body);
    });
  }
}
