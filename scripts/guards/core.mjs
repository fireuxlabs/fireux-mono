// FILE: scripts/guards/core.mjs
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const REQUIRED_L1 = [
  'package.json',
  'registry.json',
  'README.md',
  'src',
  'tsconfig.json',
]

const ALLOWED_NOISE = ['node_modules', 'tsconfig.tsbuildinfo', '.DS_Store']

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

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))
  const unexpected = entries.filter(
    (e) => !REQUIRED_L1.includes(e) && !ALLOWED_NOISE.includes(e)
  )

  if (!missing.length && !unexpected.length) return null

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

  lines.push(
    '',
    '[guard] Fix:',
    `- Core packages MUST match L1 exactly: ${REQUIRED_L1.join(', ')}`,
    '- Move implementation into /src',
    '- Delete build output (dist) and other junk before committing'
  )

  return lines.join('\n')
}