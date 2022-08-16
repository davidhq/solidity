import path from 'path';
import fs from 'fs';

import { recursive } from './lib/scan.js';
import applySyntax from './lib/applySyntax.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const dir = path.join(__dirname, '../_build/html');

const START_SOLIDITY = '__START_SOLIDITY__';
const START_YUL = '__START_YUL__';
const START_JS = '__START_JS__';
const START_JSON = '__START_JSON__';

const CODE_DIV = '<div class="highlight notranslate code">';

for (const { path: filePath } of recursive(dir, { flatten: true, extname: '.html' })) {
  const contents = fs
    .readFileSync(filePath)
    .toString()
    .replaceAll('<div class="highlight-solidity2 notranslate"><div class="highlight"><pre><span></span>', START_SOLIDITY)
    .replaceAll('<div class="highlight-yul2 notranslate"><div class="highlight"><pre><span></span>', START_YUL)
    .replaceAll('<div class="highlight-javascript2 notranslate"><div class="highlight"><pre><span></span>', START_JS)
    .replaceAll('<div class="highlight-json2 notranslate"><div class="highlight"><pre><span></span>', START_JSON);

  const result = contents
    .replaceAll(new RegExp(`${START_SOLIDITY}(.*?)</pre></div>`, 'gs'), (_, code) => `${CODE_DIV}<pre>${applySyntax(code, 'solidity')}</pre>`)
    .replaceAll(new RegExp(`${START_YUL}(.*?)</pre></div>`, 'gs'), (_, code) => `${CODE_DIV}<pre>${applySyntax(code, 'yul')}</pre>`)
    .replaceAll(new RegExp(`${START_JS}(.*?)</pre></div>`, 'gs'), (_, code) => `${CODE_DIV}<pre>${applySyntax(code, 'javascript')}</pre>`)
    .replaceAll(new RegExp(`${START_JSON}(.*?)</pre></div>`, 'gs'), (_, code) => `${CODE_DIV}<pre>${applySyntax(code, 'json')}</pre>`);

  fs.writeFileSync(filePath, result);
}
