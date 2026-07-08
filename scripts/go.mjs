#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-08
// usage_note: baseline after scripts cleanup; update when run.
/**
 * scripts/go.mjs
 *
 * "go" = git save + (auto) clean when needed.
 *
 * - Detects dirty files via `git status --porcelain`.
 * - If dirty files include build artifacts, runs `pnpm -s clean` first.
 * - Then runs `bash scripts/gitsave.sh` passing through args.
 */

import { spawnSync } from 'node:child_process'

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    ...options,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function capture(cmd, args) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || '')
    process.exit(result.status ?? 1)
  }
  return result.stdout || ''
}

function parsePorcelain(stdout) {
  // v1 porcelain: `XY path` (and for renames: `XY old -> new`)
  // We only need paths.
  return stdout
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3))
    .map((pathPart) => {
      const arrow = ' -> '
      if (pathPart.includes(arrow)) return pathPart.split(arrow).pop()
      return pathPart
    })
    .filter(Boolean)
}

function shouldCleanForPath(p) {
  const s = `/${p}`.replaceAll('\\', '/')

  // Note: keep this conservative; we only want to auto-clean for generated output.
  const generatedSegments = [
    '/dist/',
    '/.output/',
    '/.nitro/',
    '/.cache/',
    '/.data/',
    '/.nuxt/',
    '/tsconfig.tsbuildinfo',
  ]

  return generatedSegments.some((seg) => s.includes(seg) || s.endsWith(seg))
}

function devServerRunning() {
  const result = spawnSync(
    process.execPath,
    ['scripts/pre-guard-clean.mjs', '--check-dev', '--quiet'],
    {
      stdio: 'ignore',
    }
  )

  return result.status === 2
}

const argv = process.argv.slice(2)
const hasCleanFlag = argv.includes('--clean')
const hasNoCleanFlag = argv.includes('--no-clean')

const porcelain = capture('git', ['status', '--porcelain'])
const dirtyPaths = parsePorcelain(porcelain)

if (dirtyPaths.length === 0) {
  // If there are no local changes, we may still be ahead of upstream.
  // In that case, run gitsave so it can push.
  let aheadCount = 0
  try {
    const hasUpstream = spawnSync('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
      stdio: 'ignore',
    }).status === 0

    if (hasUpstream) {
      const aheadRaw = capture('git', ['rev-list', '--count', '@{u}..HEAD']).trim()
      aheadCount = Number.parseInt(aheadRaw, 10) || 0
    }
  } catch {
    aheadCount = 0
  }

  if (aheadCount > 0) {
    console.log(`[go] Working tree clean, but branch is ahead by ${aheadCount}; pushing via gitsave`)
    run('bash', ['scripts/gitsave.sh', ...argv])
    process.exit(0)
  }

  console.log('[go] Working tree clean; nothing to save')
  process.exit(0)
}

const autoCleanNeeded = dirtyPaths.some(shouldCleanForPath)
const willClean = hasCleanFlag ? true : hasNoCleanFlag ? false : autoCleanNeeded
let cleanRan = false

if (willClean) {
  if (devServerRunning()) {
    console.log('[go] Dev server is running; skipping clean so live artifacts stay intact.')
  } else {
    console.log('[go] Detected build artifacts; running clean')
    run('pnpm', ['-s', 'clean'])
    cleanRan = true
  }
}

console.log('[go] Running gitsave')
run('bash', ['scripts/gitsave.sh', ...argv, ...(cleanRan && !hasCleanFlag ? ['--clean'] : [])])
