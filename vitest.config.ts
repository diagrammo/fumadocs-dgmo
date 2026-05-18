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
      exclude: ['src/**/*.d.ts'],
      reporter: ['text-summary'],
      // Floor 2 pts below 2026-05-17 baseline (full src/** measurement).
      // Baseline: lines 81.8, statements 80, branches 90, functions 60.
      thresholds: {
        lines: 79,
        statements: 78,
        branches: 88,
        functions: 58,
      },
    },
  },
});
