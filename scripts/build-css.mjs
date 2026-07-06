#!/usr/bin/env node
// Generate dist/client.css from remark-dgmo/client.css at build time.
//
// Fumadocs UI uses next-themes with its default `attribute="class"`, so the
// dark-mode marker is `<html class="dark">` rather than `[data-theme="dark"]`
// — which is what remark-dgmo's base stylesheet keys on. We rewrite the
// selector at build time so consumers can `@import 'fumadocs-dgmo/client.css'`
// in their global.css and get correct toggle behavior with no manual override.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptClientCssToClassToggle } from 'remark-dgmo/client-css';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'dist/client.css');

const require = createRequire(import.meta.url);
const sourcePath = require.resolve('remark-dgmo/client.css');
const source = readFileSync(sourcePath, 'utf8');

// The single transform: `[data-theme="dark"]` → `html.dark`.
// Delegates to remark-dgmo's shared helper (default toggleSelector `html.dark`)
// instead of an inline string replace, so the rewrite stays in lockstep with
// the upstream stylesheet.
const adapted = adaptClientCssToClassToggle(source);

const banner =
  `/* fumadocs-dgmo/client.css\n` +
  ` *\n` +
  ` * Generated from remark-dgmo/client.css at build time. Selectors of the\n` +
  ` * form \`[data-theme="dark"]\` are rewritten to \`html.dark\` for Fumadocs\n` +
  ` * UI's next-themes default (attribute="class"). Do not edit manually —\n` +
  ` * change scripts/build-css.mjs instead.\n` +
  ` */\n\n`;

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, banner + adapted);
console.log(`✓ wrote ${OUT}`);
