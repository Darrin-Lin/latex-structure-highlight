import * as vscode from 'vscode';
import { computeListingLines } from './listing-parser';
import type { Span, SourceMask } from './types';
export function createListingNumbers(context: vscode.ExtensionContext, visibleSource: SourceMask) {
  const left = vscode.window.createTextEditorDecorationType({ before: { color: new vscode.ThemeColor('editorLineNumber.foreground'), margin: '0 1.2em 0 0', textDecoration: 'none; display: inline-block; min-width: 3ch; text-align: right;' }, rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed });
  const right = vscode.window.createTextEditorDecorationType({ after: { color: new vscode.ThemeColor('editorLineNumber.foreground'), margin: '0 0 0 2em' }, rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed });
  context.subscriptions.push(left, right);
  return {
    update(editor: vscode.TextEditor, codeSpans: Span[], config: vscode.WorkspaceConfiguration) {
      const lines = config.get('enabled', true) && config.get('listingLineNumbers', true) ? computeListingLines(editor.document.getText(), codeSpans, visibleSource) : [];
      for (const [side, type] of [['left', left], ['right', right]] as const) {
        editor.setDecorations(type, lines.filter(line => line.side === side).map(line => {
          const position = editor.document.positionAt(side === 'left' ? line.at : line.end);
          return { range: new vscode.Range(position, position), renderOptions: { [side === 'left' ? 'before' : 'after']: { contentText: line.number || ' ' } } };
        }));
      }
    }
  };
}
