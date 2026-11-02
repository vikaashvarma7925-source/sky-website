/* DNA glass-card helix: cards orbit a twisting spine as you scroll.
   Transform/opacity only; one rAF per scroll frame; pauses offscreen/hidden. */
(() => {
'use strict';
const section = document.querySelector('.sky-helix');
if (!section) return;
const reduce = matchMedia('(prefers-reduced-motion:reduce)');
if (reduce.matches) return;
const ring = section.querySelector('.helix-ring'), spine = section.querySelector('.helix-spine');
if (!ring || !spine) return;
const cards = [...ring.children], segs = [...spine.children];
const N = cards.length, STEP = 360 / N, M = segs.length;
section.classList.add('helix-live');
let raf = 0;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
function draw() {
  raf = 0;
  if (document.hidden) return;
  const r = section.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const p = clamp(-r.top / Math.max(1, section.offsetHeight - innerHeight));
  const mob = innerWidth < 701;
  const R = mob ? 190 : 300, y = mob ? 72 : 92;
  const phi = p * (N - 1) * STEP, f = phi / STEP;
  ring.style.transform = 'translateY(' + (-f * y).toFixed(1) + 'px) rotateY(' + (-phi).toFixed(2) + 'deg)';
  for (let i = 0; i < N; i++) {
    let a = (i * STEP - phi) % 360; if (a > 180) a -= 360; if (a < -180) a += 360;
    const c = Math.cos(a * Math.PI / 180);
    cards[i].style.opacity = String(clamp(.16 + .84 * Math.max(0, c)));
    cards[i].style.transform = 'rotateY(' + (i * STEP) + 'deg) translateZ(' + R + 'px) translateY(' + (i * y) + 'px)';
  }
  const segStep = mob ? 46 : 54, segR = mob ? 26 : 34;
  for (let j = 0; j < M; j++) {
    segs[j].style.transform = 'translateY(' + ((j - (M - 1) / 2) * segStep) + 'px) rotateY(' + (j * 34 - phi * .6).toFixed(1) + 'deg) translateZ(' + segR + 'px)';
  }
}
function queue() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0 } else queue(); });
reduce.addEventListener('change', () => { if (reduce.matches) { section.classList.remove('helix-live'); ring.removeAttribute('style'); cards.forEach(c => c.removeAttribute('style')); segs.forEach(s => s.removeAttribute('style')) } });
queue();
})();
