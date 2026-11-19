'use strict';
const fs = require('node:fs');
const path = require('node:path');
const analyzer = require('../out/src/analyzer');
const source = fs.readFileSync(path.join(__dirname, 'sample.tex'), 'utf8');
const spans = analyzer.analyze(source);
const data = {
  source, spans,
  listingLines: require('../out/src/listing-parser').computeListingLines(source, spans.code, analyzer.visibleSource),
  palettes: require('../out/src/palettes').palettes,
  locales: { en: require('../locales/en.json'), 'zh-TW': require('../locales/zh-TW.json') }
};
const preview = path.join(__dirname, 'latex-color-review.html');
let html = fs.readFileSync(preview, 'utf8');
html = html.replace(/<script type="application\/json" id="latex-review-data">[\s\S]*?<\/script>/, '<script type="application/json" id="latex-review-data">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>');
fs.writeFileSync(preview, html);
console.log('Review data updated from project sources.');
