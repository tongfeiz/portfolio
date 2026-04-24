# Project Page Design Guides

These guides come from the Scaling Reviews layout and the Lily trial page. Treat Lily as the pilot before extracting the shared pieces into `projectstyle.css`.

## Layout

- Use a two-column case-study grid on desktop: main story content on the left, metadata and section navigation on the right.
- Align the second column to the header Work nav when possible so project metadata and the page rail feel connected to the site chrome.
- Keep the hero media, project title block, and all main-column sections on the same width. In the current trial, that width is `94%` of the left grid column.
- Keep the intro metadata sticky on desktop. After the intro, replace it with a sticky section nav using the same right-column position.
- Collapse to one column below `900px`, with the section nav above the case-study body.

## Intro

- Start with a large rounded hero image or video.
- Place the project title directly below the hero, left-aligned.
- Use small uppercase mono tags below the title for project type, discipline, domain, or contribution area.
- Put the short project description beneath the tags. It should match body copy scale: `18px / 1.5` on desktop.
- Put Role, Team, Scope, and Tools in the sticky sidebar. Labels and values should share the same small mono/body scale so the sidebar reads as metadata, not a second headline.

## Section System

- Every main story section should use:
  - A small uppercase descriptor, such as `Problem`, `Solution`, `Features`, `Impact`, or `Takeaways`.
  - A clear H2 that says the actual point of the section.
  - One or more short paragraphs, left-aligned.
- Avoid full-width white text strips inside the case-study body. Sections should sit in the left column on the page background.
- Use `80px` between major text sections on desktop. Use `48px` between a text block and its supporting media.
- Use a thin horizontal rule between intro and body with equal top and bottom spacing.

## Media

- Keep most media inside the main story column after the intro.
- Use rounded `6px` corners for project media.
- Prefer descriptive alt text for still images. For autoplaying decorative/demo video, use an accessible label or nearby text context.
- Use full-bleed media only when the image needs to interrupt the story rhythm or show scale.
- Convert project `.jpg` and `.png` assets to `.webp` at matching dimensions and near-identical visual quality, then serve them through `<picture>` with the original file as a fallback.
- Optimize project videos for web delivery while preserving visible quality, usually by exporting an `.mp4` version from source formats like `.mov` with modern compression and keeping the source file as an archival fallback when useful.

## Navigation

- Add a desktop sticky section rail for pages with three or more story sections.
- Section rail labels should match descriptors and update `aria-current` as the reader scrolls.
- Add a small mono Back to top link after the final section.

## Writing

- Make section headings specific. Prefer `IEP progress tracking is fragmented` over `Problem`.
- Keep feature lists scannable with short cards, numbered feature blocks, or mono arrow lists.
- Preserve the project author's voice in takeaways, but avoid long unbroken paragraphs.
