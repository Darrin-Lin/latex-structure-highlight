# LaTeX Structure Highlight

[English](README.md) · [繁體中文](README.zh-TW.md)

在 VS Code 中更快找到 LaTeX 標題、環境與引用。LaTeX Structure Highlight 提供
可自訂配色、編譯編號與視覺警示，不會修改文件內容或 PDF 輸出。

本擴充套件是依作者個人的 LaTeX 編輯習慣設計，配色與視覺檢查不一定適合所有文件
或工作流程。警示僅供編輯時參考，錯誤仍應以 LaTeX 編譯器的診斷為準；沒有出現
警示，也不代表文件一定正確。

## 功能

- 區分 `\part`、`\chapter` 至 `\subparagraph` 的標題層級。
- 強調 `\begin`／`\end`、圖說／表說、標籤、交叉引用與文獻引用。
- 為 `\texttt{...}` 分色、淡化導言區，並為程式碼加上淡底色。
- 編譯後，在原始碼上方顯示標題、圖表與引用的實際編號。
- 依全域、style 與區塊設定，預覽 `lstlisting` 行號。
- 以紅色底線標示文字中未跳脫的底線，以及未配對的環境或分隔符號。
- 六種標示配色、個別顏色覆寫，以及英文／繁體中文介面。

## 安裝

需要 **VS Code 1.90 以上版本**。請安裝 LaTeX Workshop 等 LaTeX 語言擴充套件，
提供底層語法上色。編譯文件及產生編號資料另需 TeX 發行版。

1. 取得擴充套件的 `.vsix` 安裝包；自行打包請參閱[貢獻指南](CONTRIBUTING.md)。
2. 在 VS Code 開啟 **擴充套件 → … → 從 VSIX 安裝…**，選擇安裝包。
3. 若出現提示，執行 **Developer: Reload Window**，再開啟 `.tex` 文件。

## 開始使用

開啟文件後即會套用配色與警示。編譯文件後顯示實際編號；交叉引用可能需要
再次編譯才能更新。

開啟命令選擇區：macOS 使用 `Cmd+Shift+P`，Windows／Linux 使用 `Ctrl+Shift+P`。

| 指令 | 用途 |
| --- | --- |
| **LaTeX：選擇語法標示配色** | 選擇配色 |
| **LaTeX：切換實際編號顯示** | 顯示或隱藏編譯編號提示 |
| **LaTeX：選擇編譯後的 AUX 檔案** | 自動偵測不到編號資料時，手動指定 |
| **LaTeX：套用嵌入程式碼文字色** | 套用選定的程式碼一般文字色 |

介面預設跟隨 VS Code 的顯示語言。

### 選擇配色

可用配色：`githubDark`、`githubLight`、`dracula`、`nord`、`solarizedDark`、
`solarizedLight`。預設的 `auto` 依編輯器深／淺色外觀切換。
配色只調整 LaTeX 標示，保留目前的編輯器主題。

可在設定中自訂顏色：

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

顏色接受 `#RRGGBB` 或 `#RRGGBBAA`。VS Code 設定介面列有可用的顏色鍵，以及
導言區淡化、程式碼底色與編號提示等選項。

修改配色或 `codeText` 後，請執行 **套用嵌入程式碼文字色**，更新程式碼一般文字色。
更具體的關鍵字、字串或註解配色仍可能優先。此指令會在使用者文字色設定儲存
`LaTeX embedded code base text` 規則；移除該規則即可復原。

### 顯示編譯編號

編號來自上次編譯的 AUX／BBL 資料。擴充套件沿用 `% !TeX root = ...` 與
LaTeX Workshop 輸出目錄設定。若使用自訂位置，可執行 **選擇編譯後的 AUX 檔案**，
選取主文件的 `.aux`。

看不到提示時，請確認 VS Code 的 `editor.codeLens` 已開啟。出現過期資料警示時，
請重新編譯。星號標題維持不編號；段落編號依文件的 `secnumdepth` 設定。

### 預覽程式碼行號

在區塊明確指定語言，讓已安裝的語法文法辨識：

```latex
\begin{lstlisting}[language=Python,numbers=left,firstnumber=10]
def greet(name):
    print(name)
\end{lstlisting}
```

行號預覽也會讀取目前檔案中的 `\lstset` 與 `\lstdefinestyle`，支援 `numbers`、
`firstnumber`（`auto`、`last` 或數字）、`stepnumber`、`numberfirstline`、
`numberblanklines` 與同名區塊接續編號。

## 範例

- [英文完整文件](examples/sample-en.tex)
- [繁體中文完整文件](examples/sample-zh-TW.tex)
- [範例編譯說明](examples/README.md)
- 刻意錯誤的警示範例：[英文](examples/warnings-en.tex)／[繁體中文](examples/warnings-zh-TW.tex)。請在編輯器開啟觀察，不要編譯。

## 使用限制

- 視覺檢查以單一檔案為範圍，不展開 TeX 巨集或自訂 catcode，應搭配編譯器診斷。
- `\_`、標準數學、字面程式碼與常見識別鍵／網址參數會略過底線警示。一般 `\texttt` 中的文字底線仍應寫成 `\_`。
- 實際編號需要已有的編譯資料，無法完整重現所有作者／年份引用樣式，也未必能偵測所有跨檔資料過期情況。
- 行號預覽不重現 TeX 字型、間距、巨集選項或外部設定。含 `firstline`、`lastline` 或 `linerange` 的區塊會略過預覽；右側行號接在原始碼各行後方，不對齊 PDF 邊界。

## 編號清單

`enumerate` 的項目也會顯示編號，沿用同一個編號顯示開關。有 `\label` 的項目採用 AUX 編譯編號；沒有標籤的標準清單可在編譯前預覽四層編號（`1.`、`(a)`、`i.`、`A.`），滑鼠提示會註明是預覽。明確指定的 `\item[...]` 標籤維持原樣。自訂清單選項、重定義標籤或修改計數器時，需有編譯標籤才能顯示，無法判讀的編號會略過。

## 隱私與授權

擴充套件不傳送網路請求或遙測資料。它會讀取本機編譯輸出，將選定的 AUX 路徑存於
擴充套件工作區狀態。只有明確執行的程式碼文字色指令會修改使用者設定，解除安裝
不會移除該規則。

專案原創程式碼採用 [MIT 授權](LICENSE)，配色來源與授權見
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。配色為靈感改編，與 GitHub、Dracula、
Nord 或 Solarized 沒有官方關係或背書。
