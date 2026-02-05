---
title: No Hidden Fallbacks
status: active
created: 2026-02-04
---

# No Hidden Fallbacks

Fallbacks hide missing data and make UI design harder. In FireUX pre-v1, missing data should be obvious so we can fix it at the source.

## Rules

- Do not add UI fallbacks that mask missing data.
- Do not invent default values for required fields.
- Use neutral placeholders only when a flow must continue and the absence is visible.
- Only add a fallback if the product spec explicitly asks for it (example: short address → long address).
- Prefer data migrations/backfills over UI fallbacks.

## Reason

The system is still canonicalizing its models. Hidden fallbacks create drift, mask data quality issues, and make design validation impossible.
