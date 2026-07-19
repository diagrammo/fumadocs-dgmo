# Changelog

Releases before 0.7.0 are documented at
[github.com/diagrammo/fumadocs-dgmo/releases](https://github.com/diagrammo/fumadocs-dgmo/releases).

## 0.7.0

Build against dgmo 0.53.0 via remark-dgmo 0.10.0 — canonical syntax from
language-consistency decision #48. All legacy spellings still parse, so existing
`.dgmo` blocks keep rendering unchanged.

- Embed toolbar moved from the diagram's top-right to bottom-right, so it no
  longer collides with host chrome. The generated `fumadocs-dgmo/client.css`
  picks this up automatically — no consumer action needed.
- Default rendering catches up with #48: boxes-and-lines prints values, the
  tech-radar blip listing renders, and treemap colors by heat before tags.
