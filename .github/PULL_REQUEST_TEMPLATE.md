<!--
For a release PR (chore: release vX.Y.Z), tick every box in
.github/RELEASE_CHECKLIST.md before the maintainer merges.
For a feature/bugfix PR, the checklist below is enough.
-->

## Summary

<one or two sentences describing the change>

## Test plan

- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes (Next static-export fixture build)
- [ ] Manual smoke if behavior-visible: per `.github/RELEASE_CHECKLIST.md`

## Release-PR-only

If this is a `chore: release vX.Y.Z`, link the release checklist: `.github/RELEASE_CHECKLIST.md` and tick every item before merge.
