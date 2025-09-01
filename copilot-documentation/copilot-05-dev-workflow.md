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

1. create under packages/\*\*/src/
2. export from package.json "exports"
3. add to app via createFireuxConfig({ modules: ['fireux-foo'] })

---

## Git & GitHub (simple flow)

Use a short, familiar sequence. No extra flags unless asked.

- Status → Add → Commit → Push

```bash
git status
git add .
git commit -m "chore: brief, clear message"
git push
```

- Reset to origin/main (when you explicitly want to discard local changes)

```bash
git fetch --all --prune
git reset --hard origin/main
git clean -fd   # removes untracked files/dirs (not ignored)
```

Notes

- Keep messages short and specific. One change theme per commit.
- If VS Code shows stale counts after push, Refresh Source Control (or reload window).
- Default branch is main; avoid creating branches unless needed.
- When in doubt, run `git status` first.

### Next

- Set up CI/CD: [CI / CD](./copilot-06-ci-cd.md)
