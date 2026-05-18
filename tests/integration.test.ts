import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import remarkDgmo from 'remark-dgmo';

const require = createRequire(import.meta.url);

// Mirrors astro-dgmo + docusaurus-plugin-dgmo integration tests: walks the
// wrapper the way a real consumer site would, without booting Next. Catches
// breakage in (a) the public surface shape, (b) the built artifacts the
// package.json exports map points at, and (c) the fixture's source.config.ts
// wiring — independent of any Next build step so it stays green even if
// Turbopack regresses upstream.

describe('fumadocs-dgmo built artifacts', () => {
  it('exports map points at built files that exist on disk', () => {
    // pretest builds the wrapper, so dist/ must be populated. If a tsup
    // entry got renamed or dropped, this fails loudly.
    const paths = [
      'fumadocs-dgmo',
      'fumadocs-dgmo/config',
      'fumadocs-dgmo/remark',
      'fumadocs-dgmo/client',
      'fumadocs-dgmo/client.css',
    ];
    for (const spec of paths) {
      const resolved = require.resolve(spec);
      expect(existsSync(resolved), `${spec} → ${resolved} must exist`).toBe(
        true
      );
      expect(statSync(resolved).isFile()).toBe(true);
    }
  });

  it('the built client bundle carries the "use client" directive', () => {
    // tsup banner injects this; without it Next's app router will refuse
    // to mount the component as a Client Component.
    const clientPath = require.resolve('fumadocs-dgmo/client');
    const body = readFileSync(clientPath, 'utf8');
    expect(
      body.startsWith("'use client'") || body.startsWith('"use client"')
    ).toBe(true);
  });

  it('the rewritten client.css has html.dark (not [data-theme="dark"])', () => {
    // scripts/build-css.mjs replaces every occurrence in CSS rules; the
    // generated banner comment intentionally names the old selector in
    // prose, so strip /* … */ comments before checking that the actual
    // rules use the rewritten form.
    const cssPath = require.resolve('fumadocs-dgmo/client.css');
    const rules = readFileSync(cssPath, 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      ''
    );
    expect(rules).toMatch(/\bhtml\.dark\b/);
    expect(rules).not.toMatch(/\[data-theme="dark"\]/);
  });

  it('the client bundle carries a side-effect import of client.css', () => {
    // The CSS auto-import is the entire reason install collapsed from
    // 3 steps to 2 — if tsup ever decides to bundle (rather than
    // externalize) the self-reference, the consumer would lose theme
    // styling silently.
    const clientPath = require.resolve('fumadocs-dgmo/client');
    const body = readFileSync(clientPath, 'utf8');
    expect(body).toMatch(/import\s+["']fumadocs-dgmo\/client\.css["']/);
  });

  it('the client bundle inlines remark-dgmo (no bare specifier left over)', () => {
    // tsup's noExternal: ['remark-dgmo'] inlines the ~2.6 KB bindDgmo
    // payload so Turbopack doesn't have to traverse the two-hop link:
    // symlink. If that regresses, a bare `from "remark-dgmo/client.js"`
    // will appear in the bundle and break consumer dev servers.
    const clientPath = require.resolve('fumadocs-dgmo/client');
    const body = readFileSync(clientPath, 'utf8');
    expect(body).not.toMatch(/from\s+["']remark-dgmo\/client\.js["']/);
  });
});

describe('tests/fixture/source.config.ts (withDgmo integration)', () => {
  it('exports a resolved config with remarkDgmo wired into mdxOptions', async () => {
    // Indirect through a variable so tsc doesn't try to statically resolve
    // the fixture's source.config.ts — fumadocs-mdx's defineDocs return
    // type pulls in zod 4 schema types that trip TS2883 portability
    // warnings when surfaced through a typechecked test file. Vitest's
    // runtime ESM loader still resolves the literal string just fine.
    const fixturePath = './fixture/source.config.ts';
    const mod = (await import(fixturePath)) as { default: any };
    const resolved = (await mod.default) as Record<string, any>;

    expect(resolved['mdxOptions']).toBeDefined();
    const plugins = resolved['mdxOptions'].remarkPlugins as unknown[];
    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins.length).toBeGreaterThanOrEqual(1);

    const first = plugins[0];
    const plugin = Array.isArray(first) ? first[0] : first;
    const opts = Array.isArray(first)
      ? (first[1] as Record<string, unknown>)
      : undefined;

    expect(plugin).toBe(remarkDgmo);
    // Without `mdx: true`, fumadocs-mdx rejects the raw html nodes
    // remark-dgmo emits with "Cannot handle unknown node 'raw'".
    expect(opts?.['mdx']).toBe(true);
  });
});
