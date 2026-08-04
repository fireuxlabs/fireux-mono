#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-04
// usage_note: measures shared verification commands without imposing unproved performance thresholds.

import { spawnSync } from 'node:child_process'
import { cpus, platform, arch } from 'node:os'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const quick = process.argv.includes('--quick')
const steps = quick
  ? [
      ['guard', ['guard']],
      ['package typecheck', ['typecheck:packages']],
    ]
  : [
      ['guard', ['guard']],
      ['package typecheck', ['typecheck:packages']],
      ['package build', ['build:packages']],
      ['App typecheck', ['typecheck:apps']],
    ]

const results = []
for (const [label, args] of steps) {
  console.log(`\n[measure:workspace] ${label}: pnpm ${args.join(' ')}`)
  const started = process.hrtime.bigint()
  const result = spawnSync('pnpm', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  })
  const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000
  results.push({
    label,
    command: `pnpm ${args.join(' ')}`,
    duration_ms: Math.round(durationMs),
    exit_code: result.status ?? 1,
  })
}

const report = {
  format: 'fireux-workspace-measurement/1',
  measured_at: new Date().toISOString(),
  mode: quick ? 'quick' : 'full',
  environment: {
    node: process.version,
    platform: platform(),
    architecture: arch(),
    logical_cpu_count: cpus().length,
  },
  results,
  total_duration_ms: results.reduce(
    (total, result) => total + result.duration_ms,
    0
  ),
}

console.log('\n[measure:workspace] RESULT')
console.log(JSON.stringify(report, null, 2))

process.exit(results.some((result) => result.exit_code !== 0) ? 1 : 0)
