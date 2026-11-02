/* Cloud teddy interaction: tap/click, keyboard Enter/Space, or a swipe
   starting on the bear scatters the puffs, then they drift back together.
   pointerdown covers touch/mouse (including swipe-start); a click listener
   covers keyboard activation (Enter/Space on the focused button), with a
   timestamp guard so a physical tap does not double-trigger. All listeners
   passive, no preventDefault, touch-action:pan-y - scrolling never blocked.
   Reduced motion: simple opacity dip, no scatter. */
(() => {
'use strict';
const teddy = document.querySelector('.cloud-teddy');
if (!teddy) return;
const reduce = matchMedia('(prefers-reduced-motion:reduce)');
let busy = false, lastPointer = -1e9;
function scatter() {
  if (busy) return;
  busy = true;
  teddy.classList.add('gone');
  setTimeout(() => { teddy.classList.remove('gone'); setTimeout(() => { busy = false; }, reduce.matches ? 350 : 1100); }, reduce.matches ? 500 : 950);
}
teddy.addEventListener('pointerdown', () => { lastPointer = Date.now(); scatter(); }, { passive: true });
teddy.addEventListener('click', () => { if (Date.now() - lastPointer < 600) return; scatter(); });
})();
