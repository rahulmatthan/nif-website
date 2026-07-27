# Lighthouse scores

Run with Lighthouse 12 (headless Chrome) against the live GitHub Pages deployment at
`https://exmachina.in/nif-website/`, mobile emulation, four representative pages.

| Page | Performance | Accessibility | Best Practices | SEO |
|------|:-----------:|:-------------:|:--------------:|:---:|
| Home (`/`) | 67 | **98** | 96 | **100** |
| Book Prize (`/prize/`) | 70 | **98** | **100** | **100** |
| The Library (`/library/`) | 82 | **98** | **100** | **100** |
| Book page (`/books/naoroji/`) | 77 | **98** | **100** | **100** |

Scores vary a few points run-to-run (the domain is not on a CDN edge for this test address).

## Notes

- **Accessibility 98** across all pages. Semantic landmarks, visible keyboard focus, `prefers-reduced-motion`
  honoured, and WCAG AA contrast (the small decorative labels that initially fell just under AA — the shelf
  caption and the 8.5px spine year labels — were raised to pass). The remaining 2 points are a
  heading-order nicety (book-card titles use `<h4>` within an `<h2>` section, carried from the prototype's
  card component).
- **SEO 100** everywhere: per-page titles, meta descriptions, canonical URLs, descriptive link text.
- **Best Practices 96 on the homepage**: the single deduction is `image-aspect-ratio` on the current-winner
  panel image, which is a landscape "winner creative" graphic rather than a 2:3 jacket. Cosmetically correct
  (it displays at its natural ratio); left as-is to avoid a layout/CLS regression. All other pages score 100.
- **Performance 67–82**: this is a type-forward editorial site using three Google Fonts (Fraunces, Source
  Serif 4, Archivo), which are render-blocking and are the main cost. Options to raise it, if desired,
  without touching the design: self-host the fonts (removes the third-party connection and blocking CSS),
  or subset them. Images are already WebP, responsive (`srcset`) and lazy-loaded below the fold, and CSS is
  minified and fingerprinted. Left font-hosted for fidelity; the trade-off is documented in `DECISIONS.md`.
