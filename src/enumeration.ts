import { analyze, visibleSource } from './analyzer';
import type { CompiledData } from './types';

export interface EnumerationItem {
  start: number;
  end: number;
  number: string;
  compiled: boolean;
}

/** Standard LaTeX enumerate counters; custom lists require a compiled label. */
export function enumerationItems(text: string, data: CompiledData): EnumerationItem[] {
  const chars = visibleSource(text).split('');
  const spans = analyze(text);
  for (const [start, end] of [...spans.code, ...spans.preamble]) {
    for (let i = start; i < end; i++) chars[i] = ' ';
  }
  const source = chars.join('');
  const tokens = /\\(begin|end)\s*\{(enumerate|itemize|description)\}|\\(item)\b/g;
  const stack: { env: string; count: number; custom: boolean }[] = [];
  const result: EnumerationItem[] = [];
  // Redefined counters/labels and enumitem defaults cannot be inferred safely.
  const customDefaults = /\\(?:setlist|renewcommand|def)\b/.test(visibleSource(text));
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(source))) {
    if (match[1] === 'begin') {
      const options = /^\s*\[/.test(source.slice(tokens.lastIndex));
      stack.push({ env: match[2], count: 0, custom: options || customDefaults });
      continue;
    }
    if (match[1] === 'end') {
      if (stack.at(-1)?.env === match[2]) stack.pop();
      continue;
    }
    const current = stack.at(-1);
    if (!current || current.env !== 'enumerate') continue;
    const following = source.slice(tokens.lastIndex);
    if (/^\s*\[/.test(following)) continue; // Explicit item labels do not advance the counter.
    current.count++;
    const next = /\\item\b|\\(?:begin|end)\s*\{(?:enumerate|itemize|description)\}/.exec(following);
    const body = following.slice(0, next?.index ?? following.length);
    const labelKey = /\\label\s*\{([^{}]+)\}/.exec(body)?.[1];
    const label = labelKey ? data.labels.get(labelKey) : undefined;
    if (label) {
      result.push({ start: match.index, end: tokens.lastIndex, number: label.number, compiled: true });
      continue;
    }
    const levels = stack.filter(frame => frame.env === 'enumerate');
    if (levels.some(frame => frame.custom) || levels.length > 4 || /\\(?:setcounter|addtocounter)\b/.test(source)) continue;
    const n = current.count;
    let number: string;
    if (levels.length === 1) number = `${n}.`;
    else if (levels.length === 2 && n <= 26) number = `(${String.fromCharCode(96 + n)})`;
    else if (levels.length === 3 && n <= 3999) {
      let remaining = n, roman = '';
      for (const [value, symbol] of [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],[50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']] as const) {
        while (remaining >= value) { roman += symbol; remaining -= value; }
      }
      number = roman + '.';
    } else if (levels.length === 4 && n <= 26) number = String.fromCharCode(64 + n) + '.';
    else continue;
    result.push({ start: match.index, end: tokens.lastIndex, number, compiled: false });
  }
  return result;
}
