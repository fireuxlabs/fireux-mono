#!/usr/bin/env node
// FILE: scripts/pre-guard-clean.mjs
// Removes local build artifacts that violate FireUX guard L1 shape rules.
// Intentionally conservative: only removes known-forbidden directories at known locations.

import { existsSync } from 'node:fs'
import { rm, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()

async function removeDirIfExists(dirPath) {
  if (!existsSync(dirPath)) return false
  await rm(dirPath, { recursive: true, force: true })
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

// Remove .data at app roots: projects/*/*/.data
{
  const projectsRoot = path.join(repoRoot, 'projects')
  const ecosystems = await listChildDirs(projectsRoot)

  for (const eco of ecosystems) {
    const ecoRoot = path.join(projectsRoot, eco)
    const apps = await listChildDirs(ecoRoot)

    for (const appName of apps) {
      const dataPath = path.join(ecoRoot, appName, '.data')
      if (await removeDirIfExists(dataPath)) removed.push(path.relative(repoRoot, dataPath))
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
