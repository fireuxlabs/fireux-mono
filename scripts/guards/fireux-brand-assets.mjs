// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; protects the Core-owned FireUX brand family from projection drift.

import process from 'node:process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { inspectFireuxBrandAssetProjections } from '../_lib/fireux-brand-assets.mjs'
import {
  inspectFireuxBrandRasterAssets,
  inspectFireuxBrandTransparentPadding,
} from '../_lib/fireux-brand-render.mjs'

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = [
    ...inspectFireuxBrandRasterAssets(repoRoot),
    ...(await inspectFireuxBrandTransparentPadding(repoRoot)),
    ...inspectFireuxBrandAssetProjections(repoRoot),
  ]
  const assetsPage = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/pages/assets.vue'
    ),
    'utf8'
  )

  for (const token of [
    "surface: 'light'",
    "surface: 'dark'",
    'asset-frame--surface-${asset.surface}',
    '.asset-frame--surface-light',
    '.asset-frame--surface-dark',
  ]) {
    if (!assetsPage.includes(token)) {
      violations.push(
        `shared assets page must preserve light/dark preview semantics: ${token}`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      [
        'FireUX brand assets have drifted from Core:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Render the canonical family and update every projection with:',
        '  node scripts/render-fireux-brand-assets.mjs --write',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ FireUX brand source, rasters, and projections valid')
}
