/**
 * Convert legacy project pages in projects/*.html to the new case-study layout.
 *
 * Source assumptions (from existing files):
 *   - Top-level structure: head (links projectstyle.css), <main class="page" id="pageBody">,
 *     hero block (.hero-image-container with the first <img>/<video>), .project-container
 *     (with .project-header h1.project-title + p.project-description, .project-details),
 *     followed by .text-section / .grid-section / .two-horizontal-images-section /
 *     .two-vertical-images-section / .instagram-grid-section / .hero-image-container /
 *     .wide-image-container blocks.
 *   - Header script in <body> uses fetch('../header.html').then(...) and replaces the
 *     #pageTitle text via data.replace('id="pageTitle">Work</div>', 'id="pageTitle">XYZ</div>').
 *
 * Output: re-writes the file with .page.case-study-page markup, sticky metadata sidebar,
 *         tag chips, descriptors, picture/webp wrapping, section nav, back-to-top, and
 *         the shared case-study-page.js include.
 *
 * Skips:    lily.html, scaling-reviews.html (already migrated). Run with --dry to preview.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const PROJECTS = path.join(ROOT, 'projects');
const SKIP = new Set(['lily.html']);
const dry = process.argv.includes('--dry');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const onlyFiles = onlyArg ? onlyArg.split('=')[1].split(',') : null;

// Each rule contributes a tag if any of its regex patterns matches against
// (role + tools + optional file/page hints). Patterns use \b for word
// boundaries to avoid matches like "photo" inside "Photoshop" leaking through.
const TAG_RULES = [
  { tag: 'Product', patterns: [/\bproduct designer\b/, /\bproduct design\b/, /\bui\/ux designer\b/] },
  { tag: 'UI/UX', patterns: [/\bui\/ux\b/, /\bweb designer\b/, /\bui designer\b/] },
  { tag: 'Web', patterns: [/\bweb designer\b/, /\bdesign engineer\b/, /\bvs code\b/, /\bframer\b/, /\bnext\.?js\b/, /\breact\b/] },
  { tag: 'Motion', patterns: [/\bmotion\b/, /\bafter effects\b/, /\bpremiere\b/, /\banimation\b/, /\banimator\b/] },
  { tag: 'Video', patterns: [/\bvideo editor\b/, /\bvideo production\b/, /\bvideographer\b/] },
  { tag: '3D', patterns: [/\brhino\b/, /\bcinema 4d\b/, /\b3d printing\b/, /\bblender\b/] },
  { tag: 'Branding', patterns: [/\bgraphic designer\b/, /\bvisual designer\b/, /\bbrand designer\b/, /\bbranding\b/, /\bcreative director\b/] },
  { tag: 'Print', patterns: [/\bscreen printing\b/, /\bdirect to film\b/, /\bembroidery\b/, /\brisograph\b/] },
  { tag: 'Apparel', patterns: [/\bfashion\b/, /\bstreetwear\b/, /\bclothing\b/, /\bscreen printing\b/, /\bembroidery\b/] },
  { tag: 'Mural', patterns: [/\bmural\b/] },
  { tag: 'Music', patterns: [/\bmusician\b/, /\bsongwriter\b/, /\blogic pro\b/, /\bmusic producer\b/, /\bproducer\b/] },
  { tag: 'Photography', patterns: [/\bphotographer\b/, /\bphotography\b/] },
  { tag: 'Illustration', patterns: [/\billustrator\b/, /\billustration\b/, /\bink pen\b/, /\bcanvas paper\b/, /\bprocreate\b/] },
  { tag: 'Art', patterns: [/\bartist\b/] },
];

const TAG_PRIORITY = [
  'Product', 'UI/UX', 'Web', 'Motion', 'Video', 'Branding', 'Apparel',
  'Mural', 'Print', '3D', 'Illustration', 'Art', 'Music', 'Photography'
];

function pickTags(role, tools, extraHay) {
  const haystack = [...role, ...tools, extraHay || ''].map((s) => s.toLowerCase()).join(' | ');
  const set = new Set();
  for (const rule of TAG_RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) set.add(rule.tag);
  }

  // Branding implies Visual; suppress Art if Branding/Product/UI present.
  if (set.has('Branding') || set.has('Product') || set.has('UI/UX')) set.delete('Art');
  // Illustration vs Art: keep both only if Illustration is more specific.
  if (set.has('Branding') && set.has('Illustration')) set.delete('Illustration');
  // Apparel implies Print; if both, keep Apparel only when role/tools indicate apparel.
  if (set.has('Apparel') && !/\b(fashion|streetwear|clothing)\b/.test(haystack)) set.delete('Apparel');
  // Drop Music unless something musical is in role/tools.
  if (set.has('Music') && !/\b(musician|songwriter|logic pro|music)\b/.test(haystack)) set.delete('Music');

  const ordered = TAG_PRIORITY.filter((t) => set.has(t)).slice(0, 4);
  if (!ordered.length) ordered.push('Visual');
  return ordered;
}

function titleCase(s) {
  if (!s) return s;
  const minor = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'is']);
  return s
    .split(/(\s+)/)
    .map((token, i, arr) => {
      if (/^\s+$/.test(token)) return token;
      // Preserve all-caps acronyms.
      if (/^[A-Z0-9]+$/.test(token) && token.length > 1) return token;
      const lower = token.toLowerCase();
      const first = i === 0 || arr[i - 2] === undefined;
      if (!first && minor.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'section';
}

function toPicture(src, alt, extraImgClass) {
  // Resolve path relative to project root to find sibling .webp on disk.
  const cleanedSrc = src.startsWith('../') ? src.slice(3) : src;
  // For a path like ../projects/photos_x/foo.png we go from projects/<page>.html to ../projects/foo.png ...
  // Simpler: actual disk path is path.join(ROOT, cleanedSrc.replace(/^projects\//, 'projects/'))
  // Both forms map cleanly; just join from ROOT.
  const ext = path.extname(src);
  if (!/\.(png|jpe?g)$/i.test(ext)) {
    const altAttr = alt != null ? ` alt="${escapeAttr(alt)}"` : '';
    const cls = extraImgClass ? ` class="${extraImgClass}"` : '';
    return `<img src="${src}"${altAttr}${cls}>`;
  }
  // Build absolute disk path. Both ../projects/... and projects/... should resolve.
  let diskPath;
  if (src.startsWith('../')) {
    diskPath = path.join(PROJECTS, src.replace(/^\.\.\//, '').replace(/^projects\//, ''));
  } else if (src.startsWith('projects/')) {
    diskPath = path.join(ROOT, src);
  } else {
    diskPath = path.join(PROJECTS, src);
  }
  const webpDisk = diskPath.replace(/\.(png|jpe?g)$/i, '.webp');
  const altAttr = alt != null ? ` alt="${escapeAttr(alt)}"` : '';
  const cls = extraImgClass ? ` class="${extraImgClass}"` : '';
  if (fs.existsSync(webpDisk)) {
    const webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp');
    return `<picture><source type="image/webp" srcset="${webpSrc}"><img src="${src}"${altAttr}${cls}></picture>`;
  }
  return `<img src="${src}"${altAttr}${cls}>`;
}

function toVideo(src, attrs, extraClass) {
  // For .mov, attempt to add an .m4v source first if a sibling exists on disk.
  const ext = path.extname(src);
  let diskPath;
  if (src.startsWith('../')) {
    diskPath = path.join(PROJECTS, src.replace(/^\.\.\//, '').replace(/^projects\//, ''));
  } else if (src.startsWith('projects/')) {
    diskPath = path.join(ROOT, src);
  } else {
    diskPath = path.join(PROJECTS, src);
  }
  const m4vDisk = diskPath.replace(/\.mov$/i, '.m4v');
  const cls = extraClass ? ` class="${extraClass}"` : '';
  const baseAttrs = attrs && attrs.trim() ? ` ${attrs.trim()}` : '';
  if (/\.mov$/i.test(ext) && fs.existsSync(m4vDisk)) {
    const m4vSrc = src.replace(/\.mov$/i, '.m4v');
    return `<video${baseAttrs}${cls}>
                <source src="${m4vSrc}" type="video/mp4">
                <source src="${src}" type="video/quicktime">
              </video>`;
  }
  return `<video src="${src}"${baseAttrs}${cls}></video>`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function getInnerHtmlPreservingLinks($, el) {
  return $.html(el.children).trim();
}

function readDetailColumn($, container, label) {
  const col = $(container)
    .find('.detail-column')
    .filter((_, c) => $(c).find('.detail-title').text().trim().toLowerCase() === label.toLowerCase())
    .first();
  if (!col.length) return [];
  return col
    .find('.detail-content p')
    .map((_, p) => $(p).text().trim())
    .get()
    .filter(Boolean);
}

function nodeIsMediaBlock($, node) {
  const cls = node.attribs && node.attribs.class ? node.attribs.class : '';
  return /\b(hero-image-container|wide-image-container|grid-section|two-horizontal-images-section|two-vertical-images-section|instagram-grid-section)\b/.test(cls);
}

function nodeIsTextSection($, node) {
  const cls = node.attribs && node.attribs.class ? node.attribs.class : '';
  return /\btext-section\b/.test(cls);
}

function getMediaItems($, block) {
  const items = [];
  $(block)
    .find('img,video')
    .each((_, m) => {
      const parentLink = $(m).closest('a');
      const link = parentLink.length && $.contains(block, parentLink[0])
        ? {
            href: parentLink.attr('href') || '',
            target: parentLink.attr('target') || '',
            rel: parentLink.attr('rel') || '',
          }
        : null;
      if (m.tagName === 'img') {
        items.push({
          type: 'img',
          src: $(m).attr('src') || '',
          alt: $(m).attr('alt') || '',
          cls: $(m).attr('class') || '',
          link,
        });
      } else {
        // Capture <source> children if present.
        const sources = $(m)
          .find('source')
          .map((_, s) => ({ src: $(s).attr('src') || '', type: $(s).attr('type') || '' }))
          .get();
        const attrs = [];
        ['autoplay', 'loop', 'muted', 'playsinline', 'controls'].forEach((a) => {
          if ($(m).attr(a) !== undefined) attrs.push(a);
        });
        items.push({
          type: 'video',
          src: $(m).attr('src') || (sources[0] && sources[0].src) || '',
          attrs: attrs.join(' ') || 'autoplay loop muted playsinline',
          cls: $(m).attr('class') || '',
          sources,
          link,
        });
      }
    });
  return items;
}

function renderMediaBlock(block) {
  const kindMatch = (block.cls || '').match(/(hero-image-container|wide-image-container|grid-section|two-horizontal-images-section|two-vertical-images-section|instagram-grid-section)/);
  const kind = kindMatch ? kindMatch[1] : 'wide-image-container';

  const renderItem = (item, ctx) => {
    const wrapLink = (html) => {
      if (!item.link || !item.link.href) return html;
      const target = item.link.target ? ` target="${escapeAttr(item.link.target)}"` : '';
      const rel = item.link.rel ? ` rel="${escapeAttr(item.link.rel)}"` : '';
      return `<a href="${escapeAttr(item.link.href)}"${target}${rel}>${html}</a>`;
    };
    if (item.type === 'img') {
      const cls = ctx === 'hero' ? 'hero-image' : '';
      return wrapLink(toPicture(item.src, item.alt, cls));
    }
    // video
    const cls = ctx === 'hero' ? 'hero-image' : '';
    if (item.sources && item.sources.length) {
      // Re-emit with original sources, possibly preferring m4v
      const sourceTags = item.sources
        .map((s) => `<source src="${s.src}" type="${s.type}">`)
        .join('\n                ');
      return wrapLink(`<video ${item.attrs}${cls ? ` class="${cls}"` : ''}>
                ${sourceTags}
              </video>`);
    }
    return wrapLink(toVideo(item.src, item.attrs, cls));
  };

  if (kind === 'hero-image-container') {
    return `        <div class="hero-image-container">
          ${block.items.map((i) => renderItem(i, 'hero')).join('\n          ')}
        </div>`;
  }
  if (kind === 'wide-image-container') {
    return `        <div class="wide-image-container">
          ${block.items.map((i) => renderItem(i, 'hero')).join('\n          ')}
        </div>`;
  }
  if (kind === 'grid-section') {
    return `        <div class="grid-section">
          <div class="grid-content">
            ${block.items.map((i) => renderItem(i)).join('\n            ')}
          </div>
        </div>`;
  }
  if (kind === 'two-horizontal-images-section') {
    return `        <div class="two-horizontal-images-section">
          <div class="two-horizontal-images-content">
            ${block.items.map((i) => renderItem(i)).join('\n            ')}
          </div>
        </div>`;
  }
  if (kind === 'two-vertical-images-section') {
    return `        <div class="two-vertical-images-section">
          <div class="two-vertical-images-content">
            ${block.items.map((i) => renderItem(i)).join('\n            ')}
          </div>
        </div>`;
  }
  if (kind === 'instagram-grid-section') {
    return `        <div class="instagram-grid-section">
          <div class="instagram-grid-content">
            ${block.items.map((i) => renderItem(i)).join('\n            ')}
          </div>
        </div>`;
  }
  return '';
}

function defaultDescriptor(idx, total, hasTitle) {
  if (total === 1) return 'Overview';
  if (idx === 0) return 'Overview';
  if (idx === total - 1) return 'Reflection';
  return null;
}

function renderTextSection(section) {
  const id = section.id;
  const descriptor = section.descriptor;
  const titleHtml = section.title ? `<h2 class="text-section-title">${section.title}</h2>` : '';
  const desc = descriptor ? `<p class="case-study-section-descriptor">${descriptor}</p>` : '';
  return `        <div class="text-section" id="${id}">
          <div class="text-section-content">
            ${[desc, titleHtml].filter(Boolean).join('\n            ')}
            ${section.contentHtml}
          </div>
        </div>`;
}

function buildPageHtml({
  pageTitle,
  headerReplacement,
  projectTitle,
  description,
  tags,
  role,
  team,
  scope,
  tools,
  hero,
  body,
  navItems,
  preserveCursorScript,
}) {
  const taglistHtml = tags.length
    ? `\n            <ul class="case-study-taglist" aria-label="Project scope">
              ${tags.map((t) => `<li><span class="case-study-tag">${t}</span></li>`).join('\n              ')}
            </ul>`
    : '';
  const detailsHtml = ['Role', 'Team', 'Scope', 'Tools']
    .map((label, i) => {
      const data = [role, team, scope, tools][i];
      if (!data || !data.length) return null;
      return `            <div class="detail-column">
              <div class="detail-title">${label}</div>
              <div class="detail-content">
                ${data.map((d) => `<p>${d}</p>`).join('\n                ')}
              </div>
            </div>`;
    })
    .filter(Boolean)
    .join('\n');

  const navHtml = navItems.length
    ? `      <aside class="case-study-side" aria-label="On this page">
        <nav class="case-study-section-nav" aria-label="Section navigation">
          <ul class="case-study-section-nav__list">
            ${navItems.map((it) => `<li><a href="#${it.id}">${it.label}</a></li>`).join('\n            ')}
          </ul>
        </nav>
      </aside>`
    : '';

  const cursorScript = preserveCursorScript ? `\n  <script src="../cursor.js"></script>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="../page-transition.js"></script>
  <link rel="icon" type="image/png" href="../1_photos/logos/icontools/faviconnew.png">
  <link rel="stylesheet" href="../projectstyle.css">
  <title>${pageTitle}</title>
</head>
<body>
  <!-- Include header -->
  <div id="header-container"></div>

  <main class="page case-study-page" id="pageBody">
    <section class="case-study-intro" aria-label="Project overview">
      <div class="case-study-intro__layout">
        <div class="case-study-intro__main">
          <div class="case-study-intro__media">
            ${hero}
          </div>
          <div class="case-study-intro__header" role="group" aria-labelledby="case-study-title">
            <h1 class="project-title" id="case-study-title">${projectTitle}</h1>${taglistHtml}
            ${description ? `<p class="project-description">${description}</p>` : ''}
          </div>
        </div>
        <div class="case-study-intro__side">
          <div class="project-details case-study-details">
${detailsHtml}
          </div>
        </div>
      </div>
      <hr class="case-study-rule" />
    </section>

    <div class="case-study-body">
      <div class="case-study-main">
${body}

        <p class="case-study-back-to-top">
          <a href="#pageBody">↑ Back to top</a>
        </p>
      </div>

${navHtml}
    </div>
  </main>

  <script>
    fetch('../header.html')
      .then(response => response.text())
      .then(data => {
        const modifiedData = data.replace('id="pageTitle">Work</div>', 'id="pageTitle">${headerReplacement}</div>');
        document.getElementById('header-container').innerHTML = modifiedData;
        const sectionLabel = document.getElementById('sectionLabel');
        if (sectionLabel) sectionLabel.style.display = 'none';
        if (window.initializeHeader) window.initializeHeader();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (window.syncCaseStudyGridToWork) window.syncCaseStudyGridToWork();
          });
        });
      })
      .catch(error => console.error('Error loading header:', error));
  </script>
  <script src="../smooth-scroll.js"></script>
  <script src="../case-study-page.js"></script>${cursorScript}
</body>
</html>
`;
}

function convertOne(file) {
  const filePath = path.join(PROJECTS, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // Skip if it has already been converted (uses case-study-page class).
  if ($('.case-study-page').length) {
    return { file, status: 'already-converted' };
  }

  const main = $('main.page').first();
  if (!main.length) return { file, status: 'no-main' };

  const pageTitle = $('title').text().trim() || file;

  // First .hero-image-container before .project-container is the intro hero.
  let heroBlock = null;
  let projectContainer = main.find('.project-container').first();
  if (projectContainer.length) {
    heroBlock = projectContainer.prevAll('.hero-image-container').first();
  }
  if (!heroBlock || !heroBlock.length) {
    // fallback: first hero-image-container in main.
    heroBlock = main.find('.hero-image-container').first();
  }

  const heroItems = heroBlock && heroBlock.length ? getMediaItems($, heroBlock[0]) : [];
  const renderHeroItem = (item) => {
    const wrapLink = (html) => {
      if (!item.link || !item.link.href) return html;
      const target = item.link.target ? ` target="${escapeAttr(item.link.target)}"` : '';
      const rel = item.link.rel ? ` rel="${escapeAttr(item.link.rel)}"` : '';
      return `<a href="${escapeAttr(item.link.href)}"${target}${rel}>${html}</a>`;
    };
    if (item.type === 'img') {
      return wrapLink(toPicture(item.src, item.alt || (projectContainer.find('.project-title').text().trim() + ' project hero image')));
    }
    if (item.sources && item.sources.length) {
      const tags = item.sources
        .map((s) => `<source src="${s.src}" type="${s.type}">`)
        .join('\n              ');
      return wrapLink(`<video ${item.attrs}>
              ${tags}
            </video>`);
    }
    return wrapLink(toVideo(item.src, item.attrs));
  };
  let heroHtml;
  if (heroItems.length === 1) {
    heroHtml = renderHeroItem(heroItems[0]);
  } else if (heroItems.length > 1) {
    heroHtml = heroItems
      .map((i) => renderHeroItem(i))
      .join('\n            ');
  } else {
    heroHtml = '';
  }

  const projectTitle = projectContainer.find('.project-title').first().text().trim() || pageTitle.replace(/ - Project Detail$/, '');
  const description = projectContainer.find('.project-description').first().text().trim();
  const role = readDetailColumn($, projectContainer, 'Role');
  const team = readDetailColumn($, projectContainer, 'Team');
  const scope = readDetailColumn($, projectContainer, 'Scope');
  const tools = readDetailColumn($, projectContainer, 'Tools');
  const tags = pickTags(role, tools, `${file} ${pageTitle} ${description}`);

  // Collect text-sections + media blocks in source order, after .project-container.
  const sequence = [];
  const allChildren = main.children().toArray();
  const containerIdx = projectContainer.length ? allChildren.indexOf(projectContainer[0]) : -1;
  const after = containerIdx >= 0 ? allChildren.slice(containerIdx + 1) : allChildren;
  for (const node of after) {
    if (!node.attribs) continue;
    if (nodeIsTextSection($, node)) {
      const $node = $(node);
      const content = $node.find('.text-section-content').first();
      if (!content.length) continue;
      // Pull the section title and remove it from the content so we render it ourselves.
      const titleEl = content.find('h2.text-section-title').first();
      const title = titleEl.length ? titleCase(titleEl.text().trim()) : null;
      if (titleEl.length) titleEl.remove();
      // Tighten paragraph whitespace introduced by the legacy templates.
      content.find('p.text-section-text').each((_, p) => {
        const $p = $(p);
        const inner = $p.html();
        if (inner) $p.html(inner.replace(/\s+/g, ' ').trim());
      });
      const contentHtml = content.html().trim();
      if (!title && !contentHtml) continue;
      sequence.push({ kind: 'text', title, contentHtml });
    } else if (nodeIsMediaBlock($, node)) {
      const items = getMediaItems($, node);
      if (!items.length) continue;
      sequence.push({ kind: 'media', cls: node.attribs.class, items });
    }
  }

  // Assign descriptors, ids to text sections based on count + title.
  const textIndices = sequence.map((s, i) => (s.kind === 'text' ? i : -1)).filter((i) => i !== -1);
  const totalText = textIndices.length;
  textIndices.forEach((idxInSeq, k) => {
    const s = sequence[idxInSeq];
    let descriptor = null;
    if (!s.title) {
      descriptor = defaultDescriptor(k, totalText, !!s.title);
    }
    s.descriptor = descriptor;
    const labelForId = (s.title || descriptor || `Section ${k + 1}`);
    s.id = `case-study-section-${slugify(labelForId)}-${k + 1}`;
  });

  // For pages with no text section at all, synthesize an Overview placeholder
  // so the section nav has something to point at.
  if (totalText === 0) {
    const overview = {
      kind: 'text',
      title: null,
      contentHtml: `<p class="text-section-text">${description || `More about ${projectTitle}.`}</p>`,
      descriptor: 'Overview',
      id: 'case-study-section-overview-1',
    };
    sequence.unshift(overview);
  }

  const navItems = sequence
    .filter((s) => s.kind === 'text')
    .map((s) => ({
      id: s.id,
      label: s.title ? titleCase(s.title) : (s.descriptor || 'Section'),
    }));

  // Collapse super-long titles for nav: prefer the descriptor over the full title if both differ.
  navItems.forEach((it, i) => {
    const sec = sequence.filter((s) => s.kind === 'text')[i];
    if (sec.descriptor && sec.title && sec.descriptor !== sec.title) {
      it.label = sec.descriptor;
    }
    if (it.label && it.label.length > 32) it.label = it.label.slice(0, 30) + '…';
  });

  const bodyParts = [];
  for (const s of sequence) {
    if (s.kind === 'text') {
      bodyParts.push(renderTextSection(s));
    } else {
      bodyParts.push(renderMediaBlock(s));
    }
  }
  const body = bodyParts.join('\n\n');

  // Detect header replacement string from existing script.
  const replaceMatch = html.match(/data\.replace\(\s*'id="pageTitle">Work<\/div>'\s*,\s*'id="pageTitle">([^<]+)<\/div>'\s*\)/);
  const headerReplacement = replaceMatch ? replaceMatch[1] : projectTitle;

  // Preserve cursor.js include if it was present.
  const preserveCursorScript = /cursor\.js/.test(html);

  const out = buildPageHtml({
    pageTitle,
    headerReplacement,
    projectTitle,
    description,
    tags,
    role,
    team,
    scope,
    tools,
    hero: heroHtml,
    body,
    navItems,
    preserveCursorScript,
  });

  if (dry) {
    console.log(`# ${file}`);
    console.log(`  title: ${projectTitle}`);
    console.log(`  tags: ${tags.join(', ')}`);
    console.log(`  sections: ${navItems.map((n) => n.label).join(' | ')}`);
    return { file, status: 'dry' };
  }

  fs.writeFileSync(filePath, out);
  return { file, status: 'converted', tags, navItems };
}

function main() {
  const files = fs
    .readdirSync(PROJECTS)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !SKIP.has(f))
    .filter((f) => !onlyFiles || onlyFiles.includes(f));
  const results = [];
  for (const f of files) {
    try {
      results.push(convertOne(f));
    } catch (err) {
      console.error(`fail ${f}:`, err.message);
      results.push({ file: f, status: 'error', error: err.message });
    }
  }
  for (const r of results) {
    console.log(`${r.status.padEnd(18)} ${r.file}${r.tags ? ` [${r.tags.join(', ')}] {${(r.navItems || []).map((n) => n.label).join(', ')}}` : ''}`);
  }
  const errors = results.filter((r) => r.status === 'error');
  if (errors.length) process.exitCode = 1;
}

main();
