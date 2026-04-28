---
title: FireUX Handbook ToC
status: active
updated: 2026-03-23
---

# FireUX Handbook
Status: Older operational/copilot docs index; not default agent context
Updated: 2026-03-23
Authority: Tier2 (Operational index)

These docs may be stale against current `AGENTS.md` and Tier1 canon. Use them as operational reference only; if they conflict with Tier1 or `AGENTS.md`, those sources win.

## 1. Canon Layer (Tier1)
- `../fireux-canon.md`
- `../runtime-contract.md`
- `../seo-canon.md`
- `../../packages/extensions/fireux-*/docs/contract.md`

## 2. Handbook Chapters
1. [Orientation & Mission](./copilot-01-orientation.md)
2. [Architecture Snapshot](./copilot-02-architecture.md)
3. [Configuration & Tooling](./copilot-03-configuration.md)
4. [Platform Services](./copilot-04-platform-services.md)
5. [Development Workflow](./copilot-05-development-workflow.md)
6. [CI/CD & Releases](./copilot-06-ci-cd.md)
7. [UX & Component Conventions](./copilot-07-ux-conventions.md)
8. [Operations & Troubleshooting](./copilot-08-operations.md)

## 3. Operational Runbooks
- [Appendices index](./copilot-appendices/README.md)
- [Changelog system](../changelog/README.md)
- [Migrations runbook](../migrations/README.md)
- [SEO + indexing playbook](./copilot-appendices/seo-indexing-playbook.md)
- [Documentation manifest](../dev/_manifest.md)

## 4. Reports and Weekly Hygiene
- [Reports index](../reports/README.md)
- [Package documentation map](./package-docs-index.md)
- Latest hygiene report: `../reports/weekly-docs-hygiene-2026-03-23.md`
- Weekly cadence: Monday docs hygiene update (freshness, links, authority placement, ToC drift)

## 5. Supporting Inputs (Tier3)
- `docs/ai/` for context bundles and working memory
- `AGENTS.md` is the single process entry point for agents

## 6. ADRs
- [ADR index](./copilot-adr/README.md)
- [0001 — Nuxt config simplification](./copilot-adr/copilot-0001-nuxt-config-simplification.md)
- [0002 — Src-first packaging (no dist)](./copilot-adr/copilot-0002-src-first-no-dist.md)
- [0003 — VueFire owns Auth init](./copilot-adr/copilot-0003-vuefire-auth-init.md)
