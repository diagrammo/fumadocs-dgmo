import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { DgmoClient } from 'fumadocs-dgmo/client';
import type { ReactNode } from 'react';

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
