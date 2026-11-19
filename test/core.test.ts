import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { analyze, visibleSource } from '../src/analyzer';
import { parseCompiled } from '../src/compiled-data';
import { computeListingLines } from '../src/listing-parser';
import { translate } from '../src/i18n';
import { palettes, resolvePalette } from '../src/palettes';
import en from '../locales/en.json';
import zh from '../locales/zh-TW.json';
const root = path.resolve(__dirname, '../..');
test('valid bilingual samples do not trigger custom error decorations', () => {
  for (const language of ['en', 'zh-TW']) {
    const result = analyze(fs.readFileSync(path.join(root, `examples/sample-${language}.tex`), 'utf8'));
    assert.equal(result.unclosed.length, 0, language);
    assert.equal(result.unsafeUnderscore.length, 0, language);
  }
});
test('deliberate warning samples flag only their intended errors', () => {
  for (const language of ['en', 'zh-TW']) {
    const result = analyze(fs.readFileSync(path.join(root, `examples/warnings-${language}.tex`), 'utf8'));
    assert.equal(result.unclosed.length, 6, language);
    assert.equal(result.unsafeUnderscore.length, 2, language);
  }
});
test('AUX parsing preserves nested titles, actual numbers and citation labels', () => {
  const result = parseCompiled(String.raw`\newlabel{sec:a}{{3.1}{7}{Nested {title}}{subsection.3.1}{}}
\@writefile{toc}{\contentsline {subsection}{\numberline {3.1}Nested {title}}{7}{subsection.3.1}}
\bibcite{classic}{12}
\bibcite{natbib}{{13}{2026}{{Author}}{{}}}
\entry{biblatex}{book}{}\field{labelnumber}{14}\endentry`);
  assert.equal(result.labels.get('sec:a')!.number, '3.1');
  assert.equal(result.labels.get('sec:a')!.page, '7');
  assert.equal(result.entries[0].title, 'Nested title');
  for (const [key, value] of [['classic','12'],['natbib','13'],['biblatex','14']]) assert.equal(result.citations.get(key), value);
});
test('listing preview honors styles, continuation, blank lines and modulo steps', () => {
  const text = String.raw`\lstdefinestyle{base}{numbers=left,stepnumber=2,numberblanklines=false}
\lstset{style=base}
\begin{lstlisting}[firstnumber=3,numberfirstline=true]
a

c
d
\end{lstlisting}
\begin{lstlisting}[numbers=right,firstnumber=last,stepnumber=1]
e
\end{lstlisting}`;
  const spans = analyze(text);
  const lines = computeListingLines(text, spans.code, visibleSource);
  assert.deepEqual(Array.from(lines, line => line.number), ['3','','','6','7']);
  assert.equal(lines[4].side, 'right');
});
test('locale fallback and translation catalogs stay consistent', () => {
  assert.equal(translate('missingNumber', 'auto', 'zh-tw'), '尚無編譯編號');
  assert.equal(translate('missingNumber', 'auto', 'de'), 'No compiled number yet');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
});
test('palette overrides are validated and do not mutate presets', () => {
  assert.equal(resolvePalette('auto', true).section, palettes.githubLight.section);
  assert.equal(resolvePalette('auto', false).section, palettes.githubDark.section);
  assert.equal(resolvePalette('nord', false, { section:'#123456', error:'invalid' }).section, '#123456');
  assert.equal(resolvePalette('nord', false, { error:'invalid' }).error, palettes.nord.error);
  assert.notEqual(palettes.nord.section, '#123456');
});
