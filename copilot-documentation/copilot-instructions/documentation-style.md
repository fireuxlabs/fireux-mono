---
title: Documentation Style (Nuxt UI inspired)
status: active
updated: 2025-12-08
---

# Documentation Style — Nuxt UI Pattern

Adopt the Nuxt UI Docs style: concise frontmatter, short intro, task-first sections, and one or two code examples. Keep tone practical and avoid over-engineering.

## Principles

- Mirror Nuxt UI docs: frontmatter with `title` + `description`, clear H1, and a short “why/what/how” flow.
- Prefer one primary path; avoid branching instructions unless tenant differences require it.
- Keep examples minimal (happy path + one edge); link deeper ADRs instead of inlining.
- Cross-link: handbook chapters for canon, package docs for specifics, Spec Kit for live specs.

## Template

````markdown
---
title: <Title>
description: <One-sentence summary>
status: canonical|concept|working
updated: 2025-12-08
---

# <Title>

## Overview

What it is, who uses it, when to choose it.

## Installation

```bash
pnpm add <package>
# or enable in nuxt.config
```
````

## Usage

```ts
// minimal working example
```

## Configuration

Bullet the key options with defaults. Keep to one screenful.

## Examples

- Example 1: core happy path
- Example 2: tenant-specific tweak (if needed)

## References

- Link to related composables/components
- Link to ADRs or Spec Kit items

```

## Writing Rules
- Use present tense, active voice, and short sentences.
- Prefer bullets over paragraphs; keep sections under ~8 lines.
- Use fenced code blocks with language hints; keep inline code for identifiers only.
- If behaviour changes canon, update the handbook chapter and add/extend an ADR.
- If content is temporary, mark `status: working` and park it under `copilot-documentation/temporary-reports/`.

## Where to place docs
- Canonical/shared: `copilot-documentation/` and `docs/**`.
- Package- or tenant-specific: `packages/<scope>/<name>/docs/` or `projects/<ecosystem>/<app>/docs/`.
- Working notes: `copilot-documentation/temporary-reports/` or `copilot-documentation/imported/` when migrating old files.
```
