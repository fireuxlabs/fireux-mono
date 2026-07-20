#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: enforce dated script headers, tracked callers, and valid package-command file targets.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: make orphaned script files a blocking lifecycle failure.
// Concurrent edit — 2026-07-20 23:27 CEST — Repo Efficiency Pass 6 of 6: validate script file targets in every authored package manifest.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const maxAgeDays = Number(
  process.argv.find((arg) => arg.startsWith('--days='))?.split('=')[1] || 42
)
const now = new Date()
const cutoff = new Date(now)
cutoff.setDate(cutoff.getDate() - maxAgeDays)

const REFERENCE_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sh',
  '.ts',
  '.vue',
  '.yaml',
  '.yml',
])

function authoredRepoPaths() {
  return execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    }
  )
    .split('\0')
    .filter(Boolean)
}

function repoPath(file) {
  return path.relative(repoRoot, file)
}

function referenceFile(repoPath) {
  if (repoPath === 'mirror' || repoPath.startsWith('mirror/')) return false
  return REFERENCE_EXTENSIONS.has(path.extname(repoPath))
}

function readUsage(file) {
  const source = readFileSync(file, 'utf8')
  const marker = /(?:\/\/|#)\s*@fireux-script\b/.test(source)
  const manualEntrypoint = /(?:\/\/|#)\s*manual_entrypoint:\s*true\b/.test(
    source
  )
  const lastUsed =
    source.match(/(?:\/\/|#)\s*last_used:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || ''
  const note =
    source.match(/(?:\/\/|#)\s*usage_note:\s*(.+)/)?.[1]?.trim() || ''

  return {
    file: repoPath(file),
    marker,
    manualEntrypoint,
    lastUsed,
    note,
    ageDays: lastUsed
      ? Math.floor(
          (now.getTime() - new Date(`${lastUsed}T00:00:00Z`).getTime()) /
            86_400_000
        )
      : null,
    modifiedAt: statSync(file).mtime.toISOString().slice(0, 10),
  }
}

function sourceReferencesScript(entry, scriptPath) {
  if (entry.source.includes(scriptPath)) return true

  for (const match of entry.source.matchAll(/['"`]([^'"`\r\n]+)['"`]/g)) {
    const specifier = match[1]
    if (!specifier.startsWith('.')) continue
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(entry.file), specifier)
    )
    if (resolved === scriptPath) return true
  }

  return false
}

function commandFileTargets(command) {
  const targets = []

  for (const match of String(command).matchAll(
    /\b(?:node|tsx|bash|sh)\s+(?:'([^']+)'|"([^"]+)"|([^\s'";&|]+))/g
  )) {
    const target = match[1] || match[2] || match[3] || ''
    if (target.startsWith('.') || target.startsWith('scripts/')) {
      targets.push(target)
    }
  }

  return targets
}

function invalidPackageCommandTargets(manifestFile) {
  const manifestPath = path.join(repoRoot, manifestFile)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

  return Object.entries(manifest.scripts || {}).flatMap(([name, command]) =>
    commandFileTargets(command)
      .map((target) => ({
        manifest: manifestFile,
        name,
        target,
        resolved: repoPath(path.resolve(path.dirname(manifestPath), target)),
      }))
      .filter(({ resolved }) => !existsSync(path.join(repoRoot, resolved)))
  )
}

const authoredPaths = authoredRepoPaths()
const rows = authoredPaths
  .filter((file) => file.startsWith('scripts/'))
  .filter((file) => /\.(mjs|sh)$/.test(file))
  .map((file) => path.join(repoRoot, file))
  .filter(existsSync)
  .map(readUsage)
  .sort((a, b) => a.file.localeCompare(b.file))

const referenceSources = authoredPaths
  .filter(referenceFile)
  .map((file) => path.join(repoRoot, file))
  .filter(existsSync)
  .map((file) => ({
    file: repoPath(file),
    source: readFileSync(file, 'utf8'),
  }))

for (const row of rows) {
  row.references = referenceSources
    .filter((entry) => entry.file !== row.file)
    .filter((entry) => sourceReferencesScript(entry, row.file))
    .map((entry) => entry.file)
    .sort((a, b) => a.localeCompare(b))
  row.referenceCount = row.references.length
  row.executableReferences = row.references.filter(
    (file) => path.extname(file) !== '.md'
  )
  row.documentationReferences = row.references.filter(
    (file) => path.extname(file) === '.md'
  )
}

const missing = rows.filter((row) => !row.marker || !row.lastUsed)
const stale = rows.filter(
  (row) => row.lastUsed && new Date(`${row.lastUsed}T00:00:00Z`) < cutoff
)
const unreferenced = rows.filter((row) => row.referenceCount === 0)
const unsupported = rows.filter(
  (row) => row.executableReferences.length === 0 && !row.manualEntrypoint
)
const manualEntrypoints = rows.filter((row) => row.manualEntrypoint)
const invalidCommandTargets = authoredPaths
  .filter((file) => path.basename(file) === 'package.json')
  .flatMap(invalidPackageCommandTargets)

console.log(
  JSON.stringify(
    {
      checkedAt: now.toISOString().slice(0, 10),
      maxAgeDays,
      cutoff: cutoff.toISOString().slice(0, 10),
      counts: {
        scripts: rows.length,
        missing: missing.length,
        stale: stale.length,
        unreferenced: unreferenced.length,
        unsupported: unsupported.length,
        manualEntrypoints: manualEntrypoints.length,
        invalidCommandTargets: invalidCommandTargets.length,
      },
      stale,
      missing,
      unreferenced,
      unsupported,
      manualEntrypoints,
      invalidCommandTargets,
    },
    null,
    2
  )
)

if (
  missing.length ||
  unreferenced.length ||
  unsupported.length ||
  invalidCommandTargets.length
) {
  process.exitCode = 1
}
