// @fireux-script
// last_used: 2026-07-26
// usage_note: run through pnpm guard; protects the ecosystem-owned BuenoHost brand family from raster and projection drift.

import process from 'node:process'
import { inspectBuenoHostBrandAssetProjections } from '../_lib/buenohost-brand-assets.mjs'
import {
  inspectBuenoHostBrandRasterAssets,
  inspectBuenoHostBrandSurfacePixels,
} from '../_lib/buenohost-brand-render.mjs'

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = [
    ...inspectBuenoHostBrandRasterAssets(repoRoot),
    ...(await inspectBuenoHostBrandSurfacePixels(repoRoot)),
    ...inspectBuenoHostBrandAssetProjections(repoRoot),
  ]

  if (violations.length) {
    throw new Error(
      [
        'BuenoHost brand assets have drifted from the ecosystem source:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Render the canonical family and update every projection with:',
        '  node scripts/render-buenohost-brand-assets.mjs --write',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ BuenoHost brand source, rasters, and projections valid'
  )
}
