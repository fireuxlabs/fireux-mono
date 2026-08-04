#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/smoke-prepare.mjs

import process from 'node:process'

import { parseArgs } from './_lib/args.mjs'
import {
  APP_KEYS,
  getAppRegistryEntries,
} from './_lib/app-registry.mjs'
import { runPrepareForApp } from './_lib/smoke.mjs'

function usage() {
  console.error('Usage: node scripts/smoke-prepare.mjs --app <key> | --all')
  console.error(`Known apps: ${APP_KEYS.join(', ')}`)
}

const args = parseArgs(process.argv.slice(2))
const keys =
  args.all === true
    ? APP_KEYS
    : typeof args.app === 'string'
      ? [args.app]
      : []

if (!keys.length) {
  usage()
  process.exit(2)
}

const apps = getAppRegistryEntries(keys)
let failed = false

for (const app of apps) {
  try {
    runPrepareForApp(app)
  } catch (error) {
    failed = true
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
  }
}

process.exit(failed ? 1 : 0)
