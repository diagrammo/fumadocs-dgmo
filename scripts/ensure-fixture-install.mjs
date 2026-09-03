#!/usr/bin/env node
/**
 * Install `tests/fixture` if — and only if — it has never been installed.
 *
 * Wired as part of `pretest`. The unit tests import the fixture's config, and
 * that config imports this package by its PUBLISHED name (`<pkg>/config`),
 * which is the point: it proves the `exports` subpath a consumer actually
 * writes resolves. That resolution goes through `tests/fixture/node_modules/<pkg>`,
 * a self-link pnpm creates from the fixture's own `link:../..` dependency.
 *
 * 🔴 Nothing in `pnpm test` used to create that link — only `test:e2e` did. So a
 * fresh clone failed with `Cannot find package '<pkg>/config'` while the same
 * command passed on any machine where somebody had run the e2e suite once,
 * however long ago. It is invisible exactly where the repo is oldest, which is
 * why it survived to be found on a brand-new Linux checkout (2026-09-02).
 *
 * The check is the link, not a marker file: `node_modules` is gitignored, so
 * its absence is the honest signal, and re-installing on a warm checkout would
 * put a multi-second pnpm install in front of every test run.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = resolve(ROOT, 'tests/fixture');
const { name } = JSON.parse(
  readFileSync(resolve(ROOT, 'package.json'), 'utf8')
);
const link = resolve(FIXTURE, 'node_modules', name);

if (existsSync(link)) process.exit(0);

console.log(
  `ensure-fixture-install: tests/fixture has no ${name} link — installing it once.`
);
try {
  execFileSync('pnpm', ['install', '--no-frozen-lockfile'], {
    cwd: FIXTURE,
    stdio: 'inherit',
  });
} catch {
  console.error(
    `\n✖ ensure-fixture-install: \`pnpm install\` failed in tests/fixture.\n` +
      `  The unit tests import ${name}/config through that install and will fail\n` +
      `  with "Cannot find package" until it succeeds.\n`
  );
  process.exit(1);
}

if (!existsSync(link)) {
  console.error(
    `\n✖ ensure-fixture-install: install finished but ${link} is still missing.\n` +
      `  Check that tests/fixture/package.json still depends on "${name}": "link:../..".\n`
  );
  process.exit(1);
}
