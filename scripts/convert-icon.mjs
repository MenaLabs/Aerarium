import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import png2icons from 'png2icons';

const buildDir = path.resolve(import.meta.dirname, '..', 'build');
const input = readFileSync(path.join(buildDir, 'icon.png'));

const ico = png2icons.createICO(input, png2icons.BICUBIC, 0, false, true);
if (ico) writeFileSync(path.join(buildDir, 'icon.ico'), ico);

const icns = png2icons.createICNS(input, png2icons.BICUBIC, 0);
if (icns) writeFileSync(path.join(buildDir, 'icon.icns'), icns);

console.log('ico:', !!ico, 'icns:', !!icns);
