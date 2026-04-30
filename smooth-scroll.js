/**
 * Smooth inertial lerp scrolling (from SIFT).
 * Apply to document: wheel/touch/key update target; rAF lerps current → target and scrolls.
 *
 * ─── ADJUST THESE ─────────────────────────────────────────────────────────────
 *   lerpFactor     : 0.06 = smooth/slower, 0.12 = snappier. (0–1, typical 0.05–0.15)
 *   touchMultiplier: 2    = touch scroll speed (higher = faster response to swipe)
 *   keyStepRatio   : 0.08 = arrow/page key step as fraction of viewport height
 *   snapThreshold  : 0.05 = when |target - current| < this, snap to target (stops rAF)
 *
 *   Calendar: .calendar-container gets horizontal inertial lerp (same lerp model as vertical)
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

  // Horizontal: calendar page strip
  var cal = document.querySelector('.calendar-container');
  var targetScrollX = 0;
  var currentScrollX = 0;
  var lerpFactorX = 0.06;
  var snapThresholdX = 0.5;
  var scrollCalCausedByUs = false;

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

  function maxScrollX() {
    if (!cal) return 0;
    return Math.max(0, cal.scrollWidth - cal.clientWidth);
  }

  function syncFromCal() {
    if (!cal) return;
    var x = cal.scrollLeft;
    targetScrollX = x;
    currentScrollX = x;
  }

  function clampCalScroll() {
    if (!cal) return;
    var m = maxScrollX();
    targetScrollX = Math.max(0, Math.min(targetScrollX, m));
    currentScrollX = Math.max(0, Math.min(currentScrollX, m));
    scrollCalCausedByUs = true;
    cal.scrollLeft = currentScrollX;
  }

  syncFromWindow();

  if (cal) {
    syncFromCal();
    cal.addEventListener('scroll', function () {
      if (scrollCalCausedByUs) {
        scrollCalCausedByUs = false;
        return;
      }
      if (Math.abs(cal.scrollLeft - currentScrollX) > 2) {
        syncFromCal();
      }
    }, { passive: true });
    var calTouchX = 0;
    cal.addEventListener('touchstart', function (e) {
      calTouchX = e.touches[0].clientX;
    }, { passive: true });
    cal.addEventListener('touchmove', function (e) {
      var m = maxScrollX();
      if (m <= 0) return;
      e.preventDefault();
      var x = e.touches[0].clientX;
      var dx = calTouchX - x;
      calTouchX = x;
      targetScrollX = Math.max(0, Math.min(targetScrollX + dx * touchMultiplier, m));
    }, { passive: false });
  }

  function handleWheel(e) {
    if (e.__smoothScrollHandled) return;
    e.__smoothScrollHandled = true;

    if (cal) {
      e.preventDefault();
      var m = maxScrollX();
      if (m <= 0) return;
      var delta = e.deltaY + e.deltaX;
      targetScrollX = Math.max(0, Math.min(targetScrollX + delta, m));
      return;
    }
    var max = maxScroll();
    if (max <= 0) return;
    e.preventDefault();
    targetScrollY = Math.max(0, Math.min(targetScrollY + e.deltaY, max));
  }

  var wheelOptions = { passive: false, capture: true };
  window.addEventListener('wheel', handleWheel, wheelOptions);
  document.addEventListener('wheel', handleWheel, wheelOptions);

  var touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (cal) return;
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

  var pauseUntil = 0;

  function tick() {
    if (cal) {
      currentScrollX += (targetScrollX - currentScrollX) * lerpFactorX;
      if (Math.abs(targetScrollX - currentScrollX) < snapThresholdX) {
        currentScrollX = targetScrollX;
      }
      scrollCalCausedByUs = true;
      cal.scrollLeft = currentScrollX;
    }
    if (performance.now() < pauseUntil) {
      requestAnimationFrame(tick);
      return;
    }
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
    if (cal) {
      syncFromCal();
    }
  });

  window.addEventListener('resize', function () {
    if (cal) {
      clampCalScroll();
    }
  });

  /** Jump to a scroll Y and hard-sync the lerp so it doesn't yank back. */
  window.setSmoothScrollPosition = function (y, holdMs) {
    var m = maxScroll();
    y = Math.max(0, Math.min(y, m));
    pauseUntil = performance.now() + (holdMs || 250);
    setScrollY(y);
    targetScrollY = y;
    currentScrollY = y;
  };

  /** Programmatic smooth target for in-page navigation. */
  window.setSmoothScrollTargetY = function (y) {
    var m = maxScroll();
    y = Math.max(0, Math.min(y, m));
    pauseUntil = 0;
    currentScrollY = getScrollY();
    targetScrollY = y;
  };
})();
