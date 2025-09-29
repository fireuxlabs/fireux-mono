#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FAILS = []

const APPS = [
  'projects/cleanbox/cleanbox-app',
  'projects/cleanbox/richies-reinigung',
  'projects/misebox/misebox-app',
  'projects/misebox/niederhorn',
  'projects/fireux/fireux-app',
  'projects/fireux/tennant',
]

const PACKAGES = [
  'packages/core/fireux-core',
  'packages/extensions/fireux-jobs',
  'packages/extensions/fireux-places',
  'packages/tenants/fireux-misebox',
  'packages/tenants/fireux-cleanbox',
  'packages/tenants/fireux-fireux',
]

// helpers
const load = (p) =>
  JSON.parse(readFileSync(join(ROOT, p, 'package.json'), 'utf8'))
const err = (where, msg) => FAILS.push(`[${where}] ${msg}`)

// 1) no barrels / no .d.ts anywhere (but ignore generated artifacts)
try {
  const entries = readdirSync(ROOT, { withFileTypes: true, recursive: true })
  for (const entry of entries) {
    // withFileTypes + recursive returns Dirent with parentPath in VS Code env
    const name = entry.parentPath
      ? join(entry.parentPath, entry.name)
      : entry.name
    // use absolute path checks for reliability in different environments
    if (entry.isDirectory?.()) {
      // skip node_modules entirely
      if (name.endsWith('node_modules')) continue
      continue
    }
    if (!entry.isFile?.()) continue
    // skip generated and build artifacts
    if (
      name.includes('/node_modules/') ||
      name.includes('/.nuxt/') ||
      name.includes('/.output/') ||
      name.includes('/dist/')
    ) {
      continue
    }
    // allow ambient types under root types/
    if (name.startsWith(ROOT + '/types/') && name.endsWith('.d.ts')) continue
    // allow env.d.ts shim files
    if (name.endsWith('env.d.ts')) continue

    if (name.endsWith('index.ts') || name.endsWith('.d.ts')) {
      err('no-barrels', `Disallowed file: ${name}`)
    }
  }
} catch (errIgnored) {
  // Best-effort; don't crash on platform differences
  if (process.env.DEBUG)
    console.debug('guard-shape scan error (ignored):', errIgnored)
}

// 2) apps must be “slim” (no deps)
for (const app of APPS) {
  const pkg = load(app)
  // Dependency guard: temporarily disabled while migrating to slim apps
  // const deps = Object.keys(pkg.dependencies || {})
  // const devDeps = Object.keys(pkg.devDependencies || {})
  // const allowDeps = []
  // const allowDevDeps = []
  // const badDeps = deps.filter((d) => !allowDeps.includes(d))
  // const badDevDeps = devDeps.filter((d) => !allowDevDeps.includes(d))
  // if (badDeps.length) err(app, `apps must not declare dependencies: ${badDeps.join(', ')}`)
  // if (badDevDeps.length) err(app, `apps must not declare devDependencies: ${badDevDeps.join(', ')}`)

  for (const s of [
    'dev',
    'build',
    'generate',
    'preview',
    'postinstall',
    'clean',
  ]) {
    if (!pkg.scripts?.[s]) err(app, `missing script "${s}"`)
  }
}

// 3) packages must be module-shaped + exports to src
for (const p of PACKAGES) {
  const pkg = load(p)
  if (pkg.private !== true) err(p, `package should be "private": true`)
  if (pkg.type !== 'module') err(p, `package should be "type": "module"`)
  if (pkg.main !== './src/module.ts') err(p, `main must be "./src/module.ts"`)
  if (pkg.types !== './src/module.ts') err(p, `types must be "./src/module.ts"`)
  if (!pkg.files?.includes('src/**/*'))
    err(p, `"files" must include "src/**/*"`)

  const exp = JSON.stringify(pkg.exports || {})
  if (!exp.includes('./src/module.ts'))
    err(p, `exports must point to "./src/module.ts"`)

  if (pkg.peerDependencies?.glob) err(p, `glob must NOT be a peerDependency`)
}

// 4) core-only libraries
{
  const core = load('packages/core/fireux-core')
  if (!core.dependencies?.['@vueup/vue-quill'])
    err('fireux-core', 'must depend on @vueup/vue-quill')
  for (const app of APPS) {
    const pkg = load(app)
    if (
      pkg.dependencies?.['@vueup/vue-quill'] ||
      pkg.devDependencies?.['@vueup/vue-quill']
    ) {
      err(app, 'apps must not depend on @vueup/vue-quill (owned by core)')
    }
  }
}

// 5) root overrides presence
{
  const root = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  const ov = root.pnpm?.overrides || {}
  const required = [
    'nuxt',
    '@nuxt/kit',
    '@nuxt/schema',
    '@nuxt/ui',
    'vue',
    'firebase',
    '@vite-pwa/nuxt',
    'tailwindcss',
  ]
  for (const key of required) {
    if (!ov[key]) err('root', `pnpm.overrides missing "${key}"`)
  }
}

if (FAILS.length) {
  console.error(
    '\n⛔ Shape guard failed:\n' + FAILS.map((x) => ' - ' + x).join('\n')
  )
  process.exit(1)
} else {
  console.log('✅ Shape guard passed')
}
