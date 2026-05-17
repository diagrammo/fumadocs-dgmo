/**
 * Fumadocs-shaped client wrapper for `remark-dgmo`'s framework-neutral
 * `bindDgmo()` function. Drop this once inside your `app/layout.tsx`
 * (typically inside `<RootProvider>`) and it will:
 *
 *   - run `bindDgmo()` on initial mount, tightening every diagram's
 *     viewBox to content bounds and wiring showcase-mode copy buttons;
 *   - re-run `bindDgmo()` on every client-side route change (Next's
 *     app router does not refire `DOMContentLoaded` semantics on soft
 *     navigation).
 *
 * Lives in this package — not in `remark-dgmo` — so that Next's `'use
 * client'` directive and `next/navigation` import stay out of the
 * framework-agnostic core.
 */
// Side-effect CSS import: Next's app-router CSS pipeline picks this up
// because the component is a Client Component imported from a layout.
// Self-references the package via its exports map so it works at both
// build time (tsup marks it external) and consumer time (Next resolves
// it through node_modules/fumadocs-dgmo/dist/client.css). Mounting
// `<DgmoClient />` is now the only thing a consumer has to do for both
// runtime rebinding AND theme-aware styling.
import 'fumadocs-dgmo/client.css';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { bindDgmo } from 'remark-dgmo/client.js';

export function DgmoClient(): null {
  const pathname = usePathname();

  useEffect(() => {
    // bindDgmo is idempotent — it scans for already-bound buttons and
    // skips them — so calling it on every pathname change is safe and
    // covers both initial paint and subsequent SPA navigations.
    bindDgmo();
  }, [pathname]);

  return null;
}

export default DgmoClient;
