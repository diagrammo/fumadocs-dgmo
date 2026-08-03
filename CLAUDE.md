# fumadocs-dgmo

Fumadocs (Next.js **app router**) wrapper around `remark-dgmo`. Two-step install, and both steps are load-bearing:

1. `withDgmo(mdxOptions, { dgmo })` in the consumer's `source.config.ts` — prepends `remarkDgmo` to `mdxOptions.remarkPlugins` (top level; Nextra nests it deeper). Handles both the array and the `(defaults) => [...]` function form, and is idempotent by identity on the `remarkDgmo` function.
2. `<DgmoClient />` from `fumadocs-dgmo/client`, mounted once inside `<RootProvider>` in `app/layout.tsx`.

Shared wrapper contract: [`../remark-dgmo/WRAPPER-CONVENTIONS.md`](../remark-dgmo/WRAPPER-CONVENTIONS.md). `remark-dgmo` lands on npm before this ships — order is in the workspace CLAUDE.md.

## Versions — read `package.json`

- `remark-dgmo` `^0.12.0` — level with the other four wrappers (checked 2026-08-03)
- peers: `@diagrammo/dgmo` `>=0.58.0 <1`, `fumadocs-mdx` `^15`, `next` `^15 || ^16`, `react` `^19`
- `tests/fixture/` pins both **exactly** (`0.12.0` / `0.59.0`) rather than by range, so the Pages showcase can never build against a `remark-dgmo` that predates live links
- Caret on a `0.x` dep pins the **minor** — a `remark-dgmo` minor needs an explicit bump here

## Host specifics

- **Server/client boundary is the layout rule.** `src/index.ts` exports only config-side things; the React component and CSS sit behind `./client` and `./client.css` so wiring `source.config.ts` never pulls React/JSX into a server-only path.
- **`withDgmo` defaults remark-dgmo's `mdx: true`.** Fumadocs always routes through `@mdx-js/mdx`, which rejects raw `html` nodes with `Cannot handle unknown node "raw"`. Overridable via `options.dgmo.mdx`.
- **Soft navigation kills the client bindings.** Next's app router doesn't refire `DOMContentLoaded`, so `fumadocs-client.tsx` calls `bindDgmo()` in a `useEffect` keyed on `usePathname()`. `<Script strategy="afterInteractive">` fires once per hard load and is not a substitute.
- **`dist/client.css` is generated, never hand-edited.** `scripts/build-css.mjs` runs `adaptClientCssToClassToggle` from `remark-dgmo/client-css` to rewrite `[data-theme="dark"]` → `html.dark` for Fumadocs UI's next-themes default (`attribute="class"`). The client component side-effect-imports it through this package's own exports map, so consumers need no `@import`.
- ⚠️ The fixture runs `next dev`/`next build` with `--webpack`: Turbopack 16.2.x won't resolve a `link:` dep's exports subpath from outside the inferred workspace root. Real npm consumers are unaffected — this is a dev-loop quirk, not a shipped constraint.

## Verify

`pnpm build` before typecheck/tests (`./config` and `./client` resolve through `dist/`). CI stubs the `tests/fixture/node_modules/fumadocs-dgmo` symlink instead of installing the fixture. `pnpm test:e2e` static-exports the fixture and runs `scripts/assert-build-output.mjs`: dual-render classes, a `_next/static` CSS file carrying the rewritten `html.dark` selector, no jsdom sentinel in page chunks, gzip within 100 KB of `baseline-bundle-size.json`.
