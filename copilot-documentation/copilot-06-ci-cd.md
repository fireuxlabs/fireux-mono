---
title: CI / CD (lightweight plan)
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# CI / CD (lightweight plan)

- Check: install, typecheck, lint per PR
- Build: nuxi build the targeted app
- (Later) Deploy to host/provider

### Checks to run
- `pnpm -w install`
- `pnpm -w typecheck:packages`
- `pnpm -w typecheck:apps`
- `pnpm lint`

---

### Next
- Review [Conventions](./copilot-07-conventions.md)
