// @fireux-script
// last_used: 2026-07-28
// usage_note: keeps the shared product landing mobile-first and product truth at each project edge.
// Concurrent edit — 2026-07-23 02:43 CEST — Guard the central landing surface and its Misebox adapter.
// Concurrent edit — 2026-07-23 12:13 CEST — Extend the shared landing contract to the FireUX sibling consumer.
// Concurrent edit — 2026-07-25 — Guard Misebox's real read-only Orders proof inside the shared hero.
// Concurrent edit — 2026-07-28 — Guard the shared hero-to-catalogue section spine.

import { readFileSync } from 'node:fs'
import path from 'node:path'

const CORE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductIndex.vue'
const CORE_APP_COLLECTION_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/AppCollection.vue'
const CORE_PREVIEW_FRAME_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductPreviewFrame.vue'
const CORE_CARD_ORBIT_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/CardOrbit.vue'
const CORE_CARD_ORBIT_TYPE_PATH =
  'packages/core/fireux-core/src/types/landing-card-orbit.ts'
const CORE_PRODUCT_PROOF_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductProofSection.vue'
const CORE_PRODUCT_CATALOGUE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductCatalogue.vue'
const MISEBOX_ADAPTER_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/Index.vue'
const MISEBOX_PAGE_PATH = 'projects/misebox/misebox-app/app/pages/index.vue'
const MISEBOX_CARD_ORBIT_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/ElementOrbit.vue'
const MISEBOX_POWER_CARDS_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/PowerCards.vue'
const MISEBOX_POWER_CARDS_DEMO_PATH =
  'projects/misebox/misebox-app/app/composables/product-demo/useMiseboxPowerCardsProductDemo.ts'
const MISEBOX_POWER_CARD_EIGHT_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/PowerCardEight.vue'
const MISEBOX_ORDERING_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/OrderingPreview.vue'
const MISEBOX_FINANCE_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/FinancePreview.vue'
const MISEBOX_CONSOLE_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Index.vue'
const KITCHEN_MISE_BOARD_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Mise/TaskBoard.vue'
const KITCHEN_MISE_COLLECTION_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Mise/TaskCollection.vue'
const KITCHEN_MISE_CONSOLE_READ_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Mise/Read.vue'
const KITCHEN_MISE_PRESENTATION_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/mise-presentation.ts'
const MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS = {
  menus:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Menus.vue',
  ingredients:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Ingredients.vue',
  dishes:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes.vue',
  dishCollection:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Collection.vue',
  dishDetail:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Detail.vue',
  dishDetailSections:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/DetailSections.vue',
  dishFinance:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Finance.vue',
  dishSpec:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Spec.vue',
  dishPrepItems:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/PrepItems.vue',
  dishRecipes:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Recipes.vue',
  dishMise:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Dishes/Mise.vue',
  recipes:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Recipes.vue',
  mise: 'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Mise.vue',
  orders:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Orders.vue',
  stations:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Stations.vue',
  suppliers:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Suppliers.vue',
  tables:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Tables.vue',
  finance:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Finance.vue',
  emptyCanvas:
    'projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/EmptyCanvas.vue',
}
const MISEBOX_META_PATH = 'projects/misebox/misebox-app/app/meta.ts'
const MISEBOX_JOBS_MIDDLEWARE_PATH =
  'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts'
const MISEBOX_JOBS_LAYOUT_PATH =
  'projects/misebox/misebox-app/app/layouts/misebox-jobs.vue'
const FIREUX_ADAPTER_PATH =
  'projects/fireux/fireux-app/app/components/FireUX/Landing/Index.vue'
const FIREUX_PAGE_PATH = 'projects/fireux/fireux-app/app/pages/index.vue'
const FIREUX_PREVIEW_PATH =
  'projects/fireux/fireux-app/app/components/FireUX/Landing/Preview.vue'
const FIREUX_CARD_ORBIT_PATH =
  'projects/fireux/fireux-app/app/components/FireUX/Landing/CardOrbit.vue'
const FIREUX_ECOSYSTEMS_PATH =
  'projects/fireux/fireux-app/app/components/landing/Ecosystems.vue'
const MOBILE_FIRST_MARKER =
  '/* Mobile-first baseline. Width queries below may only enhance this layout. */'

function read(repoRoot, filePath) {
  return readFileSync(path.join(repoRoot, filePath), 'utf8')
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

function extractScopedStyle({ filePath, source, violations }) {
  const allOpeningTags = [...source.matchAll(/<style\b[^>]*>/g)]
  const openingTags = [...source.matchAll(/<style\b(?=[^>]*\bscoped\b)[^>]*>/g)]

  if (allOpeningTags.length !== 1 || openingTags.length !== 1) {
    violations.push(
      `${filePath}: expected exactly one scoped landing stylesheet, found ${allOpeningTags.length} style block(s) and ${openingTags.length} scoped block(s)`
    )
    return null
  }

  const openingTag = openingTags[0]
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
  filePath,
  source,
  selectors,
  breakpoints,
  violations,
}) {
  const style = extractScopedStyle({ filePath, source, violations })
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
  const core = read(repoRoot, CORE_PATH)
  const appCollection = read(repoRoot, CORE_APP_COLLECTION_PATH)
  const previewFrame = read(repoRoot, CORE_PREVIEW_FRAME_PATH)
  const cardOrbit = read(repoRoot, CORE_CARD_ORBIT_PATH)
  const cardOrbitType = read(repoRoot, CORE_CARD_ORBIT_TYPE_PATH)
  const productProof = read(repoRoot, CORE_PRODUCT_PROOF_PATH)
  const productCatalogue = read(repoRoot, CORE_PRODUCT_CATALOGUE_PATH)
  const miseboxAdapter = read(repoRoot, MISEBOX_ADAPTER_PATH)
  const miseboxPage = read(repoRoot, MISEBOX_PAGE_PATH)
  const miseboxCardOrbit = read(repoRoot, MISEBOX_CARD_ORBIT_PATH)
  const miseboxPowerCards = read(repoRoot, MISEBOX_POWER_CARDS_PATH)
  const miseboxPowerCardsDemo = read(repoRoot, MISEBOX_POWER_CARDS_DEMO_PATH)
  const miseboxPowerCardEight = read(repoRoot, MISEBOX_POWER_CARD_EIGHT_PATH)
  const miseboxOrderingPreview = read(repoRoot, MISEBOX_ORDERING_PREVIEW_PATH)
  const miseboxFinancePreview = read(repoRoot, MISEBOX_FINANCE_PREVIEW_PATH)
  const miseboxConsolePreview = read(repoRoot, MISEBOX_CONSOLE_PREVIEW_PATH)
  const kitchenMiseBoard = read(repoRoot, KITCHEN_MISE_BOARD_PATH)
  const kitchenMiseCollection = read(repoRoot, KITCHEN_MISE_COLLECTION_PATH)
  const kitchenMiseConsoleRead = read(repoRoot, KITCHEN_MISE_CONSOLE_READ_PATH)
  const kitchenMisePresentation = read(repoRoot, KITCHEN_MISE_PRESENTATION_PATH)
  const miseboxConsolePreviewComponents = Object.fromEntries(
    Object.entries(MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [key, read(repoRoot, filePath)]
    )
  )
  const miseboxMeta = read(repoRoot, MISEBOX_META_PATH)
  const miseboxJobsMiddleware = read(repoRoot, MISEBOX_JOBS_MIDDLEWARE_PATH)
  const miseboxJobsLayout = read(repoRoot, MISEBOX_JOBS_LAYOUT_PATH)
  const fireuxAdapter = read(repoRoot, FIREUX_ADAPTER_PATH)
  const fireuxPage = read(repoRoot, FIREUX_PAGE_PATH)
  const fireuxPreview = read(repoRoot, FIREUX_PREVIEW_PATH)
  const fireuxCardOrbit = read(repoRoot, FIREUX_CARD_ORBIT_PATH)
  const fireuxEcosystems = read(repoRoot, FIREUX_ECOSYSTEMS_PATH)
  const violations = []

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
    filePath: CORE_PATH,
    source: core,
    selectors: [
      '.landing-product',
      '.landing-product__hero',
      '.landing-product__hero-actions',
      '.landing-product__onboarding',
      '.landing-product__region',
    ],
    breakpoints: ['640px', '768px', '1024px'],
    violations,
  })

  checkMobileFirst({
    filePath: CORE_PREVIEW_FRAME_PATH,
    source: previewFrame,
    selectors: [
      '.landing-product-preview-frame',
      '.landing-product-preview-frame__controls',
      '.landing-product-preview-frame__content',
      '.landing-product-preview-frame__footer',
    ],
    breakpoints: ['640px'],
    violations,
  })

  checkMobileFirst({
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
    filePath: FIREUX_PREVIEW_PATH,
    source: fireuxPreview,
    selectors: [
      '.fireux-home__preview',
      '.fireux-home__request-facts',
      '.fireux-home__app-grid',
    ],
    breakpoints: ['640px'],
    violations,
  })

  const landingSlotOrder = [
    'hero-preview',
    'console',
    'specifics',
    'ecosystems',
    'apps',
    'tools',
    'solutions',
    'operations',
  ]
  let previousSlotIndex = -1
  for (const slotName of landingSlotOrder) {
    const marker = `<slot name="${slotName}"`
    const slotIndex = core.indexOf(marker)
    const slotCount = count(
      core,
      new RegExp(`<slot\\s+name=["']${slotName}["']`, 'g')
    )

    if (slotCount !== 1) {
      violations.push(
        `${CORE_PATH}: expected exactly one ${slotName} slot, found ${slotCount}`
      )
    }
    if (slotIndex !== -1 && slotIndex <= previousSlotIndex) {
      violations.push(
        `${CORE_PATH}: ${slotName} must follow the fixed ${landingSlotOrder.join(' → ')} slot order`
      )
    }
    if (slotIndex !== -1) previousSlotIndex = slotIndex
  }

  if (
    !/<p\b[^>]*class="landing-product__onboarding"[^>]*>/s.test(core) ||
    !core.includes("content.onboardingLabel || 'onboarding'")
  ) {
    violations.push(
      `${CORE_PATH}: onboarding must remain one plain text paragraph`
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
    [CORE_PREVIEW_FRAME_PATH, previewFrame],
    [CORE_CARD_ORBIT_PATH, cardOrbit],
    [CORE_PRODUCT_PROOF_PATH, productProof],
    [CORE_PRODUCT_CATALOGUE_PATH, productCatalogue],
    [MISEBOX_ADAPTER_PATH, miseboxAdapter],
    [MISEBOX_CARD_ORBIT_PATH, miseboxCardOrbit],
    [MISEBOX_POWER_CARDS_PATH, miseboxPowerCards],
    [MISEBOX_CONSOLE_PREVIEW_PATH, miseboxConsolePreview],
    [MISEBOX_ORDERING_PREVIEW_PATH, miseboxOrderingPreview],
    [MISEBOX_FINANCE_PREVIEW_PATH, miseboxFinancePreview],
    ...Object.entries(MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS).map(
      ([key, filePath]) => [filePath, miseboxConsolePreviewComponents[key]]
    ),
    [FIREUX_ADAPTER_PATH, fireuxAdapter],
    [FIREUX_PREVIEW_PATH, fireuxPreview],
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
    'AppDirectoryController',
    '<UPageCard',
    'app.detail_url',
    "app.status === 'active'",
    'portableMediaUrl',
  ]) {
    if (!appCollection.includes(required)) {
      violations.push(
        `${CORE_APP_COLLECTION_PATH}: missing public App collection contract (${required})`
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
    "from 'fireux-kitchens/runtime/content/operations'",
    'aria-label="Interactive Kitchen Console preview"',
    '<KitchenCardsPill',
    'v-bind="consoleKitchenPill"',
    "MiseboxProductDemo['console']['kitchenPill']",
    'productDemo.value?.console.kitchenPill',
    ':show-badges="false"',
    'aria-label="Kitchen Operations"',
    ':aria-current="operation.id === selectedSurfaceId',
    '@click="selectSurface(operation.id)"',
    'aria-label="Kitchen reports"',
    "id: 'kitchen.finance'",
    '@click="selectSurface(financeSurface.id)"',
    'Open full Console',
    'to="/console/kitchen"',
    '@click="openFullKitchenConsole"',
    'useKitchenConsoleSelection',
    "type: 'demo'",
    "await navigateTo('/console/kitchen')",
    "const selectedDishId = ref('')",
    "const selectedDishPage = ref<DishChildPage>('detail')",
    '<MiseboxLandingConsolePreviewMenus',
    ':menus="productDemo?.console.menus || []"',
    '<MiseboxLandingConsolePreviewDishes',
    ':dishes="previewDishes"',
    "dish.kind !== 'Drink'",
    '<MiseboxLandingConsolePreviewIngredients',
    ':ingredients="productDemo?.console.ingredients || []"',
    '<MiseboxLandingConsolePreviewRecipes',
    ':recipes="productDemo?.console.recipes || []"',
    '<MiseboxLandingConsolePreviewMise',
    ':kitchen-name="productDemo?.console.kitchenName || \'\'"',
    ':tasks="consoleMiseTasks"',
    'useKitchenMenuServiceSelection',
    'hasInServiceMenu',
    '<MiseboxLandingConsolePreviewOrders',
    ':orders="productDemo?.console.orders || []"',
    '<MiseboxLandingConsolePreviewStations',
    ':stations="productDemo?.console.stations || []"',
    '<MiseboxLandingConsolePreviewSuppliers',
    ':suppliers="productDemo?.console.suppliers || []"',
    '<MiseboxLandingConsolePreviewTables',
    ':tables="productDemo?.console.tables || emptyTables"',
    '<MiseboxLandingConsolePreviewFinance',
    ':finance="productDemo?.console.finance || emptyFinance"',
    '<MiseboxLandingConsolePreviewEmptyCanvas',
  ]) {
    if (!miseboxConsolePreview.includes(required)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: missing local canonical Console navigation (${required})`
      )
    }
  }

  if (count(miseboxConsolePreview, /useMiseboxProductDemo\(/g) !== 1) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_PATH}: root must own exactly one Product Demo load`
    )
  }

  for (const forbidden of [
    'Build spec',
    'aria-label="Dish detail sections"',
    'console-preview-menus',
    'console-preview-dishes',
    'selectedDishSection',
    '<ConsoleKitchenOperationsDishesCardsCell',
  ]) {
    if (miseboxConsolePreview.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: thin root re-owned operation presentation (${forbidden})`
      )
    }
  }

  const componentContracts = {
    menus: [
      'aria-label="Menus preview"',
      'console-preview-menus',
      '{{ menu.name }}',
      ':src="menu.imageUrl"',
    ],
    ingredients: [
      'aria-label="Ingredients preview"',
      "MiseboxProductDemo['console']['ingredients'][number]",
      'INGREDIENT_FOOD_GROUP_OPTIONS',
      ':default-value="defaultOpenFoodGroups"',
      ':data-food-group="item.value"',
      'ingredient.foodGroup === option.value',
      ':src="ingredient.imageUrl"',
      '{{ ingredient.name }}',
    ],
    dishes: [
      'aria-label="Dish preview breadcrumb"',
      '<MiseboxLandingConsolePreviewDishesDetail',
      '<MiseboxLandingConsolePreviewDishesDetailSections',
      ':selected="page"',
      '<MiseboxLandingConsolePreviewDishesCollection',
      '<MiseboxLandingConsolePreviewDishesFinance',
      '<MiseboxLandingConsolePreviewDishesSpec',
      '<MiseboxLandingConsolePreviewDishesPrepItems',
      '<MiseboxLandingConsolePreviewDishesRecipes',
      '<MiseboxLandingConsolePreviewDishesMise',
    ],
    dishCollection: [
      '<ConsoleKitchenOperationsDishesCardsCell',
      'console-preview-dishes',
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
      "MiseboxProductDemo['console']['recipes'][number]",
    ],
    mise: [
      'aria-label="Mise en place preview"',
      '<KitchenMiseTaskCollection',
      ':tasks="tasks"',
      ':kitchen-name="kitchenName"',
      'ProductDemoMiseTask',
      "MiseboxProductDemo['console']['miseTasks'][number]",
    ],
    orders: [
      'aria-label="Orders preview"',
      '<ConsoleKitchenOperationsOrdersRail',
      '<ConsoleKitchenOperationsOrdersTicketPresentation',
      'deriveKitchenOrderBoardStage',
      ':interactive="false"',
      'ProductDemoOrder',
      "MiseboxProductDemo['console']['orders'][number]",
    ],
    stations: [
      'aria-label="Stations preview"',
      ':data-station-id="station.id"',
      "MiseboxProductDemo['console']['stations'][number]",
    ],
    suppliers: [
      'aria-label="Suppliers preview"',
      '<ConsoleKitchenOperationsSuppliersCardsCell',
      ':data-supplier-id="supplier.id"',
      'supplier.linkedIngredientCount',
      "MiseboxProductDemo['console']['suppliers'][number]",
    ],
    tables: [
      'aria-label="Tables preview"',
      ':data-table-number="tableNumber"',
      'tables.configuredCount',
      "MiseboxProductDemo['console']['tables']",
    ],
    finance: [
      'aria-label="Kitchen Finance preview"',
      'aria-label="Finance period"',
      '<KitchenFinanceSummary',
      ':gross-sales-minor="selectedSummary.grossSalesMinor"',
      ':sale-count="selectedSummary.saleCount"',
      ':average-sale-minor="selectedSummary.averageSaleMinor"',
      'KitchenFinanceReportPeriod',
      "MiseboxProductDemo['console']['finance']",
    ],
    emptyCanvas: [':aria-label="`${title} page canvas`"', 'min-h-[20rem]'],
  }
  for (const [key, requiredMarkers] of Object.entries(componentContracts)) {
    const source = miseboxConsolePreviewComponents[key]
    const filePath = MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]
    for (const required of requiredMarkers) {
      if (!source.includes(required)) {
        violations.push(
          `${filePath}: missing owned Console preview contract (${required})`
        )
      }
    }
  }

  for (const key of ['menus', 'dishCollection', 'ingredients', 'recipes']) {
    const source = miseboxConsolePreviewComponents[key]
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
    if (miseboxConsolePreviewComponents[key].includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]}: entry preview exposed Dish type vocabulary (${forbidden})`
      )
    }
  }

  if (
    miseboxConsolePreviewComponents.dishDetailSections.includes(
      '{{ section.label }}'
    )
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.dishDetailSections}: Dish page selector exposed visible text labels instead of icon-only controls`
    )
  }

  if (
    miseboxConsolePreviewComponents.dishDetail.includes(':src="dish.imageUrl"')
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.dishDetail}: Dish image belongs to the persistent page selector rather than the swappable overview`
    )
  }

  for (const [key, source] of Object.entries(miseboxConsolePreviewComponents)) {
    const filePath = MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS[key]
    for (const forbidden of [
      'useMiseboxProductDemo(',
      'useKitchenConsole',
      'useConsoleSelection',
      'useFirestore',
      'firebase',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: child acquired data or live Console authority (${forbidden})`
        )
      }
    }
  }

  if (
    miseboxConsolePreviewComponents.mise.includes('KITCHEN_MISE_STATUS_OPTIONS')
  ) {
    violations.push(
      `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.mise}: must consume the Kitchen-owned Mise task board instead of rebuilding status presentation`
    )
  }

  for (const forbidden of ['<KitchenMiseTaskBoard', 'compact']) {
    if (miseboxConsolePreviewComponents.mise.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.mise}: bypasses the shared Console Mise collection presentation (${forbidden})`
      )
    }
  }

  for (const forbidden of [
    '@touch-status',
    'updateStatus(',
    'useKitchenOrdersWorkspace',
  ]) {
    if (miseboxConsolePreviewComponents.orders.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_COMPONENT_PATHS.orders}: read-only Console preview acquired Order mutation behavior (${forbidden})`
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
      kitchenMiseConsoleRead,
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
    'useConsoleSelection',
    'useKitchenConsoleOverview',
    'useFirestore',
    'firebase',
    '{{ selectedOperation.description }}',
    ':to="selectedOperation.to"',
  ]) {
    if (miseboxConsolePreview.includes(forbidden)) {
      violations.push(
        `${MISEBOX_CONSOLE_PREVIEW_PATH}: public Console preview acquired live authority (${forbidden})`
      )
    }
  }

  for (const required of [
    '<slot name="mark"',
    '<slot name="title"',
    '<slot name="subtitle"',
    '<slot name="status"',
    'landing-product-preview-frame__topbar',
    'landing-product-preview-frame__controls',
    'landing-product-preview-frame__content',
    'landing-product-preview-frame__footer',
    "emit('update:modelValue'",
  ]) {
    if (!previewFrame.includes(required)) {
      violations.push(
        `${CORE_PREVIEW_FRAME_PATH}: missing shared frame contract (${required})`
      )
    }
  }

  for (const forbidden of [
    'glow?:',
    'markHalo?:',
    'strongShadow?:',
    'preview-frame--glow',
    'preview-frame--mark-halo',
    'preview-frame--strong-shadow',
  ]) {
    if (previewFrame.includes(forbidden)) {
      violations.push(
        `${CORE_PREVIEW_FRAME_PATH}: reintroduced decorative preview chrome (${forbidden})`
      )
    }
  }

  const consumers = [
    {
      filePath: MISEBOX_ADAPTER_PATH,
      source: miseboxAdapter,
      heroOrbitTag: 'MiseboxPowerCards',
      proofSectionCount: 3,
      catalogueCount: 3,
      required: [
        '<LandingProductIndex',
        '#hero-preview',
        '#console',
        '#specifics',
        '#apps',
        '#tools',
        '#solutions',
        '#operations',
        '<MiseboxPowerCards',
        '<LandingProductProofSection',
        '<MiseboxLandingConsolePreview',
        '<MiseboxLandingOrderingPreview',
        '<MiseboxLandingFinancePreview',
        '<LandingAppCollection',
        '<LandingProductCatalogue',
        ':featured-ids="featuredAppIds"',
        ':media-overrides="featuredAppMedia"',
        'wordmarkUrl:',
        'useEcosystemAppCollection',
        "import { metaContent } from '../../../meta'",
        'metaContent.operations',
        'metaContent.solutions',
        'toolsCatalogue',
        'solutionsCatalogue',
        'operationsCatalogue',
        "to: '/tools/ordering'",
        ':limit="3"',
        "to: '/get-started'",
        "to: '/console/kitchen'",
        "to: '/operations'",
        'Get started',
        'Go to console',
        'Explore Kitchen Operations',
      ],
      forbidden: ['#ecosystems'],
    },
    {
      filePath: FIREUX_ADAPTER_PATH,
      source: fireuxAdapter,
      heroOrbitTag: 'FireUXLandingCardOrbit',
      proofSectionCount: 1,
      catalogueCount: 2,
      required: [
        '<LandingProductIndex',
        '#hero-preview',
        '#console',
        '#ecosystems',
        '#apps',
        '#solutions',
        '#operations',
        '<FireUXLandingCardOrbit',
        '<LandingProductProofSection',
        '<FireUXLandingPreview',
        '<LandingEcosystems',
        '<LandingAppCollection',
        '<LandingProductCatalogue',
        "import { metaContent } from '../../../meta'",
        'metaContent.operations',
        'metaContent.solutions',
        'solutionsCatalogue',
        'operationsCatalogue',
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
      ['hero-preview slot', /#hero-preview\b/g],
      [
        `${consumer.heroOrbitTag} hero orbit`,
        new RegExp(`<${consumer.heroOrbitTag}\\b`, 'g'),
      ],
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
      ['hero-preview', `<${consumer.heroOrbitTag}`],
      ['console', '<LandingProductProofSection'],
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

    if (/landing-product(?:__|-proof__|-catalogue__)/.test(consumer.source)) {
      violations.push(
        `${consumer.filePath}: copied shared landing presentation into the project`
      )
    }
  }

  for (const [slotName, marker] of [
    ['specifics', '<MiseboxLandingOrderingPreview'],
    ['specifics', '<MiseboxLandingFinancePreview'],
    ['tools', '<LandingProductCatalogue'],
  ]) {
    if (!slotContains(miseboxAdapter, slotName, marker)) {
      violations.push(
        `${MISEBOX_ADAPTER_PATH}: ${slotName} slot must own ${marker}`
      )
    }
  }

  if (!slotContains(fireuxAdapter, 'ecosystems', '<LandingEcosystems')) {
    violations.push(
      `${FIREUX_ADAPTER_PATH}: optional ecosystems slot must own the FireUX ecosystem projection`
    )
  }

  for (const required of [
    'LandingCardOrbitItem',
    'LandingCardOrbitDataSource',
    'dataSource: LandingCardOrbitDataSource',
    ':data-orbit-source="dataSource"',
    'name="item"',
    'inert',
    '@keydown.left.prevent',
    '@keydown.right.prevent',
    'window.matchMedia(REDUCED_MOTION_QUERY)',
    'new IntersectionObserver',
    'document.visibilityState',
    'const INTRO_DURATION = 2200',
    'const INTRO_YAW_TURNS = 1',
    'const IDLE_SPEED = TAU / 20000',
    'const INTRO_START_SPEED =',
    'const decelerationTravel =',
    '2.5 * progress ** 4',
    'let orbitDirection: -1 | 1 = 1',
    'Math.random() < 0.5 ? -1 : 1',
    'opacity: 1',
    'const MAX_DEPTH_BLUR = 1.6',
    "'--landing-orbit-depth-blur'",
    'filter: blur(var(--landing-orbit-depth-blur, 0))',
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
    [MISEBOX_CARD_ORBIT_PATH, miseboxCardOrbit],
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
    'dataSource: LandingCardOrbitDataSource',
    ':data-source="dataSource"',
  ]) {
    if (!miseboxCardOrbit.includes(required)) {
      violations.push(
        `${MISEBOX_CARD_ORBIT_PATH}: Misebox orbit must pass through its declared data source (${required})`
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
    '<MiseboxElementOrbit',
    ':data-source="orbit.dataSource"',
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
    "import('fireux-kitchens/runtime/demo/kitchen/scenarios')",
    "import('fireux-suppliers/runtime/demo/supplier/scenarios')",
    'const kitchens: MiseboxPowerCardsProductDemo[\'cards\'][\'kitchens\']',
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
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: Demo orbit acquired a second live data authority (${forbidden})`
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
        `${MISEBOX_POWER_CARDS_PATH}: Demo-only orbit reintroduced a live Ingredient-dependent card (${forbidden})`
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
        `${MISEBOX_POWER_CARDS_DEMO_PATH}: Demo orbit contains manufactured domain presentation (${forbidden})`
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
      [MISEBOX_CARD_ORBIT_PATH, miseboxCardOrbit],
      [MISEBOX_POWER_CARDS_PATH, miseboxPowerCards],
    ]) {
      if (source.includes(forbidden)) {
        violations.push(
          `${filePath}: card orbit must not couple ordinary page scrolling to animation (${forbidden})`
        )
      }
    }
  }

  const previewConsumers = [
    {
      filePath: FIREUX_PREVIEW_PATH,
      source: fireuxPreview,
      required: [
        'class="fireux-home__preview"',
        'content-inset',
        'content-stable',
        'fireux-home__request',
        'fireux-home__app-grid',
        'fireux-home__operation-grid',
        '--fireux-preview-ink',
      ],
      forbidden: [
        'fireux-home__delivery-preview',
        'fireux-home__preview-topbar',
        'fireux-home__preview-mark',
        'fireux-home__managed-status',
        'fireux-home__preview-flow',
        'fireux-home__preview-content',
        'fireux-home__preview-footer',
      ],
    },
  ]

  for (const preview of previewConsumers) {
    for (const required of [
      '<LandingProductPreviewFrame',
      '</LandingProductPreviewFrame>',
      '#mark',
      '#title',
      '#subtitle',
      '#status',
      '@update:model-value',
      ...preview.required,
    ]) {
      if (!preview.source.includes(required)) {
        violations.push(
          `${preview.filePath}: missing shared preview-frame use (${required})`
        )
      }
    }

    for (const [label, pattern] of [
      [
        'LandingProductPreviewFrame opening tag',
        /<LandingProductPreviewFrame\b/g,
      ],
      [
        'LandingProductPreviewFrame closing tag',
        /<\/LandingProductPreviewFrame>/g,
      ],
    ]) {
      const matches = count(preview.source, pattern)
      if (matches !== 1) {
        violations.push(
          `${preview.filePath}: expected exactly one ${label}, found ${matches}`
        )
      }
    }

    for (const forbidden of preview.forbidden) {
      if (preview.source.includes(forbidden)) {
        violations.push(
          `${preview.filePath}: reintroduced project-owned preview chrome (${forbidden})`
        )
      }
    }

    if (/landing-product-preview-frame__/.test(preview.source)) {
      violations.push(
        `${preview.filePath}: copied Core preview-frame presentation into the project`
      )
    }
  }

  for (const required of [
    "'landing-product--full-hero': heroLayout === 'proof-wide'",
    'width: 100dvw',
    'margin-inline: calc(50% - 50dvw)',
    "querySelectorAll<HTMLElement>('[data-landing-reveal]')",
    "window.matchMedia('(prefers-reduced-motion: reduce)')",
    'activeRevealObservers',
  ]) {
    if (!core.includes(required)) {
      violations.push(
        `${CORE_PATH}: missing mobile-first full-viewport hero seam (${required})`
      )
    }
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
