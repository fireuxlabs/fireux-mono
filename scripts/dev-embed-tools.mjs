#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/dev-embed-tools.mjs
// Starts the external embed harness plus the local provider apps used by it.

import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'

import { APP_REGISTRY } from './_lib/app-registry.mjs'

const providerKeys = ['go-qr', 'sproochli', 'misebox']
const harnessPort = 3025
const children = []
let exiting = false

function runStep(label, command, args) {
  console.log(`[embed-tools] ${label}`)

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

function startChild(label, command, args, env = process.env) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env,
  })

  child.on('exit', (code, signal) => {
    if (exiting) return

    if (signal) {
      shutdown(signal)
      process.kill(process.pid, signal)
      return
    }

    if ((code ?? 0) !== 0) {
      console.error(`[embed-tools] ${label} exited with code ${code}`)
      shutdown('SIGTERM')
      process.exit(code ?? 1)
    }
  })

  children.push(child)
}

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

runStep('Preparing fireux-core config helpers once', 'node', [
  'scripts/build-fireux-core-config.mjs',
])

for (const port of [harnessPort, ...providerKeys.map((key) => APP_REGISTRY[key].port)]) {
  runStep(`Freeing port ${port}`, 'node', ['scripts/free-port.mjs', String(port)])
}

startChild('harness', 'node', ['scripts/serve-static-harness.mjs'], {
  ...process.env,
  PORT: String(harnessPort),
})

for (const key of providerKeys) {
  const app = APP_REGISTRY[key]
  startChild(app.name, 'pnpm', ['--filter', app.workspace, 'dev'])
}

console.log('[embed-tools] Open http://localhost:3025')
