# Contributing

## Development environment

- VS Code 1.90+
- Node.js 20+
- Python 3.9+ for local VSIX packaging

```sh
npm ci
npm run check
npm test
npm run package
```

`npm ci` installs development-only TypeScript and type definitions. The runtime
has no npm dependencies. The VSIX is generated under `dist/`.

Open the repository in VS Code and press **F5**. The launch task compiles
TypeScript and opens the English sample in an Extension Development Host.

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Strict type checking without emitting files |
| `npm run compile` | Compile source and tests |
| `npm run watch` | Recompile on changes |
| `npm run check` | Types, script syntax, JSON, translations and README links |
| `npm test` | Compile and run unit tests |
| `npm run package` | Compile and build a local VSIX |
| `npm run review:data` | Refresh illustration data from the compiled parser |

## Source layout

- [src/](src/): TypeScript runtime. Pure analyzers are separate from VS Code integration.
- [test/](test/): TypeScript tests.
- [locales/](locales/): Runtime translations; static labels use the root package NLS files.
- [examples/](examples/): Valid bilingual documents and intentionally invalid warning snippets.
- [scripts/](scripts/): Validation and packaging utilities.

Generated `out/`, `dist/` and sample build outputs are ignored by Git. The VSIX
contains compiled runtime modules, translation data and license notices; it
excludes tests, source maps and development dependencies.

## Documentation and changes

Write the README for people installing and using the extension. Keep development
procedures here, sample compilation details in [examples/README.md](examples/README.md),
and release history in a changelog. Follow [AGENTS.md](AGENTS.md) when editing docs.

Keep English and Traditional Chinese user guides consistent. Preserve upstream
notices when changing palettes. Use focused Conventional Commits, separating
runtime changes, documentation, tests, build tooling and CI changes.
