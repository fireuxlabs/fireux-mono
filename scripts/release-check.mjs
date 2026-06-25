#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/release-check.mjs

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const steps = [
  ['clean local artifacts', ['pre-guard-clean']],
  ['shape guard', ['guard']],
  ['package typecheck', ['typecheck:packages']],
  ['package build', ['build:packages']],
  ['component smoke', ['smoke:components']],
]

function run(label, args) {
  console.log(`\n[release:check] ${label}`)
  console.log(`[release:check] pnpm ${args.join(' ')}`)

  const result = spawnSync('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  })

  return result.status ?? 1
}

let exitCode = 0

try {
  for (const [label, args] of steps) {
    exitCode = run(label, args)
    if (exitCode !== 0) break
  }
} finally {
  const cleanExitCode = run('final artifact clean', ['pre-guard-clean'])
  if (exitCode === 0) exitCode = cleanExitCode
}

if (exitCode === 0) {
  console.log('\n[release:check] PASS')
} else {
  console.error('\n[release:check] FAIL')
}

process.exit(exitCode)
