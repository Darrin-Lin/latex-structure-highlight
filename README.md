# LaTeX Structure Highlight

[English](README.md) · [繁體中文](README.zh-TW.md)

Make LaTeX source easier to scan in VS Code with heading colors, environment
markers, reference colors, code backgrounds, compiled-number hints, and warnings.
It changes the **editor display**, not your source or PDF. It complements your
installed LaTeX language extension; no grammar or compiler is bundled.

This is a local development draft, not a published Marketplace release.

## Try the bilingual samples

- [English document](examples/sample-en.tex): compile twice with pdfLaTeX.
- [Traditional Chinese document](examples/sample-zh-TW.tex): compile twice with XeLaTeX.
- [English warning snippets](examples/warnings-en.tex) / [中文警示片段](examples/warnings-zh-TW.tex): intentionally invalid; **do not compile**.

Open this folder in VS Code and press **F5** to launch an Extension Development
Host with the English sample. Open the Chinese sample there to compare features.
No runtime npm dependencies are required. Development requires Node.js 20+ and
Python 3.9+. Run `npm run check`, `npm test`, then `npm run package` to produce a
local VSIX under `dist/`. These commands need no npm package installation.

From the repository root:

```sh
mkdir -p examples/build
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
```

The Chinese sample requires `ctex` and an installed Traditional Chinese font.
It tries **Noto Serif CJK TC**, **Noto Serif TC**, then macOS **PingFang TC**.
Install one of the Noto families on other platforms; font files are not bundled.
Both samples use an inline bibliography and a drawn placeholder,
so BibTeX/Biber and external images are unnecessary. Recompile after changes to
update references.

For this output folder, run **LaTeX: Select Compiled AUX File** and select
`examples/build/sample-en.aux` or `examples/build/sample-zh-TW.aux` for the
corresponding source file. If a packaged VSIX is provided, use **Extensions → … →
Install from VSIX…**, then **Developer: Reload Window**.

## Features

| Source | Editor display |
| --- | --- |
| `\part`, `\chapter`, `\section` through `\subparagraph` | Different colors and bold text for heading levels |
| `\begin` / `\end` | Emphasized delimiters; figure, table and common math environments have dedicated colors |
| `\caption`, `\label`, reference and citation commands | Distinct caption, identifier, cross-reference and citation colors |
| `\texttt{...}` | Separate inline text color |
| Preamble before `\begin{document}` | Dimmed; default opacity 58% |
| Literal code blocks | Subtle backgrounds; native grammar supplies syntax colors |
| Unescaped `_` in ordinary text | Red text, background and underline |
| Unmatched environments, groups and math delimiters | Red text, background and underline |

Escaped `\_`, standard math, comments, literal code, and common reference/URL/file
arguments are excluded from underscore warnings. `\texttt` does not make a raw
underscore legal: write `\texttt{data\_file.csv}`.

## Color schemes

Run **LaTeX: Select Highlight Color Scheme**, or set
`latexStructureHighlight.colorScheme` to `auto`, `githubDark`, `githubLight`,
`dracula`, `nord`, `solarizedDark`, or `solarizedLight`.

`auto` follows the editor light/dark appearance. These are **inspired palettes**
for LaTeX decorations, not replacements for the complete VS Code theme.

```json
{
  "latexStructureHighlight.colorScheme": "githubDark",
  "latexStructureHighlight.preambleOpacity": 0.58,
  "latexStructureHighlight.colors": {
    "section": "#79C0FF",
    "subsection": "#7EE787",
    "texttt": "#A5D6FF",
    "codeText": "#A5D6D9",
    "error": "#FF7B72"
  }
}
```

Overrides accept `#RRGGBB` or `#RRGGBBAA`. Keys: `part`, `chapter`, `section`,
`subsection`, `subsubsection`, `paragraph`, `subparagraph`, `environment`,
`figure`, `table`, `math`, `caption`, `label`, `reference`, `citation`, `texttt`,
`codeText`, `codeBackground`, `error`, and `errorBackground`.

After choosing a palette or changing `codeText`, run **LaTeX: Apply Embedded Code
Text Color** to apply the code base color. This explicit command updates a named
LaTeX-only rule in user-level `editor.tokenColorCustomizations`, preserving other
rules. More specific syntax colors can take precedence. Switching palettes alone
does not rewrite that rule. Remove `LaTeX embedded code base text` to undo it.

## Actual compiled numbers

Numbers appear as CodeLens **above source lines**, for example `3.1`, without a
heading-type prefix. They stay visible; there is no individual collapse or
double-click interaction. Hover previews are available.

- **LaTeX: Toggle Actual Numbers** switches all number hints on/off.
- **LaTeX: Select Compiled AUX File** selects the compiled root AUX manually.
- VS Code's `editor.codeLens` must be enabled.

The extension reads the last compilation's root/included AUX and optional BBL.
It follows `% !TeX root = ...` and LaTeX Workshop's output-folder setting, with
nearby `out`/`build` fallbacks. Figure/table numbers appear on caption and label
lines. No numbers are guessed when data are missing; starred headings are skipped.
Paragraph numbering depends on the document's `secnumdepth`; the samples use `5`.

Bibliography support includes classic numeric `bibcite`, natbib stored labels,
and biblatex BBL records containing `labelnumber`. It does not reproduce every
author/year style. Source newer than the root AUX is flagged, but other stale
project dependencies may go undetected.

## Listing line numbers

The current-file preview reads literal `\lstdefinestyle`, `\lstset`, `style=...`
and local block options. It supports `numbers=left|right|none`, numeric
`firstnumber`, `firstnumber=auto|last`, `stepnumber`, `numberfirstline`,
`numberblanklines`, and same-name continuation. Local options override preceding
global/style values. Declare the language on the block, such as
`\begin{lstlisting}[language=Python]`, for grammar-based syntax colors.

Numbers are beside code, separate from source-file gutter numbers. Right-side
numbers follow each line's text, not the PDF right margin. Font, `numberstyle`,
`numbersep`, TeX scoping, macros, external settings and custom counter formats
are not reproduced. Blocks using `firstline`, `lastline`, or `linerange` skip
this preview. Use displayed blocks with the header before the first code line.

## Settings and language

All setting names below have the prefix `latexStructureHighlight.`.

| Suffix | Default | Purpose |
| --- | --- | --- |
| `enabled` | `true` | Decorations and number hints |
| `dimPreamble` | `true` | Preamble dimming |
| `preambleOpacity` | `0.58` | Preamble opacity (`0.1`–`1`) |
| `codeBackground` | `true` | Code backgrounds |
| `listingLineNumbers` | `true` | Listing line-number preview |
| `showNumbers` | `true` | Compiled-number CodeLens |
| `auxFile` | `""` | Explicit root AUX path |
| `colorScheme` | `"auto"` | Palette |
| `colors` | `{}` | Individual color overrides |

English and Traditional Chinese translations are included. UI labels and prompts
follow VS Code's display language by default; no separate language selection is
required. Source text and numbering are not translated. The draft retains an
advanced runtime `language` override; static command/settings labels still follow
VS Code's language.

## Limits and privacy

Unclosed checks cover environments, braces, `$`/`$$`, `\(`/`\)`, `\[`/`\]`,
`\left`/`\right`, explicit grouping commands and `\verb`. They inspect one file
without macro expansion, conditional compilation or catcode evaluation.
Constructs deliberately split across files may be flagged. These visual checks
are not a substitute for compiler diagnostics.

The runtime sends no network requests or telemetry. It reads local compiler
output and stores selected AUX paths in extension workspace state. Decorations
do not edit source. The explicit code-color command changes the user setting
described above; uninstalling does not remove that user token-color rule.

## License and attribution

Original code is private and `UNLICENSED`; see [LICENSE](LICENSE). Upstream
palette licenses remain intact; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
This is not an official GitHub, Dracula, Nord, or Solarized theme.
