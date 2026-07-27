// Extracts the winners / fellowship / ABOUT data from the prototype (reference/prototype.html)
// and writes data/books.yaml verbatim. Run: node build/extract.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('reference/prototype.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

// Pull just the data + slugify definitions and evaluate them in a sandbox.
const start = script.indexOf("const CDN=");
const end = script.indexOf('const lib=[]');
const dataSrc = script.slice(start, end);
const ctx = {};
vm.createContext(ctx);
vm.runInContext(dataSrc + '\nthis.CDN=CDN;this.winners=winners;this.fellowship=fellowship;this.ABOUT=ABOUT;this.slugify=slugify;', ctx);

const { CDN, winners, fellowship, ABOUT, slugify } = ctx;

const books = [];

// Prize winners
for (const w of winners) {
  const slug = slugify(w.t);
  books.push({
    slug,
    title: w.t,
    author: w.a,
    route: 'prize',
    prizeYear: w.y,
    joint: !!w.joint,
    translation: /translated/i.test(w.a),
    theme: w.theme,
    cover: w.img ? w.img.replace(CDN, '') : '',
    coverUrl: w.img || '',
    round: null,
    publisher: '',
    year: null, // fill from verified research only
    isbn: '',
    buyAmazon: w.buy || '',
    buyPublisher: '',
    shortDescription: w.d || '',
    description: ABOUT[slug] || '',
    reviews: [],
    awards: [],
  });
}

// Fellowship books: [title, author, theme, imgPath, buy, trans?]
for (const f of fellowship) {
  const slug = slugify(f[0]);
  books.push({
    slug,
    title: f[0],
    author: f[1],
    route: 'fellowship',
    prizeYear: null,
    joint: false,
    translation: !!f[5],
    theme: f[2],
    cover: f[3] || '',
    coverUrl: f[3] ? CDN + f[3] : '',
    round: null,
    publisher: '',
    year: null,
    isbn: '',
    buyAmazon: f[4] || '',
    buyPublisher: '',
    shortDescription: '',
    description: ABOUT[slug] || '',
    reviews: [],
    awards: [],
  });
}

// ---- merge verified research (build/research/out-*.json), if present ----
const bySlug = Object.fromEntries(books.map(b => [b.slug, b]));
const reviewSummary = [];
let merged = 0;
for (let i = 1; i <= 6; i++) {
  const p = `build/research/out-${i}.json`;
  if (!fs.existsSync(p)) continue;
  let arr;
  try { arr = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { console.error(`Bad JSON in ${p}`); continue; }
  for (const r of arr) {
    const b = bySlug[r.slug];
    if (!b) { console.error(`Research references unknown slug: ${r.slug}`); continue; }
    if (r.publisher) b.publisher = r.publisher;
    if (r.year !== null && r.year !== undefined && r.year !== '') b.year = Number(r.year);
    if (r.isbn) b.isbn = String(r.isbn);
    // Keep only well-formed reviews (must have quote + url + publication)
    const reviews = (Array.isArray(r.reviews) ? r.reviews : [])
      .filter(v => v && v.quote && v.url && v.publication)
      .map(v => ({
        publication: String(v.publication),
        reviewer: v.reviewer ? String(v.reviewer) : '',
        date: v.date ? String(v.date) : '',
        quote: String(v.quote).replace(/\s+/g, ' ').trim(),
        url: String(v.url),
      }));
    b.reviews = reviews;
    // Awards: keep only real EXTERNAL awards. Drop the NIF Book Prize itself (shown via the badge) and
    // scrub the forbidden former prize name entirely.
    b.awards = (Array.isArray(r.awards) ? r.awards : [])
      .filter(Boolean).map(String)
      .filter(a => !/kamaladevi/i.test(a) && !/\bNIF Book Prize\b/i.test(a));
    const notes = String(r.notes || '').replace(/kamaladevi chattopadhyay/ig, '').replace(/\s{2,}/g, ' ').trim();
    merged++;
    reviewSummary.push({ slug: r.slug, title: b.title, route: b.route, reviews, awards: b.awards,
      publisher: b.publisher, year: b.year, isbn: b.isbn, notes });
  }
}
if (merged) console.log(`Merged verified research for ${merged} books.`);

// ---- minimal YAML emitter tailored to this schema ----
function yScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  const s = String(v);
  if (s === '') return '""';
  // Always double-quote strings, escaping backslash and quote. Keeps <em> and unicode intact.
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

let out = '# NIF book catalogue — the single source of truth for the Library and every /books/<slug> page.\n';
out += '# Descriptions are NIF\'s own, carried verbatim from the prototype. Do not replace with publisher blurb.\n';
out += '# To add a book: append an entry with a unique slug. route is "prize" or "fellowship".\n\n';

// [yamlKey, jsField] — snake_case yamlKeys because Hugo lowercases map keys inside a top-level
// sequence data file, which would silently break camelCase lookups in templates.
const keys = [
  ['slug','slug'],['title','title'],['author','author'],['route','route'],['prize_year','prizeYear'],
  ['round','round'],['joint','joint'],['translation','translation'],['theme','theme'],
  ['publisher','publisher'],['year','year'],['isbn','isbn'],['cover','cover'],
  ['buy_amazon','buyAmazon'],['buy_publisher','buyPublisher'],['short_description','shortDescription'],
  ['description','description'],['reviews','reviews'],['awards','awards'],
];

for (const b of books) {
  out += `- slug: ${yScalar(b.slug)}\n`;
  for (const [k, jsField] of keys) {
    if (k === 'slug') continue;
    const v = b[jsField];
    if (k === 'reviews') {
      if (!b.reviews || !b.reviews.length) { out += `  reviews: []\n`; }
      else {
        out += `  reviews:\n`;
        for (const r of b.reviews) {
          out += `    - publication: ${yScalar(r.publication)}\n`;
          out += `      reviewer: ${yScalar(r.reviewer || '')}\n`;
          out += `      date: ${yScalar(r.date || '')}\n`;
          out += `      quote: ${yScalar(r.quote)}\n`;
          out += `      url: ${yScalar(r.url)}\n`;
        }
      }
    } else if (k === 'awards') {
      if (!b.awards || !b.awards.length) { out += `  awards: []\n`; }
      else { out += `  awards:\n`; for (const a of b.awards) out += `    - ${yScalar(a)}\n`; }
    } else if (k === 'description' && v) {
      // literal block scalar keeps quotes/em-dashes/<em> readable and unescaped
      out += `  ${k}: |-\n    ${v}\n`;
    } else {
      out += `  ${k}: ${yScalar(v)}\n`;
    }
  }
  out += '\n';
}

fs.writeFileSync('data/books.yaml', out);

// Emit a plain list of {slug,title,coverUrl} for the cover downloader
const covers = books.filter(b => b.coverUrl).map(b => ({ slug: b.slug, url: b.coverUrl }));
fs.writeFileSync('build/covers.json', JSON.stringify(covers, null, 2));

// ---- REVIEWS-FOUND.md ----
if (reviewSummary.length) {
  const withReviews = reviewSummary.filter(r => r.reviews.length);
  const without = reviewSummary.filter(r => !r.reviews.length);
  const totalQuotes = reviewSummary.reduce((n, r) => n + r.reviews.length, 0);
  let md = `# Reviews found\n\n`;
  md += `_Generated from verified research. Every quote below was copied from a page a researcher fetched; each carries a working link. Books with no verified review keep the styled empty state on the site._\n\n`;
  md += `**${withReviews.length} of ${reviewSummary.length} books have at least one verified review; ${totalQuotes} quotes in total. ${without.length} books came up empty and need NIF to supply coverage.**\n\n`;
  md += `## Books with reviews\n\n`;
  for (const r of withReviews) {
    md += `### ${r.title}\n`;
    md += `_${r.route === 'prize' ? 'Prize winner' : 'Fellowship book'}`;
    if (r.publisher || r.year) md += ` · ${[r.publisher, r.year].filter(Boolean).join(', ')}`;
    md += `_\n\n`;
    for (const v of r.reviews) {
      md += `- **${v.publication}**${v.reviewer ? ` — ${v.reviewer}` : ''}${v.date ? ` (${v.date})` : ''}: “${v.quote}” — [link](${v.url})\n`;
    }
    if (r.awards.length) md += `- _Awards:_ ${r.awards.join('; ')}\n`;
    md += `\n`;
  }
  md += `## Books with no verified review (need NIF input)\n\n`;
  for (const r of without) md += `- **${r.title}** — ${r.notes || 'no verified review located'}\n`;
  fs.writeFileSync('REVIEWS-FOUND.md', md);
  console.log(`Wrote REVIEWS-FOUND.md (${withReviews.length}/${reviewSummary.length} books with reviews, ${totalQuotes} quotes).`);
}

console.log(`Wrote data/books.yaml with ${books.length} books (${winners.length} prize, ${fellowship.length} fellowship).`);
console.log(`Books missing NIF description: ${books.filter(b => !b.description).map(b => b.slug).join(', ') || 'none'}`);
console.log(`Covers to download: ${covers.length}`);
