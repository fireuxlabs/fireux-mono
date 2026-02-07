# FireUX Template

Neutral FireUX app starter for developers who want a runnable baseline quickly.

## What this includes

- `fireux-core` (platform runtime)
- `fireux-fireux` (neutral ecosystem)
- `fireux-products` (catalog surfaces)
- `fireux-blogs` (content surfaces)

## What this does not include

- industry modules (`jobs`, `places`, `companies`, `kitchens`, `drop`)
- opinionated business workflows

## Routes

- `/` starter landing
- `/products`
- `/blogs`

## Quick start

1. Copy `.env.example` to `.env` and fill your Firebase values.
2. Install dependencies from repo root.
3. Run:

```bash
pnpm --filter ./projects/templates/fireux-template dev
```
