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

  validateCardSpecimen(repoRoot, violations)
  validateCoreSharedComponentFamilies(repoRoot, violations)
  validateMainAppComponentSpines(repoRoot, violations)
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

function validateMainAppComponentSpines(repoRoot, violations) {
  const projectsRoot = path.join(repoRoot, 'projects')
  if (!existsSync(projectsRoot)) return

  for (const ecosystemEntry of readdirSync(projectsRoot, {
    withFileTypes: true,
  })) {
    if (!ecosystemEntry.isDirectory()) continue

    const ecosystemRoot = path.join(projectsRoot, ecosystemEntry.name)
    for (const appEntry of readdirSync(ecosystemRoot, {
      withFileTypes: true,
    })) {
      if (!appEntry.isDirectory() || !appEntry.name.endsWith('-app')) continue

      const componentRoot = path.join(
        ecosystemRoot,
        appEntry.name,
        'app/components'
      )
      if (!existsSync(componentRoot)) continue

      const redundantOwner = appEntry.name
        .slice(0, -'-app'.length)
        .toLowerCase()
      for (const componentEntry of readdirSync(componentRoot, {
        withFileTypes: true,
      })) {
        if (!componentEntry.isDirectory()) continue

        const componentFamily = componentEntry.name
        const relativePath = path.relative(repoRoot, componentRoot)
        if (componentFamily === 'effects') {
          violations.push(
            `${relativePath}/effects/ (one-off visual effects belong beside their App presentation owner)`
          )
        }
        if (componentFamily === 'landing') {
          violations.push(
            `${relativePath}/landing/ (Main App landing presentation uses the canonical Landing family)`
          )
        }
        if (componentFamily.toLowerCase() === redundantOwner) {
          violations.push(
            `${relativePath}/${componentFamily}/ (redundant Main App name does not add component ownership)`
          )
        }
      }
    }
  }
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
    'packages/extensions/fireux-products/src/runtime/pages/products/index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue',
    'packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/menu/components/Index/Index.vue',
  ]
  const ordinaryManagers = [
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
  const routeOwnedManagers = new Map([])
  const composedLasagneMembers = [
    {
      route: 'packages/core/fireux-core/src/runtime/pages/apps/index.vue',
      layers: ['<AppHero', '<AppCurrent', '<AppCreate', '<AppCollection'],
      component:
        'packages/core/fireux-core/src/runtime/app/components/Collection.vue',
      prop: /apps:\s*App\[\]/,
      props: ['apps', 'scope'],
      chain: ['<AppCollectionList', '<CollectionCell'],
    },
    {
      route: 'projects/fireux/fireux-app/app/pages/apps/index.vue',
      layers: ['<AppHero', '<AppCurrent', '<AppCreate', '<AppCollection'],
      component:
        'packages/core/fireux-core/src/runtime/app/components/Collection.vue',
      prop: /apps:\s*App\[\]/,
      props: ['apps', 'scope'],
      chain: ['<AppCollectionList', '<CollectionCell'],
    },
    {
      route: 'packages/core/fireux-core/src/runtime/pages/users/index.vue',
      layers: ['<UserHero', '<UserCurrent', '<UserCreate', '<UserCollection'],
      component:
        'packages/core/fireux-core/src/runtime/user/components/Collection.vue',
      prop: /users:\s*User\[\]/,
      props: ['users'],
      chain: ['<UserCollectionList', '<CollectionCell'],
    },
    {
      route: 'projects/fireux/fireux-app/app/pages/ecosystems/index.vue',
      layers: ['<EcosystemHero', '<EcosystemCreate', '<EcosystemCollection'],
      component:
        'packages/core/fireux-core/src/runtime/ecosystem/components/Collection.vue',
      prop: /ecosystems:\s*EcosystemDirectoryEntry\[\]/,
      props: ['ecosystems'],
      chain: ['<EcosystemCollectionList', '<CollectionCell'],
    },
    {
      route: 'projects/fireux/fireux-app/app/pages/projects/index.vue',
      layers: ['<ProjectHero', '<ProjectCreate', '<ProjectCollection'],
      component:
        'packages/core/fireux-core/src/runtime/project/components/Collection.vue',
      prop: /projects:\s*Project\[\]/,
      props: ['projects'],
      chain: ['<ProjectCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-places/src/runtime/pages/places/index.vue',
      layers: ['<PlaceHero', '<PlaceCreate', '<PlaceCollection'],
      component:
        'packages/extensions/fireux-places/src/runtime/place/components/Collection.vue',
      prop: /places:\s*BasePlace\[\]/,
      props: ['places'],
      chain: ['<PlaceCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue',
      layers: ['<KitchenHero', '<KitchenCreate', '<KitchenCollection'],
      component:
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Collection.vue',
      prop: /kitchens:\s*KitchenCollectionRecord\[\]/,
      props: ['kitchens'],
      chain: ['<KitchenCollectionList', '<CollectionCell'],
    },
    {
      route: 'packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue',
      layers: ['<JobHero', '<JobCreate', '<JobCollection'],
      component:
        'packages/extensions/fireux-jobs/src/runtime/job/components/Collection.vue',
      prop: /jobs:\s*JobDirectoryEntry\[\]/,
      props: ['jobs'],
      chain: ['<JobCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-kitchens/src/runtime/pages/menus/index.vue',
      layers: ['<MenuHero', '<MenuCreate', '<MenuCollection'],
      component:
        'packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection.vue',
      prop: /menus:\s*MenuDirectoryEntry\[\]/,
      props: ['menus'],
      chain: ['<MenuCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue',
      layers: ['<SupplierHero', '<SupplierCreate', '<SupplierCollection'],
      component:
        'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Collection.vue',
      prop: /suppliers:\s*SupplierSurface\[\]/,
      props: ['suppliers'],
      chain: ['<SupplierCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue',
      layers: ['<PortfolioHero', '<PortfolioCreate', '<PortfolioCollection'],
      component:
        'packages/extensions/fireux-properties/src/runtime/portfolio/components/Collection.vue',
      prop: /portfolios:\s*Portfolio\[\]/,
      props: ['portfolios'],
      chain: ['<PortfolioCollectionList', '<CollectionCell'],
    },
    {
      route:
        'packages/extensions/fireux-properties/src/runtime/pages/properties/index.vue',
      layers: ['<PropertyHero', '<PropertyCreate', '<PropertyCollection'],
      component:
        'packages/extensions/fireux-properties/src/runtime/property/components/Collection.vue',
      prop: /properties:\s*PropertyDirectoryEntry\[\]/,
      props: ['properties'],
      chain: ['<PropertyCollectionList', '<CollectionCell'],
      debug: false,
    },
  ]
  const retiredComposedLasagnePaths = [
    'packages/core/fireux-core/src/runtime/app/components/Collection/Launcher.vue',
    'packages/core/fireux-core/src/runtime/ecosystem/components/CTA.vue',
    'packages/core/fireux-core/src/runtime/user/components/Cta',
  ]
  const richCollectionMembers = new Set(
    composedLasagneMembers
      .map((member) => member.component)
      .filter(
        (component) =>
          component !==
            'packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection.vue' &&
          component !==
            'packages/extensions/fireux-properties/src/runtime/property/components/Collection.vue'
      )
  )

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

  for (const retiredPath of retiredComposedLasagnePaths) {
    if (existsSync(path.join(repoRoot, retiredPath))) {
      violations.push(
        `${retiredPath} (retired parallel or CTA vocabulary in the audited FL index family)`
      )
    }
  }

  for (const member of composedLasagneMembers) {
    const routeSource = readFileSync(path.join(repoRoot, member.route), 'utf8')
    if (
      !routeSource.includes('<UPage>') ||
      !routeSource.includes('<UPageBody>') ||
      !routeSource.includes('definePageMeta({') ||
      !/\buseSeo\s*\(/.test(routeSource)
    ) {
      violations.push(
        `${member.route} (fireux-composed-lasagne must use UPage → UPageBody, definePageMeta, and useSeo)`
      )
    }
    if (/<main\b|max-w-7xl gap-12 px-4 py-10/.test(routeSource)) {
      violations.push(
        `${member.route} (layout and Nuxt UI own the page container; repeated main/layout classes are drift)`
      )
    }
    if (
      member.debug !== false &&
      (!routeSource.includes('<DevDebugPanel') ||
        !routeSource.includes('object-origin="fetched"') ||
        !routeSource.includes(':objects=') ||
        !routeSource.includes(':derived=') ||
        !routeSource.includes('include-route') ||
        !routeSource.includes('launcher'))
    ) {
      violations.push(
        `${member.route} (FL index route must expose launcher-backed fetched objects and acquisition-derived data)`
      )
    }
    let previous = -1
    for (const layer of member.layers) {
      const index = routeSource.indexOf(layer)
      if (index < 0 || index <= previous) {
        violations.push(
          `${member.route} (fireux-composed-lasagne must visibly compose ${member.layers.join(' → ')})`
        )
        break
      }
      previous = index
    }
    if (/<CollectionPage|CollectionManager/.test(routeSource)) {
      violations.push(
        `${member.route} (fireux-composed-lasagne is flat; CollectionPage and CollectionManager are retired here)`
      )
    }
    const componentSource = readFileSync(
      path.join(repoRoot, member.component),
      'utf8'
    )
    if (!member.prop.test(componentSource)) {
      violations.push(
        `${member.component} (fireux-composed-lasagne Collection must receive its named Entity prop)`
      )
    }
    const propsBlock = componentSource.match(
      /defineProps<\{([\s\S]*?)\}>\(\)/
    )?.[1]
    const publicProps = propsBlock
      ? [...propsBlock.matchAll(/^\s+([A-Za-z][A-Za-z0-9]*)\??:/gm)].map(
          (match) => match[1]
        )
      : []
    if (publicProps.join(',') !== member.props.join(',')) {
      violations.push(
        `${member.component} (fireux-composed-lasagne Collection props must be exactly ${member.props.join(', ')})`
      )
    }
    const listSource = readFileSync(
      path.join(
        repoRoot,
        path.dirname(member.component),
        'Collection/List.vue'
      ),
      'utf8'
    )
    if (
      member.component ===
        'packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection.vue' &&
      !/menu\.kitchen\?\.logo_image_url \|\| menu\.kitchen\?\.image_url/.test(
        listSource
      )
    ) {
      violations.push(
        `${member.component} (Kitchen-backed Menu cards must project Place logo, then Place image)`
      )
    }
    const presentationProp = member.presentationProp ?? 'cell'
    const presentationPropPattern = new RegExp(
      `${member.chain[1]}[\\s\\S]{0,120}:${presentationProp}=`
    )
    if (
      !componentSource.includes(member.chain[0]) ||
      !listSource.includes(member.chain[1]) ||
      !presentationPropPattern.test(listSource) ||
      (!member.presentationProp &&
        /<CollectionCell[\s\S]{0,240}:(title|description|image|to)=/.test(
          listSource
        )) ||
      /#pill|#cell|variant\??:\s*['"]pill/.test(listSource)
    ) {
      violations.push(
        `${member.component} (FL index internals must follow ${member.chain.join(' → ')} without variant slots)`
      )
    }
    if (
      member.debug !== false &&
      (!listSource.includes('<DevDebugPanel') ||
        !listSource.includes('object-origin="passed"') ||
        !listSource.includes(':objects=') ||
        !listSource.includes(':derived="{ cells }"') ||
        !listSource.includes('launcher'))
    ) {
      violations.push(
        `${member.component} (FL index List must expose passed interface data and final cells through the shared debug launcher)`
      )
    }
    if (
      richCollectionMembers.has(member.component) &&
      !listSource.includes('<UPageGrid')
    ) {
      violations.push(
        `${member.component} (rich FL index List must use Nuxt UI UPageGrid)`
      )
    }
    if (richCollectionMembers.has(member.component)) {
      const componentDirectory = path.dirname(member.component)
      const heroPath = path.join(repoRoot, componentDirectory, 'Hero.vue')
      const heroSource = readFileSync(heroPath, 'utf8')
      if (
        !heroSource.includes('<UPageHeader') ||
        heroSource.includes('<UPageHero')
      ) {
        violations.push(
          `${path.relative(repoRoot, heroPath)} (rich FL index Hero must use compact Nuxt UI UPageHeader)`
        )
      }
      const createPath = path.join(repoRoot, componentDirectory, 'Create.vue')
      const createSource = readFileSync(createPath, 'utf8')
      const isKitchenCreate = member.component.includes(
        'fireux-kitchens/src/runtime/kitchen/components/Collection.vue'
      )
      if (
        (!isKitchenCreate &&
          (!createSource.includes('<UPageCard') ||
            createSource.includes('<UPageCTA'))) ||
        (isKitchenCreate && !createSource.includes('<WorkspaceCta'))
      ) {
        violations.push(
          `${path.relative(repoRoot, createPath)} (rich FL index Create must use a compact Nuxt UI card or the accepted Kitchen Workspace doorway)`
        )
      }
    }
  }

  const placeRoute = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-places/src/runtime/pages/places/index.vue'
    ),
    'utf8'
  )
  if (
    !/<PlaceCollection :places="places"\s*\/>[\s\S]*<CollectionPagination/.test(
      placeRoute
    )
  ) {
    violations.push(
      'packages/extensions/fireux-places/src/runtime/pages/places/index.vue (pagination must remain route-owned immediately after PlaceCollection)'
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
    const namedCollectionProp = routeOwnedManagers.get(managerPath)
    const hasPresentationContract = namedCollectionProp
      ? source.includes('<CollectionHeader') && namedCollectionProp.test(source)
      : source.includes('<CollectionHeader') &&
        /<MoleculesStateCard\s+surface=["']collection["']/.test(source)
    if (!hasPresentationContract) {
      violations.push(
        `${managerPath} (ordinary Entity manager must use CollectionHeader and either receive its named collection prop or retain the earlier collection-state contract)`
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

function validateCardSpecimen(repoRoot, violations) {
  const specimenPath = path.join(
    repoRoot,
    'projects/misebox/misebox-app/app/components/PowerCards.vue'
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
  const parkedPropertyDetail =
    'packages/extensions/fireux-properties/src/runtime/pages/properties/[slug].vue'
  if (existsSync(path.join(repoRoot, parkedPropertyDetail))) {
    violations.push(
      `${parkedPropertyDetail} (Property has no public Detail contract)`
    )
  }

  const detailPageMeta = [
    [
      'packages/core/fireux-core/src/runtime/pages/apps/[id].vue',
      'App',
      "'default'",
    ],
    ['projects/fireux/fireux-app/app/pages/apps/[id].vue', 'App', "'default'"],
    [
      'packages/core/fireux-core/src/runtime/pages/users/[handle]/index.vue',
      'User',
      "'default'",
    ],
    [
      'projects/misebox/misebox-app/app/pages/users/[handle]/index.vue',
      'User',
      "'default'",
    ],
    [
      'projects/fireux/fireux-app/app/pages/ecosystems/[id].vue',
      'Ecosystem',
      "'default'",
    ],
    [
      'projects/fireux/fireux-app/app/pages/projects/[id].vue',
      'Project',
      "'default'",
    ],
    [
      'packages/extensions/fireux-places/src/runtime/pages/places/[id]/index.vue',
      'Place',
      "'default'",
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/index.vue',
      'Kitchen',
      "'default'",
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue',
      'Job',
      "'default'",
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/menus/[menuId]/index.vue',
      'Menu',
      'false',
    ],
    [
      'packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/[slug].vue',
      'Supplier',
      "'default'",
    ],
    [
      'packages/extensions/fireux-properties/src/runtime/pages/portfolios/[id].vue',
      'Portfolio',
      "'default'",
    ],
  ]
  for (const [routePath, title, layout] of detailPageMeta) {
    const source = readFileSync(path.join(repoRoot, routePath), 'utf8')
    for (const contract of [
      `layout: ${layout}`,
      `title: '${title}'`,
      `description: 'View ${title} details.'`,
    ]) {
      if (!source.includes(contract)) {
        violations.push(
          `${routePath} (missing FL Detail metadata: ${contract})`
        )
      }
    }
    if (/\n\s*name:\s*['"]/.test(source)) {
      violations.push(`${routePath} (must use Nuxt's generated route name)`)
    }
  }

  const detailRoutes = new Map([
    [
      'packages/core/fireux-core/src/runtime/pages/apps/[id].vue',
      ['<AppDetail v-if="app" :app="app"', 'useAppDetail'],
    ],
    [
      'packages/core/fireux-core/src/runtime/pages/users/[handle]/index.vue',
      ['<UserDetail v-if="user" :user="user"', 'useUserDetail'],
    ],
    [
      'projects/misebox/misebox-app/app/pages/users/[handle]/index.vue',
      ['<UserDetail v-if="user" :user="user"', 'useUserDetail'],
    ],
    [
      'projects/fireux/fireux-app/app/pages/apps/[id].vue',
      ['<AppDetail v-if="app" :app="app"', 'usePlatformAppDetail'],
    ],
    [
      'projects/fireux/fireux-app/app/pages/ecosystems/[id].vue',
      [
        '<EcosystemDetail v-if="ecosystem" :ecosystem="ecosystem"',
        'usePlatformEcosystemDetail',
      ],
    ],
    [
      'projects/fireux/fireux-app/app/pages/projects/[id].vue',
      [
        '<ProjectDetail v-if="project" :project="project"',
        'usePlatformProjectDetail',
      ],
    ],
    [
      'packages/extensions/fireux-places/src/runtime/pages/places/[id]/index.vue',
      ['<PlaceDetail v-if="place" :place="place"', 'usePlaceDetail'],
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/index.vue',
      ['<KitchenDetail v-if="kitchen" :kitchen="kitchen"', 'useKitchenDetail'],
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue',
      ['<JobDetail v-if="job" :job="job"', 'useJobDetail'],
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/menus/[menuId]/index.vue',
      ['<MenuRoute', 'menuRouteScope'],
    ],
    [
      'packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/[slug].vue',
      [
        '<SupplierDetail v-if="supplier" :supplier="supplier"',
        'useSupplierDetail',
      ],
    ],
    [
      'packages/extensions/fireux-properties/src/runtime/pages/portfolios/[id].vue',
      [
        '<PortfolioDetail v-if="portfolio" :portfolio="portfolio"',
        'usePortfolioDetail',
      ],
    ],
  ])
  for (const [routePath, [componentContract, readerContract]] of detailRoutes) {
    const source = readFileSync(path.join(repoRoot, routePath), 'utf8')
    if (!source.includes(componentContract)) {
      violations.push(`${routePath} (missing FL one-object Detail boundary)`)
    }
    if (
      routePath ===
      'packages/extensions/fireux-kitchens/src/runtime/pages/menus/[menuId]/index.vue'
    ) {
      if (
        !source.includes(readerContract) ||
        !source.includes("useRouteParam('menuId')") ||
        !source.includes(':route-menu-id="routeMenuId"')
      ) {
        violations.push(
          `${routePath} (missing canonical MenuRoute identity and scope boundary)`
        )
      }
      continue
    }
    if (!source.includes(readerContract) || !source.includes('await ready')) {
      violations.push(
        `${routePath} (missing FL route-owned Detail acquisition)`
      )
    }
    if (
      !source.includes('<DevDebugPanel') ||
      !source.includes('object-origin="fetched"') ||
      !source.includes(':objects=') ||
      !source.includes(':derived=') ||
      !source.includes('include-route') ||
      !source.includes('launcher')
    ) {
      violations.push(
        `${routePath} (FL Detail route must expose launcher-backed fetched objects and route-derived data)`
      )
    }
  }

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
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Detail/Header.vue',
      'KitchenHeader',
    ],
    [
      'packages/extensions/fireux-places/src/runtime/place/components/Detail.vue',
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
    supplierDetailSource.includes('useSupplierDetail(') ||
    !supplierDetailSource.includes('supplier: Supplier') ||
    !supplierDetailSource.includes('SupplierDetailHeader') ||
    !supplierDetailSource.includes('SupplierDetailCatalogue') ||
    !supplierDetailSource.includes('SupplierDetailDeliveryAreas') ||
    !supplierDetailSource.includes('SupplierDetailCompany') ||
    !supplierDetailSource.includes('SupplierDetailAdmin')
  ) {
    violations.push(
      `${supplierDetailPath} (must compose the canonical Supplier without reacquiring its root)`
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
    '<SupplierDetail v-if="supplier" :supplier="supplier"',
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
