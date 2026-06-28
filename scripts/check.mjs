#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-28
// usage_note: repo health wrapper; runtime + guard, with optional focused package builds.

import { spawnSync } from 'node:child_process'
import process from 'node:process'

import { assertFireuxRuntime } from './_lib/runtime.mjs'

try {
  assertFireuxRuntime({ label: 'check' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const quick = process.argv.includes('--quick')

function run(label, command, args) {
  console.log(`\n$ ${[command, ...args].join(' ')}`)
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  console.log(`[check] ok: ${label}`)
}

run('guard', process.execPath, ['scripts/guard.mjs'])

if (quick) {
  console.log('\n[check] quick check passed. Skipped package builds.')
  process.exit(0)
}

run('fireux-jobs build', 'pnpm', ['--filter', 'fireux-jobs', 'build'])
run('fireux-kitchens build', 'pnpm', ['--filter', 'fireux-kitchens', 'build'])
