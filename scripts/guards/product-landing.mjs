// @fireux-script
// last_used: 2026-08-02
// usage_note: keeps the shared product landing mobile-first and product truth at each project edge.
// Concurrent edit — 2026-07-23 02:43 CEST — Guard the central landing surface and its Misebox adapter.
// Concurrent edit — 2026-07-23 12:13 CEST — Extend the shared landing contract to the FireUX sibling consumer.
// Concurrent edit — 2026-07-25 — Guard Misebox's real read-only Orders proof inside the shared hero.
// Concurrent edit — 2026-07-28 — Guard the shared hero-to-catalogue section spine.
// Concurrent edit — 2026-07-29 — Guard the shared Main App start-or-join entry contract.
// Concurrent edit — 2026-08-02 — Follow typed entry content into its imported local owner and park active Main App hero previews.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const CORE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductIndex.vue'
const CORE_ECOSYSTEM_HOME_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/EcosystemHome.vue'
const CORE_STYLE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductIndex.css'
const CORE_IMMERSIVE_STYLE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductIndexImmersive.css'
const CORE_TOKENS_PATH =
  'packages/core/fireux-core/src/runtime/assets/styles/scss/atoms/tokens.scss'
const CORE_LANDING_MOTION_PATH =
  'packages/core/fireux-core/src/runtime/composables/fireux/motion/useLandingMotion.ts'
const CORE_LANDING_STICKY_MOTION_PATH =
  'packages/core/fireux-core/src/runtime/composables/fireux/motion/landing-sticky-motion.ts'
const CORE_PACKAGE_PATH = 'packages/core/fireux-core/package.json'
const CORE_APP_COLLECTION_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/AppCollection.vue'
const CORE_CONSOLE_PREVIEW_FRAME_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/WorkspacePreviewFrame.vue'
const CORE_CARD_ORBIT_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/CardOrbit.vue'
const CORE_CARD_ORBIT_GEOMETRY_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/card-orbit-geometry.ts'
const CORE_CARD_ORBIT_POINTER_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/use-card-orbit-pointer.ts'
const CORE_CARD_ORBIT_STYLE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/CardOrbit.css'
const CORE_CARD_ORBIT_TYPE_PATH =
  'packages/core/fireux-core/src/types/landing-card-orbit.ts'
const CORE_PRODUCT_PROOF_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductProofSection.vue'
const CORE_PRODUCT_HERO_IMAGE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductHeroImage.vue'
const CORE_PRODUCT_SURFACE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductSurfaceShowcase.vue'
const CORE_PRODUCT_CATALOGUE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductCatalogue.vue'
const CORE_PRODUCT_ENTRY_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductEntryPaths.vue'
const CORE_PRICING_STRIP_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/PricingStrip.vue'
const CORE_PRODUCT_PRICING_STRIP_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductPricingStrip.vue'
const CORE_PRODUCT_PRICING_SOURCE_PATH =
  'packages/core/fireux-core/src/runtime/app/composables/pricing/usePricing.ts'
const CORE_PRODUCT_PRICING_INDEX_PATH =
  'packages/core/fireux-core/src/runtime/app/components/Pricing/Catalogue.vue'
const CORE_PRODUCT_PRICING_TIER_PATH =
  'packages/core/fireux-core/src/runtime/app/components/Pricing/Tier.vue'
const CORE_OPERATION_RAIL_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/OperationRail.vue'
const CORE_PRODUCT_LANDING_TYPE_PATH =
  'packages/core/fireux-core/src/types/landing-product.ts'
const PROJECTS_PATH = 'projects'
const ALIGNED_MAIN_APP_LANDING_PATHS = [
  'projects/bringli/bringli-app/app/components/Landing/Index.vue',
  'projects/buenohost/buenohost-app/app/components/Landing/Index.vue',
  'projects/granite/granite-app/app/components/Landing/Index.vue',
  'projects/slap/slap-app/app/components/Landing/Index.vue',
]
const STANDARD_PRODUCT_HERO_IMAGE_PATHS = [
  'projects/bringli/bringli-app/public/img/landing/supply-operations-hero-v1.png',
  'projects/buenohost/buenohost-app/public/img/landing/guest-operations-hero-v1.png',
  'projects/granite/granite-app/public/img/landing/property-operations-hero-v1.png',
  'projects/misebox/misebox-app/public/img/landing/supplier-operations-hero-v3.png',
  'projects/slap/slap-app/public/img/landing/brand-commerce-hero-v1.png',
  'projects/werkbox/werkbox-app/public/img/landing/practical-work-hero-v3.png',
]
const STANDARD_PRODUCT_HERO_IMAGE = {
  width: 1600,
  height: 1000,
  maximumBytes: 2_500_000,
}
const ECOSYSTEM_OPERATION_RAIL_CONTRACTS = [
  {
    filePath:
      'projects/bringli/bringli-app/app/components/Landing/landing-content.ts',
    catalogue: 'supplierOperations',
  },
  {
    filePath:
      'projects/buenohost/buenohost-app/app/components/Landing/landing-content.ts',
    catalogue: 'propertyOperations',
  },
  {
    filePath:
      'projects/granite/granite-app/app/components/Landing/landing-content.ts',
    catalogue: 'portfolioOperations',
  },
]
const WERKBOX_ADAPTER_PATH =
  'projects/werkbox/werkbox-app/app/components/Landing/Index.vue'
const WERKBOX_HERO_PATH =
  'projects/werkbox/werkbox-app/app/components/Landing/HeroPreview.vue'
const SLAP_ADAPTER_PATH =
  'projects/slap/slap-app/app/components/Landing/Index.vue'
const MISEBOX_ADAPTER_PATH =
  'projects/misebox/misebox-app/app/components/Landing/Index.vue'
const MISEBOX_LANDING_CONTENT_PATH =
  'projects/misebox/misebox-app/app/components/Landing/landing-content.ts'
const MISEBOX_HERO_PATH =
  'projects/misebox/misebox-app/app/components/Landing/HeroImage.vue'
const MISEBOX_PRICING_STRIP_PATH =
  'projects/misebox/misebox-app/app/components/Landing/PricingStrip.vue'
const MISEBOX_PAGE_PATH = 'projects/misebox/misebox-app/app/pages/index.vue'
const MISEBOX_CARD_WINDOW_PATH =
  'projects/misebox/misebox-app/app/components/ElementWindow.vue'
const MISEBOX_POWER_CARDS_PATH =
  'projects/misebox/misebox-app/app/components/PowerCards.vue'
const MISEBOX_POWER_CARDS_DEMO_PATH =
  'projects/misebox/misebox-app/app/composables/product-demo/useMiseboxPowerCardsProductDemo.ts'
const MISEBOX_POWER_CARD_EIGHT_PATH =
  'projects/misebox/misebox-app/app/components/PowerCardEight.vue'
const MISEBOX_HANDOFF_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Landing/HandoffPreview.vue'
const MISEBOX_HANDOFF_PREVIEW_STYLE_PATH =
  'projects/misebox/misebox-app/app/components/Landing/handoff-preview.css'
const MISEBOX_HANDOFF_STAGE_PATH =
  'projects/misebox/misebox-app/app/components/Landing/HandoffStage.vue'
const MISEBOX_HANDOFF_STAGE_STYLE_PATH =
  'projects/misebox/misebox-app/app/components/Landing/handoff-stage.css'
const MISEBOX_ORDERING_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Landing/OrderingPreview.vue'
const MISEBOX_ORDERING_SHOWCASE_PATH =
  'projects/misebox/misebox-app/app/components/Landing/OrderingShowcase.vue'
const MISEBOX_ORDERING_TOOL_PATH =
  'projects/misebox/misebox-app/app/components/Provider/Tools/Ordering.vue'
const MISEBOX_ORDERING_TOOL_CONTRACT_PATH =
  'projects/misebox/misebox-app/server/utils/tools/ordering.ts'
const MISEBOX_FINANCE_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Landing/FinancePreview.vue'
const MISEBOX_CONSOLE_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Index.vue'
const KITCHEN_MISE_BOARD_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Mise/TaskBoard.vue'
const KITCHEN_MISE_COLLECTION_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Mise/TaskCollection.vue'
const KITCHEN_MISE_CONSOLE_READ_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Mise/Read.vue'
const KITCHEN_MISE_PRESENTATION_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/mise-presentation.ts'
const MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS = {
  menus:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Menus.vue',
  ingredients:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Ingredients.vue',
  dishes:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes.vue',
  dishCollection:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Collection.vue',
  dishDetail:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Detail.vue',
  dishDetailSections:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/DetailSections.vue',
  dishFinance:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Finance.vue',
  dishSpec:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Spec.vue',
  dishPrepItems:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/PrepItems.vue',
  dishRecipes:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Recipes.vue',
  dishMise:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Dishes/Mise.vue',
  recipes:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Recipes.vue',
  mise: 'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Mise.vue',
  orders:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Orders.vue',
  stations:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Stations.vue',
  suppliers:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Suppliers.vue',
  finance:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Finance.vue',
  emptyCanvas:
    'projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/EmptyCanvas.vue',
}
const MISEBOX_META_PATH = 'projects/misebox/misebox-app/app/meta.ts'
const MISEBOX_META_SOURCE_PATH =
  'projects/misebox/misebox-app/app/content/meta/source.ts'
const MISEBOX_JOBS_MIDDLEWARE_PATH =
  'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts'
const MISEBOX_JOBS_LAYOUT_PATH =
  'projects/misebox/misebox-app/app/layouts/misebox-jobs.vue'
const MISEBOX_SUPPLIERS_MIDDLEWARE_PATH =
  'projects/misebox/misebox-app/app/middleware/misebox-suppliers-surface.global.ts'
const FIREUX_ADAPTER_PATH =
  'projects/fireux/fireux-app/app/components/Landing/Index.vue'
const FIREUX_PRICING_STRIP_PATH =
  'projects/fireux/fireux-app/app/components/Landing/PricingStrip.vue'
const FIREUX_PAGE_PATH = 'projects/fireux/fireux-app/app/pages/product.vue'
const FIREUX_META_PATH = 'projects/fireux/fireux-app/app/meta.ts'
const FIREUX_CONSOLE_PREVIEW_PATH =
  'projects/fireux/fireux-app/app/components/Landing/WorkspacePreview/Index.vue'
const FIREUX_SURFACE_SHOWCASE_PATH =
  'projects/fireux/fireux-app/app/components/Landing/SurfaceShowcase.vue'
const FIREUX_PRODUCT_DEMO_PATH =
  'projects/fireux/fireux-app/app/composables/product-demo/useFireuxProductDemo.ts'
const FIREUX_CONSOLE_PREVIEW_COMPONENT_PATHS = {
  apps: 'projects/fireux/fireux-app/app/components/Landing/WorkspacePreview/Apps.vue',
  ecosystems:
    'projects/fireux/fireux-app/app/components/Landing/WorkspacePreview/Ecosystems.vue',
  privateState:
    'projects/fireux/fireux-app/app/components/Landing/WorkspacePreview/PrivateState.vue',
}
const FIREUX_CARD_ORBIT_PATH =
  'projects/fireux/fireux-app/app/components/Landing/CardOrbit.vue'
const FIREUX_ECOSYSTEMS_PATH =
  'projects/fireux/fireux-app/app/components/Landing/Ecosystems.vue'
const MOBILE_FIRST_MARKER =
  '/* Mobile-first baseline. Width queries below may only enhance this layout. */'
const PRICING_APP_CONTRACTS = [
  {
    name: 'FireUX',
    configPath: 'projects/fireux/fireux-app/nuxt.config.ts',
    composablePath:
      'projects/fireux/fireux-app/app/composables/useFireuxPricing.ts',
    composableName: 'useFireuxPricing',
    indexPath: 'projects/fireux/fireux-app/app/pages/pricing/index.vue',
    tierPath: 'projects/fireux/fireux-app/app/pages/pricing/[tier].vue',
    landingPath: FIREUX_PRICING_STRIP_PATH,
  },
  {
    name: 'Misebox',
    configPath: 'projects/misebox/misebox-app/nuxt.config.ts',
    composablePath:
      'projects/misebox/misebox-app/app/composables/useMiseboxPricing.ts',
    composableName: 'useMiseboxPricing',
    indexPath: 'projects/misebox/misebox-app/app/pages/pricing/index.vue',
    tierPath: 'projects/misebox/misebox-app/app/pages/pricing/[tier].vue',
    landingPath: MISEBOX_PRICING_STRIP_PATH,
  },
  {
    name: 'Werkbox',
    configPath: 'projects/werkbox/werkbox-app/nuxt.config.ts',
    composablePath:
      'projects/werkbox/werkbox-app/app/composables/useWerkboxPricing.ts',
    composableName: 'useWerkboxPricing',
    indexPath: 'projects/werkbox/werkbox-app/app/pages/pricing/index.vue',
    tierPath: 'projects/werkbox/werkbox-app/app/pages/pricing/[tier].vue',
    landingPath: WERKBOX_ADAPTER_PATH,
  },
  {
    name: 'Bringli',
    configPath: 'projects/bringli/bringli-app/nuxt.config.ts',
    composablePath:
      'projects/bringli/bringli-app/app/composables/useBringliPricing.ts',
    composableName: 'useBringliPricing',
    indexPath: 'projects/bringli/bringli-app/app/pages/pricing/index.vue',
    tierPath: 'projects/bringli/bringli-app/app/pages/pricing/[tier].vue',
    landingPath:
      'projects/bringli/bringli-app/app/components/Landing/Index.vue',
  },
  {
    name: 'Slap',
    configPath: 'projects/slap/slap-app/nuxt.config.ts',
    composablePath: 'projects/slap/slap-app/app/composables/useSlapPricing.ts',
    composableName: 'useSlapPricing',
    indexPath: 'projects/slap/slap-app/app/pages/pricing/index.vue',
    tierPath: 'projects/slap/slap-app/app/pages/pricing/[tier].vue',
    landingPath: SLAP_ADAPTER_PATH,
  },
  {
    name: 'Granite',
    configPath: 'projects/granite/granite-app/nuxt.config.ts',
    composablePath:
      'projects/granite/granite-app/app/composables/useGranitePricing.ts',
    composableName: 'useGranitePricing',
    indexPath: 'projects/granite/granite-app/app/pages/pricing/index.vue',
    tierPath: 'projects/granite/granite-app/app/pages/pricing/[tier].vue',
    landingPath:
      'projects/granite/granite-app/app/components/Landing/Index.vue',
  },
  {
    name: 'BuenoHost',
    configPath: 'projects/buenohost/buenohost-app/nuxt.config.ts',
    composablePath:
      'projects/buenohost/buenohost-app/app/composables/useBuenoHostPricing.ts',
    composableName: 'useBuenoHostPricing',
    indexPath: 'projects/buenohost/buenohost-app/app/pages/pricing.vue',
    tierPath: 'projects/buenohost/buenohost-app/app/pages/pricing/[tier].vue',
    landingPath:
      'projects/buenohost/buenohost-app/app/components/Landing/Index.vue',
  },
]

function read(repoRoot, filePath) {
  return readFileSync(path.join(repoRoot, filePath), 'utf8')
}

function readPngMetadata(repoRoot, filePath) {
  const image = readFileSync(path.join(repoRoot, filePath))
  const pngSignature = '89504e470d0a1a0a'

  if (image.subarray(0, 8).toString('hex') !== pngSignature) return null

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
    bitDepth: image[24],
    colorType: image[25],
    bytes: image.byteLength,
  }
}

function discoverProductLandingAdapters(repoRoot) {
  const adapters = []
  const ignoredDirectories = new Set(['.nuxt', '.output', 'node_modules'])

  function visit(directoryPath) {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          visit(path.join(directoryPath, entry.name))
        }
        continue
      }

      if (!entry.isFile() || entry.name !== 'Index.vue') continue

      const absolutePath = path.join(directoryPath, entry.name)
      const filePath = path.relative(repoRoot, absolutePath)
      const parts = filePath.split(path.sep)
      if (
        !parts.includes('app') ||
        !parts.includes('components') ||
        !parts.includes('Landing')
      ) {
        continue
      }

      const source = readFileSync(absolutePath, 'utf8')
      if (source.includes('<LandingProductIndex')) {
        adapters.push({ filePath, source })
      }
    }
  }

  visit(path.join(repoRoot, PROJECTS_PATH))
  return adapters.sort((left, right) =>
    left.filePath.localeCompare(right.filePath)
  )
}

function entryPathsBlock(source) {
  const start = source.indexOf('const entryPaths =')
  const end = source.indexOf('satisfies LandingProductEntryContent', start)
  if (start === -1 || end === -1) return ''
  return source.slice(start, end)
}

function resolveLocalImport(repoRoot, importerPath, importSpecifier) {
  if (!importSpecifier.startsWith('.')) return null

  const unresolvedPath = path.resolve(
    repoRoot,
    path.dirname(importerPath),
    importSpecifier
  )
  const candidates = path.extname(unresolvedPath)
    ? [unresolvedPath]
    : [
        unresolvedPath,
        `${unresolvedPath}.ts`,
        `${unresolvedPath}.vue`,
        path.join(unresolvedPath, 'index.ts'),
      ]

  for (const candidate of candidates) {
    const relativePath = path.relative(repoRoot, candidate)
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) continue
    if (existsSync(candidate)) {
      return {
        filePath: relativePath,
        source: readFileSync(candidate, 'utf8'),
      }
    }
  }

  return null
}

function resolveEntryPathsContract(repoRoot, adapter) {
  if (entryPathsBlock(adapter.source)) return adapter

  for (const match of adapter.source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
  )) {
    const importedNames = match[1]
      .split(',')
      .map((name) => name.trim().replace(/^type\s+/, ''))
      .map((name) => name.split(/\s+as\s+/).at(-1))

    if (!importedNames.includes('entryPaths')) continue

    const contract = resolveLocalImport(repoRoot, adapter.filePath, match[2])
    if (contract) return contract
  }

  return adapter
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length
}

function slotContains(source, slotName, marker) {
  const openingPattern = new RegExp(`<template\\s+#${slotName}(?:\\s|>)`)
  const openingMatch = openingPattern.exec(source)
  if (!openingMatch) return false

  const start = openingMatch.index + openingMatch[0].length
  const end = source.indexOf('</template>', start)
  return end !== -1 && source.slice(start, end).includes(marker)
}

function extractScopedStyle({ repoRoot, filePath, source, violations }) {
  const allOpeningTags = [...source.matchAll(/<style\b[^>]*>/g)]
  const openingTags = [...source.matchAll(/<style\b(?=[^>]*\bscoped\b)[^>]*>/g)]

  if (allOpeningTags.length !== 1 || openingTags.length !== 1) {
    violations.push(
      `${filePath}: expected exactly one scoped landing stylesheet, found ${allOpeningTags.length} style block(s) and ${openingTags.length} scoped block(s)`
    )
    return null
  }

  const openingTag = openingTags[0]
  const externalSource = openingTag[0].match(/\bsrc=["']([^"']+)["']/)
  if (externalSource) {
    const stylesheetPath = path.join(path.dirname(filePath), externalSource[1])
    return read(repoRoot, stylesheetPath)
  }
  const start = openingTag.index + openingTag[0].length
  const end = source.indexOf('</style>', start)

  if (end === -1) {
    violations.push(`${filePath}: scoped landing stylesheet is not closed`)
    return null
  }

  return source.slice(start, end)
}

function skipComment(source, index) {
  if (!source.startsWith('/*', index)) return index
  const end = source.indexOf('*/', index + 2)
  return end === -1 ? source.length : end + 2
}

function findBlockEnd(source, openingIndex, limit) {
  let depth = 1
  let quote = ''

  for (let index = openingIndex + 1; index < limit; index += 1) {
    const character = source[index]

    if (quote) {
      if (character === '\\') index += 1
      else if (character === quote) quote = ''
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (source.startsWith('/*', index)) {
      index = skipComment(source, index) - 1
      continue
    }

    if (character === '{') depth += 1
    if (character === '}') depth -= 1
    if (depth === 0) return index
  }

  return limit - 1
}

function splitSelectors(selectorText) {
  const selectors = []
  let start = 0
  let roundDepth = 0
  let squareDepth = 0
  let quote = ''

  for (let index = 0; index < selectorText.length; index += 1) {
    const character = selectorText[index]

    if (quote) {
      if (character === '\\') index += 1
      else if (character === quote) quote = ''
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth -= 1
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth -= 1

    if (character === ',' && roundDepth === 0 && squareDepth === 0) {
      selectors.push(selectorText.slice(start, index))
      start = index + 1
    }
  }

  selectors.push(selectorText.slice(start))
  return selectors.map((selector) => selector.trim()).filter(Boolean)
}

function parseStyleRules(source) {
  const rules = []
  const mediaQueries = []

  function parseRange(start, end, mediaContext = []) {
    let index = start

    while (index < end) {
      while (index < end && /\s/.test(source[index])) index += 1
      if (index >= end) break

      if (source.startsWith('/*', index)) {
        index = skipComment(source, index)
        continue
      }

      const preludeStart = index
      let quote = ''
      let roundDepth = 0
      let squareDepth = 0

      while (index < end) {
        const character = source[index]

        if (quote) {
          if (character === '\\') index += 2
          else {
            if (character === quote) quote = ''
            index += 1
          }
          continue
        }

        if (character === '"' || character === "'") {
          quote = character
          index += 1
          continue
        }

        if (source.startsWith('/*', index)) {
          index = skipComment(source, index)
          continue
        }

        if (character === '(') roundDepth += 1
        if (character === ')') roundDepth -= 1
        if (character === '[') squareDepth += 1
        if (character === ']') squareDepth -= 1

        if (
          roundDepth === 0 &&
          squareDepth === 0 &&
          (character === '{' || character === ';')
        ) {
          break
        }

        index += 1
      }

      const prelude = source.slice(preludeStart, index).trim()
      if (!prelude) {
        index += 1
        continue
      }

      if (source[index] === ';') {
        index += 1
        continue
      }

      if (source[index] !== '{') break

      const openingIndex = index
      const closingIndex = findBlockEnd(source, openingIndex, end)

      if (/^@media\b/i.test(prelude)) {
        const media = {
          prelude,
          start: preludeStart,
          hasMinWidth: /\(\s*min-width\s*:/i.test(prelude),
          hasMaxWidth: /\(\s*max-width\s*:/i.test(prelude),
        }
        mediaQueries.push(media)
        parseRange(openingIndex + 1, closingIndex, [...mediaContext, prelude])
      } else if (!prelude.startsWith('@')) {
        rules.push({
          start: preludeStart,
          selectors: splitSelectors(prelude),
          mediaContext,
        })
      }

      index = closingIndex + 1
    }
  }

  parseRange(0, source.length)
  return { rules, mediaQueries }
}

function normalizeSelector(selector) {
  return selector
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
}

function checkMobileFirst({
  repoRoot,
  filePath,
  source,
  selectors,
  breakpoints,
  violations,
}) {
  const style = extractScopedStyle({ repoRoot, filePath, source, violations })
  if (style === null) return

  const markerCount = count(
    style,
    /\/\* Mobile-first baseline\. Width queries below may only enhance this layout\. \*\//g
  )
  const markerIndex = style.indexOf(MOBILE_FIRST_MARKER)

  if (markerCount !== 1) {
    violations.push(
      `${filePath}: expected exactly one guarded mobile-first baseline marker, found ${markerCount}`
    )
  }

  if (markerIndex !== -1) {
    const authoredBeforeMarker = style
      .slice(0, markerIndex)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim()

    if (authoredBeforeMarker) {
      violations.push(
        `${filePath}: the mobile-first marker must be the first authored style content`
      )
    }
  }

  const { rules, mediaQueries } = parseStyleRules(style)
  const firstMinWidthIndex = mediaQueries
    .filter((media) => media.hasMinWidth)
    .reduce(
      (first, media) => Math.min(first, media.start),
      Number.POSITIVE_INFINITY
    )

  for (const media of mediaQueries.filter((query) => query.hasMaxWidth)) {
    violations.push(
      `${filePath}: max-width media queries are forbidden (${media.prelude})`
    )
  }

  for (const selector of selectors) {
    const normalizedSelector = normalizeSelector(selector)
    const matchingRules = rules.filter((rule) =>
      rule.selectors.some(
        (candidate) => normalizeSelector(candidate) === normalizedSelector
      )
    )
    const baselineRules = matchingRules.filter(
      (rule) =>
        rule.mediaContext.length === 0 &&
        rule.start > markerIndex &&
        rule.start < firstMinWidthIndex
    )

    if (baselineRules.length !== 1) {
      violations.push(
        `${filePath}: ${selector} needs exactly one unconditioned mobile default before the first min-width query (found ${baselineRules.length})`
      )
    }

    if (
      matchingRules.some(
        (rule) =>
          rule.mediaContext.length === 0 && rule.start > firstMinWidthIndex
      )
    ) {
      violations.push(
        `${filePath}: ${selector} has an unconditioned reset after width enhancements`
      )
    }

    const countsByContext = new Map()
    for (const rule of matchingRules) {
      const context = rule.mediaContext.join(' > ') || 'baseline'
      countsByContext.set(context, (countsByContext.get(context) ?? 0) + 1)
    }

    for (const [context, selectorCount] of countsByContext) {
      if (selectorCount > 1) {
        violations.push(
          `${filePath}: ${selector} appears ${selectorCount} times in ${context}; consolidate the selector block`
        )
      }
    }
  }

  for (const breakpoint of breakpoints) {
    const normalizedBreakpoint = breakpoint.replace(/\s+/g, '')
    const hasBreakpoint = mediaQueries.some(
      (media) =>
        media.hasMinWidth &&
        media.prelude
          .replace(/\s+/g, '')
          .includes(`(min-width:${normalizedBreakpoint})`)
    )

    if (!hasBreakpoint) {
      violations.push(
        `${filePath}: missing progressive enhancement breakpoint ${breakpoint}`
      )
    }
  }
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const coreStyle = read(repoRoot, CORE_STYLE_PATH)
  const core = [
    read(repoRoot, CORE_PATH),
    coreStyle,
    read(repoRoot, CORE_IMMERSIVE_STYLE_PATH),
    read(repoRoot, CORE_TOKENS_PATH),
    read(repoRoot, CORE_LANDING_MOTION_PATH),
    read(repoRoot, CORE_LANDING_STICKY_MOTION_PATH),
  ].join('\n')
  const corePackage = read(repoRoot, CORE_PACKAGE_PATH)
  const ecosystemHome = read(repoRoot, CORE_ECOSYSTEM_HOME_PATH)
  const appCollection = read(repoRoot, CORE_APP_COLLECTION_PATH)
  const workspacePreviewFrame = read(repoRoot, CORE_CONSOLE_PREVIEW_FRAME_PATH)
  const cardOrbit = [
    read(repoRoot, CORE_CARD_ORBIT_PATH),
    read(repoRoot, CORE_CARD_ORBIT_GEOMETRY_PATH),
    read(repoRoot, CORE_CARD_ORBIT_POINTER_PATH),
    read(repoRoot, CORE_CARD_ORBIT_STYLE_PATH),
  ].join('\n')
  const cardOrbitType = read(repoRoot, CORE_CARD_ORBIT_TYPE_PATH)
  const productProof = read(repoRoot, CORE_PRODUCT_PROOF_PATH)
  const productHeroImage = read(repoRoot, CORE_PRODUCT_HERO_IMAGE_PATH)
  const productSurface = read(repoRoot, CORE_PRODUCT_SURFACE_PATH)
  const productCatalogue = read(repoRoot, CORE_PRODUCT_CATALOGUE_PATH)
  const productEntryPaths = read(repoRoot, CORE_PRODUCT_ENTRY_PATH)
  const pricingStrip = read(repoRoot, CORE_PRICING_STRIP_PATH)
  const productPricingStrip = read(repoRoot, CORE_PRODUCT_PRICING_STRIP_PATH)
  const productPricingSource = read(repoRoot, CORE_PRODUCT_PRICING_SOURCE_PATH)
  const productPricingIndex = read(repoRoot, CORE_PRODUCT_PRICING_INDEX_PATH)
  const productAppPricingTier = read(repoRoot, CORE_PRODUCT_PRICING_TIER_PATH)
  const operationRail = read(repoRoot, CORE_OPERATION_RAIL_PATH)
  const miseboxPricingStrip = read(repoRoot, MISEBOX_PRICING_STRIP_PATH)
  const fireuxPricingStrip = read(repoRoot, FIREUX_PRICING_STRIP_PATH)
  const productLandingTypes = read(repoRoot, CORE_PRODUCT_LANDING_TYPE_PATH)
  const pricingAppContracts = PRICING_APP_CONTRACTS.map((contract) => ({
    ...contract,
    config: read(repoRoot, contract.configPath),
    composable: read(repoRoot, contract.composablePath),
    index: read(repoRoot, contract.indexPath),
    tier: read(repoRoot, contract.tierPath),
    landing: read(repoRoot, contract.landingPath),
  }))
  const discoveredProductLandingAdapters =
    discoverProductLandingAdapters(repoRoot)
  const alignedMainAppLandings = ALIGNED_MAIN_APP_LANDING_PATHS.map(
    (filePath) => [filePath, read(repoRoot, filePath)]
  )
  const werkboxAdapter = read(repoRoot, WERKBOX_ADAPTER_PATH)
  const werkboxHero = read(repoRoot, WERKBOX_HERO_PATH)
  const slapAdapter = read(repoRoot, SLAP_ADAPTER_PATH)
  const miseboxAdapter = [
    read(repoRoot, MISEBOX_ADAPTER_PATH),
    read(repoRoot, MISEBOX_LANDING_CONTENT_PATH),
  ].join('\n')
  const miseboxHero = read(repoRoot, MISEBOX_HERO_PATH)
  const miseboxPage = read(repoRoot, MISEBOX_PAGE_PATH)
  const miseboxCardWindow = read(repoRoot, MISEBOX_CARD_WINDOW_PATH)
  const miseboxPowerCards = read(repoRoot, MISEBOX_POWER_CARDS_PATH)
  const miseboxPowerCardsDemo = read(repoRoot, MISEBOX_POWER_CARDS_DEMO_PATH)
  const miseboxPowerCardEight = read(repoRoot, MISEBOX_POWER_CARD_EIGHT_PATH)
  const miseboxHandoffPreview = [
    read(repoRoot, MISEBOX_HANDOFF_PREVIEW_PATH),
    read(repoRoot, MISEBOX_HANDOFF_PREVIEW_STYLE_PATH),
    read(repoRoot, MISEBOX_HANDOFF_STAGE_PATH),
    read(repoRoot, MISEBOX_HANDOFF_STAGE_STYLE_PATH),
  ].join('\n')
  const miseboxOrderingPreview = read(repoRoot, MISEBOX_ORDERING_PREVIEW_PATH)
  const miseboxOrderingShowcase = read(repoRoot, MISEBOX_ORDERING_SHOWCASE_PATH)
  const miseboxOrderingTool = read(repoRoot, MISEBOX_ORDERING_TOOL_PATH)
  const miseboxOrderingToolContract = read(
    repoRoot,
    MISEBOX_ORDERING_TOOL_CONTRACT_PATH
  )
  const miseboxFinancePreview = read(repoRoot, MISEBOX_FINANCE_PREVIEW_PATH)
  const miseboxWorkspacePreview = read(repoRoot, MISEBOX_CONSOLE_PREVIEW_PATH)
  const kitchenMiseBoard = read(repoRoot, KITCHEN_MISE_BOARD_PATH)
  const kitchenMiseCollection = read(repoRoot, KITCHEN_MISE_COLLECTION_PATH)
  const kitchenMiseWorkspaceRead = read(
    repoRoot,
    KITCHEN_MISE_CONSOLE_READ_PATH
  )
  const kitchenMisePresentation = read(repoRoot, KITCHEN_MISE_PRESENTATION_PATH)
  const miseboxWorkspacePreviewComponents = Object.fromEntries(
    Object.entries(MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [key, read(repoRoot, filePath)]
    )
  )
  const miseboxMeta = [
    read(repoRoot, MISEBOX_META_PATH),
    read(repoRoot, MISEBOX_META_SOURCE_PATH),
  ].join('\n')
  const miseboxJobsMiddleware = read(repoRoot, MISEBOX_JOBS_MIDDLEWARE_PATH)
  const miseboxJobsLayout = read(repoRoot, MISEBOX_JOBS_LAYOUT_PATH)
  const miseboxSuppliersMiddleware = read(
    repoRoot,
    MISEBOX_SUPPLIERS_MIDDLEWARE_PATH
  )
  const fireuxAdapter = read(repoRoot, FIREUX_ADAPTER_PATH)
  const fireuxPage = read(repoRoot, FIREUX_PAGE_PATH)
  const fireuxMeta = read(repoRoot, FIREUX_META_PATH)
  const fireuxWorkspacePreview = read(repoRoot, FIREUX_CONSOLE_PREVIEW_PATH)
  const fireuxSurfaceShowcase = read(repoRoot, FIREUX_SURFACE_SHOWCASE_PATH)
  const fireuxProductDemo = read(repoRoot, FIREUX_PRODUCT_DEMO_PATH)
  const fireuxWorkspacePreviewComponents = Object.fromEntries(
    Object.entries(FIREUX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [key, read(repoRoot, filePath)]
    )
  )
  const fireuxCardOrbit = read(repoRoot, FIREUX_CARD_ORBIT_PATH)
  const fireuxEcosystems = read(repoRoot, FIREUX_ECOSYSTEMS_PATH)
  const violations = []

  if (
    !/import CoreLandingPricingStrip from ['"]\.\/PricingStrip\.vue['"]/.test(
      productPricingStrip
    )
  ) {
    violations.push(
      `${CORE_PRODUCT_PRICING_STRIP_PATH}: Core pricing composition must import its Core primitive explicitly`
    )
  }
  if (/<LandingPricingStrip\b/.test(productPricingStrip)) {
    violations.push(
      `${CORE_PRODUCT_PRICING_STRIP_PATH}: auto-imported LandingPricingStrip can recurse into an App adapter`
    )
  }

  for (const [filePath, source] of [
    [MISEBOX_PAGE_PATH, miseboxPage],
    [FIREUX_PAGE_PATH, fireuxPage],
  ]) {
    if (!/^<template\b[^>]*>\s*<(?:div|main|section|article)\b/m.test(source)) {
      violations.push(
        `${filePath}: shared page transition requires one real root DOM element`
      )
    }
  }

  checkMobileFirst({
    repoRoot,
    filePath: CORE_PATH,
    source: core,
    selectors: [
      '.landing-product',
      '.landing-product__hero',
      '.landing-product__hero-actions',
      '.landing-product__region',
    ],
    breakpoints: ['640px', '768px', '1024px'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_CONSOLE_PREVIEW_FRAME_PATH,
    source: workspacePreviewFrame,
    selectors: ['.landing-workspace-preview__layout'],
    breakpoints: [],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_APP_COLLECTION_PATH,
    source: appCollection,
    selectors: [
      '.landing-app-collection__heading',
      '.landing-app-collection__rail',
      '.landing-app-collection__card',
    ],
    breakpoints: ['640px', '768px', '1024px'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_CARD_ORBIT_PATH,
    source: cardOrbit,
    selectors: [
      '.landing-card-orbit',
      '.landing-card-orbit__sphere',
      '.landing-card-orbit__item',
    ],
    breakpoints: ['48rem'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_PRODUCT_PROOF_PATH,
    source: productProof,
    selectors: [
      '.landing-product-proof',
      '.landing-product-proof__surface',
      '.landing-product-proof__copy',
      '.landing-product-proof__items',
    ],
    breakpoints: ['640px', '1024px'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_PRODUCT_CATALOGUE_PATH,
    source: productCatalogue,
    selectors: [
      '.landing-product-catalogue',
      '.landing-product-catalogue__heading',
      '.landing-product-catalogue__grid',
      '.landing-product-catalogue__card',
    ],
    breakpoints: ['640px', '768px', '1024px'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: CORE_PRODUCT_ENTRY_PATH,
    source: productEntryPaths,
    selectors: [
      '.landing-product-entry-paths',
      '.landing-product-entry-paths__heading',
      '.landing-product-entry-paths__grid',
      '.landing-product-entry-paths__tool',
    ],
    breakpoints: ['640px'],
    violations,
  })

  checkMobileFirst({
    repoRoot,
    filePath: MISEBOX_HANDOFF_STAGE_PATH,
    source: read(repoRoot, MISEBOX_HANDOFF_STAGE_PATH),
    selectors: ['.misebox-handoff__stage', '.misebox-handoff__connection'],
    breakpoints: ['48rem'],
    violations,
  })

  for (const slotName of ['hero-preview', 'onboarding']) {
    const slotCount = count(
      core,
      new RegExp(`<slot\\s+name=["']${slotName}["']`, 'g')
    )
    if (slotCount !== 1) {
      violations.push(
        `${CORE_PATH}: expected exactly one ${slotName} slot, found ${slotCount}`
      )
    }
  }

  const landingRegions = [
    'surfaces',
    'workspace',
    'specifics',
    'ecosystems',
    'apps',
    'tools',
    'solutions',
    'operations',
  ]
  for (const region of landingRegions) {
    if (!core.includes(`| '${region}'`)) {
      violations.push(
        `${CORE_PATH}: configurable landing region is missing ${region}`
      )
    }
  }
  for (const required of [
    'regionOrder?: readonly LandingProductRegion[]',
    'v-for="region in regionOrder"',
    '<slot :name="region" />',
    'ref="heroHeading"',
    'ref="heroPreview"',
    'new ResizeObserver(syncHeroOverlap)',
    'heading.getBoundingClientRect()',
    'preview.getBoundingClientRect()',
    "window.addEventListener('resize', syncHeroOverlap",
    "window.removeEventListener('resize', syncHeroOverlap)",
    "'--landing-hero-overlap-width'",
    'Math.min(128, Math.max(80, window.innerWidth * 0.07))',
    'Math.min(192, Math.max(112, window.innerWidth * 0.1))',
    'const blurWidth = hasOverlap ? overlapWidth + feather : fallback',
  ]) {
    if (!core.includes(required)) {
      violations.push(
        `${CORE_PATH}: missing configurable landing-region contract (${required})`
      )
    }
  }

  if (!core.includes('<slot name="onboarding" />')) {
    violations.push(
      `${CORE_PATH}: must expose the shared Main App onboarding entry slot`
    )
  }

  if (
    core.includes('onboardingLabel') ||
    productLandingTypes.includes('onboardingLabel')
  ) {
    violations.push(
      `${CORE_PATH}: stale onboarding-label fallback remains after the shared entry contract migration`
    )
  }

  for (const forbidden of [
    'landing-product__hero-glow',
    '<UDivider',
    'landing-product__divider',
  ]) {
    if (core.includes(forbidden)) {
      violations.push(
        `${CORE_PATH}: reintroduced decorative hero or onboarding chrome (${forbidden})`
      )
    }
  }

  if (/<main\b/.test(core)) {
    violations.push(
      `${CORE_PATH}: must not nest another main landmark inside the landing layout`
    )
  }

  for (const forbidden of ['Misebox', 'fireux-kitchens', "'/demo", '"/demo']) {
    if (core.includes(forbidden)) {
      violations.push(
        `${CORE_PATH}: contains project-owned truth (${forbidden})`
      )
    }
  }

  const flatLandingSources = [
    [CORE_PATH, core],
    [CORE_APP_COLLECTION_PATH, appCollection],
    [CORE_CONSOLE_PREVIEW_FRAME_PATH, workspacePreviewFrame],
    [CORE_CARD_ORBIT_PATH, cardOrbit],
    [CORE_PRODUCT_PROOF_PATH, productProof],
    [CORE_PRODUCT_SURFACE_PATH, productSurface],
    [CORE_PRODUCT_CATALOGUE_PATH, productCatalogue],
    [CORE_PRODUCT_ENTRY_PATH, productEntryPaths],
    [CORE_PRICING_STRIP_PATH, pricingStrip],
    [CORE_OPERATION_RAIL_PATH, operationRail],
    [MISEBOX_ADAPTER_PATH, miseboxAdapter],
    [MISEBOX_CARD_WINDOW_PATH, miseboxCardWindow],
    [MISEBOX_POWER_CARDS_PATH, miseboxPowerCards],
    [MISEBOX_HANDOFF_PREVIEW_PATH, miseboxHandoffPreview],
    [MISEBOX_CONSOLE_PREVIEW_PATH, miseboxWorkspacePreview],
    [MISEBOX_ORDERING_PREVIEW_PATH, miseboxOrderingPreview],
    [MISEBOX_ORDERING_SHOWCASE_PATH, miseboxOrderingShowcase],
    [MISEBOX_FINANCE_PREVIEW_PATH, miseboxFinancePreview],
    ...Object.entries(MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [filePath, miseboxWorkspacePreviewComponents[key]]
    ),
    [FIREUX_ADAPTER_PATH, fireuxAdapter],
    [FIREUX_CONSOLE_PREVIEW_PATH, fireuxWorkspacePreview],
    [FIREUX_SURFACE_SHOWCASE_PATH, fireuxSurfaceShowcase],
    [FIREUX_PRODUCT_DEMO_PATH, fireuxProductDemo],
    ...Object.entries(FIREUX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [filePath, fireuxWorkspacePreviewComponents[key]]
    ),
    [FIREUX_CARD_ORBIT_PATH, fireuxCardOrbit],
    [FIREUX_ECOSYSTEMS_PATH, fireuxEcosystems],
  ]

  for (const [filePath, source] of flatLandingSources) {
    if (
      /\bbg-gradient-|\bbackdrop-blur-|(?:linear|radial|conic)-gradient\(/i.test(
        source
      )
    ) {
      violations.push(
        `${filePath}: active landing presentation must remain flat without decorative gradients or glass blur`
      )
    }
  }

  for (const required of [
    'class="landing-product-proof"',
    "'landing-product-proof--reverse': reverse",
    ":data-landing-reveal=\"reverse ? 'right' : 'left'\"",
    ":data-landing-reveal=\"reverse ? 'left' : 'right'\"",
    '<slot />',
    '<UButton',
    'LandingProductAction',
  ]) {
    if (!productProof.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_PROOF_PATH}: missing shared product-proof contract (${required})`
      )
    }
  }

  for (const required of [
    'LandingPricingPlan',
    ':aria-label="ariaLabel"',
    'data-landing-reveal="up"',
    'v-for="plan in plans"',
  ]) {
    if (!pricingStrip.includes(required)) {
      violations.push(
        `${CORE_PRICING_STRIP_PATH}: missing shared subscription-strip contract (${required})`
      )
    }
  }

  if (pricingStrip.includes('Monthly subscriptions')) {
    violations.push(
      `${CORE_PRICING_STRIP_PATH}: shared pricing strip must keep its label semantic rather than visible`
    )
  }

  for (const [filePath, source] of [
    [MISEBOX_PRICING_STRIP_PATH, miseboxPricingStrip],
    [FIREUX_PRICING_STRIP_PATH, fireuxPricingStrip],
  ]) {
    if (!source.includes('<LandingProductPricingStrip')) {
      violations.push(
        `${filePath}: Main App pricing adapter must consume the canonical product pricing strip`
      )
    }
  }

  for (const required of [
    "id: 'free'",
    "id: 'professional'",
    "id: 'business'",
    "id: 'managed'",
    "id: 'your-app'",
    "id: 'your-ecosystem'",
    'professionalEntityMonthly: 20',
    'businessMonthly: 100',
    'managedMonthly: 100',
    'appSetup: 600',
    'appAdditionalEntitySetup: 100',
    'appEntityMonthly: 50',
    'includesManaged?: boolean',
    'includesEcosystemTier?: boolean',
    'profile.includesEcosystemTier === true',
    '50% customer App revenue share',
  ]) {
    if (!productPricingSource.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_PRICING_SOURCE_PATH}: missing canonical pricing contract (${required})`
      )
    }
  }

  for (const required of ['LandingPricingStrip', 'props.plans']) {
    if (!productPricingStrip.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_PRICING_STRIP_PATH}: missing shared product pricing adapter (${required})`
      )
    }
  }

  for (const [filePath, source] of [
    [CORE_PRODUCT_PRICING_INDEX_PATH, productPricingIndex],
    [CORE_PRODUCT_PRICING_TIER_PATH, productAppPricingTier],
    [CORE_PRODUCT_PRICING_STRIP_PATH, productPricingStrip],
  ]) {
    for (const forbidden of [
      'usePricing(',
      'useFireUXConfig(',
      'runtimeConfig',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: shared pricing presentation must receive App-owned pricing data (${forbidden})`
        )
      }
    }
  }

  for (const contract of pricingAppContracts) {
    if (/\bpricing\s*:/.test(contract.config)) {
      violations.push(
        `${contract.configPath}: ${contract.name} pricing literature belongs in ${contract.composablePath}, not App config`
      )
    }

    for (const required of [
      'type PricingProfile',
      'satisfies PricingProfile',
      `export function ${contract.composableName}()`,
      'usePricing(',
    ]) {
      if (!contract.composable.includes(required)) {
        violations.push(
          `${contract.composablePath}: missing App-owned pricing contract (${required})`
        )
      }
    }

    for (const [filePath, source] of [
      [contract.indexPath, contract.index],
      [contract.tierPath, contract.tier],
      [contract.landingPath, contract.landing],
    ]) {
      if (!source.includes(`${contract.composableName}()`)) {
        violations.push(
          `${filePath}: ${contract.name} pricing surface must use ${contract.composableName}()`
        )
      }
    }

    if (contract.name === 'Misebox') {
      for (const required of [
        "entityName: 'Kitchen'",
        'professional:',
        'return usePricing(miseboxPricingProfile)',
      ]) {
        if (!contract.composable.includes(required)) {
          violations.push(
            `${contract.composablePath}: Misebox pricing must use the shared pre-designed Kitchen pricing (${required})`
          )
        }
      }
    }

    if (contract.name === 'FireUX') {
      for (const required of [
        "entityName: 'Project'",
        'includesManaged: false',
        'includesEcosystemTier: true',
      ]) {
        if (!contract.composable.includes(required)) {
          violations.push(
            `${contract.composablePath}: FireUX pricing must keep Project, no-Managed, and ecosystem offer policy (${required})`
          )
        }
      }
    }
  }

  for (const required of [
    'data-landing-motion-entity="app"',
    'data-landing-motion-entity="ecosystem"',
  ]) {
    if (!fireuxCardOrbit.includes(required)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: missing FireUX transition participant (${required})`
      )
    }
  }

  for (const required of [
    'class="landing-product-catalogue"',
    ':aria-labelledby="content.sectionId"',
    'data-landing-reveal="up"',
    'v-for="item in content.items"',
    '<UPageCard',
    ':to="item.to"',
    'LandingProductCatalogueContent',
  ]) {
    if (!productCatalogue.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_CATALOGUE_PATH}: missing shared product-catalogue contract (${required})`
      )
    }
  }

  for (const required of [
    'class="landing-product-entry-paths"',
    ':aria-labelledby="content.sectionId"',
    'data-landing-reveal="up"',
    'v-for="path in content.paths"',
    "path.kind === 'start'",
    ':data-entry-path="path.kind"',
    '<UPageCard',
    'v-if="content.tool"',
    '<UButton',
    'LandingProductEntryContent',
  ]) {
    if (!productEntryPaths.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_ENTRY_PATH}: missing shared start-or-join entry contract (${required})`
      )
    }
  }

  for (const required of [
    "export type LandingProductEntryPathKind = 'start' | 'join'",
    "LandingProductEntryPath<'start'>",
    "LandingProductEntryPath<'join'>",
    'paths: readonly [',
    'tool?: LandingProductEntryDoorway',
  ]) {
    if (!productLandingTypes.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_LANDING_TYPE_PATH}: missing typed start-or-join entry contract (${required})`
      )
    }
  }

  for (const required of [
    'AppCollectionController',
    '<UPageCard',
    'App',
    "app.status === 'active'",
    'minimumItems',
    'shouldRender',
    'portableMediaUrl',
  ]) {
    if (!appCollection.includes(required)) {
      violations.push(
        `${CORE_APP_COLLECTION_PATH}: missing public App collection contract (${required})`
      )
    }
  }

  for (const required of [
    'useApps',
    'eligibleApps',
    'eligibleApps.value.length > 1',
    ':exclude-ids="[appId]"',
    ':minimum-items="2"',
    ':title="`${appName}\'s Apps`"',
  ]) {
    if (!ecosystemHome.includes(required)) {
      violations.push(
        `${CORE_ECOSYSTEM_HOME_PATH}: missing conditional ecosystem App collection contract (${required})`
      )
    }
  }

  for (const forbidden of [
    'getFirestore',
    'collection(',
    'getDocs(',
    'ecosystem_id',
    'Misebox',
  ]) {
    if (appCollection.includes(forbidden)) {
      violations.push(
        `${CORE_APP_COLLECTION_PATH}: bypasses public App projection or owns project truth (${forbidden})`
      )
    }
  }

  for (const required of [
    "from 'fireux-kitchens/runtime/kitchen/models/operations'",
    '<LandingWorkspacePreviewFrame',
    'label="Interactive Kitchen Workspace preview"',
    ':items="operations"',
    'navigation-label="Kitchen Operations"',
    'workspace-to="/"',
    '@update:model-value="selectSurface"',
    '@open-workspace="openFullKitchenWorkspace"',
    '<UAvatar',
    ':src="workspaceKitchenPill.imageUrl || undefined"',
    ':alt="workspaceKitchenPill.title"',
    "MiseboxProductDemo['workspace']['kitchenPill']",
    'productDemo.value?.workspace.kitchenPill',
    'size="md"',
    "selectedSurface?.id === 'kitchen.finance'",
    'useKitchenWorkspaceSelection',
    "type: 'demo'",
    "await navigateTo('/')",
    "const selectedDishId = ref('')",
    "const selectedDishPage = ref<DishChildPage>('detail')",
    '<LandingWorkspacePreviewMenus',
    ':menus="productDemo?.workspace.menus || []"',
    '<LandingWorkspacePreviewDishes',
    ':dishes="previewDishes"',
    "dish.kind !== 'Drink'",
    '<LandingWorkspacePreviewIngredients',
    ':ingredients="productDemo?.workspace.ingredients || []"',
    '<LandingWorkspacePreviewRecipes',
    ':recipes="productDemo?.workspace.recipes || []"',
    '<LandingWorkspacePreviewMise',
    ':kitchen-name="productDemo?.workspace.kitchenName || \'\'"',
    ':tasks="workspaceMiseTasks"',
    'useKitchenMenuServiceSelection',
    'hasInServiceMenu',
    '<LandingWorkspacePreviewOrders',
    ':orders="productDemo?.workspace.orders || []"',
    '<LandingWorkspacePreviewStations',
    ':stations="productDemo?.workspace.stations || []"',
    '<LandingWorkspacePreviewSuppliers',
    ':suppliers="productDemo?.workspace.suppliers || []"',
    '<LandingWorkspacePreviewFinance',
    ':finance="productDemo?.workspace.finance || emptyFinance"',
    '<LandingWorkspacePreviewEmptyCanvas',
  ]) {
    if (!miseboxWorkspacePreview.includes(required)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: missing local canonical Workspace navigation (${required})`
      )
    }
  }

  if (count(miseboxWorkspacePreview, /useMiseboxProductDemo\(/g) !== 1) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_PATH}: root must own exactly one Product Demo load`
    )
  }

  for (const forbidden of [
    'Build spec',
    'aria-label="Dish detail sections"',
    'workspace-preview-menus',
    'workspace-preview-dishes',
    'selectedDishSection',
    '<WorkspaceKitchenDishesCardsCell',
  ]) {
    if (miseboxWorkspacePreview.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: thin root re-owned operation presentation (${forbidden})`
      )
    }
  }

  const componentContracts = {
    menus: [
      'aria-label="Menus preview"',
      'workspace-preview-menus',
      '{{ menu.name }}',
      ':src="menu.imageUrl"',
    ],
    ingredients: [
      'aria-label="Ingredients preview"',
      "MiseboxProductDemo['workspace']['ingredients'][number]",
      'INGREDIENT_FOOD_GROUP_OPTIONS',
      ':default-value="defaultOpenFoodGroups"',
      ':data-food-group="item.value"',
      'ingredient.foodGroup === option.value',
      ':src="ingredient.imageUrl"',
      '{{ ingredient.name }}',
    ],
    dishes: [
      'aria-label="Dish preview breadcrumb"',
      '<LandingWorkspacePreviewDishesDetail',
      '<LandingWorkspacePreviewDishesDetailSections',
      ':selected="page"',
      '<LandingWorkspacePreviewDishesCollection',
      '<LandingWorkspacePreviewDishesFinance',
      '<LandingWorkspacePreviewDishesSpec',
      '<LandingWorkspacePreviewDishesPrepItems',
      '<LandingWorkspacePreviewDishesRecipes',
      '<LandingWorkspacePreviewDishesMise',
    ],
    dishCollection: [
      '<WorkspaceKitchenDishesCardsCell',
      'workspace-preview-dishes',
      '@action="$emit(\'select\', dish.id)"',
    ],
    dishDetail: ['Build spec', 'min-h-[20rem]', '{{ dish.priceLabel }}'],
    dishDetailSections: [
      'aria-label="Dish detail sections"',
      ':src="dish.imageUrl"',
      'alt=""',
      'bg-default/40',
      ':aria-label="section.label"',
      ':aria-current="section.id === selected ? \'page\' : undefined"',
      '@click="$emit(\'select\', section.id)"',
      "id: 'detail' as const",
      "icon: 'i-lucide-info'",
      "id: 'finance' as const",
      "id: 'spec' as const",
      "id: 'prep' as const",
      "id: 'recipes' as const",
      "id: 'mise' as const",
    ],
    dishFinance: [
      'aria-label="Dish Finance preview"',
      'Selling price',
      'Quantity sold',
      'Total sales',
      'Cost of sales',
      'Gross profit',
      'Food cost',
      'Gross margin',
    ],
    dishSpec: ['aria-label="Dish Spec preview"', 'dish.spec.assembly'],
    dishPrepItems: ['aria-label="Dish Prep items preview"', 'dish.prepItems'],
    dishRecipes: ['aria-label="Dish Recipes preview"', 'dish.recipes'],
    dishMise: ['aria-label="Dish Mise en place preview"', 'dish.mise'],
    recipes: [
      'aria-label="Recipes preview"',
      "MiseboxProductDemo['workspace']['recipes'][number]",
    ],
    mise: [
      'aria-label="Mise en place preview"',
      '<KitchenMiseTaskCollection',
      ':tasks="tasks"',
      ':kitchen-name="kitchenName"',
      'ProductDemoMiseTask',
      "MiseboxProductDemo['workspace']['miseTasks'][number]",
    ],
    orders: [
      'aria-label="Orders preview"',
      '<WorkspaceKitchenOrdersRail',
      '<WorkspaceKitchenOrdersTicketPresentation',
      'deriveKitchenOrderBoardStage',
      ':interactive="false"',
      'ProductDemoOrder',
      "MiseboxProductDemo['workspace']['orders'][number]",
    ],
    stations: [
      'aria-label="Stations preview"',
      ':data-station-id="station.id"',
      "MiseboxProductDemo['workspace']['stations'][number]",
    ],
    suppliers: [
      'aria-label="Suppliers preview"',
      '<WorkspaceKitchenSuppliersCardsCell',
      ':data-supplier-id="supplier.id"',
      'supplier.linkedIngredientCount',
      "MiseboxProductDemo['workspace']['suppliers'][number]",
    ],
    finance: [
      'aria-label="Kitchen Finance preview"',
      'aria-label="Finance period"',
      '<KitchenFinanceSummary',
      ':gross-sales-minor="selectedSummary.grossSalesMinor"',
      ':sale-count="selectedSummary.saleCount"',
      ':average-sale-minor="selectedSummary.averageSaleMinor"',
      'KitchenFinanceReportPeriod',
      "MiseboxProductDemo['workspace']['finance']",
    ],
    emptyCanvas: [':aria-label="`${title} page canvas`"', 'min-h-[20rem]'],
  }
  for (const [key, requiredMarkers] of Object.entries(componentContracts)) {
    const source = miseboxWorkspacePreviewComponents[key]
    const filePath = MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]
    for (const required of requiredMarkers) {
      if (!source.includes(required)) {
        violations.push(
          `${filePath}: missing owned Workspace preview contract (${required})`
        )
      }
    }
  }

  for (const key of ['menus', 'dishCollection', 'ingredients', 'recipes']) {
    const source = miseboxWorkspacePreviewComponents[key]
    const filePath = MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]
    for (const forbidden of [
      '<USwitch',
      "emit('toggle'",
      'In service',
      'Order-led',
      'Include in today’s prep',
      'data-service-state',
      'opacity-45',
      'saturate-50',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: mini preview acquired operational availability presentation (${forbidden})`
        )
      }
    }
  }

  for (const [key, forbidden] of [
    ['dishCollection', ':meta="dish.kind"'],
    ['dishDetail', 'dish.kind'],
  ]) {
    if (miseboxWorkspacePreviewComponents[key].includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]}: entry preview exposed Dish type vocabulary (${forbidden})`
      )
    }
  }

  if (
    miseboxWorkspacePreviewComponents.dishDetailSections.includes(
      '{{ section.label }}'
    )
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.dishDetailSections}: Dish page selector exposed visible text labels instead of icon-only controls`
    )
  }

  if (
    miseboxWorkspacePreviewComponents.dishDetail.includes(
      ':src="dish.imageUrl"'
    )
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.dishDetail}: Dish image belongs to the persistent page selector rather than the swappable overview`
    )
  }

  for (const [key, source] of Object.entries(
    miseboxWorkspacePreviewComponents
  )) {
    const filePath = MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]
    for (const forbidden of [
      'useMiseboxProductDemo(',
      'useKitchenWorkspace',
      'useWorkspaceSelection',
      'useFirestore',
      'firebase',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: child acquired data or live Workspace authority (${forbidden})`
        )
      }
    }
  }

  if (
    miseboxWorkspacePreviewComponents.mise.includes(
      'KITCHEN_MISE_STATUS_OPTIONS'
    )
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.mise}: must consume the Kitchen-owned Mise task board instead of rebuilding status presentation`
    )
  }

  for (const forbidden of ['<KitchenMiseTaskBoard', 'compact']) {
    if (miseboxWorkspacePreviewComponents.mise.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.mise}: bypasses the shared Workspace Mise collection presentation (${forbidden})`
      )
    }
  }

  for (const forbidden of [
    '@touch-status',
    'updateStatus(',
    'useKitchenOrdersWorkspace',
  ]) {
    if (miseboxWorkspacePreviewComponents.orders.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.orders}: read-only Workspace preview acquired Order mutation behavior (${forbidden})`
      )
    }
  }

  for (const [filePath, source, requiredMarkers] of [
    [
      KITCHEN_MISE_COLLECTION_PATH,
      kitchenMiseCollection,
      [
        '<KitchenMiseTaskBoard',
        'activeTaskCount',
        'organised in the order a chef works.',
      ],
    ],
    [
      KITCHEN_MISE_BOARD_PATH,
      kitchenMiseBoard,
      [
        'groupKitchenMiseTaskSummariesByWorkflow',
        ':data-mise-workflow-stage="group.value"',
        ':data-mise-status="task.status"',
        ':data-mise-task-id="task.id"',
        'task.checklist',
        '<MoleculesActionSurface',
      ],
    ],
    [
      KITCHEN_MISE_CONSOLE_READ_PATH,
      kitchenMiseWorkspaceRead,
      [
        '<KitchenMiseTaskCollection',
        'projectKitchenMiseTasks',
        'useKitchenMiseWorkspace',
      ],
    ],
    [
      KITCHEN_MISE_PRESENTATION_PATH,
      kitchenMisePresentation,
      [
        'KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS',
        'projectKitchenMiseTask',
        'groupKitchenMiseTaskSummariesByWorkflow',
        'workflowStage',
        'checklistDoneCount',
        'stationNames',
      ],
    ],
  ]) {
    for (const marker of requiredMarkers) {
      if (!source.includes(marker)) {
        violations.push(
          `${filePath}: missing shared Kitchen Mise presentation contract (${marker})`
        )
      }
    }
  }

  for (const forbidden of [
    'useWorkspaceSelection',
    'useKitchenWorkspaceOverview',
    'useFirestore',
    'firebase',
    '{{ selectedOperation.description }}',
    ':to="selectedOperation.to"',
  ]) {
    if (miseboxWorkspacePreview.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: public Workspace preview acquired live authority (${forbidden})`
      )
    }
  }

  for (const required of [
    '<UCard',
    'class="landing-workspace-preview__layout"',
    '<slot name="target"',
    'v-for="item in items"',
    'v-for="item in secondaryItems"',
    ':aria-current="item.id === modelValue ? \'page\' : undefined"',
    "emit('update:modelValue'",
    "emit('openWorkspace'",
    '<slot :selected-item="selectedItem"',
    'LandingWorkspacePreviewItem',
    "openWorkspaceAriaLabel: 'Open full Workspace'",
    'grid-template-columns: calc(var(--spacing) * 14) minmax(0, 1fr)',
  ]) {
    if (!workspacePreviewFrame.includes(required)) {
      violations.push(
        `${CORE_CONSOLE_PREVIEW_FRAME_PATH}: missing shared Workspace frame contract (${required})`
      )
    }
  }

  for (const forbidden of [
    'Misebox',
    'FireUX',
    'KitchenCards',
    'ProjectCards',
    'useMiseboxProductDemo',
    'useFireuxProductDemo',
    'glow?:',
    'markHalo?:',
    'strongShadow?:',
    'gradient',
    'backdrop-blur',
  ]) {
    if (workspacePreviewFrame.includes(forbidden)) {
      violations.push(
        `${CORE_CONSOLE_PREVIEW_FRAME_PATH}: acquired project truth or decorative Workspace chrome (${forbidden})`
      )
    }
  }

  for (const consumer of [
    [MISEBOX_CONSOLE_PREVIEW_PATH, miseboxWorkspacePreview],
    [FIREUX_CONSOLE_PREVIEW_PATH, fireuxWorkspacePreview],
  ]) {
    const [filePath, source] = consumer
    if (
      count(source, /<LandingWorkspacePreviewFrame\b/g) !== 1 ||
      count(source, /<\/LandingWorkspacePreviewFrame>/g) !== 1
    ) {
      violations.push(
        `${filePath}: must consume exactly one shared LandingWorkspacePreviewFrame`
      )
    }

    for (const forbidden of [
      '<UCard',
      '<aside',
      'landing-workspace-preview__',
      'min-h-[32rem]',
      'grid-cols-[4.5rem',
      'sm:grid-cols-[12rem',
      ':aria-current=',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: reintroduced shared Workspace frame presentation (${forbidden})`
        )
      }
    }
  }

  for (const required of [
    '<LandingWorkspacePreviewFrame',
    'label="Interactive Project Workspace preview"',
    ':items="operations"',
    'navigation-label="Project Workspace"',
    'workspace-to="/workspace/project"',
    'open-workspace-aria-label="Open the full Project Workspace"',
    '<UAvatar',
    'v-if="projectPill"',
    '<LandingWorkspacePreviewApps',
    '<LandingWorkspacePreviewEcosystems',
    '<LandingWorkspacePreviewPrivateState',
    'useFireuxProductDemo',
    'useProjectWorkspaceSelection',
    "type: 'demo'",
    'if (projectId)',
    "await navigateTo('/workspace/project')",
  ]) {
    if (!fireuxWorkspacePreview.includes(required)) {
      violations.push(
        `${FIREUX_CONSOLE_PREVIEW_PATH}: missing FireUX Project Workspace proof contract (${required})`
      )
    }
  }

  for (const forbidden of [
    "'fireux-demo-project'",
    "'FireUX Demo Project'",
    'useFirestore',
    'firebase',
    'getFirestore',
    'collection(',
    'getDocs(',
    'useFetch(',
    'useRequestFetch(',
    '$fetch(',
    '/api/',
    'usePlatformDirectory',
  ]) {
    if (fireuxWorkspacePreview.includes(forbidden)) {
      violations.push(
        `${FIREUX_CONSOLE_PREVIEW_PATH}: acquired shadow Demo identity or live authority (${forbidden})`
      )
    }
  }

  if (count(fireuxWorkspacePreview, /useFireuxProductDemo\(\)/g) !== 1) {
    violations.push(
      `${FIREUX_CONSOLE_PREVIEW_PATH}: root must own exactly one Product Demo load`
    )
  }

  for (const required of [
    "const productDemoSurface = 'project-workspace' as const",
    "const productDemoDataSource = 'demo' as const",
    "import(\n        'fireux-core/runtime/project/demo/scenarios'",
    "scenario => scenario.appId === 'fireux-app'",
    'fireuxScenarios.length !== 1',
    'useProjectInterface',
    'useAppInterface',
    'useEcosystemInterface',
    'projectPill(project)',
    'appCell(app)',
    'ecosystemCell({',
  ]) {
    if (!fireuxProductDemo.includes(required)) {
      violations.push(
        `${FIREUX_PRODUCT_DEMO_PATH}: missing deterministic Project Product Demo projection (${required})`
      )
    }
  }

  for (const forbidden of [
    'useFirestore',
    'firebase',
    'getFirestore',
    'collection(',
    'getDocs(',
    'useFetch(',
    'useRequestFetch(',
    '$fetch(',
    '/api/',
    'usePlatformDirectory',
    "dataSource: 'live'",
  ]) {
    if (fireuxProductDemo.includes(forbidden)) {
      violations.push(
        `${FIREUX_PRODUCT_DEMO_PATH}: Product Demo adapter acquired live authority (${forbidden})`
      )
    }
  }

  const fireuxPreviewComponentContracts = {
    apps: ['<AppCardsCell', "FireuxProductDemo['workspace']['apps']"],
    ecosystems: [
      '<EcosystemCardsCell',
      "FireuxProductDemo['workspace']['ecosystems']",
    ],
    privateState: ['<UAlert', ':title="title"', ':description="description"'],
  }
  for (const [key, markers] of Object.entries(
    fireuxPreviewComponentContracts
  )) {
    const componentSource = fireuxWorkspacePreviewComponents[key]
    for (const marker of markers) {
      if (!componentSource.includes(marker)) {
        violations.push(
          `${FIREUX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]}: missing FireUX-owned Workspace body contract (${marker})`
        )
      }
    }

    for (const forbidden of [
      'useFireuxProductDemo(',
      'useAsyncData',
      'useFetch(',
      'useRequestFetch(',
      '$fetch(',
      '/api/',
      'useProjectWorkspaceSelection',
      'useWorkspaceSelection',
      'useFirestore',
      'firebase',
    ]) {
      if (componentSource.includes(forbidden)) {
        violations.push(
          `${FIREUX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]}: prop-only Workspace body acquired loading, selection, or live authority (${forbidden})`
        )
      }
    }
  }

  if (discoveredProductLandingAdapters.length === 0) {
    violations.push(
      `${PROJECTS_PATH}: no Main App LandingProductIndex adapter was discovered`
    )
  }

  for (const [filePath, source] of alignedMainAppLandings) {
    if (!source.includes('<LandingEcosystemHome')) {
      violations.push(
        `${filePath}: aligned Main App landing must consume LandingEcosystemHome`
      )
    }
    if (!source.includes(':surface-items="surfaceItems"')) {
      violations.push(
        `${filePath}: aligned Main App landing must supply its source-backed product surfaces`
      )
    }
    const heroImageMatch = source.match(
      /hero-image="(\/img\/landing\/[^"\s]+\.png)"/
    )
    if (!heroImageMatch) {
      violations.push(
        `${filePath}: static Main App hero must use reviewed people-at-work photography under /img/landing`
      )
    } else {
      const projectRoot = filePath.slice(0, filePath.indexOf('/app/'))
      if (
        !existsSync(
          path.join(repoRoot, projectRoot, 'public', heroImageMatch[1])
        )
      ) {
        violations.push(
          `${filePath}: configured Main App hero image is missing (${heroImageMatch[1]})`
        )
      }
    }
  }

  for (const contract of ECOSYSTEM_OPERATION_RAIL_CONTRACTS) {
    const source = read(repoRoot, contract.filePath)
    for (const required of [
      `import { ${contract.catalogue} }`,
      `${contract.catalogue}.map((operation) =>`,
      'to: `/operations/${operation.slug}`',
    ]) {
      if (!source.includes(required)) {
        violations.push(
          `${contract.filePath}: landing subheader must project the complete Workspace Operation catalogue (${required})`
        )
      }
    }
  }

  for (const imagePath of STANDARD_PRODUCT_HERO_IMAGE_PATHS) {
    if (!existsSync(path.join(repoRoot, imagePath))) {
      violations.push(`${imagePath}: standard product hero image is missing`)
      continue
    }

    const metadata = readPngMetadata(repoRoot, imagePath)
    if (
      !metadata ||
      metadata.width !== STANDARD_PRODUCT_HERO_IMAGE.width ||
      metadata.height !== STANDARD_PRODUCT_HERO_IMAGE.height ||
      metadata.bitDepth !== 8 ||
      metadata.colorType !== 2 ||
      metadata.bytes > STANDARD_PRODUCT_HERO_IMAGE.maximumBytes
    ) {
      violations.push(
        `${imagePath}: product hero must be 1600x1000, 8-bit opaque RGB PNG, and no larger than 2.5 MB`
      )
    }
  }

  if (!slapAdapter.includes(':section-dwell="false"')) {
    violations.push(
      `${SLAP_ADAPTER_PATH}: accepted brand-commerce landing delta must use the Core section-dwell opt-out`
    )
  }

  if (
    !fireuxEcosystems.includes('Product families') ||
    !fireuxEcosystems.includes('Explore the Ecosystems')
  ) {
    violations.push(
      `${FIREUX_ECOSYSTEMS_PATH}: platform Ecosystems section must use the canonical heading`
    )
  }

  for (const required of [
    '<LandingProductIndex',
    '<LandingProductPricingStrip',
    '<LandingProductSurfaceShowcase',
    '<LandingAppCollection',
    '<LandingHeroPreview',
    'title="Werkbox\'s Apps"',
    ':minimum-items="2"',
  ]) {
    if (!werkboxAdapter.includes(required)) {
      violations.push(
        `${WERKBOX_ADAPTER_PATH}: missing aligned Main App landing contract (${required})`
      )
    }
  }
  for (const [filePath, source] of [
    [WERKBOX_ADAPTER_PATH, werkboxAdapter],
    [SLAP_ADAPTER_PATH, slapAdapter],
  ]) {
    if (source.includes('<LandingOperationRail')) {
      violations.push(
        `${filePath}: product routes must not masquerade as Workspace Operations before the App owns a Workspace Entity`
      )
    }
  }

  for (const filePath of [MISEBOX_ADAPTER_PATH, FIREUX_ADAPTER_PATH]) {
    if (
      !discoveredProductLandingAdapters.some(
        (adapter) => adapter.filePath === filePath
      )
    ) {
      violations.push(
        `${filePath}: expected the current Main App adapter to use LandingProductIndex`
      )
    }
  }

  for (const adapter of discoveredProductLandingAdapters) {
    if (
      /from ['"]gsap(?:\/[^'"]*)?['"]|import\(['"]gsap/.test(adapter.source)
    ) {
      violations.push(
        `${adapter.filePath}: App landing bypasses the Core landing-motion concern`
      )
    }

    const pricingStripComponent = [
      'LandingPricingStrip',
      'LandingPricingStrip',
      'LandingProductPricingStrip',
    ].find((component) => adapter.source.includes(`<${component}`))
    const usesPricingStrip = Boolean(pricingStripComponent)
    const entryComponent = pricingStripComponent || 'LandingProductEntryPaths'

    for (const [label, pattern] of [
      ['LandingProductIndex', /<LandingProductIndex\b/g],
      ['onboarding slot', /#onboarding\b/g],
      [entryComponent, new RegExp(`<${entryComponent}\\b`, 'g')],
    ]) {
      const matches = count(adapter.source, pattern)
      if (matches !== 1) {
        violations.push(
          `${adapter.filePath}: expected exactly one ${label}, found ${matches}`
        )
      }
    }

    if (!slotContains(adapter.source, 'onboarding', `<${entryComponent}`)) {
      violations.push(
        `${adapter.filePath}: onboarding slot must own ${entryComponent}`
      )
    }

    if (usesPricingStrip) continue

    const entryContract = resolveEntryPathsContract(repoRoot, adapter)
    const entryPaths = entryPathsBlock(entryContract.source)
    for (const required of ["kind: 'start'", "kind: 'join'"]) {
      if (!entryPaths.includes(required)) {
        violations.push(
          `${entryContract.filePath}: missing typed entry-path requirement (${required})`
        )
      }
    }

    for (const required of [
      'LandingProductEntryContent',
      'satisfies LandingProductEntryContent',
    ]) {
      if (!entryContract.source.includes(required)) {
        violations.push(
          `${entryContract.filePath}: missing typed entry-path requirement (${required})`
        )
      }
    }

    if (/\bicon\s*:/.test(entryPaths)) {
      violations.push(
        `${entryContract.filePath}: entry-path icons are Core-owned and must not be supplied by the App`
      )
    }
  }

  for (const required of [
    'position: relative',
    'overflow: hidden',
    'border: 1px solid var(--ui-border)',
    'border-radius: calc(var(--ui-radius) * 3)',
    'background: var(--ui-bg-muted)',
    'box-shadow: var(--shadow-xl)',
    'object-position: var(--landing-hero-position)',
    '.landing-product-hero-image::before',
    '@media (min-width: 1024px)',
    'inset-block: 0',
    'width: var(--landing-hero-overlap-width, 0)',
    'backdrop-filter: blur(clamp(8px, 1vw, 14px))',
    'transparent 82%',
  ]) {
    if (!productHeroImage.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_HERO_IMAGE_PATH}: missing shared sharp photographic frame contract (${required})`
      )
    }
  }
  for (const forbidden of ['::after']) {
    if (productHeroImage.includes(forbidden)) {
      violations.push(
        `${CORE_PRODUCT_HERO_IMAGE_PATH}: shared photographic frame must not add atmospheric image treatment (${forbidden})`
      )
    }
  }
  if (/(^|\n)\s*filter:\s*blur\(/.test(productHeroImage)) {
    violations.push(
      `${CORE_PRODUCT_HERO_IMAGE_PATH}: shared photographic frame must not blur the source image directly`
    )
  }
  for (const [filePath, source] of [
    [MISEBOX_HERO_PATH, miseboxHero],
    [WERKBOX_HERO_PATH, werkboxHero],
  ]) {
    if (!source.includes('<LandingProductHeroImage')) {
      violations.push(
        `${filePath}: static Main App hero must consume the Core photographic frame`
      )
    }
    if (/<style\b|<img\b/.test(source)) {
      violations.push(
        `${filePath}: static Main App hero must not duplicate the Core image or frame presentation`
      )
    }
  }

  const consumers = [
    {
      filePath: MISEBOX_ADAPTER_PATH,
      source: miseboxAdapter,
      onboardingMarker: '<LandingPricingStrip',
      heroPreviewTag: 'LandingHeroImage',
      proofSectionCount: 1,
      catalogueCount: 3,
      surfaceMarker: '<LandingOrderingShowcase',
      required: [
        '<LandingProductIndex',
        'hero-layout="proof-wide"',
        'presentation="immersive"',
        '#hero-preview',
        '#onboarding',
        '#surfaces',
        '#specifics',
        '#apps',
        '#tools',
        '#solutions',
        '#operations',
        '<LandingHeroImage',
        '<LandingPricingStrip',
        '<LandingOperationRail',
        '<LandingProductProofSection',
        '<LandingWorkspacePreview',
        'copy-emphasis',
        '<LandingOrderingShowcase',
        "'operations',",
        "'solutions',",
        "'tools',",
        '<LandingAppCollection',
        '<LandingProductCatalogue',
        ':featured-ids="featuredAppIds"',
        ':media-overrides="featuredAppMedia"',
        'title="Misebox\'s Apps"',
        ':minimum-items="2"',
        'wordmarkUrl:',
        'useApps',
        ':operations="operationRailItems"',
        'LandingPricingStrip',
        "operation.workspace.id === 'kitchen'",
        "title: 'Work inside the Kitchen Workspace.'",
        "import { metaContent } from '../../meta'",
        'metaContent.operations',
        'metaContent.solutions',
        'toolsCatalogue',
        'solutionsCatalogue',
        'operationsCatalogue',
        "to: '/tools/ordering'",
        ':limit="3"',
        "to: '/'",
        "to: '/operations'",
        'Get started',
        'Go to workspace',
      ],
      forbidden: ['#ecosystems'],
    },
    {
      filePath: FIREUX_ADAPTER_PATH,
      source: fireuxAdapter,
      onboardingMarker: '<LandingPricingStrip',
      proofSectionCount: 0,
      catalogueCount: 2,
      surfaceMarker: '<LandingSurfaceShowcase',
      required: [
        '<LandingProductIndex',
        'hero-layout="proof-wide"',
        'presentation="immersive"',
        '#hero-preview',
        '#onboarding',
        '#surfaces',
        '#ecosystems',
        '#apps',
        '#solutions',
        '#operations',
        '<LandingPricingStrip',
        '<LandingOperationRail',
        ':operations="catalogueOperations"',
        '<LandingCardOrbit presentation="hero"',
        '<LandingSurfaceShowcase',
        '<LandingEcosystems',
        ':copy="projectWorkspaceCopy"',
        ':operations="workspaceOperations"',
        '<LandingAppCollection',
        'title="Apps built with FireUX"',
        'eyebrow="App directory"',
        '<LandingProductCatalogue',
        "import { fireuxOffer, metaContent } from '../../meta'",
        'metaContent.operations',
        'metaContent.solutions',
        'solutionsCatalogue',
        'operationsCatalogue',
        "label: 'Get started'",
        "label: 'Go to workspace'",
        "to: '/get-started'",
        "to: '/workspace/project'",
      ],
      forbidden: ['#specifics', '#tools', 'toolsCatalogue', "to: '/tools"],
    },
  ]

  for (const consumer of consumers) {
    for (const required of consumer.required) {
      if (!consumer.source.includes(required)) {
        violations.push(`${consumer.filePath}: missing ${required}`)
      }
    }

    for (const forbidden of consumer.forbidden) {
      if (consumer.source.includes(forbidden)) {
        violations.push(
          `${consumer.filePath}: contains an unsupported landing family delta (${forbidden})`
        )
      }
    }

    for (const [label, pattern] of [
      ['LandingProductIndex opening tag', /<LandingProductIndex\b/g],
      ['LandingProductIndex closing tag', /<\/LandingProductIndex>/g],
      ['LandingProductProofSection consumer', /<LandingProductProofSection\b/g],
      ['LandingAppCollection consumer', /<LandingAppCollection\b/g],
      ['LandingProductCatalogue consumer', /<LandingProductCatalogue\b/g],
    ]) {
      const matches = count(consumer.source, pattern)
      const expected =
        label === 'LandingProductProofSection consumer'
          ? consumer.proofSectionCount
          : label === 'LandingProductCatalogue consumer'
            ? consumer.catalogueCount
            : 1
      if (matches !== expected) {
        violations.push(
          `${consumer.filePath}: expected exactly ${expected} ${label}, found ${matches}`
        )
      }
    }

    for (const [slotName, marker] of [
      ['onboarding', consumer.onboardingMarker],
      ['surfaces', consumer.surfaceMarker],
      ['apps', '<LandingAppCollection'],
      ['solutions', '<LandingProductCatalogue'],
      ['operations', '<LandingProductCatalogue'],
    ]) {
      if (!slotContains(consumer.source, slotName, marker)) {
        violations.push(
          `${consumer.filePath}: ${slotName} slot must own ${marker}`
        )
      }
    }

    if (/<style\b/.test(consumer.source)) {
      violations.push(
        `${consumer.filePath}: landing adapter must remain CSS-free`
      )
    }

    if (
      /landing-product(?:__|-proof__|-catalogue__|-entry-paths__)/.test(
        consumer.source
      )
    ) {
      violations.push(
        `${consumer.filePath}: copied shared landing presentation into the project`
      )
    }
  }

  for (const adapter of discoveredProductLandingAdapters) {
    if (
      /#hero-preview\b/.test(adapter.source) &&
      ![
        MISEBOX_ADAPTER_PATH,
        FIREUX_ADAPTER_PATH,
        WERKBOX_ADAPTER_PATH,
      ].includes(adapter.filePath)
    ) {
      violations.push(
        `${adapter.filePath}: Main App hero preview has no approved product-owned presentation`
      )
    }
  }

  for (const [slotName, marker] of [
    ['surfaces', '<LandingOrderingShowcase'],
    ['specifics', '<LandingProductProofSection'],
    ['operations', '<LandingProductCatalogue'],
    ['solutions', '<LandingProductCatalogue'],
    ['tools', '<LandingProductCatalogue'],
  ]) {
    if (!slotContains(miseboxAdapter, slotName, marker)) {
      violations.push(
        `${MISEBOX_ADAPTER_PATH}: ${slotName} slot must own ${marker}`
      )
    }
  }

  if (!slotContains(fireuxAdapter, 'surfaces', '<LandingSurfaceShowcase')) {
    violations.push(
      `${FIREUX_ADAPTER_PATH}: surfaces slot must own the FireUX Surface showcase`
    )
  }

  for (const required of [
    'items.length > 1',
    'LandingProductProofSection',
    ':aria-label="selectorLabel"',
    'selected.title',
    'selected.description',
    'selected.to',
  ]) {
    if (!productSurface.includes(required)) {
      violations.push(
        `${CORE_PRODUCT_SURFACE_PATH}: missing one-or-many surface contract (${required})`
      )
    }
  }

  for (const required of [
    'class="fireux-surface-showcase"',
    '<LandingWorkspacePreview',
    'v-model:surface-id="selectedSurfaceId"',
    ':operations="operations"',
    '{{ copy.title }}',
    '{{ copy.description }}',
    '{{ copy.action }}',
  ]) {
    if (!fireuxSurfaceShowcase.includes(required)) {
      violations.push(
        `${FIREUX_SURFACE_SHOWCASE_PATH}: missing FireUX Surface showcase contract (${required})`
      )
    }
  }

  for (const forbidden of [
    '>Surfaces</p>',
    'fireux-surface-showcase__selector',
    'aria-label="FireUX surfaces"',
  ]) {
    if (fireuxSurfaceShowcase.includes(forbidden)) {
      violations.push(
        `${FIREUX_SURFACE_SHOWCASE_PATH}: single-Surface presentation must not render selector chrome (${forbidden})`
      )
    }
  }

  for (const forbidden of ["id: 'project.ignition'", "slug: 'ignition'"]) {
    if (fireuxMeta.includes(forbidden)) {
      violations.push(
        `${FIREUX_META_PATH}: Ignition is App intake with a private delivery workflow, not a Project Operation (${forbidden})`
      )
    }
  }

  for (const required of [
    'LandingCardOrbitItem',
    'LandingCardOrbitDataSource',
    'dataSource: LandingCardOrbitDataSource',
    ':data-orbit-source="dataSource"',
    'name="item"',
    'inert',
    '@pointerenter="selectOnHover(item, $event)"',
    "export type OrbitSelectionSource = 'click' | 'hover' | null",
    "event.pointerType !== 'mouse'",
    "selectionSource.value === 'hover'",
    '@keydown.left.prevent',
    '@keydown.right.prevent',
    'window.matchMedia(REDUCED_MOTION_QUERY)',
    'new IntersectionObserver',
    'document.visibilityState',
    'export const ORBIT_INTRO_DURATION = 7200',
    'export const ORBIT_IDLE_SPEED = ORBIT_TAU / 20000',
    '(2 * ORBIT_TAU * 2) / ORBIT_INTRO_DURATION',
    'mobileAutoplay: true',
    '(isMobile.value || isVisible.value)',
    'export const ORBIT_INTRO_START_SPEED =',
    'const decelerationTravel =',
    '2.5 * progress ** 4',
    'let orbitDirection: -1 | 1 = 1',
    'Math.random() < 0.5 ? -1 : 1',
    'opacity: 1',
    'const REAR_CARD_SCALE = 0.42',
    'const FRONT_CARD_SCALE = 0.9',
    'const SELECTED_CARD_SCALE = 1',
    'REAR_CARD_SCALE + depth * (FRONT_CARD_SCALE - REAR_CARD_SCALE)',
    "type IntroState = 'pending' | 'running' | 'complete'",
    'const startIntro = () =>',
    'const settleIntro = (settleToMainAxis = true) =>',
    'Math.sin(introTravel)',
    'touch-action: pan-y',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    if (!cardOrbit.includes(required)) {
      violations.push(
        `${CORE_CARD_ORBIT_PATH}: missing shared orbit contract (${required})`
      )
    }
  }

  for (const forbidden of ['onBeforeMount']) {
    if (cardOrbit.includes(forbidden)) {
      violations.push(
        `${CORE_CARD_ORBIT_PATH}: desktop orbit intro must remain hydration-safe (${forbidden})`
      )
    }
  }

  for (const forbidden of ['--landing-orbit-depth-blur', 'filter: blur(']) {
    if (cardOrbit.includes(forbidden)) {
      violations.push(
        `${CORE_CARD_ORBIT_PATH}: orbit cards must remain crisp at every depth (${forbidden})`
      )
    }
  }

  for (const forbidden of [
    'yaw.value = -item.longitude',
    'pitch.value = item.latitude',
  ]) {
    if (cardOrbit.includes(forbidden)) {
      violations.push(
        `${CORE_CARD_ORBIT_PATH}: selecting one card must not snap the shared orbit axes (${forbidden})`
      )
    }
  }

  if (
    !cardOrbitType.includes(
      "export type LandingCardOrbitDataSource = 'demo' | 'live'"
    )
  ) {
    violations.push(
      `${CORE_CARD_ORBIT_TYPE_PATH}: orbit data authority must remain the closed demo | live union`
    )
  }

  for (const [filePath, source] of [
    [FIREUX_CARD_ORBIT_PATH, fireuxCardOrbit],
  ]) {
    if (!source.includes('<LandingCardOrbit')) {
      violations.push(`${filePath}: must consume the shared Core card orbit`)
    }

    for (const forbidden of [
      'requestAnimationFrame',
      'ResizeObserver',
      'IntersectionObserver',
      'landing-card-orbit__',
      'mobileScrollSpin',
      "addEventListener('scroll'",
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: reintroduced project-owned orbit behavior or geometry (${forbidden})`
        )
      }
    }
  }

  for (const required of [
    'LandingCardOrbitDataSource',
    "const orbitDataSource = 'live' satisfies LandingCardOrbitDataSource",
    ':data-source="orbitDataSource"',
    'usePlatformDirectory',
  ]) {
    if (!fireuxCardOrbit.includes(required)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: FireUX orbit must remain one explicit live projection (${required})`
      )
    }
  }

  for (const forbidden of [
    'useMiseboxProductDemo',
    'runtime/demo/',
    'DemoScenario',
    'fixture',
  ]) {
    if (fireuxCardOrbit.includes(forbidden)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: live FireUX orbit acquired Demo or fixture data (${forbidden})`
      )
    }
  }

  for (const required of [
    'useMiseboxProductDemo()',
    '<MenuOrderCatalogue',
    '<LandingWorkspacePreviewMenus',
    '<LandingWorkspacePreviewMise',
    '<LandingWorkspacePreviewOrders',
    "id: 'publish'",
    "id: 'prepare'",
    "id: 'serve'",
    ':aria-pressed="selectedChapter === chapter.id"',
    ':data-handoff-chapter="selectedChapter"',
    'inert',
    '@media (prefers-reduced-motion: reduce)',
  ]) {
    if (!miseboxHandoffPreview.includes(required)) {
      violations.push(
        `${MISEBOX_HANDOFF_PREVIEW_PATH}: missing connected Menu-to-Workspace hero contract (${required})`
      )
    }
  }

  for (const forbidden of [
    'setInterval(',
    'setTimeout(',
    'requestAnimationFrame',
    "addEventListener('scroll'",
    'useFetch(',
    '$fetch(',
    'firebase',
  ]) {
    if (miseboxHandoffPreview.includes(forbidden)) {
      violations.push(
        `${MISEBOX_HANDOFF_PREVIEW_PATH}: hero handoff acquired autoplay, page-scroll, or data authority (${forbidden})`
      )
    }
  }

  for (const required of [
    'misebox-element-window__viewport',
    'overflow-x: auto',
    'tabindex="0"',
    'aria-label="Scroll through Misebox product cards from left to right"',
    'scroll-snap-type: x proximity',
    'grid-auto-flow: column',
    'grid-auto-columns: minmax(18rem, 20rem)',
  ]) {
    if (!miseboxCardWindow.includes(required)) {
      violations.push(
        `${MISEBOX_CARD_WINDOW_PATH}: Misebox card window must remain a keyboard-focusable, horizontal bento presentation (${required})`
      )
    }
  }

  for (const required of [
    'usePlatformDirectory',
    'useAppInterface',
    'useEcosystemInterface',
    '<AppCardsCell',
    '<AppCardsPill',
    '<AppCardsPreview',
    '<EcosystemCardsCell',
    '<EcosystemCardsPill',
    '<EcosystemCardsPreview',
    ':link="false"',
  ]) {
    if (!fireuxCardOrbit.includes(required)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: missing real public Card projection (${required})`
      )
    }
  }

  for (const required of [
    'width: min(20rem, calc(100vw - var(--spacing) * 8))',
    'width: min(14rem, calc(100vw - var(--spacing) * 8))',
  ]) {
    if (!fireuxCardOrbit.includes(required)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: FireUX hero cards must remain within the shared compact orbit range (${required})`
      )
    }
  }

  for (const oversizedWidth of [
    'width: min(24rem, calc(100vw - var(--spacing) * 8))',
    'width: min(18rem, calc(100vw - var(--spacing) * 8))',
  ]) {
    if (fireuxCardOrbit.includes(oversizedWidth)) {
      violations.push(
        `${FIREUX_CARD_ORBIT_PATH}: reintroduced oversized FireUX-only orbit cards (${oversizedWidth})`
      )
    }
  }

  for (const required of [
    '<ElementWindow',
    'useMiseboxPowerCardsProductDemo()',
    'v-else-if="pending"',
    'v-else-if="error"',
    'refreshPowerCards',
    'misebox-power-cards__state',
    '<MiseboxPowerCardOne',
    '<MiseboxPowerCardTen',
  ]) {
    if (!miseboxPowerCards.includes(required)) {
      violations.push(
        `${MISEBOX_POWER_CARDS_PATH}: missing project-owned PowerCard adapter (${required})`
      )
    }
  }

  for (const required of [
    "dataSource: 'demo'",
    "import('fireux-kitchens/runtime/kitchen/demo/scenarios')",
    "import('fireux-suppliers/runtime/supplier/demo/scenarios')",
    "const kitchens: MiseboxPowerCardsProductDemo['cards']['kitchens']",
    'manifest.presentation.currencyCode',
  ]) {
    if (!miseboxPowerCardsDemo.includes(required)) {
      violations.push(
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: Misebox PowerCards must remain one explicit Demo projection (${required})`
      )
    }
  }

  for (const forbidden of [
    'usePlatformDirectory',
    'useFetch(',
    'useRequestFetch(',
    '$fetch(',
    '/api/',
    'firebase',
  ]) {
    if (
      miseboxPowerCards.includes(forbidden) ||
      miseboxPowerCardsDemo.includes(forbidden)
    ) {
      violations.push(
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: Demo card window acquired a second live data authority (${forbidden})`
      )
    }
  }

  for (const required of [
    'cell: projectKitchenCell',
    'projectKitchenCell(projectKitchenSurface({',
    '...kitchenCell',
    'kitchens,',
  ]) {
    if (!miseboxPowerCardsDemo.includes(required)) {
      violations.push(
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: PowerCard Kitchens must reuse the canonical Kitchen Cell projection (${required})`
      )
    }
  }

  const powerCardKitchenProjectionStart = miseboxPowerCardsDemo.indexOf(
    "const kitchens: MiseboxPowerCardsProductDemo['cards']['kitchens']"
  )
  const powerCardKitchenProjectionEnd = miseboxPowerCardsDemo.indexOf(
    'const menu =',
    powerCardKitchenProjectionStart
  )
  const powerCardKitchenProjection =
    powerCardKitchenProjectionStart !== -1 &&
    powerCardKitchenProjectionEnd !== -1
      ? miseboxPowerCardsDemo.slice(
          powerCardKitchenProjectionStart,
          powerCardKitchenProjectionEnd
        )
      : ''

  if (
    powerCardKitchenProjection.includes('scenario.place.image_url') ||
    /\bimageUrl\s*:/.test(powerCardKitchenProjection)
  ) {
    violations.push(
      `${MISEBOX_POWER_CARDS_DEMO_PATH}: PowerCard Kitchens bypass the canonical Kitchen-owned logo projection`
    )
  }

  for (const forbidden of [
    '<MiseboxPowerCardTwo',
    '<MiseboxPowerCardNine',
    'orbit.cards.ingredients',
    'orbit.cards.ingredient',
  ]) {
    if (miseboxPowerCards.includes(forbidden)) {
      violations.push(
        `${MISEBOX_POWER_CARDS_PATH}: Demo-only card window reintroduced a live Ingredient-dependent card (${forbidden})`
      )
    }
  }

  for (const forbidden of [
    'currency-code="CHF"',
    "to: '/'",
    "status: 'Active'",
    "badges: ['Available']",
  ]) {
    if (
      miseboxPowerCardsDemo.includes(forbidden) ||
      miseboxPowerCardEight.includes(forbidden)
    ) {
      violations.push(
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: Demo card window contains manufactured domain presentation (${forbidden})`
      )
    }
  }

  for (const forbidden of [
    'mobile-scroll-spin',
    'mobileScrollSpin',
    "addEventListener('scroll'",
  ]) {
    for (const [filePath, source] of [
      [MISEBOX_ADAPTER_PATH, miseboxAdapter],
      [MISEBOX_CARD_WINDOW_PATH, miseboxCardWindow],
      [MISEBOX_POWER_CARDS_PATH, miseboxPowerCards],
      [MISEBOX_HANDOFF_PREVIEW_PATH, miseboxHandoffPreview],
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: Misebox landing presentation must not couple ordinary page scrolling to animation (${forbidden})`
        )
      }
    }
  }

  for (const required of [
    "'landing-product--full-hero': heroLayout === 'proof-wide'",
    "'landing-product--immersive': presentation === 'immersive'",
    "'landing-product--section-dwell': sectionDwell",
    '--font-fireux-hero:',
    '--font-weight-fireux-hero: 900',
    'font-family: var(--font-fireux-hero)',
    'font-weight: var(--font-weight-fireux-hero)',
    'width: 100dvw',
    'margin-inline: calc(50% - 50dvw)',
    "querySelectorAll<HTMLElement>('[data-landing-reveal]')",
    "const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'",
    'activeRevealObservers',
    'useLandingMotion(landingRoot)',
    "import('gsap')",
    "import('gsap/ScrollTrigger')",
    'gsap.registerPlugin(runtime.ScrollTrigger)',
    'animateImmersiveChapters(root)',
    "'[data-landing-motion-entity]'",
    ':data-landing-motion-stage="region"',
    'landing-product__region-dwell',
    'landing-product__region-dwell-spacer',
    '.landing-product--immersive.landing-product--section-dwell',
    "querySelectorAll<HTMLElement>('[data-landing-pricing-detail]')",
    "!element.classList.contains('landing-pricing-strip')",
    "start: 'top 32%'",
    "end: 'top 0px'",
    "start: 'top 55%'",
    "start: 'top -96px'",
    "end: '+=24%'",
    "'[data-fireux-header-root]'",
    'yPercent: -110',
    "end: '+=85%'",
    'pinSpacing: false',
    'pin: true',
    "ease: 'power3.out'",
    "classList.add('is-gsap-motion')",
    'activeTweens.forEach((tween) => tween.kill())',
  ]) {
    if (!core.includes(required)) {
      violations.push(
        `${CORE_PATH}: missing mobile-first full-viewport hero seam (${required})`
      )
    }
  }

  if (!/"gsap"\s*:\s*"\^3\./.test(corePackage)) {
    violations.push(
      `${CORE_PACKAGE_PATH}: Core landing motion must own the GSAP dependency`
    )
  }

  for (const forbidden of [
    "to: '/jobs'",
    "to: '/professionals'",
    "to: '/suppliers'",
  ]) {
    if (miseboxAdapter.includes(forbidden)) {
      violations.push(
        `${MISEBOX_ADAPTER_PATH}: main Kitchen landing contains a competing product doorway (${forbidden})`
      )
    }
  }

  for (const required of [
    '<MenuCollectionManager',
    ':index="menuIndex"',
    'import { useMenuCollection }',
    'const menuIndex = useMenuCollection()',
  ]) {
    if (!miseboxOrderingTool.includes(required)) {
      violations.push(
        `${MISEBOX_ORDERING_TOOL_PATH}: must select published Menus through the shared Menu Directory (${required})`
      )
    }
  }

  if (miseboxOrderingTool.includes('/img/app/logo.png')) {
    violations.push(
      `${MISEBOX_ORDERING_TOOL_PATH}: must not regress to a logo-only Ordering placeholder`
    )
  }

  for (const required of [
    "title: 'Order from a published Menu'",
    'Collection, delivery, and pre-order',
  ]) {
    if (!miseboxOrderingToolContract.includes(required)) {
      violations.push(
        `${MISEBOX_ORDERING_TOOL_CONTRACT_PATH}: missing truthful published-Menu ordering contract (${required})`
      )
    }
  }

  for (const required of [
    "primaryCtaTo: '/demo'",
    "'restaurant menu management'",
    "'restaurant service workflow'",
  ]) {
    if (!miseboxMeta.includes(required)) {
      violations.push(
        `${MISEBOX_META_PATH}: missing focused product truth (${required})`
      )
    }
  }

  for (const forbidden of [
    'chef job platform',
    'hospitality recruitment platform',
    'restaurant recruitment',
  ]) {
    if (miseboxMeta.includes(forbidden)) {
      violations.push(
        `${MISEBOX_META_PATH}: retains mixed-audience SEO (${forbidden})`
      )
    }
  }

  for (const required of [
    "'jobs.misebox.app'",
    "'jobs.localhost'",
    "to.meta.layout = 'misebox-jobs'",
    "navigateTo('/jobs'",
  ]) {
    if (!miseboxJobsMiddleware.includes(required)) {
      violations.push(
        `${MISEBOX_JOBS_MIDDLEWARE_PATH}: missing focused Jobs doorway behavior (${required})`
      )
    }
  }

  for (const required of [
    'data-misebox-jobs-layout',
    '<LayoutsDefaultHeader',
    '<LayoutsDefaultFooter',
    'Misebox Jobs',
    'to="/jobs"',
    'to="/professionals"',
    'to="/jobs/manage"',
  ]) {
    if (!miseboxJobsLayout.includes(required)) {
      violations.push(
        `${MISEBOX_JOBS_LAYOUT_PATH}: missing focused Jobs shell contract (${required})`
      )
    }
  }

  for (const required of [
    "'suppliers.misebox.app'",
    "'suppliers.localhost'",
    'navigateTo(`https://bringli.app${path}`',
    'redirectCode: 308',
  ]) {
    if (!miseboxSuppliersMiddleware.includes(required)) {
      violations.push(
        `${MISEBOX_SUPPLIERS_MIDDLEWARE_PATH}: missing retired Supplier-host migration behavior (${required})`
      )
    }
  }

  for (const forbidden of [
    "to.meta.layout = 'misebox-suppliers'",
    "navigateTo('/suppliers'",
    'Misebox Suppliers',
  ]) {
    if (!miseboxSuppliersMiddleware.includes(forbidden)) continue
    violations.push(
      `${MISEBOX_SUPPLIERS_MIDDLEWARE_PATH}: retired Misebox Supplier product authority remains (${forbidden})`
    )
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Shared product landing family drifted:',
        ...violations.map((violation) => `- ${violation}`),
        '- Keep phone flow unconditioned, enhance with min-width only, and keep product truth at the project edge.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ shared product landing and project adapters valid')
}
