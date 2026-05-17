import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-3xl font-bold">fumadocs-dgmo fixture</h1>
      <p>Minimal Fumadocs site exercising the dgmo wrapper.</p>
      <Link
        href="/docs/diagrams"
        className="px-4 py-2 rounded bg-fd-primary text-fd-primary-foreground"
      >
        View diagrams
      </Link>
    </main>
  );
}
