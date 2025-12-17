---
title: ADR-0003 — VueFire Owns Client Auth Init
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# ADR-0003 — VueFire Owns Client Auth Init

**Decision**: VueFire (nuxt-vuefire) initializes Firebase client Auth (with SSR). Custom plugins must not initialize again.

**Why**: Prevent `auth/already-initialized`. VueFire’s plugin supports SSR hydration correctly.

**Consequences**: Use `useFirebaseAuth()` for access. Any auto-anon sign-in must be user-initiated to avoid conflicts.

---

### Next
- Return to the [Table of Contents](../copilot-00-toc.md)
