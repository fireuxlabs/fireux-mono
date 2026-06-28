#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-28
// usage_note: baseline after scripts cleanup; update when run.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const scriptsRoot = path.join(repoRoot, 'scripts')
const maxAgeDays = Number(process.argv.find((arg) => arg.startsWith('--days='))?.split('=')[1] || 42)
const now = new Date()
const cutoff = new Date(now)
cutoff.setDate(cutoff.getDate() - maxAgeDays)

const REFERENCE_SKIP_DIRS = new Set([
  '.firebase',
  '.git',
  '.nuxt',
  '.output',
  '.pnpm-store',
  'dist',
  'mirror',
  'node_modules',
  'temp',
])

const REFERENCE_EXTENSIONS = new Set([
  '.json',
  '.md',
  '.mjs',
  '.sh',
  '.ts',
  '.vue',
  '.yaml',
  '.yml',
])

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    if (!entry.isFile()) return []
    if (!/\.(mjs|sh)$/.test(entry.name)) return []
    return [fullPath]
  })
}

function repoPath(file) {
  return path.relative(repoRoot, file)
}

function referenceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (REFERENCE_SKIP_DIRS.has(entry.name)) return []
      return referenceFiles(fullPath)
    }
    if (!entry.isFile()) return []
    if (!REFERENCE_EXTENSIONS.has(path.extname(entry.name))) return []
    return [fullPath]
  })
}

function readUsage(file) {
  const source = readFileSync(file, 'utf8')
  const lastUsed = source.match(/(?:\/\/|#)\s*last_used:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || ''
  const note = source.match(/(?:\/\/|#)\s*usage_note:\s*(.+)/)?.[1]?.trim() || ''

  return {
    file: repoPath(file),
    lastUsed,
    note,
    ageDays: lastUsed
      ? Math.floor((now.getTime() - new Date(`${lastUsed}T00:00:00Z`).getTime()) / 86_400_000)
      : null,
    modifiedAt: statSync(file).mtime.toISOString().slice(0, 10),
  }
}

const rows = walk(scriptsRoot)
  .map(readUsage)
  .sort((a, b) => a.file.localeCompare(b.file))

const referenceSources = referenceFiles(repoRoot)
  .map((file) => ({
    file: repoPath(file),
    source: readFileSync(file, 'utf8'),
  }))

for (const row of rows) {
  const base = path.basename(row.file)
  row.references = referenceSources
    .filter((entry) => entry.file !== row.file)
    .filter((entry) => {
      const source = entry.source
      return (
        source.includes(row.file) ||
        source.includes(`./${row.file}`) ||
        source.includes(`../${row.file}`) ||
        source.includes(base)
      )
    })
    .map((entry) => entry.file)
    .sort((a, b) => a.localeCompare(b))
  row.referenceCount = row.references.length
}

const missing = rows.filter((row) => !row.lastUsed)
const stale = rows.filter((row) => row.lastUsed && new Date(`${row.lastUsed}T00:00:00Z`) < cutoff)
const unreferenced = rows.filter((row) => row.referenceCount === 0)

console.log(JSON.stringify({
  checkedAt: now.toISOString().slice(0, 10),
  maxAgeDays,
  cutoff: cutoff.toISOString().slice(0, 10),
  counts: {
    scripts: rows.length,
    missing: missing.length,
    stale: stale.length,
    unreferenced: unreferenced.length,
  },
  stale,
  missing,
  unreferenced,
}, null, 2))

if (missing.length) process.exitCode = 1
