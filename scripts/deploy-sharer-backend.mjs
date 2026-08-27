#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-26
// usage_note: deploy and verify the Sharer ecosystem-owned Auth and Firestore baseline.

import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)
const configPath = path.join(repoRoot, 'scripts/firebase/sharer/firebase.json')

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm firebase:deploy:sharer-backend')
  console.log(
    'Deploys Sharer Auth, Firestore Rules, indexes, and authorized domains.'
  )
  process.exit(0)
}

run('deploy backend', 'pnpm', [
  'dlx',
  'firebase-tools@15.28.1',
  'deploy',
  '--project',
  'sharer-ecosystem',
  '--config',
  configPath,
  '--only',
  'auth,firestore',
  '--non-interactive',
])

run('verify Auth domains', 'node', [
  path.join(repoRoot, 'scripts/sync-firebase-auth-domains.mjs'),
  '--project',
  'sharer-ecosystem',
  '--domains',
  'localhost,kjordi.web.app,sharify.web.app',
])

console.log('[sharer-backend] Auth and Firestore deployed and verified.')

function run(label, command, args) {
  console.log(`[sharer-backend] ${label}`)
  const result = spawnSync(command, args, {
    cwd: tmpdir(),
    env: {
      ...process.env,
      CI: process.env.CI || '1',
      FIREBASE_CLI_DISABLE_UPDATE_CHECK: '1',
      NO_UPDATE_NOTIFIER: '1',
    },
    stdio: 'inherit',
    shell: false,
  })
  if (result.status === 0) return
  process.exit(result.status || 1)
}
