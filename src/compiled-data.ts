import type { Group, CompiledData } from './types';
export function group(text: string, start: number): Group | null {
  let i = start;
  while (i < text.length && /\s/.test(text[i])) i++;
  if (text[i] !== '{') return null;
  const begin = ++i;
  let depth = 1;
  while (i < text.length) {
    if (text[i] === '\\' && /[{}%\\]/.test(text[i + 1] || '')) { i += 2; continue; }
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) return { value: text.slice(begin, i), end: i + 1 };
    i++;
  }
  return null;
}
function groups(text: string): string[] {
  const result = [];
  let at = 0, next;
  while ((next = group(text, at))) { result.push(next.value); at = next.end; }
  return result;
}
export function clean(text: string): string {
  return text.replace(/\\(?:protect|ignorespaces|relax)\b/g, '')
    .replace(/\\[a-zA-Z@]+\*?/g, '').replace(/[{}]/g, '').replace(/[~\s]+/g, ' ').trim();
}
export function parseCompiled(text: string, data: CompiledData = { labels: new Map(), citations: new Map(), entries: [], inputs: [] }) {
  const pattern = /\\(newlabel|bibcite|contentsline|@input|entry)\b/g;
  let match;
  while ((match = pattern.exec(text))) {
    const first = group(text, pattern.lastIndex);
    if (!first) continue;
    if (match[1] === '@input') { data.inputs.push(first.value); continue; }
    const second = group(text, first.end);
    if (!second) continue;
    if (match[1] === 'newlabel') {
      const fields = groups(second.value);
      if (fields.length >= 2 && !/@cref$/.test(first.value)) data.labels.set(first.value, { number: clean(fields[0]), page: clean(fields[1]), title: clean(fields[2] || ''), anchor: fields[3] || '' });
    } else if (match[1] === 'bibcite') {
      const fields = groups(second.value);
      data.citations.set(first.value, clean(fields.length ? fields[0] : second.value));
    } else if (match[1] === 'contentsline') {
      const numberline = /\\numberline\s*/.exec(second.value);
      if (numberline) {
        const number = group(second.value, numberline.index + numberline[0].length);
        if (number) data.entries.push({ kind: first.value, number: clean(number.value), title: clean(second.value.slice(number.end)) });
      }
    } else if (match[1] === 'entry') {
      const end = text.indexOf('\\endentry', second.end);
      if (end !== -1) {
        const body = text.slice(second.end, end);
        const number = /\\field\{labelnumber\}\s*/.exec(body);
        if (number) {
          const value = group(body, number.index + number[0].length);
          const prefix = /\\field\{labelprefix\}\s*/.exec(body);
          const prefixValue = prefix && group(body, prefix.index + prefix[0].length);
          if (value) data.citations.set(first.value, clean((prefixValue ? prefixValue.value : '') + value.value));
        }
      }
    }
  }
  return data;
}
