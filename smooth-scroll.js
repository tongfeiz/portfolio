/**
 * Smooth inertial lerp scrolling (from SIFT).
 * Apply to document: wheel/touch/key update target; rAF lerps current → target and scrolls.
 *
 * ─── ADJUST THESE ─────────────────────────────────────────────────────────────
 *   lerpFactor     : 0.06 = smooth/slower, 0.12 = snappier. (0–1, typical 0.05–0.15)
 *   touchMultiplier: 2    = touch scroll speed (higher = faster response to swipe)
 *   keyStepRatio   : 0.08 = arrow/page key step as fraction of viewport height
 *   snapThreshold  : 0.05 = when |target - current| < this, snap to target (stops rAF)
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  document.documentElement.style.scrollBehavior = 'auto';

  var targetScrollY = 0;
  var currentScrollY = 0;

  // ─── Tweak these to change feel ───
  var lerpFactor = 0.06;
  var touchMultiplier = 2;
  var keyStepRatio = 0.08;
  var snapThreshold = 0.05;

  function getScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function setScrollY(y) {
    window.scrollTo(0, y);
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  }

  var maxScroll = function () {
    var doc = document.documentElement;
    var body = document.body;
    var docHeight = Math.max(doc.scrollHeight, body.scrollHeight, doc.offsetHeight, body.offsetHeight);
    return Math.max(0, docHeight - window.innerHeight);
  };

  function syncFromWindow() {
    var y = getScrollY();
    targetScrollY = y;
    currentScrollY = y;
  }

  syncFromWindow();

  window.addEventListener('wheel', function (e) {
    var max = maxScroll();
    if (max <= 0) return;
    e.preventDefault();
    targetScrollY = Math.max(0, Math.min(targetScrollY + e.deltaY, max));
  }, { passive: false });

  var touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    var max = maxScroll();
    if (max <= 0) return;
    e.preventDefault();
    var dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    targetScrollY = Math.max(0, Math.min(targetScrollY + dy * touchMultiplier, max));
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    var max = maxScroll();
    if (max <= 0) return;
    var step = window.innerHeight * keyStepRatio;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      targetScrollY = Math.min(targetScrollY + step, max);
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      targetScrollY = Math.max(targetScrollY - step, 0);
    }
  });

  var scrollCausedByUs = false;
  window.addEventListener('scroll', function () {
    if (scrollCausedByUs) {
      scrollCausedByUs = false;
      return;
    }
    var wy = getScrollY();
    if (Math.abs(wy - currentScrollY) > 2) {
      syncFromWindow();
    }
  }, { passive: true });

  function tick() {
    currentScrollY += (targetScrollY - currentScrollY) * lerpFactor;
    if (Math.abs(targetScrollY - currentScrollY) < snapThreshold) {
      currentScrollY = targetScrollY;
    }
    scrollCausedByUs = true;
    setScrollY(currentScrollY);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('load', function () {
    syncFromWindow();
  });
})();
