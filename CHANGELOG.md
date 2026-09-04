# Changelog

Releases before 0.7.0 are documented at
[github.com/diagrammo/fumadocs-dgmo/releases](https://github.com/diagrammo/fumadocs-dgmo/releases).

## 0.9.5

**Verified against `@diagrammo/dgmo` 0.83.0 and `remark-dgmo` 0.15.5.** In this
package's manifest the `@diagrammo/dgmo` range moves to `>=0.83.0 <1`. That
move is the release: an open range npm has already satisfied is never
re-resolved, so the previous version was built and tested against
whatever it happened to have installed rather than against what this workspace
publishes.

What 0.83.0 brings to a rendered page: a `boxes-and-lines` diagram built on a
busy machine no longer comes out as the layout engine's error text — a crowded
edge label is now preferred over no picture at all — and `is a cloud` and `is a
queue` draw a cloud and a queue, where both had been drawing the same rounded
rectangle as a node with no shape override at all.

Also in this release: the test fixtures install and run from a fresh clone
again, and each one is pinned to the version its own manifest declares. Nothing
the package ships changed.

## 0.9.4

**Diagrams were blank in dark mode on a Tailwind v4 site.** A dual-render fence
ships a light SVG and a dark one and lets the stylesheet pick; the dark wrapper
carried the `hidden` attribute so a site that never loaded the stylesheet showed
one diagram rather than two. Tailwind v4's preflight hides `[hidden]` with
`!important` from inside `@layer base`, and for important declarations a layered
rule outranks an unlayered one at any specificity — so the reveal could not win
at any strength, and the block collapsed to a zero-height empty box.

Tracks `@diagrammo/dgmo` 0.82.0 and `remark-dgmo` 0.15.4, which hide the dark
wrapper with an inline `display: none` and reveal it with `!important`. **If you
wrote your own color-mode selector**, add `!important` to your `display: block`
rule — an inline declaration outranks every normal author rule.

## 0.9.3

**Verified against `@diagrammo/dgmo` 0.81.0 and `remark-dgmo` 0.15.3.** The
`remark-dgmo` dependency moves to `>=0.15.3 <1` and the `@diagrammo/dgmo` range
this package builds against to `>=0.81.0 <1`. Those moves are the release: a
range that is already satisfied is never re-resolved, so the last version was
built and tested against what it happened to have installed rather than against
what this workspace publishes.

What 0.81.0 brings to a rendered page: boxes-and-lines arrowheads are no longer
painted at the node centres under the boxes they point at, an edge label lands
on the line it names, a two-way pair of edges stops drawing as an X, `color:`
on an edge reaches the stroke, and a numbered heatmap row label is read as a
label rather than the row's first value.

## 0.9.2

**Verified against `@diagrammo/dgmo` 0.79.0 and `remark-dgmo` 0.15.2.** The
`remark-dgmo` dependency moves to `>=0.15.2 <1` and the `@diagrammo/dgmo` range
this package builds against to `>=0.79.0 <1`. Those moves are the release: a
range that is already satisfied is never re-resolved, so the last version was
still being built and tested against 0.77.0.

Nothing in this package's own source changes. What readers get is three
releases of the library. Every chart type was brought onto one visual language,
so a border, a shadow and a type weight mean the same thing wherever they
appear — which included making the error card's docs link bold, the one
declaration `remark-dgmo`'s stylesheet copy had drifted on. A group line can
carry a tag value and the group's frame takes that value's colour, in
boxes-and-lines, infra, kanban, c4, state and pert; a c4 diagram now names a
tag group nobody has switched to instead of drawing it as nothing at all; and a
long identifier wraps where a reader would break it — after an underscore or
hyphen, and between the words of camelCase — rather than being chopped
mid-word.

### Changed

- Formatting only, across the files that had drifted from Prettier, and
  `format:check` now runs on every push so the next drift fails there instead
  of accumulating.

## 0.9.0

**Verified against `@diagrammo/dgmo` 0.76.0 and `remark-dgmo` 0.15.0.** The
`remark-dgmo` dependency moves to `^0.15.0` — on a `0.x` version a caret locks
the minor, so `^0.14.7` would have kept every consumer on the old stylesheet.
The `@diagrammo/dgmo` peer range is untouched at `>=0.61.0 <1`; nothing here
requires the newer library, it just makes the diagrams better behaved.

### Fixed

- **The dark wrapper now carries the `hidden` attribute** (emitted by
  `@diagrammo/dgmo` 0.76.0), so a page that somehow loads no diagram CSS shows
  the light diagram rather than both stacked. Fumadocs sites were never exposed
  to this — `<DgmoClient />` has always auto-imported the stylesheet — but the
  floor is worth having: a consumer who opts out, or wires the remark plugin by
  hand, gets one diagram instead of two. See issue 507, reported from an Astro
  site where the import was a manual step.

### Changed

- The build assertions now check that the dark wrapper is `hidden` and the
  light one never is.
- `scripts/build-css.mjs` still rewrites `[data-theme="dark"]` to `html.dark`,
  and that is still load-bearing: `remark-dgmo` 0.15.0 added `html.dark` rules
  for the two color-mode visibility rules only, while the lightbox background
  and every `.dgmo-tok-*` source colour remain keyed on the attribute alone.

## 0.8.8

**Verified against `@diagrammo/dgmo` 0.75.0 and `remark-dgmo` 0.14.7.** The dev range moves to
`>=0.75.0 <1`; the peer range is untouched, because no new subpath import was
added and that floor is set by imports rather than by recency.
The `remark-dgmo` dependency moves to `^0.14.7`, so what the fixture builds
against is what this release was checked on — a range that already matches what
is installed is never re-resolved, which is the only reason a declaration has to
move at all.

Nothing in this package's own source changes. What readers get is dgmo 0.75.0:
a PERT chart no longer draws its Summary card, stating its headline once in the
subtitle instead, and a collapsed sequence group's corners no longer blob.

## 0.8.7

The test fixture's favicon catches up with the rest of the workspace (#349).

## 0.8.6

**Verified against `@diagrammo/dgmo` 0.72.0 and `remark-dgmo` 0.14.5.** The dev
range moves to `>=0.72.0 <1` and the `remark-dgmo` dependency to `^0.14.5`, so
what the fixture builds against is what this release was checked on. The peer
range is untouched: no new subpath import was added.

## 0.8.5

**Verified against `@diagrammo/dgmo` 0.71.0 and `remark-dgmo` 0.14.4.** The
`remark-dgmo` dependency moves to `^0.14.4` and the `@diagrammo/dgmo`
devDependency to `>=0.71.0 <1`, so what this package is built and tested
against is the pair a current site installs.

Both ranges had been left where a satisfied one stops re-resolving: `^0.14.2`
and `>=0.66.0 <1` were still true of everything newer, so no plain install ever
reached past them, and every build and test run here went on resolving dgmo
0.66.0 and `remark-dgmo` 0.14.3 while reporting success. A declared range says
what is _allowed_, never what got _installed_ — the lockfile decides that, and
it does not revisit an entry that already fits.

The `@diagrammo/dgmo` peer range stays at `>=0.61.0 <1`. A peer floor here is
set by which dgmo subpaths this package and `remark-dgmo` import, and no import
changed — raising it would lock out sites this release still supports, for
nothing. No code changed.

## 0.8.4

**The licence names the company that now publishes this.** Diagrammo LLC
exists as of August 2026, so the copyright line in `LICENSE` and the author
field in `package.json` name it rather than an individual. Both ship inside
the npm tarball, which is why this is a release rather than a repository
tidy-up. No code changed.

## 0.8.3

🔴 **The `@diagrammo/dgmo` peer floor rises to `>=0.61.0 <1`, correcting a range
this package could not honour.**

It advertised `>=0.60.0 <1` while depending on `remark-dgmo ^0.14.0`, which now
resolves to 0.14.2 — and that imports `parseCloudReferenceFence`, which first
ships in dgmo **0.61.0**. So a site pinned to dgmo 0.60.x installed a combination
this package called supported, and got a module-resolution error:

```
SyntaxError: The requested module '@diagrammo/dgmo/cloud-reference'
does not provide an export named 'parseCloudReferenceFence'
```

npm cannot catch this — nothing validates a peer range against the peers of your
own dependencies — so stating the floor correctly is the only fix. Found
2026-08-06, when it took down a showcase build.

The `remark-dgmo` dependency moves to `^0.14.2` in the same breath, and the
test fixture is repinned off dgmo 0.60.0, which the new floor forbids.

## 0.8.2

**`liveLink: { refresh: 'render' }` can now actually re-render, and saying it
without doing it is no longer silent.** The setting was accepted here and had no
effect: re-drawing a moved diagram needs the browser half of the renderer on the
page, only `astro-dgmo` was putting it there, and nothing reported the gap. A
site believed it had turned re-rendering on and kept getting the _"This diagram
has been updated"_ link forever.

- New `fumadocs-dgmo/client-render`, exporting `<DgmoRenderClient />`. Mount it
  beside `<DgmoClient />` in `app/layout.tsx`. It is a second component rather
  than a prop because a bundler resolves a static-analyzable dynamic import at
  BUILD time — "lazy" says when a reader downloads the renderer, not whether
  your site ships it. Kept in a module nobody imports by default, it costs a
  site that has not opted in exactly nothing.
- `withDgmo` now says, once per build, that the option needs that component —
  naming both the component and the module to import it from.

Nothing changes on the default (`refresh: 'notify'`).

## 0.8.1

**Takes `remark-dgmo` 0.14.0, where the step that asks the Cloud what a pointer
points at moved into dgmo itself.** Nothing about this integration changes: the
build resolves live links exactly as before, `.dgmo/references/` keeps its
format, and the failure table that decides whether a build stops is untouched.

🔴 **The `@diagrammo/dgmo` peer floor rises to `>=0.60.0 <1`.** 0.60.0 is the
release that adds the `@diagrammo/dgmo/live-link-resolve` subpath that
`remark-dgmo` 0.14.0 imports. On an older dgmo the failure is a module
resolution error in your build, not a warning here.

This is a patch and not a minor on purpose. **A caret on a `0.x` version locks
the minor**, so a site on `^0.8.0` can reach 0.8.1 and cannot reach 0.9.0 — and
a dependency-floor release that no existing site can install is the exact
problem this release exists to undo.

## 0.8.0

**🔴 Live links: renamed keyword, renamed option, and now ON by default.** All
three arrive through `remark-dgmo` and all three are visible to a site that
upgrades and changes nothing.

The fence keyword is now `live-link`:

````md
```dgmo
live-link dgm_01HQ3RSTUV
```
````

`cloud <id>` no longer resolves — not deprecated, simply no longer a live link.
Same for `![[cloud:<id>]]`, which becomes `![[live-link:<id>]]`.

The option is `liveLink`, not `references`, and it resolves by default. Pass it
only to turn live links off:

```js
dgmo({ liveLink: { enabled: false } });
```

🔴 **A site that upgrades and does nothing will start fetching from
`api.diagrammo.app` at build time**, and a `.dgmo/references/` directory will
appear in the repository wanting to be committed. That is correct by design —
the cache belongs in your repo so a clean CI checkout never depends on our
uptime — but it is an unexplained directory until you know why it is there.

With live links off, a `live-link` fence now renders a small card naming the
diagram and linking through to it, plus a hover-revealed _"Show this diagram
here"_ link to the guide and a build warning naming the option and the source
line. It is no longer an error block. See the
[live links guide](https://diagrammo.app/docs/live-links/).

`refresh` is unchanged and still defaults to `notify`, so the renderer stays out
of your bundle unless you ask for it.

## 0.7.0

Build against dgmo 0.53.0 via remark-dgmo 0.10.0 — canonical syntax from
language-consistency decision #48. All legacy spellings still parse, so existing
`.dgmo` blocks keep rendering unchanged.

- Embed toolbar moved from the diagram's top-right to bottom-right, so it no
  longer collides with host chrome. The generated `fumadocs-dgmo/client.css`
  picks this up automatically — no consumer action needed.
- Default rendering catches up with #48: boxes-and-lines prints values, the
  tech-radar blip listing renders, and treemap colors by heat before tags.
