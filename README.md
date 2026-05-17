# fumadocs-dgmo

Render [DGMO](https://diagrammo.app) diagrams from `` ```dgmo `` fenced code blocks in your [Fumadocs](https://fumadocs.dev) site at build time. Powered by [`@diagrammo/dgmo`](https://www.npmjs.com/package/@diagrammo/dgmo) and the framework-agnostic [`remark-dgmo`](https://www.npmjs.com/package/remark-dgmo) core. Zero client JavaScript by default (one tiny re-binder fires on route change).

Every diagram is rendered twice at build time (light + dark palettes) and follows Fumadocs UI's color-mode toggle through a shipped, `.dark`-rewritten stylesheet.

## Install

```bash
pnpm add fumadocs-dgmo @diagrammo/dgmo
```

`@diagrammo/dgmo`, `fumadocs-mdx`, `next`, and `react` are peer dependencies. Node 20.6+.

## Quick start

Three small edits to your Fumadocs site.

### 1. `source.config.ts` — wire the remark plugin

```ts
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { withDgmo } from 'fumadocs-dgmo/config';

export default defineConfig({
  mdxOptions: withDgmo(),
});

export const docs = defineDocs({
  dir: 'content/docs',
});
```

`withDgmo()` augments your `mdxOptions.remarkPlugins` with `remark-dgmo` and defaults `mdx: true` on it so blocks render as MDX-safe `mdxJsxFlowElement` nodes. Idempotent. If you already have your own remark plugins, pass the existing `mdxOptions` object in:

```ts
mdxOptions: withDgmo({ remarkPlugins: [myOtherPlugin] }),
```

`remark-dgmo` is prepended so it runs before any downstream remark plugin.

### 2. `app/global.css` — import the stylesheet

```css
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
@import 'fumadocs-dgmo/client.css';
```

The shipped `fumadocs-dgmo/client.css` is generated from `remark-dgmo/client.css` at build time, with `[data-theme="dark"]` rewritten to `html.dark` — the attribute Fumadocs UI's `next-themes` default uses. No manual override required.

### 3. `app/layout.tsx` — mount the client re-binder

```tsx
import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { DgmoClient } from 'fumadocs-dgmo/client';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          {children}
          <DgmoClient />
        </RootProvider>
      </body>
    </html>
  );
}
```

`<DgmoClient />` is a no-render Client Component that runs `bindDgmo()` on initial mount and on every soft route change. Next's app router doesn't refire `DOMContentLoaded` semantics on client-side navigation, so without this you'd lose viewBox tightening and showcase-mode copy buttons after the first SPA transition.

That's the whole integration.

### Passing remark-dgmo options

```ts
mdxOptions: withDgmo({}, { dgmo: { palette: 'catppuccin', colorMode: 'auto' } }),
```

The second argument forwards anything in `remark-dgmo`'s option surface (palette, theme, colorMode, mode, className, etc.).

## Configure (manual)

If `withDgmo` doesn't fit (dynamic remark plugin loading, you need to inspect the wiring), do it by hand:

```ts
import { defineConfig } from 'fumadocs-mdx/config';
import remarkDgmo from 'fumadocs-dgmo/remark';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkDgmo, { mdx: true }]],
  },
});
```

The `mdx: true` option is required — Fumadocs always routes content through `@mdx-js/mdx`, which rejects the raw `html` mdast nodes `remark-dgmo` emits by default.

## Use

Drop a fenced block with the language `dgmo` into any `.md`/`.mdx` file under your `content/docs/` directory.

````markdown
```dgmo
sequence
Client -POST /login-> API
API -validate-> Auth
Auth -JWT-> API
API -200 OK-> Client
```
````

## Per-block overrides

Append options to the fence info string. Tokens are space-separated; values may be quoted.

````markdown
```dgmo showcase title="Login flow" palette=catppuccin colorMode=light
sequence
A -> B
```
````

See the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the full option matrix.

## Working reference site

[`tests/fixture/`](./tests/fixture/) is a complete minimal Fumadocs site running this wrapper. Copy [`tests/fixture/source.config.ts`](./tests/fixture/source.config.ts), [`tests/fixture/app/layout.tsx`](./tests/fixture/app/layout.tsx), and [`tests/fixture/app/global.css`](./tests/fixture/app/global.css) as templates for your own site.

```bash
git clone https://github.com/diagrammo/fumadocs-dgmo
cd fumadocs-dgmo
pnpm install && pnpm build
cd tests/fixture && pnpm install --no-frozen-lockfile && pnpm dev
```

Opens at http://localhost:3000. Navigate to `/docs/diagrams` for four example diagrams (plain auto, colored tag sequence, showcase mode, per-block override). The fixture's `package.json` scripts pin Next 16 to webpack (`--webpack`) because Turbopack 16.2.x can't resolve a pnpm `link:` dep's `exports`-map subpath; consumers installing from npm aren't affected. See [`tests/fixture/README.md`](./tests/fixture/README.md) for details.

## How CSS is delivered

`fumadocs-dgmo/client.css` is the shipped stylesheet. It's the same three visibility rules + sizing + showcase chrome as upstream `remark-dgmo/client.css`, but the dark-mode selector is rewritten from `[data-theme="dark"]` to `html.dark` — the attribute Fumadocs UI's `next-themes` integration uses by default.

You `@import` it in your `app/global.css`. Next.js's CSS pipeline extracts the rules into the page bundle.

## Custom color-mode selector

If you've configured `next-themes` with a non-default attribute (e.g. `attribute="data-theme"`), the shipped CSS won't match. Two options:

1. Switch back to the default (Fumadocs UI's preset CSS expects `html.dark`).
2. Import `remark-dgmo/client.css` directly (keys on `[data-theme="dark"]`) and override the Fumadocs UI preset's dark-mode rules to match. This is uncommon and usually means the host site is fighting Fumadocs UI rather than this wrapper.

See the "Custom color-mode selector" section in the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the underlying selectors.

## How it works

1. `withDgmo` prepends `remark-dgmo` (with `mdx: true`) to your `mdxOptions.remarkPlugins` array. `fumadocs-mdx`'s build pipeline runs the plugin during MDX compilation.
2. For each fenced `dgmo` block, `remark-dgmo` calls `render()` from `@diagrammo/dgmo` once per theme (under default `colorMode: 'auto'`) and replaces the block with an `mdxJsxFlowElement` carrying the rendered SVG wrappers via `dangerouslySetInnerHTML`.
3. The shipped CSS, imported through `app/global.css`, gates the wrappers' visibility on `html.dark`. Toggling Fumadocs UI's theme switcher flips the class, which flips visibility.
4. The `<DgmoClient />` Client Component subscribes to `usePathname()` and re-runs `bindDgmo()` on every soft navigation. The function tightens each diagram's `viewBox` to content bounds and wires showcase-mode copy buttons.

All rendering happens at build time. The browser ships only inline SVG + the small CSS rules + a ~1.5 KB `bindDgmo` payload.

## License

MIT
