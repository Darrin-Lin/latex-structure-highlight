# Copyright / provenance review

Checked: 2026-11-19. Scope: the current local draft; no remote repository or
Marketplace release has been created for this review.

## Findings

- The application modules were generated during this conversation and recovered
  from the installed local extension. Recovery from an installed package does
  not itself supply ownership or license evidence; their conversation provenance
  is the relevant record here. No third-party parser or grammar implementation
  was intentionally copied into this draft. This is a source inspection, not an
  exhaustive similarity search or a guarantee of exclusive copyright in AI output.
- Runtime imports are Node.js built-ins, VS Code's API, and project-owned local
  modules. There are no declared npm dependencies, bundled theme files, fonts,
  logos, LaTeX Workshop sources, or paid theme assets.
- Palette choices use or adapt recognizable upstream color values. All four
  referenced upstream projects publish MIT permission text: [Primer/GitHub](https://github.com/primer/github-vscode-theme/blob/main/LICENSE),
  [Dracula](https://github.com/dracula/visual-studio-code/blob/master/LICENSE),
  [Nord](https://github.com/nordtheme/nord/blob/develop/license), and
  [Solarized](https://github.com/altercation/solarized/blob/master/LICENSE).
  Their texts require copyright and permission notices in copies or substantial
  portions. The project conservatively retains attribution and full shared
  permission/warranty text in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
- Palette names now say “inspired” in the runtime picker. They do not claim
  official affiliation. The cited copyright licenses do not establish any
  separate trademark permission; a public release should retain neutral naming
  and the no-endorsement statement rather than imply approval by upstream.
- The root [LICENSE](../LICENSE) reserves rights in original project code and
  explicitly leaves upstream licenses intact. `UNLICENSED` / `private: true`
  describes this draft's licensing/npm publication intent; it does not replace
  upstream terms or guarantee that a GitHub repo is private. GitHub visibility
  must be set and verified when the repo is created.

## Changes made for review

Added upstream notices, included the notices in the intended extension file
list, clarified the root license, and marked theme inspiration. No source files
from upstream theme repositories were imported. Syntax colors are supplied by
the user's separately installed language extension, not redistributed here.

## Remaining decisions before distribution

Keep the repo private as requested. If later publishing, choose a license for
original code and ensure the packaged VSIX includes the notices. Confirm any
human-authored contributions and third-party additions at that time. The
current inspection found no obvious unresolved license conflict after the
notice changes; this is not a legal clearance opinion.
