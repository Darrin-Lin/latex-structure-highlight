# LaTeX Structure Highlight

[English](README.md) · [繁體中文](README.zh-TW.md)

Find headings, environments and references faster in VS Code. LaTeX Structure
Highlight adds configurable colors, compiled-number hints and visual warnings
to your LaTeX source without changing the document or its PDF output.

This extension is tailored to the author's personal LaTeX editing preferences.
Its palettes and visual checks may not suit every document or workflow. Treat
warnings as editing aids and confirm errors with your LaTeX compiler; a lack of
warnings does not guarantee that a document is valid.

## Features

- Distinct colors for headings, from `\part` and `\chapter` to `\subparagraph`.
- Emphasized `\begin`/`\end`, captions, labels, cross-references and citations.
- Separate colors for `\texttt{...}`, a dimmed preamble and subtle code backgrounds.
- Actual heading, figure, table and reference numbers above source lines after compilation.
- `lstlisting` line-number previews using global, style and per-block settings.
- Red underlines for unescaped text underscores and unmatched environments or delimiters.
- Six highlight palettes, individual color overrides, and English/Traditional Chinese UI.

## Install

Requires **VS Code 1.90 or later**. Install a LaTeX language extension, such as
LaTeX Workshop, to provide the underlying syntax highlighting. A TeX distribution
is needed to compile documents and generate number data.

1. Obtain the extension's `.vsix` package. To build one yourself, see [Contributing](CONTRIBUTING.md).
2. In VS Code, open **Extensions → … → Install from VSIX…** and select the package.
3. Run **Developer: Reload Window** if prompted, then open a `.tex` file.

## Get started

Colors and warnings appear automatically. Compile your document to populate
number hints; references may require a second compilation.

Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux):

| Command | Action |
| --- | --- |
| **LaTeX: Select Highlight Color Scheme** | Choose a palette |
| **LaTeX: Toggle Actual Numbers** | Show or hide compiled-number hints |
| **LaTeX: Select Compiled AUX File** | Locate number data when automatic detection fails |
| **LaTeX: Apply Embedded Code Text Color** | Apply the selected base color to embedded code |

The interface follows VS Code's display language by default.

### Choose colors

Available palettes: `githubDark`, `githubLight`, `dracula`, `nord`,
`solarizedDark`, and `solarizedLight`. The default `auto` follows the editor's
light/dark appearance. Palettes style the LaTeX highlights while keeping your
editor theme.

For custom colors, add settings such as:

```json
{
  "latexStructureHighlight.colorScheme": "githubDark",
  "latexStructureHighlight.colors": {
    "section": "#79C0FF",
    "subsection": "#7EE787",
    "texttt": "#A5D6FF",
    "codeText": "#A5D6D9"
  }
}
```

Use `#RRGGBB` or `#RRGGBBAA`. VS Code's Settings editor lists the available color
keys and options for preamble dimming, code backgrounds and number hints.

After changing palettes or `codeText`, run **Apply Embedded Code Text Color** to
update the code base color. Specific keyword/string/comment colors can take
precedence. This command saves a rule named `LaTeX embedded code base text` in
your user token-color settings; remove that rule to undo it.

### Show compiled numbers

Number hints use the last compilation's AUX/BBL data. The extension follows
`% !TeX root = ...` and LaTeX Workshop's output-directory setting. For a custom
build location, use **Select Compiled AUX File** to choose the root `.aux` file.

Enable VS Code's `editor.codeLens` setting if hints are not visible. Recompile
when hints show a stale-data warning. Starred headings remain unnumbered;
paragraph numbering follows your document's `secnumdepth`.

### Preview listing line numbers

Specify the language on the block to enable the installed grammar's syntax colors:

```latex
\begin{lstlisting}[language=Python,numbers=left,firstnumber=10]
def greet(name):
    print(name)
\end{lstlisting}
```

Number previews also read `\lstset` and `\lstdefinestyle` in the current file.
Supported options include `numbers`, `firstnumber` (`auto`, `last` or a number),
`stepnumber`, `numberfirstline`, `numberblanklines`, and named-listing continuation.

## Examples

- [English document](examples/sample-en.tex)
- [繁體中文文件](examples/sample-zh-TW.tex)
- [Sample compilation guide](examples/README.md)
- Intentional warning examples: [English](examples/warnings-en.tex) / [繁體中文](examples/warnings-zh-TW.tex). Open these in the editor; do not compile them.

## Limitations

- Visual checks inspect one file without expanding TeX macros or custom catcodes. They complement compiler diagnostics.
- Escaped `\_`, standard math, literal code and common identifier/URL arguments are excluded from underscore warnings. Inside ordinary `\texttt`, write `\_` for a literal underscore.
- Compiled numbers require existing build data. Not every author/year citation style or stale cross-file dependency can be resolved.
- Listing previews do not reproduce TeX fonts, spacing, macro-defined options or external settings. Blocks using `firstline`, `lastline` or `linerange` skip line-number previews. Right-side numbers follow each source line rather than the PDF margin.

## Privacy and license

The extension sends no network requests or telemetry. It reads local compiler
output and stores selected AUX paths in extension workspace state. The explicit
code-color command changes your user settings; uninstalling does not remove that rule.

The original project code is licensed under the [MIT License](LICENSE). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for palette attribution.
The palettes are inspired adaptations, without affiliation or endorsement by
GitHub, Dracula, Nord or Solarized.
