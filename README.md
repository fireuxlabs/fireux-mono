# FireUX Mono

Authority: Wayfinding only
README role: Map only; not canon.
Updated: 2026-06-17

This README is a front door, not canon.

Canonical rules live in:
- `AGENTS.md`
- `docs/fireux-canon.md`
- package `docs/contract.md` or `docs/canon.md`

## What "Map Only" Means

README files help people and agents find the right place to work.

They may explain:
- what this folder or package is
- where the real canon lives
- which file to open first
- which app/package owns the next decision

They must not define:
- architecture rules
- storage truth
- route truth
- authority or permission truth
- fallback or migration policy
- entity relationships

If a README needs to say how the system must behave, that rule belongs in
Tier1 canon instead.

Start with the user task, then the nearest canon contract, then sibling code.
Do not infer architecture from old README content.

## Documentation Restart TODO

- Keep README files as maps, not canon.
- Rebuild package READMEs in priority order from their marker comments.
- Start with `packages/core/fireux-core/README.md`.
- Then rebuild `packages/core/fireux-docs/README.md`.
- Then rebuild remaining core infrastructure READMEs.
- Then rebuild ecosystem package READMEs.
- Then rebuild extension package READMEs.
- Only add nested READMEs when a folder genuinely needs a local map.
- Each rebuilt README must point to its Tier1 canon source.
- If a README starts making rules, move those rules into Tier1 canon instead.
- Treat the future FireUX Docs app as a reader/organizer for selected repo docs.
- Do not let the FireUX Docs app become a second source of canon.
