/* Pause decorative animation while the user is actively scrolling (fast-scroll smoothness on low-end phones) */
(function () {
  var t;
  function onScroll() {
    var b = document.body;
    if (!b.classList.contains('scrolling')) b.classList.add('scrolling');
    clearTimeout(t);
    t = setTimeout(function () { b.classList.remove('scrolling'); }, 160);
  }
  addEventListener('scroll', onScroll, { passive: true });
})();
