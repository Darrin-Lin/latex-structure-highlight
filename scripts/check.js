'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', 'out', 'dist', 'build'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const file of walk(root)) {
  if (file.endsWith('.js')) {
    const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(check.status, 0, check.stderr);
  }
  if (file.endsWith('.json')) JSON.parse(fs.readFileSync(file, 'utf8'));
}
const manifest = require('../package.json');
const base = require('../package.nls.json');
const zh = require('../package.nls.zh-tw.json');
assert.deepEqual(Object.keys(base).sort(), Object.keys(zh).sort());
for (const match of JSON.stringify(manifest).matchAll(/%([^%]+)%/g)) assert(Object.hasOwn(base, match[1]), `Missing manifest translation: ${match[1]}`);
for (const file of ['README.md', 'README.zh-TW.md']) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (!/^https?:/.test(match[1])) assert(fs.existsSync(path.resolve(root, match[1])), `Broken link: ${match[1]}`);
  }
  for (const match of text.matchAll(/```json\n([\s\S]*?)```/g)) JSON.parse(match[1]);
}
console.log('JavaScript syntax, JSON, manifest translations and README links/settings checked.');
