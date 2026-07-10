// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/guards/extensions.mjs
// FireUX Extensions Packages Guard
//
// Enforces the canonical Level-1 shape for packages/extensions/*
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  COMMON_PACKAGE_REQUIRED_L1,
  inspectLevelOne,
} from './_lib/filesystem-policy.mjs'

/**
 * Canonical Level-1 shape for ALL FireUX extensions.
 * Opinionated + strict.
 *
 * NOTE:
 * - generated output is tolerated locally but must remain untracked
 */
const REQUIRED_L1 = COMMON_PACKAGE_REQUIRED_L1
const ALLOWED_L1 = ['docs']

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

  if (violations.length) {
    throw new Error(violations.join('\n\n'))
  }

  console.log('[guard] ✅ extension packages valid')
}

function checkExtensionPackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const { missing, unexpected } = inspectLevelOne(entries, {
    required: REQUIRED_L1,
    allowed: ALLOWED_L1,
  })

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
    '- Keep generated output ignored and untracked'
  )

  return lines.join('\n')
}
