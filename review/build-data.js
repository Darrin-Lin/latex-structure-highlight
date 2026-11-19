'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load(file) {
  const box = { exports: {}, require: id => id === 'vscode' ? {} : require(path.join(root, id)) };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), box);
  return box.exports;
}
const analyzer = load('extension.js');
const source = fs.readFileSync(path.join(__dirname, 'sample.tex'), 'utf8');
const spans = analyzer.analyze(source);
const data = {
  source, spans,
  listingLines: load('listing-lines.js').computeListingLines(source, spans.code, analyzer.visibleSource),
  palettes: require('../palettes').palettes,
  locales: { en: require('../locales/en.json'), 'zh-TW': require('../locales/zh-TW.json') }
};
const preview = path.join(__dirname, 'latex-color-review.html');
let html = fs.readFileSync(preview, 'utf8');
html = html.replace(/<script type="application\/json" id="latex-review-data">[\s\S]*?<\/script>/, '<script type="application/json" id="latex-review-data">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>');
fs.writeFileSync(preview, html);
console.log('Review data updated from project sources.');
