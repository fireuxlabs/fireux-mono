#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-26
// usage_note: check BuenoHost SVG/raster binding by default; pass --write to render masters and update guarded projections.

import process from 'node:process'
import {
  inspectBuenoHostBrandAssetProjections,
  syncBuenoHostBrandAssetProjections,
} from './_lib/buenohost-brand-assets.mjs'
import {
  inspectBuenoHostBrandRasterAssets,
  inspectBuenoHostBrandSurfacePixels,
  writeBuenoHostBrandRasterAssets,
} from './_lib/buenohost-brand-render.mjs'

const supportedArguments = new Set(['--check', '--write'])
const argumentsList = process.argv.slice(2)
const unknownArguments = argumentsList.filter(
  (argument) => !supportedArguments.has(argument)
)

if (unknownArguments.length) {
  console.error(
    `[buenohost-brand] Unsupported argument(s): ${unknownArguments.join(', ')}`
  )
  process.exitCode = 1
} else {
  if (argumentsList.includes('--write')) {
    const rendered = await writeBuenoHostBrandRasterAssets(process.cwd())
    const projected = syncBuenoHostBrandAssetProjections(process.cwd())
    console.log(
      `[buenohost-brand] Rendered ${rendered.length} canonical assets and updated ${projected.length} projections.`
    )
  }

  const violations = [
    ...inspectBuenoHostBrandRasterAssets(process.cwd()),
    ...(await inspectBuenoHostBrandSurfacePixels(process.cwd())),
    ...inspectBuenoHostBrandAssetProjections(process.cwd()),
  ]

  if (violations.length) {
    console.error(
      [
        '[buenohost-brand] BuenoHost brand family is not current:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Render the masters and update every projection with:',
        '  node scripts/render-buenohost-brand-assets.mjs --write',
      ].join('\n')
    )
    process.exitCode = 1
  } else {
    console.log(
      '[buenohost-brand] BuenoHost source, rasters, and projections are current.'
    )
  }
}
