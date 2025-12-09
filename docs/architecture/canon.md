---
title: FireUX Canon
description: Canonical patterns—identity, stacks, and module conventions.
---

# FireUX Canon

## Patterns

- Identity-first: user + tenant context required before doing work.
- Explicit stacks: shared modules flow through predictable folders.
- No shadow copies: one canonical implementation per concern.

## Conventions

- Keep docs in `/docs`; keep ecosystem/app notes in their local `docs/`.
- Prefer composables over ad-hoc helpers; keep inputs/outputs typed.
- Archive old reports under `archive/` instead of leaving stale files around.
