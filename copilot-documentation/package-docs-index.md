---
title: Package Documentation Map
status: draft
created: 2025-10-15
---

# Package Documentation Map

Package and tenant-specific documentation lives beside the code that owns it. Use this index to locate those docs quickly.

## Core Packages

- `packages/core/fireux-core/docs/`
  - `molecules-forms.md` — status and migration plan for the Molecules forms system.

## Extensions

- `packages/extensions/fireux-places/docs/`
  - `places-overview.md` — search flow, Places integration, and professional linking summary.
- `packages/extensions/fireux-jobs/docs/`
  - _(pending)_ migrate content from archive as jobs docs are rewritten.

## Tenants & Apps

- `packages/tenants/*/docs/` — create on demand when tenant-specific guidance is required.
- `projects/<ecosystem>/<app>/docs/` — optional app-level notes (none at present).

When adding a new package doc:

1. Create the Markdown file beside the package (`packages/<scope>/<name>/docs/`).
2. Summarize the topic in this index with a short description and relative link.
3. Update the relevant handbook chapter if the new doc affects shared behaviour.

Legacy reports were retired during the 2025-10-15 migration; pull historical context from git history when needed.
