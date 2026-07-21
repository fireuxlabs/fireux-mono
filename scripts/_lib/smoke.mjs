// @fireux-script
// last_used: 2026-07-21
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/_lib/smoke.mjs
// Concurrent edit — 2026-07-21 15:35 CEST — Misebox startup verification: record the full route and HTTP contract run.

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { spawnSyncPnpm } from './pnpm.mjs'

const ROUTE_TIMEOUT_MS = 20_000
const READY_ROUTE_TIMEOUT_MS = 3_000
const READY_TIMEOUT_MS = 180_000
const READY_INTERVAL_MS = 1_000
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

const FAILURE_MARKERS = [
  "doesn't provide an export named",
  'error caught during app initialization',
  'Cannot find module',
  '<title>Nuxt Error',
]

function formatMs(ms) {
  return `${Math.round(ms)}ms`
}

function preview(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 220)
}

export function runPrepareForApp(app) {
  ensureFireuxCoreConfigHelpers()

  console.log(`[smoke:prepare] ${app.name} -> nuxi prepare`)

  const result = spawnSyncPnpm(['--filter', app.filter, 'exec', 'nuxi', 'prepare'], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`[smoke:prepare] ${app.name} failed`)
  }
}

export function ensureFireuxCoreConfigHelpers() {
  const result = spawnSync('node', ['scripts/build-fireux-core-config.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error('[smoke:prepare] failed to build fireux-core config helpers')
  }
}

export async function waitForAppReady(app) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    try {
      const response = await fetch(app.baseUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(READY_ROUTE_TIMEOUT_MS),
      })

      if (response.status < 500) {
        console.log(`[smoke] ${app.name} responded on ${app.baseUrl}`)
        return
      }
    } catch {
      // Keep polling until timeout.
    }

    await delay(READY_INTERVAL_MS)
  }

  throw new Error(`[smoke] ${app.name} did not become ready at ${app.baseUrl}`)
}

async function fetchRoute(url, options = {}) {
  const startedAt = performance.now()
  const response = await fetch(url, {
    redirect: options.redirect ?? 'follow',
    signal: AbortSignal.timeout(ROUTE_TIMEOUT_MS),
    headers: {
      'user-agent': 'fireux-smoke/1.0',
    },
  })
  const body = await response.text()
  const durationMs = performance.now() - startedAt

  return { response, body, durationMs }
}

function routeContractFailures(contract, response, body) {
  const failures = []

  if (response.status !== contract.status) {
    failures.push(`expected status ${contract.status}, received ${response.status}`)
  }

  if (contract.location) {
    const location = response.headers.get('location') || ''
    if (location !== contract.location) {
      failures.push(
        `expected location ${contract.location}, received ${location || 'none'}`
      )
    }
  }

  if (contract.contentType) {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith(contract.contentType)) {
      failures.push(
        `expected content-type ${contract.contentType}, received ${contentType || 'none'}`
      )
    }
  }

  if (typeof contract.noindex === 'boolean') {
    const robotsHeader = response.headers.get('x-robots-tag') || ''
    const robotsMeta = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/i
    const hasNoindex = /\bnoindex\b/i.test(robotsHeader) || robotsMeta.test(body)

    if (hasNoindex !== contract.noindex) {
      failures.push(
        contract.noindex
          ? 'expected a noindex response directive'
          : 'found an unexpected noindex response directive'
      )
    }
  }

  for (const value of contract.includes ?? []) {
    if (!body.includes(value)) failures.push(`missing body marker ${JSON.stringify(value)}`)
  }

  for (const value of contract.excludes ?? []) {
    if (body.includes(value)) failures.push(`found forbidden body marker ${JSON.stringify(value)}`)
  }

  for (const value of FAILURE_MARKERS) {
    if (body.includes(value)) failures.push(`found failure marker ${JSON.stringify(value)}`)
  }

  return failures
}

export async function runRouteContractsForApp(app, contracts) {
  console.log(`[contract] ${app.name} -> route contracts on ${app.baseUrl}`)

  const failures = []

  for (const contract of contracts) {
    const url = new URL(contract.route, app.baseUrl).toString()

    try {
      const { response, body, durationMs } = await fetchRoute(url, {
        redirect: 'manual',
      })
      const reasons = routeContractFailures(contract, response, body)

      if (!reasons.length) {
        console.log(
          `[contract] ✓ ${contract.route} ${response.status} ${formatMs(durationMs)}`
        )
        continue
      }

      failures.push({ contract, response, body, reasons })
      console.error(
        `[contract] ✗ ${contract.route} ${response.status}: ${reasons.join('; ')}`
      )
      console.error(`[contract]   ${preview(body)}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push({ contract, response: null, body: message, reasons: [message] })
      console.error(`[contract] ✗ ${contract.route} network error: ${message}`)
    }
  }

  if (failures.length) {
    throw new Error(
      `[contract] ${app.name} failed ${failures.length} route contract(s)`
    )
  }

  console.log(`[contract] PASS ${app.name} (${contracts.length} routes)`)
}

export async function runRouteSmokeForApp(app) {
  console.log(`[smoke] ${app.name} -> route smoke on ${app.baseUrl}`)

  const failures = []

  for (const route of app.smokeRoutes) {
    const url = new URL(route, app.baseUrl).toString()

    try {
      const { response, body, durationMs } = await fetchRoute(url)

      let marker = null
      for (const value of FAILURE_MARKERS) {
        if (body.includes(value)) {
          marker = value
          break
        }
      }

      const ok = response.status < 400 && !marker
      const finalUrl = response.url === url ? '' : ` -> ${response.url}`

      if (ok) {
        console.log(
          `[smoke] ✓ ${route} ${response.status}${finalUrl} ${formatMs(durationMs)}`
        )
        continue
      }

      failures.push({
        route,
        status: response.status,
        marker,
        finalUrl: response.url,
        body,
      })

      console.error(
        `[smoke] ✗ ${route} ${response.status}${finalUrl}${marker ? ` marker="${marker}"` : ''}`
      )
      console.error(`[smoke]   ${preview(body)}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push({ route, status: 0, marker: null, finalUrl: url, body: message })
      console.error(`[smoke] ✗ ${route} network error: ${message}`)
    }
  }

  if (failures.length) {
    throw new Error(`[smoke] ${app.name} failed ${failures.length} route check(s)`)
  }

  console.log(`[smoke] PASS ${app.name} (${app.smokeRoutes.length} routes)`)

  if (app.httpContracts?.length) {
    await runRouteContractsForApp(app, app.httpContracts)
  }
}
