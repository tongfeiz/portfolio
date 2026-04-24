/**
 * Case-study page glue:
 *   - Aligns the right column (metadata + section nav) with the header
 *     "Work" nav link so the project sidebar feels connected to site chrome.
 *   - Updates aria-current on the section nav while scrolling.
 *   - Hooks click handlers on section nav links + the back-to-top link to
 *     drive the smooth-scroll lerp from smooth-scroll.js.
 *
 * Pages must include this script AFTER smooth-scroll.js and AFTER the
 * header has finished injecting #mainNav. Pages should also call
 * window.syncCaseStudyGridToWork() once the header is ready.
 */
(function () {
  var mq = window.matchMedia('(max-width: 900px)');

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function syncCaseStudyGridToWork() {
    var layouts = document.querySelectorAll('.case-study-intro__layout, .case-study-body');
    var work = document.querySelector('#mainNav a[data-section="Work"]');
    if (!layouts.length) return;
    if (mq.matches || !work) {
      layouts.forEach(function (layout) {
        layout.style.gridTemplateColumns = '';
      });
      return;
    }
    var layout = layouts[0];
    var rect = layout.getBoundingClientRect();
    var st = window.getComputedStyle(layout);
    var padL = parseFloat(st.paddingLeft) || 0;
    var gap = parseFloat(st.gap) || parseFloat(st.columnGap) || 0;
    var gridContentLeft = rect.left + padL;
    var workLeft = work.getBoundingClientRect().left;
    var col1 = Math.round(workLeft - gridContentLeft - gap);
    if (col1 < 100) col1 = 100;
    var columns = 'minmax(0,' + col1 + 'px) minmax(0,1fr)';
    layouts.forEach(function (el) {
      el.style.gridTemplateColumns = columns;
    });
  }
  window.syncCaseStudyGridToWork = syncCaseStudyGridToWork;
  window.addEventListener('resize', debounce(syncCaseStudyGridToWork, 60));
  mq.addEventListener('change', syncCaseStudyGridToWork);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(syncCaseStudyGridToWork);
    });
  }

  function initSectionNav() {
    var nav = document.querySelector('.case-study-section-nav');
    if (!nav) return;

    var page = document.querySelector('.case-study-page');
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var items = links
      .map(function (link) {
        var id = link.getAttribute('href').slice(1);
        return { id: id, link: link, section: document.getElementById(id) };
      })
      .filter(function (it) {
        return it.section && it.section.classList.contains('text-section');
      });

    function currentOffset() {
      var raw = page ? window.getComputedStyle(page).getPropertyValue('--case-study-scroll-offset') : '';
      var offset = parseFloat(raw);
      return Number.isFinite(offset) ? offset : 150;
    }

    function scrollY() {
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function maxScrollY() {
      var doc = document.documentElement;
      var body = document.body;
      var height = Math.max(doc.scrollHeight, body.scrollHeight, doc.offsetHeight, body.offsetHeight);
      return Math.max(0, height - window.innerHeight);
    }

    function targetY(section) {
      var y = section.getBoundingClientRect().top + scrollY() - currentOffset();
      return Math.max(0, Math.min(Math.round(y), maxScrollY()));
    }

    function setActive(activeId) {
      items.forEach(function (it) {
        if (it.id === activeId) it.link.setAttribute('aria-current', 'true');
        else it.link.removeAttribute('aria-current');
      });
    }

    items.forEach(function (it) {
      it.link.addEventListener('click', function (e) {
        e.preventDefault();
        setActive(it.id);
        lastActive = it.id;
        if (typeof window.setSmoothScrollTargetY === 'function') {
          window.setSmoothScrollTargetY(targetY(it.section));
        } else {
          window.scrollTo(0, targetY(it.section));
        }
        if (history.pushState) history.pushState(null, '', '#' + it.id);
      });
    });

    var lastActive = null;
    function pickActive() {
      if (!items.length) return;
      if (scrollY() >= maxScrollY() - 2) {
        if (lastActive !== items[items.length - 1].id) {
          lastActive = items[items.length - 1].id;
          setActive(lastActive);
        }
        requestAnimationFrame(pickActive);
        return;
      }
      var line = currentOffset() + 1;
      var activeId = items[0] && items[0].id;
      for (var i = 0; i < items.length; i++) {
        if (items[i].section.getBoundingClientRect().top <= line) {
          activeId = items[i].id;
        } else {
          break;
        }
      }
      if (activeId && activeId !== lastActive) {
        lastActive = activeId;
        setActive(activeId);
      }
      requestAnimationFrame(pickActive);
    }
    requestAnimationFrame(pickActive);
  }

  function initBackToTop() {
    var link = document.querySelector('.case-study-back-to-top a');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof window.setSmoothScrollTargetY === 'function') {
        window.setSmoothScrollTargetY(0);
      } else {
        window.scrollTo(0, 0);
      }
      if (history.pushState) {
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    });
  }

  initSectionNav();
  initBackToTop();
})();
