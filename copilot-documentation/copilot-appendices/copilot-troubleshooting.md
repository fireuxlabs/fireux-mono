---
title: Troubleshooting
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Troubleshooting

1) Fresh install

```bash
rm -rf node_modules .pnpm-store
pnpm -w install
```

2) Check env
- Ensure `.env` in the app folder with Firebase keys.

3) Nuke Nuxt cache

```bash
rm -rf projects/**/.nuxt
```

4) Typecheck

```bash
pnpm -w typecheck:packages
pnpm -w typecheck:apps
```

5) Firebase sanity
- In browser console: `getApps().length` → should be `1`

---

### Next
- Return to the [Table of Contents](../copilot-00-toc.md)
