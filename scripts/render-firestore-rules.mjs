#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-21
// usage_note: check deterministic Firestore Rules artifacts or explicitly regenerate known ecosystem targets.
// Concurrent edit — 2026-07-21 15:27 CEST — Shared Firestore Rules pass: expose read-only drift checking and explicit artifact rendering.

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  assertAllFirestoreRulesArtifactsCurrent,
  assertFirestoreRulesArtifactCurrent,
  listFirestoreRulesTargets,
} from './_lib/firestore-rules-source.mjs'

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Render FireUX Firestore Security Rules.

Usage:
  node scripts/render-firestore-rules.mjs --check [--ecosystem <key>]
  node scripts/render-firestore-rules.mjs --write [--ecosystem <key>]

No action defaults to --check. Check is read-only. Write updates only the fixed
tracked artifact declared by a known ecosystem template; deploy and migration
commands never render implicitly.
`)
  process.exit(0)
}

if (args.write) {
  const targets = (await listFirestoreRulesTargets()).filter(
    (target) => !args.ecosystem || target.manifest.key === args.ecosystem
  )
  if (!targets.length)
    throw new Error(`Unknown Rules ecosystem ${args.ecosystem}.`)

  for (const target of targets) {
    await mkdir(path.dirname(target.artifactPath), { recursive: true })
    await writeFile(target.artifactPath, target.content, 'utf8')
  }
  printTargets('write', targets)
} else {
  const targets = args.ecosystem
    ? [await assertFirestoreRulesArtifactCurrent(args.ecosystem)]
    : await assertAllFirestoreRulesArtifactsCurrent()
  printTargets('check', targets)
}

function parseArgs(values) {
  const parsed = { check: false, write: false, ecosystem: '', help: false }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--check') parsed.check = true
    else if (value === '--write') parsed.write = true
    else if (value === '--help' || value === '-h') parsed.help = true
    else if (value === '--ecosystem') {
      const key = values[index + 1]
      if (!key || key.startsWith('--'))
        throw new Error('--ecosystem requires a key.')
      parsed.ecosystem = key
      index += 1
    } else throw new Error(`Unknown argument: ${value}`)
  }

  if (parsed.check && parsed.write) {
    throw new Error('Choose either --check or --write.')
  }
  if (parsed.ecosystem && !/^[a-z][a-z0-9-]*$/.test(parsed.ecosystem)) {
    throw new Error('Rules ecosystem key is invalid.')
  }
  return parsed
}

function printTargets(mode, targets) {
  console.log(
    JSON.stringify(
      {
        mode,
        targets: targets.map((target) => ({
          ecosystem: target.manifest.key,
          projectId: target.manifest.projectId,
          databaseIds: target.manifest.databaseIds,
          artifact: path.relative(process.cwd(), target.artifactPath),
          sha256: target.sha256,
        })),
      },
      null,
      2
    )
  )
}
