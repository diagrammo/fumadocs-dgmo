#!/usr/bin/env node
// Validate the fumadocs-dgmo fixture's static-export output.
//
// Invoked after `next build` runs against `tests/fixture/` with
// `output: 'export'` enabled. CWD when this script runs is
// `tests/fixture/`.
//
// Checks:
//   1. The diagrams page HTML contains both `dgmo-light` and `dgmo-dark`
//      class names (dual-render emitted by remark-dgmo).
//   2. The `out/_next/static/css/` directory contains at least one CSS
//      file with the dgmo selectors (proves @import from global.css
//      survived Next's CSS pipeline) AND the rewritten `html.dark`
//      selector (proves build-css.mjs's `[data-theme="dark"]` → `html.dark`
//      rewrite reached the consumer).
//   3. No per-page JS chunk contains the jsdom-internal sentinel
//      "http://www.w3.org/2000/xmlns/" — guards against jsdom leaking
//      into the client bundle through dgmo's render path.
//   4. Summed gzipped size of page-referenced JS chunks stays within
//      100 KB of the committed baseline (or seeds the baseline on first
//      run).
//
// Exit codes: 0 on pass, 1 on any failure.

import {
  readFileSync,
  statSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const FIXTURE = process.cwd();
const HTML_PATH = resolve(FIXTURE, 'out/docs/diagrams.html');
// Next 16 with Turbopack ships CSS in /_next/static/chunks/ alongside JS;
// the legacy Webpack pipeline ships it in /_next/static/css/. Check both
// so the fixture survives a Turbopack-off fallback.
const CSS_DIRS = [
  resolve(FIXTURE, 'out/_next/static/css'),
  resolve(FIXTURE, 'out/_next/static/chunks'),
];
const CHUNKS_DIR = resolve(FIXTURE, 'out/_next/static/chunks');
const BASELINE = resolve(FIXTURE, 'baseline-bundle-size.json');
const JSDOM_SENTINEL = 'http://www.w3.org/2000/xmlns/';
const BUDGET_BYTES = 100 * 1024;

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(1);
}

// --- 1. HTML wrappers ---
if (!existsSync(HTML_PATH)) fail(`Built HTML missing: ${HTML_PATH}`);
const html = readFileSync(HTML_PATH, 'utf8');
if (!/\bdgmo-light\b/.test(html)) fail('built HTML missing dgmo-light wrapper');
if (!/\bdgmo-dark\b/.test(html)) fail('built HTML missing dgmo-dark wrapper');
console.log('✓ HTML contains dgmo-light and dgmo-dark wrappers');

// --- 2. CSS pipeline ---
const cssCandidates = [];
for (const dir of CSS_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.css')) cssCandidates.push(join(dir, f));
  }
}
if (cssCandidates.length === 0) {
  fail(`No CSS files found under ${CSS_DIRS.join(' or ')}`);
}

let cssWithDgmo = null;
let cssWithHtmlDark = false;
for (const p of cssCandidates) {
  const body = readFileSync(p, 'utf8');
  if (/\.dgmo-(light|dark)\b/.test(body)) cssWithDgmo = p;
  // The Fumadocs-specific rewrite — proves scripts/build-css.mjs ran and
  // its output got picked up by the consumer's CSS pipeline.
  if (/\bhtml\.dark\b/.test(body)) cssWithHtmlDark = true;
}
if (!cssWithDgmo) {
  fail(`No CSS file contains .dgmo-light/.dgmo-dark selectors`);
}
if (!cssWithHtmlDark) {
  fail(
    `No CSS file contains the rewritten "html.dark" selector — ` +
      `build-css.mjs may not have run, or the rewritten CSS did not make it ` +
      `through Next's CSS pipeline`
  );
}
console.log(`✓ ${cssWithDgmo} carries dgmo selectors + html.dark rewrite`);

// --- 3. + 4. jsdom + bundle-size guards ---
if (!existsSync(CHUNKS_DIR)) fail(`Built JS chunks dir missing: ${CHUNKS_DIR}`);
const allChunks = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.js'));
// Identify chunks referenced from the diagrams page HTML.
const referenced = allChunks.filter((f) =>
  html.includes(`/_next/static/chunks/${f}`)
);

if (referenced.length === 0) {
  console.warn(
    `::warning::no per-page JS chunks referenced from the diagrams page; sentinel/byte checks skipped`
  );
} else {
  for (const chunk of referenced) {
    const body = readFileSync(join(CHUNKS_DIR, chunk), 'utf8');
    if (body.includes(JSDOM_SENTINEL)) {
      fail(
        `jsdom sentinel "${JSDOM_SENTINEL}" found in ${chunk} — jsdom leaked into client bundle`
      );
    }
  }
  console.log(
    `✓ ${referenced.length} per-page JS chunks free of jsdom sentinel`
  );

  const totalGzipped = referenced.reduce(
    (acc, chunk) =>
      acc + gzipSync(readFileSync(join(CHUNKS_DIR, chunk))).length,
    0
  );
  if (!existsSync(BASELINE)) {
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          totalGzippedBytes: totalGzipped,
          capturedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(
      `✓ Baseline seeded at ${totalGzipped} bytes (gzipped). Commit ${BASELINE} to enable regression checks.`
    );
  } else {
    const prev = JSON.parse(readFileSync(BASELINE, 'utf8')).totalGzippedBytes;
    const delta = totalGzipped - prev;
    if (Math.abs(delta) > BUDGET_BYTES) {
      fail(
        `bundle-size delta ${delta} bytes exceeds ${BUDGET_BYTES} budget (baseline ${prev}, current ${totalGzipped})`
      );
    }
    console.log(
      `✓ Bundle size ${totalGzipped} (Δ${delta} bytes) within ±${BUDGET_BYTES}`
    );
  }
}

console.log('✓ fixture build output assertions pass');
