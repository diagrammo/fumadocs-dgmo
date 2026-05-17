import { defineConfig } from 'tsup';

// Two builds. The client entry needs a `'use client'` directive preserved
// at the top of the output so Next's app router treats it as a Client
// Component; tsup's per-entry `banner` is a clean way to inject that.
export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      remark: 'src/remark.ts',
      config: 'src/config.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node20',
    external: [
      '@diagrammo/dgmo',
      'fumadocs-mdx',
      'fumadocs-mdx/config',
      'remark-dgmo',
      'react',
      'next',
      'next/navigation',
    ],
  },
  {
    entry: { 'fumadocs-client': 'src/fumadocs-client.tsx' },
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    target: 'es2022',
    banner: { js: "'use client';" },
    external: ['@diagrammo/dgmo', 'react', 'next', 'next/navigation'],
    // `remark-dgmo` is intentionally INLINED into the client bundle
    // (~2.6 KB) so consumers don't have to resolve a bare
    // `remark-dgmo/client.js` specifier from inside our linked package
    // — Turbopack and other modern bundlers don't reliably traverse
    // the two-hop symlink chain that pnpm `link:` creates between
    // wrapper and core during dev, and even some real consumer setups
    // hit the same edge case with pnpm's strict node_modules layout.
    // tsup auto-externalizes anything declared in `dependencies`, so
    // we must explicitly opt back in via `noExternal`. The server
    // entries above still externalize `remark-dgmo` so users can
    // share the plugin instance.
    noExternal: ['remark-dgmo'],
  },
]);
