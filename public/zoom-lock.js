/* Best-effort page zoom lock (user-requested fixed-size experience).
   Blocks: pinch zoom via multi-touch, gesture events (Safari), and leaves
   OS-level accessibility magnification untouched (we cannot and should not block it).
   Single-finger scroll, taps, buttons, forms and canvas drags are unaffected. */
(function () {
  // Safari family
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (t) {
    document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false });
  });
  // Chrome/Android/WebView family: any 2+ finger move on the page is a pinch - cancel it
  document.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  // Belt and braces: never let a second finger's start begin a gesture
  document.addEventListener("touchstart", function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });
})();
