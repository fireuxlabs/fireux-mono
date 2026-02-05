# FireUX – Misebox Ecosystem

Status: **Active**
Updated: 2026-02-05

## Purpose

Misebox is a hospitality-focused ecosystem built on FireUX. It configures FireUX Core and modules for kitchens, venues, and hospitality professionals.

Misebox is a connection layer, not an employer or staffing agency.

Primary app:
- `misebox.app` (`projects/misebox/misebox-app`, id: `misebox-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-misebox` (`fireux-misebox`)

## Scope

- Industry: Hospitality, food, kitchens
- Markets: Switzerland / Europe (initial)
- Users: Professionals, kitchens, venues, recruiters

## FireUX Components Used (Configured Today)

From `projects/misebox/misebox-app/nuxt.config.ts`:
- FireUX Core
- Modules: `fireux-places`, `fireux-companies`, `fireux-kitchens`, `fireux-jobs`, `fireux-products`, `fireux-blogs`
- Jobs workplaces config: `['kitchen', 'ship', 'truck']`

## Domain Model (High Level)

- Profile: base identity + professional profile
- Place: kitchens, restaurants, venues as shared entities
- Kitchen: operational entity layered on Places (Misebox-specific)
- Job: listings owned by real employers
- Company: optional operator layer

## Apps in the Ecosystem

Current apps (from `projects/misebox/`):
- `misebox.app` (`id: misebox-app`, role: global, PWA enabled)
- `niederhorn` (`id: niederhorn`, role: tenant, lean modules)

Apps share Core and ecosystem rules. Global apps carry modules; tenant apps stay lean.

## Design Constraints

- Legal-first design
- Profiles over CVs
- Place-based references over free text
- Canonical runtime models as source of truth

## Status

- Ecosystem structure: stable
- Profiles and Places: active
- Jobs: evolving
- UI: Nuxt UI + FireUX design system
- Focus: usable pipelines over completeness
