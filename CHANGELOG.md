# Changelog

Releases before 0.7.0 are documented at
[github.com/diagrammo/fumadocs-dgmo/releases](https://github.com/diagrammo/fumadocs-dgmo/releases).

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
