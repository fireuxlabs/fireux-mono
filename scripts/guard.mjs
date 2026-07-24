#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-24
// usage_note: validates the authored repository spine after repo-efficiency passes.
// Concurrent edit — 2026-07-24 — FireUX brand authority: guard Core-owned projections into the parent ecosystem and app.
// Concurrent edit — 2026-07-22 01:05 CEST — Dish media verification: record the full repository guard run used for this pass.
// Concurrent edit — 2026-07-19 17:54 CEST — Directory Publication Scaffold: register reconciliation and dormant pipeline guards.
// Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: verify the combined console architecture cut.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: register owner and loading boundary checks.
// Concurrent edit — 2026-07-20 20:54 CEST — Repo Efficiency Pass 3 of 6: register operational script safety checks.
// Concurrent edit — 2026-07-20 22:18 CEST — Both-Entity Authority: register root/app support boundary checks.
// Concurrent edit — 2026-07-20 22:33 CEST — Repo Efficiency Pass 5 of 6: register dependency ownership checks.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: register AST-backed declaration checks.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: register the explicitly named root/App-support authority guard.
// Concurrent edit — 2026-07-21 13:57 CEST — CSS necessity pass: run the full repository gate after reducing the shared stylesheet surface.
// Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: register the shared selected/target presentation guard.
// FILE: scripts/guard.mjs
//
// FireUX Guard — single entrypoint
// Collects ALL violations across all guard groups, then exits once.
//
// IMPORTANT:
// - Individual guards MUST NOT call process.exit(1).
// - Individual guards SHOULD throw Error (with a helpful message) when they fail.
// - This runner catches, aggregates, prints, then exits with code 1.

console.log('[guard] 🔎 Running FireUX guard checks...')

import process from 'node:process'

import { assertFireuxRuntime } from './_lib/runtime.mjs'
import { run as runRoot } from './guards/root.mjs'
import { run as runDevWorkspace } from './guards/dev-workspace.mjs'
import { run as runSecrets } from './guards/secrets.mjs'
import { run as runGeneratedArtifacts } from './guards/generated-artifacts.mjs'
import { run as runDependencyOwnership } from './guards/dependency-ownership.mjs'
import { run as runOperationalScripts } from './guards/operational-scripts.mjs'
import { run as runOwnership } from './guards/ownership.mjs'
import { run as runRuntimeRegistration } from './guards/runtime-registration.mjs'
import { run as runDemoData } from './guards/demo-data.mjs'
import { run as runCanon } from './guards/canon.mjs'
import { run as runComponents } from './guards/components.mjs'
import { run as runCssSystem } from './guards/css-system.mjs'
import { run as runConsolePages } from './guards/console-pages.mjs'
import { run as runConsoleIndexes } from './guards/console-indexes.mjs'
import { run as runCore } from './guards/core.mjs'
import { run as runEcosystem } from './guards/ecosystem.mjs'
import { run as runExtensions } from './guards/extensions.mjs'
import { run as runKitchenMenuSize } from './guards/kitchen-menu-size.mjs'
import { run as runMenuRouteContract } from './guards/menu-route-contract.mjs'
import { run as runProductLanding } from './guards/product-landing.mjs'
import { run as runFireuxBrandAssets } from './guards/fireux-brand-assets.mjs'
import { run as runEntityMatrix } from './guards/entity-matrix.mjs'
import { run as runEntityAuthority } from './guards/entity-authority.mjs'
import { run as runRootAppSupportAuthority } from './guards/root-app-support-authority.mjs'
import { run as runUserAppAccess } from './guards/user-app-access.mjs'
import { run as runDirectoryReconciliation } from './guards/directory-reconciliation.mjs'
import { run as runDirectoryPublication } from './guards/directory-publication.mjs'
import { run as runBlogAuthority } from './guards/blog-authority.mjs'
import { run as runProjects } from './guards/projects.mjs'

const repoRoot = process.cwd()

try {
  assertFireuxRuntime({ repoRoot, label: 'guard' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const guards = [
  { key: 'root', run: runRoot },
  { key: 'dev-workspace', run: runDevWorkspace },
  { key: 'secrets', run: runSecrets },
  { key: 'generated-artifacts', run: runGeneratedArtifacts },
  { key: 'dependency-ownership', run: runDependencyOwnership },
  { key: 'operational-scripts', run: runOperationalScripts },
  { key: 'ownership', run: runOwnership },
  { key: 'runtime-registration', run: runRuntimeRegistration },
  { key: 'demo-data', run: runDemoData },
  { key: 'canon', run: runCanon },
  { key: 'components', run: runComponents },
  { key: 'css-system', run: runCssSystem },
  { key: 'console-pages', run: runConsolePages },
  { key: 'console-indexes', run: runConsoleIndexes },
  { key: 'core', run: runCore },
  { key: 'ecosystem', run: runEcosystem },
  { key: 'extensions', run: runExtensions },
  { key: 'kitchen-menu-size', run: runKitchenMenuSize },
  { key: 'menu-route-contract', run: runMenuRouteContract },
  { key: 'product-landing', run: runProductLanding },
  { key: 'fireux-brand-assets', run: runFireuxBrandAssets },
  { key: 'entity-matrix', run: runEntityMatrix },
  { key: 'entity-authority', run: runEntityAuthority },
  { key: 'root-app-support-authority', run: runRootAppSupportAuthority },
  { key: 'user-app-access', run: runUserAppAccess },
  { key: 'directory-reconciliation', run: runDirectoryReconciliation },
  { key: 'directory-publication', run: runDirectoryPublication },
  { key: 'blog-authority', run: runBlogAuthority },
  { key: 'projects', run: runProjects },
]

const errors = []

for (const g of guards) {
  try {
    await g.run({ repoRoot })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : JSON.stringify(err, null, 2)

    errors.push({ guard: g.key, message })
  }
}

if (errors.length) {
  console.error('\n[guard] ❌ Guard violations detected:\n')

  for (const e of errors) {
    console.error(`--- ${e.guard.toUpperCase()} ---`)
    console.error(e.message.trimEnd())
    console.error('')
  }

  console.error(
    `[guard] Fix the violations above, then re-run:\n  pnpm guard\n`
  )
  process.exit(1)
}

console.log('[guard] ✅ All guards passed')
console.log('[guard] 🎯 Guard completed successfully')
