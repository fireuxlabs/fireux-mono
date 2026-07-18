// @fireux-script
// last_used: 2026-07-18
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/guards/core.mjs
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  COMMON_PACKAGE_REQUIRED_L1,
  inspectLevelOne,
} from './_lib/filesystem-policy.mjs'

const REQUIRED_L1 = COMMON_PACKAGE_REQUIRED_L1

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const coreRoot = path.join(repoRoot, 'packages', 'core')

  if (!existsSync(coreRoot)) {
    console.warn('[guard] ⚠️  packages/core not found, skipping core guard')
    return
  }

  const corePackages = readdirSync(coreRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  const violations = []

  for (const pkgName of corePackages) {
    const pkgPath = path.join(coreRoot, pkgName)
    const v = checkCorePackage(pkgPath)
    if (v) violations.push(v)
  }

  if (violations.length) throw new Error(violations.join('\n\n'))

  console.log('[guard] ✅ core packages valid')
}

function checkCorePackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const { missing, unexpected } = inspectLevelOne(entries, {
    required: REQUIRED_L1,
  })

  const exportViolations = checkPackageExports(pkgPath)

  if (!missing.length && !unexpected.length && !exportViolations.length) return null

  const lines = [
    '[guard] ❌ core package shape violation:',
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

  if (exportViolations.length) {
    lines.push('  Exports invalid:')
    exportViolations.forEach((m) => lines.push(`    - ${m}`))
  }

  lines.push(
    '',
    '[guard] Fix:',
    `- Core packages MUST match L1 exactly: ${REQUIRED_L1.join(', ')}`,
    '- Move implementation into /src',
    '- Keep generated output ignored and untracked'
  )

  return lines.join('\n')
}

function checkPackageExports(pkgPath) {
  const violations = []

  const pkgJsonPath = path.join(pkgPath, 'package.json')
  if (!existsSync(pkgJsonPath)) return violations

  let pkgJson = null
  try {
    pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
  } catch {
    violations.push('package.json is not valid JSON')
    return violations
  }

  const exportsMap = pkgJson?.exports

  // Core packages should not expose a synthetic ./runtime index.
  // Prefer subpath exports via ./runtime/* and direct file imports.
  if (exportsMap && Object.prototype.hasOwnProperty.call(exportsMap, './runtime')) {
    violations.push("exports['./runtime'] is forbidden (use './runtime/*' subpath exports only)")
  }

  const runtimeIndexPath = path.join(pkgPath, 'src', 'runtime', 'index.ts')
  if (existsSync(runtimeIndexPath)) {
    violations.push('src/runtime/index.ts is forbidden in core packages')
  }

  return violations
}
