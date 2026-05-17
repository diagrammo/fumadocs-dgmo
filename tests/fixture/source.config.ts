import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { withDgmo } from 'fumadocs-dgmo/config';

// `withDgmo` augments the mdxOptions object so the remark-dgmo plugin runs
// as part of the MDX pipeline. It defaults `mdx: true` on remark-dgmo so
// rendered diagrams come through as mdxJsxFlowElement nodes (MDX rejects
// raw html nodes). One line; no other wiring required.
export default defineConfig({
  mdxOptions: withDgmo(),
});

export const docs = defineDocs({
  dir: 'content/docs',
});
