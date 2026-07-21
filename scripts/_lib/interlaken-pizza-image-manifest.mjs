// @fireux-script
// last_used: 2026-07-21
// usage_note: validate the fixed Interlaken audit manifest and its contained, cryptographically pinned converted Dish images.
// Concurrent edit — 2026-07-21 23:59 CEST — Interlaken Pizza images: isolate reviewed manifest and local artifact validation from live planning.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { readVerifiedInterlakenConvertedImage } from './interlaken-pizza-audit-images.mjs'
import {
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  INTERLAKEN_PIZZA_TARGET,
} from './interlaken-pizza-target.mjs'

const ACCEPTED_MATCHES = new Set(['exact', 'probable'])
const SHA256 = /^[a-f0-9]{64}$/
const REVIEWED_SOURCE_EXCLUSIONS = new Map([
  [
    'grilled-salmon',
    {
      websiteProductId: '194',
      websiteImageUrl:
        'https://interlakenpizza.ch/image/catalog/Mix%20grill%20teller.png',
      reason: 'reviewed_wrong_website_image',
      reviewNote: 'The source depicts mixed-grill meat, not salmon.',
    },
  ],
  [
    'chicken-cheese-burger',
    {
      websiteProductId: '183',
      websiteImageUrl:
        'https://interlakenpizza.ch/image/catalog/Cheese%20Burger%201.png',
      reason: 'reviewed_wrong_website_image',
      reviewNote: 'The source depicts a beef patty, not chicken.',
    },
  ],
  [
    'espresso',
    {
      websiteProductId: '110',
      websiteImageUrl:
        'https://interlakenpizza.ch/image/catalog/pngwing.com%20(79).png',
      reason: 'reviewed_wrong_website_image',
      reviewNote: 'The source depicts a milk-foam latte, not espresso.',
    },
  ],
  [
    'pizza-feta',
    {
      websiteProductId: '170',
      websiteImageUrl:
        'https://interlakenpizza.ch/image/catalog/Pizza%20Feta.png',
      reason: 'reviewed_wrong_website_image',
      reviewNote: 'The source depicts a Margherita-style pizza without feta.',
    },
  ],
  [
    'pizza-quattro-stagioni',
    {
      websiteProductId: '181',
      websiteImageUrl:
        'https://interlakenpizza.ch/image/catalog/PIZZA%20QUATTRO%20STAGIONI%201.png',
      reason: 'reviewed_wrong_website_image',
      reviewNote:
        'The source has seafood toppings that conflict with the Dish.',
    },
  ],
])

const text = (value) => String(value ?? '').trim()
const hash = (value) =>
  createHash('sha256')
    .update(Buffer.isBuffer(value) ? value : String(value ?? ''))
    .digest('hex')

export async function readInterlakenImageManifest({
  manifestPath,
  repoRoot,
}) {
  const source = await readFile(manifestPath, 'utf8')
  let manifest
  try {
    manifest = JSON.parse(source)
  } catch {
    throw new Error(`Manifest is not valid JSON: ${manifestPath}`)
  }
  validateManifest(manifest)
  const { candidates, manifestSkipped } = await manifestCandidates(
    manifest,
    repoRoot
  )
  return {
    candidates,
    manifest,
    manifestSkipped,
    manifestSha256: hash(source),
  }
}

function validateManifest(manifest) {
  if (manifest?.schemaVersion !== 1) {
    throw new Error('Interlaken image import requires manifest schemaVersion 1.')
  }
  if (manifest?.safety?.mode !== 'read_only') {
    throw new Error('Interlaken image import requires a read-only audit manifest.')
  }
  if (manifest?.images?.skipped !== false) {
    throw new Error(
      'Manifest has no staged images. Run pnpm interlaken:images first.'
    )
  }
  for (const [key, expected] of Object.entries(INTERLAKEN_PIZZA_TARGET)) {
    if (manifest?.target?.[key] !== expected) {
      throw new Error(
        `Manifest target ${key} must be ${expected}; received ${text(manifest?.target?.[key]) || 'missing'}.`
      )
    }
  }
  const dishesPath = `apps/${INTERLAKEN_PIZZA_TARGET.appId}/kitchens/${INTERLAKEN_PIZZA_TARGET.kitchenId}/dishes`
  if (manifest?.target?.dishesPath !== dishesPath) {
    throw new Error(`Manifest dishesPath must be ${dishesPath}.`)
  }
}

async function manifestCandidates(manifest, repoRoot) {
  const products = Array.isArray(manifest?.comparison?.products)
    ? manifest.comparison.products
    : []
  const convertedProducts = products.filter(
    (product) =>
      Array.isArray(product?.image?.converted) &&
      product.image.converted.length
  )
  const expectedConverted = Number(manifest?.images?.counts?.converted)
  const actualConverted = convertedProducts.reduce(
    (count, product) => count + product.image.converted.length,
    0
  )
  if (!actualConverted || actualConverted !== expectedConverted) {
    throw new Error(
      `Manifest converted-image count differs: expected ${expectedConverted}, found ${actualConverted}.`
    )
  }

  const convertedRoot = path.resolve(
    repoRoot,
    INTERLAKEN_PIZZA_OUTPUT_ROOT,
    'images',
    'converted'
  )
  const rows = await mapLimit(convertedProducts, 2, async (product) => {
    const converted = product.image.converted
    const dishId = text(product?.match?.dishId)
    if (converted.length !== 1) {
      throw new Error(
        `Dish ${dishId || 'unknown'} has multiple converted images.`
      )
    }
    if (
      !dishId ||
      !ACCEPTED_MATCHES.has(product?.match?.status) ||
      product?.requiresManualReview !== false ||
      product?.image?.classification !== 'already_transparent' ||
      product?.image?.loads !== true ||
      text(product?.image?.stagingError) ||
      (product?.image?.stagingBlockers || []).length
    ) {
      throw new Error(
        `Converted image for ${dishId || 'unknown'} is not an approved exact/probable manifest row.`
      )
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(dishId)) {
      throw new Error(`Unsafe Dish id in converted image manifest: ${dishId}`)
    }

    const conversion = converted[0]
    if (text(conversion?.dishId) !== dishId) {
      throw new Error(`Converted image Dish id mismatch for ${dishId}.`)
    }
    const localPath = path.resolve(repoRoot, text(conversion?.path))
    if (
      path.dirname(localPath) !== convertedRoot ||
      path.basename(localPath) !== `${dishId}.webp`
    ) {
      throw new Error(
        `Converted image path is outside the fixed staging set: ${localPath}`
      )
    }
    const verified = await readVerifiedInterlakenConvertedImage(localPath)
    if (!SHA256.test(text(conversion?.sha256))) {
      throw new Error(
        `Converted image ${dishId} has no pinned sha256. Run pnpm interlaken:images again.`
      )
    }
    if (verified.sha256 !== conversion.sha256) {
      throw new Error(`Converted image sha256 differs for ${dishId}.`)
    }
    if (
      verified.format !== conversion.format ||
      verified.width !== conversion.width ||
      verified.height !== conversion.height ||
      verified.hasAlphaChannel !== conversion.hasAlphaChannel ||
      verified.meaningfulTransparency !== conversion.meaningfulTransparency ||
      verified.clearMarginMinimum !== conversion.clearMarginMinimum
    ) {
      throw new Error(`Converted image metadata differs for ${dishId}.`)
    }

    const currentDish = product?.currentDish || {}
    if (
      text(currentDish.id) !== dishId ||
      !text(currentDish.name) ||
      !text(product.websiteProductId) ||
      !text(product.websiteName) ||
      !text(product.websiteImageUrl)
    ) {
      throw new Error(`Manifest Dish snapshot is incomplete for ${dishId}.`)
    }

    return {
      buffer: verified.buffer,
      confidence: Number(product.match.confidence || 0),
      dishId,
      dishName: text(currentDish.name),
      documentPath: `${manifest.target.dishesPath}/${dishId}`,
      expectedItemKind: text(currentDish.itemKind),
      expectedKitchenId: INTERLAKEN_PIZZA_TARGET.kitchenId,
      localPath,
      localSha256: verified.sha256,
      manifestImageUrl: text(currentDish.imageUrl),
      matchStatus: product.match.status,
      objectPath: `kitchens/${INTERLAKEN_PIZZA_TARGET.kitchenId}/dishes/${dishId}/image/current`,
      websiteProductId: text(product.websiteProductId),
      websiteName: text(product.websiteName),
      websiteImageUrl: text(product.websiteImageUrl),
    }
  })

  const seen = new Set()
  for (const row of rows) {
    if (seen.has(row.dishId)) {
      throw new Error(`Duplicate converted Dish target: ${row.dishId}`)
    }
    seen.add(row.dishId)
  }

  const reviewedExclusions = rows
    .filter((row) => REVIEWED_SOURCE_EXCLUSIONS.has(row.dishId))
    .map((row) => {
      const exclusion = REVIEWED_SOURCE_EXCLUSIONS.get(row.dishId)
      if (
        row.websiteProductId !== exclusion.websiteProductId ||
        row.websiteImageUrl !== exclusion.websiteImageUrl
      ) {
        throw new Error(
          `Reviewed website-image exclusion changed for ${row.dishId}; audit the new source before publishing it.`
        )
      }
      return {
        dishId: row.dishId,
        dishName: row.dishName,
        reason: exclusion.reason,
        reviewNote: exclusion.reviewNote,
        sourceImageSha256: hash(row.websiteImageUrl),
        websiteName: row.websiteName,
      }
    })
  const excludedDishIds = new Set(
    reviewedExclusions.map((item) => item.dishId)
  )

  return {
    candidates: rows.filter(
      (row) => !row.manifestImageUrl && !excludedDishIds.has(row.dishId)
    ),
    manifestSkipped: [
      ...rows
        .filter((row) => row.manifestImageUrl)
        .map((row) => ({
          dishId: row.dishId,
          dishName: row.dishName,
          reason: 'manifest_image_already_present',
          currentImageSha256: hash(row.manifestImageUrl),
        })),
      ...reviewedExclusions,
    ],
  }
}

async function mapLimit(values, concurrency, mapper) {
  const output = new Array(values.length)
  let cursor = 0
  let failure = null

  async function worker() {
    while (!failure && cursor < values.length) {
      const index = cursor
      cursor += 1
      try {
        output[index] = await mapper(values[index], index)
      } catch (error) {
        failure ||= error
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, values.length || 1)) },
      () => worker()
    )
  )
  if (failure) throw failure
  return output
}
