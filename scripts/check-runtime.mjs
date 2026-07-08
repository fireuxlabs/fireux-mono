#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-08
// usage_note: validates Node/pnpm runtime contract.

import process from 'node:process'

import { checkFireuxRuntime } from './_lib/runtime.mjs'

const args = new Set(process.argv.slice(2))
const metadataOnly = args.has('--metadata-only')
const result = checkFireuxRuntime({ metadataOnly })

if (result.ok) {
  console.log(
    `[runtime] ok: Node ${result.expected.nodeVersion} (${result.expected.nodeRange}), pnpm ${result.expected.pnpmVersion}`
  )
  process.exit(0)
}

console.error('[runtime] mismatch:')
for (const issue of result.issues) {
  console.error(`- ${issue}`)
}
console.error('')
console.error(
  `Expected Node ${result.expected.nodeVersion} (${result.expected.nodeRange}) and pnpm ${result.expected.pnpmVersion}.`
)
process.exit(1)
