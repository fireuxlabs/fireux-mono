// FILE: scripts/guards/extensions.mjs
// FireUX Extensions Packages Guard
//
// Enforces the canonical Level-1 shape for packages/extensions/*
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync } from 'node:fs'
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

const ALLOWED_NOISE = ['node_modules', 'tsconfig.tsbuildinfo', '.DS_Store']

// Narrow exceptions for extension-level contract docs (docs/contract.md).
// Keep this explicit instead of globally allowing arbitrary extra folders.
const ALLOWED_EXTRA_BY_PACKAGE = {
  'fireux-blogs': ['docs'],
  'fireux-companies': ['docs'],
  'fireux-drop': ['docs'],
  'fireux-jobs': ['docs'],
  'fireux-kitchens': ['docs'],
  'fireux-orders': ['docs'],
  'fireux-places': ['docs'],
  'fireux-products': ['docs'],
}

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
    const v = checkExtensionPackage(pkgPath, pkgName)
    if (v) violations.push(v)
  }

  if (violations.length) {
    throw new Error(violations.join('\n\n'))
  }

  console.log('[guard] ✅ extension packages valid')
}

function checkExtensionPackage(pkgPath, pkgName) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')
  const extraAllowed = ALLOWED_EXTRA_BY_PACKAGE[pkgName] ?? []

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))
  const unexpected = entries.filter(
    (e) =>
      !REQUIRED_L1.includes(e) &&
      !ALLOWED_NOISE.includes(e) &&
      !extraAllowed.includes(e)
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
    `- Extension packages MUST expose exactly: ${REQUIRED_L1.join(', ')}`,
    '- Move implementation details into /src',
    '- Delete dist/ and other build output before committing'
  )

  return lines.join('\n')
}
