---
title: Creating Apps
description: Scaffold, configure, and run a FireUX app.
updated: 2026-03-02
---

# Creating Apps
Authority: Tier2 (Operational)

## 1) Prerequisites

- Node 18+, `pnpm` installed
- Firebase project and env vars available

## 2) Install deps

```sh
pnpm install
```

## 3) Pick a dev target

- FireUX app: `pnpm dev:fireux`
- All apps: `pnpm dev:all-extended`

## 4) Configure env

- Create `.env.local` from `templates/.env.app.template` and fill values.

## 5) Run

Start the dev server (see commands above) and open the target port (default 3000 for FireUX).

## 6) Next

- Add a first-class new app: `new-app.creation.md`
- Review profiles model: `profiles.md`
- Learn architecture basics: `../architecture/`

## 7) App Identity Rule

- App identity is `app.id` from `defineFireuxConfig(...)`.
- Firestore path is `apps/{appId}` and app id should be stable kebab-case.
- Treat app renames as display-field changes (`app_name`, `app_short_name`), not id changes.
- Canon source: `../runtime-contract.md`.
