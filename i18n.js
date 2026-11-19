'use strict';
const en = require('./locales/en.json');
const zh = require('./locales/zh-TW.json');
function locale(requested = 'auto', editorLanguage = 'en') {
  const value = requested === 'auto' ? editorLanguage : requested;
  return /^zh(?:-|$)/i.test(value) ? 'zh-TW' : 'en';
}
function translate(key, requested, editorLanguage) {
  const messages = locale(requested, editorLanguage) === 'zh-TW' ? zh : en;
  return messages[key] || en[key] || key;
}
function translator(vscode, document) {
  return key => translate(key, vscode.workspace.getConfiguration('latexStructureHighlight', document && document.uri).get('language', 'auto'), vscode.env.language);
}
exports.locale = locale;
exports.translate = translate;
exports.translator = translator;
