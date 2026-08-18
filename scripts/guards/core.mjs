// @fireux-script
// last_used: 2026-08-04
// usage_note: guards Core package shape, exports, and the canonical App runtime-config seam.
// FILE: scripts/guards/core.mjs
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  COMMON_PACKAGE_ALLOWED_L1,
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

  const runtimeConfigViolations = checkRuntimeConfigConsumers(repoRoot)
  if (runtimeConfigViolations.length) {
    violations.push(
      [
        '[guard] ❌ App runtime config boundary violation:',
        ...runtimeConfigViolations.map((file) => `  - ${file}`),
        '',
        '[guard] Fix:',
        '- Read normalized App config through useFireUXConfig(event).',
        '- Resolve Console creation policy through resolveConsoleCanCreate.',
      ].join('\n')
    )
  }

  if (violations.length) throw new Error(violations.join('\n\n'))

  console.log('[guard] ✅ core packages valid')
}

function checkCorePackage(pkgPath) {
  const entries = readdirSync(pkgPath).filter((n) => n !== '.DS_Store')

  const { missing, unexpected } = inspectLevelOne(entries, {
    required: REQUIRED_L1,
    allowed: COMMON_PACKAGE_ALLOWED_L1,
  })

  const exportViolations = checkPackageExports(pkgPath)
  const contractViolations = checkFireuxCoreContracts(pkgPath)

  if (
    !missing.length &&
    !unexpected.length &&
    !exportViolations.length &&
    !contractViolations.length
  )
    return null

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

  if (contractViolations.length) {
    lines.push('  Core contracts invalid:')
    contractViolations.forEach((message) => lines.push(`    - ${message}`))
  }

  lines.push(
    '',
    '[guard] Fix:',
    `- Core packages MUST expose required L1: ${REQUIRED_L1.join(', ')}`,
    `- Optional L1 entries: ${COMMON_PACKAGE_ALLOWED_L1.join(', ')}`,
    '- Move implementation into /src',
    '- Keep generated output ignored and untracked'
  )

  return lines.join('\n')
}

function checkFireuxCoreContracts(pkgPath) {
  if (path.basename(pkgPath) !== 'fireux-core') return []

  const source = (relativePath) =>
    readFileSync(path.join(pkgPath, relativePath), 'utf8')
  const violations = []
  const runtimeType = source('src/config/app/runtime.ts')
  const runtimeView = source(
    'src/runtime/composables/fireux/app/FireUXConfig.ts'
  )
  const pluginConfig = source('src/config/module/plugins-config.ts')
  const onboarding = source('src/runtime/app/components/Create/System.vue')
  const appShell = source('src/runtime/components/App/Shell.vue')
  const appInitialization = source(
    'src/runtime/app/composables/utils/useAppInitialization.ts'
  )
  const appStatus = source('src/runtime/server/api/public/app/status.get.ts')
  const appConfigType = source('src/config/app/types.ts')
  const appConfigBuilder = source('src/config/app/fireux.config.ts')
  const console = source('src/runtime/composables/fireux/console/useConsole.ts')
  const consolePolicy = source('src/runtime/utils/console-policy.ts')
  const appConfig = source('src/config/app/fireux.config.ts')
  const metaContent = source('src/config/app/meta-content.ts')
  const metaContentLoader = source('src/config/app/meta-content-loader.ts')
  const authSystem = source('src/runtime/components/Auth/System.vue')
  const authComposable = source(
    'src/runtime/composables/fireux/firebase/useAuth.ts'
  )
  const userOnboarding = source('src/runtime/user/components/Create/System.vue')
  const userCreatePage = source('src/runtime/pages/users/create.vue')
  const appCreatePage = source('src/runtime/pages/apps/create.vue')
  const defaultHeader = source(
    'src/runtime/components/layouts/default/Header.vue'
  )
  const landingHero = source(
    'src/runtime/components/landing/LandingHeroSection.vue'
  )

  if (!runtimeType.includes('Omit<FireuxAppConfig, RuntimeNormalizedFields>')) {
    violations.push('RuntimeApp must derive from the authored FireuxAppConfig.')
  }
  if (
    !runtimeView.includes('consoles: toStringArray(fireux.consoles)') ||
    !runtimeView.includes(
      'consoleConfig: toConsoleConfig(fireux.consoleConfig)'
    )
  ) {
    violations.push(
      'FireUXConfig must normalize Console families and config once for runtime consumers.'
    )
  }
  if (!runtimeView.includes('useRuntimeConfig(event)')) {
    violations.push(
      'FireUXConfig must support the shared event-aware browser/server reader.'
    )
  }
  if (
    !console.includes('resolveConsoleCanCreate') ||
    !consolePolicy.includes("role !== 'tenant'")
  ) {
    violations.push(
      'Console UI and trusted onboarding must share the Core creation policy.'
    )
  }
  if (
    /FIREUX_CACHE_KEY|__FIREUX_CONFIG|developerPin|globalAppId|centralSignupUrl/.test(
      runtimeView
    )
  ) {
    violations.push('FireUXConfig contains a retired cache or ghost field.')
  }
  if (/fireux-config\.(?:client|server)/.test(pluginConfig)) {
    violations.push('Core must not restore the unused FireUX config providers.')
  }
  if (/from\s+['"](?:node:|jiti)/.test(metaContent)) {
    violations.push(
      'Authored App metadata must remain browser-safe; Node-only loading belongs in meta-content-loader.ts.'
    )
  }
  if (
    !appConfig.includes("from './meta-content-loader'") ||
    !metaContentLoader.includes("from 'node:fs'")
  ) {
    violations.push(
      'defineFireuxConfig must use the config-only App metadata loader.'
    )
  }
  for (const plugin of [
    'src/runtime/plugins/fireux-config.client.ts',
    'src/runtime/plugins/fireux-config.server.ts',
  ]) {
    if (existsSync(path.join(pkgPath, plugin))) {
      violations.push(`${plugin} is retired; use useFireUXConfig directly.`)
    }
  }
  if (/UPinInput|developer PIN/i.test(onboarding)) {
    violations.push(
      'App onboarding must rely on trusted server UID authorization, not a cosmetic client PIN.'
    )
  }
  if (
    !appStatus.includes('mediaReady:') ||
    !appStatus.includes('paletteReady:') ||
    !appStatus.includes('isAppMediaComplete') ||
    !appShell.includes('() => appStatus.value?.initialized === true') ||
    !appShell.includes('() => isResolved.value && !isInitialized.value') ||
    appShell.includes('appStatus.value?.initialized === true &&') ||
    appInitialization.indexOf('await options.onInitialized?.()') <
      appInitialization.indexOf('syncResult.failed.length') ||
    !appInitialization.includes('App setup is incomplete.')
  ) {
    violations.push(
      'App initialization must publish canonical media, while the shell blocker follows only the canonical App record.'
    )
  }
  if (
    !appConfigType.includes('theme?: AppTheme') ||
    !appConfigBuilder.includes('themeColor: app.theme?.palette.accent') ||
    !appConfigBuilder.includes('backgroundColor: app.theme?.palette.canvas')
  ) {
    violations.push(
      'App source must carry the reviewed semantic palette into runtime and PWA presentation.'
    )
  }
  for (const [owner, contents] of [
    ['Auth System', authSystem],
    ['default Header', defaultHeader],
    ['landing Hero', landingHero],
  ]) {
    if (
      !contents.includes('Open Dashboard') ||
      /Open workspace/i.test(contents)
    ) {
      violations.push(
        `${owner} must name the shared signed-in destination Open Dashboard.`
      )
    }
  }
  if (!authSystem.includes('userOnboardingPath')) {
    violations.push(
      'Auth System must send explicit sign-up journeys to shared User onboarding.'
    )
  }
  if (
    /retryAccountProvisioning|accountProvisionErrorMessage|handleAccountRecovery/.test(
      authSystem
    )
  ) {
    violations.push(
      'Auth System must establish identity only; explicit User onboarding owns account provisioning and recovery.'
    )
  }
  if (
    !userOnboarding.includes('retryAccountProvisioning') ||
    !userOnboarding.includes('FIREUX_ACCOUNT_TERMS_VERSION')
  ) {
    violations.push(
      'User onboarding must own explicit account provisioning with current legal acceptance.'
    )
  }
  if (/watch\(\s*uid,[\s\S]*createOnce\(/.test(authComposable)) {
    violations.push(
      'Routine auth-state changes must not automatically provision User or account records.'
    )
  }
  for (const [route, contents] of [
    ['/users/create', userCreatePage],
    ['/apps/create', appCreatePage],
  ]) {
    if (!/\brequiresAuth\s*:\s*true\b/.test(contents)) {
      violations.push(
        `${route} must remain a protected onboarding doorway so Auth can preserve the requested destination.`
      )
    }
  }

  return violations
}

function checkRuntimeConfigConsumers(repoRoot) {
  const canonicalReader = path.join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts'
  )
  const roots = ['packages', 'projects'].map((root) =>
    path.join(repoRoot, root)
  )
  const violations = []
  const stack = roots.filter(existsSync)

  while (stack.length) {
    const current = stack.pop()
    if (!current) continue

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        ['node_modules', 'dist', '.nuxt', '.output'].includes(entry.name)
      ) {
        continue
      }

      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(entryPath)
        continue
      }
      if (entryPath === canonicalReader || !/\.(?:ts|vue)$/.test(entry.name)) {
        continue
      }

      const contents = readFileSync(entryPath, 'utf8')
      if (
        contents.includes('consoleConfig') &&
        /\buseRuntimeConfig\s*\(/.test(contents)
      ) {
        violations.push(path.relative(repoRoot, entryPath))
      }
    }
  }

  return violations.sort((a, b) => a.localeCompare(b))
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
  if (
    exportsMap &&
    Object.prototype.hasOwnProperty.call(exportsMap, './runtime')
  ) {
    violations.push(
      "exports['./runtime'] is forbidden (use './runtime/*' subpath exports only)"
    )
  }

  const runtimeIndexPath = path.join(pkgPath, 'src', 'runtime', 'index.ts')
  if (existsSync(runtimeIndexPath)) {
    violations.push('src/runtime/index.ts is forbidden in core packages')
  }

  return violations
}
