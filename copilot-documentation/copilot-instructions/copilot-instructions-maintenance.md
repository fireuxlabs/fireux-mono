---
title: Copilot — Maintenance
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Copilot — Maintenance

## Prompt — Bump framework versions safely
> Align `nuxt`, `vue`, `firebase`, `vuefire`, `nuxt-vuefire` in root `package.json` overrides.  
> Update apps' `package.json` to match.  
> Run typechecks for all apps & packages.

## Prompt — Clean docs
> Keep only `copilot-documentation/**` and per-package/project docs.  
> Move any ad-hoc reports to `archive/reports/YYYYMMDD/`.

## Acceptance Checklist
- `pnpm -w typecheck:packages` and `pnpm -w typecheck:apps` pass
- `pnpm run lint:docs` passes
- No docs found under any `dist/` directories
- New docs follow copilot-* naming

---

### Next
- Return to the [Table of Contents](../copilot-00-toc.md)
