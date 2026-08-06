import remarkDgmo from 'remark-dgmo';
import type { DgmoOptions } from 'remark-dgmo';

/**
 * Shape of the `mdxOptions` object that `fumadocs-mdx`'s own `defineConfig`
 * accepts. We only need the `remarkPlugins` slot — everything else is
 * forwarded untouched — so we type it loosely instead of importing
 * Fumadocs's internal types (which churn between minor versions).
 *
 * `remarkPlugins` accepts the same shapes Fumadocs accepts: either a plain
 * array, or a function that receives the framework's defaults and returns
 * the array to use. We preserve whichever form the user passed.
 */
export type RemarkPlugin = unknown;
export type RemarkPluginsArray = RemarkPlugin[];
export type RemarkPluginsFn = (
  defaults: RemarkPluginsArray
) => RemarkPluginsArray;
export type RemarkPluginsField = RemarkPluginsArray | RemarkPluginsFn;

// Loosely-typed mirror of `fumadocs-mdx`'s `MDXPresetOptions`. We accept and
// return `any` for the field shape so this composes cleanly with
// `defineConfig({ mdxOptions: withDgmo(...) })` — Fumadocs's own types are
// invariant in surprising ways across minors. We type-check just enough to
// preserve compile-time safety on `remarkPlugins`, the only field we touch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FumadocsMdxOptions = Record<string, any>;

export interface WithDgmoOptions {
  /** Options forwarded to `remark-dgmo` (palette, theme, colorMode, etc.). */
  dgmo?: DgmoOptions;
}

/**
 * Augment a Fumadocs `mdxOptions` object so the `remark-dgmo` plugin runs as
 * part of the MDX pipeline. Designed to compose with `fumadocs-mdx`'s own
 * `defineConfig`:
 *
 * ```ts
 * // source.config.ts
 * import { defineConfig } from 'fumadocs-mdx/config';
 * import { withDgmo } from 'fumadocs-dgmo/config';
 *
 * export default defineConfig({
 *   mdxOptions: withDgmo({ /* existing mdxOptions, if any *\/ }),
 * });
 * ```
 *
 * Idempotent — running it on an already-wired object returns the same
 * options without double-injecting. The remark plugin is prepended to the
 * plugin list so it sees fenced `dgmo` blocks before any downstream remark
 * plugin (notably Fumadocs's own MDX file resolver) gets a chance to
 * transform them.
 *
 * If `mdxOptions.remarkPlugins` is the function form Fumadocs supports
 * (`(defaults) => [...]`), the returned config keeps the function form and
 * prepends `remarkDgmo` to the function's eventual output.
 */
export function withDgmo(
  mdxOptions: FumadocsMdxOptions = {},
  options: WithDgmoOptions = {}
): FumadocsMdxOptions {
  // Fumadocs always routes content through @mdx-js/mdx, which rejects raw
  // `html` mdast nodes with `Cannot handle unknown node "raw"`. Default
  // remark-dgmo's `mdx` flag to `true` so blocks emit an
  // mdxJsxFlowElement (`<div dangerouslySetInnerHTML={…}/>`) that MDX
  // accepts. The user can still override via `options.dgmo.mdx = false`.
  const dgmoOptions: DgmoOptions = { mdx: true, ...options.dgmo };
  noticeRenderClientRequired(dgmoOptions);
  const remarkInstance: RemarkPlugin = [remarkDgmo, dgmoOptions];

  const existing = mdxOptions['remarkPlugins'];

  // Already wired — bail early. Identity match doesn't survive across
  // calls (we construct a new tuple each time), so we check by reference
  // to the `remarkDgmo` function itself.
  if (Array.isArray(existing) && existing.some(isDgmoEntry)) {
    return mdxOptions;
  }

  if (typeof existing === 'function') {
    const userFn = existing as RemarkPluginsFn;
    return {
      ...mdxOptions,
      remarkPlugins: (defaults: RemarkPluginsArray) => {
        const next = userFn(defaults);
        const arr: RemarkPluginsArray = Array.isArray(next) ? [...next] : [];
        if (!arr.some(isDgmoEntry)) arr.unshift(remarkInstance);
        return arr;
      },
    };
  }

  const arr = Array.isArray(existing) ? [...existing] : [];
  arr.unshift(remarkInstance);
  return { ...mdxOptions, remarkPlugins: arr };
}

let noticed = false;

/**
 * Say the second half out loud, once per build.
 *
 * `liveLink: { refresh: 'render' }` is a decision about what runs in a reader's
 * browser, and this function only touches the MDX pipeline — Fumadocs mounts its
 * own client tree, so nothing here can put a component in it. Until
 * `<DgmoRenderClient />` is mounted the setting has no effect whatsoever, and
 * the page falls back to the "This diagram has been updated" link.
 *
 * That silence is the whole defect this exists to close: through 0.8.1 the
 * option was accepted and dropped, so a site believed it had turned re-rendering
 * on. A build is the one moment somebody is demonstrably paying attention.
 *
 * Test seam: `resetRenderClientNotice()`.
 */
function noticeRenderClientRequired(dgmoOptions: DgmoOptions): void {
  if (noticed) return;
  if (dgmoOptions.liveLink?.refresh !== 'render') return;
  noticed = true;
  console.info(
    '[fumadocs-dgmo] Live links are set to re-render in the browser. Mount `<DgmoRenderClient />` from `fumadocs-dgmo/client-render` in app/layout.tsx, beside `<DgmoClient />` — without it a diagram that has moved is linked to, not redrawn. Your Content-Security-Policy must also allow `connect-src https://api.diagrammo.app`.'
  );
}

/** Test seam: reset the once-per-process notice. */
export function resetRenderClientNotice(): void {
  noticed = false;
}

function isDgmoEntry(entry: unknown): boolean {
  if (entry === remarkDgmo) return true;
  if (Array.isArray(entry) && entry[0] === remarkDgmo) return true;
  return false;
}
