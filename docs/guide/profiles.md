---
title: Profiles
description: How profiles work across identity, data contracts, and UI.
updated: 2026-03-02
---

# Profiles Guide
Authority: Tier2 (Operational)

## Model

- Profiles capture identity + tenant context; treat them as required inputs.
- Keep the profile contract stable; avoid ad-hoc fields in UI.

## Data contracts

- Validate at the edge (Firestore/HTTP) and keep typed objects internally.
- Prefer composables for read/write instead of inline queries.

## UI integration

- Render loading/empty/error explicitly; never silently fall back to email/displayName.
- Derive display values via shared helpers, not per-component logic.

## Next

- See architecture canon for pattern guardrails: `../architecture/canon.md`
