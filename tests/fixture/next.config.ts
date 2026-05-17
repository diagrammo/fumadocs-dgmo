import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const config = {
  reactStrictMode: true,
  // Static export gives us a flat `out/` directory of pre-rendered HTML
  // and asset chunks that scripts/assert-build-output.mjs can scan
  // without needing a running Node runtime. Fumadocs UI's `[[...slug]]`
  // page is fully statically resolvable since we wire generateStaticParams.
  output: 'export' as const,
  // Static export disables Next's image optimizer; required when output=export.
  images: { unoptimized: true },
  // NOTE on bundler choice (see package.json scripts → `next build --webpack`):
  // Turbopack in Next 16.2.x cannot resolve a pnpm `link:` dependency's
  // package.json `exports` map subpath (e.g. `fumadocs-dgmo/client`)
  // when the linked package lives outside the inferred workspace root.
  // It fails with `Module not found: Can't resolve 'fumadocs-dgmo/client'`
  // even though the symlink + dist/ are valid. Webpack handles the same
  // layout cleanly. Real consumers installing fumadocs-dgmo from npm
  // get a flat node_modules entry and aren't affected — this is purely
  // a dev-loop quirk of the `link:../..` symlink in the fixture. Remove
  // the `--webpack` flag once Turbopack closes the gap.
};

export default withMDX(config);
