# FireUX – Cleanbox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

## Purpose

Cleanbox is a service-industry ecosystem built on FireUX, parallel to Misebox but focused on cleaning and local services. It exists to prove FireUX works across industries.

Primary app:
- `cleanbox.app` (`projects/cleanbox/cleanbox-app`, id: `cleanbox-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-cleanbox` (`fireux-cleanbox`)

## Scope

- Industry: Cleaning and local services
- Users: Cleaning companies, operators, staff (future)
- Not marketplace-first

## Core Differences vs Misebox

- Company-centric, not professional-centric
- Fewer roles
- Less abstraction
- Faster conversion focus

## FireUX Components Used

- FireUX Core
- Global app modules (current): `fireux-products`, `fireux-blogs`

No jobs marketplace by default.

## Domain Model (Direction)

- Company as central entity
- Owner or admin profile
- Place for business location and service areas

Note: this is the intended framing; the current global app config only enables `fireux-products` and `fireux-blogs`.

## Apps in the Ecosystem

- `cleanbox.app` (`id: cleanbox-app`, role: global)
- Client-specific tenant apps (example: `richies-reinigung`)

Each app is single-company focused and uses FireUX primitives.

## Strategic Role

- Grounds FireUX in real businesses
- Prevents over-abstraction
- Acts as template and SaaS proof

## Status

- Ecosystem structure: stable
- Used to validate pricing and scope
- Actively influencing FireUX decisions
- `cleanbox.app` is currently landing-first; many operational routes referenced by CTAs are not yet scaffolded.

#end
