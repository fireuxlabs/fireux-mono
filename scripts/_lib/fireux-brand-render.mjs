// @fireux-script
// last_used: 2026-07-24
// usage_note: renders and verifies Core-owned FireUX raster assets from their SVG masters.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { FIREUX_BRAND_CANONICAL_DIRECTORY } from './fireux-brand-assets.mjs'

export const FIREUX_BRAND_RENDER_MANIFEST = path.posix.join(
  FIREUX_BRAND_CANONICAL_DIRECTORY,
  'render-manifest.json'
)

export const FIREUX_BRAND_RENDER_SPECS = Object.freeze([
  {
    source: 'logo.svg',
    output: 'logo.png',
    width: 512,
    height: 512,
    format: 'png',
    fit: 'contain',
  },
  {
    source: 'wordmark-light.svg',
    output: 'wordmark-light.png',
    width: 768,
    height: 192,
    format: 'png',
    fit: 'contain',
  },
  {
    source: 'wordmark-dark.svg',
    output: 'wordmark-dark.png',
    width: 768,
    height: 192,
    format: 'png',
    fit: 'contain',
  },
  {
    source: 'app-icon.svg',
    output: 'app-icon.png',
    width: 512,
    height: 512,
    format: 'png',
  },
  {
    source: 'cover.svg',
    output: 'cover.png',
    width: 1280,
    height: 720,
    format: 'png',
  },
  {
    source: 'cover.svg',
    output: 'thumbnail.png',
    width: 1200,
    height: 630,
    format: 'png',
    fit: 'cover',
  },
  {
    source: 'app-icon.svg',
    output: 'pwa/icon-192.png',
    width: 192,
    height: 192,
    format: 'png',
  },
  {
    source: 'app-icon.svg',
    output: 'pwa/icon-512.png',
    width: 512,
    height: 512,
    format: 'png',
  },
  {
    source: 'app-icon.svg',
    output: 'favicon.ico',
    width: 64,
    height: 64,
    format: 'ico',
  },
])

const canonicalPath = (repoRoot, relativePath) =>
  path.join(repoRoot, FIREUX_BRAND_CANONICAL_DIRECTORY, relativePath)

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

function wrapPngAsIco(png, width, height) {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header.writeUInt8(width === 256 ? 0 : width, 6)
  header.writeUInt8(height === 256 ? 0 : height, 7)
  header.writeUInt8(0, 8)
  header.writeUInt8(0, 9)
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  return Buffer.concat([header, png])
}

function imageDimensions(buffer, format) {
  if (format === 'ico') {
    return {
      width: buffer.readUInt8(6) || 256,
      height: buffer.readUInt8(7) || 256,
    }
  }

  const pngSignature = '89504e470d0a1a0a'
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString('hex') !== pngSignature ||
    buffer.subarray(12, 16).toString('ascii') !== 'IHDR'
  ) {
    return null
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

async function renderSpec(repoRoot, spec) {
  const source = readFileSync(canonicalPath(repoRoot, spec.source))
  const png = await sharp(source)
    .resize(spec.width, spec.height, {
      fit: spec.fit ?? 'fill',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({
      adaptiveFiltering: true,
      compressionLevel: 9,
    })
    .toBuffer()

  return {
    source,
    output:
      spec.format === 'ico' ? wrapPngAsIco(png, spec.width, spec.height) : png,
    spec,
  }
}

export async function writeFireuxBrandRasterAssets(repoRoot) {
  const rendered = []

  for (const spec of FIREUX_BRAND_RENDER_SPECS) {
    const asset = await renderSpec(repoRoot, spec)
    const outputPath = canonicalPath(repoRoot, spec.output)
    mkdirSync(path.dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, asset.output)
    rendered.push(asset)
  }

  const manifest = {
    version: 1,
    assets: rendered.map(({ source, output, spec }) => ({
      source: spec.source,
      output: spec.output,
      width: spec.width,
      height: spec.height,
      format: spec.format,
      fit: spec.fit ?? 'fill',
      sourceSha256: sha256(source),
      outputSha256: sha256(output),
    })),
  }
  const manifestPath = path.join(repoRoot, FIREUX_BRAND_RENDER_MANIFEST)
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  return manifest.assets
}

export function inspectFireuxBrandRasterAssets(repoRoot) {
  const violations = []
  const manifestPath = path.join(repoRoot, FIREUX_BRAND_RENDER_MANIFEST)

  if (!existsSync(manifestPath)) {
    return [`render manifest is missing: ${FIREUX_BRAND_RENDER_MANIFEST}`]
  }

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    return [`render manifest is invalid JSON: ${FIREUX_BRAND_RENDER_MANIFEST}`]
  }

  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) {
    violations.push('render manifest must retain version 1 and an assets array')
  }

  const entries = new Map(
    Array.isArray(manifest.assets)
      ? manifest.assets.map((asset) => [asset.output, asset])
      : []
  )
  const expectedOutputs = new Set(
    FIREUX_BRAND_RENDER_SPECS.map((spec) => spec.output)
  )

  for (const output of entries.keys()) {
    if (!expectedOutputs.has(output)) {
      violations.push(`render manifest has an unknown output: ${output}`)
    }
  }

  for (const spec of FIREUX_BRAND_RENDER_SPECS) {
    const sourcePath = canonicalPath(repoRoot, spec.source)
    const outputPath = canonicalPath(repoRoot, spec.output)
    const entry = entries.get(spec.output)

    if (!entry) {
      violations.push(`render manifest is missing output: ${spec.output}`)
      continue
    }

    for (const [key, expected] of [
      ['source', spec.source],
      ['width', spec.width],
      ['height', spec.height],
      ['format', spec.format],
      ['fit', spec.fit ?? 'fill'],
    ]) {
      if (entry[key] !== expected) {
        violations.push(
          `render manifest ${spec.output} has ${key}=${String(entry[key])}; expected ${String(expected)}`
        )
      }
    }

    if (!existsSync(sourcePath)) {
      violations.push(`render source is missing: ${spec.source}`)
      continue
    }

    if (!existsSync(outputPath)) {
      violations.push(`render output is missing: ${spec.output}`)
      continue
    }

    const source = readFileSync(sourcePath)
    const output = readFileSync(outputPath)

    if (entry.sourceSha256 !== sha256(source)) {
      violations.push(`render source changed without refresh: ${spec.source}`)
    }

    if (entry.outputSha256 !== sha256(output)) {
      violations.push(`render output changed without refresh: ${spec.output}`)
    }

    const dimensions = imageDimensions(output, spec.format)
    if (
      !dimensions ||
      dimensions.width !== spec.width ||
      dimensions.height !== spec.height
    ) {
      violations.push(
        `render output ${spec.output} must be ${spec.width}x${spec.height}`
      )
    }
  }

  return [...new Set(violations)]
}

export async function inspectFireuxBrandTransparentPadding(repoRoot) {
  const violations = []

  for (const output of [
    'logo.png',
    'wordmark-light.png',
    'wordmark-dark.png',
  ]) {
    const outputPath = canonicalPath(repoRoot, output)

    if (!existsSync(outputPath)) continue

    const { data, info } = await sharp(outputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const corners = [
      [0, 0],
      [info.width - 1, 0],
      [0, info.height - 1],
      [info.width - 1, info.height - 1],
    ]

    if (
      corners.some(([x, y]) => {
        const alphaIndex = (y * info.width + x) * info.channels + 3
        return data[alphaIndex] !== 0
      })
    ) {
      violations.push(
        `render output ${output} must retain transparent corner padding`
      )
    }
  }

  return violations
}
