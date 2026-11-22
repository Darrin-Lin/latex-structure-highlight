import * as vscode from 'vscode';
import * as path from 'node:path';
import { enumerationItems } from './enumeration';
import { translator } from './i18n';
import { parseCompiled, group, clean } from './compiled-data';
import type { Analysis, Analyzer, CompiledData } from './types';
interface NumberItem { kind: string; start: number; end: number; title: string; number: string | null; id: string; preview?: boolean }
interface NumberModel { items: NumberItem[]; aux?: string; missing?: boolean; stale?: boolean; error?: boolean }
interface CompiledOutput { data: CompiledData; aux: string; stale: boolean; missing?: false }
interface MissingOutput { missing: true; aux: string }

export function activateNumbers(context: vscode.ExtensionContext, analyze: Analyzer): void {
  const change = new vscode.EventEmitter<void>();
  const auxOverrides = new Map(Object.entries(context.workspaceState.get<Record<string, string>>('auxOverrides', {})));
  const cache = new Map<string, { version: number; promise: Promise<NumberModel> }>();
  const watched = new Set<string>();
  const selector = [{ language: 'latex' }, { language: 'tex' }];
  const config = (doc: vscode.TextDocument) => vscode.workspace.getConfiguration('latexStructureHighlight', doc.uri);
  function refresh() { cache.clear(); change.fire(); }
  function watch(file: string): void {
    if (watched.has(file)) return;
    watched.add(file);
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(path.dirname(file), path.basename(file)));
    context.subscriptions.push(watcher, watcher.onDidChange(refresh), watcher.onDidCreate(refresh), watcher.onDidDelete(refresh));
  }
  async function exists(file: string): Promise<vscode.FileStat | null> {
    try { return await vscode.workspace.fs.stat(vscode.Uri.file(file)); } catch { return null; }
  }
  async function read(file: string): Promise<string> { return Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.file(file))).toString('utf8'); }
  async function locate(doc: vscode.TextDocument): Promise<{ aux: string; root: string }> {
    const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
    const base = folder ? folder.uri.fsPath : path.dirname(doc.uri.fsPath);
    const explicit = auxOverrides.get(doc.uri.toString()) || config(doc).get('auxFile', '');
    if (explicit) return { aux: path.resolve(base, explicit), root: doc.uri.fsPath };
    let root = doc.uri.fsPath, content = doc.getText();
    const visited = new Set<string>();
    // Follow explicit TeX root directives without guessing an unrelated master file.
    for (let i = 0; i < 8 && !visited.has(root); i++) {
      visited.add(root);
      const directive = /^\s*%\s*!\s*tex\s+root\s*=\s*(.+?)\s*$/im.exec(content);
      if (!directive) break;
      root = path.resolve(path.dirname(root), directive[1].replace(/^['"]|['"]$/g, ''));
      try { content = await read(root); } catch { break; }
    }
    const dir = path.dirname(root), stem = path.basename(root, path.extname(root));
    const workshop = vscode.workspace.getConfiguration('latex-workshop', doc.uri);
    const outDir = workshop.get('latex.outDir', '%DIR%');
    const configuredDir = outDir.replace(/%DIR%/g, dir).replace(/%DOC%/g, root.slice(0, -path.extname(root).length)).replace(/%DOCFILE%/g, stem).replace(/%WORKSPACE_FOLDER%/g, base);
    const candidates = [path.resolve(dir, configuredDir, stem + '.aux'), path.join(dir, stem + '.aux'), path.join(dir, 'out', stem + '.aux'), path.join(dir, 'build', stem + '.aux')];
    for (const aux of [...new Set(candidates)]) if (await exists(aux)) return { aux, root };
    return { aux: candidates[0], root };
  }
  async function load(doc: vscode.TextDocument): Promise<CompiledOutput | MissingOutput> {
    const { aux, root } = await locate(doc);
    watch(aux);
    watch(aux.replace(/\.aux$/i, '.bbl'));
    const stat = await exists(aux);
    if (!stat) return { missing: true, aux };
    const data = parseCompiled('');
    const seen = new Set<string>();
    async function readAux(file: string, depth = 0): Promise<void> {
      if (seen.has(file) || depth > 12 || seen.size > 100) return;
      seen.add(file);
      watch(file);
      try {
        const part = parseCompiled(await read(file));
        for (const [key, value] of part.labels) data.labels.set(key, value);
        for (const [key, value] of part.citations) data.citations.set(key, value);
        data.entries.push(...part.entries);
        for (const input of part.inputs) await readAux(path.resolve(path.dirname(aux), input), depth + 1);
      } catch { /* A failed or partial build may leave an input AUX missing. */ }
    }
    await readAux(aux);
    for (const suffix of ['.bbl']) {
      try { parseCompiled(await read(aux.replace(/\.aux$/i, suffix)), data); } catch { /* Optional bibliography output. */ }
    }
    const rootStat = await exists(root), docStat = await exists(doc.uri.fsPath);
    return { data, aux, stale: doc.isDirty || !!(rootStat && rootStat.mtime > stat.mtime) || !!(docStat && docStat.mtime > stat.mtime) };
  }
  async function model(doc: vscode.TextDocument): Promise<NumberModel> {
    const key = doc.uri.toString();
    const previous = cache.get(key);
    if (previous && previous.version === doc.version) return previous.promise;
    const promise = makeModel(doc);
    cache.set(key, { version: doc.version, promise });
    try { return await promise; } catch { cache.delete(key); return { items: [], error: true }; }
  }
  async function makeModel(doc: vscode.TextDocument): Promise<NumberModel> {
    const compiled = await load(doc);
    const data = compiled.missing ? parseCompiled('') : compiled.data;
    const text = doc.getText(), spans = analyze(text), items: NumberItem[] = [], counts = new Map<string, number>();
    const entries = data.entries;
    const usedEntries = new Set<number>();
    function add(kind: string, start: number, end: number, title: string, number: string | null): void {
      const identity = `${kind}:${title}`;
      const occurrence = counts.get(identity) || 0;
      counts.set(identity, occurrence + 1);
      items.push({ kind, start, end, title, number, id: `${doc.uri.toString()}|${identity}|${occurrence}` });
    }
    function argumentsAt(start: number, end: number): { raw: string; arg: string } {
      const raw = text.slice(start, end);
      const command = /^\\[A-Za-z@]+\*?/.exec(raw);
      let at = command ? command[0].length : 0;
      // The main analyzer already balances arguments; optional notes aren't reference keys.
      while (at < raw.length && /\s/.test(raw[at])) at++;
      while (raw[at] === '[') {
        let depth = 1; at++;
        while (at < raw.length && depth) { if (raw[at] === '[') depth++; if (raw[at] === ']') depth--; at++; }
        while (at < raw.length && /\s/.test(raw[at])) at++;
      }
      const arg = group(raw, at);
      return { raw, arg: arg ? arg.value : '' };
    }
    for (const kind of ['part', 'chapter', 'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph', 'caption']) {
      for (const [start, end] of spans[kind as keyof Analysis]) {
        const { raw, arg } = argumentsAt(start, end);
        if (/^\\\w+\*/.test(raw)) continue; // Starred commands are intentionally unnumbered.
        const title = clean(arg);
        let candidate = entries.findIndex((entry, i) => !usedEntries.has(i) && (kind === 'caption' ? ['figure', 'table'].includes(entry.kind) : entry.kind === kind) && entry.title === title);
        // Labels identify headings/captions with an optional short title or TeX formatting.
        const following = text.slice(end, end + 250);
        const nearbyLabel = /^\s*(?:%[^\n]*\n\s*)*\\label\s*\{([^}]+)\}/.exec(following);
        const labeled = nearbyLabel && data.labels.get(nearbyLabel[1]);
        let number = labeled ? labeled.number : candidate !== -1 ? entries[candidate].number : null;
        if (candidate !== -1) usedEntries.add(candidate);
        let labelKind = kind;
        if (kind === 'caption') labelKind = labeled && /^table/.test(labeled.anchor) ? 'Table' : candidate !== -1 ? entries[candidate].kind === 'table' ? 'Table' : 'Figure' : 'Caption';
        add(labelKind, start, end, title, number);
      }
    }
    for (const kind of ['label', 'reference', 'citation']) {
      for (const [start, end] of spans[kind as keyof Analysis]) {
        const { raw, arg } = argumentsAt(start, end);
        const keys = arg.split(',').map(key => key.trim()).filter(Boolean);
        if (!keys.length) continue;
        const values = keys.map(key => {
          if (kind === 'citation') return data.citations.get(key) || '?';
          const label = data.labels.get(key);
          if (!label) return '?';
          if (/^\\(?:pageref|cpageref|Cpageref|vpageref)/.test(raw)) return label.page;
          if (/^\\nameref/.test(raw)) return label.title || '?';
          const category = label.anchor.split('.')[0];
          const prefix = /^(figure|table|section|subsection|subsubsection|chapter|equation)$/.test(category) ? category[0].toUpperCase() + category.slice(1) + ' ' : '';
          return (/^\\(?:auto|Auto|c|C)ref/.test(raw) ? prefix : '') + label.number;
        });
        add(kind, start, end, arg, values.every(value => value === '?') ? null : kind === 'citation' ? '[' + values.join(', ') + ']' : values.join(', '));
      }
    }
    for (const item of enumerationItems(text, data)) {
      add('enumeration', item.start, item.end, '', item.number);
      items[items.length - 1].preview = !item.compiled;
    }
    return { ...compiled, items };
  }
  const enabled = (doc: vscode.TextDocument) => config(doc).get('enabled', true);
  const showNumbers = (doc: vscode.TextDocument) => enabled(doc) && config(doc).get('showNumbers', true);
  function tooltip(item: NumberItem, result: NumberModel, doc: vscode.TextDocument): string {
    const t = translator(vscode, doc);
    return `${t('kind.' + item.kind)}: ${item.number || t('missingNumber')}\n${item.title}\n${item.preview ? t('enumerationPreview') : result.stale ? '⚠ ' + t('stale') : t('compiled')}`;
  }
  const provider: vscode.CodeLensProvider = {
    onDidChangeCodeLenses: change.event,
    async provideCodeLenses(doc, token) {
      if (!showNumbers(doc)) return [];
      const t = translator(vscode, doc);
      const result = await model(doc);
      if (token.isCancellationRequested) return [];
      const missingLens = result.missing ? [new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), { title: t('missingAux'), command: 'latexStructureHighlight.selectAux', arguments: [doc.uri] })] : [];
      return [...missingLens, ...result.items.filter(item => !result.missing || item.preview).map(item => {
        const position = doc.positionAt(item.start);
        const label = item.number || t('missingNumber');
        return new vscode.CodeLens(new vscode.Range(position, position), { title: `${!item.preview && result.stale ? '⚠ ' : ''}${label}`, tooltip: tooltip(item, result, doc), command: '' });
      })];
    }
  };
  context.subscriptions.push(change, vscode.languages.registerCodeLensProvider(selector, provider));
  context.subscriptions.push(vscode.languages.registerHoverProvider(selector, {
    async provideHover(doc, position, token) {
      if (!enabled(doc)) return;
      const result = await model(doc);
      if (token.isCancellationRequested || !result.items) return;
      const offset = doc.offsetAt(position);
      const item = result.items.find(item => offset >= item.start && offset <= item.end);
      if (!item) return;
      const message = new vscode.MarkdownString();
      message.appendText(tooltip(item, result, doc));
      return new vscode.Hover(message, new vscode.Range(doc.positionAt(item.start), doc.positionAt(item.end)));
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('latexStructureHighlight.toggleNumbers', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    await config(editor.document).update('showNumbers', !config(editor.document).get('showNumbers', true), vscode.ConfigurationTarget.Global);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('latexStructureHighlight.selectAux', async uri => {
    const doc = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    if (!doc) return;
    const selected = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { [translator(vscode, doc)('auxFilter')]: ['aux'] }, openLabel: translator(vscode, doc)('useAux') });
    if (!selected || !selected[0]) return;
    auxOverrides.set(doc.uri.toString(), selected[0].fsPath);
    await context.workspaceState.update('auxOverrides', Object.fromEntries(auxOverrides));
    refresh();
  }));
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.{aux,bbl,toc,lof,lot}');
  context.subscriptions.push(watcher, watcher.onDidChange(refresh), watcher.onDidCreate(refresh), watcher.onDidDelete(refresh));
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(refresh));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(refresh));
  let timer: ReturnType<typeof setTimeout> | undefined;
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => { clearTimeout(timer); timer = setTimeout(refresh, 200); }));
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration('latexStructureHighlight') || event.affectsConfiguration('latex-workshop.latex.outDir')) refresh(); }));
  context.subscriptions.push({ dispose() { clearTimeout(timer); } });
}
