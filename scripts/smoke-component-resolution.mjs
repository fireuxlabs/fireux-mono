#!/usr/bin/env node
// FILE: scripts/smoke-component-resolution.mjs

import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

import { parseArgs } from './_lib/args.mjs'
import { DEV_APP_KEYS, getDevApp } from './_lib/dev-apps.mjs'
import {
  ensureFireuxCoreConfigHelpers,
  runPrepareForApp,
  waitForAppReady,
} from './_lib/smoke.mjs'

const ROUTE_TIMEOUT_MS = 20_000
const SHUTDOWN_TIMEOUT_MS = 5_000

const OUTPUT_FAILURE_MARKERS = [
  'Failed to resolve component',
  'Component <Anonymous> is missing template or render function',
]

const HTML_FAILURE_MARKERS = [
  '<organisms-',
  '<console-kitchen',
  '<console-supplier',
  '<console-portfolio',
  '<console-properties',
]

function usage() {
  console.error('Usage: node scripts/smoke-component-resolution.mjs --app <key> [--prepare]')
  console.error(`Known apps: ${DEV_APP_KEYS.join(', ')}`)
}

function preview(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 220)
}

function formatMs(ms) {
  return `${Math.round(ms)}ms`
}

async function fetchRoute(url) {
  const startedAt = performance.now()
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(ROUTE_TIMEOUT_MS),
    headers: {
      'user-agent': 'fireux-component-smoke/1.0',
    },
  })
  const body = await response.text()
  const durationMs = performance.now() - startedAt
  return { response, body, durationMs }
}

function findOutputMarker(output) {
  return OUTPUT_FAILURE_MARKERS.find((marker) => output.includes(marker)) ?? ''
}

function findHtmlMarker(body) {
  const normalized = body.toLowerCase()
  return HTML_FAILURE_MARKERS.find((marker) => normalized.includes(marker)) ?? ''
}

function formatChildExit(exit) {
  if (exit?.error) return exit.error.message
  if (exit?.signal) return `signal ${exit.signal}`
  return `code ${exit?.code ?? 'unknown'}`
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null || child.killed) return

  child.kill('SIGTERM')

  const exited = await Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    delay(SHUTDOWN_TIMEOUT_MS).then(() => false),
  ])

  if (!exited) child.kill('SIGKILL')
}

const args = parseArgs(process.argv.slice(2))
const appKey = typeof args.app === 'string' ? args.app : 'misebox'
const shouldPrepare = args.prepare === true

if (!appKey) {
  usage()
  process.exit(2)
}

const app = getDevApp(appKey)
const routes = app.componentSmokeRoutes?.length ? app.componentSmokeRoutes : app.smokeRoutes

if (shouldPrepare) {
  runPrepareForApp(app)
} else {
  ensureFireuxCoreConfigHelpers()
}

const freePort = spawnSync('node', ['scripts/free-port.mjs', String(app.port)], {
  stdio: 'inherit',
})
if (freePort.status !== 0) process.exit(freePort.status ?? 1)

console.log(`[smoke:components] Starting ${app.name} on ${app.baseUrl}`)

let output = ''
const child = spawn('pnpm', ['--filter', app.filter, 'dev', '--host'], {
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
})

function appendOutput(chunk) {
  const text = chunk.toString()
  output += text
  process.stdout.write(text)
}

child.stdout.on('data', appendOutput)
child.stderr.on('data', appendOutput)

let childExit = null
const childExitPromise = new Promise((resolve) => {
  child.once('exit', (code, signal) => {
    childExit = { code, signal }
    resolve(childExit)
  })

  child.once('error', (error) => {
    childExit = { error }
    resolve(childExit)
  })
})

let failed = false

try {
  const readyResult = await Promise.race([
    waitForAppReady(app).then(() => ({ type: 'ready' })),
    childExitPromise.then((exit) => ({ type: 'exit', exit })),
  ])

  if (readyResult.type === 'exit') {
    throw new Error(
      `[smoke:components] ${app.name} dev server exited before ready (${formatChildExit(readyResult.exit)})`
    )
  }

  for (const route of routes) {
    if (childExit) {
      throw new Error(
        `[smoke:components] ${app.name} dev server exited during smoke (${formatChildExit(childExit)})`
      )
    }

    const url = new URL(route, app.baseUrl).toString()
    const { response, body, durationMs } = await fetchRoute(url)
    const htmlMarker = findHtmlMarker(body)
    const finalUrl = response.url === url ? '' : ` -> ${response.url}`

    if (response.status >= 400 || htmlMarker) {
      failed = true
      console.error(
        `[smoke:components] ✗ ${route} ${response.status}${finalUrl}${htmlMarker ? ` html="${htmlMarker}"` : ''}`
      )
      console.error(`[smoke:components]   ${preview(body)}`)
      continue
    }

    console.log(
      `[smoke:components] ✓ ${route} ${response.status}${finalUrl} ${formatMs(durationMs)}`
    )
  }

  const outputMarker = findOutputMarker(output)
  if (outputMarker) {
    failed = true
    console.error(`[smoke:components] ✗ output marker="${outputMarker}"`)
  }
} catch (error) {
  failed = true
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[smoke:components] ${message}`)
} finally {
  await stopChild(child)
}

if (failed) {
  console.error(`[smoke:components] FAIL ${app.name}`)
  process.exit(1)
}

console.log(`[smoke:components] PASS ${app.name} (${routes.length} routes)`)
