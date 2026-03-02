---
title: Documentation Style
status: active
updated: 2026-03-02
---

# Documentation Style
Authority: Tier2 (Operational)
Updated: 2026-03-02

## Principles
- Keep docs reusable and generic.
- Prefer one clear guide over many near-duplicate guides.
- Keep sections short, task-first, and skimmable.
- Use code examples only when they add direct implementation value.

## Template
```markdown
---
title: <Title>
status: active
updated: <YYYY-MM-DD>
---

# <Title>
Authority: Tier2 (Operational)
Updated: <YYYY-MM-DD>

## Purpose

## Steps

## References
```

## Placement Rules
- Canon and system docs: `docs/**`
- Package docs: `packages/**/docs/**`
- App docs: `projects/**/docs/**` (only if app-specific and non-duplicative)
- AI memory/context: `docs/ai/**` (Tier3)

## Hygiene Rules
- Every markdown file must include `Authority` and `Updated`.
- If behavior changes canon, update Tier1 docs in the same change.
- Delete stale/duplicate docs instead of archiving inside the repo.
