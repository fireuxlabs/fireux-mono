---
title: Core Architecture
description: The pillars of FireUX—identity, composables, data, and runtime boundaries.
authority: Tier2
---

# Core Architecture
Authority: Tier2 (Reference; Tier1 canon lives in `docs/fireux-canon.md` and `docs/runtime-contract.md`)

## Identity & tenancy

- Multi-tenant by design; identity and profiles are first-class.
- Keep auth + profile resolution explicit; fail fast when required context is missing.

## Composables canon

- Single source of truth for fetching, mutations, and derived state.
- Prefer one composable per concern; avoid parallel helpers.

## Data shapes

- Stable contracts for profiles, products, and content.
- Treat Firestore/HTTP edges as boundaries; validate at the edge, keep internals typed.

## Runtime boundaries

- Clear split between build-time Nuxt config and runtime Firebase/Nitro concerns.
- No hidden fallbacks—surface missing config via errors or neutral UI.
