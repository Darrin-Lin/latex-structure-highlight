'use strict';
const vscode = require('vscode');

// Build an offset-preserving view without comments, escaped commands or inline verbatim.
function visibleSource(text) {
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

function analyze(text) {
  const source = visibleSource(text);
  const result = { preamble: [], code: [], environment: [], figure: [], table: [], math: [], caption: [], label: [], reference: [], citation: [], part: [], chapter: [], section: [], subsection: [], subsubsection: [], paragraph: [], subparagraph: [], texttt: [], unsafeUnderscore: [] };
  const commands = /\\([A-Za-z@]+)(\*)?/g;
  let codeEnvironment = null;
  let codeStart = 0;
  let documentStart = null;
  let match;
  function argumentEnd(start) {
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
      let kind = /^(figure|subfigure)\*?$/.test(name) ? 'figure' : /^(table|tabular|tabularx|longtable|subtable)\*?$/.test(name) ? 'table' : /^(equation|align|alignat|gather|multline|displaymath|math|eqnarray)\*?$/.test(name) ? 'math' : 'environment';
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
    let kind;
    if (command === 'texttt') {
      const brace = /^\s*\{/.exec(source.slice(commands.lastIndex));
      const end = argumentEnd(commands.lastIndex);
      if (brace && end > commands.lastIndex) {
        const contentStart = commands.lastIndex + brace[0].length;
        const contentEnd = source.lastIndexOf('}', end - 1);
        if (contentEnd >= contentStart) result.texttt.push([contentStart, contentEnd]);
      }
    }
    if (/^(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)$/.test(command)) kind = command;
    else if (/^(label|hypertarget)$/.test(command)) kind = 'label';
    else if (/^(ref|pageref|eqref|autoref|Autoref|cref|Cref|cpageref|Cpageref|vref|Vref|nameref|hyperref|subref|subref\*|refrange|crefrange|Crefrange)$/.test(command)) kind = 'reference';
    else if (/cite/i.test(command) || /^(bibentry|nocite)$/.test(command)) kind = 'citation';
    else if (/^(caption|captionof|subcaption)$/.test(command)) kind = 'caption';
    if (kind) result[kind].push([start, argumentEnd(commands.lastIndex)]);
  }
  if (documentStart !== null && documentStart > 0) result.preamble.push([0, documentStart]);
  result.unsafeUnderscore = require('./text-details').unsafeUnderscores(text, source, result.code);
  result.unclosed = require('./unclosed').unclosedRanges(text, source, result.code);
  return result;
}

function activate(context) {
  const appearance = require('./appearance').createAppearance(context);
  function update(editor) {
    if (!editor || !['latex', 'tex'].includes(editor.document.languageId)) return;
    const config = vscode.workspace.getConfiguration('latexStructureHighlight', editor.document.uri);
    const spans = config.get('enabled', true) ? analyze(editor.document.getText()) : {};
    const types = appearance.forDocument(editor.document);
    for (const [name, type] of Object.entries(types)) {
      let offsets = spans[name] || [];
      if (name === 'preamble' && !config.get('dimPreamble', true)) offsets = [];
      if (name === 'code' && !config.get('codeBackground', true)) offsets = [];
      const ranges = offsets.map(([a, b]) => {
        // Do not shade the closing delimiter's line with the code background.
        if (name === 'code' && b > a) b--;
        return new vscode.Range(editor.document.positionAt(a), editor.document.positionAt(b));
      });
      editor.setDecorations(type, ranges);
    }
    listingNumbers.update(editor, spans.code || [], config);
  }
  function refresh() { vscode.window.visibleTextEditors.forEach(update); }
  let timer;
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(refresh),
    vscode.workspace.onDidChangeTextDocument(event => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        refresh();
      }, 100);
    }),
    vscode.workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration('latexStructureHighlight')) { appearance.clear(); refresh(); } }),
    vscode.window.onDidChangeActiveColorTheme(() => { appearance.clear(); refresh(); }),
    { dispose() { clearTimeout(timer); } }
  );
  const listingNumbers = require('./listing-lines').createListingNumbers(context, visibleSource);
  refresh();
  require('./numbers').activateNumbers(context, analyze);
}
exports.activate = activate;
exports.analyze = analyze;
exports.visibleSource = visibleSource;
