import type { Group, Span, SourceMask, ListingLine } from './types';
function balanced(text: string, at: number, open: string, close: string): Group | null {
  while (/\s/.test(text[at] || '') && at < text.length) at++;
  if (text[at] !== open) return null;
  const start = ++at;
  let depth = 1, braces = 0;
  while (at < text.length) {
    if (text[at] === '\\') { at += 2; continue; }
    if (open !== '{') {
      if (text[at] === '{') braces++;
      if (text[at] === '}') braces--;
    }
    if (!braces && text[at] === open) depth++;
    if (!braces && text[at] === close && --depth === 0) return { value: text.slice(start, at), end: at + 1 };
    at++;
  }
  return null;
}
function options(text: string): Array<[string, string]> {
  let depth = 0, start = 0;
  const parts = [];
  for (let i = 0; i <= text.length; i++) {
    if (text[i] === '\\') { i++; continue; }
    if ('{['.includes(text[i] || '\0')) depth++;
    if ('}]'.includes(text[i] || '\0')) depth--;
    if (i === text.length || (text[i] === ',' && depth === 0)) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  return parts.map(part => {
    const at = part.indexOf('=');
    const key = (at < 0 ? part : part.slice(0, at)).trim();
    let value = at < 0 ? 'true' : part.slice(at + 1).trim();
    if (value.startsWith('{') && value.endsWith('}')) value = value.slice(1, -1).trim();
    return [key, value] as [string, string];
  }).filter(([key]) => key);
}
export function computeListingLines(text: string, codeSpans: Span[], visibleSource: SourceMask): ListingLine[] {
  const source = visibleSource(text), styles = new Map<string, Array<[string, string]>>(), names = new Map<string, number>(), output: ListingLine[] = [];
  let global: Record<string, string> = {}, previousLast = 0;
  function apply(target: Record<string, string>, entries: Array<[string, string]>, chain: string[] = []): Record<string, string> {
    for (const [key, value] of entries) {
      if (key === 'style') {
        if (styles.has(value) && !chain.includes(value) && chain.length < 12) apply(target, styles.get(value)!, [...chain, value]);
      } else target[key] = value;
    }
    return target;
  }
  const commands = /\\(lstset|lstdefinestyle)\b|\\begin\s*\{lstlisting\*?\}/g;
  let match: RegExpExecArray | null;
  while ((match = commands.exec(source))) {
    const matchIndex = match.index;
    const block = codeSpans.find(([start, end]) => matchIndex >= start && matchIndex < end);
    if (block && match.index !== block[0]) { commands.lastIndex = block[1]; continue; }
    if (match[1]) {
      const first = balanced(source, commands.lastIndex, '{', '}');
      if (!first) continue;
      if (match[1] === 'lstset') { global = apply({ ...global }, options(first.value)); commands.lastIndex = first.end; }
      else {
        const second = balanced(source, first.end, '{', '}');
        if (second) { styles.set(first.value.trim(), options(second.value)); commands.lastIndex = second.end; }
      }
      continue;
    }
    if (!block) continue;
    const local = balanced(source, commands.lastIndex, '[', ']');
    const settings = apply({ ...global }, local ? options(local.value) : []);
    const headerEnd = local ? local.end : commands.lastIndex;
    // A normal displayed listing starts on the following source line.
    const newline = text.indexOf('\n', headerEnd);
    if (newline < 0 || newline >= block[1]) { commands.lastIndex = block[1]; continue; }
    const start = newline + 1;
    const endLineStart = text.lastIndexOf('\n', block[1] - 1) + 1;
    const end = /^\s*$/.test(text.slice(endLineStart, block[1])) ? endLineStart : block[1];
    const first = settings.firstnumber || 'auto';
    let number = /^-?\d+$/.test(first) ? Number(first) : first === 'last' ? previousLast + 1 : settings.name && names.has(settings.name) ? names.get(settings.name)! + 1 : 1;
    const stepText = settings.stepnumber === undefined ? '1' : settings.stepnumber;
    const step = /^\d+$/.test(stepText) ? Number(stepText) : null;
    const knownFirst = /^(auto|last|-?\d+)$/.test(first);
    const active = knownFirst && step !== null && step > 0 && ['left', 'right'].includes(settings.numbers) && !settings.firstline && !settings.lastline && !settings.linerange;
    let at = start, index = 0;
    while (at < end) {
      let lineEnd = text.indexOf('\n', at);
      if (lineEnd === -1 || lineEnd > end) lineEnd = end;
      const line = text.slice(at, lineEnd).replace(/\r$/, '');
      const show = active && (number % step === 0 || (index === 0 && settings.numberfirstline === 'true')) && (settings.numberblanklines !== 'false' || line.trim() !== '');
      if (active) output.push({ at, end: at + line.length, number: show ? String(number) : '', side: settings.numbers as 'left' | 'right' });
      at = lineEnd + 1;
      index++; number++;
    }
    previousLast = number - 1;
    if (settings.name) names.set(settings.name, previousLast);
    commands.lastIndex = block[1];
  }
  return output;
}
