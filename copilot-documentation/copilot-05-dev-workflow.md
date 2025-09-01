---
title: Dev Workflow
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Dev Workflow

## Install
```bash
pnpm -w install
```

## Useful scripts
- One app:
```bash
pnpm dev:niederhorn
```
- All apps (parallel):
```bash
pnpm dev:all
```

## Typecheck
```bash
pnpm -w typecheck:apps
pnpm -w typecheck:packages
```

## Lint / Format
```bash
pnpm lint
pnpm format
```

## When adding a module
1. create under packages/**/src/
2. export from package.json "exports"
3. add to app via createFireuxConfig({ modules: ['fireux-foo'] })

---

### Next
- Set up CI/CD: [CI / CD](./copilot-06-ci-cd.md)
