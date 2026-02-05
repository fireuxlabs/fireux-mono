# fireux-tenant

Status: **Planned**
Version: **v1**
Updated: 2026-02-05

## Overview

`fireux-tenant` is a tenant-mode app in the FireUX ecosystem intended as a sandbox for testing and experimentation.

App identity (from `projects/fireux/tenant/nuxt.config.ts`):
- `ecosystem: fireux`
- `id: fireux-tenant`
- `name: FireUX Tenant`
- `role: tenant`

Repo location:
- `projects/fireux/tenant`

## Current Config

Configured modules (current):
- None (`modules: []`)

## Intended Use

- Safe place to test new modules, UI surfaces, and flows without impacting `fireux-app`.
- Keep lean; only enable modules when a specific test requires them.
