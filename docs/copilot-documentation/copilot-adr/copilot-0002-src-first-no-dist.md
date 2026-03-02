---
title: ADR-0002 — Src-first Packaging
status: draft
updated: 2026-03-02
---

[← Back to ToC](../copilot-00-toc.md)

# ADR-0002 — Src-first Packaging
Authority: Tier2 (Operational)
Updated: 2026-03-02

**Decision**: Packages export from `src/` via `package.json#exports`. No `dist/` committed.

**Why**: Faster iteration, fewer mismatches between types and code.

**Consequences**: Tooling must respect subpath exports; app tsconfigs may include path fallback for DX. CI builds can still compile when publishing.

---

### Next
- Read [ADR-0003 — VueFire Owns Client Auth Init](./copilot-0003-vuefire-auth-init.md)
