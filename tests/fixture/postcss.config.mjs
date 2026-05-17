// Tailwind v4 ships its PostCSS plugin separately. Fumadocs UI 16 expects
// Tailwind utilities to be in the consumer's CSS pipeline — without this
// the preset CSS variables apply but layout/utility classes don't, leaving
// the nav and sidebar visually broken.
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
