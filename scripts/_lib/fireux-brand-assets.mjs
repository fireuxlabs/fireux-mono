// @fireux-script
// last_used: 2026-07-24
// usage_note: declares and verifies deterministic projections of the Core-owned FireUX brand asset family.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const FIREUX_BRAND_CANONICAL_DIRECTORY =
  'packages/core/fireux-core/src/runtime/public/img/core/brand'

export const FIREUX_BRAND_PROJECTIONS = Object.freeze([
  {
    source: 'app-icon.png',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/avatar.png',
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/logo.png',
    ],
  },
  {
    source: 'logo.svg',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/logo.svg',
      'projects/fireux/fireux-app/public/img/app/logo.svg',
      'projects/fireux/tenant/public/img/app/logo.svg',
      'projects/fireux/holzworm/public/img/app/logo.svg',
      'projects/templates/fireux-template/public/img/app/logo.svg',
    ],
  },
  {
    source: 'logo.png',
    targets: [
      'projects/fireux/fireux-app/public/img/app/logo.png',
      'projects/fireux/tenant/public/img/app/logo.png',
      'projects/fireux/holzworm/public/img/app/logo.png',
      'projects/templates/fireux-template/public/img/app/logo.png',
    ],
  },
  {
    source: 'thumbnail.png',
    targets: [
      'projects/fireux/fireux-app/public/img/app/thumbnail.png',
      'projects/fireux/tenant/public/img/app/thumbnail.png',
      'projects/fireux/holzworm/public/img/app/thumbnail.png',
      'projects/templates/fireux-template/public/img/app/thumbnail.png',
    ],
  },
  {
    source: 'cover.png',
    targets: [
      'projects/fireux/fireux-app/public/img/app/cover.png',
      'projects/fireux/tenant/public/img/app/cover.png',
      'projects/fireux/holzworm/public/img/app/cover.png',
      'projects/templates/fireux-template/public/img/app/cover.png',
    ],
  },
  {
    source: 'favicon.ico',
    targets: [
      'projects/fireux/fireux-app/public/favicon.ico',
      'projects/fireux/fireux-app/public/img/app/favicon.ico',
      'projects/fireux/tenant/public/img/app/favicon.ico',
      'projects/fireux/holzworm/public/img/app/favicon.ico',
      'projects/templates/fireux-template/public/img/app/favicon.ico',
    ],
  },
  {
    source: 'wordmark-light.svg',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/wordmark-light.svg',
      'projects/fireux/fireux-app/public/img/app/wordmark.svg',
      'projects/fireux/fireux-app/public/img/app/wordmark-light.svg',
      'projects/fireux/tenant/public/img/app/wordmark.svg',
      'projects/fireux/tenant/public/img/app/wordmark-light.svg',
      'projects/fireux/holzworm/public/img/app/wordmark.svg',
      'projects/fireux/holzworm/public/img/app/wordmark-light.svg',
      'projects/templates/fireux-template/public/img/app/wordmark.svg',
      'projects/templates/fireux-template/public/img/app/wordmark-light.svg',
    ],
  },
  {
    source: 'wordmark-light.png',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/wordmark-light.png',
      'projects/fireux/fireux-app/public/img/app/wordmark.png',
      'projects/fireux/fireux-app/public/img/app/wordmark-light.png',
      'projects/fireux/tenant/public/img/app/wordmark.png',
      'projects/fireux/tenant/public/img/app/wordmark-light.png',
      'projects/fireux/holzworm/public/img/app/wordmark.png',
      'projects/fireux/holzworm/public/img/app/wordmark-light.png',
      'projects/templates/fireux-template/public/img/app/wordmark.png',
      'projects/templates/fireux-template/public/img/app/wordmark-light.png',
    ],
  },
  {
    source: 'wordmark-dark.svg',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/wordmark-dark.svg',
      'projects/fireux/fireux-app/public/img/app/wordmark-dark.svg',
      'projects/fireux/tenant/public/img/app/wordmark-dark.svg',
      'projects/fireux/holzworm/public/img/app/wordmark-dark.svg',
      'projects/templates/fireux-template/public/img/app/wordmark-dark.svg',
    ],
  },
  {
    source: 'wordmark-dark.png',
    targets: [
      'packages/ecosystem/fireux-fireux/src/runtime/public/img/ecosystem/wordmark-dark.png',
      'projects/fireux/fireux-app/public/img/app/wordmark-dark.png',
      'projects/fireux/tenant/public/img/app/wordmark-dark.png',
      'projects/fireux/holzworm/public/img/app/wordmark-dark.png',
      'projects/templates/fireux-template/public/img/app/wordmark-dark.png',
    ],
  },
  {
    source: 'pwa/icon-192.png',
    targets: [
      'projects/fireux/fireux-app/public/img/app/pwa/icon-192.png',
      'projects/fireux/tenant/public/img/app/pwa/icon-192.png',
      'projects/fireux/holzworm/public/img/app/pwa/icon-192.png',
      'projects/templates/fireux-template/public/img/app/pwa/icon-192.png',
    ],
  },
  {
    source: 'pwa/icon-512.png',
    targets: [
      'projects/fireux/fireux-app/public/img/app/pwa/icon-512.png',
      'projects/fireux/tenant/public/img/app/pwa/icon-512.png',
      'projects/fireux/holzworm/public/img/app/pwa/icon-512.png',
      'projects/templates/fireux-template/public/img/app/pwa/icon-512.png',
    ],
  },
])

const canonicalPath = (repoRoot, relativePath) =>
  path.join(repoRoot, FIREUX_BRAND_CANONICAL_DIRECTORY, relativePath)

export function inspectFireuxBrandAssetSource(repoRoot) {
  const violations = []
  const lightPath = canonicalPath(repoRoot, 'wordmark-light.svg')
  const darkPath = canonicalPath(repoRoot, 'wordmark-dark.svg')

  if (!existsSync(lightPath)) {
    violations.push(
      `canonical source is missing: ${path.relative(repoRoot, lightPath)}`
    )
  }

  if (!existsSync(darkPath)) {
    violations.push(
      `canonical source is missing: ${path.relative(repoRoot, darkPath)}`
    )
  }

  if (!existsSync(lightPath) || !existsSync(darkPath)) {
    return violations
  }

  const light = readFileSync(lightPath, 'utf8')
  const dark = readFileSync(darkPath, 'utf8')

  if (light === dark) {
    violations.push('canonical light and dark wordmarks must be distinct files')
  }

  if (!light.includes('data-wordmark-surface="light"')) {
    violations.push(
      'wordmark-light.svg must declare the light-surface semantic'
    )
  }

  if (!dark.includes('data-wordmark-surface="dark"')) {
    violations.push('wordmark-dark.svg must declare the dark-surface semantic')
  }

  if (!light.includes('<g fill="#0B111C">')) {
    violations.push('wordmark-light.svg must use the ink Fire outline')
  }

  if (!dark.includes('<g fill="#F9FAFB">')) {
    violations.push('wordmark-dark.svg must use the light Fire outline')
  }

  if (light.includes('<text') || dark.includes('<text')) {
    violations.push(
      'canonical wordmark lettering must be outlined rather than client-font text'
    )
  }

  return violations
}

export function inspectFireuxBrandAssetProjections(repoRoot) {
  const violations = inspectFireuxBrandAssetSource(repoRoot)

  for (const projection of FIREUX_BRAND_PROJECTIONS) {
    const sourcePath = canonicalPath(repoRoot, projection.source)

    if (!existsSync(sourcePath)) {
      violations.push(
        `canonical source is missing: ${path.relative(repoRoot, sourcePath)}`
      )
      continue
    }

    const source = readFileSync(sourcePath)

    for (const target of projection.targets) {
      const targetPath = path.join(repoRoot, target)

      if (!existsSync(targetPath)) {
        violations.push(
          `projection is missing: ${target} <- ${projection.source}`
        )
        continue
      }

      if (!source.equals(readFileSync(targetPath))) {
        violations.push(
          `projection has drifted: ${target} <- ${projection.source}`
        )
      }
    }
  }

  return [...new Set(violations)]
}

export function syncFireuxBrandAssetProjections(repoRoot) {
  const written = []

  for (const projection of FIREUX_BRAND_PROJECTIONS) {
    const sourcePath = canonicalPath(repoRoot, projection.source)

    if (!existsSync(sourcePath)) {
      throw new Error(
        `Cannot project missing canonical FireUX brand asset: ${path.relative(repoRoot, sourcePath)}`
      )
    }

    for (const target of projection.targets) {
      const targetPath = path.join(repoRoot, target)
      mkdirSync(path.dirname(targetPath), { recursive: true })
      copyFileSync(sourcePath, targetPath)
      written.push(target)
    }
  }

  return written
}
