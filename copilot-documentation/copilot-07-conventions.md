---
title: Conventions
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Conventions

## Imports
- Apps import helpers via `fireux-core/config/app/fireux-config`
- Package runtime imports: relative within the package, no `.ts` suffix

## Naming
- Components: `PrefixThing.vue` (e.g. `FireHeader.vue`, `MiseboxCard.vue`)
- Composables: `useThing.ts`
- Server routes: `*.get.ts`, `*.post.ts`

## File Hygiene
- No generated files in git
- No duplicate init paths (e.g. Firebase)
- Minimal app tsconfigs (extend `.nuxt/tsconfig.json`)

---

### Next
- Back to the [Table of Contents](./copilot-00-toc.md)
