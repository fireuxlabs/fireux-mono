#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-17
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/smoke-app.mjs

import process from 'node:process'

import { parseArgs } from './_lib/args.mjs'
import { DEV_APP_KEYS, getDevApps } from './_lib/dev-apps.mjs'
import { runRouteSmokeForApp } from './_lib/smoke.mjs'

function usage() {
  console.error('Usage: node scripts/smoke-app.mjs --app <key> | --all')
  console.error(`Known apps: ${DEV_APP_KEYS.join(', ')}`)
}

const args = parseArgs(process.argv.slice(2))
const keys =
  args.all === true
    ? DEV_APP_KEYS
    : typeof args.app === 'string'
      ? [args.app]
      : []

if (!keys.length) {
  usage()
  process.exit(2)
}

const apps = getDevApps(keys)
let failed = false

for (const app of apps) {
  try {
    await runRouteSmokeForApp(app)
  } catch (error) {
    failed = true
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
  }
}

process.exit(failed ? 1 : 0)
