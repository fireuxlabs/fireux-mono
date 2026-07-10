#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
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
import { run as runOwnership } from './guards/ownership.mjs'
import { run as runCanon } from './guards/canon.mjs'
import { run as runComponents } from './guards/components.mjs'
import { run as runCore } from './guards/core.mjs'
import { run as runEcosystem } from './guards/ecosystem.mjs'
import { run as runExtensions } from './guards/extensions.mjs'
import { run as runKitchenMenuSize } from './guards/kitchen-menu-size.mjs'
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
  { key: 'ownership', run: runOwnership },
  { key: 'canon', run: runCanon },
  { key: 'components', run: runComponents },
  { key: 'core', run: runCore },
  { key: 'ecosystem', run: runEcosystem },
  { key: 'extensions', run: runExtensions },
  { key: 'kitchen-menu-size', run: runKitchenMenuSize },
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

  console.error(`[guard] Fix the violations above, then re-run:\n  pnpm guard\n`)
  process.exit(1)
}

console.log('[guard] ✅ All guards passed')
console.log('[guard] 🎯 Guard completed successfully')
