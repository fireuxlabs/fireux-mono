// @fireux-script
// last_used: 2026-07-23
// usage_note: keeps the shared product landing mobile-first and product truth at each project edge.
// Concurrent edit — 2026-07-23 02:43 CEST — Guard the central landing surface and its Misebox adapter.
// Concurrent edit — 2026-07-23 12:13 CEST — Extend the shared landing contract to the FireUX sibling consumer.

import { readFileSync } from 'node:fs'
import path from 'node:path'

const CORE_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductIndex.vue'
const CORE_APP_COLLECTION_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/AppCollection.vue'
const CORE_PREVIEW_FRAME_PATH =
  'packages/core/fireux-core/src/runtime/components/landing/ProductPreviewFrame.vue'
const MISEBOX_ADAPTER_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/Index.vue'
const MISEBOX_PREVIEW_PATH =
  'projects/misebox/misebox-app/app/components/Misebox/Landing/Preview.vue'
const MISEBOX_META_PATH =
  'projects/misebox/misebox-app/app/meta.ts'
const MISEBOX_JOBS_MIDDLEWARE_PATH =
  'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts'
const MISEBOX_JOBS_LAYOUT_PATH =
  'projects/misebox/misebox-app/app/layouts/misebox-jobs.vue'
const FIREUX_ADAPTER_PATH =
  'projects/fireux/fireux-app/app/components/FireUX/Landing/Index.vue'
const FIREUX_PREVIEW_PATH =
  'projects/fireux/fireux-app/app/components/FireUX/Landing/Preview.vue'
const MOBILE_FIRST_MARKER =
  '/* Mobile-first baseline. Width queries below may only enhance this layout. */'

function read(repoRoot, filePath) {
  return readFileSync(path.join(repoRoot, filePath), 'utf8')
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length
}

function extractScopedStyle({ filePath, source, violations }) {
  const allOpeningTags = [...source.matchAll(/<style\b[^>]*>/g)]
  const openingTags = [
    ...source.matchAll(/<style\b(?=[^>]*\bscoped\b)[^>]*>/g),
  ]

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
  return selectors.map(selector => selector.trim()).filter(Boolean)
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
          roundDepth === 0
          && squareDepth === 0
          && (character === '{' || character === ';')
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
        parseRange(
          openingIndex + 1,
          closingIndex,
          [...mediaContext, prelude]
        )
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
    .filter(media => media.hasMinWidth)
    .reduce(
      (first, media) => Math.min(first, media.start),
      Number.POSITIVE_INFINITY
    )

  for (const media of mediaQueries.filter(query => query.hasMaxWidth)) {
    violations.push(
      `${filePath}: max-width media queries are forbidden (${media.prelude})`
    )
  }

  for (const selector of selectors) {
    const normalizedSelector = normalizeSelector(selector)
    const matchingRules = rules.filter(rule =>
      rule.selectors.some(
        candidate => normalizeSelector(candidate) === normalizedSelector
      )
    )
    const baselineRules = matchingRules.filter(
      rule =>
        rule.mediaContext.length === 0
        && rule.start > markerIndex
        && rule.start < firstMinWidthIndex
    )

    if (baselineRules.length !== 1) {
      violations.push(
        `${filePath}: ${selector} needs exactly one unconditioned mobile default before the first min-width query (found ${baselineRules.length})`
      )
    }

    if (
      matchingRules.some(
        rule =>
          rule.mediaContext.length === 0
          && rule.start > firstMinWidthIndex
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
      media =>
        media.hasMinWidth
        && media.prelude
          .replace(/\s+/g, '')
          .includes(`(min-width:${normalizedBreakpoint})`)
    )

    if (!hasBreakpoint) {
      violations.push(`${filePath}: missing progressive enhancement breakpoint ${breakpoint}`)
    }
  }
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const core = read(repoRoot, CORE_PATH)
  const appCollection = read(repoRoot, CORE_APP_COLLECTION_PATH)
  const previewFrame = read(repoRoot, CORE_PREVIEW_FRAME_PATH)
  const miseboxAdapter = read(repoRoot, MISEBOX_ADAPTER_PATH)
  const miseboxPreview = read(repoRoot, MISEBOX_PREVIEW_PATH)
  const miseboxMeta = read(repoRoot, MISEBOX_META_PATH)
  const miseboxJobsMiddleware = read(repoRoot, MISEBOX_JOBS_MIDDLEWARE_PATH)
  const miseboxJobsLayout = read(repoRoot, MISEBOX_JOBS_LAYOUT_PATH)
  const fireuxAdapter = read(repoRoot, FIREUX_ADAPTER_PATH)
  const fireuxPreview = read(repoRoot, FIREUX_PREVIEW_PATH)
  const violations = []

  checkMobileFirst({
    filePath: CORE_PATH,
    source: core,
    selectors: [
      '.landing-product__hero-actions',
      '.landing-product__loop',
      '.landing-product__operation-grid',
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
    filePath: MISEBOX_PREVIEW_PATH,
    source: miseboxPreview,
    selectors: [
      '.misebox-home__preview',
      '.misebox-home__preview-metrics',
      '.misebox-home__ticket-stack',
    ],
    breakpoints: ['640px'],
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

  if (!core.includes('<slot name="hero-preview"')) {
    violations.push(`${CORE_PATH}: missing the hero-preview slot`)
  }

  if (!core.includes('<slot name="apps"')) {
    violations.push(`${CORE_PATH}: missing the shared App collection slot`)
  }

  if (/<main\b/.test(core)) {
    violations.push(`${CORE_PATH}: must not nest another main landmark inside the landing layout`)
  }

  for (const forbidden of ['Misebox', 'fireux-kitchens', "'/demo", '"/demo']) {
    if (core.includes(forbidden)) {
      violations.push(`${CORE_PATH}: contains project-owned truth (${forbidden})`)
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
      violations.push(`${CORE_APP_COLLECTION_PATH}: missing public App collection contract (${required})`)
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
      violations.push(`${CORE_APP_COLLECTION_PATH}: bypasses public App projection or owns project truth (${forbidden})`)
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
      violations.push(`${CORE_PREVIEW_FRAME_PATH}: missing shared frame contract (${required})`)
    }
  }

  const consumers = [
    {
      filePath: MISEBOX_ADAPTER_PATH,
      source: miseboxAdapter,
      previewTag: 'MiseboxLandingPreview',
      required: [
        '<LandingProductIndex',
        '#hero-preview',
        '#apps',
        '<MiseboxLandingPreview',
        '<LandingAppCollection',
        'useEcosystemAppCollection',
        ":exclude-ids=\"['misebox-app']\"",
        "from 'fireux-kitchens/runtime/content/operations'",
      ],
    },
    {
      filePath: FIREUX_ADAPTER_PATH,
      source: fireuxAdapter,
      previewTag: 'FireUXLandingPreview',
      required: [
        '<LandingProductIndex',
        '#hero-preview',
        '<FireUXLandingPreview',
        "import { metaContent } from '../../../meta'",
        'metaContent.operations',
      ],
    },
  ]

  for (const consumer of consumers) {
    for (const required of consumer.required) {
      if (!consumer.source.includes(required)) {
        violations.push(`${consumer.filePath}: missing ${required}`)
      }
    }

    for (const [label, pattern] of [
      ['LandingProductIndex opening tag', /<LandingProductIndex\b/g],
      ['LandingProductIndex closing tag', /<\/LandingProductIndex>/g],
      ['hero-preview slot', /#hero-preview\b/g],
      [`${consumer.previewTag} consumer`, new RegExp(`<${consumer.previewTag}\\b`, 'g')],
    ]) {
      const matches = count(consumer.source, pattern)
      if (matches !== 1) {
        violations.push(
          `${consumer.filePath}: expected exactly one ${label}, found ${matches}`
        )
      }
    }

    if (/<style\b/.test(consumer.source)) {
      violations.push(`${consumer.filePath}: landing adapter must remain CSS-free`)
    }

    if (/landing-product__/.test(consumer.source)) {
      violations.push(`${consumer.filePath}: copied shared landing presentation into the project`)
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
    {
      filePath: MISEBOX_PREVIEW_PATH,
      source: miseboxPreview,
      required: [
        'class="misebox-home__preview"',
        'controls-layout="flow"',
        'misebox-home__preview-metrics',
        'misebox-home__ticket-stack',
        '--misebox-preview-ink',
      ],
      forbidden: [
        'misebox-home__service-preview',
        'misebox-home__preview-topbar',
        'misebox-home__preview-mark',
        'misebox-home__live-status',
        'misebox-home__preview-flow',
        'misebox-home__preview-content',
        'misebox-home__preview-footer',
        'misebox-home__preview-chevron',
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
        violations.push(`${preview.filePath}: missing shared preview-frame use (${required})`)
      }
    }

    for (const [label, pattern] of [
      ['LandingProductPreviewFrame opening tag', /<LandingProductPreviewFrame\b/g],
      ['LandingProductPreviewFrame closing tag', /<\/LandingProductPreviewFrame>/g],
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

  for (const forbidden of ["to: '/jobs'", "to: '/professionals'", "to: '/suppliers'"]) {
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
      violations.push(`${MISEBOX_META_PATH}: missing focused product truth (${required})`)
    }
  }

  for (const forbidden of [
    'chef job platform',
    'hospitality recruitment platform',
    'restaurant recruitment',
  ]) {
    if (miseboxMeta.includes(forbidden)) {
      violations.push(`${MISEBOX_META_PATH}: retains mixed-audience SEO (${forbidden})`)
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
        ...violations.map(violation => `- ${violation}`),
        '- Keep phone flow unconditioned, enhance with min-width only, and keep product truth at the project edge.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ shared product landing and project adapters valid')
}
