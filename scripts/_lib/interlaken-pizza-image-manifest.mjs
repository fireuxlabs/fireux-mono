// @fireux-script
// last_used: 2026-07-22
// usage_note: validate the fixed Interlaken audit manifest and its contained, cryptographically pinned converted Dish images.
// Concurrent edit — 2026-07-21 23:59 CEST — Interlaken Pizza images: isolate reviewed manifest and local artifact validation from live planning.
// Concurrent edit — 2026-07-22 01:58 CEST — Interlaken image ownership: publish pinned imports under the Dish image path.

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
    sourceExclusion(
      '194',
      'https://interlakenpizza.ch/image/catalog/Mix%20grill%20teller.png',
      'reviewed_wrong_website_image',
      'The source depicts mixed-grill meat, not salmon.'
    ),
  ],
  [
    'chicken-cheese-burger',
    sourceExclusion(
      '183',
      'https://interlakenpizza.ch/image/catalog/Cheese%20Burger%201.png',
      'reviewed_wrong_website_image',
      'The source depicts a beef patty, not chicken.'
    ),
  ],
  [
    'espresso',
    sourceExclusion(
      '110',
      'https://interlakenpizza.ch/image/catalog/pngwing.com%20(79).png',
      'reviewed_wrong_website_image',
      'The source depicts a milk-foam latte, not espresso.'
    ),
  ],
  [
    'coffee-cream',
    sourceExclusion(
      '77',
      'https://interlakenpizza.ch/image/catalog/Gallery/image%20100.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'pizza-feta',
    sourceExclusion(
      '170',
      'https://interlakenpizza.ch/image/catalog/Pizza%20Feta.png',
      'reviewed_wrong_website_image',
      'The source depicts a Margherita-style pizza without feta.'
    ),
  ],
  [
    'pizza-quattro-stagioni',
    sourceExclusion(
      '181',
      'https://interlakenpizza.ch/image/catalog/PIZZA%20QUATTRO%20STAGIONI%201.png',
      'reviewed_wrong_website_image',
      'The source has seafood toppings that conflict with the Dish.'
    ),
  ],
  [
    'pizza-prosciutto',
    sourceExclusion(
      '156',
      'https://interlakenpizza.ch/image/catalog/Banner/Pizza%20Prosciutto.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'doener-box',
    sourceExclusion(
      '192',
      'https://interlakenpizza.ch/image/catalog/Banner/box%20of%20Doner.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'grilled-lamm',
    sourceExclusion(
      '196',
      'https://interlakenpizza.ch/image/catalog/LAMM%20TELLER.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'cola-zero-light-fanta-sprite',
    sourceExclusion(
      '218',
      'https://interlakenpizza.ch/image/catalog/Coca%20cola,%20coca%20cola%20zero%201.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'long-zenger-burger',
    sourceExclusion(
      '295',
      'https://interlakenpizza.ch/image/catalog/Banner/longg.png',
      'reviewed_wrong_website_image'
    ),
  ],
  [
    'hamburger',
    sourceExclusion(
      '124',
      'https://interlakenpizza.ch/image/catalog/Hamburger%201.png',
      'reviewed_manual_image'
    ),
  ],
  [
    'pizza-de-pollo-mild',
    sourceExclusion(
      '175',
      'https://interlakenpizza.ch/image/catalog/Pizza%20De%20Pollo%20(Mild).png',
      'reviewed_manual_image'
    ),
  ],
  [
    'pizza-interlakener',
    sourceExclusion(
      '179',
      'https://interlakenpizza.ch/image/catalog/Pizza%20Interlakener.png',
      'reviewed_manual_image'
    ),
  ],
  [
    'crispy-chicken-finger-box',
    sourceExclusion(
      '274',
      'https://interlakenpizza.ch/image/catalog/snacks/image%20172.png',
      'reviewed_manual_image'
    ),
  ],
  [
    'chicken-nuggets',
    sourceExclusion(
      '279',
      'https://interlakenpizza.ch/image/catalog/snacks/erer%20(1).png',
      'reviewed_manual_image'
    ),
  ],
])

function sourceExclusion(
  websiteProductId,
  websiteImageUrl,
  reason,
  reviewNote = ''
) {
  return {
    websiteProductId,
    websiteImageUrl,
    reason,
    reviewNote:
      reviewNote ||
      (reason === 'reviewed_manual_image'
        ? 'Visual review was inconclusive; operator confirmation is required.'
        : 'Visual review found that the source image does not safely represent this Dish.'),
  }
}

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
      objectPath: `apps/${INTERLAKEN_PIZZA_TARGET.appId}/kitchens/${INTERLAKEN_PIZZA_TARGET.kitchenId}/dishes/${dishId}/image/${verified.sha256}.webp`,
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

  const rowsByDishId = new Map(rows.map((row) => [row.dishId, row]))
  const reviewedExclusions = [...REVIEWED_SOURCE_EXCLUSIONS.entries()].map(
    ([dishId, exclusion]) => {
      const row = rowsByDishId.get(dishId)
      if (!row) {
        throw new Error(
          `Reviewed website-image exclusion is missing for ${dishId}; audit the changed source before publishing it.`
        )
      }
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
    }
  )
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
          dishImageSha256: hash(row.manifestImageUrl),
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
