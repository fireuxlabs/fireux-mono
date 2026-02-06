# misebox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

## Overview

`misebox.app` is the primary application of the Misebox ecosystem. It is the real product, not a demo or template.

App identity (from `projects/misebox/misebox-app/nuxt.config.ts`):
- `id: misebox-app`
- `name: Misebox`
- `role: global`

Repo location:
- `projects/misebox/misebox-app`

## Role in the System

- Exposes profiles
- Hosts job listings
- Connects professionals to opportunities
- Demonstrates the full Misebox value proposition

## Technical Stack

- Framework: Nuxt 3
- UI: Nuxt UI + FireUX design system
- Backend: Firebase (Auth, Firestore, Storage)
- Architecture: FireUX Core + modules
- PWA: Yes

Configured modules (current):
- `fireux-places`
- `fireux-companies`
- `fireux-kitchens`
- `fireux-jobs` (workplaces: `['kitchen', 'ship', 'truck']`)
- `fireux-products`
- `fireux-blogs`

## Core Features

- Profiles: base + professional, structured and live
- Experience: place-based entries, draft-first edit model
- Jobs: employer-owned listings, applications routed directly
- Places: Google-backed place entities, claimable, shared

## UX Principles

- Draft → save → confirm
- Preview + edit panels
- Minimal abstraction visible to users

## Constraints

- Legal safety over convenience
- Real-world entities only
- Avoid speculative features

## Status

- Actively developed
- Reference app for ecosystem decisions
- Drives many FireUX architectural choices

#end
