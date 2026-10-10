import type { BrandAssetCheck } from '../../models/app-environment-check'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import imageSize from 'image-size'
import { APP_PUBLIC_ASSET_REQUIREMENTS } from '../../models/app-media-requirements'
import { validateAppAssetDimensions } from '../../utils/app-media'
import { type AppAssetDimensionConstraints } from '../../models/app-media'

type ImageSizeResult = ReturnType<typeof imageSize>

function validateBrandDimensions(
  name: string,
  dimensions: ImageSizeResult,
  constraints: AppAssetDimensionConstraints
): string | null {
  return validateAppAssetDimensions(
    name,
    {
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
    },
    constraints
  )
}

function checkBrandImage(
  name: string,
  relativePath: string,
  resolveAssetPath: (relative: string) => string | null,
  constraints: AppAssetDimensionConstraints
): BrandAssetCheck {
  const absolutePath = resolveAssetPath(relativePath)
  const result: BrandAssetCheck = { name, path: relativePath, ok: false }
  if (!absolutePath || !existsSync(absolutePath)) {
    result.reason = `Missing file: /public/${relativePath}`
    return result
  }
  result.source = relative(process.cwd(), absolutePath) || absolutePath
  const stat = statSync(absolutePath)
  if (!stat.isFile()) {
    result.reason = `Invalid asset path: /public/${relativePath} is not a file`
    return result
  }
  if (stat.size <= 0) {
    result.reason = `Empty file: /public/${relativePath}`
    return result
  }

  let dimensions: ImageSizeResult
  try {
    dimensions = imageSize(readFileSync(absolutePath))
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'Unable to read image metadata'
    result.reason = `Invalid image file: ${message}`
    return result
  }
  result.width = dimensions.width
  result.height = dimensions.height
  result.reason =
    validateBrandDimensions(name, dimensions, constraints) ?? undefined
  result.ok = !result.reason
  return result
}

function appAssetCheckName(relativePath: string): string {
  return relativePath
    .replace(/^img\/app\//, '')
    .replace(/\.(?:ico|png)$/i, '')
    .replace(/\//g, '-')
}

export function checkCurrentAppBrandAssets(): BrandAssetCheck[] {
  const appPublicPath = join(process.cwd(), 'public')
  const resolveAssetPath = (relativePath: string) => {
    const fullPath = join(appPublicPath, relativePath)
    return existsSync(fullPath) ? fullPath : null
  }
  return APP_PUBLIC_ASSET_REQUIREMENTS.map((asset) =>
    checkBrandImage(
      appAssetCheckName(asset.localRelativePath),
      asset.localRelativePath,
      resolveAssetPath,
      asset.dimensions
    )
  )
}
