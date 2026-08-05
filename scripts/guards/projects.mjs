// @fireux-script
// last_used: 2026-08-04
// usage_note: guard project App shape, shared TypeScript base, and Core-owned PWA manifest authority.
// FILE: scripts/guards/projects.mjs
// FireUX Projects (Apps) Guard
//
// Enforces the canonical Level-1 shape for projects/*/* apps.
//
// Called by scripts/guard.mjs.
// MUST NOT be run directly.

import { readdirSync, existsSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
import { withBuildVersion } from '../../packages/core/fireux-core/src/runtime/utils/buildVersionUrl.ts'
import {
  inspectLevelOne,
  LOCAL_GENERATED_NOISE_NAMES,
} from './_lib/filesystem-policy.mjs'
import { APP_REGISTRY } from '../_lib/app-registry.mjs'

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

const HARD_FORBIDDEN_L1 = ['.firebaserc']
const PROJECT_TSCONFIG_BASE = '../../tsconfig.projects.json'

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

  assertCorePwaCacheVersioning(repoRoot)

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
      if (shapeViolation) violations.push(shapeViolation)

      const configViolations = checkProjectNuxtConfig(repoRoot, appPath)
      violations.push(...configViolations)

      const tsconfigViolation = checkProjectTsconfigBase(appPath)
      if (tsconfigViolation) violations.push(tsconfigViolation)

      const publicViolation = checkProjectPublicImageLibrary(appPath)
      if (publicViolation) violations.push(publicViolation)

      const authViolation = checkProjectAuthSpine(appPath)
      if (authViolation) violations.push(authViolation)

      const manifestViolation = checkProjectManifestAuthority(appPath)
      if (manifestViolation) violations.push(manifestViolation)
    }
  }

  violations.push(...checkProjectRegistryCompleteness(projectsRoot))

  if (violations.length) {
    throw new Error(violations.join('\n\n'))
  }

  console.log('[guard] ✅ project apps valid')
}

function literalConfigValue(source, key) {
  return (
    source.match(new RegExp(`\\b${key}:\\s*['\"]([^'\"]+)['\"]`))?.[1] || ''
  )
}

function checkProjectNuxtConfig(repoRoot, appPath) {
  const configPath = path.join(appPath, 'nuxt.config.ts')
  if (!existsSync(configPath)) return []

  const source = readFileSync(configPath, 'utf8')
  const relative = path.relative(repoRoot, configPath)
  const violations = []
  const reject = (reason) =>
    violations.push(`[guard] ❌ ${relative}: ${reason}`)

  if (/FireUX app config guide:/.test(source)) {
    reject('remove the obsolete App-config guide comment.')
  }
  if (/^\s*\/\/\s*Concurrent edit\b/m.test(source)) {
    reject('keep change history in Git, not nuxt.config.ts comments.')
  }
  if (/\bwithFireuxNuxtConfig\b/.test(source)) {
    reject(
      'project Nuxt overrides are not an App delta; promote shared behavior to its owning Core or extension seam.'
    )
  }
  if (/['"]@\/assets\/styles\/main\.css['"]/.test(source)) {
    reject('Core discovers app/assets/styles/main.css automatically.')
  }
  if (/\bconsoles:\s*\[\s*\]/s.test(source)) {
    reject(
      'omit consoles when the App has no Consoles; [] is the Core default.'
    )
  }
  if (/\bstaticPaths:\s*\[[^\]]*['"]\/['"]/s.test(source)) {
    reject("omit '/' from staticPaths; Core includes the root route.")
  }
  if (
    /\b(?:googleMapsApiKey|googleMapsMapId|goQrProviderBaseUrl)\b/.test(source)
  ) {
    reject('integration runtime defaults belong to the consuming extension.')
  }

  const topLevelDeclarations =
    source.match(
      /^(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm
    ) || []
  for (const declaration of topLevelDeclarations) {
    const name = declaration.match(/\s+([A-Za-z_$][\w$]*)/)?.[1]
    if (name) {
      reject(
        `move top-level ${name} into an owning App config, composable, or package seam.`
      )
    }
  }

  const role = literalConfigValue(source, 'role')
  const ecosystem = literalConfigValue(source, 'ecosystem')
  const appDatabaseId = literalConfigValue(source, 'databaseId')
  const ecosystemConfigPath = path.join(
    repoRoot,
    'packages',
    'ecosystem',
    `fireux-${ecosystem}`,
    'src',
    'config',
    'firebase',
    'ecosystem.config.ts'
  )
  if (
    role !== 'standalone' &&
    appDatabaseId &&
    existsSync(ecosystemConfigPath)
  ) {
    const ecosystemSource = readFileSync(ecosystemConfigPath, 'utf8')
    const ecosystemDatabaseId = literalConfigValue(
      ecosystemSource,
      'databaseId'
    )
    if (appDatabaseId === ecosystemDatabaseId) {
      reject(
        `omit databaseId '${appDatabaseId}'; it is inherited from fireux-${ecosystem}.`
      )
    }
  }

  return violations
}

function checkProjectRegistryCompleteness(projectsRoot) {
  const templatePath = 'projects/templates/fireux-template'
  const appPaths = []

  for (const ecosystem of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!ecosystem.isDirectory() || ecosystem.name.startsWith('.')) continue
    const ecosystemPath = path.join(projectsRoot, ecosystem.name)
    for (const app of readdirSync(ecosystemPath, { withFileTypes: true })) {
      if (!app.isDirectory() || app.name.startsWith('.')) continue
      const absolute = path.join(ecosystemPath, app.name)
      if (!existsSync(path.join(absolute, 'package.json'))) continue
      appPaths.push(`projects/${ecosystem.name}/${app.name}`)
    }
  }

  const registryEntries = Object.values(APP_REGISTRY)
  const registeredPaths = registryEntries.map((entry) =>
    String(entry.workspace || '').replace(/^\.\//, '')
  )
  const registered = new Set(registeredPaths)
  const actual = new Set(appPaths)
  const missing = appPaths.filter(
    (entry) => entry !== templatePath && !registered.has(entry)
  )
  const stale = registeredPaths.filter((entry) => !actual.has(entry))

  const identityDrift = registryEntries.flatMap((entry) => {
    const workspace = String(entry.workspace || '').replace(/^\.\//, '')
    const configPath = path.join(
      projectsRoot,
      '..',
      workspace,
      'nuxt.config.ts'
    )
    if (!existsSync(configPath)) return []

    const source = readFileSync(configPath, 'utf8')
    const expected = {
      appId: literalConfigValue(source, 'id'),
      ecosystem: literalConfigValue(source, 'ecosystem'),
      role: literalConfigValue(source, 'role'),
    }

    return Object.entries(expected).flatMap(([field, value]) =>
      String(entry[field] || '') === value
        ? []
        : [
            `${workspace}: registry ${field} '${String(entry[field] || '')}' does not match App config '${value}'.`,
          ]
    )
  })

  if (!missing.length && !stale.length && !identityDrift.length) return []

  const lines = [
    '[guard] ❌ project App registry drift:',
    ...missing.map((entry) => `  Unregistered App: ${entry}`),
    ...stale.map((entry) => `  Registry target missing: ${entry}`),
    ...identityDrift.map((entry) => `  Identity drift: ${entry}`),
    '',
    '[guard] Fix:',
    '- Do not copy project folders without completing the canonical App workflow.',
    '- Every real App must have one exact workspace entry in scripts/_lib/app-registry.mjs.',
    '- Registry appId, ecosystem, and role must match the App Nuxt config.',
    '- The canonical template is the only project package excluded from registration.',
  ]
  return [lines.join('\n')]
}

export function assertCorePwaCacheVersioning(repoRoot) {
  assert.equal(
    withBuildVersion('/manifest.webmanifest', ''),
    '/manifest.webmanifest'
  )
  assert.equal(
    withBuildVersion('/manifest.webmanifest', 'build /?#'),
    '/manifest.webmanifest?v=build%20%2F%3F%23'
  )
  assert.equal(
    withBuildVersion('/img/icon.png?variant=maskable', 'build 2'),
    '/img/icon.png?variant=maskable&v=build%202'
  )
  assert.equal(
    withBuildVersion('/img/icon.png?variant=maskable#preview', 'build 2'),
    '/img/icon.png?variant=maskable&v=build%202#preview'
  )

  const shell = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/components/App/Shell.vue'
    ),
    'utf8'
  )
  const manifestRoute = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/server/manifest.webmanifest.get.ts'
    ),
    'utf8'
  )
  const pwaConfig = readFileSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/config/app/pwa.ts'),
    'utf8'
  )
  const coreModule = readFileSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/module.ts'),
    'utf8'
  )

  assert.match(shell, /withBuildVersion\(\s*'\/manifest\.webmanifest'/)
  assert.match(shell, /runtimeConfig\.app\?\.buildId/)
  assert.match(manifestRoute, /id:\s*'\/'/)
  assert.match(
    manifestRoute,
    /withBuildVersion\(brandAssets\.pwaIcon192,\s*buildId\)/
  )
  assert.match(
    manifestRoute,
    /withBuildVersion\(brandAssets\.pwaIcon512,\s*buildId\)/
  )
  assert.doesNotMatch(
    pwaConfig,
    /\{\s*rel:\s*'manifest'/,
    'Core PWA config must not emit a second unversioned manifest link.'
  )
  assert.match(
    pwaConfig,
    /manifest:\s*false/,
    'Vite PWA manifest generation must remain disabled in favor of the Core server route.'
  )
  assert.match(
    coreModule,
    /route:\s*['"]\/manifest\.webmanifest['"][\s\S]*?handler:\s*resolver\.resolve\(['"]\.\/runtime\/server\/manifest\.webmanifest\.get['"]\)/,
    'Core must explicitly register the authoritative PWA manifest server route.'
  )
}

function checkProjectManifestAuthority(appPath) {
  const localManifest = path.join(appPath, 'public', 'manifest.webmanifest')
  if (!existsSync(localManifest)) return null

  return [
    '[guard] ❌ project-local PWA manifest detected:',
    `  - ${localManifest}`,
    '',
    '[guard] Fix:',
    '- Use the FireUX Core manifest.webmanifest server route.',
    '- Keep manifest identity and build-versioned asset URLs Core-owned.',
    '- Configure shared App identity/assets instead of adding a static manifest.',
  ].join('\n')
}

function checkProjectAuthSpine(appPath) {
  const localAuthPages = ['auth.vue', 'login.vue', 'register.vue']
    .map((name) => path.join(appPath, 'app', 'pages', name))
    .filter((filePath) => existsSync(filePath))

  if (!localAuthPages.length) return null

  return [
    '[guard] ❌ project-local authentication route detected:',
    ...localAuthPages.map((filePath) => `  - ${filePath}`),
    '',
    '[guard] Fix:',
    '- Use the FireUX Core /auth route for sign-in and registration.',
    '- Keep App identity and branding in project config and shared brand assets.',
    '- Do not fork authentication behavior in a project page.',
  ].join('\n')
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

  if (!missing.length && !forbiddenFound.length && !unexpected.length)
    return null

  const lines = [
    '[guard] ❌ project app shape violation:',
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

function checkProjectTsconfigBase(appPath) {
  const tsconfigPath = path.join(appPath, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) return null

  const source = readFileSync(tsconfigPath, 'utf8')
  const extendsMatch = source.match(/^\s*"extends"\s*:\s*"([^"]+)"\s*,?\s*$/m)
  const actualBase = extendsMatch?.[1]
  const legacyAlias = source.match(/"(@fireux-[^"]+)"\s*:/)?.[1]

  if (actualBase === PROJECT_TSCONFIG_BASE && !legacyAlias) return null

  return [
    '[guard] ❌ project TypeScript base violation:',
    `  Path: ${tsconfigPath}`,
    `  Expected extends: ${PROJECT_TSCONFIG_BASE}`,
    `  Actual extends: ${actualBase ?? '(missing)'}`,
    ...(legacyAlias ? [`  Retired path alias: ${legacyAlias}`] : []),
    '',
    '[guard] Fix:',
    '- Extend the single shared projects/tsconfig.projects.json base.',
    '- Keep only App-owned paths, include/exclude boundaries, and durable comments locally.',
    '- Use canonical package paths; do not restore @fireux-* path aliases.',
    '- Do not add ecosystem-level tsconfig.app.base.json intermediates.',
  ].join('\n')
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
  )
    return null

  const lines = [
    '[guard] ❌ static project harness content violation:',
    `  Path: ${appPath}`,
  ]

  if (endpointViolations.length) {
    lines.push(
      '  Insecure endpoints are forbidden outside approved local comparisons:'
    )
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
      violation.missing.forEach((needle) =>
        lines.push(`      missing: ${needle}`)
      )
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
    `  Missing required public assets:`,
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
