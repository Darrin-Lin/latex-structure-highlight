import type { Span } from './types';
export function unsafeUnderscores(text: string, source: string, codeSpans: Span[]): Span[] {
  const result: Span[] = [];
  let dollar = '', delimiter = '', mathEnvs: string[] = [];
  const mathEnvironment = /^(?:math|displaymath|equation|align|alignat|flalign|gather|multline|eqnarray|IEEEeqnarray|split|aligned|alignedat|gathered|cases|array|[pbBvV]?matrix|smallmatrix)\*?$/;
  function argEnd(at: number, opening = '{', closing = '}'): number | null {
    while (at < source.length && /\s/.test(source[at])) at++;
    if (source[at] !== opening) return null;
    let depth = 1;
    for (let i = at + 1; i < source.length; i++) {
      if (source[i] === opening) depth++;
      if (source[i] === closing && --depth === 0) return i + 1;
    }
    return null;
  }
  for (let i = 0; i < text.length;) {
    const block = codeSpans.find(([start, end]) => i >= start && i < end);
    if (block) { i = block[1]; continue; }
    if (text[i] === '%' && source[i] === ' ') {
      const newline = text.indexOf('\n', i);
      i = newline === -1 ? text.length : newline + 1;
      continue;
    }
    if (text[i] === '\\') {
      const verb = /^\\verb\*?([^\sA-Za-z])/.exec(text.slice(i));
      if (verb) {
        const start = i + verb[0].length;
        const close = text.indexOf(verb[1], start), newline = text.indexOf('\n', start);
        i = close !== -1 && (newline === -1 || close < newline) ? close + 1 : newline === -1 ? text.length : newline;
        continue;
      }
      const next = text[i + 1];
      if (next === '(' || next === '[') { delimiter = next; i += 2; continue; }
      if ((next === ')' && delimiter === '(') || (next === ']' && delimiter === '[')) { delimiter = ''; i += 2; continue; }
      const command = /^\\([A-Za-z@]+)\*?/.exec(text.slice(i));
      if (!command) { i += 2; continue; } // Includes escaped underscore, dollar and double backslash.
      const name = command[1];
      let at = i + command[0].length;
      if (name === 'begin' || name === 'end') {
        const env = /^\s*\{([^{}]+)\}/.exec(source.slice(at));
        if (env && mathEnvironment.test(env[1])) {
          if (name === 'begin') mathEnvs.push(env[1]);
          else if (mathEnvs[mathEnvs.length - 1] === env[1]) mathEnvs.pop();
        }
      }
      // These arguments are identifiers or file/URL data, where literal underscores are valid.
      if (/^(?:label|ref|pageref|eqref|autoref|Autoref|cref|Cref|cpageref|Cpageref|vref|Vref|nameref|subref|url|path|href|hyperref|hypertarget|includegraphics|input|include|lstinputlisting|bibliography|addbibresource|detokenize|nolinkurl)$/.test(name) || /cite/i.test(name)) {
        let optional;
        while ((optional = argEnd(at, '[', ']')) !== null) at = optional;
        const end = argEnd(at);
        if (end !== null) { i = end; continue; }
      }
      i = at;
      continue;
    }
    if (text[i] === '$' && source[i] === '$') {
      const token = text[i + 1] === '$' && source[i + 1] === '$' ? '$$' : '$';
      if (!dollar) dollar = token;
      else if (dollar === token) dollar = '';
      i += token.length;
      continue;
    }
    if (source[i] === '_' && !dollar && !delimiter && mathEnvs.length === 0) result.push([i, i + 1]);
    i++;
  }
  return result;
}
