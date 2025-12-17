// FILE: scripts/guards/ecosystem.mjs
// FireUX Ecosystem Packages Guard
//
// Enforces the canonical Level-1 shape for packages/ecosystem/*
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const REQUIRED_L1 = [
  'config',
  'package.json',
  'registry.json',
  'README.md',
  'src',
  'tsconfig.json',
  '.firebaserc',
]

const ALLOWED_L1 = ['docs']

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const ecoRoot = path.join(repoRoot, 'packages', 'ecosystem')

  if (!existsSync(ecoRoot)) {
    console.warn(
      '[guard] ⚠️  packages/ecosystem not found, skipping ecosystem guard'
    )
    return
  }

  const ecosystemPackages = readdirSync(ecoRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  for (const pkgName of ecosystemPackages) {
    const pkgPath = path.join(ecoRoot, pkgName)
    checkEcosystemPackage(pkgPath)
  }

  console.log('[guard] ✅ ecosystem packages valid')
}

function checkEcosystemPackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))

  const allowed = new Set([...REQUIRED_L1, ...ALLOWED_L1])
  const unexpected = entries.filter((e) => !allowed.has(e))

  if (missing.length || unexpected.length) {
    console.error('\n[guard] ❌ ecosystem package shape violation:')
    console.error(`  Path: ${pkgPath}`)

    if (missing.length) {
      console.error('  Missing required:')
      missing.forEach((m) => console.error(`    - ${m}`))
    }

    if (unexpected.length) {
      console.error('  Unexpected:')
      unexpected.sort().forEach((u) => console.error(`    - ${u}`))
    }

    console.error(
      `\n[guard] Fix:\n` +
        `- Ecosystem packages MUST expose this L1 shape:\n` +
        `  Required: ${REQUIRED_L1.join(', ')}\n` +
        `  Allowed: ${ALLOWED_L1.join(', ') || '(none)'}\n` +
        `- Move implementation details into /src\n` +
        `- Remove build output and tooling artifacts before committing\n`
    )

    throw new Error('ecosystem package shape violation')
  }
}