import type * as vscode from 'vscode';
import en from '../locales/en.json';
import zh from '../locales/zh-TW.json';
export function locale(requested = 'auto', editorLanguage = 'en') {
  const value = requested === 'auto' ? editorLanguage : requested;
  return /^zh(?:-|$)/i.test(value) ? 'zh-TW' : 'en';
}
export function translate(key: string, requested = 'auto', editorLanguage = 'en'): string {
  const messages: Readonly<Record<string, string>> = locale(requested, editorLanguage) === 'zh-TW' ? zh : en;
  return messages[key] || (en as Readonly<Record<string, string>>)[key] || key;
}
export function translator(vscode: typeof import('vscode'), document?: vscode.TextDocument) {
  return (key: string) => translate(key, vscode.workspace.getConfiguration('latexStructureHighlight', document && document.uri).get('language', 'auto'), vscode.env.language);
}
