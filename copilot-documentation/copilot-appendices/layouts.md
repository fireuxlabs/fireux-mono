---
title: Layouts — taxonomy, rules, and usage
status: draft
updated: 2025-09-25
---

This doc defines how FireUX uses Nuxt layouts across core and tenants, aligned to Nuxt UI Templates. Treat this as the source of truth for layout naming, registration, and usage patterns.

## What you get

- A consistent set of core layouts exposed to all apps
- Predictable behavior (header/footer policy, routing allow-lists)
- A simple tenant wrapper pattern (no top-level slots)
- A phased Dashboard with a lean default and opt-in extras

## Registered core layouts

Layouts are registered by the core module and available to all apps. Key names (use these in `definePageMeta({ layout: '<name>' })`):

- default (app-owned; not re-registered by core)
- dashboard
- dev
- design
- docs
- landing
- portfolio
- auth
- chat
- changelog
- starter

Source of truth for registration: `packages/core/fireux-core/src/config/layouts-config.ts`.

## Mapping to Nuxt UI Templates

- landing → Marketing shell with global header/footer
- portfolio → Simple container with header/footer
- docs → Docs-like shell (optionally with content navigation)
- changelog → Simple docs variant for release notes
- auth → Centered form card, no global header/footer (focused)
- chat → Content-first shell with header/footer
- starter → Ultra-thin shell with header/footer
- dashboard → System dashboard shell (see phases below)
- dev/design → Internal-only utility shells used for previews and design work

## Global rules

- No top-level slots in core layouts or tenant layout wrappers
  - Core layouts must render content via `NuxtPage`
  - Tenant wrappers should be zero-logic pass-through wrappers (if a wrapper is needed at all)
- Global header/footer
  - Present for most shells (landing, portfolio, docs, changelog, chat, starter)
  - Omitted for focused experiences (auth)
- Routing merge policy
  - Core exposes composables for core routes
  - Layouts use allow-list filtering (“KEEP sets”) for header/nav items
  - Tenants can add links via props to specific layouts when supported (e.g., dashboard sidebar)

## Dashboard — phased approach

Baseline (Phase 1)
- Global header + desktop-only primary sidebar (tenant links) + content via `NuxtPage`
- No search overlay or secondary stacks by default

Planned (opt-in via props/composables)
- Search overlay and search button
- Secondary stacks (teams, projects, etc.)
- User menu enhancements

Rationale: keep the default lean and obvious; add complexity only where needed.

## Tenant usage

Choose a layout per page:

- In a page component: `definePageMeta({ layout: 'landing' })`
- Optionally provide a thin `app/layouts/<name>.vue` wrapper that returns the core component

Wrapper example (preferred minimal pattern):

- File: `projects/<tenant>/<app>/app/layouts/landing.vue`
- Code: `<template><CoreLanding /></template>`

Do not add a `<slot />` at the root of layout wrappers. Content is rendered by the core layout through `NuxtPage`.

## Header/menu allow-lists

Core layouts filter nav items using explicit KEEP sets to ensure consistent UX across apps. If a link should appear in a given layout’s header/menu, add it to the layout’s KEEP set rather than injecting arbitrary menu content.

## Quick checks

- If you see a `<slot />` in `app/layouts/**`, remove it and rely on `NuxtPage`
- Use only the registered names above in `definePageMeta`
- Prefer per-page selection of layout over per-app patching

## References

- Registration: `packages/core/fireux-core/src/config/layouts-config.ts`
- Core layouts: `packages/core/fireux-core/src/runtime/layouts/`
- Tenants (examples): `projects/**/app/pages/**` using `definePageMeta({ layout: '...' })`

## Roadmap

- Document KEEP sets per layout with example route merges
- Add opt-in dashboard props: `showSearch`, `secondaryLinks`, `showTeams`, etc.
- Migrate legacy root `docs/` to `copilot-documentation/imported/` with provenance headers
