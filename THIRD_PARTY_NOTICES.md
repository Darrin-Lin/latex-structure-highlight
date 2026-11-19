# Third-party palette references

The six highlighting presets in `src/palettes.ts` use or adapt colors associated
with the following projects. These are independently arranged, **inspired**
highlighting palettes, not the official complete editor themes. Some accents
have been adjusted for contrast. Theme names identify their inspiration;
no affiliation, endorsement, or trademark license is claimed. No logos, theme
source files, fonts, TextMate grammars, or paid theme assets are bundled.

| Reference | Upstream copyright notice | License source |
| --- | --- | --- |
| GitHub / Primer | Copyright (c) 2020 Primer | [MIT](https://github.com/primer/github-vscode-theme/blob/main/LICENSE) |
| Dracula | Copyright (c) 2016 Dracula Theme | [MIT](https://github.com/dracula/visual-studio-code/blob/master/LICENSE) |
| Nord | Copyright (c) 2016-present Sven Greb <development@svengreb.de> (https://www.svengreb.de) | [MIT](https://github.com/nordtheme/nord/blob/develop/license) |
| Solarized | Copyright (c) 2011 Ethan Schoonover | [MIT](https://github.com/altercation/solarized/blob/master/LICENSE) |

License texts checked on 2026-11-19. As a conservative attribution measure,
retain these notices and the shared MIT permission and warranty text below
when distributing this project or the palette presets.

## MIT permission and warranty text

The copyright notices listed above apply to their respective upstream works.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Other components

The runtime uses Node.js built-ins and the VS Code extension API; no runtime
npm dependencies or LaTeX syntax grammars are shipped. Syntax highlighting
comes from the user's separately installed language extension. CI references
GitHub Actions by name; those actions are downloaded by CI, not bundled here.
The review illustration uses system fonts and original sample text. TypeScript
and Node/VS Code type definitions are development-only dependencies recorded
in package-lock.json; the compiler and type-definition packages are not bundled
in the runtime VSIX. Their own notices remain in the installed npm packages.
