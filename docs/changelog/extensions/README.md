# Extensions Changelog
Authority: Tier2 (Operational history)
Updated: 2026-03-28

Tracks meaningful changes that affect extension-family behavior, extension contracts, and shared domain implementation patterns.

## 2026-03-11 - Profile prerequisite naming normalized

Previous:
- setup and prerequisite naming varied across profile families.

Now:
- profile create and setup seams use more consistent naming across Chef, Agent, Professional, and related families.

Why:
- reduce conceptual drift across extension-owned profile systems
- make create and setup behavior easier to compare and align

Affected:
- jobs profile flows
- kitchens chef flows
- supplier-adjacent setup flows

## 2026-03-09 - Entity surface rollout aligned across shared extensions

Previous:
- entity index and surface behavior varied more by extension.

Now:
- extension work is expected to align against the shared entity surface rollout and Tier1 canon before local divergence.

Why:
- keep shared domain modules feeling like one platform
- reduce per-extension UI and route drift

Affected:
- extension surfaces
- package contracts
- entity view patterns
