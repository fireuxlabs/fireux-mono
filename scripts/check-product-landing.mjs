#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-02
// usage_note: fast feedback for the product-landing contract; pnpm guard remains the mandatory complete gate.

import process from 'node:process'

import { assertFireuxRuntime } from './_lib/runtime.mjs'
import { run as runProductLanding } from './guards/product-landing.mjs'

const repoRoot = process.cwd()

try {
  assertFireuxRuntime({ repoRoot, label: 'guard:product-landing' })
  await runProductLanding({ repoRoot })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
