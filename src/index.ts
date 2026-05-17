// ============================================================
// fumadocs-dgmo — Public API
// ============================================================
//
// Fumadocs (Next.js app-router) wrapper for the framework-agnostic
// `remark-dgmo` plugin. Three things land here:
//
//   1. `withDgmo` — augments a Fumadocs `mdxOptions` object so the remark
//      plugin runs as part of the MDX pipeline. The main ergonomic helper.
//   2. Re-exported types from `remark-dgmo` (DgmoOptions et al).
//   3. The remark plugin itself, for users who want to wire it manually.
//
// The host-specific bits — the `<DgmoClient />` React component and the
// adapted `client.css` — live behind their own subpath exports
// (`fumadocs-dgmo/client`, `fumadocs-dgmo/client.css`) so they don't pull
// React/JSX into the server-only config code path.

export { withDgmo } from './config.js';
export type {
  WithDgmoOptions,
  FumadocsMdxOptions,
  RemarkPlugin,
  RemarkPluginsArray,
  RemarkPluginsFn,
  RemarkPluginsField,
} from './config.js';

export { default as remarkDgmo } from 'remark-dgmo';
export type { DgmoOptions, Mode, Theme, ResolvedOptions } from 'remark-dgmo';
