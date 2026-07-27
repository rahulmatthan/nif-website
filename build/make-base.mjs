// Generates a solid 1200x630 indigo PNG used as the base canvas for Open Graph cards.
import fs from 'node:fs';
import zlib from 'node:zlib';

const W = 1200, H = 630;
const [r, g, b] = [0x26, 0x35, 0x5C]; // --indigo

// raw image data: each row prefixed with filter byte 0
const rowLen = 1 + W * 3;
const raw = Buffer.alloc(rowLen * H);
for (let y = 0; y < H; y++) {
  const off = y * rowLen;
  raw[off] = 0;
  for (let x = 0; x < W; x++) {
    const p = off + 1 + x * 3;
    raw[p] = r; raw[p + 1] = g; raw[p + 2] = b;
  }
}
const idat = zlib.deflateSync(raw, { level: 9 });

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c;
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8-bit, truecolor RGB

const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
fs.mkdirSync('assets/og', { recursive: true });
fs.writeFileSync('assets/og/base.png', png);
console.log(`Wrote assets/og/base.png (${W}x${H}, ${png.length} bytes)`);
