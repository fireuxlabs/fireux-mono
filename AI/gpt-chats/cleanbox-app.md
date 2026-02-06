# cleanbox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

## Overview

`cleanbox.app` is the main application of the Cleanbox ecosystem. It is a reusable service-business app built on FireUX.

App identity (from `projects/cleanbox/cleanbox-app/nuxt.config.ts`):
- `id: cleanbox-app`
- `name: Cleanbox`
- `role: global`

Repo location:
- `projects/cleanbox/cleanbox-app`

## Purpose

- Global Cleanbox app shell (Cleanbox ecosystem)
- Template base for Cleanbox tenant apps (example: Richie’s)
- Landing-first surface (current implementation)

## Technical Stack

- Nuxt 3
- Firebase
- FireUX Core
- Minimal module surface

Configured modules (current):
- `fireux-products`
- `fireux-blogs`

## Core Features

- Landing page for the Cleanbox concept (`app/pages/index.vue`)
- Reusable landing components (hero/solutions/quick-peek)
- Routes referenced by CTAs are not yet scaffolded (see `docs/gap.md`)

No marketplace logic. No job matching.

## UX Philosophy

- Simplicity first
- Fast load
- Clear actions
- Minimal configuration

## Role in FireUX

- Template base
- Subscription product
- Starting point for client work

## Status

- Active
- Base for Richie’s app
- Evolving slowly and deliberately

#end
