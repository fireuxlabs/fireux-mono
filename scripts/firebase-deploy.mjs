#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-28
// usage_note: shared non-interactive Firebase deploy runner; update when run.
// FILE: scripts/firebase-deploy.mjs

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parseArgs } from './_lib/args.mjs'
import { assertFireuxRuntime } from './_lib/runtime.mjs'

const FIREBASE_TOOLS_VERSION = '15.8.0'

const args = parseArgs(process.argv.slice(2))
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requestedCwd = typeof args.cwd === 'string' && args.cwd.trim() ? args.cwd.trim() : process.cwd()
const baseCwd = path.resolve(process.cwd(), requestedCwd)
const configArg = typeof args.config === 'string' && args.config.trim() ? args.config.trim() : 'firebase.json'
const configPath = path.resolve(baseCwd, configArg)
const appRoot = path.dirname(configPath)
const appConfig = path.relative(appRoot, configPath) || 'firebase.json'
const project =
  typeof args.project === 'string' && args.project.trim()
    ? args.project.trim()
    : process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || ''
const only = typeof args.only === 'string' && args.only.trim() ? args.only.trim() : ''

if (args.help || args.h) {
  usage(0)
}

try {
  assertFireuxRuntime({ repoRoot, label: 'firebase-deploy' })
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

if (!project) {
  console.error('[firebase-deploy] Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  usage(2)
}

if (!existsSync(configPath)) {
  console.error(`[firebase-deploy] Could not find config at ${configPath}`)
  process.exit(2)
}

const childEnv = {
  ...process.env,
  CI: process.env.CI || '1',
  FIREBASE_CLI_DISABLE_UPDATE_CHECK: '1',
  NO_UPDATE_NOTIFIER: '1',
}

run('preflight', 'node', [
  path.join(repoRoot, 'scripts/firebase-deploy-preflight.mjs'),
  '--project',
  project,
  '--config',
  appConfig,
])

run('build', 'pnpm', ['build'])
run('prepare firebase output', 'pnpm', ['prepare:firebase-output'])

const deployArgs = [
  'dlx',
  `firebase-tools@${FIREBASE_TOOLS_VERSION}`,
  'deploy',
  '--project',
  project,
  '--config',
  appConfig,
  '--non-interactive',
]

if (only) deployArgs.push('--only', only)

run('deploy', 'pnpm', deployArgs)

console.log('[firebase-deploy] Deploy completed.')

function usage(exitCode) {
  const stream = exitCode === 0 ? process.stdout : process.stderr
  stream.write(
    [
      'Usage: node scripts/firebase-deploy.mjs --project <firebase-project> [--config firebase.json] [--only hosting,functions] [--cwd <app-root>]',
      '',
      'Runs preflight, build, Firebase output preparation, then Firebase CLI deploy with ignored stdin and --non-interactive.',
      '',
    ].join('\n')
  )
  process.exit(exitCode)
}

function run(label, command, commandArgs) {
  console.log(`\n[firebase-deploy] ${label}`)
  console.log(`[firebase-deploy] ${command} ${commandArgs.join(' ')}`)

  const result = spawnSync(command, commandArgs, {
    cwd: appRoot,
    env: childEnv,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: false,
  })

  const status = result.status ?? 1
  if (status === 0) return

  console.error(`[firebase-deploy] ${label} failed with exit code ${status}.`)
  process.exit(status)
}
