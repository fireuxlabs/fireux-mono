#!/usr/bin/env node
/**
 * Scan every registry.json in the monorepo and push it to the FireUX registry endpoint.
 * Usage: pnpm registry:backfill [--dry] [--include-tests] [--type=app|module|ecosystem]
 */
import { glob } from 'glob'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

const REGISTRY_PATTERNS = [
  'packages/extensions/*/registry.json',
  'packages/ecosystem/*/registry.json',
  'projects/*/*/registry.json',
]

const TYPE_ORDER = {
  ecosystem: 0,
  module: 1,
  app: 2,
}

function printHelp() {
  console.log(
    `Usage: pnpm registry:backfill [options]\n\nOptions:\n  --dry               Print the operations without hitting the registry endpoint\n  --include-tests     Sync entries under test workspaces (e.g., fireux-test)\n  --type=<kind>       Only sync a specific type (app, module, ecosystem)\n  -h, --help          Show this message\n`
  )
}

function parseArgs(argv) {
  const options = {
    dry: false,
    includeTests: false,
    onlyType: null,
  }

  for (const arg of argv) {
    if (arg === '--dry') {
      options.dry = true
    } else if (arg === '--include-tests') {
      options.includeTests = true
    } else if (arg.startsWith('--type=')) {
      const value = arg.split('=')[1]
      if (!value || !(value in TYPE_ORDER)) {
        throw new Error('Unknown --type value. Use app, module, or ecosystem.')
      }
      options.onlyType = value
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

async function collectRegistryFiles() {
  const files = new Set()
  for (const pattern of REGISTRY_PATTERNS) {
    const matches = await glob(pattern, { cwd: repoRoot, absolute: true })
    matches.forEach((match) => files.add(match))
  }
  return Array.from(files).sort()
}

async function readRegistryEntry(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  let data
  try {
    data = JSON.parse(raw)
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${relativePath(filePath)}: ${error.message}`
    )
  }

  if (!data?.type || !(data.type in TYPE_ORDER)) {
    throw new Error(
      `Registry entry ${relativePath(
        filePath
      )} must include a valid "type" (app, module, ecosystem).`
    )
  }

  if (!data.id) {
    throw new Error(
      `Registry entry ${relativePath(filePath)} is missing an "id" field.`
    )
  }

  if (!data.name) {
    throw new Error(
      `Registry entry ${relativePath(filePath)} is missing a "name" field.`
    )
  }

  if (!data.team) {
    throw new Error(
      `Registry entry ${relativePath(filePath)} is missing a "team" field.`
    )
  }

  return data
}

async function warnIfAppIdMismatch(filePath, entry) {
  if (entry.type !== 'app') return
  const envPath = path.join(path.dirname(filePath), '.env')
  try {
    const envRaw = await fs.readFile(envPath, 'utf8')
    const match = envRaw.match(/^APP_ID\s*=\s*(.+)$/m)
    if (!match) return
    const envValue = match[1].trim().replace(/^"|"$/g, '')
    if (envValue && envValue !== entry.id) {
      console.warn(
        `⚠️  ${relativePath(
          filePath
        )} uses APP_ID=${envValue} but registry id=${
          entry.id
        }. Consider aligning them.`
      )
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `⚠️  Unable to read ${relativePath(envPath)} for APP_ID check: ${
          error.message
        }`
      )
    }
  }
}

function relativePath(target) {
  return path.relative(repoRoot, target)
}

function isTestEntry(filePath, entry) {
  return (
    /\/(test[^/]*|test-[^/]+)\//i.test(filePath) ||
    /(^|-)test($|-)/i.test(entry.id)
  )
}

function resolveEndpoint() {
  return (
    process.env.FIREUX_REGISTRY_ENDPOINT
  )
}

async function postToRegistry(entry) {
  const endpoint = resolveEndpoint()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: entry.type, payload: entry }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${response.status} ${response.statusText}: ${body}`)
  }

  return response.json()
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const files = await collectRegistryFiles()

  const tasks = []
  for (const file of files) {
    const entry = await readRegistryEntry(file)
    await warnIfAppIdMismatch(file, entry)
    tasks.push({ file, entry })
  }

  const actionable = []
  const skipped = []

  for (const task of tasks) {
    if (options.onlyType && task.entry.type !== options.onlyType) {
      skipped.push({ ...task, reason: 'type filter' })
      continue
    }

    if (!options.includeTests && isTestEntry(task.file, task.entry)) {
      skipped.push({ ...task, reason: 'test data' })
      continue
    }

    actionable.push(task)
  }

  actionable.sort((a, b) => {
    const typeDiff = TYPE_ORDER[a.entry.type] - TYPE_ORDER[b.entry.type]
    if (typeDiff !== 0) return typeDiff
    return a.entry.id.localeCompare(b.entry.id)
  })

  console.log(
    `Found ${tasks.length} registry files; syncing ${actionable.length}, skipped ${skipped.length}.`
  )
  if (options.dry) {
    console.log('Dry run enabled — no writes will be attempted.')
  }

  const endpoint = resolveEndpoint()
  console.log(`Target registry endpoint: ${endpoint}`)

  let failures = 0
  for (const task of actionable) {
    const rel = relativePath(task.file)
    console.log(`→ [${task.entry.type}] ${task.entry.id} (${rel})`)
    if (options.dry) {
      continue
    }
    try {
      const result = await postToRegistry(task.entry)
      console.log(`   ✓ synced (path: ${result?.path ?? 'n/a'})`)
    } catch (error) {
      failures += 1
      console.error(`   ✖ failed: ${error.message}`)
    }
  }

  if (skipped.length) {
    console.log('\nSkipped entries:')
    for (const entry of skipped) {
      console.log(
        ` - [${entry.entry.type}] ${entry.entry.id} (${relativePath(
          entry.file
        )}) → ${entry.reason}`
      )
    }
  }

  if (failures) {
    console.error(`\nCompleted with ${failures} failure(s).`)
    process.exit(1)
  }

  console.log('\nRegistry backfill complete.')
}

main().catch((error) => {
  console.error('registry:backfill failed')
  console.error(error)
  process.exit(1)
})
