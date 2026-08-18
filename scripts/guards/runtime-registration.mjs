// @fireux-script
// last_used: 2026-07-21
// usage_note: checks runtime discovery and rejects empty module configuration hooks.
// Concurrent edit — 2026-07-21 12:40 CEST — Cleanbox-to-Werkbox migration: verify replacement runtime registration.
// FILE: scripts/guards/runtime-registration.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const AUTO_SURFACES = ['components', 'composables']
const PACKAGE_FAMILIES = ['core', 'ecosystem', 'extensions']

function childDirectories(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

function hasFiles(dir) {
  if (!existsSync(dir)) return false
  const pending = [dir]

  while (pending.length) {
    const current = pending.pop()
    if (!current) continue

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isFile()) return true
      if (entry.isDirectory()) pending.push(path.join(current, entry.name))
    }
  }

  return false
}

function hasRegistration(moduleSource, surface) {
  if (new RegExp(`\\b${surface}\\s*:`).test(moduleSource)) return true

  // A package deliberately mounted as a Nuxt runtime layer delegates standard
  // components/composables discovery to that layer instead of individual hooks.
  return /\bensureRuntimeLayer(?:FromPath)?\s*\(/.test(moduleSource)
}

function emptyConfigurationHooks(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  const hooks = []
  const patterns = [
    /export\s+(?:async\s+)?function\s+(configure[A-Za-z0-9_]*)\s*\([^)]*\)\s*(?::\s*[^\{]+)?\{\s*\}/g,
    /export\s+const\s+(configure[A-Za-z0-9_]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?=>\s*\{\s*\}/g,
  ]

  for (const pattern of patterns) {
    for (const match of withoutComments.matchAll(pattern)) {
      if (match[1]) hooks.push(match[1])
    }
  }

  return hooks
}

function findEmptyConfigurationHooks(repoRoot) {
  const violations = []
  const packagesRoot = path.join(repoRoot, 'packages')

  for (const family of PACKAGE_FAMILIES) {
    const familyRoot = path.join(packagesRoot, family)
    for (const packageName of childDirectories(familyRoot)) {
      const configRoot = path.join(
        familyRoot,
        packageName,
        'src',
        'config',
        'module'
      )
      if (!existsSync(configRoot)) continue

      for (const entry of readdirSync(configRoot, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.ts')) continue
        const configPath = path.join(configRoot, entry.name)
        const source = readFileSync(configPath, 'utf8')
        for (const hook of emptyConfigurationHooks(source)) {
          violations.push({
            hook,
            configPath: path.relative(repoRoot, configPath),
          })
        }
      }
    }
  }

  return violations
}

function readRegistrationSource(packageRoot) {
  const files = [path.join(packageRoot, 'src', 'module.ts')]
  const configRoot = path.join(packageRoot, 'src', 'config', 'module')

  if (existsSync(configRoot)) {
    for (const entry of readdirSync(configRoot, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(path.join(configRoot, entry.name))
      }
    }
  }

  return files
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const emptyHooks = findEmptyConfigurationHooks(repoRoot)

  if (emptyHooks.length) {
    throw new Error(
      [
        '[guard] ❌ Empty module configuration hooks are not allowed:',
        ...emptyHooks.map(
          ({ hook, configPath }) => `  - ${configPath}: ${hook}`
        ),
        '',
        '[guard] Fix:',
        '- Remove the empty hook, its module import, and its configureFireuxModule step.',
        '- Add a hook only when it performs real Nuxt runtime registration.',
        '- Keep models, types, info helpers, and utilities as explicit imports.',
      ].join('\n')
    )
  }

  for (const family of PACKAGE_FAMILIES) {
    const familyRoot = path.join(repoRoot, 'packages', family)
    for (const packageName of childDirectories(familyRoot)) {
      const packageRoot = path.join(familyRoot, packageName)
      const modulePath = path.join(packageRoot, 'src', 'module.ts')
      const runtimeRoot = path.join(packageRoot, 'src', 'runtime')
      if (!existsSync(modulePath) || !existsSync(runtimeRoot)) continue

      const moduleSource = readFileSync(modulePath, 'utf8')
      const registrationSource = readRegistrationSource(packageRoot)
      if (family === 'extensions') {
        for (const surface of AUTO_SURFACES) {
          const surfaceDir = path.join(runtimeRoot, surface)
          if (hasFiles(surfaceDir) && !hasRegistration(moduleSource, surface)) {
            violations.push({
              packageName,
              surface,
              surfaceDir: path.relative(repoRoot, surfaceDir),
              modulePath: path.relative(repoRoot, modulePath),
            })
          }
        }
      }

      for (const owner of childDirectories(runtimeRoot)) {
        for (const surface of AUTO_SURFACES) {
          const surfaceDir = path.join(runtimeRoot, owner, surface)
          if (!hasFiles(surfaceDir)) continue

          const registrationPath = `./runtime/${owner}/${surface}`
          if (registrationSource.includes(registrationPath)) continue

          violations.push({
            packageName,
            surface,
            surfaceDir: path.relative(repoRoot, surfaceDir),
            modulePath: path.relative(repoRoot, modulePath),
            registrationPath,
          })
        }
      }
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Extension runtime surfaces are not registered:',
        ...violations.flatMap((violation) => [
          `  - ${violation.surfaceDir}`,
          `      module: ${violation.modulePath}`,
          violation.registrationPath
            ? `      missing registration: ${violation.registrationPath}`
            : `      missing hook: ${violation.surface}`,
        ]),
        '',
        '[guard] Fix:',
        '- Register the surface through configureFireuxModule and its config/module helper.',
        '- Or mount the package runtime as an intentional Nuxt layer.',
        '- Delete the surface if it is dead; do not leave runtime code undiscoverable.',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ runtime surfaces are registered and module hooks are meaningful'
  )
}
