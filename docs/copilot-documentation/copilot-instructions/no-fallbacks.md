---
title: No Hidden Fallbacks
status: active
created: 2026-02-04
authority: Tier2
updated: 2026-03-02
---

# No Hidden Fallbacks
Authority: Tier2 (Reference; Tier1 behavior is defined in `docs/fireux-canon.md` and `docs/runtime-contract.md`)

Fallbacks hide missing data and make UI design harder. In FireUX pre-v1, missing data should be obvious so we can fix it at the source.

## Rules

- Do not add silent fallbacks for entity selection, routing, or identity decisions.
- Do not invent default values for required fields.
- Use neutral placeholders only when a flow must continue and the absence is visible.
- Deterministic field precedence inside one resolved entity is allowed when documented in Tier1 canon/contracts.
- Prefer data migrations/backfills over UI fallbacks.

## Reason

The system is still canonicalizing its models. Hidden fallbacks create drift, mask data quality issues, and make design validation impossible.
