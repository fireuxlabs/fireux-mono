// @fireux-script
// last_used: 2026-07-23
// usage_note: enforces the shared Nuxt UI and FireUX CSS spine.
// FILE: scripts/guards/css-system.mjs
// Concurrent edit — 2026-07-20 23:33 CEST — Final app CSS pass: enforce semantic project colors.
// Concurrent edit — 2026-07-21 13:08 CEST — CSS architecture pass: enforce the semantic core stylesheet cascade and retired catch-all paths.
// Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: enforce an import-only core entrypoint and Nuxt UI-owned radius default.
// Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: keep retired editor composition out of the global cascade.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const CORE_STYLE_ENTRY_PATH =
  'packages/core/fireux-core/src/runtime/assets/styles/main.scss'
const CORE_PAGE_TRANSITION_STYLE_PATH =
  'packages/core/fireux-core/src/runtime/assets/styles/scss/integrations/nuxt-page-transition.scss'
const FIREUX_CONFIG_PATH =
  'packages/core/fireux-core/src/config/app/fireux.config.ts'
const CORE_AMBIENT_FIELD_PATH =
  'packages/core/fireux-core/src/runtime/utils/ambient-field.ts'
const AMBIENT_EFFECT_CONSUMERS = [
  {
    page: 'projects/fireux/fireux-app/app/pages/product.vue',
    visual: 'projects/fireux/fireux-app/app/components/Landing/Stars.vue',
    deterministic: true,
  },
  {
    page: 'projects/misebox/misebox-app/app/pages/product.vue',
    visual: 'projects/misebox/misebox-app/app/components/Landing/Steam.vue',
    deterministic: false,
  },
]
const RETIRED_AMBIENT_INITIALIZER_PATHS = [
  'projects/fireux/fireux-app/app/composables/useStarfield.ts',
  'packages/ecosystem/fireux-fireux/src/runtime/composables/fireux/app/utils/effects/useLandingEffect.ts',
  'packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/app/utils/effects/useLandingEffect.ts',
]
const CORE_STYLE_CASCADE = [
  './scss/atoms/tokens',
  './scss/atoms/typography',
  './scss/molecules/dev-note',
  './scss/molecules/form-section-copy',
  './scss/molecules/forms',
  './scss/molecules/inset-panel',
  './scss/molecules/card-surfaces',
  './scss/molecules/pill',
  './scss/organisms/collection-grid',
  './scss/organisms/public-action-card',
  './scss/organisms/collection-layouts',
  './scss/molecules/card-avatar-shades',
  './scss/molecules/entity-card-cell',
  './scss/molecules/entity-card-panel',
  './scss/molecules/entity-card-cover',
  './scss/molecules/entity-card-details',
  './scss/molecules/preview-cards',
  './scss/organisms/profile-cards',
  './scss/organisms/public-profile-surfaces',
  './scss/organisms/page-layouts',
  './scss/organisms/workspace-surface',
  './scss/molecules/workspace-card-header',
  './scss/molecules/workspace-summary',
  './scss/organisms/landing-hero',
  './scss/organisms/landing-index-sections',
  './scss/organisms/workspace-profiles',
  './scss/integrations/nuxt-page-transition',
]
const RETIRED_CORE_STYLE_PATHS = [
  'packages/core/fireux-core/src/runtime/assets/styles/scss/atoms/forms.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/card-foundation.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/card-preview-variant.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/workspace-focus.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/entity-cards.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/metrics.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/molecules/usage-cta.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/cards.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/plugins.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/profiles.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-layouts.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/landing-index-flow.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/page-motion.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/panel-layouts.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/profile-editor.scss',
  'packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/solutions-grid.scss',
]
const STYLE_EXTENSIONS = new Set([
  '.css',
  '.less',
  '.pcss',
  '.postcss',
  '.sass',
  '.scss',
  '.styl',
  '.vue',
])
const AUTHORED_TEXT_EXTENSIONS = new Set([
  ...STYLE_EXTENSIONS,
  '.cjs',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

const OBSOLETE_VARIABLE_RE =
  /--(?:text-primary|text-secondary|ui-border-subtle|ui-surface|ui-text-(?:400|500|600)|ui-primary-500)(?![A-Za-z0-9_-])/g
const NUXT_BASELINE_PATH =
  'packages/core/fireux-core/src/config/app/nuxt-baseline.ts'
const DEAD_NUXT_UI_CONSOLE_PANEL_RE = /\bworkspacePanel\b/g
const LOCAL_NUXT_PAGE_TRANSITION_PROP_RE =
  /<NuxtPage\b[^>]*\s+:?transition\s*=/g
const COPIED_CORE_PAGE_TRANSITION_RE =
  /\.fx-page-(?:enter|leave)-(?:active|from|to)\b/g
const DERIVED_RADIUS_DECLARATION_RE =
  /--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\s*:/g
const DERIVED_RADIUS_REFERENCE_RE =
  /var\(\s*--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\b/g
const BORDER_RADIUS_DECLARATION_RE = /\bborder-radius\s*:\s*([^;}\n]+)/g
const RADIUS_CUSTOM_PROPERTY_RE =
  /(--[A-Za-z0-9_-]*radius[A-Za-z0-9_-]*)\s*:\s*([^;}\n]+)/g
const RADIUS_CUSTOM_PROPERTY_REFERENCE_RE =
  /var\(\s*(--[A-Za-z0-9_-]*radius[A-Za-z0-9_-]*)\b/g
const ARBITRARY_RADIUS_CLASS_RE = /\brounded(?:-[trblxyse]{1,2})?-\[([^\]]+)\]/g
const OUT_OF_SCALE_RADIUS_CLASS_RE =
  /\brounded(?:-[trblxyse]{1,2})?-(?:4xl|5xl|6xl|7xl|8xl|9xl)\b/g
const ALLOWED_RADIUS_CUSTOM_PROPERTIES = new Set([
  '--ui-radius',
  '--menu-radius',
  '--menu-radius-control',
])
const APPROVED_ARBITRARY_RADIUS_CLASSES = new Map([
  [
    'projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Url.vue',
    new Set(['22%']),
  ],
  ['projects/fireux/go-qr/app/pages/doc/[slug]/qr.vue', new Set(['22%'])],
])
const SPACING_DECLARATION_RE =
  /(?<![A-Za-z0-9_-])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|gap|row-gap|column-gap)\s*:\s*([^;}]+)/g
const GRID_SPACING_LITERAL_RE = /(-?(?:\d+(?:\.\d+)?|\.\d+))(rem|px)\b/g
const SPACING_CUSTOM_PROPERTY_RE =
  /(--[A-Za-z0-9_-]*(?:space|spacing)[A-Za-z0-9_-]*)\s*:\s*([^;}\n]+)/g
const SPACING_CUSTOM_PROPERTY_REFERENCE_RE =
  /var\(\s*(--[A-Za-z0-9_-]*(?:space|spacing)[A-Za-z0-9_-]*)\b/g
const ARBITRARY_SPACING_CLASS_RE =
  /(?<![A-Za-z0-9_-])-?(?:m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy])-\[([^\]]+)\]/g
const APPROVED_ARBITRARY_SPACING_CLASSES = new Map()
const CANONICAL_MENU_SPACING_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/menu/components/styles/menu-detail/atoms/frame.css'
const CANONICAL_MENU_SPACING_PROPERTIES = new Map([
  ['--menu-space-2xs', 'var(--spacing)'],
  ['--menu-space-xs', 'calc(var(--spacing) * 1.6)'],
  ['--menu-space-sm', 'calc(var(--spacing) * 3)'],
  ['--menu-space-md', 'calc(var(--spacing) * 4)'],
  ['--menu-space-lg', 'calc(var(--spacing) * 8)'],
])
const APPROVED_NON_LAYOUT_SPACING_PROPERTIES = new Map([
  [
    'packages/extensions/fireux-kitchens/src/runtime/menu/components/Detail/Header.vue',
    new Map([['--menu-header-chip-spacing', 'var(--tracking-widest)']]),
  ],
])
const DIRECT_SPACING_LITERAL_EXCLUDED_PREFIXES = [
  // This harness intentionally runs without Tailwind or Nuxt UI.
  'projects/fireux/no-fireux-embed-test/',
]
const APPROVED_DIRECT_SPACING_VALUES = new Map([
  // Exact reviewed microgeometry, artwork, or viewport geometry; not reusable rhythm.
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/orders/useKitchenOrderReceiptPrint.ts',
    new Set([
      'padding-block:10px',
      'margin-top:4px',
      'padding:6px 0',
      'gap:10px',
      'margin-top:6px',
    ]),
  ],
  [
    'packages/core/fireux-core/src/runtime/components/dev/DebugPanel.vue',
    new Set([
      'padding:12px',
      'margin-bottom:8px',
      'margin:6px 0 0',
      'margin:2px 0 0',
      'gap:8px',
      'margin:8px 0 12px',
      'gap:10px',
      'padding:6px 10px',
      'padding:10px',
      'margin-top:8px',
    ]),
  ],
  [
    'projects/fireux/fireux-app/app/pages/design/atoms/img.vue',
    new Set(['padding:20px', 'gap:10px']),
  ],
  [
    'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/Hero.vue',
    new Set([
      'padding:1.35rem 1rem calc(6.75rem + env(safe-area-inset-bottom))',
      'margin-inline:max(2rem, calc((100vw - 80rem) / 2))',
      'padding:10rem 0 8rem',
    ]),
  ],
  [
    'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/Surfaces.vue',
    new Set(['padding:3.75rem 1rem calc(10rem + env(safe-area-inset-bottom))']),
  ],
  [
    'projects/misebox/la-tap-berne/app/components/LaTapBerne/Hero.vue',
    new Set([
      'padding:clamp(10rem, 18vw, 13rem) 0 clamp(11rem, 18vw, 13rem)',
      'padding-top:11rem',
    ]),
  ],
  [
    'projects/slap/slap-app/app/pages/index.vue',
    new Set([
      'padding-block:7rem 8.75rem',
      'padding:3rem max(1rem, calc((100vw - 76rem) / 2))',
      'padding-block:22rem 8.75rem',
    ]),
  ],
])
const FONT_SIZE_DECLARATION_RE = /\bfont-size\s*:\s*([^;}\n]+)/g
const FONT_WEIGHT_DECLARATION_RE = /\bfont-weight\s*:\s*([^;}\n]+)/g
const LINE_HEIGHT_DECLARATION_RE = /\bline-height\s*:\s*([^;}\n]+)/g
const LETTER_SPACING_DECLARATION_RE = /\bletter-spacing\s*:\s*([^;}\n]+)/g
const FONT_FAMILY_DECLARATION_RE = /\bfont-family\s*:\s*([^;}\n]+)/g
const FONT_SHORTHAND_DECLARATION_RE = /(?<![A-Za-z0-9_-])font\s*:\s*([^;}\n]+)/g
const FONT_FAMILY_CUSTOM_PROPERTY_RE =
  /(--[A-Za-z0-9_-]*(?:font|typeface)[A-Za-z0-9_-]*)\s*:\s*([^;}\n]+)/g
const TYPOGRAPHY_LENGTH_LITERAL_RE =
  /(?<![A-Za-z0-9_.-])(-?(?:\d+(?:\.\d+)?|\.\d+))(rem|px)\b/g
const ARBITRARY_FONT_SIZE_CLASS_RE =
  /\btext-\[((?:-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ch|vw|vh|dvw|dvh))|(?:(?:calc|clamp|min|max)\([^\]]+\)))\]/g
const ARBITRARY_LINE_HEIGHT_CLASS_RE = /\bleading-\[([^\]]+)\]/g
const ARBITRARY_TRACKING_CLASS_RE = /\btracking-\[([^\]]+)\]/g
const ARBITRARY_FONT_WEIGHT_CLASS_RE = /\bfont-\[(\d{3})\]/g
const ARBITRARY_SEMANTIC_TEXT_COLOR_RE =
  /\btext-\[(?:color:)?var\(--ui-(?:text-(?:dimmed|muted|toned|highlighted)|primary)\)\]/g
const RAW_PALETTE_UTILITY_RE =
  /\b(?:text|bg|border|ring|outline|divide|placeholder)-(?:primary|secondary|success|info|warning|error|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-[0-9]{2,3}(?:\/[0-9]{1,3})?\b/g
const RAW_COMPONENT_COLOR_RE =
  /\bcolor\s*(?:=|:)\s*(["'])(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone)\1/g
const STALE_NON_NUXT_COLOR_UTILITY_RE =
  /\b(?:text-foreground|text-muted-foreground|bg-background|border-border)\b/g
const APPROVED_PROJECT_RAW_PALETTE_UTILITIES = new Map([
  // Deliberately fixed dark marketing panels with their own contrast hierarchy.
  [
    'projects/misebox/misebox-app/app/pages/about.vue',
    new Set([
      'bg-gray-950',
      'bg-gray-900',
      'text-gray-300',
      'text-gray-400',
      'text-primary-300',
      'text-primary-200',
    ]),
  ],
  [
    'projects/misebox/misebox-app/app/pages/road-map.vue',
    new Set([
      'bg-gray-950',
      'bg-gray-900',
      'text-gray-300',
      'text-primary-300',
    ]),
  ],
  // Fixed white QR/sticker output must remain predictable and scannable.
  [
    'projects/buenohost/buenohost-app/app/pages/index.vue',
    new Set(['text-slate-950', 'text-slate-500', 'border-slate-200']),
  ],
  [
    'projects/fireux/go-qr/app/pages/doc/[slug]/qr.vue',
    new Set([
      'text-slate-950',
      'text-slate-500',
      'text-slate-600',
      'text-slate-900',
      'border-slate-200',
    ]),
  ],
])
const INVALID_TYPOGRAPHY_VARIABLE_RE = /var\(\s*--leading-none\b/g
const TAILWIND_FONT_SIZE_TOKENS = new Map([
  [12, '--text-xs'],
  [14, '--text-sm'],
  [16, '--text-base'],
  [18, '--text-lg'],
  [20, '--text-xl'],
  [24, '--text-2xl'],
  [30, '--text-3xl'],
  [36, '--text-4xl'],
  [48, '--text-5xl'],
  [60, '--text-6xl'],
  [72, '--text-7xl'],
  [96, '--text-8xl'],
  [128, '--text-9xl'],
])
const TAILWIND_FONT_WEIGHT_TOKENS = new Map([
  ['100', '--font-weight-thin'],
  ['200', '--font-weight-extralight'],
  ['300', '--font-weight-light'],
  ['400', '--font-weight-normal'],
  ['500', '--font-weight-medium'],
  ['600', '--font-weight-semibold'],
  ['700', '--font-weight-bold'],
  ['800', '--font-weight-extrabold'],
  ['900', '--font-weight-black'],
])
const TAILWIND_LINE_HEIGHT_TOKENS = new Map([
  ['1.25', '--leading-tight'],
  ['1.375', '--leading-snug'],
  ['1.5', '--leading-normal'],
  ['1.625', '--leading-relaxed'],
  ['2', '--leading-loose'],
])
const TAILWIND_TRACKING_TOKENS = new Map([
  ['-0.05em', '--tracking-tighter'],
  ['-0.025em', '--tracking-tight'],
  ['0em', '--tracking-normal'],
  ['0.025em', '--tracking-wide'],
  ['0.05em', '--tracking-wider'],
  ['0.1em', '--tracking-widest'],
])
const OWNED_TYPOGRAPHY_DELTA_PATHS = new Set([
  // Component-owned artwork, output geometry, or cohesive tenant display type.
  'packages/core/fireux-core/src/runtime/components/Design/PaletteStrip.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/orders/useKitchenOrderReceiptPrint.ts',
  'packages/extensions/fireux-kitchens/src/runtime/menu/components/Json.vue',
  'projects/fireux/go-qr/app/pages/doc/[slug]/qr.vue',
  'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/Hero.vue',
  'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/RouteCard.vue',
  'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/Surfaces.vue',
  'projects/misebox/baeren-ringgenberg/app/components/Baeren/Home/Title.vue',
  'projects/misebox/baeren-ringgenberg/app/components/Baeren/Nav.vue',
  'projects/misebox/bangin-coffee/app/assets/styles/main.css',
  'projects/misebox/bangin-coffee/app/pages/index.vue',
  'projects/misebox/la-tap-berne/app/components/LaTapBerne/Copy.vue',
  'projects/misebox/la-tap-berne/app/components/LaTapBerne/Hero.vue',
  'projects/misebox/la-tap-berne/app/components/LaTapBerne/MiseboxLink.vue',
  'projects/slap/slap-app/app/pages/index.vue',
  'projects/slap/yellow-velo/app/pages/index.vue',
])
const TYPOGRAPHY_LITERAL_EXCLUDED_PREFIXES = [
  // This harness intentionally runs without Tailwind or Nuxt UI.
  'projects/fireux/no-fireux-embed-test/',
]
const APPROVED_ARBITRARY_TYPOGRAPHY_CLASSES = new Map([
  [
    'packages/core/fireux-core/src/runtime/app/components/ErrorPage.vue',
    new Set(['tracking-[0.3em]', 'tracking-[0.32em]']),
  ],
  [
    'packages/core/fireux-core/src/runtime/components/layouts/dev/Nav.vue',
    new Set(['text-[10px]']),
  ],
  [
    'packages/core/fireux-core/src/runtime/pages/dev/avatars.vue',
    new Set(['text-[10px]', 'text-[11px]']),
  ],
  [
    'projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Url.vue',
    new Set(['text-[clamp(0.45rem,4vw,1rem)]']),
  ],
])
const LEGACY_TYPOGRAPHY_ROLE_OVERLAYS = [
  {
    pattern: /fx-type-section-title\s+text-3xl\s+font-semibold/g,
    replacement: 'fx-type-section-title',
  },
  {
    pattern: /fx-type-card-title\s+text-lg\b/g,
    replacement: 'fx-type-card-heading',
  },
]
const LEGACY_PAGE_SPACING_RECIPES = [
  /space-y-16\s+pb-20/g,
  /space-y-12\s+pb-16/g,
  /space-y-12\s+pb-16\s+sm:space-y-16\s+sm:pb-20/g,
]
const LEGACY_LIST_SPACING_RECIPES = [/space-y-2\s+pl-5/g, /pl-5\s+space-y-2/g]
const LEGACY_ENTITY_CARD_RECIPE = [
  'flex',
  'w-full',
  'items-start',
  'gap-3',
  'rounded-lg',
  'border',
  'border-gray-200/60',
  'bg-white/70',
  'p-3',
  'shadow-sm',
  'transition',
  'hover:-translate-y-0.5',
  'hover:shadow-md',
  'dark:border-gray-800/60',
  'dark:bg-gray-900/40',
]
const LEGACY_ENTITY_CARD_RE = new RegExp(
  LEGACY_ENTITY_CARD_RECIPE.map(escapeRegex).join('\\s+'),
  'g'
)
const LEGACY_INSET_PANEL_RE = /rounded\s+border\s+border-default\s+p-3/g
const SHARED_DISCLOSURE_PATH =
  'packages/core/fireux-core/src/runtime/components/molecules/DisclosurePanel.vue'
const RAW_DISCLOSURE_RE = /<UCollapsible\b/g
const INLINE_DISCLOSURE_TRIGGER_RE =
  /group-data-\[state=open\]:rotate-180\s+transition-transform\s+duration-200/g
const INLINE_CARD_BODY_STACK_RE = /body\s*:\s*['"]space-y-4['"]/g
const LEGACY_DISABLED_SURFACE_RE =
  /(?:opacity-60\s+cursor-not-allowed|cursor-not-allowed\s+opacity-60)/g
const STATIC_CLASS_ATTRIBUTE_RE =
  /(?<![:@A-Za-z0-9_-])class\s*=\s*(["'])([\s\S]*?)\1/g
const DIRECT_MENU_DETAIL_CSS_IMPORT_RE =
  /\bimport\s*(?:\(\s*)?["']fireux-kitchens\/runtime\/assets\/styles\/menu-detail\.css["']\s*\)?/g
const VUE_STYLE_SOURCE_RE = /<style\b[^>]*\bsrc=(["'])(\.[^"']+)\1[^>]*>/g
const LEGACY_SEMANTIC_COLOR_PAIRS = [
  {
    pattern: /text-gray-900\s+dark:text-white/g,
    replacement: 'text-highlighted',
  },
  {
    pattern: /text-gray-600\s+dark:text-gray-300/g,
    replacement: 'text-toned',
  },
  {
    pattern: /text-gray-500\s+dark:text-gray-400/g,
    replacement: 'text-muted',
  },
]
const LEGACY_GENERIC_SURFACE_PAIRS = [
  {
    pattern: /border-gray-200\/60\s+bg-white\/70/g,
    replacement: 'border-default bg-default/70',
  },
  {
    pattern: /dark:border-gray-800\/50\s+dark:bg-gray-900\/40/g,
    replacement: 'border-default bg-default/70',
  },
  {
    pattern: /border-gray-200\/70\s+bg-white\/80/g,
    replacement: 'border-default bg-default/80',
  },
  {
    pattern: /dark:border-gray-800\/70\s+dark:bg-gray-900\/60/g,
    replacement: 'border-default bg-default/80',
  },
  {
    pattern: /dark:border-gray-800\/70\s+dark:bg-gray-900\/70/g,
    replacement: 'border-default bg-default/80',
  },
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  assertCoreStyleArchitecture(repoRoot)
  assertCorePageTransitionArchitecture(repoRoot)
  assertAmbientEffectArchitecture(repoRoot)

  const violations = {
    obsoleteVariables: [],
    deadNuxtUiConfigKeys: [],
    radiusDeclarations: [],
    radiusReferences: [],
    radiusValues: [],
    radiusCustomProperties: [],
    arbitraryRadiusClasses: [],
    outOfScaleRadiusClasses: [],
    spacingValues: [],
    spacingCustomProperties: [],
    arbitrarySpacingClasses: [],
    typographyValues: [],
    arbitraryTypographyClasses: [],
    arbitrarySemanticTextColors: [],
    rawPaletteUtilities: [],
    rawComponentColors: [],
    staleColorUtilities: [],
    legacyTypographyRoleOverlays: [],
    legacyPageSpacing: [],
    legacyListSpacing: [],
    legacyEntityCards: [],
    legacyInsetPanels: [],
    rawDisclosures: [],
    inlineDisclosureTriggers: [],
    inlineCardBodyStacks: [],
    legacyDisabledSurfaces: [],
    compoundWorkspaceSurfaceSpacing: [],
    redundantEntityCardLayout: [],
    redundantCollectionManagerControls: [],
    directMenuDetailCssImports: [],
    localNuxtPageTransitions: [],
    copiedCorePageTransitions: [],
    missingVueStyleSources: [],
    legacySemanticColors: [],
    legacyGenericSurfaces: [],
  }

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, repoRoot, violations)
  }

  if (hasViolations(violations)) {
    throw new Error(formatViolations(violations))
  }

  console.log('[guard] ✅ CSS system spine valid')
}

function assertCoreStyleArchitecture(repoRoot) {
  const violations = []

  for (const relativePath of RETIRED_CORE_STYLE_PATHS) {
    if (existsSync(path.join(repoRoot, relativePath))) {
      violations.push(`retired core stylesheet still exists: ${relativePath}`)
    }
  }

  const entryPath = path.join(repoRoot, CORE_STYLE_ENTRY_PATH)
  if (!existsSync(entryPath)) {
    violations.push(
      `missing core stylesheet entrypoint: ${CORE_STYLE_ENTRY_PATH}`
    )
  } else {
    const source = readFileSync(entryPath, 'utf8')
    const importPattern = /@use\s+['"]([^'"]+)['"]\s*;/g
    const actualImports = [...source.matchAll(importPattern)].map(
      (match) => match[1]
    )
    let previousIndex = -1

    for (const modulePath of CORE_STYLE_CASCADE) {
      const statement = `@use '${modulePath}';`
      const statementIndex = source.indexOf(statement)

      if (statementIndex === -1) {
        violations.push(`missing ordered core import: ${statement}`)
        continue
      }

      if (statementIndex < previousIndex) {
        violations.push(`core import is out of cascade order: ${statement}`)
      }

      previousIndex = Math.max(previousIndex, statementIndex)
    }

    for (const modulePath of actualImports) {
      if (!CORE_STYLE_CASCADE.includes(modulePath)) {
        violations.push(`unexpected core import: @use '${modulePath}';`)
      }
    }

    const entryImplementation = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
      .replace(importPattern, '')
      .trim()
    if (entryImplementation) {
      violations.push('core stylesheet entrypoint must remain import-only')
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] CSS architecture drift detected:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        `[guard] Keep ${CORE_STYLE_ENTRY_PATH} on the documented semantic modules and preserve its explicit cascade order.`,
      ].join('\n')
    )
  }
}

function assertCorePageTransitionArchitecture(repoRoot) {
  const violations = []
  const readRequiredSource = (relativePath) => {
    const filePath = path.join(repoRoot, relativePath)
    if (!existsSync(filePath)) {
      violations.push(`missing page-transition authority: ${relativePath}`)
      return ''
    }
    return readFileSync(filePath, 'utf8')
  }

  const transitionSource = readRequiredSource(CORE_PAGE_TRANSITION_STYLE_PATH)
  if (transitionSource) {
    for (const selector of [
      '.fx-page-enter-active',
      '.fx-page-leave-active',
      '.fx-page-enter-from',
      '.fx-page-leave-to',
    ]) {
      if (!transitionSource.includes(selector)) {
        violations.push(
          `${CORE_PAGE_TRANSITION_STYLE_PATH} is missing ${selector}`
        )
      }
    }

    if (
      !/transition:\s*[\s\S]*opacity\s+180ms\s+ease,[\s\S]*transform\s+180ms\s+ease\s*;/.test(
        transitionSource
      )
    ) {
      violations.push(
        `${CORE_PAGE_TRANSITION_STYLE_PATH} must keep the shared 180ms opacity/transform contract`
      )
    }
    if (
      !/translateY\(calc\(var\(--spacing\)\s*\*\s*3\)\)/.test(
        transitionSource
      ) ||
      !/translateY\(calc\(var\(--spacing\)\s*\*\s*-1\.5\)\)/.test(
        transitionSource
      )
    ) {
      violations.push(
        `${CORE_PAGE_TRANSITION_STYLE_PATH} must derive its movement from the shared spacing authority`
      )
    }

    const reducedMotionIndex = transitionSource.indexOf(
      '@media (prefers-reduced-motion: reduce)'
    )
    const reducedMotionSource =
      reducedMotionIndex === -1
        ? ''
        : transitionSource.slice(reducedMotionIndex)
    if (
      !reducedMotionSource.includes('transition: none;') ||
      !reducedMotionSource.includes('opacity: 1;') ||
      !reducedMotionSource.includes('transform: none;')
    ) {
      violations.push(
        `${CORE_PAGE_TRANSITION_STYLE_PATH} must disable opacity and movement for reduced motion`
      )
    }
  }

  const baselineSource = readRequiredSource(NUXT_BASELINE_PATH)
  if (
    baselineSource &&
    (!/FIREUX_PAGE_TRANSITION\s*=\s*\{[\s\S]*?name:\s*['"]fx-page['"][\s\S]*?mode:\s*['"]out-in['"][\s\S]*?\}\s*as const/.test(
      baselineSource
    ) ||
      !/function\s+configurePageTransition\b/.test(baselineSource) ||
      !/\bapp\.pageTransition\s*=\s*\{\s*\.\.\.FIREUX_PAGE_TRANSITION\s*\}/.test(
        baselineSource
      ))
  ) {
    violations.push(
      `${NUXT_BASELINE_PATH} must own the native Nuxt fx-page default`
    )
  }
  if (baselineSource && /\blayoutTransition\b/.test(baselineSource)) {
    violations.push(
      `${NUXT_BASELINE_PATH} must leave layout transitions disabled so shared chrome stays persistent`
    )
  }
  if (
    baselineSource &&
    (!baselineSource.includes(
      "resolve(process.cwd(), 'app/assets/styles/main.css')"
    ) ||
      !baselineSource.includes(
        "existsSync(appCss) ? ['@/assets/styles/main.css'] : []"
      ))
  ) {
    violations.push(
      `${NUXT_BASELINE_PATH} must discover the conventional App-owned main stylesheet`
    )
  }

  const fireuxConfigSource = readRequiredSource(FIREUX_CONFIG_PATH)
  if (
    fireuxConfigSource &&
    !/\bconfigurePageTransition\(nuxt\)/.test(fireuxConfigSource)
  ) {
    violations.push(
      `${FIREUX_CONFIG_PATH} must apply the Core page-transition baseline`
    )
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Core page-transition drift detected:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        '[guard] Keep the Nuxt-native default and generated transition selectors in Core; use page meta for genuine route-specific exceptions.',
      ].join('\n')
    )
  }
}

function assertAmbientEffectArchitecture(repoRoot) {
  const violations = []
  const readRequiredSource = (relativePath) => {
    const filePath = path.join(repoRoot, relativePath)
    if (!existsSync(filePath)) {
      violations.push(`missing ambient-effect authority: ${relativePath}`)
      return ''
    }
    return readFileSync(filePath, 'utf8')
  }

  const fieldSource = readRequiredSource(CORE_AMBIENT_FIELD_PATH)

  for (const required of ['ambientUnit', 'ambientRange']) {
    if (!fieldSource.includes(required)) {
      violations.push(`${CORE_AMBIENT_FIELD_PATH} is missing ${required}`)
    }
  }
  if (fieldSource.includes('Math.random')) {
    violations.push(
      `${CORE_AMBIENT_FIELD_PATH} must remain deterministic during SSR`
    )
  }

  for (const { page, visual, deterministic } of AMBIENT_EFFECT_CONSUMERS) {
    const pageSource = readRequiredSource(page)
    const visualSource = readRequiredSource(visual)

    for (const required of [
      'class="landing-ambient__effect"',
      'class="landing-ambient__content"',
      'position: fixed',
      'isolation: isolate',
      'contain: strict',
      '@media print',
    ]) {
      if (!pageSource.includes(required)) {
        violations.push(
          `${page} is missing its App-owned ambient ${required} contract`
        )
      }
    }

    if (!visualSource.includes('@media (prefers-reduced-motion: reduce)')) {
      violations.push(`${visual} is missing its reduced-motion state`)
    }

    if (deterministic) {
      for (const forbidden of [
        'position: fixed',
        'z-index:',
        'Math.random',
        'onMounted',
      ]) {
        if (visualSource.includes(forbidden)) {
          violations.push(
            `${visual} must not repeat ambient lifecycle/layering (${forbidden})`
          )
        }
      }

      for (const required of ['ambientRange', 'var(--ui-primary)']) {
        if (!visualSource.includes(required)) {
          violations.push(`${visual} is missing ${required}`)
        }
      }
    }
  }

  for (const relativePath of RETIRED_AMBIENT_INITIALIZER_PATHS) {
    if (existsSync(path.join(repoRoot, relativePath))) {
      violations.push(
        `${relativePath} reintroduces a retired client-mounted ambient initializer`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Ambient-effect architecture drift detected:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        '[guard] Core owns the shared page layer; projects own their reduced-motion visual character and may opt into deterministic Core geometry.',
      ].join('\n')
    )
  }
}

function scan(dir, repoRoot, violations) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        scan(path.join(dir, entry.name), repoRoot, violations)
      }
      continue
    }

    if (!entry.isFile()) continue

    const filePath = path.join(dir, entry.name)
    const extension = path.extname(entry.name).toLowerCase()
    if (!AUTHORED_TEXT_EXTENSIONS.has(extension)) continue

    const source = readFileSync(filePath, 'utf8')
    const relativePath = path.relative(repoRoot, filePath)

    if (extension === '.vue') {
      VUE_STYLE_SOURCE_RE.lastIndex = 0
      let styleSource
      while ((styleSource = VUE_STYLE_SOURCE_RE.exec(source))) {
        const referencedPath = path.resolve(
          path.dirname(filePath),
          styleSource[2]
        )
        if (!existsSync(referencedPath)) {
          violations.missingVueStyleSources.push({
            path: relativePath,
            line: lineNumberAt(source, styleSource.index),
            label: `missing style source ${styleSource[2]}`,
          })
        }
      }
    }

    collectMatches({
      source,
      pattern: OBSOLETE_VARIABLE_RE,
      target: violations.obsoleteVariables,
      relativePath,
      label: (match) => match[0],
    })

    collectMatches({
      source,
      pattern: RAW_PALETTE_UTILITY_RE,
      target: violations.rawPaletteUtilities,
      relativePath,
      label: (match) => match[0],
      approvedLabels: APPROVED_PROJECT_RAW_PALETTE_UTILITIES.get(relativePath),
    })
    collectMatches({
      source,
      pattern: RAW_COMPONENT_COLOR_RE,
      target: violations.rawComponentColors,
      relativePath,
      label: (match) => match[0],
    })
    collectMatches({
      source,
      pattern: STALE_NON_NUXT_COLOR_UTILITY_RE,
      target: violations.staleColorUtilities,
      relativePath,
      label: (match) => match[0],
    })
    if (relativePath.startsWith('projects/')) {
      collectMatches({
        source,
        pattern: COPIED_CORE_PAGE_TRANSITION_RE,
        target: violations.copiedCorePageTransitions,
        relativePath,
        label: (match) => match[0],
      })
    }

    if (relativePath === NUXT_BASELINE_PATH) {
      collectMatches({
        source,
        pattern: DEAD_NUXT_UI_CONSOLE_PANEL_RE,
        target: violations.deadNuxtUiConfigKeys,
        relativePath,
        label: () => 'workspacePanel -> dashboardPanel',
      })
    }

    collectMatches({
      source,
      pattern: DERIVED_RADIUS_REFERENCE_RE,
      target: violations.radiusReferences,
      relativePath,
      label: (match) => match[0],
    })

    collectRadiusCustomPropertyViolations({
      source,
      relativePath,
      target: violations.radiusCustomProperties,
    })

    collectArbitraryRadiusClassViolations({
      source,
      relativePath,
      target: violations.arbitraryRadiusClasses,
    })

    collectMatches({
      source,
      pattern: OUT_OF_SCALE_RADIUS_CLASS_RE,
      target: violations.outOfScaleRadiusClasses,
      relativePath,
      label: (match) => match[0],
    })

    collectSpacingCustomPropertyViolations({
      source,
      relativePath,
      target: violations.spacingCustomProperties,
    })

    collectArbitrarySpacingClassViolations({
      source,
      relativePath,
      target: violations.arbitrarySpacingClasses,
    })

    collectArbitraryTypographyClassViolations({
      source,
      relativePath,
      target: violations.arbitraryTypographyClasses,
    })

    collectMatches({
      source,
      pattern: ARBITRARY_SEMANTIC_TEXT_COLOR_RE,
      target: violations.arbitrarySemanticTextColors,
      relativePath,
      label: (match) => match[0],
    })

    collectMatches({
      source,
      pattern: INVALID_TYPOGRAPHY_VARIABLE_RE,
      target: violations.typographyValues,
      relativePath,
      label: () => 'invalid --leading-none variable; use line-height: 1',
    })

    for (const overlay of LEGACY_TYPOGRAPHY_ROLE_OVERLAYS) {
      collectMatches({
        source,
        pattern: overlay.pattern,
        target: violations.legacyTypographyRoleOverlays,
        relativePath,
        label: () => `redundant role overlay -> ${overlay.replacement}`,
      })
    }

    for (const pattern of LEGACY_PAGE_SPACING_RECIPES) {
      collectMatches({
        source,
        pattern,
        target: violations.legacyPageSpacing,
        relativePath,
        label: () => 'repeated inline page rhythm',
      })
    }

    for (const pattern of LEGACY_LIST_SPACING_RECIPES) {
      collectMatches({
        source,
        pattern,
        target: violations.legacyListSpacing,
        relativePath,
        label: () => 'repeated inline list rhythm',
      })
    }

    collectSpacingValueViolations({
      source,
      relativePath,
      target: violations.spacingValues,
    })

    if (STYLE_EXTENSIONS.has(extension)) {
      collectMatches({
        source,
        pattern: DERIVED_RADIUS_DECLARATION_RE,
        target: violations.radiusDeclarations,
        relativePath,
        label: (match) => match[0].replace(/\s*:$/, ''),
      })

      collectBorderRadiusViolations({
        source,
        relativePath,
        target: violations.radiusValues,
      })

      collectTypographyValueViolations({
        source,
        relativePath,
        target: violations.typographyValues,
      })
    }

    collectMatches({
      source,
      pattern: LEGACY_ENTITY_CARD_RE,
      target: violations.legacyEntityCards,
      relativePath,
      label: () => 'legacy inline entity-card recipe',
    })

    collectMatches({
      source,
      pattern: LEGACY_INSET_PANEL_RE,
      target: violations.legacyInsetPanels,
      relativePath,
      label: () => 'legacy inline inset-panel recipe',
    })

    if (relativePath !== SHARED_DISCLOSURE_PATH) {
      collectMatches({
        source,
        pattern: RAW_DISCLOSURE_RE,
        target: violations.rawDisclosures,
        relativePath,
        label: () => 'raw UCollapsible outside MoleculesDisclosurePanel',
      })
      collectMatches({
        source,
        pattern: INLINE_DISCLOSURE_TRIGGER_RE,
        target: violations.inlineDisclosureTriggers,
        relativePath,
        label: () => 'repeated disclosure-chevron state recipe',
      })
    }

    collectMatches({
      source,
      pattern: INLINE_CARD_BODY_STACK_RE,
      target: violations.inlineCardBodyStacks,
      relativePath,
      label: () => 'inline UCard body stack',
    })

    collectMatches({
      source,
      pattern: LEGACY_DISABLED_SURFACE_RE,
      target: violations.legacyDisabledSurfaces,
      relativePath,
      label: () => 'visual-only disabled surface recipe',
    })

    if (extension === '.vue' || extension === '.html') {
      collectMatches({
        source,
        pattern: LOCAL_NUXT_PAGE_TRANSITION_PROP_RE,
        target: violations.localNuxtPageTransitions,
        relativePath,
        label: () => 'local NuxtPage transition override',
      })
      collectStaticClassAttributeViolations({
        source,
        relativePath,
        target: violations.compoundWorkspaceSurfaceSpacing,
        predicate: (classNames) =>
          classNames.includes('workspace-surface') &&
          classNames.some((className) => /(?:^|:)space-y-/.test(className)),
        label: 'workspace-surface combined with space-y-*',
      })
      collectStaticClassAttributeViolations({
        source,
        relativePath,
        target: violations.redundantEntityCardLayout,
        predicate: (classNames) =>
          ['fx-card--cell', 'flex', 'w-full', 'items-start', 'gap-3'].every(
            (className) => classNames.includes(className)
          ),
        label: 'fx-card--cell repeats its root layout recipe',
      })
      collectStaticClassAttributeViolations({
        source,
        relativePath,
        target: violations.redundantCollectionManagerControls,
        predicate: (classNames) =>
          [
            'collection-manager__controls',
            'flex',
            'flex-1',
            'items-center',
            'gap-2',
          ].every((className) => classNames.includes(className)),
        label: 'collection-manager__controls repeats its shared recipe',
      })
    }

    collectMatches({
      source,
      pattern: DIRECT_MENU_DETAIL_CSS_IMPORT_RE,
      target: violations.directMenuDetailCssImports,
      relativePath,
      label: () => 'leaf import of module-registered menu-detail.css',
    })

    for (const colorPair of LEGACY_SEMANTIC_COLOR_PAIRS) {
      collectMatches({
        source,
        pattern: colorPair.pattern,
        target: violations.legacySemanticColors,
        relativePath,
        label: (match) =>
          `${match[0].replace(/\s+/g, ' ')} -> ${colorPair.replacement}`,
      })
    }

    for (const surfacePair of LEGACY_GENERIC_SURFACE_PAIRS) {
      collectMatches({
        source,
        pattern: surfacePair.pattern,
        target: violations.legacyGenericSurfaces,
        relativePath,
        label: (match) =>
          `${match[0].replace(/\s+/g, ' ')} -> ${surfacePair.replacement}`,
      })
    }
  }
}

function collectMatches({
  source,
  pattern,
  target,
  relativePath,
  label,
  approvedLabels,
}) {
  pattern.lastIndex = 0
  let match

  while ((match = pattern.exec(source))) {
    const matchLabel = label(match)
    if (approvedLabels?.has(matchLabel)) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: matchLabel,
    })
  }
}

function collectStaticClassAttributeViolations({
  source,
  relativePath,
  target,
  predicate,
  label,
}) {
  STATIC_CLASS_ATTRIBUTE_RE.lastIndex = 0
  let match

  while ((match = STATIC_CLASS_ATTRIBUTE_RE.exec(source))) {
    const classNames = match[2].trim().split(/\s+/).filter(Boolean)
    if (!predicate(classNames)) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label,
    })
  }
}

function collectBorderRadiusViolations({ source, relativePath, target }) {
  BORDER_RADIUS_DECLARATION_RE.lastIndex = 0
  let match

  while ((match = BORDER_RADIUS_DECLARATION_RE.exec(source))) {
    const value = match[1].trim()
    if (isAllowedBorderRadiusValue(value)) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: value,
    })
  }
}

function collectRadiusCustomPropertyViolations({
  source,
  relativePath,
  target,
}) {
  RADIUS_CUSTOM_PROPERTY_RE.lastIndex = 0
  let match

  while ((match = RADIUS_CUSTOM_PROPERTY_RE.exec(source))) {
    const property = match[1]
    const value = match[2].trim()

    if (isDerivedRadiusProperty(property)) continue

    const isOwnedDerivedRadius =
      property !== '--ui-radius' &&
      ALLOWED_RADIUS_CUSTOM_PROPERTIES.has(property) &&
      isCanonicalRadiusValue(value)

    if (isOwnedDerivedRadius) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: `${property}: ${value}`,
    })
  }

  RADIUS_CUSTOM_PROPERTY_REFERENCE_RE.lastIndex = 0

  while ((match = RADIUS_CUSTOM_PROPERTY_REFERENCE_RE.exec(source))) {
    const property = match[1]
    if (
      isDerivedRadiusProperty(property) ||
      ALLOWED_RADIUS_CUSTOM_PROPERTIES.has(property)
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: `unowned reference ${property}`,
    })
  }
}

function collectArbitraryRadiusClassViolations({
  source,
  relativePath,
  target,
}) {
  ARBITRARY_RADIUS_CLASS_RE.lastIndex = 0
  let match

  while ((match = ARBITRARY_RADIUS_CLASS_RE.exec(source))) {
    const value = match[1].trim()
    const approvedValues = APPROVED_ARBITRARY_RADIUS_CLASSES.get(relativePath)
    if (approvedValues?.has(value)) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: match[0],
    })
  }
}

function collectSpacingValueViolations({ source, relativePath, target }) {
  if (
    DIRECT_SPACING_LITERAL_EXCLUDED_PREFIXES.some((prefix) =>
      relativePath.startsWith(prefix)
    )
  ) {
    return
  }

  SPACING_DECLARATION_RE.lastIndex = 0
  let declarationMatch

  while ((declarationMatch = SPACING_DECLARATION_RE.exec(source))) {
    const property = declarationMatch[1]
    const value = declarationMatch[2].trim()
    const approvedValue = `${property}:${value.replace(/\s+/g, ' ')}`
    if (APPROVED_DIRECT_SPACING_VALUES.get(relativePath)?.has(approvedValue)) {
      continue
    }

    GRID_SPACING_LITERAL_RE.lastIndex = 0
    let literalMatch

    while ((literalMatch = GRID_SPACING_LITERAL_RE.exec(value))) {
      if (!isTailwindSpacingGridLiteral(literalMatch[1], literalMatch[2])) {
        continue
      }

      target.push({
        path: relativePath,
        line: lineNumberAt(source, declarationMatch.index),
        label: `${property}: ${literalMatch[0]}`,
      })
    }
  }
}

function collectSpacingCustomPropertyViolations({
  source,
  relativePath,
  target,
}) {
  SPACING_CUSTOM_PROPERTY_RE.lastIndex = 0
  let match

  while ((match = SPACING_CUSTOM_PROPERTY_RE.exec(source))) {
    const property = match[1]
    const value = match[2].trim()
    const canonicalMenuValue = CANONICAL_MENU_SPACING_PROPERTIES.get(property)
    const approvedNonLayoutValue =
      APPROVED_NON_LAYOUT_SPACING_PROPERTIES.get(relativePath)?.get(property)

    if (
      (relativePath === CANONICAL_MENU_SPACING_PATH &&
        canonicalMenuValue &&
        normalizeCssValue(canonicalMenuValue) === normalizeCssValue(value)) ||
      (approvedNonLayoutValue &&
        normalizeCssValue(approvedNonLayoutValue) === normalizeCssValue(value))
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: `${property}: ${value}`,
    })
  }

  SPACING_CUSTOM_PROPERTY_REFERENCE_RE.lastIndex = 0

  while ((match = SPACING_CUSTOM_PROPERTY_REFERENCE_RE.exec(source))) {
    const property = match[1]
    if (
      property === '--spacing' ||
      CANONICAL_MENU_SPACING_PROPERTIES.has(property) ||
      APPROVED_NON_LAYOUT_SPACING_PROPERTIES.get(relativePath)?.has(property)
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: `unowned reference ${property}`,
    })
  }
}

function collectArbitrarySpacingClassViolations({
  source,
  relativePath,
  target,
}) {
  ARBITRARY_SPACING_CLASS_RE.lastIndex = 0
  let match

  while ((match = ARBITRARY_SPACING_CLASS_RE.exec(source))) {
    const value = match[1].trim()
    const approvedValues = APPROVED_ARBITRARY_SPACING_CLASSES.get(relativePath)
    if (approvedValues?.has(value)) continue

    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: match[0],
    })
  }
}

function collectTypographyValueViolations({ source, relativePath, target }) {
  if (
    OWNED_TYPOGRAPHY_DELTA_PATHS.has(relativePath) ||
    TYPOGRAPHY_LITERAL_EXCLUDED_PREFIXES.some((prefix) =>
      relativePath.startsWith(prefix)
    )
  ) {
    return
  }

  FONT_SIZE_DECLARATION_RE.lastIndex = 0
  let declarationMatch

  while ((declarationMatch = FONT_SIZE_DECLARATION_RE.exec(source))) {
    const value = declarationMatch[1].trim()
    TYPOGRAPHY_LENGTH_LITERAL_RE.lastIndex = 0
    let literalMatch

    while ((literalMatch = TYPOGRAPHY_LENGTH_LITERAL_RE.exec(value))) {
      const numericValue = Number(literalMatch[1])
      const pixels =
        literalMatch[2] === 'rem' ? numericValue * 16 : numericValue
      const token = TAILWIND_FONT_SIZE_TOKENS.get(pixels)
      if (!token) continue

      target.push({
        path: relativePath,
        line: lineNumberAt(source, declarationMatch.index),
        label: `font-size: ${literalMatch[0]} -> var(${token})`,
      })
    }
  }

  collectTokenizedDeclarationViolations({
    source,
    relativePath,
    target,
    pattern: FONT_WEIGHT_DECLARATION_RE,
    property: 'font-weight',
    tokens: TAILWIND_FONT_WEIGHT_TOKENS,
    findValue: true,
  })
  collectTokenizedDeclarationViolations({
    source,
    relativePath,
    target,
    pattern: LINE_HEIGHT_DECLARATION_RE,
    property: 'line-height',
    tokens: TAILWIND_LINE_HEIGHT_TOKENS,
  })
  collectTokenizedDeclarationViolations({
    source,
    relativePath,
    target,
    pattern: LETTER_SPACING_DECLARATION_RE,
    property: 'letter-spacing',
    tokens: TAILWIND_TRACKING_TOKENS,
  })

  FONT_FAMILY_DECLARATION_RE.lastIndex = 0
  while ((declarationMatch = FONT_FAMILY_DECLARATION_RE.exec(source))) {
    const value = declarationMatch[1].trim()
    if (value.includes('var(--font-')) continue
    if (
      !/(?:^|,)\s*(?:ui-sans-serif|system-ui|ui-serif|ui-monospace|SFMono-Regular|monospace|serif)\b/i.test(
        value
      )
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, declarationMatch.index),
      label: `font-family: ${value} -> var(--font-sans|serif|mono)`,
    })
  }

  FONT_SHORTHAND_DECLARATION_RE.lastIndex = 0
  while ((declarationMatch = FONT_SHORTHAND_DECLARATION_RE.exec(source))) {
    const value = declarationMatch[1].trim()
    if (value === 'inherit' || value.includes('var(--font-')) continue
    if (
      !/(?:^|[\s,])(?:ui-sans-serif|system-ui|ui-serif|ui-monospace|SFMono-Regular|monospace|serif)\b/i.test(
        value
      )
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, declarationMatch.index),
      label: `font: ${value} -> Tailwind font-family/size/leading variables`,
    })
  }

  FONT_FAMILY_CUSTOM_PROPERTY_RE.lastIndex = 0
  while ((declarationMatch = FONT_FAMILY_CUSTOM_PROPERTY_RE.exec(source))) {
    const property = declarationMatch[1]
    const value = declarationMatch[2].trim()
    if (value.includes('var(--font-') || value.includes('var(--menu-font')) {
      continue
    }
    if (
      !/(?:^|,)\s*(?:ui-sans-serif|system-ui|ui-serif|ui-monospace|SFMono-Regular|monospace|serif)\b/i.test(
        value
      )
    ) {
      continue
    }

    target.push({
      path: relativePath,
      line: lineNumberAt(source, declarationMatch.index),
      label: `${property}: ${value} -> Tailwind font-family variable`,
    })
  }
}

function collectTokenizedDeclarationViolations({
  source,
  relativePath,
  target,
  pattern,
  property,
  tokens,
  findValue = false,
}) {
  pattern.lastIndex = 0
  let match

  while ((match = pattern.exec(source))) {
    const value = match[1].trim()
    if (
      value.includes('var(--font-weight-') ||
      value.includes('var(--leading-')
    ) {
      continue
    }

    if (findValue) {
      for (const [literal, token] of tokens) {
        const literalPattern = new RegExp(`(?<![\\d.])${literal}(?![\\d.])`)
        if (!literalPattern.test(value)) continue
        target.push({
          path: relativePath,
          line: lineNumberAt(source, match.index),
          label: `${property}: ${literal} -> var(${token})`,
        })
      }
      continue
    }

    const token = tokens.get(normalizeCssValue(value))
    if (!token) continue
    target.push({
      path: relativePath,
      line: lineNumberAt(source, match.index),
      label: `${property}: ${value} -> var(${token})`,
    })
  }
}

function collectArbitraryTypographyClassViolations({
  source,
  relativePath,
  target,
}) {
  if (
    OWNED_TYPOGRAPHY_DELTA_PATHS.has(relativePath) ||
    TYPOGRAPHY_LITERAL_EXCLUDED_PREFIXES.some((prefix) =>
      relativePath.startsWith(prefix)
    )
  ) {
    return
  }

  const approvedClasses =
    APPROVED_ARBITRARY_TYPOGRAPHY_CLASSES.get(relativePath)
  for (const pattern of [
    ARBITRARY_FONT_SIZE_CLASS_RE,
    ARBITRARY_LINE_HEIGHT_CLASS_RE,
    ARBITRARY_TRACKING_CLASS_RE,
    ARBITRARY_FONT_WEIGHT_CLASS_RE,
  ]) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(source))) {
      if (approvedClasses?.has(match[0])) continue
      target.push({
        path: relativePath,
        line: lineNumberAt(source, match.index),
        label: match[0],
      })
    }
  }
}

function isTailwindSpacingGridLiteral(rawValue, unit) {
  const value = Number(rawValue)
  if (!Number.isFinite(value) || value === 0) return false

  const pixels = unit === 'rem' ? value * 16 : value
  const halfStep = pixels / 2
  return Math.abs(halfStep - Math.round(halfStep)) < Number.EPSILON * 16
}

function normalizeCssValue(value) {
  return value.replace(/\s+/g, '')
}

function isAllowedBorderRadiusValue(value) {
  const normalized = value.replace(/\s+/g, '')

  return (
    isCanonicalRadiusValue(value) ||
    normalized === '0' ||
    normalized === '50%' ||
    normalized === '9999px' ||
    normalized === 'inherit' ||
    normalized === 'initial' ||
    normalized === 'unset' ||
    /^var\(--(?:menu-radius|menu-radius-control)\)$/.test(normalized)
  )
}

function isCanonicalRadiusValue(value) {
  const normalized = value.replace(/\s+/g, '')

  return (
    /^var\(--ui-radius(?:,0\.25rem)?\)$/.test(normalized) ||
    /^calc\(var\(--ui-radius(?:,0\.25rem)?\)\*(?:0\.5|1\.5|2|3|4|6)\)$/.test(
      normalized
    )
  )
}

function isDerivedRadiusProperty(property) {
  return /^--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)$/.test(property)
}

function hasViolations(violations) {
  return Object.values(violations).some((entries) => entries.length > 0)
}

function formatViolations(violations) {
  const lines = ['[guard] ❌ CSS system spine drift detected:']

  appendGroup(
    lines,
    'Obsolete CSS variable references:',
    violations.obsoleteVariables
  )
  appendGroup(
    lines,
    'Dead Nuxt UI app-config keys:',
    violations.deadNuxtUiConfigKeys
  )
  appendGroup(
    lines,
    'Nuxt UI-derived radius variables redeclared:',
    violations.radiusDeclarations
  )
  appendGroup(
    lines,
    'Non-runtime radius variables referenced:',
    violations.radiusReferences
  )
  appendGroup(
    lines,
    'Border radii outside the Nuxt UI scale or approved full/circle shapes:',
    violations.radiusValues
  )
  appendGroup(
    lines,
    'Unowned or invalid radius custom properties:',
    violations.radiusCustomProperties
  )
  appendGroup(
    lines,
    'Unapproved arbitrary Tailwind radius classes:',
    violations.arbitraryRadiusClasses
  )
  appendGroup(
    lines,
    'Tailwind radius classes outside the adopted Nuxt UI scale:',
    violations.outOfScaleRadiusClasses
  )
  appendGroup(
    lines,
    'Grid-aligned spacing literals that must derive from Tailwind `--spacing`:',
    violations.spacingValues
  )
  appendGroup(
    lines,
    'Unowned or invalid spacing custom properties:',
    violations.spacingCustomProperties
  )
  appendGroup(
    lines,
    'Unapproved arbitrary Tailwind spacing classes:',
    violations.arbitrarySpacingClasses
  )
  appendGroup(
    lines,
    'Ordinary typography values that must use Tailwind theme variables:',
    violations.typographyValues
  )
  appendGroup(
    lines,
    'Unapproved arbitrary Tailwind typography classes:',
    violations.arbitraryTypographyClasses
  )
  appendGroup(
    lines,
    'Arbitrary semantic text colors that have named Nuxt UI utilities:',
    violations.arbitrarySemanticTextColors
  )
  appendGroup(
    lines,
    'Ordinary package or project UI using raw Tailwind palette utilities:',
    violations.rawPaletteUtilities
  )
  appendGroup(
    lines,
    'Nuxt UI components or toasts using raw palette colors:',
    violations.rawComponentColors
  )
  appendGroup(
    lines,
    'Stale non-Nuxt semantic color utilities:',
    violations.staleColorUtilities
  )
  appendGroup(
    lines,
    'Repeated typography role overlays that have a named shared variant:',
    violations.legacyTypographyRoleOverlays
  )
  appendGroup(
    lines,
    'Repeated page rhythm that must use `.fx-page-stack`:',
    violations.legacyPageSpacing
  )
  appendGroup(
    lines,
    'Repeated list rhythm that must use `.fx-list-stack`:',
    violations.legacyListSpacing
  )
  appendGroup(
    lines,
    'Legacy entity-card recipe repeated inline:',
    violations.legacyEntityCards
  )
  appendGroup(
    lines,
    'Legacy inset-panel recipe repeated inline:',
    violations.legacyInsetPanels
  )
  appendGroup(
    lines,
    'Raw disclosures outside the shared disclosure contract:',
    violations.rawDisclosures
  )
  appendGroup(
    lines,
    'Repeated disclosure trigger state recipes:',
    violations.inlineDisclosureTriggers
  )
  appendGroup(
    lines,
    'Repeated inline UCard body stacks:',
    violations.inlineCardBodyStacks
  )
  appendGroup(
    lines,
    'Visual-only disabled surfaces without an interaction contract:',
    violations.legacyDisabledSurfaces
  )
  appendGroup(
    lines,
    'Workspace surfaces with compounded vertical spacing:',
    violations.compoundWorkspaceSurfaceSpacing
  )
  appendGroup(
    lines,
    'Entity cards repeating layout already owned by `.fx-card--cell`:',
    violations.redundantEntityCardLayout
  )
  appendGroup(
    lines,
    'Collection manager controls repeating their shared layout:',
    violations.redundantCollectionManagerControls
  )
  appendGroup(
    lines,
    'Leaf imports of module-registered Menu detail CSS:',
    violations.directMenuDetailCssImports
  )
  appendGroup(
    lines,
    'Local NuxtPage transition props that bypass the Core config seam:',
    violations.localNuxtPageTransitions
  )
  appendGroup(
    lines,
    'Project styles copying the Core page-transition selector namespace:',
    violations.copiedCorePageTransitions
  )
  appendGroup(
    lines,
    'Vue components referencing missing local stylesheets:',
    violations.missingVueStyleSources
  )
  appendGroup(
    lines,
    'Legacy hard-coded semantic text color pairs:',
    violations.legacySemanticColors
  )
  appendGroup(
    lines,
    'Legacy generic surface color pairs:',
    violations.legacyGenericSurfaces
  )

  lines.push(
    '',
    '[guard] Fix:',
    '- Use current Nuxt UI semantic variables (`--ui-text*`, `--ui-border*`, `--ui-bg*`).',
    '- Configure Nuxt UI dashboard panels through `dashboardPanel`; `workspacePanel` is not a live app-config key.',
    '- Let Nuxt UI own `--ui-radius`; use `rounded-*` utilities in templates and calculate from that live variable in authored CSS.',
    '- Ordinary radii use only the xs-through-3xl Nuxt UI scale; reserve `50%` or `9999px` for real circles and pills.',
    '- Radius custom properties are explicit owned seams. Menu defaults must derive from `--ui-radius`.',
    '- Arbitrary radius utilities are reserved for approved percentage-based artwork.',
    '- Use Tailwind `--spacing` as the single numeric spacing authority in authored CSS.',
    '- Keep ordinary template spacing on named Tailwind utilities; arbitrary spacing utilities require an explicit approved exception.',
    '- Menu may keep semantic spacing seams, but their defaults must derive from `--spacing`.',
    '- Use Tailwind font, size, weight, line-height, and tracking variables as the numeric typography authority in authored CSS.',
    '- Use core `.fx-type-*` roles for repeated semantic typography and named Tailwind type utilities for local composition.',
    '- Use `fx-type-section-title` and `fx-type-card-heading` instead of repeating their guarded size/weight overlays.',
    '- Arbitrary typography utilities are reserved for reviewed brand, artwork, print/output, debug, or optical deltas.',
    '- Use Nuxt UI `text-dimmed`, `text-muted`, `text-toned`, and `text-highlighted` instead of arbitrary semantic text-color utilities.',
    '- Ordinary package and project UI must use Nuxt UI semantic text, border, surface, and status utilities; intentional brand or artwork colors need an owned named seam or narrow reviewed exception.',
    '- Replace stale foreground/background aliases with current Nuxt UI semantic utilities.',
    '- Use `.fx-page-stack` and `.fx-list-stack` for the guarded repeated rhythm recipes.',
    '- Let `.workspace-surface` own its vertical rhythm instead of combining it with `space-y-*`.',
    '- Compose the shared `.fx-card--cell` recipe instead of repeating the audited class string.',
    '- Let `.collection-manager__controls` own its shared flex, alignment, and gap recipe.',
    '- Use `.fx-inset-panel` for the audited nested bordered-panel recipe.',
    '- Use `MoleculesDisclosurePanel` instead of rebuilding UCollapsible trigger state in leaf components.',
    '- Use a semantic shared card/body-stack component or class instead of repeating UCard `space-y-4` body overrides.',
    '- Use `MoleculesActionSurface` for linked/action/static card roots; visual opacity does not disable navigation or clicks.',
    '- Replace the guarded gray/dark text pairs with `text-highlighted`, `text-toned`, or `text-muted`.',
    '- Replace the guarded generic surface pairs with `border-default` and `bg-default/*`.',
    '- Register Menu detail CSS once through the kitchens module; do not import it from leaf pages or components.',
    '- Keep every relative Vue `<style src>` next to its owning component or update the reference when the component moves.',
    '- Use the Core Nuxt page-transition default. Route-specific exceptions belong in page meta.',
    '- One-off Tailwind for local layout or pixel-perfect deltas remains allowed.'
  )

  return lines.join('\n')
}

function appendGroup(lines, heading, entries) {
  if (!entries.length) return

  lines.push('', heading)
  for (const entry of entries.sort(compareEntries)) {
    lines.push(`  - ${entry.path}:${entry.line} (${entry.label})`)
  }
}

function compareEntries(a, b) {
  return (
    a.path.localeCompare(b.path) ||
    a.line - b.line ||
    a.label.localeCompare(b.label)
  )
}

function lineNumberAt(source, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) line += 1
  }
  return line
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
