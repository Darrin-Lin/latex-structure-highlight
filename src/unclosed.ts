import type { Span } from './types';
interface Token { start: number; end: number; name?: string }
export function unclosedRanges(text: string, source: string, codeSpans: Span[]): Span[] {
  const errors: Span[] = [];
  const environments: Token[] = [], braces: Token[] = [], math: Token[] = [], groups: Token[] = [], left: Token[] = [];
  const add = (token: Token) => errors.push([token.start, token.end]);
  function close(stack: Token[], name: string, token: Token): void {
    const index = stack.map(item => item.name).lastIndexOf(name);
    if (index === -1) { add(token); return; }
    while (stack.length - 1 > index) add(stack.pop()!);
    stack.pop();
  }
  for (let i = 0; i < text.length;) {
    if (text[i] === '%' && source[i] === ' ') {
      const newline = text.indexOf('\n', i);
      i = newline === -1 ? text.length : newline + 1;
      continue;
    }
    if (text[i] === '\\') {
      const verb = /^\\verb\*?([^\sA-Za-z])/.exec(text.slice(i));
      if (verb) {
        const start = i + verb[0].length, end = text.indexOf(verb[1], start), newline = text.indexOf('\n', start);
        if (end !== -1 && (newline === -1 || end < newline)) i = end + 1;
        else { add({ start: i, end: start }); i = newline === -1 ? text.length : newline; }
        continue;
      }
      const delimiter = text[i + 1];
      const token: Token = { start: i, end: i + 2 };
      if (delimiter === '(' || delimiter === '[') { math.push({ ...token, name: delimiter }); i += 2; continue; }
      if (delimiter === ')' || delimiter === ']') { close(math, delimiter === ')' ? '(' : '[', token); i += 2; continue; }
      const command = /^\\([A-Za-z@]+)\*?/.exec(text.slice(i));
      if (!command) { i += 2; continue; }
      const name = command[1], at = i + command[0].length;
      token.end = at;
      if (/^(url|path|nolinkurl|detokenize|href)$/.test(name)) {
        let position = at;
        while (position < source.length && /\s/.test(source[position])) position++;
        if (source[position] === '{') {
          let depth = 1, end = position + 1;
          for (; end < source.length && depth; end++) {
            if (source[end] === '{') depth++;
            if (source[end] === '}') depth--;
          }
          if (!depth) { i = end; continue; }
        }
      }
      if (name === 'begin' || name === 'end') {
        const env = /^\s*\{([^{}\n]+)\}/.exec(source.slice(at));
        if (env) {
          token.end = at + env[0].length;
          token.name = env[1].trim();
          const block = codeSpans.find(([start]) => start === i);
          if (name === 'begin' && block) {
            // A code block is literal: its closing delimiter is searched in the original source.
            const escaped = token.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const ending = new RegExp('^\\\\end\\s*\\{' + escaped + '\\}').exec(text.slice(block[1]));
            if (ending) i = block[1] + ending[0].length;
            else { add(token); i = text.length; }
            continue;
          }
          if (name === 'begin') environments.push(token);
          else close(environments, token.name, token);
          i = token.end;
          continue;
        }
      } else if (name === 'begingroup' || name === 'bgroup') groups.push({ ...token, name: name === 'begingroup' ? 'group' : 'bgroup' });
      else if (name === 'endgroup' || name === 'egroup') close(groups, name === 'endgroup' ? 'group' : 'bgroup', token);
      else if (name === 'left') left.push({ ...token, name: 'left' });
      else if (name === 'right') close(left, 'left', token);
      i = at;
      continue;
    }
    if (source[i] === '{') braces.push({ start: i, end: i + 1 });
    else if (source[i] === '}') {
      if (braces.length) braces.pop(); else add({ start: i, end: i + 1 });
    } else if (source[i] === '$') {
      const name = source[i + 1] === '$' ? '$$' : '$';
      if (math.length && math[math.length - 1].name === name) math.pop();
      else math.push({ name, start: i, end: i + name.length });
      i += name.length;
      continue;
    }
    i++;
  }
  for (const stack of [environments, braces, math, groups, left]) stack.forEach(add);
  return errors.sort((a, b) => a[0] - b[0]);
}
