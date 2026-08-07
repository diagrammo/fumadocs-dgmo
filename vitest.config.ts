import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixture/**', 'tests/**/fixture-build.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // The two `'use client'` components are browser-only: they call React
      // hooks, so they cannot run under `environment: 'node'` and this repo
      // carries no DOM or testing-library stack to run them under. Counting
      // them measured the absence of a test harness rather than the code, and
      // adding the second one dropped the whole repo under its floor while the
      // build-time surface it gates was unchanged. `vitepress-dgmo` excludes
      // its browser-only client for the same reason.
      exclude: [
        'src/**/*.d.ts',
        'src/fumadocs-client.tsx',
        'src/fumadocs-render-client.tsx',
      ],
      reporter: ['text-summary'],
      // Floor 2 pts below the 2026-08-06 baseline of the measured surface —
      // `config.ts` and `index.ts`, which is what the tests actually drive.
      // Baseline: lines 100, statements 96.6, branches 91.6, functions 100.
      thresholds: {
        lines: 98,
        statements: 94,
        branches: 89,
        functions: 98,
      },
    },
  },
});
