# Content still needed

Everything the prototype contained has been carried across. These are the remaining gaps, by area, with
counts. Items marked ⚠️ are places where the site currently shows an honest empty state or a partial list
rather than invented content.

## Book Prize longlists and shortlists, 2018–2025 ⚠️

The site lists all **9 winners** with descriptions and links. It does **not** yet carry the full
**longlists and shortlists** for each year (2018–2025). The brief asks for these to be scraped into
`data/books.yaml` with a route tag.

- Needed: for each prize year, the longlist and shortlist (title, author, publisher).
- Sources: 2024 and 2025 are in NIF press releases (linked from the News page); 2021–2023 are on the
  orphaned pages `/nif-book-prize-2021-shortlist`, `/nif-book-prize-2022-shortlist`,
  `/nifbookprize-shortlist-2023z`, `/longlist2025`, `/shortlist2025-1`.
- Suggested data model (not yet built): add a `data/lists.yaml` keyed by year with `longlist` and
  `shortlist` arrays, and either link those titles to book pages or add them as `route: longlist` /
  `route: shortlist` entries in `books.yaml`. Left out deliberately rather than half-populated, to avoid
  publishing an incomplete list that reads as complete.

## Fellows, rounds 1–10 ⚠️

The site lists **Round 12 (2025)** and **Round 11 (2023)** by name, and the **2026 translation cohort**.
Rounds 1–10 (2004–2021) are represented only by their *books* (all 37 are in the Library). The named
fellow rosters for rounds 1–10 are **not published anywhere we could verify** and are not on the site.

- Needed: the fellow names for rounds 1–10, and which round each was.
- ⚠️ **Round 11 is incomplete**: the prototype lists **5 of 7** fellows. The other two names are needed.
  (Marked `incomplete: true` in `data/fellows.yaml`.)

## Which fellow wrote which book

The 37 fellowship books are catalogued, but not matched to the fellow's round. `data/books.yaml` has a
`round:` field on every fellowship book, currently `null`. Once NIF supplies the round for each book (or
the rounds 1–10 rosters above), fill `round:` and the book page will show "Round N".

## Publishers, years and ISBNs

Filled by verified lookup where found (Amazon / publisher pages); see `REVIEWS-FOUND.md` for coverage and
`data/books.yaml` for the values. Any book still showing a blank `publisher`/`year`/`isbn` could not be
verified from a fetched source and needs NIF to supply it. **Never guess these** — the book-page template
simply omits any field left blank.

## Press reviews

See `REVIEWS-FOUND.md` for the per-book tally and the list of books that came up empty. Books with no
verified review keep the styled "Reviews … will be collected here" empty state with the press contact.

## The NIF team page

Not captured — the prototype had no team page, only the Governing Board (which is on the About page). If
NIF wants a staff/team page, supply names, roles and photos and it can be added as a new section.

## Jury composition by year (Book Prize)

The site shows the **current** jury (the Governing Board, chaired for the prize by Niraja Gopal Jayal).
Per-year jury composition (who judged in 2018, 2019, …) is not published and is not on the site. If NIF
has it, it can be added to `data/juries.yaml` under per-year keys.

## Newsletter PDF

The legacy link `/s/NIF-Newsletter-_October.pdf` redirects to the News page. The PDF itself was not
migrated (it lives on Squarespace). If NIF wants past newsletters hosted here, drop the PDFs in
`static/newsletters/` and link them from `data/news.yaml`.

## Girish Karnad Memorial Lecture

The About page describes the lecture but has no past-lecture archive (the prototype had none). If NIF has
a list of past lecturers and dates, it can be added.
