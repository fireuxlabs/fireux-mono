# FireUX – FireUX Ecosystem

Status: **Active**
Updated: 2026-02-05

## Purpose

The FireUX ecosystem is the first-party FireUX-branded ecosystem. It provides branding, configuration, and ecosystem wiring used by FireUX apps.

Primary app:
- `fireux-app` (`projects/fireux/fireux-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-fireux` (`fireux-fireux`)

## Scope

- Industry: FireUX platform + first-party apps
- Audience: FireUX users, developers, and demos

## FireUX Components Used (Configured Today)

From `projects/fireux/fireux-app/nuxt.config.ts`:
- FireUX Core
- Modules: `fireux-products`, `fireux-blogs`

## Apps in the Ecosystem

Current apps (from `projects/fireux/`):
- `fireux-app` (global)
- `fireux-tenant` (tenant, intentionally lean)

## Status

- Ecosystem package exists and is stable
- Global app config is lean (products + blogs)
