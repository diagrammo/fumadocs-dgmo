import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { EmbedBanner } from './embed-banner';

// `basePath`-aware asset href: on GitHub Pages the site is served under
// /fumadocs-dgmo, in local dev at the root. Mirror the favicon handling in the
// root layout so the nav logo resolves in both.
const base = process.env.PAGES_BASE || '';
const SITE = 'https://diagrammo.app';

// A visitor may land on a deep showcase page (e.g. /docs/business/org-chart)
// with no other context — this could be their first impression of Diagrammo.
// Make the nav a real brand header (logo + wordmark linking home), give it
// outbound links to the product, and top the page with a one-line pitch.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <EmbedBanner />
      <DocsLayout
        tree={source.pageTree}
        nav={{
          url: SITE,
          title: (
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <img
                src={`${base}/favicon.svg`}
                alt=""
                width={26}
                height={26}
                style={{ borderRadius: 6 }}
              />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Diagrammo
              </span>
            </span>
          ),
        }}
        links={[
          { text: 'Website', url: SITE, external: true },
          { text: 'Get the App', url: `${SITE}/app`, external: true },
          { text: 'Docs', url: `${SITE}/docs`, external: true },
          { text: 'Gallery', url: `${SITE}/gallery`, external: true },
        ]}
        githubUrl="https://github.com/diagrammo"
      >
        {children}
      </DocsLayout>
    </>
  );
}
