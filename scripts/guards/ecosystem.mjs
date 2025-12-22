// FILE: scripts/guards/ecosystem.mjs
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const REQUIRED_L1 = [
  'package.json',
  'registry.json',
  'README.md',
  'src',
  'tsconfig.json',
  'docs',
  '.firebaserc',
]

const ALLOWED_NOISE = ['node_modules', 'tsconfig.tsbuildinfo', '.DS_Store']

// Firebase config contract (inside each ecosystem package)
const REQUIRED_FIREBASE_DIR = path.join('src', 'config', 'firebase')
// NOTE: service-account.json is intentionally ignored by git and should be
// provided locally by developers. The repo only requires a safe template.
const REQUIRED_FIREBASE_FILES = ['ecosystem.config.ts', 'service-account.example.json']
const FIREBASE_ALLOWED_NOISE = ['.DS_Store', 'service-account.json']

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

  const violations = []

  for (const pkgName of ecosystemPackages) {
    const pkgPath = path.join(ecoRoot, pkgName)
    const v = checkEcosystemPackage(pkgPath)
    if (v) violations.push(v)
  }

  if (violations.length) throw new Error(violations.join('\n\n'))

  console.log('[guard] ✅ ecosystem packages valid')
}

function checkEcosystemPackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))
  const unexpected = entries.filter(
    (e) => !REQUIRED_L1.includes(e) && !ALLOWED_NOISE.includes(e)
  )

  const firebaseViolations = checkFirebaseShape(pkgPath)

  if (!missing.length && !unexpected.length && !firebaseViolations) return null

  const lines = [
    '[guard] ❌ ecosystem package shape violation:',
    `  Path: ${pkgPath}`,
  ]

  if (missing.length) {
    lines.push('  Missing required (L1):')
    missing.forEach((m) => lines.push(`    - ${m}`))
  }

  if (unexpected.length) {
    lines.push('  Unexpected (L1):')
    unexpected
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((u) => lines.push(`    - ${u}`))
  }

  if (firebaseViolations) {
    lines.push('', ...firebaseViolations.split('\n'))
  }

  lines.push(
    '',
    '[guard] Fix:',
    `- Ecosystem packages MUST match L1 exactly: ${REQUIRED_L1.join(', ')}`,
    '- Move implementation into /src (including ecosystem config + secrets wiring)',
    '- docs/ is required for ecosystems (this is where the canonical docs live)',
    '- .firebaserc is required for ecosystems (this is where Firebase project binding lives)',
    `- Firebase MUST live at /${REQUIRED_FIREBASE_DIR} with exactly: ${REQUIRED_FIREBASE_FILES.join(
      ', '
    )} (no index files)`
  )

  return lines.join('\n')
}

function checkFirebaseShape(pkgPath) {
  const firebaseDir = path.join(pkgPath, REQUIRED_FIREBASE_DIR)

  if (!existsSync(firebaseDir)) {
    return [
      '  Missing required Firebase directory:',
      `    - ${path.join(pkgPath, REQUIRED_FIREBASE_DIR)}`,
    ].join('\n')
  }

  const entries = readdirSync(firebaseDir).filter((n) => n !== '.DS_Store')

  const missing = REQUIRED_FIREBASE_FILES.filter((f) => !entries.includes(f))

  const unexpected = entries.filter(
    (e) => !REQUIRED_FIREBASE_FILES.includes(e) && !FIREBASE_ALLOWED_NOISE.includes(e)
  )

  if (!missing.length && !unexpected.length) return null

  const lines = [
    '  Firebase shape violation:',
    `    Dir: ${firebaseDir}`,
  ]

  if (missing.length) {
    lines.push('    Missing required:')
    missing.forEach((m) => lines.push(`      - ${m}`))
  }

  if (unexpected.length) {
    lines.push('    Unexpected (no index, no extras):')
    unexpected
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((u) => lines.push(`      - ${u}`))
  }

  return lines.join('\n')
}