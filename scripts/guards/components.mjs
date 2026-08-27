// @fireux-script
// last_used: 2026-08-19
// usage_note: guard component naming, Entity Collection Page composition, resolved imports, and prop-driven Cards authority.
// FILE: scripts/guards/components.mjs
// Component registration guard.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const COMPONENT_PATH_MARKERS = ['/src/runtime/components/', '/app/components/']
const IMPORT_EXTENSIONS = [
  '',
  '.ts',
  '.d.ts',
  '.vue',
  '.mjs',
  '.js',
  '.json',
  '.css',
  '.scss',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.md',
]
const IMPORT_INDEX_FILES = ['index.ts', 'index.vue', 'index.mjs', 'index.js']
const RELATIVE_IMPORT_RE =
  /(?:from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\1/g
const CARD_VARIANT_NAMES = new Set(['Cell.vue', 'Pill.vue', 'Preview.vue'])
const LEGACY_CARD_PROFILE_PATHS = new Set([
  'packages/core/fireux-core/src/runtime/ecosystem/components/Cards/Profile.vue',
  'packages/extensions/fireux-blogs/src/runtime/components/Blog/Cards/Profile.vue',
  'packages/extensions/fireux-companies/src/runtime/place/components/Company/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/Agent/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/job/components/Cards/Profile.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/Professional/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Dishes/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Mise/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Suppliers/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Cards/Profile.vue',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Cards/Profile.vue',
  'packages/extensions/fireux-places/src/runtime/place/components/Cards/Profile.vue',
  'packages/extensions/fireux-products/src/runtime/product/components/Cards/Profile.vue',
  'packages/extensions/fireux-properties/src/runtime/portfolio/components/Cards/Profile.vue',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Cards/Profile.vue',
])
const CARD_SUPPORT_PATHS = new Set([
  'packages/extensions/fireux-blogs/src/runtime/components/Blog/Cards/Story.vue',
  'packages/extensions/fireux-places/src/runtime/place/components/Cards/Dropdown/Fireux.vue',
  'packages/extensions/fireux-places/src/runtime/place/components/Cards/Dropdown/Google.vue',
  'packages/extensions/fireux-places/src/runtime/place/components/Cards/Dropdown/Selected.vue',
])
const CARD_DATA_AUTHORITY_RE =
  /\b(?:useAsyncData|useFetch|\$fetch|useFirestore|useCollection|useDocument|onSnapshot|getDoc|getDocs|use[A-Z][A-Za-z0-9]*(?:Collection|Fetch))\s*\(/
const CARD_STORAGE_IMPORT_RE = /from\s+["'](?:firebase\/firestore|vuefire)["']/
const CARD_ANATOMY_RE = new Map([
  ['Cell.vue', /\b(?:card--cell|fx-card--cell)\b/],
  ['Pill.vue', /class\s*=\s*["'][^"']*\bpill\b/],
  ['Preview.vue', /class\s*=\s*["'][^"']*\bpreview\b/],
])
const CORE_SHARED_COMPONENT_FAMILIES = new Set([
  'Auth',
  'Collection',
  'Create',
  'Dashboard',
  'Onboarding',
  'Provider',
  'Workspace',
  'dev',
  'landing',
  'layouts',
  'molecules',
])
const WORKSPACE_INDEX_NAMESPACE = /\/components\/Workspace\/Index$/

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, violations, repoRoot)
  }

  validateMiseboxCardSpecimen(repoRoot, violations)
  validateCoreSharedComponentFamilies(repoRoot, violations)
  validateCollectionPagePresentation(repoRoot, violations)
  validateEntityDetailPresentation(repoRoot, violations)

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ component naming drift detected:',
        ...violations
          .sort((a, b) => a.localeCompare(b))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Package-provided UI belongs under runtime/components/**.',
        '- Use Nuxt path-based component names from runtime/components/**.',
        '- Do not reintroduce organisms folders or Organisms* component names.',
        '- Keep component relative imports pointed at real files after moves.',
        '- Cards are prop/view-model-driven Cell, Pill, or Preview presentation.',
        '- Keep fetching/storage in Collection, Index, Read, Detail, or controller surfaces.',
        '- Legacy Cards/Profile paths are frozen migration debt; add no new ones.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ component naming valid')
}

function validateCoreSharedComponentFamilies(repoRoot, violations) {
  const relativeRoot = 'packages/core/fireux-core/src/runtime/components'
  const root = path.join(repoRoot, relativeRoot)
  if (!existsSync(root)) {
    violations.push(`${relativeRoot} (missing Core shared component root)`)
    return
  }

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue
    if (!entry.isDirectory()) {
      violations.push(
        `${relativeRoot}/${entry.name} (loose Core component has no named shared family)`
      )
      continue
    }
    if (!CORE_SHARED_COMPONENT_FAMILIES.has(entry.name)) {
      violations.push(
        `${relativeRoot}/${entry.name}/ (undeclared Core shared component family)`
      )
    }
  }
}

function validateCollectionPagePresentation(repoRoot, violations) {
  const surfacePath =
    'packages/core/fireux-core/src/runtime/components/Collection/Page.vue'
  const retiredSurfacePath =
    'packages/core/fireux-core/src/runtime/components/public/IndexSurface.vue'
  const ordinaryConsumers = [
    'packages/core/fireux-core/src/runtime/pages/apps/index.vue',
    'packages/core/fireux-core/src/runtime/pages/users/index.vue',
    'projects/fireux/fireux-app/app/pages/apps/index.vue',
    'projects/fireux/fireux-app/app/pages/ecosystems/index.vue',
    'packages/extensions/fireux-places/src/runtime/pages/places/index.vue',
    'packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue',
    'packages/extensions/fireux-products/src/runtime/pages/products/index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue',
    'packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue',
    'packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue',
    'packages/extensions/fireux-properties/src/runtime/pages/properties/index.vue',
    'packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/menu/components/Index/Index.vue',
  ]
  const ordinaryManagers = [
    'packages/core/fireux-core/src/runtime/app/components/Collection/Manager.vue',
    'packages/core/fireux-core/src/runtime/ecosystem/components/Collection/Manager.vue',
    'packages/core/fireux-core/src/runtime/user/components/Collection/Manager.vue',
    'packages/extensions/fireux-places/src/runtime/place/components/Collection/Manager.vue',
    'packages/extensions/fireux-jobs/src/runtime/job/components/Collection/Manager.vue',
    'packages/extensions/fireux-products/src/runtime/product/components/Collection/Manager.vue',
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Collection/Manager.vue',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Collection/Manager.vue',
    'packages/extensions/fireux-properties/src/runtime/portfolio/components/Collection/Manager.vue',
    'packages/extensions/fireux-properties/src/runtime/property/components/Collection/Manager.vue',
    'packages/extensions/fireux-companies/src/runtime/place/components/Company/Collection/Manager.vue',
    'packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection/Manager.vue',
  ]
  const brandedRoutes = [
    'projects/slap/yellow-velo/app/pages/products/index.vue',
    'projects/misebox/interlaken-essen/app/pages/marktplatz/index.vue',
  ]

  const absoluteSurfacePath = path.join(repoRoot, surfacePath)
  if (!existsSync(absoluteSurfacePath)) {
    violations.push(
      `${surfacePath} (missing shared Entity Collection Page surface)`
    )
  } else {
    const source = readFileSync(absoluteSurfacePath, 'utf8')
    if (
      !source.includes("name: 'CollectionPage'") ||
      !source.includes('entity-collection-page__hero')
    ) {
      violations.push(
        `${surfacePath} (must retain the named Entity Collection Page contract)`
      )
    }
  }

  if (existsSync(path.join(repoRoot, retiredSurfacePath))) {
    violations.push(
      `${retiredSurfacePath} (retired generic browse-surface name)`
    )
  }

  for (const consumerPath of ordinaryConsumers) {
    const absolutePath = path.join(repoRoot, consumerPath)
    if (!existsSync(absolutePath)) continue
    const source = readFileSync(absolutePath, 'utf8')
    if (!source.includes('<CollectionPage')) {
      violations.push(
        `${consumerPath} (ordinary Entity Collection Page must consume CollectionPage)`
      )
    }
  }

  for (const managerPath of ordinaryManagers) {
    const absolutePath = path.join(repoRoot, managerPath)
    if (!existsSync(absolutePath)) continue
    const source = readFileSync(absolutePath, 'utf8')
    if (
      !source.includes('<CollectionHeader') ||
      !/<MoleculesStateCard\s+surface=["']collection["']/.test(source)
    ) {
      violations.push(
        `${managerPath} (ordinary Entity manager must use the shared Collection header and collection-state surface)`
      )
    }
  }

  for (const routePath of brandedRoutes) {
    const absolutePath = path.join(repoRoot, routePath)
    if (!existsSync(absolutePath)) continue
    const source = readFileSync(absolutePath, 'utf8')
    if (source.includes('<CollectionPage')) {
      violations.push(
        `${routePath} (App-owned branded family must retain its named presentation instead of the ordinary Entity Collection Page shell)`
      )
    }
  }
}

function validateMiseboxCardSpecimen(repoRoot, violations) {
  const specimenPath = path.join(
    repoRoot,
    'projects/misebox/misebox-app/app/components/Misebox/PowerCards.vue'
  )
  if (!existsSync(specimenPath)) return

  const source = readFileSync(specimenPath, 'utf8')
  for (const match of source.matchAll(
    /<([A-Z][A-Za-z0-9]*Cards[A-Za-z0-9]*)\b/g
  )) {
    const componentName = match[1]
    if (/(?:CardsCell|CardsPill|CardsPreview)$/.test(componentName)) continue
    violations.push(
      `${path.relative(repoRoot, specimenPath)} (${componentName} is not a canonical dumb Card specimen)`
    )
  }
}

function validateEntityDetailPresentation(repoRoot, violations) {
  const consumers = new Map([
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Cards/Cell.vue',
      'MoleculesActionSurface',
    ],
    [
      'packages/extensions/fireux-places/src/runtime/place/components/Cards/Cell.vue',
      'MoleculesActionSurface',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Detail/Index.vue',
      'KitchenHeader',
    ],
    [
      'packages/extensions/fireux-places/src/runtime/place/components/Detail.vue',
      'PlaceHeader',
    ],
    [
      'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail.vue',
      'PlaceHeader',
    ],
  ])

  for (const componentPath of [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Header.vue',
    'packages/extensions/fireux-places/src/runtime/place/components/Header.vue',
  ]) {
    if (!existsSync(path.join(repoRoot, componentPath))) {
      violations.push(`${componentPath} (missing entity-owned detail header)`)
    }
  }

  for (const [consumerPath, componentName] of consumers) {
    const absolutePath = path.join(repoRoot, consumerPath)
    if (!existsSync(absolutePath)) continue
    const source = readFileSync(absolutePath, 'utf8')
    if (!source.includes(`<${componentName}`)) {
      violations.push(`${consumerPath} (must retain ${componentName} anatomy)`)
    }
    if (source.includes('PublicEntityDirectoryCard')) {
      violations.push(`${consumerPath} (must remain domain-owned)`)
    }
  }

  const supplierDetailPath =
    'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail.vue'
  const supplierDetailSource = readFileSync(
    path.join(repoRoot, supplierDetailPath),
    'utf8'
  )
  if (
    supplierDetailSource.includes('useAsyncData') ||
    !supplierDetailSource.includes('const place = props.place') ||
    !supplierDetailSource.includes('SupplierDetailState')
  ) {
    violations.push(
      `${supplierDetailPath} (must render the server-resolved canonical Place beside the canonical Supplier)`
    )
  }

  const supplierDetailReaderPath =
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierDetail.ts'
  const supplierDetailReader = readFileSync(
    path.join(repoRoot, supplierDetailReaderPath),
    'utf8'
  )
  for (const contract of [
    'firestoreFetchDoc<Supplier>',
    'firestoreFetchDoc<Place>',
    'lastGoodSupplier',
    'lastGoodPlace',
  ]) {
    if (!supplierDetailReader.includes(contract)) {
      violations.push(
        `${supplierDetailReaderPath} (missing live canonical Entity Detail contract: ${contract})`
      )
    }
  }

  const supplierRoutePath =
    'packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/[slug].vue'
  const supplierRouteSource = readFileSync(
    path.join(repoRoot, supplierRoutePath),
    'utf8'
  )
  for (const contract of [
    'useSupplierDetail',
    'await ready',
    'setResponseStatus(404)',
    'setResponseStatus(statusCode.value || 503)',
  ]) {
    if (!supplierRouteSource.includes(contract)) {
      violations.push(
        `${supplierRoutePath} (missing Entity Detail contract: ${contract})`
      )
    }
  }
}

function scan(dir, violations, repoRoot) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      const normalizedPath = fullPath.split(path.sep).join('/')
      if (WORKSPACE_INDEX_NAMESPACE.test(normalizedPath)) {
        violations.push(
          `${path.relative(repoRoot, fullPath)} (Index.vue is the Workspace family entrypoint, not a child namespace)`
        )
        continue
      }
      if (
        entry.toLowerCase() === 'organisms' &&
        isComponentTreePath(fullPath)
      ) {
        violations.push(path.relative(repoRoot, fullPath))
        continue
      }
      scan(fullPath, violations, repoRoot)
      continue
    }

    if (!/\.(ts|vue)$/.test(entry)) continue

    const source = readFileSync(fullPath, 'utf8')
    if (
      source.includes('runtime/components/organisms') ||
      source.includes('components/organisms') ||
      source.includes('/Organisms/') ||
      source.includes('/organisms/') ||
      /\bOrganisms[A-Z]/.test(source)
    ) {
      violations.push(path.relative(repoRoot, fullPath))
    }

    validateRelativeImports(fullPath, source, violations, repoRoot)
    validateCardFamily(fullPath, source, violations, repoRoot)
    validateDebugPayload(fullPath, source, violations, repoRoot)
  }
}

function validateDebugPayload(filePath, source, violations, repoRoot) {
  const relative = path.relative(repoRoot, filePath).split(path.sep).join('/')

  for (const match of source.matchAll(/<DevDebugPanel\b[\s\S]*?\/>/g)) {
    const tag = match[0]
    if (
      !/object-origin=["'](?:fetched|passed)["']/.test(tag) ||
      !/:objects=/.test(tag) ||
      !/:derived=/.test(tag)
    ) {
      violations.push(
        `${relative} (DevDebugPanel requires object provenance plus explicit objects and derived payloads)`
      )
    }
    if (/:data=/.test(tag)) {
      violations.push(
        `${relative} (DevDebugPanel must use objects and derived instead of data)`
      )
    }
  }
}

function validateCardFamily(filePath, source, violations, repoRoot) {
  const normalized = filePath.split(path.sep).join('/')
  if (!normalized.includes('/Cards/')) return

  const relative = path.relative(repoRoot, filePath).split(path.sep).join('/')
  const fileName = path.basename(filePath)
  const classified =
    CARD_VARIANT_NAMES.has(fileName) ||
    LEGACY_CARD_PROFILE_PATHS.has(relative) ||
    CARD_SUPPORT_PATHS.has(relative)

  if (!classified) {
    violations.push(
      `${relative} (unclassified Cards component; use Cell/Pill/Preview or move it to its owning Profile/Detail/operational family)`
    )
  }

  const anatomyPattern = CARD_ANATOMY_RE.get(fileName)
  if (
    anatomyPattern &&
    !anatomyPattern.test(source) &&
    !source.includes('UserProfileDirectoryCard') &&
    !source.includes('PublicProfileDirectoryCard')
  ) {
    violations.push(
      `${relative} (${fileName.replace('.vue', '')} must consume its shared Core card anatomy)`
    )
  }

  if (!/\bdefineProps\s*</.test(source) && !/\bdefineProps\s*\(/.test(source)) {
    violations.push(`${relative} (Cards components must declare prop input)`)
  }

  if (
    CARD_DATA_AUTHORITY_RE.test(source) ||
    CARD_STORAGE_IMPORT_RE.test(source)
  ) {
    violations.push(
      `${relative} (Cards components must not fetch or own storage authority)`
    )
  }
}

function validateRelativeImports(filePath, source, violations, repoRoot) {
  if (!isComponentSourceFile(filePath)) return

  RELATIVE_IMPORT_RE.lastIndex = 0
  let match

  while ((match = RELATIVE_IMPORT_RE.exec(source))) {
    const specifier = stripImportQuery(match[2])
    const target = path.resolve(path.dirname(filePath), specifier)

    if (!targetExists(target)) {
      violations.push(
        `${path.relative(repoRoot, filePath)} (missing relative import: ${match[2]})`
      )
    }
  }
}

function isComponentSourceFile(filePath) {
  return isComponentTreePath(filePath)
}

function isComponentTreePath(filePath) {
  const normalized = filePath.split(path.sep).join('/')
  return COMPONENT_PATH_MARKERS.some((marker) => normalized.includes(marker))
}

function stripImportQuery(specifier) {
  return specifier.split(/[?#]/)[0]
}

function targetExists(target) {
  if (IMPORT_EXTENSIONS.some((extension) => existsSync(target + extension))) {
    return true
  }

  return (
    existsSync(target) &&
    statSync(target).isDirectory() &&
    IMPORT_INDEX_FILES.some((fileName) =>
      existsSync(path.join(target, fileName))
    )
  )
}
