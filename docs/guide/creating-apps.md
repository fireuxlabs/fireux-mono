---
title: Creating Apps
description: Scaffold, configure, and run a FireUX app.
---

# Creating Apps

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

- Copy `.env.example` → `.env.local` and fill Firebase + app IDs.

## 5) Run

Start the dev server (see commands above) and open the target port (default 3000 for FireUX).

## 6) Next

- Review profiles model: `profiles.md`
- Learn architecture basics: `../architecture/`
