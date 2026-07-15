// @fireux-script
// last_used: 2026-07-15
// usage_note: checks extension auto-discovery surfaces against module wiring.
// FILE: scripts/guards/runtime-registration.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const AUTO_SURFACES = ['components', 'composables']

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

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const extensionsRoot = path.join(repoRoot, 'packages', 'extensions')
  const violations = []

  for (const packageName of childDirectories(extensionsRoot)) {
    const packageRoot = path.join(extensionsRoot, packageName)
    const modulePath = path.join(packageRoot, 'src', 'module.ts')
    if (!existsSync(modulePath)) continue

    const moduleSource = readFileSync(modulePath, 'utf8')
    for (const surface of AUTO_SURFACES) {
      const surfaceDir = path.join(packageRoot, 'src', 'runtime', surface)
      if (!hasFiles(surfaceDir) || hasRegistration(moduleSource, surface)) continue

      violations.push({
        packageName,
        surface,
        surfaceDir: path.relative(repoRoot, surfaceDir),
        modulePath: path.relative(repoRoot, modulePath),
      })
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Extension runtime surfaces are not registered:',
        ...violations.flatMap((violation) => [
          `  - ${violation.surfaceDir}`,
          `      module: ${violation.modulePath}`,
          `      missing hook: ${violation.surface}`,
        ]),
        '',
        '[guard] Fix:',
        '- Register the surface through configureFireuxModule and its config/module helper.',
        '- Or mount the package runtime as an intentional Nuxt layer.',
        '- Delete the surface if it is dead; do not leave runtime code undiscoverable.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ extension component/composable surfaces are registered')
}
