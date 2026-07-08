#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-08
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/pre-guard-clean.mjs
// Removes local build artifacts that violate FireUX guard L1 shape rules.
// Intentionally conservative: only removes known-forbidden directories at known locations.

import { existsSync } from 'node:fs'
import { rm, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const PROJECT_ROOT_FORBIDDEN_DIRS = [
  '.firebase',
  '.output',
  '.nuxt',
  '.nitro',
  '.cache',
  '.data',
  'dist',
]
const PROJECT_ROOT_FORBIDDEN_FILES = [
  'firebase-debug.log',
  'tsconfig.tsbuildinfo',
  '.firebaserc',
]
const PROJECT_APP_GENERATED_DIRS = [
  '.nuxt',
]

async function removeDirIfExists(dirPath) {
  if (!existsSync(dirPath)) return false
  await rm(dirPath, { recursive: true, force: true })
  return true
}

async function removeFileIfExists(filePath) {
  if (!existsSync(filePath)) return false
  await rm(filePath, { force: true })
  return true
}

async function listChildDirs(parentDir) {
  if (!existsSync(parentDir)) return []
  const entries = await readdir(parentDir, { withFileTypes: true })
  return entries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name)
}

const removed = []
const force = process.argv.includes('--force')
const skipIfDevRunning = process.argv.includes('--skip-if-dev-running')
const checkDev = process.argv.includes('--check-dev')
const quiet = process.argv.includes('--quiet')
const DEV_PROCESS_MARKERS = [
  'dev-app-with-smoke.mjs',
  'pnpm dev:',
  ' nuxi dev',
  ' nuxt dev',
  '/nuxt/bin/nuxt.mjs dev',
  '@nuxt/cli/dist/dev/',
]

function activeDevProcesses() {
  try {
    const output = execFileSync('ps', ['-ax', '-o', 'pid=,command='], {
      encoding: 'utf8',
    })

    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [pid = '', ...commandParts] = line.split(/\s+/)

        return {
          pid,
          command: commandParts.join(' '),
        }
      })
      .filter(({ pid, command }) =>
        pid !== String(process.pid) &&
        command.includes(repoRoot) &&
        DEV_PROCESS_MARKERS.some((marker) => command.includes(marker))
      )
  } catch {
    return [
      {
        pid: '?',
        command:
          'Unable to inspect active processes. Stop dev servers first or rerun with --force.',
      },
    ]
  }
}

const devProcesses = force ? [] : activeDevProcesses()
if (checkDev) {
  if (devProcesses.length) {
    if (!quiet) {
      console.error('[pre-guard-clean] FireUX dev server is running.')
      devProcesses
        .slice(0, 5)
        .forEach(({ pid, command }) => console.error(`  - ${pid} ${command}`))
    }
    process.exit(2)
  }

  process.exit(0)
}

if (devProcesses.length) {
  if (skipIfDevRunning) {
    console.log(
      '[pre-guard-clean] ⏭️ Skipping artifact clean while a FireUX dev server is running.'
    )
    console.log(
      '[pre-guard-clean] Stop the dev server before push/guard cleanup, or use --force to interrupt generated artifacts.'
    )
    process.exit(0)
  }

  console.error(
    '[pre-guard-clean] Refusing to clean generated dev artifacts while a FireUX dev server is running.'
  )
  console.error(
    '[pre-guard-clean] Stop the dev server first, or rerun with --force if you intentionally want to interrupt it.'
  )
  devProcesses
    .slice(0, 5)
    .forEach(({ pid, command }) => console.error(`  - ${pid} ${command}`))
  process.exit(1)
}

// Remove dist/ at package roots: packages/{core,ecosystem,extensions}/*/dist
for (const group of ['core', 'ecosystem', 'extensions']) {
  const groupRoot = path.join(repoRoot, 'packages', group)
  const pkgs = await listChildDirs(groupRoot)

  for (const pkgName of pkgs) {
    const distPath = path.join(groupRoot, pkgName, 'dist')
    if (await removeDirIfExists(distPath)) removed.push(path.relative(repoRoot, distPath))
  }
}

// Remove guard-forbidden artifacts at app roots: projects/*/*/{.firebase,.output,...}
{
  const projectsRoot = path.join(repoRoot, 'projects')
  const ecosystems = await listChildDirs(projectsRoot)

  for (const eco of ecosystems) {
    const ecoRoot = path.join(projectsRoot, eco)
    const apps = await listChildDirs(ecoRoot)

    for (const appName of apps) {
      const appRoot = path.join(ecoRoot, appName)

      for (const dirName of PROJECT_ROOT_FORBIDDEN_DIRS) {
        const dirPath = path.join(appRoot, dirName)
        if (await removeDirIfExists(dirPath)) {
          removed.push(path.relative(repoRoot, dirPath))
        }
      }

      for (const fileName of PROJECT_ROOT_FORBIDDEN_FILES) {
        const filePath = path.join(appRoot, fileName)
        if (await removeFileIfExists(filePath)) {
          removed.push(path.relative(repoRoot, filePath))
        }
      }

      const appSrcRoot = path.join(appRoot, 'app')
      for (const dirName of PROJECT_APP_GENERATED_DIRS) {
        const dirPath = path.join(appSrcRoot, dirName)
        if (await removeDirIfExists(dirPath)) {
          removed.push(path.relative(repoRoot, dirPath))
        }
      }
    }
  }
}

if (removed.length) {
  console.log('[pre-guard-clean] 🧹 Removed forbidden local artifacts:')
  removed
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .forEach((p) => console.log(`  - ${p}`))
} else {
  console.log('[pre-guard-clean] ✅ Nothing to clean')
}
