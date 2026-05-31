---
title: Creating Apps
description: Scaffold, configure, and run a FireUX app.
updated: 2026-05-30
---

# Creating Apps
Authority: Tier2 (Operational)

FireUX apps must follow the existing factory path. Do not create a standalone Nuxt shell and stop there. New app work must follow `new-app.creation.md`, including registry wiring, Explorer launcher wiring, generated workspace sync, app media, and fast checks.

This page is for configuring and running apps. If the task is to create a new app, stop here and use `new-app.creation.md` first. Development starts only after that guide's pre-dev gate has been completed or its blocked items have been named.

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

## 6) New App Work

For a first-class new app, use `new-app.creation.md` as the required system. The app is not considered aligned until the app folder, runtime config, registry, TypeScript references, Explorer launcher, generated VS Code files, package scripts, app media, Firebase shape when in scope, and fast checks agree.

## 7) Next

- Review profiles model: `profiles.md`
- Learn architecture basics: `../architecture/`

## 8) App Identity Rule

- App identity is `app.id` from `defineFireuxConfig(...)`.
- Firestore path is `apps/{appId}` and app id should be stable kebab-case.
- Treat app renames as display-field changes (`app_name`, `app_short_name`), not id changes.
- Canon source: `../runtime-contract.md`.
