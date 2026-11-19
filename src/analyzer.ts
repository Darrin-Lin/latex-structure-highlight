import type { Analysis, SpanKind } from './types';
import { unsafeUnderscores } from './text-details';
import { unclosedRanges } from './unclosed';

export function visibleSource(text: string): string {
  const chars = text.split('');
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '%') {
      while (i < text.length && text[i] !== '\n') chars[i++] = ' ';
    } else if (text[i] === '\\') {
      const verb = /^\\verb\*?([^\sA-Za-z])/.exec(text.slice(i));
      if (verb) {
        const start = i;
        const delimiter = verb[1];
        i += verb[0].length;
        while (i < text.length && text[i] !== delimiter && text[i] !== '\n') i++;
        for (let j = start; j <= i && j < text.length && text[j] !== '\n'; j++) chars[j] = ' ';
      } else if (i + 1 < text.length && !/[A-Za-z@]/.test(text[i + 1])) {
        chars[i] = chars[i + 1] = ' ';
        i++;
      }
    }
  }
  return chars.join('');
}

export function analyze(text: string): Analysis {
  const source = visibleSource(text);
  const result: Analysis = { preamble: [], code: [], environment: [], figure: [], table: [], math: [], caption: [], label: [], reference: [], citation: [], part: [], chapter: [], section: [], subsection: [], subsubsection: [], paragraph: [], subparagraph: [], texttt: [], unsafeUnderscore: [], unclosed: [] };
  const commands = /\\([A-Za-z@]+)(\*)?/g;
  let codeEnvironment = null;
  let codeStart = 0;
  let documentStart = null;
  let match;
  function argumentEnd(start: number): number {
    let position = start;
    while (/\s/.test(source[position] || '') && position < source.length) position++;
    for (let count = 0; count < 4; count++) {
      if (source[position] !== '[' && source[position] !== '{') break;
      const opening = source[position], closing = opening === '[' ? ']' : '}';
      let depth = 1;
      position++;
      while (position < source.length && depth) {
        if (source[position] === opening) depth++;
        if (source[position] === closing) depth--;
        position++;
      }
      if (depth) return start; // Never color the rest of a document while typing an unfinished brace.
      while (position < source.length && /[ \t]/.test(source[position])) position++;
      if (opening === '{') break;
    }
    return position;
  }
  while ((match = commands.exec(source))) {
    const command = match[1], start = match.index;
    // Code contents are literal, including percent signs and LaTeX-like strings.
    if (codeEnvironment) continue;
    if (command === 'begin' || command === 'end') {
      const env = /^\s*\{([^{}\n]+)\}/.exec(source.slice(commands.lastIndex));
      if (!env) continue;
      const name = env[1].trim();
      const end = commands.lastIndex + env[0].length;
      const kind: SpanKind = /^(figure|subfigure)\*?$/.test(name) ? 'figure' : /^(table|tabular|tabularx|longtable|subtable)\*?$/.test(name) ? 'table' : /^(equation|align|alignat|gather|multline|displaymath|math|eqnarray)\*?$/.test(name) ? 'math' : 'environment';
      result[kind].push([start, end]);
      if (command === 'begin' && name === 'document' && documentStart === null) documentStart = start;
      if (command === 'begin' && /^(lstlisting|minted|pyglist|verbatim|Verbatim|[A-Za-z]*code)\*?$/.test(name)) {
        codeEnvironment = name;
        codeStart = start;
        // Scan the original source, since percent signs are not comments inside literal blocks.
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const close = new RegExp('\\\\end\\s*\\{' + escaped + '\\}', 'g');
        close.lastIndex = end;
        const closing = close.exec(text);
        const blockEnd = closing ? closing.index : text.length;
        result.code.push([codeStart, blockEnd]);
        if (closing) result.environment.push([closing.index, close.lastIndex]);
        commands.lastIndex = closing ? close.lastIndex : text.length;
        codeEnvironment = null;
      }
      continue;
    }
    let kind: SpanKind | undefined;
    if (command === 'texttt') {
      const brace = /^\s*\{/.exec(source.slice(commands.lastIndex));
      const end = argumentEnd(commands.lastIndex);
      if (brace && end > commands.lastIndex) {
        const contentStart = commands.lastIndex + brace[0].length;
        const contentEnd = source.lastIndexOf('}', end - 1);
        if (contentEnd >= contentStart) result.texttt.push([contentStart, contentEnd]);
      }
    }
    if (/^(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)$/.test(command)) kind = command as SpanKind;
    else if (/^(label|hypertarget)$/.test(command)) kind = 'label';
    else if (/^(ref|pageref|eqref|autoref|Autoref|cref|Cref|cpageref|Cpageref|vref|Vref|nameref|hyperref|subref|subref\*|refrange|crefrange|Crefrange)$/.test(command)) kind = 'reference';
    else if (/cite/i.test(command) || /^(bibentry|nocite)$/.test(command)) kind = 'citation';
    else if (/^(caption|captionof|subcaption)$/.test(command)) kind = 'caption';
    if (kind) result[kind].push([start, argumentEnd(commands.lastIndex)]);
  }
  if (documentStart !== null && documentStart > 0) result.preamble.push([0, documentStart]);
  result.unsafeUnderscore = unsafeUnderscores(text, source, result.code);
  result.unclosed = unclosedRanges(text, source, result.code);
  return result;
}
