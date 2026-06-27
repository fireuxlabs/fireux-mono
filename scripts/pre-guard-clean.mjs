#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-27
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/pre-guard-clean.mjs
// Removes local build artifacts that violate FireUX guard L1 shape rules.
// Intentionally conservative: only removes known-forbidden directories at known locations.

import { existsSync } from 'node:fs'
import { rm, readdir } from 'node:fs/promises'
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
