#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-08
// usage_note: baseline after scripts cleanup; update when run.
/**
 * scripts/clean.mjs
 *
 * FireUX Clean Script
 *
 * Purpose:
 * - Remove build artifacts (dist/.nuxt/.output/.data/etc)
 * - Ensure repo is in a clean, guard-safe state
 * - Designed to be run before `pnpm guard` or `gitsave`
 *
 * This script is intentionally destructive to build output.
 * It MUST NOT delete authored source files.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()

const argv = new Set(process.argv.slice(2))
const deep = argv.has('--deep') || argv.has('--all')
const allowDevClean = argv.has('--allow-dev-clean')
const skipIfDevRunning = argv.has('--skip-if-dev-running')

const GENERATED_REMOVE_DIRS = new Set(['dist', '.nuxt', '.output', '.nitro', '.cache', '.data'])
const PROJECT_APP_GENERATED_DIRS = new Set(['.nuxt'])
const ALWAYS_REMOVE_FILES = new Set(['tsconfig.tsbuildinfo'])
const PROJECT_ONLY_REMOVE_DIRS = new Set(['.firebase'])
const PROJECT_ONLY_REMOVE_FILES = new Set(['firebase-debug.log', '.firebaserc'])

let removedCount = 0
let removedNuxtArtifacts = false

function devServerRunning() {
  const result = spawnSync(
    process.execPath,
    ['scripts/pre-guard-clean.mjs', '--check-dev', '--quiet'],
    {
      cwd: repoRoot,
      stdio: 'ignore',
    }
  )

  return result.status === 2
}

function removeIfExists(fullPath, kind) {
  if (!existsSync(fullPath)) return false
  rmSync(fullPath, { recursive: kind === 'dir', force: true })
  console.log(`[clean] removed ${path.relative(repoRoot, fullPath)}`)
  removedCount += 1
  return true
}

function listChildDirs(parentDir) {
  if (!existsSync(parentDir)) return []
  return readdirSync(parentDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
}

function cleanPackageGroup(groupRoot) {
  const names = listChildDirs(groupRoot)
  for (const name of names) {
    const root = path.join(groupRoot, name)
    for (const d of GENERATED_REMOVE_DIRS) {
      if (removeIfExists(path.join(root, d), 'dir')) {
        if (d === '.nuxt' || d === '.data' || d === '.output' || d === '.nitro') {
          removedNuxtArtifacts = true
        }
      }
    }
    for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
    if (deep) removeIfExists(path.join(root, 'node_modules'), 'dir')
  }
}

function cleanProjects() {
  const projectsRoot = path.join(repoRoot, 'projects')
  const ecosystems = listChildDirs(projectsRoot)
  for (const eco of ecosystems) {
    const ecoRoot = path.join(projectsRoot, eco)
    const apps = listChildDirs(ecoRoot)
    for (const app of apps) {
      const root = path.join(ecoRoot, app)
      for (const d of GENERATED_REMOVE_DIRS) {
        if (removeIfExists(path.join(root, d), 'dir')) {
          if (d === '.nuxt' || d === '.data' || d === '.output' || d === '.nitro') {
            removedNuxtArtifacts = true
          }
        }
      }
      const appSrcRoot = path.join(root, 'app')
      for (const d of PROJECT_APP_GENERATED_DIRS) {
        if (removeIfExists(path.join(appSrcRoot, d), 'dir')) removedNuxtArtifacts = true
      }
      for (const d of PROJECT_ONLY_REMOVE_DIRS) removeIfExists(path.join(root, d), 'dir')
      for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
      for (const f of PROJECT_ONLY_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
      if (deep) removeIfExists(path.join(root, 'node_modules'), 'dir')
    }
  }
}

function cleanRepoRootFiles() {
  for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(repoRoot, f), 'file')
  if (deep) removeIfExists(path.join(repoRoot, 'node_modules'), 'dir')
}

if (!allowDevClean && devServerRunning()) {
  if (skipIfDevRunning) {
    console.log('[clean] Skipping clean while a FireUX dev server is running.')
    console.log('[clean] Live Nuxt/core artifacts were left untouched.')
    process.exit(0)
  }

  console.error('[clean] Refusing to clean generated artifacts while a FireUX dev server is running.')
  console.error('[clean] Stop the dev server first. Use --allow-dev-clean only when you intentionally want to break the running dev session.')
  process.exit(1)
}

console.log(
  deep
    ? '[clean] Cleaning build artifacts (deep, including node_modules)...'
    : '[clean] Cleaning build artifacts (preserving node_modules)...'
)

cleanPackageGroup(path.join(repoRoot, 'packages', 'core'))
cleanPackageGroup(path.join(repoRoot, 'packages', 'ecosystem'))
cleanPackageGroup(path.join(repoRoot, 'packages', 'extensions'))
cleanProjects()
cleanRepoRootFiles()

if (removedCount === 0) {
  console.log('[clean] Nothing to clean')
} else {
  console.log(`[clean] Removed ${removedCount} item(s)`) 
}

if (removedNuxtArtifacts) {
  console.log('[clean] If a Nuxt dev server was running, restart it (clean removed generated build files).')
}
