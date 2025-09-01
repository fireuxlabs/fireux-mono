---
title: ADR-0001 — Nuxt Config Simplification
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# ADR-0001 — Nuxt Config Simplification

**Decision**: Apps use `createFireuxConfig` directly; `createBaseNuxtConfig` has been removed from core.

**Why**: One source of truth reduces drift, simplifies imports, and avoids accidental overrides.

**Consequences**: Per-app tweaks happen via options or per-package modules, not bespoke base config wrappers.

---

### Next
- Read [ADR-0002 — Src-first Packaging](./copilot-0002-src-first-no-dist.md)
