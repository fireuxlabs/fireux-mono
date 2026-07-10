// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
// FILE: scripts/guards/projects.mjs
// FireUX Projects (Apps) Guard
//
// Enforces the canonical Level-1 shape for projects/*/* apps.
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  inspectLevelOne,
  LOCAL_GENERATED_NOISE_NAMES,
} from './_lib/filesystem-policy.mjs'

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

const STATIC_PROJECT_HARNESSES = new Set(['fireux/no-fireux-embed-test'])
const STATIC_HARNESS_REQUIRED_L1 = ['public', 'firebase.json']
const STATIC_HARNESS_PROVIDER_PAGES = [
  {
    rel: 'public/go-qr.html',
    provider: 'Go QR',
    required: [
      'https://go-qr.web.app/tools/',
      "providerOrigin: 'https://go-qr.web.app'",
      "messageSource: 'go-qr'",
    ],
  },
  {
    rel: 'public/sproochli.html',
    provider: 'Sproochli',
    required: [
      'https://sproochli.web.app/tools/',
      "providerOrigin: 'https://sproochli.web.app'",
      "messageSource: 'sproochli'",
    ],
  },
  {
    rel: 'public/misebox.html',
    provider: 'Misebox',
    required: [
      'https://misebox-78f9c.web.app/tools/',
      "providerOrigin: 'https://misebox-78f9c.web.app'",
      "messageSource: 'misebox'",
    ],
  },
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

const HARD_FORBIDDEN_L1 = [
  '.firebaserc',
]

const STATIC_HARNESS_FORBIDDEN_L1 = [
  ...HARD_FORBIDDEN_L1,
  'app',
  'server',
  'package.json',
  'nuxt.config.ts',
  'tsconfig.json',
  '.env',
]

// Known generated entries are shared local noise. The generated-artifacts
// guard rejects them if they ever enter the Git index.
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
      const projectKey = `${eco}/${appName}`

      if (STATIC_PROJECT_HARNESSES.has(projectKey)) {
        const staticViolation = checkStaticProjectHarness(appPath)
        if (staticViolation) violations.push(staticViolation)
        const contentViolation = checkStaticProjectHarnessContent(appPath)
        if (contentViolation) violations.push(contentViolation)
        continue
      }

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

  const {
    missing,
    forbidden: forbiddenFound,
    unexpected,
  } = inspectLevelOne(entries, {
    required: REQUIRED_L1,
    allowed: ALLOWED_L1,
    forbidden: HARD_FORBIDDEN_L1,
    noise: LOCAL_GENERATED_NOISE_NAMES,
    isAllowed: (entry) => entry.startsWith('.') && isAllowedDotfile(entry),
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
    `- Keep generated output ignored and untracked`,
    `- Move implementation details into /app or /server`,
    `- Do NOT commit Firebase CLI artifacts (.firebase) or app-level project selectors (.firebaserc)`
  )

  return lines.join('\n')
}

function checkStaticProjectHarness(appPath) {
  const entries = readdirSync(appPath, { withFileTypes: true })
    .filter((e) => e.name !== '.DS_Store')
    .map((e) => e.name)

  const {
    missing,
    forbidden: forbiddenFound,
    unexpected,
  } = inspectLevelOne(entries, {
    required: STATIC_HARNESS_REQUIRED_L1,
    forbidden: STATIC_HARNESS_FORBIDDEN_L1,
    noise: LOCAL_GENERATED_NOISE_NAMES,
  })

  if (!missing.length && !forbiddenFound.length && !unexpected.length) {
    return null
  }

  const lines = [
    '[guard] ❌ static project harness shape violation:',
    `  Path: ${appPath}`,
  ]

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
    '- Static project harnesses are plain external-site tests, not FireUX apps.',
    `- Required: ${STATIC_HARNESS_REQUIRED_L1.join(', ')}`,
    '- Do not add Nuxt, FireUX runtime, app config, server, or env source.'
  )

  return lines.join('\n')
}

function checkStaticProjectHarnessContent(appPath) {
  const publicDir = path.join(appPath, 'public')
  if (!existsSync(publicDir)) return null

  const endpointViolations = []
  const localComparisonViolations = []
  for (const filePath of listFiles(publicDir)) {
    const rel = path.relative(appPath, filePath)
    const content = readFileSync(filePath, 'utf8')

    if (hasForbiddenHarnessEndpoint(content)) {
      endpointViolations.push(rel)
    }

    if (hasUnsafeLocalComparisonEndpoint(content)) {
      localComparisonViolations.push(rel)
    }
  }

  const providerViolations = []
  for (const page of STATIC_HARNESS_PROVIDER_PAGES) {
    const filePath = path.join(appPath, page.rel)
    if (!existsSync(filePath)) continue
    const content = readFileSync(filePath, 'utf8')
    const missing = page.required.filter((needle) => !content.includes(needle))
    if (missing.length) providerViolations.push({ ...page, missing })
  }

  if (
    !endpointViolations.length &&
    !localComparisonViolations.length &&
    !providerViolations.length
  ) return null

  const lines = [
    '[guard] ❌ static project harness content violation:',
    `  Path: ${appPath}`,
  ]

  if (endpointViolations.length) {
    lines.push('  Insecure endpoints are forbidden outside approved local comparisons:')
    endpointViolations
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((rel) => lines.push(`    - ${rel}`))
  }

  if (localComparisonViolations.length) {
    lines.push('  Local comparison endpoints must use the safe local helper:')
    localComparisonViolations
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((rel) => lines.push(`    - ${rel}`))
  }

  if (providerViolations.length) {
    lines.push('  Provider page contract violations:')
    providerViolations.forEach((violation) => {
      lines.push(`    - ${violation.rel} (${violation.provider})`)
      violation.missing.forEach((needle) => lines.push(`      missing: ${needle}`))
    })
  }

  lines.push(
    '',
    '[guard] Fix:',
    '- Plain external-site harness pages must always include deployed HTTPS provider URLs.',
    '- Local provider URLs are allowed only through connectLocalProviderIframe.',
    '- Do not set iframe src directly to localhost, 127.0.0.1, 0.0.0.0, or other http:// origins.',
    '- Keep Go QR, Sproochli, and Misebox pages pointed at their deployed provider origins.'
  )

  return lines.join('\n')
}

function hasForbiddenHarnessEndpoint(content) {
  let checkedContent = content.replace(
    /http:\/\/localhost:(?:3001|3011|3013)\b/g,
    ''
  )

  if (checkedContent.includes('function isLocalHarness()')) {
    checkedContent = checkedContent.replace(
      /['"](?:localhost|127\.0\.0\.1|\[::1\]|::1)['"]/g,
      ''
    )
  }

  return (
    /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i.test(checkedContent) ||
    /http:\/\//i.test(checkedContent)
  )
}

function hasUnsafeLocalComparisonEndpoint(content) {
  if (!/http:\/\/localhost:(?:3001|3011|3013)\b/i.test(content)) return false
  if (!content.includes('connectLocalProviderIframe')) return true
  if (/\bsrc=["']http:\/\/localhost:/i.test(content)) return true
  return false
}

function listFiles(dir) {
  const files = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath))
      continue
    }
    if (entry.isFile()) files.push(entryPath)
  }

  return files
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
