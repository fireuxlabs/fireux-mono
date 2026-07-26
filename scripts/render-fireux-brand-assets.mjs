#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-24
// usage_note: check Core FireUX SVG/raster binding by default; pass --write to render masters and update every guarded projection.

import process from 'node:process'
import {
  inspectFireuxBrandAssetProjections,
  syncFireuxBrandAssetProjections,
} from './_lib/fireux-brand-assets.mjs'
import {
  inspectFireuxBrandRasterAssets,
  inspectFireuxBrandTransparentPadding,
  writeFireuxBrandRasterAssets,
} from './_lib/fireux-brand-render.mjs'

const supportedArguments = new Set(['--check', '--write'])
const argumentsList = process.argv.slice(2)
const unknownArguments = argumentsList.filter(
  (argument) => !supportedArguments.has(argument)
)

if (unknownArguments.length) {
  console.error(
    `[fireux-brand] Unsupported argument(s): ${unknownArguments.join(', ')}`
  )
  process.exitCode = 1
} else {
  if (argumentsList.includes('--write')) {
    const rendered = await writeFireuxBrandRasterAssets(process.cwd())
    const projected = syncFireuxBrandAssetProjections(process.cwd())
    console.log(
      `[fireux-brand] Rendered ${rendered.length} canonical assets and updated ${projected.length} projections.`
    )
  }

  const violations = [
    ...inspectFireuxBrandRasterAssets(process.cwd()),
    ...(await inspectFireuxBrandTransparentPadding(process.cwd())),
    ...inspectFireuxBrandAssetProjections(process.cwd()),
  ]

  if (violations.length) {
    console.error(
      [
        '[fireux-brand] FireUX brand family is not current:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Render the masters and update every projection with:',
        '  node scripts/render-fireux-brand-assets.mjs --write',
      ].join('\n')
    )
    process.exitCode = 1
  } else {
    console.log(
      '[fireux-brand] FireUX source, rasters, and projections are current.'
    )
  }
}
