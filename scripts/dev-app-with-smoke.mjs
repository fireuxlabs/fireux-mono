#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-24
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/dev-app-with-smoke.mjs
// Concurrent edit — 2026-07-20 15:54 CEST — Repo Efficiency Pass 1 of 6: run the Misebox route and contract smoke suite.
// Concurrent edit — 2026-07-21 20:29 CEST — Misebox dev stability pass: reuse a verified healthy same-checkout app without killing it.
// Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: run the Misebox route and contract smoke suite for live visual verification.

import { spawnSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parseArgs } from './_lib/args.mjs'
import {
  APP_KEYS,
  getAppRegistryEntry,
} from './_lib/app-registry.mjs'
import { assertFireuxRuntime } from './_lib/runtime.mjs'
import {
  ensureFireuxCoreConfigHelpers,
  runPrepareForApp,
  runRouteSmokeForApp,
  waitForAppReady,
} from './_lib/smoke.mjs'
import { spawnPnpm } from './_lib/pnpm.mjs'

try {
  assertFireuxRuntime({ label: 'dev-app' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

function usage() {
  console.error('Usage: node scripts/dev-app-with-smoke.mjs --app <key> [--checked] [--prepare] [--smoke] [--host [host]] [--go-qr-provider deployed|local|url]')
  console.error(`Known apps: ${APP_KEYS.join(', ')}`)
}

const args = parseArgs(process.argv.slice(2))
const rawArgs = process.argv.slice(2)
const appKey = typeof args.app === 'string' ? args.app : ''
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

if (!appKey) {
  usage()
  process.exit(2)
}

const app = getAppRegistryEntry(appKey)
const checked = args.checked === true
const shouldPrepare =
  args['skip-prepare'] !== true && (checked || args.prepare === true)
const shouldSmoke =
  args['skip-smoke'] !== true && (checked || args.smoke === true)

function collectPassthroughArgs(argv) {
  const passthrough = []
  const handled = new Set([
    'app',
    'checked',
    'prepare',
    'smoke',
    'skip-prepare',
    'skip-smoke',
    'go-qr-provider',
  ])

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token || !token.startsWith('--')) {
      passthrough.push(token)
      continue
    }
    if (token === '--') continue

    const [rawKey, rawValue] = token.split('=')
    const key = rawKey.slice(2)

    if (handled.has(key)) {
      if (rawValue === undefined) {
        const next = argv[i + 1]
        if (next && !next.startsWith('--')) i += 1
      }
      continue
    }

    passthrough.push(token)

    if (rawValue === undefined) {
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        passthrough.push(next)
        i += 1
      }
    }
  }

  return passthrough.filter(Boolean)
}

const passthroughArgs = collectPassthroughArgs(rawArgs)
const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const hasExplicitHost = passthroughArgs.some(
  token => token === '--host' || token?.startsWith('--host=')
)
const deployedGoQrProvider = 'https://go-qr.web.app'
const localGoQrProvider = 'http://localhost:3013'

function requestsNetworkHost(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--host') {
      const value = argv[index + 1]
      return !value || value.startsWith('--') || !loopbackHosts.has(value)
    }

    if (token?.startsWith('--host=')) {
      const value = token.slice('--host='.length).trim()
      return !value || !loopbackHosts.has(value)
    }
  }

  return false
}

const shouldExposeNetwork = requestsNetworkHost(passthroughArgs)

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function resolveGoQrProviderFlag(value) {
  const raw = normalizeUrl(value)
  if (!raw) return ''
  if (raw === 'deployed') return deployedGoQrProvider
  if (raw === 'local') return localGoQrProvider
  return raw
}

async function chooseGoQrProvider(app) {
  if (!app.toolProviders?.includes('go-qr')) return ''

  const existing = normalizeUrl(
    process.env.NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL ||
    process.env.GO_QR_PROVIDER_BASE_URL
  )
  if (existing) return existing

  const fromFlag = resolveGoQrProviderFlag(args['go-qr-provider'])
  if (fromFlag) return fromFlag

  // Local Go QR is the least surprising dev default. Pass
  // `--go-qr-provider deployed` when testing the hosted provider.
  return localGoQrProvider
}

function getPortListenerPids(port) {
  const check = spawnSync(
    'lsof',
    ['-ti', `tcp:${port}`, '-sTCP:LISTEN'],
    { encoding: 'utf8' }
  )

  if (check.error || (check.status !== 0 && check.status !== 1)) {
    console.error(
      `[dev] Could not verify whether port ${port} is available. ` +
      'Install lsof or free the port explicitly before retrying.'
    )
    process.exit(1)
  }

  return [...new Set(
    String(check.stdout || '')
      .split(/\s+/)
      .map(value => value.trim())
      .filter(Boolean)
  )]
}

function getProcessCwd(pid) {
  const check = spawnSync(
    'lsof',
    ['-a', '-p', pid, '-d', 'cwd', '-Fn'],
    { encoding: 'utf8' }
  )

  if (check.error || check.status !== 0) return ''

  const pathLine = String(check.stdout || '')
    .split(/\r?\n/)
    .find(line => line.startsWith('n'))

  return pathLine?.slice(1) || ''
}

function getProcessListenerNames(pid) {
  const check = spawnSync(
    'lsof',
    ['-nP', '-a', '-p', pid, `-iTCP:${app.port}`, '-sTCP:LISTEN', '-Fn'],
    { encoding: 'utf8' }
  )

  if (check.error || check.status !== 0) return []

  return String(check.stdout || '')
    .split(/\r?\n/)
    .filter(line => line.startsWith('n'))
    .map(line => line.slice(1))
}

function hasNetworkVisibleListener(pid) {
  return getProcessListenerNames(pid).some((listener) => {
    const host = listener.slice(0, listener.lastIndexOf(':'))
    return host === '*' || host === '0.0.0.0' || host === '[::]'
  })
}

async function waitForPortRelease(port, timeoutMs = 5000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (!getPortListenerPids(port).length) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.error(
    `[dev] The existing ${app.name} server did not release port ${port}. ` +
    `Run pnpm kill:${appKey}, then retry.`
  )
  process.exit(1)
}

function isSameAppWorkspace(pid) {
  const processCwd = getProcessCwd(pid)
  if (!processCwd) return false

  try {
    const expectedWorkspace = realpathSync(resolve(repoRoot, app.workspace))
    return realpathSync(processCwd) === expectedWorkspace
  } catch {
    return false
  }
}

async function reuseExistingApp(listenerPids) {
  if (!listenerPids.length) return false

  if (!listenerPids.every(isSameAppWorkspace)) {
    console.error(
      [
        `[dev] Port ${app.port} is already in use by another process; leaving it untouched.`,
        `Run pnpm kill:${appKey} and retry only when you intend to replace it.`,
      ].join('\n')
    )
    process.exit(1)
  }

  if (hasExplicitHost) {
    const bindingReason =
      shouldExposeNetwork && !listenerPids.some(hasNetworkVisibleListener)
        ? 'is loopback-only'
        : 'is already running'
    console.log(
      `[dev] Existing ${app.name} server ${bindingReason}; explicit --host starts ` +
      'a fresh same-checkout server owned by this terminal.'
    )

    for (const pid of listenerPids) {
      process.kill(Number(pid), 'SIGTERM')
    }

    await waitForPortRelease(app.port)
    return false
  }

  const pidLabel = listenerPids.length === 1 ? 'PID' : 'PIDs'
  console.log(
    `[dev] ${app.name} is already running from this checkout at ${app.baseUrl} ` +
    `(${pidLabel} ${listenerPids.join(', ')}); verifying it instead of starting a duplicate.`
  )

  try {
    await waitForAppReady(app)

    if (shouldSmoke) {
      await runRouteSmokeForApp(app)
    }

    console.log(`[dev] ${app.name} ready`)
    console.log(
      `[dev] Existing ${app.name} server is healthy; nothing new was started. ` +
      `Run pnpm kill:${appKey} first only when this terminal needs to own a fresh server.`
    )
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[dev] Existing ${app.name} server did not pass verification: ${message}`)
    console.error(
      `Run pnpm kill:${appKey} and retry only when you intend to replace it.`
    )
    process.exit(1)
  }
}

const existingListenerPids = getPortListenerPids(app.port)
if (await reuseExistingApp(existingListenerPids)) process.exit(0)

if (shouldPrepare) {
  runPrepareForApp(app)
}

const devEnv = { ...process.env }
const inheritedDeveloperIdentityKeys = [
  'DEVELOPER_ID',
  'DEVELOPER_UID',
  'NUXT_PUBLIC_DEVELOPER_ID',
]

// Developer identity is Firebase-project-specific. A shell-level value copied
// from another App must never outrank the selected App workspace's `.env`.
for (const key of inheritedDeveloperIdentityKeys) delete devEnv[key]

const goQrProvider = await chooseGoQrProvider(app)

if (goQrProvider) {
  devEnv.GO_QR_PROVIDER_BASE_URL = goQrProvider
  devEnv.NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL = goQrProvider
  console.log(`[dev] Go QR provider: ${goQrProvider}`)
}

// Dev app Nuxt configs resolve fireux-core config exports through dist unless
// the runtime enables package "development" conditions. Rebuild immediately
// before spawning the dev server so guard/preflight cleanup cannot leave the
// child app without config helpers.
ensureFireuxCoreConfigHelpers()

console.log(`[dev] Starting ${app.name} on ${app.baseUrl}`)
const child = spawnPnpm(
  ['--filter', app.filter, 'dev', '--', ...passthroughArgs],
  {
    stdio: 'inherit',
    env: devEnv,
  }
)

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

  if (shouldSmoke) {
    await runRouteSmokeForApp(app)
  }

  console.log(`[dev] ${app.name} ready`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  shutdown('SIGTERM')
  process.exit(1)
}
