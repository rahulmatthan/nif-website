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

const keys = ['slug','title','author','route','prizeYear','round','joint','translation','theme',
  'publisher','year','isbn','cover','buyAmazon','buyPublisher','shortDescription','description','reviews','awards'];

for (const b of books) {
  out += `- slug: ${yScalar(b.slug)}\n`;
  for (const k of keys) {
    if (k === 'slug') continue;
    const v = b[k];
    if (k === 'reviews' || k === 'awards') {
      out += `  ${k}: []\n`;
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

console.log(`Wrote data/books.yaml with ${books.length} books (${winners.length} prize, ${fellowship.length} fellowship).`);
console.log(`Books missing NIF description: ${books.filter(b => !b.description).map(b => b.slug).join(', ') || 'none'}`);
console.log(`Covers to download: ${covers.length}`);
