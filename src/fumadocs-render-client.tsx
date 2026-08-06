/**
 * The opt-in half of live links: re-draw a diagram that has moved since your
 * last build, in the reader's browser, instead of only linking to the new
 * version.
 *
 * Mount it once, next to `<DgmoClient />`, and only if you also set
 * `liveLink: { refresh: 'render' }` in `source.config.ts` — the two halves are
 * one decision:
 *
 * ```tsx
 * import { DgmoClient } from 'fumadocs-dgmo/client';
 * import { DgmoRenderClient } from 'fumadocs-dgmo/client-render';
 *
 * <RootProvider>
 *   <DgmoClient />
 *   <DgmoRenderClient />
 *   {children}
 * </RootProvider>
 * ```
 *
 * ## Why it is a second component rather than a prop on the first
 *
 * Because the cost lands on your build whether or not the prop is ever set. A
 * bundler resolves a static-analyzable dynamic `import()` at BUILD time —
 * "lazy" says when the reader downloads the renderer, never whether your site
 * ships it. Naming the renderer from a module every consumer already imports
 * would pull its graph into every consumer's build. Kept in a module nobody
 * imports by default, a bundler can decline to follow it.
 *
 * ## Why the import is inside the component
 *
 * `remark-dgmo/client-render.js` exports nothing — it registers a renderer by
 * running — so `import 'remark-dgmo/client-render.js'` is a side-effect import,
 * which any bundler honouring that package's `sideEffects` field may delete
 * outright. Measured with esbuild against remark-dgmo 0.14.0 on 2026-08-06: 75
 * bytes of output, zero registrations, no error. A dynamic import is a call that
 * produces a value, so it survives, and Next emits the renderer as its own chunk
 * fetched only when a diagram has actually changed.
 */
'use client';

import { useEffect } from 'react';

export function DgmoRenderClient(): null {
  useEffect(() => {
    // Registering twice is harmless — the module sets one global and announces
    // itself — but there is no reason to re-run it on every navigation, so this
    // effect deliberately has no dependencies.
    void import('remark-dgmo/client-render.js');
  }, []);

  return null;
}

export default DgmoRenderClient;
