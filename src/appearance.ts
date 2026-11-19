import * as vscode from 'vscode';
import { palettes, resolvePalette, type Palette } from './palettes';
import { translator } from './i18n';
interface TokenRule { name?: string; scope?: string | string[]; settings?: Record<string, unknown> }
interface TokenColors { textMateRules?: TokenRule[]; [key: string]: unknown }
export function paletteFor(document?: vscode.TextDocument): Palette {
  const config = vscode.workspace.getConfiguration('latexStructureHighlight', document && document.uri);
  const light = [vscode.ColorThemeKind.Light, vscode.ColorThemeKind.HighContrastLight].includes(vscode.window.activeColorTheme.kind);
  return resolvePalette(config.get('colorScheme', 'auto'), light, config.get('colors', {}));
}
export function createAppearance(context: vscode.ExtensionContext) {
  const cache = new Map<string, Record<string, vscode.TextEditorDecorationType>>();
  function clear() {
    for (const types of cache.values()) Object.values(types).forEach(type => type.dispose());
    cache.clear();
  }
  context.subscriptions.push({ dispose: clear });
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(document => {
    const key = document.uri.toString(), types = cache.get(key);
    if (types) { Object.values(types).forEach(type => type.dispose()); cache.delete(key); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('latexStructureHighlight.selectTheme', async () => {
    const doc = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    const t = translator(vscode, doc);
    const choices = ['auto', ...Object.keys(palettes)].map(value => ({ label: t('scheme.' + value), value }));
    const selected = await vscode.window.showQuickPick(choices, { placeHolder: t('selectTheme') });
    if (!selected) return;
    const target = doc && vscode.workspace.getWorkspaceFolder(doc.uri) ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Global;
    await vscode.workspace.getConfiguration('latexStructureHighlight', doc && doc.uri).update('colorScheme', selected.value, target);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('latexStructureHighlight.applyCodeTextColor', async () => {
    const doc = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    const editor = vscode.workspace.getConfiguration('editor');
    const saved = editor.inspect<TokenColors>('tokenColorCustomizations');
    const custom = { ...(saved && saved.globalValue || {}) };
    const name = 'LaTeX embedded code base text';
    custom.textMateRules = [...(custom.textMateRules || []).filter(rule => rule.name !== name), {
      name, scope: ['text.tex.latex source', 'text.tex.latex meta.function.embedded.latex'], settings: { foreground: paletteFor(doc).codeText }
    }];
    await editor.update('tokenColorCustomizations', custom, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(translator(vscode, doc)('codeColorApplied'));
  }));
  return {
    clear,
    forDocument(document: vscode.TextDocument): Record<string, vscode.TextEditorDecorationType> {
      const key = document.uri.toString();
      if (cache.has(key)) return cache.get(key)!;
      const palette = paletteFor(document), types: Record<string, vscode.TextEditorDecorationType> = {};
      for (const [name, color] of Object.entries(palette)) {
        if (['codeText', 'codeBackground', 'error', 'errorBackground'].includes(name)) continue;
        types[name] = vscode.window.createTextEditorDecorationType({
          color,
          fontWeight: /^(part|chapter|section|subsection|subsubsection|paragraph|subparagraph|environment|figure|table|math)$/.test(name) ? 'bold' : 'normal',
          fontStyle: name === 'label' ? 'italic' : 'normal'
        });
      }
      const config = vscode.workspace.getConfiguration('latexStructureHighlight', document.uri);
      types.preamble = vscode.window.createTextEditorDecorationType({ opacity: String(config.get('preambleOpacity', 0.58)) });
      types.code = vscode.window.createTextEditorDecorationType({ isWholeLine: true, backgroundColor: palette.codeBackground });
      for (const name of ['unsafeUnderscore', 'unclosed']) {
        types[name] = vscode.window.createTextEditorDecorationType({ color: palette.error, backgroundColor: palette.errorBackground, fontWeight: 'bold', textDecoration: 'underline' });
      }
      cache.set(key, types);
      return types;
    }
  };
}
