# Image optimization (work grid)

## Target (visually lossless)

- **Dimensions:** Same as originals. No resizing.
- **Format:** WebP at quality 92 (visually same as PNG), with PNG fallback via `<picture>`.
- **Files:** All work-grid thumbnails used in `index.html`:  
  `p1, p2, p4, p7, p8, p9, p12–p20, p22–p26, p30, p31, p32`.

## Implementation

- Generate `1_photos/pN.webp` from each `1_photos/pN.png` (same dimensions, WebP Q92).
- In `index.html`, use `<picture><source srcset="1_photos/pN.webp" type="image/webp"><img src="1_photos/pN.png" ...></picture>` so supporting browsers get WebP, others get PNG.
