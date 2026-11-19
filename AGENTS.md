# Project instructions

## User-facing documentation

- Write README files for someone discovering, installing and using the extension without access to this conversation.
- Lead with the product's purpose and features, then installation, usage, configuration and necessary limitations. Keep English and Traditional Chinese versions consistent.
- Do not put conversation history, progress reports, temporary work status, personal reminders, review/approval requests or agent implementation notes in README files. For example, “This is our current local draft” is a work note; “Install the VSIX through Extensions → Install from VSIX” is useful user guidance.
- Put contributor setup, architecture and build/test procedures in CONTRIBUTING.md, sample-specific compilation instructions beside the examples, and change history in a changelog. Keep internal review records out of the user guide.
- Describe only available functionality and verified installation methods. Do not invent Marketplace listings, release downloads or screenshots.

## Traditional Chinese terminology

- Use Taiwanese Traditional Chinese vocabulary in user-facing text, translations, documentation and replies. Do not merely convert Simplified Chinese characters to Traditional Chinese.
- Translate “highlight” as「標示」or「語法上色」according to context. Avoid Mainland Chinese terminology.
- Prefer「程式碼、預設、設定、資訊、資料、資料夾、連結、網路、軟體、擴充套件、使用者、滑鼠」for the corresponding concepts.

## Commits

Use focused Conventional Commits. Separate runtime changes, documentation, tests, build tooling and CI rather than collecting unrelated work in one commit.
