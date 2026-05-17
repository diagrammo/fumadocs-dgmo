/**
 * Re-export `remark-dgmo` so users have a single dependency to install
 * (`fumadocs-dgmo`) and a single import path for the remark plugin:
 *
 *   import remarkDgmo from 'fumadocs-dgmo/remark';
 *
 * Equivalent to importing `remark-dgmo` directly — the package is one of
 * our runtime dependencies.
 */
export { default } from 'remark-dgmo';
export * from 'remark-dgmo';
