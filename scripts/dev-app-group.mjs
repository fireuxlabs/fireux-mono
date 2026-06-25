#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.

import process from 'node:process'
import { spawn } from 'node:child_process'
import { parseArgs } from './_lib/args.mjs'
import { APP_GROUPS, getAppGroupKeys } from './_lib/app-registry.mjs'

function usage() {
  console.error('Usage: node scripts/dev-app-group.mjs --group <name>')
  console.error(`Known groups: ${Object.keys(APP_GROUPS).join(', ')}`)
}

const args = parseArgs(process.argv.slice(2))
const group = typeof args.group === 'string' ? args.group : ''

if (!group) {
  usage()
  process.exit(2)
}

const keys = getAppGroupKeys(group)
const children = []
let exiting = false

function shutdown(signal = 'SIGTERM') {
  if (exiting) return
  exiting = true

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill(signal)
      } catch {
        // ignore
      }
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

for (const key of keys) {
  const child = spawn('pnpm', [`dev:${key}`], {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      shutdown(signal)
      process.kill(process.pid, signal)
      return
    }

    if ((code ?? 0) !== 0) {
      shutdown('SIGTERM')
      process.exit(code ?? 1)
    }
  })

  children.push(child)
}
