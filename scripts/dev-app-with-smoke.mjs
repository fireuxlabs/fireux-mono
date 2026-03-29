#!/usr/bin/env node
// FILE: scripts/dev-app-with-smoke.mjs

import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'

import { parseArgs } from './_lib/args.mjs'
import { DEV_APP_KEYS, getDevApp } from './_lib/dev-apps.mjs'
import { runPrepareForApp, runRouteSmokeForApp, waitForAppReady } from './_lib/smoke.mjs'

function usage() {
  console.error('Usage: node scripts/dev-app-with-smoke.mjs --app <key> [--skip-prepare] [--skip-smoke]')
  console.error(`Known apps: ${DEV_APP_KEYS.join(', ')}`)
}

const args = parseArgs(process.argv.slice(2))
const appKey = typeof args.app === 'string' ? args.app : ''

if (!appKey) {
  usage()
  process.exit(2)
}

const app = getDevApp(appKey)
const skipPrepare = args['skip-prepare'] === true
const skipSmoke = args['skip-smoke'] === true

const freePort = spawnSync('node', ['scripts/free-port.mjs', String(app.port)], {
  stdio: 'inherit',
})
if (freePort.status !== 0) process.exit(freePort.status ?? 1)

if (!skipPrepare) {
  runPrepareForApp(app)
}

console.log(`[dev] Starting ${app.name} on ${app.baseUrl}`)
const child = spawn('pnpm', ['--filter', app.filter, 'dev'], {
  stdio: 'inherit',
  env: process.env,
})

function shutdown(signal) {
  if (!child.killed) child.kill(signal)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 0)
})

try {
  await waitForAppReady(app)

  if (!skipSmoke) {
    await runRouteSmokeForApp(app)
  }

  console.log(`[dev] ${app.name} smoke checks passed`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  shutdown('SIGTERM')
  process.exit(1)
}
