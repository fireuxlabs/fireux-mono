// @fireux-script
// last_used: 2026-07-21
// usage_note: inspect Interlaken Pizza source images and stage only deterministic, already-transparent derivatives.
// Concurrent edit — 2026-07-21 23:42 CEST — Interlaken Pizza audit split: isolate bounded, repeatable image inspection and local staging.

import { createHash } from 'node:crypto'
import {
  chmod,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import { INTERLAKEN_PIZZA_OUTPUT_ROOT } from './interlaken-pizza-target.mjs'

const IMAGE_TIMEOUT_MS = 30_000
const IMAGE_MAX_BYTES = 15 * 1024 * 1024
const IMAGE_MAX_PIXELS = 40_000_000
const FOOD_CANVAS_SIZE = 1200
const FOOD_MAX_VISIBLE_SIZE = 960
const ALLOWED_IMAGE_HOSTS = new Set([
  'interlakenpizza.ch',
  'www.interlakenpizza.ch',
])

export async function auditInterlakenImages(
  products,
  {
    convertedDirectory,
    sourceDirectory,
    stageApproved = false,
    concurrency = 2,
    requestDelayMs = 250,
    repoRoot = process.cwd(),
  } = {}
) {
  const productsByUrl = new Map()
  for (const product of products) {
    if (!product.websiteImageUrl) continue
    if (!productsByUrl.has(product.websiteImageUrl)) {
      productsByUrl.set(product.websiteImageUrl, [])
    }
    productsByUrl.get(product.websiteImageUrl).push(product)
  }

  const acceptedUrlsByDishId = new Map()
  for (const [url, linkedProducts] of productsByUrl) {
    for (const product of linkedProducts) {
      if (!['exact', 'probable'].includes(product.match.status)) continue
      if (product.requiresManualReview || !product.match.dishId) continue
      if (!acceptedUrlsByDishId.has(product.match.dishId)) {
        acceptedUrlsByDishId.set(product.match.dishId, new Set())
      }
      acceptedUrlsByDishId.get(product.match.dishId).add(url)
    }
  }

  if (stageApproved) {
    if (!sourceDirectory || !convertedDirectory) {
      throw new Error(
        'Image staging requires source and converted directories.'
      )
    }
    sourceDirectory = stagingDirectory(repoRoot, sourceDirectory, 'source')
    convertedDirectory = stagingDirectory(
      repoRoot,
      convertedDirectory,
      'converted'
    )
    await Promise.all([
      resetStagingDirectory(sourceDirectory),
      resetStagingDirectory(convertedDirectory),
    ])
  }

  const entries = [...productsByUrl.entries()]
  const inspected = await mapLimit(
    entries,
    concurrency,
    async ([url, linkedProducts]) => {
      const reusedByProductIds = linkedProducts.map(
        (product) => product.websiteProductId
      )
      const stagingBlockers = imageStagingBlockers({
        acceptedUrlsByDishId,
        linkedProducts,
        reusedByProductIds,
        url,
      })
      let response
      let inspection

      try {
        response = await fetchImage(url)
        inspection = await inspectImage(response.buffer)
      } catch (error) {
        return {
          url,
          loads: false,
          httpStatus: Number(error?.status || 0),
          contentType: '',
          byteLength: 0,
          format: '',
          width: 0,
          height: 0,
          hasAlphaChannel: false,
          hasTransparentPixels: false,
          classification: 'missing_or_broken',
          visibleBounds: null,
          reusedByProductIds,
          reuseCount: reusedByProductIds.length,
          stagingBlockers,
          stagingError: '',
          localSourcePath: '',
          converted: [],
          error: error instanceof Error ? error.message : String(error),
        }
      }

      const approvedProducts = stagingBlockers.length
        ? []
        : uniqueApprovedProducts(linkedProducts)
      let localSourcePath = ''
      const converted = []
      let stagingError = ''

      if (stageApproved && approvedProducts.length) {
        try {
          const sourceName = sourceFileName(url, inspection.format)
          const sourcePath = path.join(sourceDirectory, sourceName)
          await writeBufferAtomic(sourcePath, response.buffer)
          localSourcePath = relativeRepoPath(repoRoot, sourcePath)

          if (inspection.classification === 'already_transparent') {
            for (const product of approvedProducts) {
              const outputPath = path.join(
                convertedDirectory,
                `${safeSegment(product.match.dishId)}.webp`
              )
              const output = await convertTransparentImage(
                response.buffer,
                inspection.visibleBounds,
                outputPath
              )
              converted.push({
                dishId: product.match.dishId,
                path: relativeRepoPath(repoRoot, outputPath),
                ...output,
              })
            }
          }
        } catch (error) {
          stagingError = error instanceof Error ? error.message : String(error)
        }
      }

      return {
        url,
        loads: true,
        httpStatus: response.status,
        contentType: response.contentType,
        byteLength: response.buffer.length,
        reusedByProductIds,
        reuseCount: reusedByProductIds.length,
        stagingBlockers,
        stagingError,
        localSourcePath,
        converted,
        ...inspection,
      }
    },
    requestDelayMs
  )

  const byUrl = new Map(inspected.map((entry) => [entry.url, entry]))
  const productsWithImages = products.map((product) => ({
    ...product,
    image: product.websiteImageUrl
      ? byUrl.get(product.websiteImageUrl) || null
      : {
          url: '',
          loads: false,
          classification: 'missing_or_broken',
          error: 'Website product has no image URL.',
        },
  }))

  return {
    products: productsWithImages,
    images: inspected,
    counts: {
      productImageReferences: products.filter(
        (product) => product.websiteImageUrl
      ).length,
      uniqueProductImages: inspected.length,
      loaded: inspected.filter((image) => image.loads).length,
      broken: inspected.filter((image) => !image.loads).length,
      alreadyTransparent: inspected.filter(
        (image) => image.classification === 'already_transparent'
      ).length,
      safelyBackgroundRemovable: inspected.filter(
        (image) => image.classification === 'safely_background_removable'
      ).length,
      requiresManualCutOut: inspected.filter(
        (image) => image.classification === 'requires_manual_cut_out'
      ).length,
      unsuitable: inspected.filter(
        (image) => image.classification === 'unsuitable'
      ).length,
      converted: inspected.reduce(
        (count, image) => count + image.converted.length,
        0
      ),
      stagingBlocked: inspected.filter((image) => image.stagingBlockers.length)
        .length,
      stagingErrors: inspected.filter((image) => image.stagingError).length,
    },
  }
}

async function fetchImage(url) {
  const parsed = new URL(url)
  if (
    parsed.protocol !== 'https:' ||
    !ALLOWED_IMAGE_HOSTS.has(parsed.hostname)
  ) {
    throw new Error(
      `Image URL is outside the allowed Interlaken Pizza host: ${url}`
    )
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*',
        'User-Agent': 'FireUX-Interlaken-Image-Audit/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok) {
      const error = new Error(`Image returned HTTP ${response.status}.`)
      error.status = response.status
      throw error
    }
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(
        `Image response has unexpected content type ${contentType || 'unknown'}.`
      )
    }
    const declaredBytes = Number(response.headers.get('content-length') || 0)
    if (declaredBytes > IMAGE_MAX_BYTES) {
      throw new Error(`Image exceeds the ${IMAGE_MAX_BYTES}-byte limit.`)
    }
    const buffer = await boundedResponseBuffer(response, IMAGE_MAX_BYTES)
    if (!buffer.length) throw new Error('Image response was empty.')
    return {
      buffer,
      contentType,
      status: response.status,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function inspectImage(buffer) {
  const metadata = await sharp(buffer, {
    animated: false,
    limitInputPixels: IMAGE_MAX_PIXELS,
  }).metadata()
  const width = Number(metadata.width || 0)
  const height = Number(metadata.height || 0)
  if (!width || !height) throw new Error('Image dimensions are unavailable.')

  let hasTransparentPixels = false
  let meaningfulTransparency = false
  let visibleBounds = { left: 0, top: 0, width, height }
  let alpha = {
    clearPixelRatio: 0,
    transparentPixelRatio: 0,
    clearBoundaryRatio: 0,
  }

  if (metadata.hasAlpha) {
    const raw = await sharp(buffer, {
      animated: false,
      limitInputPixels: IMAGE_MAX_PIXELS,
    })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const bounds = alphaBounds(raw.data, raw.info)
    hasTransparentPixels = bounds.transparentPixels > 0
    meaningfulTransparency = bounds.meaningfulTransparency
    alpha = {
      clearPixelRatio: bounds.clearPixelRatio,
      transparentPixelRatio: bounds.transparentPixelRatio,
      clearBoundaryRatio: bounds.clearBoundaryRatio,
    }
    visibleBounds = bounds.visibleBounds
  }

  const classification =
    width < 256 || height < 256 || !visibleBounds
      ? 'unsuitable'
      : meaningfulTransparency
        ? 'already_transparent'
        : 'requires_manual_cut_out'

  return {
    format: String(metadata.format || ''),
    width,
    height,
    hasAlphaChannel: Boolean(metadata.hasAlpha),
    hasTransparentPixels,
    meaningfulTransparency,
    alpha,
    classification,
    visibleBounds,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  }
}

export async function readVerifiedInterlakenConvertedImage(filePath) {
  const file = await stat(filePath)
  if (!file.isFile()) {
    throw new Error(`Converted image is not a regular file: ${filePath}`)
  }

  const buffer = await readFile(filePath)
  const inspection = await inspectImage(buffer)
  const bounds = inspection.visibleBounds
  if (!bounds) {
    throw new Error(`Converted image has no visible pixels: ${filePath}`)
  }

  const rightMargin = FOOD_CANVAS_SIZE - bounds.left - bounds.width
  const bottomMargin = FOOD_CANVAS_SIZE - bounds.top - bounds.height
  const minimumMargin = Math.min(
    bounds.left,
    bounds.top,
    rightMargin,
    bottomMargin
  )
  if (
    inspection.format !== 'webp' ||
    inspection.width !== FOOD_CANVAS_SIZE ||
    inspection.height !== FOOD_CANVAS_SIZE ||
    !inspection.meaningfulTransparency ||
    minimumMargin < FOOD_CANVAS_SIZE * 0.1
  ) {
    throw new Error(`Converted image failed verification: ${filePath}`)
  }

  return {
    buffer,
    format: inspection.format,
    width: inspection.width,
    height: inspection.height,
    hasAlphaChannel: inspection.hasAlphaChannel,
    meaningfulTransparency: inspection.meaningfulTransparency,
    clearMarginMinimum: Number(
      (minimumMargin / FOOD_CANVAS_SIZE).toFixed(4)
    ),
    sha256: inspection.sha256,
  }
}

function alphaBounds(data, info) {
  const channels = Number(info.channels || 4)
  const alphaIndex = channels - 1
  let minX = info.width
  let minY = info.height
  let maxX = -1
  let maxY = -1
  let transparentPixels = 0
  let clearPixels = 0
  let boundaryPixels = 0
  let clearBoundaryPixels = 0

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * channels + alphaIndex]
      if (alpha < 255) transparentPixels += 1
      const clear = alpha <= 4
      if (clear) clearPixels += 1
      const boundary =
        x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1
      if (boundary) {
        boundaryPixels += 1
        if (clear) clearBoundaryPixels += 1
      }
      if (clear) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  const pixelCount = info.width * info.height
  const visibleBounds =
    maxX >= minX && maxY >= minY
      ? {
          left: minX,
          top: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        }
      : null
  const fullFrame = Boolean(
    visibleBounds &&
      visibleBounds.left === 0 &&
      visibleBounds.top === 0 &&
      visibleBounds.width === info.width &&
      visibleBounds.height === info.height
  )
  const clearPixelRatio = pixelCount ? clearPixels / pixelCount : 0
  const transparentPixelRatio = pixelCount ? transparentPixels / pixelCount : 0
  const clearBoundaryRatio = boundaryPixels
    ? clearBoundaryPixels / boundaryPixels
    : 0

  return {
    transparentPixels,
    clearPixels,
    clearPixelRatio,
    transparentPixelRatio,
    clearBoundaryRatio,
    meaningfulTransparency:
      Boolean(visibleBounds) &&
      !fullFrame &&
      clearPixelRatio >= 0.01 &&
      clearBoundaryRatio >= 0.5,
    visibleBounds,
  }
}

async function convertTransparentImage(buffer, bounds, outputPath) {
  const visible = await sharp(buffer, {
    animated: false,
    limitInputPixels: IMAGE_MAX_PIXELS,
  })
    .extract(bounds)
    .resize(FOOD_MAX_VISIBLE_SIZE, FOOD_MAX_VISIBLE_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer({ resolveWithObject: true })
  const horizontal = FOOD_CANVAS_SIZE - visible.info.width
  const vertical = FOOD_CANVAS_SIZE - visible.info.height

  const temporaryPath = `${outputPath}.${process.pid}.tmp.webp`
  try {
    await sharp(visible.data)
      .extend({
        top: Math.floor(vertical / 2),
        bottom: Math.ceil(vertical / 2),
        left: Math.floor(horizontal / 2),
        right: Math.ceil(horizontal / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 86, alphaQuality: 100, effort: 4 })
      .toFile(temporaryPath)

    const convertedInspection =
      await readVerifiedInterlakenConvertedImage(temporaryPath)
    await chmod(temporaryPath, 0o600)
    await rename(temporaryPath, outputPath)

    return {
      format: convertedInspection.format,
      width: convertedInspection.width,
      height: convertedInspection.height,
      hasAlphaChannel: convertedInspection.hasAlphaChannel,
      meaningfulTransparency: convertedInspection.meaningfulTransparency,
      clearMarginMinimum: convertedInspection.clearMarginMinimum,
      sha256: convertedInspection.sha256,
    }
  } catch (error) {
    await unlink(temporaryPath).catch(() => {})
    throw error
  }
}

function imageStagingBlockers({
  acceptedUrlsByDishId,
  linkedProducts,
  reusedByProductIds,
  url,
}) {
  const blockers = []
  if (reusedByProductIds.length > 1) {
    blockers.push('The same website image URL is reused by multiple products.')
  }
  for (const product of uniqueApprovedProducts(linkedProducts)) {
    if ((acceptedUrlsByDishId.get(product.match.dishId)?.size || 0) > 1) {
      blockers.push(
        `Dish ${product.match.dishId} is linked to multiple website image URLs, including ${url}.`
      )
    }
  }
  return [...new Set(blockers)]
}

async function boundedResponseBuffer(response, maximumBytes) {
  if (!response.body) return Buffer.alloc(0)
  const chunks = []
  let bytes = 0
  for await (const chunk of response.body) {
    const buffer = Buffer.from(chunk)
    bytes += buffer.length
    if (bytes > maximumBytes) {
      throw new Error(`Image exceeds the ${maximumBytes}-byte limit.`)
    }
    chunks.push(buffer)
  }
  return Buffer.concat(chunks, bytes)
}

async function writeBufferAtomic(filePath, buffer) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`
  try {
    await writeFile(temporaryPath, buffer, { mode: 0o600 })
    await rename(temporaryPath, filePath)
  } catch (error) {
    await unlink(temporaryPath).catch(() => {})
    throw error
  }
}

function stagingDirectory(repoRoot, directory, expectedLeaf) {
  const stagingRoot = path.resolve(
    repoRoot,
    INTERLAKEN_PIZZA_OUTPUT_ROOT,
    'images'
  )
  const resolved = path.resolve(directory)
  if (
    path.dirname(resolved) !== stagingRoot ||
    path.basename(resolved) !== expectedLeaf
  ) {
    throw new Error(
      `Refusing to clear ${expectedLeaf} staging outside ${stagingRoot}.`
    )
  }
  return resolved
}

async function resetStagingDirectory(directory) {
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
}

function uniqueApprovedProducts(products) {
  const byDishId = new Map()
  for (const product of products) {
    if (!['exact', 'probable'].includes(product.match.status)) continue
    if (product.requiresManualReview || !product.match.dishId) continue
    if (!byDishId.has(product.match.dishId))
      byDishId.set(product.match.dishId, product)
  }
  return [...byDishId.values()]
}

function sourceFileName(url, format) {
  const parsed = new URL(url)
  const base = safeSegment(decodeURIComponent(path.basename(parsed.pathname)))
  const extension = format || path.extname(base).slice(1) || 'img'
  const stem = base.replace(/\.[a-z0-9]+$/i, '') || 'image'
  const digest = createHash('sha256').update(url).digest('hex').slice(0, 12)
  return `${digest}-${stem}.${extension}`
}

function safeSegment(value) {
  return (
    String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'image'
  )
}

function relativeRepoPath(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/')
}

async function mapLimit(values, concurrency, mapper, requestDelayMs = 0) {
  const result = new Array(values.length)
  let cursor = 0
  let nextStartAt = Date.now()

  async function pace() {
    if (!requestDelayMs) return
    const now = Date.now()
    const waitMs = Math.max(0, nextStartAt - now)
    nextStartAt = Math.max(now, nextStartAt) + requestDelayMs
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  async function worker() {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      await pace()
      result[index] = await mapper(values[index], index)
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, values.length || 1)) },
      () => worker()
    )
  )
  return result
}
