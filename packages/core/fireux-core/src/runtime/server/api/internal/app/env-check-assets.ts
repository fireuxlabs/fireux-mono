import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve as pathResolve } from 'node:path'
import imageSize from 'image-size'
import {
  APP_PUBLIC_ASSET_REQUIREMENTS,
  validateAppAssetDimensions,
  type AppAssetDimensionConstraints,
} from '../../../../composables/fireux/firestore/core/app/utils/appAssets'

type ImageSizeResult = ReturnType<typeof imageSize>

export interface BrandAssetCheck {
  name: string
  path: string
  ok: boolean
  source?: string
  reason?: string
  width?: number
  height?: number
}

export function findRepoRoot(start: string): string {
  let current = start
  for (let index = 0; index < 10; index += 1) {
    if (
      existsSync(join(current, 'pnpm-workspace.yaml')) ||
      existsSync(join(current, '.git'))
    ) {
      return current
    }
    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }
  return current
}

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
  result.reason = validateBrandDimensions(name, dimensions, constraints) ?? undefined
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
