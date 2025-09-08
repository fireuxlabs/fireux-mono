# FireUX Monorepo — Condensed Guide

This is the short, practical overview of the repo. It consolidates the previous root-level docs into one place and links to deeper references under copilot-documentation/.

## What’s here

- Stack: Nuxt 4, Vue 3.5, Vite 7, TypeScript 5.9, pnpm workspaces
- Core module: fireux-core (shared config, runtime, server routes)
- Tenants: fireux-misebox, fireux-cleanbox, fireux-fireux
- Extensions: fireux-jobs, fireux-places
- Apps: fireux-app (3000), misebox-app (3001), cleanbox-app (3002), niederhorn (3003), richies-reinigung (3004)

## Dev quickstart

- Run all apps: pnpm dev:all (or individual tasks per app)
- Build packages: pnpm build:packages
- Typecheck: pnpm typecheck:apps (apps), pnpm typecheck:packages (packages)

## App shape (all apps)

Each app under projects/<ecosystem>/<app> follows:
- app/ (source root: pages, layouts, components, composables)
- public/ (static assets; includes pwa.svg)
- nuxt.config.ts (calls createFireuxConfig)
- tsconfig.json (extends .nuxt/tsconfig.json)

## Config factory

File: packages/core/fireux-core/src/runtime/utils/fireux-config.ts

Responsibilities:
- Composes NuxtConfig for apps (modules, runtimeConfig, imports)
- Enables modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt
- Exposes runtimeConfig.public.firebaseConfig and appSettings
- Sets compatibilityDate and TS defaults

## Firebase (client + SSR)

- VueFire via nuxt-vuefire is configured by the config factory
- Client keys map from env to runtimeConfig.public.firebaseConfig
- SSR/admin: use FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (path) for server utilities
- Health endpoints: /api/health, /api/app

More: copilot-04-firebase.md

## PWA

- @vite-pwa/nuxt added in modules with sensible defaults
- <NuxtPwaAssets /> included in app/app.vue for icons/splash/favicons
- public/pwa.svg is the source asset per app

More: see Copilot Docs: `../copilot-03-config.md` (Nuxt/TS/Env) and upstream PWA docs

## App shell (app.vue)

- Unified across apps: wraps <NuxtLayout><NuxtPage/> and injects <NuxtPwaAssets />
- Optional ClientOnly debug overlay and onboarding modal

More: see Copilot Docs: `../copilot-02-structure.md` (app shape) and `../copilot-07-conventions.md`

## Server

- Core server routes in packages/core/fireux-core/src/runtime/server/api/*
- Notable: /api/health, /api/app, stripe stubs; no direct #app/#build imports on server

More: see Copilot Docs: `../copilot-01-overview.md` and server sections in module docs

## Typescript

- moduleResolution: Bundler
- Apps extend .nuxt/tsconfig.json and include .nuxt/nuxt.d.ts
- Known: some @vite-pwa virtual modules may require updated types; no shims are kept by policy

More: see Copilot Docs: `../copilot-05-dev-workflow.md` and `../copilot-appendices/copilot-error-handbook.md`

## Tenants & Extensions

- Tenants install fireux-core and may add layouts/pages/components
- Extensions (jobs/places) provide optional features wired via module.ts

More: see `../copilot-05-projects.md` and extensions docs

## Troubleshooting

- Environment: use tools/scripts/lint-envs.mjs and /api/health
- Firebase: prefer VueFire init; avoid duplicate app/auth init
- PWA: ensure public/pwa.svg and <NuxtPwaAssets/> present; upgrade module if TS virtuals fail

More: see `../copilot-appendices/copilot-troubleshooting.md` and `../copilot-appendices/copilot-error-handbook.md`

## Housekeeping

- Keep app shells aligned and minimal
- Prefer explicit model imports over broad index-barrels
- Avoid shims for virtual modules; fix underlying config or update dependencies

— End condensed guide —
