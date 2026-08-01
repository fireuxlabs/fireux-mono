#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/lint-envs.mjs
//
// Strict local env presence check. Per-app `.env` files are intentionally
// gitignored, so this diagnostic is not run against a clean CI checkout.

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const projectsRoot = path.join(repoRoot, 'projects')

if (!existsSync(projectsRoot)) {
  console.log('[envs] projects/ not found; nothing to check')
  process.exit(0)
}

const missing = []

const orgs = readdirSync(projectsRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
  .map((d) => d.name)

for (const org of orgs) {
  const orgPath = path.join(projectsRoot, org)
  const apps = readdirSync(orgPath, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  for (const app of apps) {
    const appRoot = path.join(orgPath, app)
    const envPath = path.join(appRoot, '.env')

    // Only check directories that look like apps (guard-required L1 files).
    const hasNuxtConfig = existsSync(path.join(appRoot, 'nuxt.config.ts'))
    const hasPkgJson = existsSync(path.join(appRoot, 'package.json'))
    if (!hasNuxtConfig || !hasPkgJson) continue

    if (!existsSync(envPath)) {
      missing.push(path.relative(repoRoot, envPath))
    }
  }
}

if (!missing.length) {
  console.log('[envs] ✅ .env files present for all apps')
  process.exit(0)
}

console.error('[envs] ❌ Missing required .env files:')
missing.forEach((p) => console.error(`  - ${p}`))
console.error('')
console.error('[envs] Fix:')
console.error('- Create .env files for each app under projects/*/*/.env')
process.exit(1)
