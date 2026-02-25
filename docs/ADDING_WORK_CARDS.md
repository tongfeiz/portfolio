# Adding new work cards

Use this checklist so new cards keep the site fast and the layout correct.

## Markup

- Add a new `.work-card` block in [index.html](index.html) inside `#workGrid`, in the section (Design / Art / Fashion / Visual // Audio) where it belongs. Order in the HTML is the display order; the script builds columns from it.

## Images

- **Format:** Prefer WebP for thumbnails (same quality, smaller files). Add a PNG fallback for older browsers.
- **Markup:** Use `<picture>` with WebP source and PNG fallback:
  ```html
  <picture>
    <source srcset="1_photos/pXX.webp" type="image/webp">
    <img src="1_photos/pXX.png" alt="..." loading="lazy">
  </picture>
  ```
- **Lazy loading:** Use `loading="lazy"` on the `<img>` for cards that are below the first row or two; omit it only for the first few images on the page.
- **Generate WebP:** After adding a new PNG in `1_photos/`, add its base name to `scripts/generate-webp.js` in the `GRID_IMAGES` array, then run `npm run build:webp`.

## Videos

- Use `data-src` (not `src`) and `preload="metadata"` so the video only loads when the card is near the viewport:
  ```html
  <video data-src="1_photos/vidX.mp4" preload="metadata" autoplay loop muted playsinline></video>
  ```
- Keep file sizes reasonable for web (e.g. short clips, moderate resolution/bitrate).

## Section labels

- If the new card starts a new section, give that card an `id` (e.g. `id="card28"`) and add it to the `labelByCard` map in the script so the header “+ Design” / “+ Art” etc. updates when that card scrolls into view.
