# Ecosystems Changelog
Authority: Tier2 (Operational history)
Updated: 2026-03-28

Tracks meaningful changes at the ecosystem layer, where branding, runtime configuration, and ecosystem-specific delivery choices shift.

## 2026-03-12 - FireUX ecosystem moved to named Firestore DB behavior

Previous:
- ecosystem database assumptions were less explicit.

Now:
- the FireUX ecosystem declares and uses named Firestore DB behavior through shared runtime plumbing.

Why:
- support clearer database ownership and app-level discovery
- keep ecosystem configuration aligned with the core runtime contract

Affected:
- `packages/ecosystem/fireux-fireux/**`
- ecosystem runtime config
- app server endpoints consuming ecosystem database selection

## 2026-03-11 - Stitch removed from active ecosystem direction

Previous:
- Stitch still existed as an ecosystem and app branch in the tree.

Now:
- Stitch is removed and no longer acts as an active ecosystem direction.

Why:
- simplify the active repo surface
- reduce noise and dead branches in ecosystem planning

Affected:
- FireUX ecosystem app tree
- console routing assumptions
