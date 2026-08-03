#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-03
// usage_note: check or explicitly refresh the local Werkbox build-source attestation consumed by guarded migration and Rules release gates.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { buildWerkboxServerSourceEvidence } from './_lib/werkbox-security-contract.mjs'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const contractPath = path.join(
  repoRoot,
  'packages/ecosystem/fireux-werkbox/src/runtime/server/api/internal/werkbox/security-contract.get.ts'
)
const hashPattern =
  /(WERKBOX_SERVER_SOURCE_SHA256\s*=\s*\n?\s*')([a-f0-9]{64})(' as const)/
const args = new Set(process.argv.slice(2))

for (const arg of args) {
  if (!['--help', '--write'].includes(arg)) {
    throw new Error(`Unknown option: ${arg}`)
  }
}

if (args.has('--help')) {
  console.log(`
Check the deterministic Werkbox server-source attestation:
  pnpm werkbox:security-contract

Refresh the local endpoint constant after reviewing all manifest changes:
  pnpm werkbox:security-contract -- --write

This command never deploys an App, mutates Firebase, or changes Firestore Rules.
`)
  process.exit(0)
}

const source = await readFile(contractPath, 'utf8')
const currentHash = source.match(hashPattern)?.[2]
if (!currentHash) {
  throw new Error('Werkbox security-contract endpoint has no exact source hash.')
}

const evidence = await buildWerkboxServerSourceEvidence({ repoRoot })
if (currentHash === evidence.sha256) {
  console.log(`[werkbox-security-contract] ✅ current ${currentHash}`)
  process.exit(0)
}

if (!args.has('--write')) {
  console.error(
    [
      '[werkbox-security-contract] ❌ local attestation is stale',
      `actual:   ${currentHash}`,
      `expected: ${evidence.sha256}`,
      'Review the manifest changes, then run:',
      '  pnpm werkbox:security-contract -- --write',
    ].join('\n')
  )
  process.exit(1)
}

const nextSource = source.replace(
  hashPattern,
  `$1${evidence.sha256}$3`
)
await writeFile(contractPath, nextSource, 'utf8')
console.log(
  `[werkbox-security-contract] ✅ wrote ${evidence.sha256} to ${path.relative(repoRoot, contractPath)}`
)
