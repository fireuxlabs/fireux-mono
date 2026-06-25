// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/_lib/smoke.mjs

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const ROUTE_TIMEOUT_MS = 20_000
const READY_TIMEOUT_MS = 90_000
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

  const result = spawnSync('pnpm', ['--filter', app.filter, 'exec', 'nuxi', 'prepare'], {
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
        signal: AbortSignal.timeout(ROUTE_TIMEOUT_MS),
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

async function fetchRoute(url) {
  const startedAt = performance.now()
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(ROUTE_TIMEOUT_MS),
    headers: {
      'user-agent': 'fireux-smoke/1.0',
    },
  })
  const body = await response.text()
  const durationMs = performance.now() - startedAt

  return { response, body, durationMs }
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
}
