import * as vscode from 'vscode';
import { analyze, visibleSource } from './analyzer';
import { createAppearance } from './appearance';
import { createListingNumbers } from './listing-lines';
import { activateNumbers } from './numbers';
import type { Analysis } from './types';

export function activate(context: vscode.ExtensionContext): void {
  const appearance = createAppearance(context);
  function update(editor: vscode.TextEditor): void {
    if (!editor || !['latex', 'tex'].includes(editor.document.languageId)) return;
    const config = vscode.workspace.getConfiguration('latexStructureHighlight', editor.document.uri);
    const spans: Partial<Analysis> = config.get('enabled', true) ? analyze(editor.document.getText()) : {};
    const types = appearance.forDocument(editor.document);
    for (const [name, type] of Object.entries(types)) {
      let offsets = spans[name as keyof Analysis] || [];
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
  let timer: ReturnType<typeof setTimeout> | undefined;
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
  const listingNumbers = createListingNumbers(context, visibleSource);
  refresh();
  activateNumbers(context, analyze);
}
