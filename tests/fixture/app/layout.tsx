import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { DgmoClient } from 'fumadocs-dgmo/client';
import type { ReactNode } from 'react';

// `basePath`-aware favicon href: Next does not prefix metadata icons with
// basePath, so bake the Pages subpath in explicitly (empty at root in dev).
const base = process.env.PAGES_BASE || '';

export const metadata = {
  // Uniform brand tab title across every showcase page (generateMetadata omits
  // each page's own title so this default always wins).
  title: 'Diagrammo × Fumadocs',
  description: 'Fumadocs site exercising the dgmo wrapper.',
  icons: {
    icon: [
      { url: `${base}/favicon.svg`, type: 'image/svg+xml' },
      { url: `${base}/favicon.ico`, sizes: 'any' },
    ],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          {children}
          {/* Re-binds dgmo viewBox tightening + copy buttons on every soft
              navigation. Renders nothing. */}
          <DgmoClient />
        </RootProvider>
      </body>
    </html>
  );
}
