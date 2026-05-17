import { loader } from 'fumadocs-core/source';
import { docs } from '../.source/server';

// The source loader wires generated `.source` output (produced by
// `fumadocs-mdx`) to fumadocs-core's runtime page resolver. Imported by
// every page that needs to render docs content.
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
