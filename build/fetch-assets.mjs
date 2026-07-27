// Downloads covers (from build/covers.json), board photos and the logo from the Squarespace CDN
// into assets/ so Hugo can process them (no hotlinking). Run: node build/fetch-assets.mjs
import fs from 'node:fs';

const CDN = 'https://images.squarespace-cdn.com/content/v1/610913e15985a80cd186a571/';

const covers = JSON.parse(fs.readFileSync('build/covers.json', 'utf8'));

const board = [
  ['niraja-gopal-jayal', '1628321348659-9VHNI645H12QNBW1ZAXL/Niraja+Gopal+Jayal+1.jpg'],
  ['srinath-raghavan', '1628321392692-AHWJS4ZQMRKQ7TE3CWBD/Srinath+Raghavan+1.jpg'],
  ['manish-sabharwal', '1629183645562-UJHRL1QVOQO6H4QG1GJI/Manish+Sabharwal+1+copy.jpg'],
  ['rahul-matthan', 'ea563752-a698-4a55-a00b-88a318e30fd4/Rahul+Matthan+full+jpeg.jpg'],
  ['nandan-nilekani', '1628321621970-YY6BVHN92PCDQC7DCU47/Nandan+Nilekani+1.jpg'],
];

const logo = CDN + '36399f21-6776-4e72-a531-2e3de2ea04bf/Logo.gif?format=1500w';

fs.mkdirSync('assets/covers', { recursive: true });
fs.mkdirSync('assets/people', { recursive: true });

async function get(url, dest) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (NIF site build)' } });
    if (!r.ok) return { ok: false, status: r.status };
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 500) return { ok: false, status: 'tiny' };
    fs.writeFileSync(dest, buf);
    return { ok: true, bytes: buf.length };
  } catch (e) {
    return { ok: false, status: e.message };
  }
}

const results = { covers: { ok: 0, fail: [] }, people: { ok: 0, fail: [] }, logo: false };

for (const c of covers) {
  const dest = `assets/covers/${c.slug}.jpg`;
  if (fs.existsSync(dest)) { results.covers.ok++; continue; }
  const r = await get(c.url, dest);
  if (r.ok) { results.covers.ok++; process.stdout.write('.'); }
  else { results.covers.fail.push(`${c.slug} (${r.status})`); process.stdout.write('x'); }
}
process.stdout.write('\n');

for (const [slug, path] of board) {
  const dest = `assets/people/${slug}.jpg`;
  const r = await get(CDN + path, dest);
  if (r.ok) results.people.ok++; else results.people.fail.push(`${slug} (${r.status})`);
}

{
  const r = await get(logo, 'assets/logo.gif');
  results.logo = r.ok;
}

console.log(`Covers: ${results.covers.ok}/${covers.length} ok`);
if (results.covers.fail.length) console.log('  missing:', results.covers.fail.join(', '));
console.log(`Board: ${results.people.ok}/${board.length} ok`);
if (results.people.fail.length) console.log('  missing:', results.people.fail.join(', '));
console.log(`Logo: ${results.logo ? 'ok' : 'FAILED'}`);
