# Examples / 範例

| File / 檔案 | Engine / 編譯器 |
| --- | --- |
| [sample-en.tex](sample-en.tex) | pdfLaTeX |
| [sample-zh-TW.tex](sample-zh-TW.tex) | XeLaTeX |

Both documents demonstrate heading levels, inline monospaced text, references,
figures, tables, math, citations and listing line numbers. Compile twice to
resolve cross-references. The bibliography is inline; no external image files,
BibTeX or Biber are required.

兩份文件示範標題層級、等寬文字、交叉引用、圖表、數學、文獻與程式碼行號。
請編譯兩次更新引用，不需要外部圖片、BibTeX 或 Biber。

## Compile / 編譯

Run from the repository root / 從 repo 根目錄執行：

```sh
mkdir -p examples/build
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
```

The Chinese sample needs `ctex` and an installed Traditional Chinese font. It
tries **Noto Serif CJK TC**, **Noto Serif TC**, then macOS **PingFang TC**.
Font files are not bundled.

中文範例需要 `ctex` 與已安裝的繁中字型，依序嘗試 **Noto Serif CJK TC**、
**Noto Serif TC**、macOS 的 **PingFang TC（蘋方－繁）**，本專案不附帶字型檔。

For number hints, use **LaTeX: Select Compiled AUX File** and choose the
corresponding `examples/build/sample-en.aux` or `examples/build/sample-zh-TW.aux`.

要顯示編號提示，請執行 **LaTeX：選擇編譯後的 AUX 檔案**，選取上列對應的 AUX。

## Warning previews / 警示預覽

[English](warnings-en.tex) / [繁體中文](warnings-zh-TW.tex)

These snippets intentionally contain invalid LaTeX. Open them in the editor to
inspect warning colors. **Do not compile them.**

這些片段刻意包含錯誤，供觀察編輯器警示配色，**請勿編譯**。
