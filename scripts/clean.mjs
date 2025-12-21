#!/usr/bin/env node
/**
 * scripts/clean.mjs
 *
 * FireUX Clean Script
 *
 * Purpose:
 * - Remove ALL build artifacts and dependency trees
 * - Ensure repo is in a clean, guard-safe state
 * - Designed to be run before `pnpm guard` or `gitsave`
 *
 * This script is intentionally destructive to build output.
 * It MUST NOT delete authored source files.
 */

import { rmSync, readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

/**
 * Exact directory/file names that are considered build noise
 * and should NEVER exist at commit time.
 */
const NUKE_NAMES = new Set([
  'dist',
  'node_modules',
  '.nuxt',
  '.output',
  '.nitro',
  '.cache',
  '.data',
  '--port',
  '--clear',
])

const NUKE_FILES = new Set([
  'tsconfig.tsbuildinfo',
])

/**
 * Directories we should never descend into
 */
const SKIP_DIRS = new Set([
  '.git',
])

let removedCount = 0

function walk(dir) {
  if (!existsSync(dir)) return

  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const name = entry.name
    const fullPath = path.join(dir, name)

    if (SKIP_DIRS.has(name)) continue

    // Remove known junk directories
    if (entry.isDirectory() && NUKE_NAMES.has(name)) {
      rmSync(fullPath, { recursive: true, force: true })
      console.log(`[clean] 🧹 removed ${path.relative(repoRoot, fullPath)}`)
      removedCount++
      continue
    }

    // Remove known junk files
    if (entry.isFile() && NUKE_FILES.has(name)) {
      rmSync(fullPath, { force: true })
      console.log(`[clean] 🧹 removed ${path.relative(repoRoot, fullPath)}`)
      removedCount++
      continue
    }

    // Recurse
    if (entry.isDirectory()) {
      walk(fullPath)
    }
  }
}

console.log('[clean] 🔥 Cleaning build artifacts...')
walk(repoRoot)

if (removedCount === 0) {
  console.log('[clean] ✅ Nothing to clean')
} else {
  console.log(`[clean] ✅ Removed ${removedCount} item(s)`)
}