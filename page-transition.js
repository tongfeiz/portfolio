/**
 * Page Transition System
 *
 * Smooth fade transition between the main pages (Work / About / Calendar).
 *
 * Goals:
 * - The header never moves. It stays completely static across the transition
 *   (and across the actual navigation). The only time the header is affected
 *   is the very first on-page-load duck animation (loading-system.js).
 * - The body content (everything below the header) fades OUT on the outgoing
 *   page and fades IN on the incoming page.
 * - The header's page-specific bits — the subtitle next to "Tongfei"
 *   ("+ Design") and the middle slot (clock on Work, "My 2025" on Calendar,
 *   empty on About) — do a vertical mask-reveal: the outgoing content slides
 *   UP and out, the incoming content slides UP from below into place. Each
 *   slot moves as a whole unit (e.g. the clock's "LA … // HK …" travels
 *   together).
 * - Intro animations on the destination page (profile photo slide-in, card
 *   fade-ins, etc.) are suppressed when arriving via a transition.
 *
 * The mask-reveal is implemented as an overlay layered on top of the header
 * at the slot's natural position. The ORIGINAL DOM is never rearranged, so
 * the header's flex layout can't be disturbed.
 */
(function () {
  if (window.self !== window.top) return;

  /* ---------- Tunables ---------- */
  var FADE_OUT_MS = 350;
  var FADE_IN_MS = 400;
  var HEADER_MS = 600;
  var FADE_EASE = 'ease-out';
  var HEADER_EASE = 'cubic-bezier(0.83, 0, 0.17, 1)';
  var SLOT_PAD_Y = 6;   // extra vertical room in the mask so descenders aren't clipped
  var SLOT_PAD_X = 10;  // extra horizontal room to avoid text being clipped at edges
  /** Must match `.brand { gap: … }` in header / index (Tongfei block → + Design). */
  var BRAND_HOME_PLUS_GAP = 8;

  var NAV_FLAG = 'pt:navigating';
  // Treat all same-origin .html pages as transitionable (including projects),
  // except for partials and other non-pages.
  var EXCLUDED_TRANSITION_FILES = ['header.html'];

  var ANIM_SELECTORS = [
    '.profile-section',
    '.section-title',
    '.experience-row',
    '.resume-button',
    '.about-text-section',
    '.word-network-section',
    '.contact-section',
    '.work-card'
  ].join(',');

  /** Match about.html mask-reveal on experience cells (inner .word-underline). */
  var ANIM_SUPPRESS_EXPERIENCE_MASK =
    ', .experience-row > .company-name .word-underline, .experience-row .position-title .word-underline, .experience-row .position-date .word-underline';

  /* ---------- Helpers ---------- */
  /** Pathname segment from href (e.g. calendar.html). */
  function resolveFile(href) {
    try {
      var u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) return null;
      return u.pathname.split('/').pop() || 'index.html';
    } catch (e) {
      return null;
    }
  }

  /**
   * True if href points at the current page. Handles / vs /index.html,
   * with or without .html, and trailing slash quirks so we do not re-run
   * the transition (or change the header) when the user clicks the
   * already-active nav item.
   */
  function isSamePageAsCurrent(href) {
    try {
      var a = new URL(href, window.location.href);
      if (a.origin !== window.location.origin) return false;
      var pA = a.pathname;
      var pB = window.location.pathname;
      function norm(p) {
        if (!p || p === '/') return 'index';
        p = p.replace(/\/$/, '');
        var seg = p.split('/').pop() || 'index';
        if (seg === 'index' || seg === 'index.html') return 'index';
        if (seg === 'index.html' || seg.endsWith('.html')) {
          return seg.replace(/\.html$/, '') || 'index';
        }
        return seg;
      }
      return norm(pA) === norm(pB);
    } catch (e) {
      return false;
    }
  }

  function isTransitionHref(href) {
    var file = resolveFile(href);
    if (file === null) return false;
    file = normalizeFile(file);
    if (!file.endsWith('.html')) return false;
    return EXCLUDED_TRANSITION_FILES.indexOf(file) === -1;
  }

  function normalizeFile(file) {
    if (!file || file === '') return 'index.html';
    return file;
  }

  function hasSize(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ---------- Destination header state ---------- */
  function buildClockElement() {
    var now = new Date();
    function fmt(tz) {
      return now.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    var clock = document.createElement('div');
    clock.className = 'clock';
    clock.innerHTML =
      '<div class="clock-time">LA ' + fmt('America/Los_Angeles') + '</div>' +
      '<div class="clock-separator">//</div>' +
      '<div class="clock-time">HK ' + fmt('Asia/Hong_Kong') + '</div>';
    return clock;
  }

  function buildPageTitleElement(text) {
    var pt = document.createElement('div');
    pt.className = 'page-title';
    pt.textContent = text;
    return pt;
  }

  function buildPlusElement(text) {
    var p = document.createElement('div');
    p.className = 'plus';
    p.textContent = text;
    return p;
  }

  function projectTitleFromFile(file) {
    file = normalizeFile(file);
    // Keep in sync with `header.html`'s updatePageTitle() mappings.
    // (The transition needs a destination title BEFORE navigation.)
    if (file === 'scaling-reviews.html') return 'Scaling Reviews';
    if (file === 'casa-magia.html') return 'Casa Magia';
    if (file === 'usc-international-student-assembly.html') return 'USC ISA';
    if (file === 'aphelion-smart-fridge-assistant.html') return 'Aphelion';
    if (file === 'space-saving-furniture.html') return 'Space-Saving Furniture';
    if (file === 'vtm-13.html') return 'VTM-13';
    if (file === 'stackt.html') return 'STACKT';
    if (file === 'sync.html') return 'Sync.';
    if (file === 'mythical-creatures-forbidden-city.html') return 'Mythical Creatures';
    if (file === 'lily.html') return 'Lily';
    if (file === 'the-bottega-group.html') return 'The Bottega Group';
    if (file === 'my-matcha-hk.html') return 'My Matcha HK';
    if (file === 'syllabus-to-planner.html') return 'SyllabusToPlanner';
    if (file === 'ignorance.html') return 'Ignorance';
    if (file === 'the-great-tree.html') return 'The Great Tree';
    if (file === 'red-cxbe.html') return 'RED.CXBE';
    if (file === 'make-total-destroy.html') return 'MAKE TOTAL DESTROY';
    if (file === 'the-citys-reflection.html') return "The City's Reflection";
    if (file === 'control-art.html') return 'Control (Art)';
    if (file === 'untitled.html') return 'Untitled';
    if (file === 'the-ritual.html') return 'The Ritual';
    if (file === 'mid-summer-days-dream.html') return "Mid Summer Day's Dream";
    if (file === 'through-my-eyes.html') return 'Through My Eyes';
    if (file === 'control-mural.html') return 'Control (Mural)';
    if (file === 'revink-fall-2023.html') return 'REVINK Fall 2023';
    if (file === 'revink-spring-2024.html') return 'REVINK Spring 2024';
    if (file === 'motion-graphic-animation.html') return 'Motion Graphic Animation';
    if (file === 'video-editing.html') return 'Video Editing';
    if (file === 'goodfornothing.html') return 'GOODFORNOTHING';
    if (file === 'demigod.html') return 'DEMIGOD';
    if (file === 'spire.html') return 'SPIRE';
    if (file === 'spire-promotional-graphics.html') return 'SPIRE Promotional Graphics';
    if (file === 'revink.html') return 'REVINK';
    if (file === 'music-production.html') return 'Music Production';
    if (file === 'tm-studios.html') return 'TM Studios';
    if (file === 'tlocal.html') return 'TLOCAL';
    if (file === 'the-lies-end-in-summer.html') return 'The Lies End In Summer';
    return null;
  }

  function getDestHeaderState(file) {
    file = normalizeFile(file);
    if (file === 'index.html') {
      return {
        subtitleText: '+ Design',
        middle: buildClockElement(),
        activeNav: 'Work'
      };
    }
    if (file === 'about.html') {
      return {
        subtitleText: '',
        middle: null,
        activeNav: 'About'
      };
    }
    if (file === 'calendar.html') {
      // Single source for calendar label until 2026 content exists; then switch here + header.
      return {
        subtitleText: '',
        middle: buildPageTitleElement('My 2025'),
        activeNav: 'Calendar'
      };
    }
    // Project pages: clear the Work header bits and animate the project title in.
    var projectTitle = projectTitleFromFile(file);
    return {
      subtitleText: '',
      middle: projectTitle ? buildPageTitleElement(projectTitle) : null,
      activeNav: 'Work'
    };
  }

  /* ---------- Suppress on-arrival intro animations ---------- */
  function suppressIntroAnimations(doc, win) {
    if (!doc || doc.getElementById('pt-suppress-style')) return;

    var style = doc.createElement('style');
    style.id = 'pt-suppress-style';
    style.textContent =
      ANIM_SELECTORS + ANIM_SUPPRESS_EXPERIENCE_MASK + ' { transition: none !important; }';
    (doc.head || doc.documentElement).appendChild(style);

    var apply = function () {
      var vh = (win || doc.defaultView || window).innerHeight;
      var nodes = doc.querySelectorAll(ANIM_SELECTORS);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var rect = el.getBoundingClientRect();
        if (rect.top < vh) el.classList.add('animate-in');
      }
      var raf = (win && win.requestAnimationFrame) || requestAnimationFrame;
      raf(function () {
        raf(function () {
          var s = doc.getElementById('pt-suppress-style');
          if (s && s.parentNode) s.parentNode.removeChild(s);
        });
      });
    };

    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', apply, { once: true });
    } else {
      apply();
    }
  }

  /* ---------- Measurement (inside <header> so styles cascade) ---------- */
  // Cloning into `body` makes font-size/line-height differ from the real
  // header (exclusion / context). Measure inside the live header in a
  // zero-size, hidden box so width/height match the real thing.
  function measureInHeader(headerEl, el) {
    if (!el) return { width: 0, height: 0 };
    var box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    // W×0 overflow clips layout; use off-screen + max-content so the clone
    // gets the same unwrapped size as the live header.
    box.style.cssText =
      'position:fixed;left:-10000px;top:0;width:max-content;max-width:none;height:auto;' +
      'visibility:hidden;pointer-events:none;z-index:-1;overflow:visible;';
    var clone = el.cloneNode(true);
    clone.removeAttribute('id');
    // Do not assign cssText — it would wipe inline font/layout from
    // applyHeaderSlotStylesFromRef on the source.
    applyHeaderSlotStylesFromRef(clone, el, headerEl);
    clone.style.position = 'static';
    clone.style.left = 'auto';
    clone.style.top = 'auto';
    clone.style.right = 'auto';
    clone.style.bottom = 'auto';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    // Make sure page-specific hide rules (e.g. About) don't collapse the clone
    // to display:none and give us 0×0 sizing.
    if (clone.classList && clone.classList.contains('page-title')) {
      clone.style.display = 'block';
      clone.style.visibility = 'visible';
    }
    box.appendChild(clone);
    headerEl.appendChild(box);
    var r = clone.getBoundingClientRect();
    var w = r.width, h = r.height;
    headerEl.removeChild(box);
    return { width: w, height: h };
  }

  /**
   * Copy typography and flex layout from a real header node onto a clone
   * so the overlay looks identical. When the live node is not on this page
   * (e.g. building a clock for index while on about), `ref` can be
   * header nav (same 21.6px as clock) or any fallback.
   */
  function applyHeaderSlotStylesFromRef(clone, refEl, headerEl) {
    if (!clone) return;
    var ref = refEl;
    if (ref && !document.body.contains(ref)) ref = null;
    if (clone.classList.contains('page-title') && (!ref || !ref.classList || !ref.classList.contains('page-title'))) {
      ref = headerEl.querySelector('.page-title') || ref;
    }
    // About page hides .page-title; styling from that node can collapse the clone
    // so the middle-slot slide never reads as motion (same path as clock needs a live ref).
    if (clone.classList.contains('page-title') && ref && ref.classList && ref.classList.contains('page-title')) {
      try {
        if (window.getComputedStyle(ref).display === 'none') {
          ref = headerEl.querySelector('nav a') || ref;
        }
      } catch (e) { /* ignore */ }
    }
    if (clone.classList.contains('clock') && (!ref || !ref.classList || !ref.classList.contains('clock'))) {
      ref = headerEl.querySelector('.clock') || headerEl.querySelector('nav a') || ref;
    }
    if (clone.classList.contains('plus') && (!ref || !ref.classList || !ref.classList.contains('plus'))) {
      ref = headerEl.querySelector('.plus') || ref;
    }
    if (clone.classList.contains('clock')) {
      var ch0 = clone.querySelectorAll('.clock-time, .clock-separator');
      for (var k = 0; k < ch0.length; k++) {
        ch0[k].style.whiteSpace = 'nowrap';
        ch0[k].style.flexShrink = '0';
      }
      return;
    }
    if (!ref) ref = headerEl.querySelector('nav a');
    if (!ref) return;
    var s = window.getComputedStyle(ref);
    if (clone.classList.contains('plus')) {
      clone.style.fontSize = s.fontSize;
      clone.style.fontFamily = s.fontFamily;
      clone.style.fontWeight = s.fontWeight;
      clone.style.letterSpacing = s.letterSpacing;
      clone.style.color = s.color;
      clone.style.lineHeight = s.lineHeight;
      clone.style.whiteSpace = 'nowrap';
      clone.style.minWidth = 'max-content';
      clone.style.width = 'max-content';
    } else if (clone.classList.contains('page-title')) {
      s = window.getComputedStyle(ref);
      clone.style.fontSize = s.fontSize;
      clone.style.fontFamily = s.fontFamily;
      clone.style.fontWeight = s.fontWeight;
      clone.style.letterSpacing = s.letterSpacing;
      clone.style.color = s.color;
      clone.style.lineHeight = s.lineHeight;
      clone.style.whiteSpace = 'nowrap';
      clone.style.minWidth = 'max-content';
      clone.style.width = 'max-content';
      // .page-title is centered; when ref is nav (About page) s.textAlign is not.
      clone.style.textAlign = 'center';
      // About has `body.about-page .page-title { display: none }`, which also
      // targets our clone and would hide the whole animation.
      clone.style.display = 'block';
      clone.style.opacity = '0.9';
      clone.style.visibility = 'visible';
    }
  }

  /* ---------- Mask-reveal animation on an overlay ---------- */
  // Does NOT touch the original DOM layout. Creates a fixed-position clipped
  // overlay at (left, top) sized (width, height), stacks old + new clones
  // inside it, and animates them vertically as a unit.
  function runSlotAnimation(headerEl, opts) {
    var hJustifyStart = opts.hJustify === 'start' || opts.hJustify === 'left';
    // Center slot: flex center (wide mask). Plus slot: flex-start + horizontal
    // padding so text stays the same x as the live .plus (not centered in max width).
    var hPad = hJustifyStart
      ? ('padding:0 ' + SLOT_PAD_X + 'px;')
      : 'padding:0;';
    var jC = hJustifyStart ? 'flex-start' : 'center';

    // % translateY is based on the layer's *own* height. Abspos flex layers can
    // get a 0% base in some cases, so the incoming row never moves (e.g. about
    // → calendar: no visible old middle, only the new "My 2025"). Use px = mask.
    var slideH = Math.max(1, Math.round(Number(opts.height) || 0));

    var overlay = document.createElement('div');
    overlay.className = 'pt-slot-overlay';
    overlay.style.cssText =
      'position:fixed;' +
      'left:' + opts.left + 'px;' +
      'top:' + opts.top + 'px;' +
      'width:' + opts.width + 'px;' +
      'height:' + opts.height + 'px;' +
      'overflow:hidden;' +
      'pointer-events:none;';

    // Layer layout only. Animation is driven by the Web Animations API below
    // so the browser cannot coalesce start/end frames (which was causing
    // "My 2025" to pop in on About → Calendar when this was the only slot
    // animating).
    var layerBase =
      'position:absolute;' +
      'inset:0;' +
      'box-sizing:border-box;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:' + jC + ';' +
      hPad +
      'min-width:0;min-height:0;' +
      'will-change:transform;';

    var oldLayer = document.createElement('div');
    oldLayer.style.cssText = layerBase;

    var newLayer = document.createElement('div');
    newLayer.style.cssText = layerBase;

    function mount(layer, source, refForStyle) {
      if (!source) return;
      var clone = source.cloneNode(true);
      clone.removeAttribute('id');
      // Neutralize any positioning the class may apply so the flex layer can
      // center it cleanly.
      clone.style.position = 'static';
      clone.style.left = 'auto';
      clone.style.top = 'auto';
      clone.style.right = 'auto';
      clone.style.bottom = 'auto';
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.flex = '0 0 auto';
      clone.style.boxSizing = 'border-box';
      if (source.classList && (source.classList.contains('plus') || source.classList.contains('page-title') || source.classList.contains('clock'))) {
        clone.style.flexShrink = '0';
      }
      applyHeaderSlotStylesFromRef(clone, refForStyle != null ? refForStyle : source, headerEl);
      layer.appendChild(clone);
    }

    mount(oldLayer, opts.oldEl, opts.oldRef != null ? opts.oldRef : opts.oldEl);
    mount(newLayer, opts.newEl, opts.newRef != null ? opts.newRef : opts.newEl);

    // Hide the original in-place so the mask is the only visible copy.
    // visibility:hidden preserves the layout so the header doesn't shift.
    if (opts.oldEl && opts.hideOriginal !== false) {
      opts.oldEl.style.visibility = 'hidden';
    }

    overlay.appendChild(oldLayer);
    overlay.appendChild(newLayer);
    headerEl.appendChild(overlay);

    var animOpts = {
      duration: HEADER_MS,
      easing: HEADER_EASE,
      fill: 'forwards'
    };

    if (typeof oldLayer.animate === 'function') {
      oldLayer.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: 'translate3d(0, ' + -slideH + 'px, 0)' }
        ],
        animOpts
      );
      newLayer.animate(
        [
          { transform: 'translate3d(0, ' + slideH + 'px, 0)' },
          { transform: 'translate3d(0, 0, 0)' }
        ],
        animOpts
      );
    } else {
      // Fallback: CSS transition with a full reflow between start + end states.
      oldLayer.style.transform = 'translate3d(0,0,0)';
      newLayer.style.transform = 'translate3d(0,' + slideH + 'px,0)';
      void overlay.offsetHeight;
      var trans = 'transform ' + HEADER_MS + 'ms ' + HEADER_EASE;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          oldLayer.style.transition = trans;
          newLayer.style.transition = trans;
          oldLayer.style.transform = 'translate3d(0,' + -slideH + 'px,0)';
          newLayer.style.transform = 'translate3d(0,0,0)';
        });
      });
    }
  }

  /* ---------- Header text mask-reveal orchestration ---------- */
  function animateHeaderSwap(destFile) {
    var state = getDestHeaderState(destFile);
    if (!state) return;

    var headerEl = document.querySelector('header');
    if (!headerEl) return;

    var brand = headerEl.querySelector('.brand');
    var home = brand && brand.querySelector('.home');
    var inner = headerEl.querySelector('.header-inner');
    if (!brand || !home || !inner) return;

    var homeRect = home.getBoundingClientRect();
    var innerRect = inner.getBoundingClientRect();

    /* ========== SUBTITLE SLOT (".plus") ========== */
    var parentPlus = brand.querySelector('.plus');
    if (!hasSize(parentPlus)) parentPlus = null;

    var newPlus = state.subtitleText
      ? buildPlusElement(state.subtitleText)
      : null;

    if (parentPlus || newPlus) {
      if (newPlus) applyHeaderSlotStylesFromRef(newPlus, newPlus, headerEl);
      var pOldSize = parentPlus
        ? parentPlus.getBoundingClientRect()
        : { width: 0, height: 0 };
      var pNewSize = newPlus ? measureInHeader(headerEl, newPlus) : { width: 0, height: 0 };

      var sW = Math.ceil(Math.max(pOldSize.width, pNewSize.width)) + SLOT_PAD_X * 2;
      var sH = Math.ceil(Math.max(pOldSize.height, pNewSize.height, homeRect.height)) + SLOT_PAD_Y * 2;

      // Same x as live ".plus" (not centered in max(old,new) width — that shifts text).
      var plusTextLeft = parentPlus
        ? parentPlus.getBoundingClientRect().left
        : homeRect.right + BRAND_HOME_PLUS_GAP;
      var sLeft = plusTextLeft - SLOT_PAD_X;
      var sTop = homeRect.top + homeRect.height / 2 - sH / 2;

      runSlotAnimation(headerEl, {
        left: sLeft,
        top: sTop,
        width: sW,
        height: sH,
        hJustify: 'start',
        oldEl: parentPlus,
        newEl: newPlus,
        oldRef: parentPlus,
        newRef: newPlus
      });
    }

    /* ========== MIDDLE SLOT (".clock" or ".page-title") ========== */
    var parentMiddle = headerEl.querySelector('.clock, .page-title');
    if (!hasSize(parentMiddle)) parentMiddle = null;

    var newMiddle = state.middle;

    if (parentMiddle || newMiddle) {
      if (newMiddle) applyHeaderSlotStylesFromRef(newMiddle, newMiddle, headerEl);
      var mOldSize = parentMiddle
        ? parentMiddle.getBoundingClientRect()
        : { width: 0, height: 0 };
      var mNewSize = newMiddle
        ? measureInHeader(headerEl, newMiddle)
        : { width: 0, height: 0 };

      // Never give the center slot a narrow box (flex on other pages can
      // make measured width look tiny until styles land on the real header).
      var mW = Math.ceil(Math.max(mOldSize.width, mNewSize.width, innerRect.width * 0.3)) + SLOT_PAD_X * 2;
      mW = Math.min(mW, Math.max(innerRect.width - 24, 0));
      var mH = Math.ceil(Math.max(mOldSize.height, mNewSize.height, homeRect.height)) + SLOT_PAD_Y * 2;

      // Horizontally centered on the viewport (matches .page-title's natural
      // position and the clock's flex space-between slot).
      var centerX = innerRect.left + innerRect.width / 2;
      var mLeft = centerX - mW / 2;
      var mTop = homeRect.top + homeRect.height / 2 - mH / 2;

      runSlotAnimation(headerEl, {
        left: mLeft,
        top: mTop,
        width: mW,
        height: mH,
        oldEl: parentMiddle,
        newEl: newMiddle,
        oldRef: parentMiddle,
        newRef: newMiddle
      });
    }

    /* ========== ACTIVE NAV ========== */
    var targetSection = state.activeNav;
    var navLinks = headerEl.querySelectorAll('nav a');
    for (var n = 0; n < navLinks.length; n++) {
      var l = navLinks[n];
      l.classList.toggle('current', l.getAttribute('data-section') === targetSection);
    }
  }

  /* ---------- Styles ---------- */
  function injectStyles() {
    if (document.getElementById('pt-styles')) return;
    var style = document.createElement('style');
    style.id = 'pt-styles';
    style.textContent =
      /* Outgoing: body content fades out. Header is untouched. */
      'body.pt-exiting > main,' +
      'body.pt-exiting > .caption {' +
      '  transition: opacity ' + FADE_OUT_MS + 'ms ' + FADE_EASE + ';' +
      '  opacity: 0;' +
      '}' +
      'body.pt-exiting { pointer-events: none; }' +
      /* Incoming: body content starts hidden, fades in. */
      'html.pt-arriving body > main,' +
      'html.pt-arriving body > .caption {' +
      '  opacity: 0;' +
      '}' +
      'html.pt-arriving.pt-show body > main,' +
      'html.pt-arriving.pt-show body > .caption {' +
      '  transition: opacity ' + FADE_IN_MS + 'ms ' + FADE_EASE + ';' +
      '  opacity: 1;' +
      '}';
    (document.head || document.documentElement).appendChild(style);
  }

  /* ---------- Incoming: arrived via a transition ---------- */
  function handleIncoming() {
    var arriving = false;
    try {
      if (sessionStorage.getItem(NAV_FLAG) === '1') {
        sessionStorage.removeItem(NAV_FLAG);
        arriving = true;
      }
    } catch (e) { /* ignore */ }

    if (!arriving) return;

    window.__skipLoadingOverlay = true;
    document.documentElement.classList.add('pt-arriving');
    suppressIntroAnimations(document, window);

    function fadeIn() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.documentElement.classList.add('pt-show');
        });
      });
      setTimeout(function () {
        document.documentElement.classList.remove('pt-arriving', 'pt-show');
      }, FADE_IN_MS + 120);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fadeIn, { once: true });
    } else {
      fadeIn();
    }
  }

  /* ---------- Outgoing transition ---------- */
  function runOutgoing(href) {
    try { sessionStorage.setItem(NAV_FLAG, '1'); } catch (e) { /* ignore */ }

    // Mask-reveal the header to the destination state.
    animateHeaderSwap(resolveFile(href));

    // Fade out the body content.
    document.body.classList.add('pt-exiting');

    var waitMs = Math.max(FADE_OUT_MS, HEADER_MS);
    setTimeout(function () {
      window.location.href = href;
    }, waitMs);
  }

  /* ---------- Click interception ---------- */
  function onClick(e) {
    if (e.defaultPrevented) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest && e.target.closest('a');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') return;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    if (!isTransitionHref(a.href)) return;

    if (isSamePageAsCurrent(a.href) || a.classList.contains('current')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    runOutgoing(a.href);
  }

  /* ---------- Boot ---------- */
  injectStyles();
  handleIncoming();

  function bindClicks() {
    document.addEventListener('click', onClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindClicks, { once: true });
  } else {
    bindClicks();
  }
})();
