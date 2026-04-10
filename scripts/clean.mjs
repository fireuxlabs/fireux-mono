#!/usr/bin/env node
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

import { existsSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

const argv = new Set(process.argv.slice(2))
const deep = argv.has('--deep') || argv.has('--all')

const ALWAYS_REMOVE_DIRS = new Set(['dist', '.output', '.nitro', '.cache', '.data'])
const DEEP_REMOVE_DIRS = new Set(['.nuxt'])
const ALWAYS_REMOVE_FILES = new Set(['tsconfig.tsbuildinfo'])
const PROJECT_ONLY_REMOVE_DIRS = new Set(['.firebase'])
const PROJECT_ONLY_REMOVE_FILES = new Set(['firebase-debug.log', '.firebaserc'])

let removedCount = 0
let removedNuxtArtifacts = false

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
    for (const d of ALWAYS_REMOVE_DIRS) {
      if (removeIfExists(path.join(root, d), 'dir')) {
        if (d === '.data' || d === '.output' || d === '.nitro') removedNuxtArtifacts = true
      }
    }
    for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
    if (deep) {
      for (const d of DEEP_REMOVE_DIRS) {
        if (removeIfExists(path.join(root, d), 'dir')) removedNuxtArtifacts = true
      }
      removeIfExists(path.join(root, 'node_modules'), 'dir')
    }
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
      for (const d of ALWAYS_REMOVE_DIRS) {
        if (removeIfExists(path.join(root, d), 'dir')) {
          if (d === '.data' || d === '.output' || d === '.nitro') removedNuxtArtifacts = true
        }
      }
      for (const d of PROJECT_ONLY_REMOVE_DIRS) removeIfExists(path.join(root, d), 'dir')
      for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
      for (const f of PROJECT_ONLY_REMOVE_FILES) removeIfExists(path.join(root, f), 'file')
      if (deep) {
        for (const d of DEEP_REMOVE_DIRS) {
          if (removeIfExists(path.join(root, d), 'dir')) removedNuxtArtifacts = true
        }
        removeIfExists(path.join(root, 'node_modules'), 'dir')
      }
    }
  }
}

function cleanRepoRootFiles() {
  for (const f of ALWAYS_REMOVE_FILES) removeIfExists(path.join(repoRoot, f), 'file')
  if (deep) removeIfExists(path.join(repoRoot, 'node_modules'), 'dir')
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
