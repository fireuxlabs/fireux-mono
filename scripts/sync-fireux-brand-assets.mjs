#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-24
// usage_note: check FireUX brand projections by default; pass --write to update them from the Core-owned source family.

import process from 'node:process'
import {
  inspectFireuxBrandAssetProjections,
  syncFireuxBrandAssetProjections,
} from './_lib/fireux-brand-assets.mjs'

const supportedArguments = new Set(['--check', '--write'])
const argumentsList = process.argv.slice(2)
const unknownArguments = argumentsList.filter(
  (argument) => !supportedArguments.has(argument)
)

if (unknownArguments.length) {
  console.error(
    `[fireux-brand] Unsupported argument(s): ${unknownArguments.join(', ')}`
  )
  process.exitCode = 1
} else {
  if (argumentsList.includes('--write')) {
    const written = syncFireuxBrandAssetProjections(process.cwd())
    console.log(
      `[fireux-brand] Updated ${written.length} projections from the Core brand source.`
    )
  }

  const violations = inspectFireuxBrandAssetProjections(process.cwd())

  if (violations.length) {
    console.error(
      [
        '[fireux-brand] FireUX brand projections are not current:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Update them with:',
        '  node scripts/sync-fireux-brand-assets.mjs --write',
      ].join('\n')
    )
    process.exitCode = 1
  } else {
    console.log('[fireux-brand] FireUX brand projections are current.')
  }
}
