import type { BrandAssetCheck } from '../../contracts/environment-check'
import type { AppPublicAssetRequirement } from '../../media/types'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import imageSize from 'image-size'
import sharp from 'sharp'
import { APP_PUBLIC_ASSET_REQUIREMENTS } from '../../media/requirements'
import { validateAppAssetDimensions } from '../../media/utils'

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

async function validateIcon(data: Buffer, requiredSizes: readonly number[]) {
  if (
    data.length < 6 ||
    data.readUInt16LE(0) !== 0 ||
    data.readUInt16LE(2) !== 1
  )
    throw new Error('Favicon must be an ICO file.')

  const count = data.readUInt16LE(4)
  const directoryEnd = 6 + count * 16
  if (!count || directoryEnd > data.length)
    throw new Error('ICO directory is incomplete.')

  const sizes = new Set<number>()
  const ranges: Array<{ start: number; end: number }> = []
  for (let index = 0; index < count; index++) {
    const entry = 6 + index * 16
    const width = data[entry] || 256
    const height = data[entry + 1] || 256
    const length = data.readUInt32LE(entry + 8)
    const start = data.readUInt32LE(entry + 12)
    const end = start + length
    if (!length || start < directoryEnd || end > data.length)
      throw new Error('ICO image points outside the file.')
    if (ranges.some((range) => start < range.end && end > range.start))
      throw new Error('ICO image entries overlap.')
    ranges.push({ start, end })

    const image = data.subarray(start, end)
    if (!image.subarray(0, 8).equals(PNG_SIGNATURE))
      throw new Error('ICO images must use PNG encoding.')
    const dimensions = imageSize(image)
    if (
      width !== height ||
      dimensions.width !== width ||
      dimensions.height !== height
    )
      throw new Error('ICO directory dimensions do not match its image.')
    await sharp(image).stats()
    sizes.add(width)
  }
  const missing = requiredSizes.filter((size) => !sizes.has(size))
  if (missing.length)
    throw new Error(`ICO is missing required sizes: ${missing.join(', ')}.`)
}

async function checkBrandImage(
  publicDir: string,
  asset: AppPublicAssetRequirement
): Promise<BrandAssetCheck> {
  const result: BrandAssetCheck = {
    name: asset.localRelativePath
      .replace(/^img\/app\//, '')
      .replace(/\.(?:ico|png)$/i, '')
      .replaceAll('/', '-'),
    path: asset.localRelativePath,
    ok: false,
  }
  const path = join(publicDir, asset.localRelativePath)
  try {
    const info = await stat(path)
    if (!info.isFile() || !info.size)
      throw new Error('Asset must be a non-empty file.')
    const data = await readFile(path)
    const dimensions = imageSize(data)
    result.source = `public/${asset.localRelativePath}`
    result.width = dimensions.width
    result.height = dimensions.height
    const issue = validateAppAssetDimensions(
      asset.label,
      dimensions,
      asset.dimensions
    )
    if (issue) throw new Error(issue)

    if (asset.requiredIconSizes)
      await validateIcon(data, asset.requiredIconSizes)
    else await sharp(data).stats()
    result.ok = true
  } catch (error) {
    result.reason =
      (error as NodeJS.ErrnoException).code === 'ENOENT'
        ? `Missing file: /public/${asset.localRelativePath}`
        : error instanceof Error
          ? error.message
          : 'Unable to decode image.'
  }
  return result
}

/** Inspect only this App's public files; never substitute shared branding. */
export async function inspectAppBrandAssets(
  publicDir: string
): Promise<BrandAssetCheck[]> {
  const checks = await Promise.all(
    APP_PUBLIC_ASSET_REQUIREMENTS.map((asset) =>
      checkBrandImage(publicDir, asset)
    )
  )
  const light = checks.find((check) =>
    check.path.endsWith('/wordmark-light.png')
  )
  const dark = checks.find((check) => check.path.endsWith('/wordmark-dark.png'))
  if (
    light?.ok &&
    dark?.ok &&
    (light.width !== dark.width || light.height !== dark.height)
  ) {
    dark.ok = false
    dark.reason =
      'Light and dark wordmarks must use the same canvas dimensions.'
  }
  return checks
}

export async function assertAppBrandAssets(publicDir: string) {
  const checks = await inspectAppBrandAssets(publicDir)
  const failures = checks.filter((check) => !check.ok)
  if (failures.length)
    throw new Error(
      `App assets failed in ${publicDir}:\n${failures.map((check) => `- ${check.path}: ${check.reason}`).join('\n')}`
    )
  return checks
}
