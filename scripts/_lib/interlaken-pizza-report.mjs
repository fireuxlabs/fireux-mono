// @fireux-script
// last_used: 2026-07-21
// usage_note: assemble, atomically write, and summarize the read-only Interlaken Pizza comparison and image manifest.
// Concurrent edit — 2026-07-21 23:48 CEST — Interlaken Pizza audit cleanup: isolate generated reporting from reads and comparison mechanics.

import { createHash } from 'node:crypto'
import { chmod, mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  INTERLAKEN_PIZZA_SOURCE_URL,
  INTERLAKEN_PIZZA_TARGET,
} from './interlaken-pizza-target.mjs'

export function buildInterlakenManifest({
  comparison,
  fetched,
  imageAudit,
  remoteState,
  source,
  stageImages,
}) {
  const uniqueOptionGroups = source.products.flatMap(
    (product) => product.optionGroups
  )
  const placementOptionGroups = source.placements.flatMap(
    (placement) => placement.optionGroups
  )
  const target = INTERLAKEN_PIZZA_TARGET

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    safety: {
      mode: 'read_only',
      firestoreWrites: 0,
      storageWrites: 0,
      rejectsApply: true,
      stagesLocalImages: stageImages,
      existingDescriptionsOverwritten: false,
      existingImagesOverwritten: false,
    },
    target: {
      ...target,
      dishesPath: `apps/${target.appId}/kitchens/${target.kitchenId}/dishes`,
    },
    source: {
      requestedUrl: INTERLAKEN_PIZZA_SOURCE_URL,
      finalUrl: fetched.finalUrl,
      fetchedAt: fetched.fetchedAt,
      httpStatus: fetched.status,
      htmlSha256: createHash('sha256').update(fetched.html).digest('hex'),
      platform: 'OpenCart-compatible storefront',
      evidence: [
        'OCSESSID, language, and currency cookies',
        'catalog/view/theme/default asset paths',
        'index.php?route=product/product product links',
        'server-rendered category, product, price, image, and option markup',
      ],
      chosenApproach:
        'Parse the complete server-rendered /menu document; no complete JSON product feed or usable sitemap was exposed.',
      counts: {
        parentCategories: source.parentCategories.length,
        renderedCategories: source.categories.length,
        renderedPlacements: source.placements.length,
        uniqueProducts: source.products.length,
        duplicatePlacements: source.duplicatePlacements.length,
        optionBearingUniqueProducts: source.products.filter(
          (product) => product.optionGroups.length
        ).length,
        uniqueProductOptionGroups: uniqueOptionGroups.length,
        uniqueProductOptionValues: uniqueOptionGroups.reduce(
          (count, group) => count + group.options.length,
          0
        ),
        placementOptionGroups: placementOptionGroups.length,
        placementOptionValues: placementOptionGroups.reduce(
          (count, group) => count + group.options.length,
          0
        ),
      },
      parentCategories: source.parentCategories,
      categories: source.categories,
      duplicatePlacements: source.duplicatePlacements,
      parserWarnings: source.warnings,
    },
    currentMisebox: {
      menu: remoteState.menu,
      counts: currentCounts(remoteState),
      integrity: remoteState.integrity,
    },
    comparison: {
      counts: comparison.counts,
      duplicateWebsiteNames: comparison.duplicateWebsiteNames,
      products: imageAudit.products,
      firestoreOnly: comparison.firestoreOnly,
      firestoreManualLinked: comparison.firestoreManualLinked,
    },
    images: {
      skipped: !stageImages,
      counts: imageAudit.counts,
      assets: imageAudit.images,
      brokenUrls: imageAudit.images
        .filter((image) => !image.loads)
        .map((image) => ({ url: image.url, error: image.error })),
      localSourceDirectory: stageImages
        ? `${INTERLAKEN_PIZZA_OUTPUT_ROOT}/images/source`
        : '',
      convertedDirectory: stageImages
        ? `${INTERLAKEN_PIZZA_OUTPUT_ROOT}/images/converted`
        : '',
      conversionPolicy:
        'Only confidently matched originals with real alpha transparency are converted automatically. Opaque photos are never padded and mislabelled as transparent.',
    },
    modelMapping: {
      category: 'MenuSection.label',
      reusableFoodCopy: 'Dish.name and Dish.description',
      reusableFoodImage: 'Dish.image',
      menuPlacement: 'MenuItem.dish_id and MenuSection',
      menuPrice: 'MenuItem.price',
      requiredVariants: 'MenuItem.price_options using absolute prices',
      optionalExtras: 'MenuItem.add_ons using incremental prices',
      mismatches: [
        'The website stores option price deltas; FireUX price_options require absolute full prices.',
        "Website radio groups such as Special combo, Burger Extra's, Drink level, and Spice Level are not safely inferable as FireUX add-ons or variants without operator review.",
        'Combo and variation products cannot be merged into a base Dish by name similarity alone.',
      ],
    },
    nextStep:
      'Review exact, probable, manual-review, option, duplicate, and image classifications, then run pnpm interlaken:images:import for a fresh read-only publication plan. The audit command itself has no write path.',
  }
}

export function skippedInterlakenImageAudit(products) {
  return {
    products: products.map((product) => ({ ...product, image: null })),
    images: [],
    counts: {
      productImageReferences: products.filter(
        (product) => product.websiteImageUrl
      ).length,
      uniqueProductImages: new Set(
        products.map((product) => product.websiteImageUrl).filter(Boolean)
      ).size,
      loaded: null,
      broken: null,
      alreadyTransparent: null,
      safelyBackgroundRemovable: null,
      requiresManualCutOut: null,
      unsuitable: null,
      converted: 0,
      stagingBlocked: 0,
      stagingErrors: 0,
    },
  }
}

export async function writeInterlakenManifest(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.${process.pid}.tmp`
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    })
    await chmod(temporary, 0o600)
    await rename(temporary, filePath)
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw error
  }
}

export function printInterlakenSummary(manifest, filePath, repoRoot) {
  const matches = manifest.comparison.counts
  const images = manifest.images.counts
  const current = manifest.currentMisebox.counts
  const rows = [
    {
      measure: 'Website unique products',
      count: manifest.source.counts.uniqueProducts,
    },
    {
      measure: 'Website rendered placements',
      count: manifest.source.counts.renderedPlacements,
    },
    { measure: 'Current Firestore dishes', count: current.dishes },
    { measure: 'Exact matches', count: matches.exactMatches },
    { measure: 'Probable matches', count: matches.probableMatches },
    { measure: 'Manual-review matches', count: matches.manualReviewMatches },
    {
      measure: 'Website products missing in Firestore',
      count: matches.websiteMissingInFirestore,
    },
    {
      measure: 'Firestore dishes with manual website candidates',
      count: matches.firestoreManualLinked,
    },
    {
      measure: 'Firestore dishes with no website candidate',
      count: matches.firestoreMissingOnWebsite,
    },
    {
      measure: 'Unique website product images',
      count: images.uniqueProductImages,
    },
  ]

  if (manifest.images.skipped) {
    rows.push({
      measure: 'Image bytes inspected',
      count: 'no (run pnpm interlaken:images)',
    })
  } else {
    rows.push(
      { measure: 'Broken website images', count: images.broken },
      {
        measure: 'Already-transparent images',
        count: images.alreadyTransparent,
      },
      {
        measure: 'Images requiring manual cut-out',
        count: images.requiresManualCutOut,
      },
      { measure: 'Converted images', count: images.converted }
    )
  }

  console.log('\nInterlaken Pizza menu audit (read-only)')
  console.table(rows)
  console.log(`Manifest: ${path.relative(repoRoot, filePath)}`)
  if (manifest.images.localSourceDirectory) {
    console.log(`Source images: ${manifest.images.localSourceDirectory}`)
    console.log(`Converted images: ${manifest.images.convertedDirectory}`)
  }
  console.log('Remote writes: 0')
}

function currentCounts(state) {
  return {
    dishes: state.dishes.length,
    dishesWithDescriptions: state.dishes.filter((dish) => dish.description)
      .length,
    dishesWithImages: state.dishes.filter((dish) => dish.imageUrl).length,
    dishDeals: state.dishes.filter((dish) => dish.isDeal).length,
    menuSections: state.sections.length,
    menuItems: state.menuItems.length,
    menuItemsWithPriceOptions: state.menuItems.filter(
      (item) => item.priceOptions.length
    ).length,
    menuItemsWithAddOns: state.menuItems.filter((item) => item.addOns.length)
      .length,
  }
}
