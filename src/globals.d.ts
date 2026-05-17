// Type-only declaration so `import 'fumadocs-dgmo/client.css'` (and any
// other side-effect CSS import) type-checks. The file is emitted to dist/
// by scripts/build-css.mjs and resolved by Next's CSS pipeline in the
// consumer — TypeScript never needs to find a real module here.
declare module '*.css';
