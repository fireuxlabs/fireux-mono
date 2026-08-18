#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-04
// usage_note: validates the authored repository spine after repo-efficiency passes.
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
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { assertFireuxRuntime } from './_lib/runtime.mjs'
import { run as runRoot } from './guards/root.mjs'
import { run as runDocumentation } from './guards/documentation.mjs'
import { run as runDevWorkspace } from './guards/dev-workspace.mjs'
import { run as runSecrets } from './guards/secrets.mjs'
import { run as runGeneratedArtifacts } from './guards/generated-artifacts.mjs'
import { run as runDependencyOwnership } from './guards/dependency-ownership.mjs'
import { run as runImportBoundaries } from './guards/import-boundaries.mjs'
import { run as runOperationalScripts } from './guards/operational-scripts.mjs'
import { run as runScriptLifecycle } from './guards/script-lifecycle.mjs'
import { run as runOwnership } from './guards/ownership.mjs'
import { run as runRuntimeRegistration } from './guards/runtime-registration.mjs'
import { run as runDemoData } from './guards/demo-data.mjs'
import { run as runCanon } from './guards/canon.mjs'
import { run as runSlugCanon } from './guards/slug-canon.mjs'
import { run as runComponents } from './guards/components.mjs'
import { run as runCssSystem } from './guards/css-system.mjs'
import { run as runConsolePages } from './guards/console-pages.mjs'
import { run as runConsoleIndexes } from './guards/console-indexes.mjs'
import { run as runLikeMenuFamily } from './guards/like-menu-family.mjs'
import { run as runCore } from './guards/core.mjs'
import { run as runEcosystem } from './guards/ecosystem.mjs'
import { run as runExtensions } from './guards/extensions.mjs'
import { run as runAuthoredSourceSize } from './guards/authored-source-size.mjs'
import { run as runMenuRouteContract } from './guards/menu-route-contract.mjs'
import { run as runProductLanding } from './guards/product-landing.mjs'
import { run as runLandingTemplates } from './guards/landing-templates.mjs'
import { run as runFinance } from './guards/finance.mjs'
import { run as runFireuxBrandAssets } from './guards/fireux-brand-assets.mjs'
import { run as runBuenoHostBrandAssets } from './guards/buenohost-brand-assets.mjs'
import { run as runEntityMatrix } from './guards/entity-matrix.mjs'
import { run as runEntityAuthority } from './guards/entity-authority.mjs'
import { run as runEntityUpdateContract } from './guards/entity-update-contract.mjs'
import { run as runRootAppSupportAuthority } from './guards/root-app-support-authority.mjs'
import { run as runEntityManagement } from './guards/entity-management.mjs'
import { run as runAppUserAccess } from './guards/user-app-access.mjs'
import { run as runKitchenPublicProjection } from './guards/kitchen-public-projection.mjs'
import { run as runIngredientAuthority } from './guards/ingredient-authority.mjs'
import { run as runSupplyChainAuthority } from './guards/supply-chain-authority.mjs'
import { run as runKitchenFoodAuthority } from './guards/kitchen-food-authority.mjs'
import { run as runOrderSaleCustomerAuthority } from './guards/order-sale-customer-authority.mjs'
import { run as runBlogAuthority } from './guards/blog-authority.mjs'
import { run as runSproochliCopy } from './guards/sproochli-copy.mjs'
import { run as runProjects } from './guards/projects.mjs'
import { run as runPrivacyMeasurement } from './guards/privacy-measurement.mjs'
import { run as runReservationAuthority } from './guards/reservation-authority.mjs'
import { run as runSeoSpine } from './guards/seo-spine.mjs'
import { run as runFirestoreMutations } from './guards/firestore-mutations.mjs'

const repoRoot = process.cwd()

try {
  assertFireuxRuntime({ repoRoot, label: 'guard' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const guards = [
  { key: 'root', run: runRoot },
  { key: 'documentation', run: runDocumentation },
  { key: 'dev-workspace', run: runDevWorkspace },
  { key: 'secrets', run: runSecrets },
  { key: 'generated-artifacts', run: runGeneratedArtifacts },
  { key: 'dependency-ownership', run: runDependencyOwnership },
  { key: 'import-boundaries', run: runImportBoundaries },
  { key: 'operational-scripts', run: runOperationalScripts },
  { key: 'script-lifecycle', run: runScriptLifecycle },
  { key: 'ownership', run: runOwnership },
  { key: 'runtime-registration', run: runRuntimeRegistration },
  { key: 'demo-data', run: runDemoData },
  { key: 'canon', run: runCanon },
  { key: 'slug-canon', run: runSlugCanon },
  { key: 'components', run: runComponents },
  { key: 'css-system', run: runCssSystem },
  { key: 'console-pages', run: runConsolePages },
  { key: 'console-indexes', run: runConsoleIndexes },
  { key: 'like-menu-family', run: runLikeMenuFamily },
  { key: 'core', run: runCore },
  { key: 'ecosystem', run: runEcosystem },
  { key: 'extensions', run: runExtensions },
  { key: 'authored-source-size', run: runAuthoredSourceSize },
  { key: 'menu-route-contract', run: runMenuRouteContract },
  { key: 'product-landing', run: runProductLanding },
  { key: 'landing-templates', run: runLandingTemplates },
  { key: 'finance', run: runFinance },
  { key: 'fireux-brand-assets', run: runFireuxBrandAssets },
  { key: 'buenohost-brand-assets', run: runBuenoHostBrandAssets },
  { key: 'entity-matrix', run: runEntityMatrix },
  { key: 'entity-authority', run: runEntityAuthority },
  { key: 'entity-update-contract', run: runEntityUpdateContract },
  { key: 'root-app-support-authority', run: runRootAppSupportAuthority },
  { key: 'entity-management', run: runEntityManagement },
  { key: 'user-app-access', run: runAppUserAccess },
  { key: 'kitchen-public-projection', run: runKitchenPublicProjection },
  { key: 'ingredient-authority', run: runIngredientAuthority },
  { key: 'supply-chain-authority', run: runSupplyChainAuthority },
  { key: 'kitchen-food-authority', run: runKitchenFoodAuthority },
  { key: 'order-sale-customer-authority', run: runOrderSaleCustomerAuthority },
  { key: 'blog-authority', run: runBlogAuthority },
  { key: 'sproochli-copy', run: runSproochliCopy },
  { key: 'projects', run: runProjects },
  { key: 'privacy-measurement', run: runPrivacyMeasurement },
  { key: 'reservation-authority', run: runReservationAuthority },
  { key: 'seo-spine', run: runSeoSpine },
  { key: 'firestore-mutations', run: runFirestoreMutations },
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
    const sourceKey =
      e.guard === 'app-user-access' ? 'user-app-access' : e.guard
    const source = `scripts/guards/${sourceKey}.mjs`
    if (existsSync(join(repoRoot, source))) {
      console.error(`\nOwner: ${source}`)
    }
    console.error(
      'Repair: fix the reported source boundary, compare its nearest working sibling, then rerun pnpm guard.'
    )
    console.error('')
  }

  console.error(
    `[guard] Fix the violations above, then re-run:\n  pnpm guard\n`
  )
  process.exit(1)
}

console.log('[guard] ✅ All guards passed')
console.log('[guard] 🎯 Guard completed successfully')
