// FILE: scripts/guards/projects.mjs
// FireUX Projects (Apps) Guard
//
// Enforces the canonical Level-1 shape for projects/*/* apps.
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const REQUIRED_L1 = [
  'app',
  'public',
  'server',
  'package.json',
  'nuxt.config.ts',
  'tsconfig.json',
  'firebase.json',
  '.env',
]

// Explicitly allowed, but never required.
const ALLOWED_L1 = ['docs', 'content.config.ts']

// Allowed dotfiles at app root.
// (We allow per-app env files; other dotfiles stay disallowed by default.)
const ALLOWED_DOTFILES = new Set(['.env'])
function isAllowedDotfile(name) {
  if (ALLOWED_DOTFILES.has(name)) return true
  if (name.startsWith('.env.')) return true
  return false
}

const FORBIDDEN_L1 = [
  'dist',
  '.nuxt',
  '.output',
  '.nitro',
  '.cache',
  '.data',
  'tsconfig.tsbuildinfo',
  '.firebase',
  '.firebaserc',
]

// pnpm workspaces create per-app node_modules. We allow them locally,
// but they should never be committed (gitignored).
const ALLOWED_NOISE_L1 = ['node_modules']

// Public image library baseline expected in every app.
// Extras are allowed (e.g. fireux-app has additional `img/app/stack/*`).
const REQUIRED_PUBLIC_ASSETS = [
  'img/app/cover.png',
  'img/app/thumbnail.png',
  'img/app/logo.png',
  'img/app/favicon.ico',
  'img/app/wordmark.png',
  'img/app/wordmark.svg',
  'img/app/wordmark-light.png',
  'img/app/wordmark-light.svg',
  'img/app/wordmark-dark.png',
  'img/app/pwa/icon-192.png',
  'img/app/pwa/icon-512.png',
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const projectsRoot = path.join(repoRoot, 'projects')

  if (!existsSync(projectsRoot)) {
    console.warn('[guard] ⚠️  /projects not found, skipping projects guard')
    return
  }

  const ecosystems = readdirSync(projectsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)

  const violations = []

  for (const eco of ecosystems) {
    const ecoPath = path.join(projectsRoot, eco)

    const apps = readdirSync(ecoPath, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => d.name)

    for (const appName of apps) {
      const appPath = path.join(ecoPath, appName)
      const shapeViolation = checkProjectApp(appPath)
      if (shapeViolation) {
        violations.push(shapeViolation)
        continue
      }

      const publicViolation = checkProjectPublicImageLibrary(appPath)
      if (publicViolation) violations.push(publicViolation)
    }
  }

  if (violations.length) {
    throw new Error(violations.join('\n\n'))
  }

  console.log('[guard] ✅ project apps valid')
}

function checkProjectApp(appPath) {
  const entries = readdirSync(appPath, { withFileTypes: true })
    .filter((e) => e.name !== '.DS_Store')
    .map((e) => e.name)

  const missing = REQUIRED_L1.filter((r) => !entries.includes(r))
  const forbiddenFound = entries.filter((e) => FORBIDDEN_L1.includes(e))

  const allowed = new Set([...REQUIRED_L1, ...ALLOWED_L1])
  const unexpected = entries.filter((e) => {
    if (FORBIDDEN_L1.includes(e)) return false
    if (allowed.has(e)) return false
    if (ALLOWED_NOISE_L1.includes(e)) return false
    if (e.startsWith('.') && isAllowedDotfile(e)) return false
    return true
  })

  if (!missing.length && !forbiddenFound.length && !unexpected.length) return null

  const lines = ['[guard] ❌ project app shape violation:', `  Path: ${appPath}`]

  if (missing.length) {
    lines.push('  Missing required:')
    missing.forEach((m) => lines.push(`    - ${m}`))
  }

  if (forbiddenFound.length) {
    lines.push('  Forbidden (must not exist at L1):')
    forbiddenFound
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((f) => lines.push(`    - ${f}`))
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
    `- Apps MUST expose only this L1 shape:`,
    `  Required: ${REQUIRED_L1.join(', ')}`,
    `  Allowed: ${ALLOWED_L1.join(', ') || '(none)'}`,
    `  Allowed dotfiles: .env, .env.*`,
    `- Delete build output (.nuxt/.output/dist/etc) before saving`,
    `- Move implementation details into /app or /server`,
    `- Do NOT commit Firebase CLI artifacts (.firebase) or app-level project selectors (.firebaserc)`
  )

  return lines.join('\n')
}

function checkProjectPublicImageLibrary(appPath) {
  const publicDir = path.join(appPath, 'public')
  const missing = []

  for (const rel of REQUIRED_PUBLIC_ASSETS) {
    const full = path.join(publicDir, rel)
    if (!existsSync(full)) missing.push(rel)
  }

  if (!missing.length) return null

  const lines = [
    '[guard] ❌ project public image library violation:',
    `  Path: ${appPath}`,
    `  Missing required public assets:`
  ]
  missing
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .forEach((m) => lines.push(`    - public/${m}`))

  lines.push(
    '',
    '[guard] Fix:',
    '- Ensure every app includes the canonical public image library tree:',
    '  public/img/app/* and public/img/app/pwa/*',
    '- Extras are allowed; missing baseline assets are not'
  )

  return lines.join('\n')
}