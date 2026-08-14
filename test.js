const __dirname = import.meta.dirname;
const __filename = import.meta.filename;
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { spawn } from 'child_process';

const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';

import pkg from './package.json' with { type: 'json' };
let files = [];

// lib/lowdb and lib/json are vendored/data, not ours to lint.
const VENDORED_DIRS = new Set(['lowdb', 'json']);

const listJsFiles = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory()) return VENDORED_DIRS.has(entry.name) ? [] : listJsFiles(path.join(dir, entry.name));
        return entry.name.endsWith('.js') ? [path.resolve(path.join(dir, entry.name))] : [];
      })
    : [];

// Root: top-level files only. lib/ and plugins/: recurse into subfolders.
for (let file of fs.readdirSync('.').filter((v) => v.endsWith('.js'))) {
  files.push(path.resolve(file));
}
for (let folder of Object.keys(pkg.directories)) {
  files.push(...listJsFiles(folder));
}

for (let file of files) {
  if (file == path.join(__dirname, __filename)) continue;

  console.error(`${BRIGHT}${BLUE}Checking${RESET} ${file}`); // Highlight "Checking" in console logs with blue color
  spawn(process.argv0, ['-c', file])
    .on('close', () => {
      assert.ok(file);
      console.log(`${BRIGHT}${GREEN}Done${RESET} ${file} ${BRIGHT}${Math.floor(Math.random() * 100)}%${RESET}`);
    })
    .stderr.on('data', (chunk) => assert.ok(chunk.length < 1, `${RED}${DIM}${file}\n\n${chunk}${RESET}`));
}
