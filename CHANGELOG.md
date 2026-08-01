# Changelog

Releases before 0.7.0 are documented at
[github.com/diagrammo/fumadocs-dgmo/releases](https://github.com/diagrammo/fumadocs-dgmo/releases).

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
diagram and linking through to it, plus a hover-revealed *"Show this diagram
here"* link to the guide and a build warning naming the option and the source
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
