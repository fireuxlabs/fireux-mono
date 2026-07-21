FireUX concept map
Updated: 2026-07-21
Ref: 5b6cfcc8e
Role: map, not canon

<!-- Concurrent edit — 2026-07-21 12:43 CEST — Cleanbox-to-Werkbox migration: map the durable hospitality and practical-work ownership split. -->

Purpose:
Explain FireUX as the platform shape behind the repo.

Scope:
- Core packages.
- Ecosystem packages.
- Extension packages.
- Project app consumers.

Vertical links:
- Parent: fireux-mono.md
- Child: runtime-package.md
- Child: app-config.md
- Child: console.md
- Child: firestore-entity.md

Horizontal links:
- nuxt4.md
- nuxt-ui.md
- spine.md

Current shape:
- FireUX is a modular Nuxt platform.
- Packages expose Nuxt modules and runtime surfaces.
- Apps consume packages through `defineFireuxConfig`.
- Shared domain truth belongs in the owning package.

Package lanes:
- Core packages provide shared primitives and runtime foundations.
- Ecosystem packages provide ecosystem identity, config, Firebase binding, and public assets.
- Extension packages provide domain runtime surfaces.

Runtime app roles:
- `global`: app can expose multiple domains/consoles.
- `tenant`: app usually pins console targets through `consoleConfig`.
- `standalone`: FireUX-owned standalone app mode.

Current ecosystem ownership:
- Misebox owns hospitality work and its Kitchen/Menu composition.
- Werkbox owns cleaning and other non-hospitality practical work. Cleaning is a
  product-neutral category inside Werkbox, not a separate ecosystem.
- Shared Job, Company, Place, Agent, and Professional truth stays in its owning
  extension package rather than either ecosystem package.
- Werkbox currently retains the legacy `cleanbox-f15bc` Firebase project,
  `cleanbox` database, and canonical record IDs until an explicitly approved
  remote migration changes that physical authority.

Working rule:
Before inventing a local helper, check whether FireUX core already owns the seam.
