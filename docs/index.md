---
title: FireUX Docs
description: Canon + handbook + operational runbooks.
navigation: false
updated: 2026-03-23
---

# FireUX Docs
Status: Documentation index/map
Authority: Tier2 (Operational index)
Updated: 2026-03-23

This file is a compact docs map. The human documentation hub is `README.md`; documentation policy lives in `system.md`; agent context loading lives in `../AGENTS.md`.

## Start Here
- Documentation system: `system.md`
- Canon: `fireux-canon.md`, `entity-creation.md`, `runtime-contract.md`, `seo-canon.md`
- Changelog system: `changelog/README.md`
- Runtime docs entry: `../packages/core/fireux-docs/src/runtime/README.md`
- Entity creation and storage shapes: `entity-creation.md`
- Handbook ToC: `copilot-documentation/copilot-00-toc.md`
- Package contracts: `copilot-documentation/package-docs-index.md`
- Weekly reports: `reports/README.md`

## Runtime README Branch System
- Use `packages/core/fireux-docs/src/runtime/README.md` as the runtime docs root.
- Use the branch READMEs under `packages/core/fireux-docs/src/runtime/*/README.md` for surface-specific runtime work.

## Changelog Branch System
- Use `changelog/README.md` as the decision-history root.
- Use `changelog/*/README.md` for branch history across core, extensions, ecosystems, apps, and runtime.

## Product Source of Truth
Shared docs stay generic.
Target app product pages are:
- `/` (what is available now)
- `/about` (system definition)
- `/road-map` (direction, when present)

## Fast Paths
- Build/run: `getting-started.md`
- App creation guides: `guide/`
- Architecture: `architecture/`
- Migrations: `migrations/README.md`

## Documentation Policy
- Tier1 documents are source-of-truth.
- Tier2 documents explain execution and operations.
- Tier3 documents provide context/tooling memory and never override Tier1.
- Product descriptions, concepts, and app-specific value propositions belong in app pages, not shared docs.
