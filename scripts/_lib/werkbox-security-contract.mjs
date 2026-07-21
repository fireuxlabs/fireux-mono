// @fireux-script
// last_used: 2026-07-21
// usage_note: hash the exact local server, model, config, and dependency sources attested by deployed Werkbox security-contract endpoints.
// Concurrent edit — 2026-07-21 15:08 CEST — Werkbox Firebase hardening: bind attestation to complete security-relevant source trees, ecosystem registration, and dependency locks.

import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const EXACT_SOURCE_PATHS = Object.freeze([
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'packages/core/fireux-core/package.json',
  'packages/core/fireux-core/src/module.ts',
  'packages/ecosystem/fireux-werkbox/package.json',
  'packages/ecosystem/fireux-werkbox/src/module.ts',
  'packages/extensions/fireux-jobs/package.json',
  'packages/extensions/fireux-jobs/src/module.ts',
  'packages/extensions/fireux-places/package.json',
  'packages/extensions/fireux-places/src/module.ts',
  'packages/extensions/fireux-companies/package.json',
  'packages/extensions/fireux-companies/src/module.ts',
  'projects/werkbox/werkbox-app/nuxt.config.ts',
  'projects/werkbox/werkbox-app/package.json',
  'projects/werkbox/richies-reinigung/nuxt.config.ts',
  'projects/werkbox/richies-reinigung/package.json',
])

const SOURCE_ROOTS = Object.freeze([
  'packages/core/fireux-core/src/config/app',
  'packages/core/fireux-core/src/runtime/models/core',
  'packages/core/fireux-core/src/runtime/server',
  'packages/ecosystem/fireux-werkbox/src/config',
  'packages/extensions/fireux-jobs/src/config/module',
  'packages/extensions/fireux-jobs/src/runtime/models',
  'packages/extensions/fireux-jobs/src/runtime/server',
  'packages/extensions/fireux-places/src/config/module',
  'packages/extensions/fireux-places/src/runtime/models',
  'packages/extensions/fireux-places/src/runtime/server',
  'packages/extensions/fireux-companies/src/config/module',
  'packages/extensions/fireux-companies/src/runtime/models',
  'packages/extensions/fireux-companies/src/runtime/server',
])

const SOURCE_EXTENSIONS = new Set(['.cjs', '.js', '.json', '.mjs', '.ts'])

export async function buildWerkboxServerSourceEvidence({ repoRoot }) {
  const discovered = await Promise.all(
    SOURCE_ROOTS.map((relativeRoot) =>
      listSourceFiles(repoRoot, relativeRoot)
    )
  )
  const sourcePaths = [
    ...new Set([...EXACT_SOURCE_PATHS, ...discovered.flat()]),
  ].sort()
  const files = await Promise.all(
    sourcePaths.map(async (relativePath) => {
      const source = await readFile(path.resolve(repoRoot, relativePath), 'utf8')
      return { path: relativePath, sha256: rawSha256(source), source }
    })
  )
  const manifest = files.map(({ path: relativePath, sha256 }) => ({
    path: relativePath,
    sha256,
  }))
  return { files, manifest, sha256: structuredSha256(manifest) }
}

async function listSourceFiles(repoRoot, relativeRoot) {
  const absoluteRoot = path.resolve(repoRoot, relativeRoot)
  const entries = await readdir(absoluteRoot, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.posix.join(relativeRoot, entry.name)
      if (entry.isDirectory()) return listSourceFiles(repoRoot, relativePath)
      if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
        return []
      }
      return [relativePath]
    })
  )
  return nested.flat()
}

function rawSha256(value) {
  return createHash('sha256').update(String(value)).digest('hex')
}

function structuredSha256(value) {
  return createHash('sha256')
    .update(JSON.stringify(normalize(value)))
    .digest('hex')
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, normalize(entry)])
  )
}
