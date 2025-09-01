---
title: Commands Cheatsheet
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Commands Cheatsheet

## Global
- `pnpm -w install`
- `pnpm dev:all`
- `pnpm -w typecheck:apps`
- `pnpm -w typecheck:packages`
- `pnpm lint` / `pnpm format`

## App
- `pnpm --filter ./projects/<eco>/<app> dev`
- `pnpm --filter ./projects/<eco>/<app> build`

### Common filters
- fireux-app: `pnpm --filter ./projects/fireux/fireux-app dev`
- misebox-app: `pnpm --filter ./projects/misebox/misebox-app dev`
- niederhorn: `pnpm --filter ./projects/misebox/niederhorn dev`
- cleanbox-app: `pnpm --filter ./projects/cleanbox/cleanbox-app dev`
- richies-reinigung: `pnpm --filter ./projects/cleanbox/richies-reinigung dev`

---

### Next
- Check the [Error Handbook](./copilot-error-handbook.md)

---

### Tips
- Use a single root `.env` and symlink it into apps so Nuxt finds it per CWD.
