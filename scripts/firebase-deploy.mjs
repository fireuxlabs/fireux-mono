#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-15
// usage_note: shared non-interactive Firebase deploy runner; update when run.
// FILE: scripts/firebase-deploy.mjs

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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
const authDomains =
  typeof args['auth-domains'] === 'string' && args['auth-domains'].trim()
    ? args['auth-domains'].trim()
    : ''
const appDomain =
  typeof args['app-domain'] === 'string' && args['app-domain'].trim()
    ? args['app-domain'].trim()
    : ''
const verifyText =
  typeof args['verify-text'] === 'string' && args['verify-text'].trim()
    ? args['verify-text'].trim()
    : ''

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
const buildEnv = {
  ...childEnv,
  ...(appDomain ? { APP_DOMAIN: appDomain } : {}),
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS
      ?.split(/\s+/)
      .filter(option => !option.startsWith('--max-old-space-size='))
      .join(' '),
    '--max-old-space-size=8192',
  ].filter(Boolean).join(' '),
}

run('preflight', 'node', [
  path.join(repoRoot, 'scripts/firebase-deploy-preflight.mjs'),
  '--project',
  project,
  '--config',
  appConfig,
])

if (authDomains) {
  run('sync Firebase Auth domains', 'node', [
    path.join(repoRoot, 'scripts/sync-firebase-auth-domains.mjs'),
    '--project',
    project,
    '--domains',
    authDomains,
  ])
}

run('build', 'pnpm', ['build'], { env: buildEnv })
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
await verifyHostingRelease({ appDomain, config: readJson(configPath), verifyText })

console.log('[firebase-deploy] Deploy completed.')

function usage(exitCode) {
  const stream = exitCode === 0 ? process.stdout : process.stderr
  stream.write(
    [
      'Usage: node scripts/firebase-deploy.mjs --project <firebase-project> [--config firebase.json] [--only hosting,functions] [--auth-domains hostname[,hostname]] [--app-domain https://example.com] [--verify-text "expected public text"] [--cwd <app-root>]',
      '',
      'Runs preflight, optional additive Auth-domain sync, a production-domain-aware build, Firebase output preparation, Firebase CLI deploy, then verifies the configured Hosting URL does not serve Firebase’s default missing-site page.',
      '',
    ].join('\n')
  )
  process.exit(exitCode)
}

function run(label, command, commandArgs, { env = childEnv } = {}) {
  console.log(`\n[firebase-deploy] ${label}`)
  console.log(`[firebase-deploy] ${command} ${commandArgs.join(' ')}`)

  const result = spawnSync(command, commandArgs, {
    cwd: appRoot,
    env,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: false,
  })

  const status = result.status ?? 1
  if (status === 0) return

  console.error(`[firebase-deploy] ${label} failed with exit code ${status}.`)
  process.exit(status)
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[firebase-deploy] Failed to parse ${filePath}: ${message}`)
    process.exit(2)
  }
}

async function verifyHostingRelease({ appDomain, config, verifyText }) {
  const hostingEntries = Array.isArray(config?.hosting) ? config.hosting : [config?.hosting]
  const configuredSite = hostingEntries
    .map((entry) => typeof entry?.site === 'string' ? entry.site.trim() : '')
    .find(Boolean)
  const target = appDomain || (configuredSite ? `https://${configuredSite}.web.app` : '')

  if (!target) {
    console.warn('[firebase-deploy] No Hosting site or app domain to verify after deploy.')
    return
  }

  console.log(`\n[firebase-deploy] verify public release: ${target}`)

  let response
  let body = ''
  let lastError = ''
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      response = await fetch(target, { redirect: 'follow' })
      body = await response.text()
      if (response.ok && !isFirebaseMissingSitePage(body) && (!verifyText || body.includes(verifyText))) {
        console.log('[firebase-deploy] Public release verified.')
        return
      }
      lastError = response.ok
        ? verifyText && !body.includes(verifyText)
          ? `expected text not found: ${verifyText}`
          : 'Firebase Site Not Found page received'
        : `HTTP ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }

    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  console.error(`[firebase-deploy] Public release verification failed for ${target}: ${lastError}`)
  process.exit(1)
}

function isFirebaseMissingSitePage(body) {
  return /<title>\s*Site Not Found\s*<\/title>|Firebase\s*Site Not Found|You haven't deployed an app yet/i.test(body)
}
