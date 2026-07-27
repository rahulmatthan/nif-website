# Decisions, assumptions and open questions

This records the choices made building the site, the assumptions carried over from the prototype, and
the questions only NIF can settle. Nothing factual here was invented; where something is unverified it
is flagged as such and built with the prototype's styled empty state or a documented placeholder.

## Questions only NIF can answer (please confirm)

1. **How Book Prize nominations actually work.** The live site gives three contradictory answers. The
   prototype — and therefore this site — reconciles it as: *publishers and agents may nominate from
   November; authors may submit their own books from January; the jury also considers eligible books on
   its own initiative.* This is a reconciliation, **not confirmed fact.** Please confirm or correct.

2. **Whether the prize is split between author and translator** for a translated winner. The site says it
   is (Book Prize FAQ). This is **inferred from the 2022 award** (Shekhar Pathak / Manisha Chaudhry), not
   stated anywhere official. Please confirm.

3. **The four split contact addresses** — `info@`, `submissions@`, `fellowships@`, `press@`. These were
   invented by the prototype. If any do not exist, tell us and we will collapse them to the ones that do.
   They live in one place: `hugo.toml → [params.contact]`.

4. **The application requirements on the Apply page** (proposal length, sample chapter, schedule) were
   specified by the prototype and are plausible but unconfirmed. Confirm before the call opens.

5. **Formspree (or other) form endpoint.** The application form is real but not yet connected — see README.
   NIF must create the form account and paste the endpoint into `data/status.yaml → formEndpoint`.

## Technical choices

- **Hugo Extended** (per the brief). Content editors never touch HTML — everything is in `data/*.yaml`.
  Book pages are generated from `data/books.yaml` by a Hugo **content adapter**
  (`content/books/_content.gotmpl`), so adding a book is a one-file edit.
- **State-aware CTAs** are driven entirely by `data/status.yaml`. `state: auto` computes open / soon /
  closed from the `opens`/`closes` dates at build time; you can also force a state. One file flips the
  whole site (ribbon, Apply buttons, Apply page, book-prize page).
- **Application form: Formspree.** Chosen because it needs no server, accepts file uploads, and is a
  one-line change to activate. The form posts `multipart/form-data` with the proposal, sample chapter and
  schedule as file inputs. If NIF already uses a submissions platform, point the form `action` there
  instead (single edit in `layouts/apply/single.html`, endpoint in `data/status.yaml`).
- **Downloadable guidelines** are generated from the same site data (`/guidelines/book-fellowship/`,
  `/guidelines/translation-fellowship/`) and produced as PDF via the browser's print-to-PDF from a
  print-styled page. This guarantees they cannot drift from the site — they *are* the site content. (An
  alternative, pre-rendering PDFs in CI with headless Chrome, was rejected as heavier for no real gain.)
- **Open Graph images**: book pages use the book's own cover; every other page gets a typographic card
  generated at build time from the design tokens (`layouts/partials/og-card.html`, Fraunces + Archivo,
  indigo canvas). The logo is never used as a universal OG fallback, per the brief.
- **Images**: all covers and photos are downloaded from the Squarespace CDN into `assets/` (no hotlinking)
  and processed by Hugo to WebP with a `srcset` and lazy loading below the fold.
- **baseURL**: pinned in `hugo.toml` to `https://exmachina.in/nif-website/` (the account's Pages custom
  domain serves the project site under that subpath). The workflow deliberately does **not** override it —
  GitHub's `configure-pages` returns an `http://`, apex-only URL that drops the `/nif-website` subpath and
  breaks every internal link. All internal links use **relative** inputs to `relURL`/`relLangURL` (`"prize/"`,
  not `"/prize/"`): under a subpath, a leading slash makes Hugo anchor to the host root and drop the prefix.
  For NIF's own domain, set `baseURL` to `https://www.newindiafoundation.org/` and the legacy-URL aliases
  resolve at the site root.

## Design notes (built as specified; flagged here)

- The prototype's homepage stats are hard-coded ("22 years, 12 rounds, 37 books, 9 prizes"). They live in
  `hugo.toml → [params.stats]`. They will need a manual bump as the numbers change — they are not derived,
  because "22 years" and "12 rounds" are not computable from the book data alone.
- The prototype logo is a low-resolution GIF; we converted it to PNG and render it white on the indigo
  header (as the prototype did). **A clean SVG or high-resolution PNG from NIF would be a real improvement**
  — drop it in `assets/logo.png` (or `.svg` and adjust `layouts/partials/header.html`).
- Book covers were only available at Squarespace's served resolution. A few are lower-resolution than ideal.

## Changes to the brief's factual content

- The fellowship is described as **annual** throughout (per the brief), replacing the prototype's mix.
- The Book Prize page now says the current open cycle is **2027** (nominations open November 2026), because
  the real "today" is after the 2026 nomination window closed. Change the cycle years in `data/status.yaml`
  as time moves on.
