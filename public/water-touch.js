/* Water ripple that follows the finger while swiping (user 08:34: "swipe karte time
   water move kare finger moving according"). Small DOM rings along the touch path,
   transform/opacity only, distance-throttled spawns, capped pool, passive listeners -
   normal scrolling is never blocked. */
(() => {
'use strict';
const reduce = matchMedia('(prefers-reduced-motion:reduce)');
if (reduce.matches) return;
const POOL = 9, MIN_DIST = 26;
const ripples = [];
let lastX = -1e9, lastY = -1e9, layer = null;
function host() {
  if (!layer) { layer = document.createElement('div'); layer.className = 'water-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  return layer;
}
function spawn(x, y) {
  if (ripples.length >= POOL) ripples.shift().remove();
  const el = document.createElement('span');
  el.className = 'water-ring';
  el.style.left = x + 'px'; el.style.top = y + 'px';
  host().appendChild(el);
  ripples.push(el);
  setTimeout(() => { el.remove(); const i = ripples.indexOf(el); if (i > -1) ripples.splice(i, 1); }, 950);
}
function move(x, y) {
  if (Math.hypot(x - lastX, y - lastY) < MIN_DIST) return;
  lastX = x; lastY = y; spawn(x, y);
}
addEventListener('touchmove', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); }, { passive: true });
reduce.addEventListener('change', () => { if (reduce.matches && layer) layer.remove(); });
})();
