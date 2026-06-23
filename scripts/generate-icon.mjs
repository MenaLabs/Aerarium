import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SIZE = 512;
const RADIUS = 90;
const BG = [37, 99, 235]; // #2563eb
const FG = [255, 255, 255];

function inRoundedRect(x, y, w, h, r) {
  const cx = x < r ? r : x > w - 1 - r ? w - 1 - r : x;
  const cy = y < r ? r : y > h - 1 - r ? h - 1 - r : y;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inBar(x, y, barLeft, barWidth, barTop, bottom) {
  return x >= barLeft && x < barLeft + barWidth && y >= barTop && y < bottom;
}

const bottom = SIZE - 96;
const bars = [
  { left: 96, width: 80, top: bottom - 160 },
  { left: 216, width: 80, top: bottom - 240 },
  { left: 336, width: 80, top: bottom - 320 },
];

const buf = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const idx = (y * SIZE + x) * 4;
    if (!inRoundedRect(x, y, SIZE, SIZE, RADIUS)) {
      buf[idx + 3] = 0; // transparent outside rounded square
      continue;
    }
    const onBar = bars.some((b) => inBar(x, y, b.left, b.width, b.top, bottom));
    const color = onBar ? FG : BG;
    buf[idx] = color[0];
    buf[idx + 1] = color[1];
    buf[idx + 2] = color[2];
    buf[idx + 3] = 255;
  }
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(SIZE, 0);
ihdrData.writeUInt32BE(SIZE, 4);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // color type RGBA
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;

const rowSize = SIZE * 4;
const raw = Buffer.alloc((rowSize + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (rowSize + 1)] = 0; // filter: none
  buf.copy(raw, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
}
const idatData = deflateSync(raw);

const png = Buffer.concat([
  signature,
  chunk('IHDR', ihdrData),
  chunk('IDAT', idatData),
  chunk('IEND', Buffer.alloc(0)),
]);

const outDir = path.resolve(import.meta.dirname, '..', 'build');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'icon.png'), png);
console.log('Wrote', path.join(outDir, 'icon.png'), png.length, 'bytes');
