// @fireux-script
// last_used: 2026-06-30
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/guards/extensions.mjs
// FireUX Extensions Packages Guard
//
// Enforces the canonical Level-1 shape for packages/extensions/*
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Canonical Level-1 shape for ALL FireUX extensions.
 * Opinionated + strict.
 *
 * NOTE:
 * - dist is NOT allowed (delete before commit)
 * - node_modules + tsconfig.tsbuildinfo are tolerated local noise
 */
const REQUIRED_L1 = [
  'package.json',
  'registry.json',
  'README.md',
  'src',
  'tsconfig.json',
]

const ALLOWED_L1 = ['docs']
const ALLOWED_NOISE = ['node_modules', 'tsconfig.tsbuildinfo', '.DS_Store']
const KITCHEN_MENU_FILE_LIMIT = 400

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const extRoot = path.join(repoRoot, 'packages', 'extensions')

  if (!existsSync(extRoot)) {
    console.warn('[guard] ⚠️  packages/extensions not found, skipping extensions guard')
    return
  }

  const extensionPackages = readdirSync(extRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  const violations = []

  for (const pkgName of extensionPackages) {
    const pkgPath = path.join(extRoot, pkgName)
    const v = checkExtensionPackage(pkgPath)
    if (v) violations.push(v)
  }

  const kitchenMenuViolations = checkKitchenMenuRuntimeFiles(extRoot)
  if (kitchenMenuViolations) violations.push(kitchenMenuViolations)

  if (violations.length) {
    throw new Error(violations.join('\n\n'))
  }

  console.log('[guard] ✅ extension packages valid')
}

function checkKitchenMenuRuntimeFiles(extRoot) {
  const runtimeRoot = path.join(
    extRoot,
    'fireux-kitchens',
    'src',
    'runtime'
  )

  if (!existsSync(runtimeRoot)) return null

  const files = collectFiles(runtimeRoot)
    .filter((file) => /[Mm]enu/.test(file))
    .filter((file) => /\.(ts|vue)$/.test(file))
    .map((file) => ({
      file,
      lines: readFileSync(file, 'utf8').split(/\r?\n/).length,
    }))
    .filter((entry) => entry.lines > KITCHEN_MENU_FILE_LIMIT)

  if (!files.length) return null

  const lines = [
    '[guard] ❌ Kitchen/Menu runtime file is too large:',
    `  Limit: ${KITCHEN_MENU_FILE_LIMIT} lines`,
    '',
  ]

  files
    .sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file))
    .forEach((entry) => lines.push(`  - ${entry.lines} lines: ${entry.file}`))

  lines.push(
    '',
    '[guard] Fix:',
    '- Split Kitchen/Menu runtime files into small menu, section, item, QR, and public seams.',
    '- Do not reintroduce old public menu engines or wrapper surfaces.'
  )

  return lines.join('\n')
}

function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? collectFiles(fullPath) : [fullPath]
  })
}

function checkExtensionPackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))
  const unexpected = entries.filter(
    (e) =>
      !REQUIRED_L1.includes(e) &&
      !ALLOWED_NOISE.includes(e) &&
      !ALLOWED_L1.includes(e)
  )

  if (!missing.length && !unexpected.length) return null

  const lines = [
    '[guard] ❌ extension package shape violation:',
    `  Path: ${pkgPath}`,
  ]

  if (missing.length) {
    lines.push('  Missing required:')
    missing.forEach((m) => lines.push(`    - ${m}`))
  }

  if (unexpected.length) {
    lines.push('  Unexpected:')
    unexpected
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((u) => lines.push(`    - ${u}`))
  }

  lines.push(
    '',
    '[guard] Fix:',
    `- Extension packages MUST expose required L1: ${REQUIRED_L1.join(', ')}`,
    `- Optional L1 entries: ${ALLOWED_L1.join(', ')}`,
    '- Move implementation details into /src',
    '- Delete dist/ and other build output before committing'
  )

  return lines.join('\n')
}
