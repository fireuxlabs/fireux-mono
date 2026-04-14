#!/usr/bin/env node
// FILE: scripts/firebase-deploy-preflight.mjs

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { parseArgs } from './_lib/args.mjs'

const DEFAULT_REGION = 'us-central1'
const FIREBASE_TOOLS_VERSION = '15.8.0'

const args = parseArgs(process.argv.slice(2))
const cwd = process.cwd()
const project =
  typeof args.project === 'string' && args.project.trim()
    ? args.project.trim()
    : process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || ''
const configArg = typeof args.config === 'string' && args.config.trim() ? args.config.trim() : 'firebase.json'
const configPath = path.resolve(cwd, configArg)

if (!project) {
  console.error('[firebase-preflight] Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(2)
}

if (!existsSync(configPath)) {
  console.error(`[firebase-preflight] Could not find config at ${configPath}`)
  process.exit(2)
}

const firebaseConfig = readJson(configPath)
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
    ['dlx', `firebase-tools@${FIREBASE_TOOLS_VERSION}`, 'functions:list', '--project', projectId, '--json'],
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
