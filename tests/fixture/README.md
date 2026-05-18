# `tests/fixture/` — working Fumadocs + dgmo reference

A minimal Fumadocs site (Next.js app router) wired with `fumadocs-dgmo`,
`fumadocs-mdx`, and `fumadocs-ui`. Two purposes:

1. **Consumer copy-paste template.** If you want to use this wrapper in
   your own Fumadocs site, the files here are the smallest working
   configuration. The non-obvious bits:
   - **`source.config.ts`** wraps `mdxOptions` with `withDgmo()`. That's
     the entire MDX-pipeline integration. `withDgmo` defaults
     `remark-dgmo`'s `mdx` option to `true` so rendered blocks come
     through as `mdxJsxFlowElement` nodes — MDX rejects raw `html`
     nodes with `Cannot handle unknown node "raw"`.
   - **`app/layout.tsx`** renders `<DgmoClient />` inside `<RootProvider>`.
     The component is a no-render Client Component that does two things:
     re-runs `bindDgmo()` on every soft navigation (without it, viewBox
     tightening and showcase-mode copy buttons stop working after the
     first client-side route change), and side-effect-imports
     `fumadocs-dgmo/client.css` so Next's CSS pipeline picks up the
     theme-aware stylesheet automatically. No manual `@import` in
     `global.css` required — the shipped stylesheet rewrites
     `[data-theme="dark"]` → `html.dark` so it works with Fumadocs UI's
     next-themes default (`attribute="class"`).

2. **Test fixture for plugin development.** [`content/docs/diagrams.mdx`](./content/docs/diagrams.mdx)
   exercises four canonical shapes:
   - Plain block under `colorMode: 'auto'` — dual-render with the
     theme toggle swapping between the two SVGs
   - Colored sequence diagram with `tag` blocks — exercises palette
     color resolution
   - Showcase mode — diagram + collapsible source + open-in-editor +
     copy
   - Per-block override — single-render, alternate palette

## Running it

The fixture lives outside the parent repo's pnpm install so it can use
its own lockfile and `link:../..` dep on the plugin source.

```bash
# from the parent fumadocs-dgmo repo root
pnpm build                                      # build the wrapper
cd tests/fixture
pnpm install --no-frozen-lockfile               # link: deps require non-frozen
pnpm dev                                        # opens http://localhost:3000
```

Open <http://localhost:3000/docs/diagrams> after the dev server boots.

### Why `--webpack` on `next dev` and `next build`

The fixture's `package.json` scripts run Next 16 with `--webpack`
instead of the default Turbopack. Turbopack 16.2.x doesn't resolve a
pnpm `link:` dep's `exports`-map subpath (`fumadocs-dgmo/client`)
when the linked target lives outside the inferred workspace root.
Webpack handles the same symlink layout cleanly. Real consumers
installing `fumadocs-dgmo` from npm get a flat `node_modules` entry
and aren't affected — this is purely a dev-loop quirk of the fixture's
`link:../..` install. Drop the flag once Turbopack closes the gap.

## What to look for

- `/docs/diagrams` shows four rendered diagrams (not raw fence text).
- Toggling the Fumadocs UI theme switcher swaps the first three diagrams
  between light and dark palettes. The fourth (`colorMode=light`) stays
  put — it's the "no-toggle-on-locked-mode" sanity check.
- Open the disclosure under the "Login flow" diagram — the source code
  should render with newlines preserved, and the copy + open-in-editor
  buttons should both appear.

## Not shipped to npm

`tests/` is excluded from the npm tarball via `"files": ["dist",
"README.md", "LICENSE"]` in `package.json`. The fixture adds zero bytes
to consumer installs.
