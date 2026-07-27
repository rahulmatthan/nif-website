# What's new, relative to the current live site

A short summary suitable for forwarding to the Foundation. The new site is a rebuild of the prototype into
a maintainable, data-driven static site. Everything below is live at **https://exmachina.in/nif-website/**
(a temporary address on the deploying account's domain; it moves to newindiafoundation.org on cutover).

## The headline changes

1. **The prize is the NIF Book Prize.** The name "Kamaladevi Chattopadhyay" appears **nowhere** on the site —
   not in copy, titles, meta tags, image names, alt text or URLs. (Verified: zero occurrences in the build.)

2. **Applying is now impossible to miss.** The current live site has no Apply button and buries the prize
   three menu levels deep. The new site has:
   - A permanent **Apply** button (madder) in the nav on every page, desktop and mobile.
   - A **status ribbon** under the header showing exactly what is open, with real dates, linking through.
   - A dedicated **/apply** page with all three routes side by side — Book Fellowship, Translation
     Fellowship, Book Prize nomination — each with amount, annual timeline, what to submit and a live action.
   - **Book Prize** as its own top-level nav item.
   - A **real application form** (file uploads for proposal, sample chapter, schedule) — needs a Formspree
     ID to go live (see README); and **downloadable PDF guidelines** for each fellowship.
   - **One-file status control**: `data/status.yaml` drives every CTA. When a call is closed the buttons say
     so and show the next opening date; when open they go to the form.

3. **A page for every book.** Newly built: a filterable **Library** of all 46 books, and an individual
   **/books/<slug>** page for each — cover, title, author, publisher, year, ISBN, **NIF's own description**
   (carried across verbatim, not retailer blurb), verified **press reviews with links**, any **awards**,
   related books, and a buy link. This is the Foundation's most valuable asset and did not exist before.

4. **The fellowship is annual**, everywhere, with the correct cycle (open 1 Aug, close 30 Nov; translation
   closes 31 Dec).

5. **A leaner navigation** — About · Fellowships · Book Prize · The Library · News · **Apply** — replacing
   the current eight-item, twenty-link menu. Videos now sit on the pages they support.

## Press reviews

We searched the Indian and international press for every one of the 46 books and added **56 verified review
quotes across 38 books**. Every quote was copied from a page we actually fetched and carries the
publication, reviewer, date and a working link. **We invented nothing** — the 8 books with no fetchable
review keep an honest empty state with the press-desk contact. Full tally in `REVIEWS-FOUND.md`.

## Under the hood (for whoever maintains it)

- Built with **Hugo**; content editors only ever edit `data/*.yaml` — never HTML.
- **Per-page** titles, meta descriptions and Open Graph images (each book's cover; a generated typographic
  card elsewhere — never the logo).
- **Responsive, WebP, lazy-loaded** images processed from originals downloaded off the current CDN.
- **Every old URL redirects** — 33 aliases from `/nif`, `/governing-board`, `/book-prize`, `/fellows`, the
  press-release pages, and the rest — so nothing 404s at cutover.
- **Accessible**: semantic landmarks, visible focus, `prefers-reduced-motion`, AA contrast; Lighthouse
  scores in `LIGHTHOUSE.md`.
- **Deploys automatically** on every edit via GitHub Actions.

## What we still need from NIF

See `CONTENT-NEEDED.md` (longlists/shortlists, fellows for rounds 1–10, the two missing Round-11 names,
a clean logo, any missing publisher/ISBN) and `DECISIONS.md` (five points only NIF can confirm — how
nominations work, the author/translator split, the contact addresses, the application requirements, and the
form endpoint).
