// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/guards/ecosystem.mjs
import { readdirSync, existsSync, readFileSync } from 'node:fs'
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

// Ecosystem config contract (inside each ecosystem package)
const REQUIRED_CONFIG_DIR = path.join('src', 'config')
const REQUIRED_CONFIG_DIRS = ['firebase']
const ALLOWED_CONFIG_FILES = ['module']
const CONFIG_ALLOWED_NOISE = ['.DS_Store']

// Firebase config contract (inside each ecosystem package)
const REQUIRED_FIREBASE_DIR = path.join('src', 'config', 'firebase')
const REQUIRED_FIREBASE_FILES = [
  'ecosystem.config.ts',
  'service-account.example.json',
]
const FIREBASE_ALLOWED_NOISE = ['.DS_Store']

// Ecosystem runtime contract
const REQUIRED_RUNTIME_PUBLIC_DIR = path.join('src', 'runtime', 'public')


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

  const configViolations = checkConfigShape(pkgPath)
  const firebaseShapeViolations = checkFirebaseShape(pkgPath)
  const firebaseConfigViolations = checkFirebaseConfig(pkgPath)
  const runtimePublicViolations = checkRuntimePublicShape(pkgPath)

  if (
    !missing.length &&
    !unexpected.length &&
    !runtimePublicViolations &&
    !configViolations &&
    !firebaseShapeViolations &&
    !firebaseConfigViolations
  )
    return null

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

  if (firebaseShapeViolations) {
    lines.push('', ...firebaseShapeViolations.split('\n'))
  }

  if (runtimePublicViolations) {
    lines.push('', ...runtimePublicViolations.split('\n'))
  }

  if (configViolations) {
    lines.push('', ...configViolations.split('\n'))
  }


  if (firebaseConfigViolations) {
    lines.push('', ...firebaseConfigViolations.split('\n'))
  }

  lines.push(
    '',
    '[guard] Fix:',
    `- Ecosystem packages MUST match L1 exactly: ${REQUIRED_L1.join(', ')}`,
    '- Move implementation into /src (including ecosystem config and credential wiring; never credential files)',
    '- docs/ is required for ecosystem package shape; it is not implementation canon by default',
    '- .firebaserc is required for ecosystems (this is where Firebase project binding lives)',
    `- Ecosystems MUST ship runtime public assets at /${REQUIRED_RUNTIME_PUBLIC_DIR}`,
    `- Config MUST live at /${REQUIRED_CONFIG_DIR} and include /firebase (and optional /module)`,
    `- Firebase tracked config MUST live at /${REQUIRED_FIREBASE_DIR} with: ${REQUIRED_FIREBASE_FILES.join(
      ', '
    )} (no index files)`,
    '- Real credentials must stay outside the repository and be supplied through environment/application-default credentials'
  )

  return lines.join('\n')
}

function checkRuntimePublicShape(pkgPath) {
  const publicDir = path.join(pkgPath, REQUIRED_RUNTIME_PUBLIC_DIR)
  if (!existsSync(publicDir)) {
    return [
      '  Runtime public assets violation:',
      `    Missing required directory: ${publicDir}`,
    ].join('\n')
  }

  return null
}

function checkConfigShape(pkgPath) {
  const configDir = path.join(pkgPath, REQUIRED_CONFIG_DIR)
  if (!existsSync(configDir)) {
    return [
      '  Config shape violation:',
      `    Missing required config directory: ${configDir}`,
    ].join('\n')
  }

  const entries = readdirSync(configDir).filter((n) => n !== '.DS_Store')

  const missingDirs = REQUIRED_CONFIG_DIRS.filter((d) => !entries.includes(d))

  const allowedEntries = new Set([...ALLOWED_CONFIG_FILES, ...REQUIRED_CONFIG_DIRS])
  const isAllowedConfigEntry = (entry) => {
    if (allowedEntries.has(entry)) return true
    if (CONFIG_ALLOWED_NOISE.includes(entry)) return true
    return entry.endsWith('-config.ts')
  }
  const unexpected = entries.filter((e) => !isAllowedConfigEntry(e))

  if (!missingDirs.length && !unexpected.length) return null

  const lines = ['  Config shape violation:', `    Dir: ${configDir}`]
  if (missingDirs.length) {
    lines.push('    Missing required directories:')
    missingDirs.forEach((d) => lines.push(`      - ${d}`))
  }
  if (unexpected.length) {
    lines.push('    Unexpected config entries (only allow specific files/dirs):')
    unexpected
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((u) => lines.push(`      - ${u}`))
  }
  return lines.join('\n')
}

function checkFirebaseConfig(pkgPath) {
  const firebaseDir = path.join(pkgPath, REQUIRED_FIREBASE_DIR)
  const configPath = path.join(firebaseDir, 'ecosystem.config.ts')

  if (!existsSync(configPath)) return null

  let raw = ''
  try {
    raw = readFileSync(configPath, 'utf8')
  } catch {
    return [
      '  Firebase config violation:',
      `    File: ${configPath}`,
      '    - Cannot read ecosystem.config.ts',
    ].join('\n')
  }

  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
  ]

  const missingKeys = []
  const emptyKeys = []

  for (const key of requiredKeys) {
    const keyPresent = new RegExp(`\\b${key}\\s*:`).test(raw)
    if (!keyPresent) {
      missingKeys.push(key)
      continue
    }

    // Enforce non-empty string literals. This intentionally stays simple because
    // ecosystem configs are expected to be static literals.
    const emptyLiteral = new RegExp(`\\b${key}\\s*:\\s*(['"])\\s*\\1`).test(
      raw
    )
    if (emptyLiteral) emptyKeys.push(key)
  }

  if (!missingKeys.length && !emptyKeys.length) return null

  const lines = ['  Firebase config violation:', `    File: ${configPath}`]
  if (missingKeys.length) {
    lines.push('    Missing firebase keys:')
    missingKeys.forEach((k) => lines.push(`      - ${k}`))
  }
  if (emptyKeys.length) {
    lines.push('    Empty firebase values (must not be blank):')
    emptyKeys.forEach((k) => lines.push(`      - ${k}`))
  }
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
    (e) =>
      !REQUIRED_FIREBASE_FILES.includes(e) &&
      !FIREBASE_ALLOWED_NOISE.includes(e)
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
    lines.push('    Unexpected (only tracked public config and inert credential example; no local credential or index):')
    unexpected
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((u) => lines.push(`      - ${u}`))
  }

  return lines.join('\n')
}
