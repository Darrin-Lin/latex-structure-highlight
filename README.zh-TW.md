# LaTeX Structure Highlight

[English](README.md) · [繁體中文](README.zh-TW.md)

讓 VS Code 中的 LaTeX 原始碼更容易閱讀：區分各層標題、環境、引用、等寬文字與
程式碼，並提供編譯編號、程式碼行號與未配對符號提示。

擴充套件只改變**編輯器顯示**，不修改原始碼或 PDF。語法高亮由另行安裝的 LaTeX
語言擴充套件提供，本專案不內建語法文法或編譯器。目前是本機開發草稿，尚未發布
到 Marketplace。

## 先試中英文範例

- [英文完整文件](examples/sample-en.tex)：使用 pdfLaTeX 編譯兩次。
- [繁體中文完整文件](examples/sample-zh-TW.tex)：使用 XeLaTeX 編譯兩次。
- [英文警示片段](examples/warnings-en.tex)／[中文警示片段](examples/warnings-zh-TW.tex)：刻意含錯誤，**請勿編譯**。

在 VS Code 開啟此資料夾，按 **F5** 啟動 Extension Development Host，會先開啟英文
範例，也可以在新視窗開啟中文範例。執行時不需要安裝 npm 相依套件。
開發環境需要 Node.js 20+ 與 Python 3.9+。依序執行 `npm run check`、`npm test`、
`npm run package`，會在 `dist/` 產生本機 VSIX，不需要先安裝 npm 套件。

從 repo 根目錄編譯：

```sh
mkdir -p examples/build
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-en.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=examples/build examples/sample-zh-TW.tex
```

中文範例需要 `ctex` 與已安裝的繁中字型，依序嘗試 **Noto Serif CJK TC**、
**Noto Serif TC**、macOS 的 **PingFang TC（蘋方－繁）**。
其他平台請安裝上述 Noto 字型之一；本專案不附帶字型檔。兩份文件使用
內文參考文獻與繪製的示意框，不需要 BibTeX、Biber 或外部圖片。修改後請再次編譯，
更新交叉引用。

上述指令使用自訂輸出位置，請執行 **LaTeX：選擇編譯後的 AUX 檔案**，為對應文件
選擇 `examples/build/sample-en.aux` 或 `examples/build/sample-zh-TW.aux`。
若取得打包的 VSIX，可用 **擴充套件 → … → 從 VSIX 安裝…** 安裝，再執行
**Developer: Reload Window**。

## 功能

| 原始碼元素 | 編輯器顯示 |
| --- | --- |
| `\part`、`\chapter`、`\section` 至 `\subparagraph` | 各層不同顏色與粗體 |
| `\begin`／`\end` | 強調起訖；圖、表及常見數學環境有個別配色 |
| `\caption`、`\label`、引用與文獻指令 | 分別標示圖說／表說、識別鍵、交叉引用與文獻引用 |
| `\texttt{...}` | 內文使用不同顏色 |
| `\begin{document}` 之前 | 淡化導言區，預設不透明度 58% |
| 字面程式碼區塊 | 淡底色，語言文法提供語法高亮 |
| 一般文字中未跳脫的 `_` | 紅色文字、淡紅底色與底線 |
| 未配對的環境、群組與數學分隔符號 | 紅色文字、淡紅底色與底線 |

`\_`、標準數學、註解、程式碼與常見引用鍵、網址、檔名參數會略過底線警示。
`\texttt` 不會讓原始 `_` 變合法，應寫成 `\texttt{data\_file.csv}`。

## 配色

執行 **LaTeX：選擇語法標示配色**，或設定 `latexStructureHighlight.colorScheme`：
`auto`、`githubDark`、`githubLight`、`dracula`、`nord`、`solarizedDark`、`solarizedLight`。

`auto` 依編輯器的深／淺色外觀切換。這些是 LaTeX 標示的**靈感配色**，不會取代
VS Code 的整體主題。

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

顏色接受 `#RRGGBB` 或 `#RRGGBBAA`。可覆寫的鍵為 `part`、`chapter`、`section`、
`subsection`、`subsubsection`、`paragraph`、`subparagraph`、`environment`、`figure`、
`table`、`math`、`caption`、`label`、`reference`、`citation`、`texttt`、`codeText`、
`codeBackground`、`error`、`errorBackground`。

選擇配色或修改 `codeText` 後，執行 **LaTeX：套用嵌入程式碼文字色**，才會套用
程式碼一般文字色。此指令在使用者層級的 `editor.tokenColorCustomizations` 更新
具名稱、只作用於 LaTeX 的規則，保留其他規則。更具體的語法配色仍可能優先。
單獨切換配色不會重寫此規則；移除 `LaTeX embedded code base text` 規則可復原。

## 編譯後的實際編號

編號以 CodeLens 顯示在**原始碼行上方**，例如 `3.1`，不加標題層級前綴。
編號持續顯示，不提供個別收起或雙擊恢復，也可用滑鼠預覽。

- **LaTeX：切換實際編號顯示**：切換所有編號提示。
- **LaTeX：選擇編譯後的 AUX 檔案**：手動指定主 AUX。
- VS Code 的 `editor.codeLens` 必須開啟。

擴充套件讀取上次編譯的主 AUX、被引用的 AUX 與可用的 BBL，沿用
`% !TeX root = ...` 與 LaTeX Workshop 輸出目錄設定，並嘗試附近的 `out`／`build`。
圖表編號顯示於圖說／表說與標籤所在行。缺少資料時不推算編號；星號標題會略過。
段落編號取決於文件本身的 `secnumdepth`，範例設定為 `5`。

支援傳統數字型 `bibcite`、natbib 儲存的標記，以及 BBL 含 `labelnumber` 的 biblatex；
不會完整重現所有作者／年份樣式。原始碼比主 AUX 新時會警示，其他跨檔相依資料的
過期狀態可能無法偵測。

## 程式碼行號

目前檔案的預覽讀取字面 `\lstdefinestyle`、`\lstset`、`style=...` 與區塊個別選項，
支援 `numbers=left|right|none`、數字型 `firstnumber`、`firstnumber=auto|last`、
`stepnumber`、`numberfirstline`、`numberblanklines` 與同名區塊接續編號。
個別區塊設定優先於前面的全域／style 設定。為方便語法文法辨識，也應在區塊指定
語言，例如 `\begin{lstlisting}[language=Python]`。

行號是區塊旁的提示，與原始檔左側行號分開。右側號碼接在各行文字後方，不對齊
PDF 右邊界。不重現字型、`numberstyle`、`numbersep`、TeX 作用域、巨集、外部設定
或自訂計數格式。含 `firstline`、`lastline` 或 `linerange` 的區塊略過預覽。
請使用一般展示型區塊，讓起始指令與選項在第一行程式碼之前結束。

## 設定與語言

以下設定名稱皆以前綴 `latexStructureHighlight.` 開頭。

| 尾碼 | 預設值 | 用途 |
| --- | --- | --- |
| `enabled` | `true` | 標示與編號提示 |
| `dimPreamble` | `true` | 導言區淡化 |
| `preambleOpacity` | `0.58` | 導言區不透明度（`0.1`–`1`） |
| `codeBackground` | `true` | 程式碼底色 |
| `listingLineNumbers` | `true` | 程式碼行號預覽 |
| `showNumbers` | `true` | 編譯編號 CodeLens |
| `auxFile` | `""` | 主 AUX 路徑 |
| `colorScheme` | `"auto"` | 配色 |
| `colors` | `{}` | 個別顏色覆寫 |

包含英文與繁體中文翻譯，預設提示、指令與設定說明跟隨 VS Code 的顯示語言，
不需要另外選語言。文件內文與編號不翻譯。此草稿仍保留進階執行時 `language`
覆寫設定；靜態指令與設定名稱仍依 VS Code 語言顯示。

## 限制與隱私

未閉合檢查涵蓋環境、大括號、`$`／`$$`、`\(`／`\)`、`\[`／`\]`、
`\left`／`\right`、明確的群組指令與 `\verb`。只檢查單一檔案，不展開巨集、
條件編譯或 catcode，刻意跨檔配對的結構可能被標示。不能取代編譯器診斷。

執行時不傳送網路請求或遙測資料，只讀取本機編譯輸出，將選定的 AUX 路徑存於
擴充套件工作區狀態。標示不修改原始碼；只有上述文字色指令會修改使用者設定。
解除安裝不會移除已明確套用的使用者文字色規則。

## 授權與來源

原始程式碼目前保留私人、`UNLICENSED` 狀態，詳見 [LICENSE](LICENSE)。
上游配色授權仍然有效，見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
本專案不是 GitHub、Dracula、Nord 或 Solarized 的官方主題。
