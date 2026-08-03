#!/usr/bin/env node
// Compose the GitHub Pages showcase into a Fumadocs page TREE.
//
// Fetches dgmo-content's all-chart-types.md and explodes it into one page per
// chart type, grouped into a folder per top-level category. Fumadocs derives
// its left-hand nav from the file tree (one entry per `.mdx`, one collapsible
// group per folder), so every chart type becomes a sidebar link instead of a
// single "Diagrams" page whose charts only show up in the right-hand TOC.
//
// Each generated page sets `full: true`, which the fixture's page renderer
// forwards to <DocsPage full>, hiding the per-page "On this page" TOC — the
// nav lives entirely on the left.
//
// CI-only: the rewritten tree is built and deployed but never committed. Set
// SHOWCASE_SRC=<path> to compose from a local markdown file instead of the
// network (used for local verification).
//
// Usage: node scripts/compose-showcase.mjs <fixture-docs-dir>
//        (a path ending in .mdx is accepted for backwards compat — its parent
//         directory is used as the docs root.)
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BASE =
  'https://raw.githubusercontent.com/diagrammo/dgmo-content/main/examples';
const RAW = `${BASE}/all-chart-types.md`;
// Top billing: a live link is the one thing this integration does that a
// screenshot in a docs folder cannot, so it becomes the landing page.
const INTRO_RAW = `${BASE}/docs/live-links.md`;

const arg = process.argv[2];
if (!arg) {
  console.error('usage: compose-showcase.mjs <fixture-docs-dir>');
  process.exit(1);
}
// Accept either the docs dir or a page path inside it (legacy call site).
const docsDir = arg.endsWith('.mdx') ? dirname(arg) : arg;

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`fetch ${url} failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  return res.text();
};

const src = process.env.SHOWCASE_SRC;
const showcase = src ? readFileSync(src, 'utf8') : await get(RAW);

// LIVE_LINK_SRC=<path> composes the intro from a local file instead of the
// network — how this page is checked before the dgmo-content change is pushed.
const introSrc = process.env.LIVE_LINK_SRC;
const intro = introSrc ? readFileSync(introSrc, 'utf8') : await get(INTRO_RAW);

// ---- Parse into categories (h2) → charts (h3) --------------------------------
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Turn a heading into a clean nav/frontmatter title: strip trailing
// parenthetical qualifiers so the sidebar stays scannable ("Bar Chart", not
// "Bar Chart (stacked)"); keep the full text as the page's H1 via frontmatter.
const clean = (s) => s.replace(/\s*[—-]\s*.*$/, '').trim();

const lines = showcase.split('\n');
const categories = [];
let cat = null;
let chart = null;
let inFence = false;

const flushChart = () => {
  if (chart) {
    // Trim trailing blank lines and stray `---` separators.
    while (chart.body.length && /^(\s*|---)$/.test(chart.body.at(-1)))
      chart.body.pop();
    cat.charts.push(chart);
    chart = null;
  }
};

for (const line of lines) {
  if (/^```/.test(line)) inFence = !inFence;

  if (!inFence && /^##\s+/.test(line)) {
    flushChart();
    cat = { title: line.replace(/^##\s+/, '').trim(), charts: [], intro: [] };
    categories.push(cat);
    continue;
  }
  if (!inFence && /^###\s+/.test(line)) {
    flushChart();
    if (!cat) continue;
    chart = { title: line.replace(/^###\s+/, '').trim(), body: [] };
    continue;
  }
  if (chart) chart.body.push(line);
  else if (cat) cat.intro.push(line);
}
flushChart();

// ---- Transform fences: force showcase mode; strip MDX-hostile comments -------
const transform = (text) =>
  text
    .replace(/^```dgmo$/gm, '```dgmo showcase')
    .replace(/<!--[\s\S]*?-->/g, '');

// ---- Emit the tree -----------------------------------------------------------
const fm = (title, extra = '') =>
  `---\ntitle: ${JSON.stringify(title)}\nfull: true\n${extra}---\n\n`;

// Wipe any previously-composed tree, then rebuild.
for (const c of categories) {
  try {
    rmSync(join(docsDir, slug(c.title)), { recursive: true, force: true });
  } catch {}
}

const rootPages = ['index'];

// Landing page — the live-link section leads, because it is the one thing this
// integration does that pasting a picture into a docs folder cannot. Its fences
// stay in diagram mode: the whole point is that the source is NOT on the page,
// so a showcase footer offering "view source" would undercut it.
writeFileSync(
  join(docsDir, 'index.mdx'),
  `${fm('Live links', 'description: "A diagram whose source is not in this page — published from Diagrammo Cloud and always current."\n')}` +
    // The shared file opens with `## A live link`, which the frontmatter title
    // already says — drop it, then promote its `###` subsections to `##` so the
    // page ToC is a flat list of real sections rather than orphan third-level
    // headings hanging under nothing.
    `${intro
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^##[^\n]*\n/, '')
      .replace(/^### /gm, '## ')
      .trim()}\n\n` +
    `## Every other chart type\n\n` +
    `The rest of this showcase renders every DGMO chart type through the ` +
    `\`fumadocs-dgmo\` + \`remark-dgmo\` pipeline, with its source written out ` +
    `in full. Pick one from the sidebar.\n`,
);

for (const c of categories) {
  const dir = slug(c.title);
  mkdirSync(join(docsDir, dir), { recursive: true });
  rootPages.push(dir);

  const chartPages = [];
  for (const ch of c.charts) {
    const cs = slug(ch.title);
    chartPages.push(cs);
    const body = transform(ch.body.join('\n')).trim();
    writeFileSync(
      join(docsDir, dir, `${cs}.mdx`),
      `${fm(clean(ch.title))}${body}\n`,
    );
  }

  // Folder meta: label + ordered chart pages.
  writeFileSync(
    join(docsDir, dir, 'meta.json'),
    `${JSON.stringify({ title: c.title, pages: chartPages }, null, 2)}\n`,
  );
}

// Root meta: landing page then category folders in source order.
writeFileSync(
  join(docsDir, 'meta.json'),
  `${JSON.stringify({ title: 'Diagrams', pages: rootPages }, null, 2)}\n`,
);

// Remove the seed single-page fixture so it doesn't shadow index.mdx.
try {
  rmSync(arg.endsWith('.mdx') ? arg : join(docsDir, 'diagrams.mdx'), {
    force: true,
  });
} catch {}

const nCharts = categories.reduce((n, c) => n + c.charts.length, 0);
console.log(
  `composed ${nCharts} chart pages across ${categories.length} categories into ${docsDir}`,
);
