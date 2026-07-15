#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-15
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/firebase-deploy-preflight.mjs

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parseArgs } from './_lib/args.mjs'
import { assertFireuxRuntime } from './_lib/runtime.mjs'

const DEFAULT_REGION = 'us-central1'
const FIREBASE_TOOLS_VERSION = '15.8.0'

const args = parseArgs(process.argv.slice(2))
const cwd = process.cwd()
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const project =
  typeof args.project === 'string' && args.project.trim()
    ? args.project.trim()
    : process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || ''
const configArg = typeof args.config === 'string' && args.config.trim() ? args.config.trim() : 'firebase.json'
const configPath = path.resolve(cwd, configArg)
const appRoot = path.dirname(configPath)

try {
  assertFireuxRuntime({ repoRoot, label: 'firebase-preflight' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

if (!project) {
  console.error('[firebase-preflight] Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(2)
}

if (!existsSync(configPath)) {
  console.error(`[firebase-preflight] Could not find config at ${configPath}`)
  process.exit(2)
}

prepareDeployBuildInputs()
assertNoActiveNuxtDevServer()
printArtifactReminder()

const firebaseConfig = readJson(configPath)
printShipReminders()
const localFunctions = readLocalFunctions(firebaseConfig)

if (!localFunctions.length) {
  console.log('[firebase-preflight] No local functions declared in firebase.json, skipping.')
  process.exit(0)
}

console.log(
  `[firebase-preflight] Checking ${path.relative(cwd, configPath) || configPath} against Firebase project ${project}...`
)

const remoteFunctions = readRemoteFunctions(project, cwd)
const violations = findViolations({ localFunctions, remoteFunctions, project })

if (violations.length) {
  console.error('\n[firebase-preflight] Stale Firebase function leftovers detected.\n')

  for (const violation of violations) {
    console.error(`- ${violation.title}`)
    console.error(`  ${violation.body}`)
    for (const command of violation.commands) {
      console.error(`  Cleanup: ${command}`)
    }
    console.error('')
  }

  console.error('[firebase-preflight] Aborting deploy before Firebase reaches the destructive prompt.')
  process.exit(1)
}

console.log('[firebase-preflight] No stale app function leftovers detected.')

function prepareDeployBuildInputs() {
  const buildConfigScript = path.join(repoRoot, 'scripts/build-fireux-core-config.mjs')
  if (!existsSync(buildConfigScript)) return

  console.log('[firebase-preflight] Preparing fireux-core config helpers...')

  const result = spawnSync('node', [buildConfigScript], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.stdout) process.stdout.write(result.stdout)

  if (result.status === 0) return

  if (result.stderr) process.stderr.write(result.stderr)
  console.error('[firebase-preflight] Could not prepare fireux-core config helpers.')
  console.error('Fix this before deploy: node scripts/build-fireux-core-config.mjs')
  process.exit(result.status || 1)
}

function assertNoActiveNuxtDevServer() {
  const packagePath = path.join(appRoot, 'package.json')
  if (!existsSync(packagePath)) return

  const packageJson = readJson(packagePath)
  const devScript = typeof packageJson?.scripts?.dev === 'string' ? packageJson.scripts.dev : ''
  if (!devScript.includes('nuxi dev') && !devScript.includes('nuxt dev')) return

  const port = readNuxtDevPort(devScript)
  const result = spawnSync('ps', ['-ax', '-o', 'pid=,command='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.status !== 0) {
    console.warn('[firebase-preflight] Could not inspect running processes for Nuxt dev servers.')
    if (result.stderr) process.stderr.write(result.stderr)
    return
  }

  const blockers = result.stdout
    .split('\n')
    .map(parseProcessLine)
    .filter(Boolean)
    .filter((entry) => entry.pid !== process.pid)
    .filter((entry) => isMatchingNuxtDevProcess(entry.command, port))

  if (!blockers.length) return

  console.error('\n[firebase-preflight] Active Nuxt dev server detected for this app.\n')
  console.error(
    'Nuxt build can fail when the same app still has a dev server running. Stop it before deploying.'
  )

  for (const blocker of blockers) {
    console.error(`- PID ${blocker.pid}: ${blocker.command}`)
  }

  console.error('\nThen rerun the deploy command.')
  process.exit(1)
}

function printArtifactReminder() {
  const cleanScript = path.join(repoRoot, 'scripts/pre-guard-clean.mjs')
  if (!existsSync(cleanScript)) return

  console.log(
    '[firebase-preflight] Note: deploy builds create local artifacts. After deploy, run node scripts/pre-guard-clean.mjs before guard/save.'
  )
}

function printShipReminders() {
  console.warn(
    '[firebase-preflight] Reminder: fireux-places Place claiming is pre-ship only. Before production deploy, add verified claim flow and update Firestore rules for places/{placeId}.'
  )
}

function readNuxtDevPort(devScript) {
  const spaced = devScript.match(/--port\s+(\d+)/)
  if (spaced) return spaced[1]

  const assigned = devScript.match(/--port=(\d+)/)
  return assigned?.[1] ?? ''
}

function parseProcessLine(line) {
  const match = line.match(/^\s*(\d+)\s+(.+?)\s*$/)
  if (!match) return null

  return {
    pid: Number(match[1]),
    command: match[2],
  }
}

function isMatchingNuxtDevProcess(command, port) {
  const normalized = command.replace(/\s+/g, ' ').trim()
  const isNuxtDev =
    /\bnuxi(?:\.mjs)? dev\b/.test(normalized) || /\bnuxt(?:\.mjs)? dev\b/.test(normalized)

  if (!isNuxtDev) return false

  const appPathMatch = normalized.includes(appRoot)
  const portMatch = Boolean(
    port && (normalized.includes(`--port ${port}`) || normalized.includes(`--port=${port}`))
  )

  return appPathMatch || portMatch
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[firebase-preflight] Failed to parse ${filePath}: ${message}`)
    process.exit(2)
  }
}

function readLocalFunctions(firebaseConfig) {
  const functionsEntries = normalizeFunctions(firebaseConfig?.functions)
  const regionMap = readHostingRegions(firebaseConfig?.hosting)

  return functionsEntries
    .map((entry) => {
      const id = typeof entry?.entryPoint === 'string' ? entry.entryPoint.trim() : ''

      if (!id) return null

      const codebase =
        typeof entry?.codebase === 'string' && entry.codebase.trim() ? entry.codebase.trim() : 'default'
      const expectedRegions = [...(regionMap.get(id) || new Set([DEFAULT_REGION]))].sort()

      return {
        id,
        codebase,
        expectedRegions,
      }
    })
    .filter(Boolean)
}

function normalizeFunctions(functionsConfig) {
  if (Array.isArray(functionsConfig)) return functionsConfig
  if (functionsConfig && typeof functionsConfig === 'object') return [functionsConfig]
  return []
}

function normalizeHosting(hostingConfig) {
  if (Array.isArray(hostingConfig)) return hostingConfig
  if (hostingConfig && typeof hostingConfig === 'object') return [hostingConfig]
  return []
}

function readHostingRegions(hostingConfig) {
  const regionMap = new Map()

  for (const hostingEntry of normalizeHosting(hostingConfig)) {
    const rewrites = Array.isArray(hostingEntry?.rewrites) ? hostingEntry.rewrites : []

    for (const rewrite of rewrites) {
      const target = rewrite?.function
      const functionId =
        typeof target === 'string'
          ? target.trim()
          : typeof target?.functionId === 'string'
            ? target.functionId.trim()
            : ''

      if (!functionId) continue

      const regions = new Set(regionMap.get(functionId) || [])
      const configuredRegions = Array.isArray(target?.region)
        ? target.region.filter((value) => typeof value === 'string' && value.trim())
        : typeof target?.region === 'string' && target.region.trim()
          ? [target.region.trim()]
          : []

      if (!configuredRegions.length) {
        regions.add(DEFAULT_REGION)
      } else {
        for (const region of configuredRegions) regions.add(region)
      }

      regionMap.set(functionId, regions)
    }
  }

  return regionMap
}

function readRemoteFunctions(projectId, workingDirectory) {
  const result = spawnSync(
    'pnpm',
    [
      'dlx',
      `firebase-tools@${FIREBASE_TOOLS_VERSION}`,
      'functions:list',
      '--project',
      projectId,
      '--json',
      '--non-interactive',
    ],
    {
      cwd: workingDirectory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )

  if (result.status !== 0) {
    const output = [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
    console.error('[firebase-preflight] Could not read remote Firebase functions.')
    if (output) console.error(output)
    process.exit(result.status || 1)
  }

  const payload = readJsonFromString(result.stdout)
  const functions = Array.isArray(payload?.result) ? payload.result : []

  return functions
    .map((entry) => {
      const id = typeof entry?.id === 'string' ? entry.id.trim() : ''
      const region = typeof entry?.region === 'string' ? entry.region.trim() : ''
      const codebase =
        typeof entry?.codebase === 'string' && entry.codebase.trim()
          ? entry.codebase.trim()
          : typeof entry?.labels?.['firebase-functions-codebase'] === 'string' &&
              entry.labels['firebase-functions-codebase'].trim()
            ? entry.labels['firebase-functions-codebase'].trim()
            : 'default'

      if (!id || !region) return null

      return { id, region, codebase }
    })
    .filter(Boolean)
}

function readJsonFromString(raw) {
  try {
    return JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[firebase-preflight] Failed to parse Firebase CLI JSON output: ${message}`)
    process.exit(1)
  }
}

function findViolations({ localFunctions, remoteFunctions, project }) {
  const violations = []
  const seenRemoteKeys = new Set()
  const localCodebases = new Set(localFunctions.map((entry) => entry.codebase))

  for (const localFunction of localFunctions) {
    const mismatches = remoteFunctions.filter((remoteFunction) => {
      if (remoteFunction.id !== localFunction.id) return false
      if (remoteFunction.codebase === localFunction.codebase && localFunction.expectedRegions.includes(remoteFunction.region)) {
        return false
      }
      return true
    })

    if (!mismatches.length) continue

    const commands = []

    for (const remoteFunction of mismatches) {
      const remoteKey = buildRemoteKey(remoteFunction)
      if (seenRemoteKeys.has(remoteKey)) continue
      seenRemoteKeys.add(remoteKey)
      commands.push(deleteCommand(project, remoteFunction))
    }

    violations.push({
      title: `Function "${localFunction.id}" has stale live variants outside ${localFunction.codebase} in ${localFunction.expectedRegions.join(', ')}`,
      body: `Expected ${localFunction.id} to live in codebase "${localFunction.codebase}" and region ${localFunction.expectedRegions.join(', ')}, but found extra deployed variants with the same id.`,
      commands,
    })
  }

  for (const codebase of localCodebases) {
    const expectedIds = new Set(localFunctions.filter((entry) => entry.codebase === codebase).map((entry) => entry.id))
    const leftovers = remoteFunctions.filter(
      (remoteFunction) => remoteFunction.codebase === codebase && !expectedIds.has(remoteFunction.id)
    )

    if (!leftovers.length) continue

    const commands = []

    for (const remoteFunction of leftovers) {
      const remoteKey = buildRemoteKey(remoteFunction)
      if (seenRemoteKeys.has(remoteKey)) continue
      seenRemoteKeys.add(remoteKey)
      commands.push(deleteCommand(project, remoteFunction))
    }

    if (!commands.length) continue

    violations.push({
      title: `Codebase "${codebase}" still has functions that are not declared locally`,
      body: `Local firebase.json declares ${[...expectedIds].sort().join(', ') || '(none)'}, but the deployed codebase still contains extra functions that can block deploys after renames or removals.`,
      commands,
    })
  }

  return violations
}

function buildRemoteKey(remoteFunction) {
  return `${remoteFunction.codebase}:${remoteFunction.id}:${remoteFunction.region}`
}

function deleteCommand(project, remoteFunction) {
  return `firebase functions:delete ${remoteFunction.id} --project ${project} --region ${remoteFunction.region} --force`
}
