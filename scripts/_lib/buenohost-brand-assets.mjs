// @fireux-script
// last_used: 2026-07-26
// usage_note: declares and verifies the BuenoHost ecosystem brand source and its global-App projections.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const BUENOHOST_BRAND_CANONICAL_DIRECTORY =
  'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/brand'

export const BUENOHOST_BRAND_PROJECTIONS = Object.freeze([
  {
    source: 'app-icon.png',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/avatar.png',
    ],
  },
  {
    source: 'logo.svg',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/logo.svg',
      'projects/buenohost/buenohost-app/public/img/app/logo.svg',
    ],
  },
  {
    source: 'logo.png',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/logo.png',
      'projects/buenohost/buenohost-app/public/img/app/logo.png',
    ],
  },
  {
    source: 'thumbnail.png',
    targets: ['projects/buenohost/buenohost-app/public/img/app/thumbnail.png'],
  },
  {
    source: 'cover.png',
    targets: ['projects/buenohost/buenohost-app/public/img/app/cover.png'],
  },
  {
    source: 'favicon.ico',
    targets: [
      'projects/buenohost/buenohost-app/public/favicon.ico',
      'projects/buenohost/buenohost-app/public/img/app/favicon.ico',
    ],
  },
  {
    source: 'wordmark-light.svg',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/wordmark-light.svg',
      'projects/buenohost/buenohost-app/public/img/app/wordmark.svg',
      'projects/buenohost/buenohost-app/public/img/app/wordmark-light.svg',
    ],
  },
  {
    source: 'wordmark-light.png',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/wordmark-light.png',
      'projects/buenohost/buenohost-app/public/img/app/wordmark.png',
      'projects/buenohost/buenohost-app/public/img/app/wordmark-light.png',
    ],
  },
  {
    source: 'wordmark-dark.svg',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/wordmark-dark.svg',
      'projects/buenohost/buenohost-app/public/img/app/wordmark-dark.svg',
    ],
  },
  {
    source: 'wordmark-dark.png',
    targets: [
      'packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/wordmark-dark.png',
      'projects/buenohost/buenohost-app/public/img/app/wordmark-dark.png',
    ],
  },
  {
    source: 'pwa/icon-192.png',
    targets: [
      'projects/buenohost/buenohost-app/public/img/app/pwa/icon-192.png',
    ],
  },
  {
    source: 'pwa/icon-512.png',
    targets: [
      'projects/buenohost/buenohost-app/public/img/app/pwa/icon-512.png',
    ],
  },
])

const canonicalPath = (repoRoot, relativePath) =>
  path.join(repoRoot, BUENOHOST_BRAND_CANONICAL_DIRECTORY, relativePath)

export function inspectBuenoHostBrandAssetSource(repoRoot) {
  const violations = []
  const requiredSources = [
    'logo.svg',
    'wordmark-light.svg',
    'wordmark-dark.svg',
    'app-icon.svg',
    'cover.svg',
  ]

  for (const source of requiredSources) {
    if (!existsSync(canonicalPath(repoRoot, source))) {
      violations.push(`canonical source is missing: ${source}`)
    }
  }

  const lightPath = canonicalPath(repoRoot, 'wordmark-light.svg')
  const darkPath = canonicalPath(repoRoot, 'wordmark-dark.svg')
  const logoPath = canonicalPath(repoRoot, 'logo.svg')
  const appIconPath = canonicalPath(repoRoot, 'app-icon.svg')

  if (
    !existsSync(lightPath) ||
    !existsSync(darkPath) ||
    !existsSync(logoPath) ||
    !existsSync(appIconPath)
  ) {
    return violations
  }

  const light = readFileSync(lightPath, 'utf8')
  const dark = readFileSync(darkPath, 'utf8')
  const logo = readFileSync(logoPath, 'utf8')
  const appIcon = readFileSync(appIconPath, 'utf8')

  if (!light.includes('data-wordmark-surface="light"')) {
    violations.push(
      'wordmark-light.svg must declare the light-surface semantic'
    )
  }

  if (!dark.includes('data-wordmark-surface="dark"')) {
    violations.push('wordmark-dark.svg must declare the dark-surface semantic')
  }

  if (!light.includes('stroke="#102A38"')) {
    violations.push('wordmark-light.svg must use BuenoHost ink lettering')
  }

  if (!dark.includes('stroke="#F5F0E7"')) {
    violations.push('wordmark-dark.svg must use BuenoHost parchment lettering')
  }

  for (const [source, value, colors] of [
    ['logo.svg', logo, ['#102A38', '#5EA9B8', '#F27A52']],
    ['wordmark-light.svg', light, ['#102A38', '#5EA9B8', '#F27A52']],
    ['wordmark-dark.svg', dark, ['#F5F0E7', '#5EA9B8', '#F27A52']],
    ['app-icon.svg', appIcon, ['#102A38', '#F5F0E7', '#5EA9B8', '#F27A52']],
  ]) {
    for (const color of colors) {
      if (!value.includes(color)) {
        violations.push(`${source} must retain BuenoHost brand colour ${color}`)
      }
    }
    if (value.includes('<text')) {
      violations.push(
        `${source} must use deterministic vector geometry, not client-font text`
      )
    }
  }

  if (light === dark) {
    violations.push('light and dark wordmarks must remain distinct files')
  }

  return violations
}

export function inspectBuenoHostBrandAssetProjections(repoRoot) {
  const violations = inspectBuenoHostBrandAssetSource(repoRoot)

  for (const projection of BUENOHOST_BRAND_PROJECTIONS) {
    const sourcePath = canonicalPath(repoRoot, projection.source)

    if (!existsSync(sourcePath)) {
      violations.push(`canonical source is missing: ${projection.source}`)
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

export function syncBuenoHostBrandAssetProjections(repoRoot) {
  const written = []

  for (const projection of BUENOHOST_BRAND_PROJECTIONS) {
    const sourcePath = canonicalPath(repoRoot, projection.source)

    if (!existsSync(sourcePath)) {
      throw new Error(
        `Cannot project missing canonical BuenoHost brand asset: ${path.relative(repoRoot, sourcePath)}`
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
