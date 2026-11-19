export type Span = [start: number, end: number];
export type SpanKind = 'preamble' | 'code' | 'environment' | 'figure' | 'table' |
  'math' | 'caption' | 'label' | 'reference' | 'citation' | 'part' | 'chapter' |
  'section' | 'subsection' | 'subsubsection' | 'paragraph' | 'subparagraph' |
  'texttt' | 'unsafeUnderscore' | 'unclosed';
export type Analysis = Record<SpanKind, Span[]>;
export type Analyzer = (text: string) => Analysis;
export type SourceMask = (text: string) => string;
export interface Group { value: string; end: number }
export interface Label { number: string; page: string; title: string; anchor: string }
export interface ContentsEntry { kind: string; number: string; title: string }
export interface CompiledData {
  labels: Map<string, Label>;
  citations: Map<string, string>;
  entries: ContentsEntry[];
  inputs: string[];
}
export interface ListingLine { at: number; end: number; number: string; side: 'left' | 'right' }
