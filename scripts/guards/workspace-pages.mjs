// @fireux-script
// last_used: 2026-07-25
// usage_note: keeps workspace page composition explicit and surface metadata valid.
// FILE: scripts/guards/workspace-pages.mjs
// Concurrent edit — 2026-07-20 16:21 CEST — Workspace Spine project cleanup: remove the retired app redirect exception.
// Concurrent edit — 2026-07-20 16:22 CEST — Workspace Spine pass: enforce route-level access and selection metadata.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const PAGE_MARKER = '/pages/workspace/'
const CONSOLE_LAYOUT =
  'packages/core/fireux-core/src/runtime/layouts/workspace.vue'
const CONSOLE_MIDDLEWARE =
  'packages/core/fireux-core/src/runtime/middleware/fireux-workspace.global.ts'
const CONSOLE_NAVBAR =
  'packages/core/fireux-core/src/runtime/components/layouts/workspace/Navbar.vue'
const CONSOLE_SHARED_NAVBAR =
  'packages/core/fireux-core/src/runtime/components/layouts/dashboard/Navbar.vue'
const CONSOLE_AI_CAPABILITY_PLACEHOLDER =
  'packages/extensions/fireux-ai/src/runtime/components/Workspace/AI/CapabilityPlaceholder.vue'
const FIREUX_AI_MODULE = 'packages/extensions/fireux-ai/src/module.ts'
const ROUTE_AUTH_GUARD =
  'packages/core/fireux-core/src/runtime/utils/routeAuthGuard.ts'
const KITCHEN_MENUS_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Operations/Menus'
const KITCHEN_RECIPES_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Operations/Recipes'
const KITCHEN_RECIPES_FETCH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/recipe/fetch/useKitchenRecipeCollection.ts'
const KITCHEN_RECIPES_CONTROLLER =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/operations/Recipes/useKitchenWorkspaceRecipes.ts'
const STANDARD_SURFACES = new Set([
  'browse',
  'detail',
  'create',
  'edit',
  'workflow',
  'live',
])
const NON_DIRECT_PAGES = new Map([
  ['packages/core/fireux-core/src/runtime/pages/workspace/index.vue', 'redirect'],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity.vue',
    'router',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders.vue',
    'live',
  ],
])
const ROUTE_ONLY_META_KEYS = [
  'requiresAuth',
  'requiresSelection',
  'roles',
  'visibility',
]
const CONSOLE_ENTITY_COMPONENT_ROOTS = [
  'packages/core/fireux-core/src/runtime/project/components/Workspace',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace',
  'packages/extensions/fireux-properties/src/runtime/portfolio/components/Workspace',
  'packages/extensions/fireux-properties/src/runtime/property/components/Workspace',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace',
  'projects/fireux/fireux-blank/app/components/Workspace/Blank',
]
const CONSOLE_TEAM_COMPONENT_ROOTS = CONSOLE_ENTITY_COMPONENT_ROOTS
const CONSOLE_TEAM_COMPOSABLES = [
  'packages/core/fireux-core/src/runtime/project/composables/workspace/team/useProjectWorkspaceTeam.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenWorkspaceTeam.ts',
  'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/team/usePortfolioWorkspaceTeam.ts',
  'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/team/usePropertyWorkspaceTeam.ts',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/team/useSupplierWorkspaceTeam.ts',
  'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/team/useBlankWorkspaceTeam.ts',
]
const CONSOLE_OPERATION_CONTRACTS = {
  project: {
    catalogue: 'projects/fireux/fireux-app/app/meta.ts',
    operations: ['apps', 'ecosystem'],
    routeRoot: 'projects/fireux/fireux-app/app/pages/workspace/project',
  },
  kitchen: {
    catalogue:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operations.ts',
    operations: [
      'dishes',
      'drinks',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'recipes',
      'stations',
      'suppliers',
      'tables',
      'finance',
    ],
    routeRoot:
      'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen',
  },
  supplier: {
    catalogue:
      'packages/extensions/fireux-suppliers/src/runtime/supplier/models/operations.ts',
    operations: ['catalogue', 'ingredients', 'items'],
    routeRoot:
      'packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier',
  },
  portfolio: {
    catalogue:
      'packages/extensions/fireux-properties/src/runtime/portfolio/models/operations.ts',
    operations: ['properties', 'compliance', 'documents', 'tasks', 'finance'],
    routeRoot:
      'packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio',
  },
  property: {
    catalogue:
      'packages/extensions/fireux-properties/src/runtime/property/models/operations.ts',
    operations: ['reservations', 'calendar'],
    routeRoot:
      'packages/extensions/fireux-properties/src/runtime/pages/workspace/property',
  },
  blank: {
    catalogue: 'projects/fireux/fireux-blank/app/meta.ts',
    operations: [],
    routeRoot: 'projects/fireux/fireux-blank/app/pages/workspace/blank',
  },
}

const CONSOLE_BASE_CAPABILITIES = ['overview', 'identity', 'team']

const CONSOLE_AI_CONTRACTS = [
  {
    family: 'project',
    definition:
      'packages/core/fireux-core/src/runtime/project/models/agent-operations.ts',
    registration:
      'packages/ecosystem/fireux-fireux/src/runtime/ai/workspace-agents.ts',
  },
  {
    family: 'kitchen',
    definition:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operation-agents.ts',
    registration:
      'packages/ecosystem/fireux-misebox/src/runtime/ai/workspace-agents.ts',
  },
  {
    family: 'supplier',
    definition:
      'packages/extensions/fireux-suppliers/src/runtime/supplier/models/operation-agents.ts',
    registration:
      'packages/ecosystem/fireux-bringli/src/runtime/ai/workspace-agents.ts',
  },
  {
    family: 'portfolio',
    definition:
      'packages/extensions/fireux-properties/src/runtime/portfolio/models/operation-agents.ts',
    registration:
      'packages/ecosystem/fireux-granite/src/runtime/ai/workspace-agents.ts',
  },
  {
    family: 'property',
    definition:
      'packages/extensions/fireux-properties/src/runtime/property/models/operation-agents.ts',
    registration:
      'packages/ecosystem/fireux-buenohost/src/runtime/ai/workspace-agents.ts',
  },
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const seenPages = new Set()

  validateWorkspaceLayout(repoRoot, violations)
  validateWorkspaceNavigationLifecycle(repoRoot, violations)
  validateWorkspaceOperationAIPlaceholder(repoRoot, violations)
  validateWorkspaceEntityComponentHierarchy(repoRoot, violations)
  validateWorkspaceMenuCanon(repoRoot, violations)
  validateWorkspaceOperationContracts(repoRoot, violations)
  validateWorkspaceAIContracts(repoRoot, violations)
  validateKitchenMenusWorkspace(repoRoot, violations)
  validateKitchenRecipesWorkspace(repoRoot, violations)

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, repoRoot, violations, seenPages)
  }

  for (const relative of NON_DIRECT_PAGES.keys()) {
    if (!seenPages.has(relative)) {
      violations.push(`${relative} (stale non-direct page exception)`)
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ workspace page contract drift detected:',
        ...violations
          .sort((left, right) => left.localeCompare(right))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Every Workspace page using the shared transition has one real root DOM element; only an explicit pageTransition: false route is exempt.',
        '- Workspace pages compose UDashboardPanel, LayoutsWorkspaceNavbar, and a body slot directly.',
        '- Pages own body width and spacing; named domain components own domain presentation.',
        '- Header actions belong in the workspace navbar right slot.',
        '- Route access, visibility, roles, and selection requirements belong at top-level page meta; nav owns presentation only.',
        '- Surface metadata, when declared, uses browse, detail, create, edit, workflow, or live.',
        '- Only redirects, nested routers, and live layouts are exempt.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ workspace pages use the explicit page contract')
}

function validateWorkspaceOperationAIPlaceholder(repoRoot, violations) {
  const placeholderPath = path.join(repoRoot, CONSOLE_AI_CAPABILITY_PLACEHOLDER)
  if (!existsSync(placeholderPath)) {
    violations.push(
      `${CONSOLE_AI_CAPABILITY_PLACEHOLDER} (FireUX AI capability placeholder is missing)`
    )
    return
  }

  const navbar = readFileSync(path.join(repoRoot, CONSOLE_NAVBAR), 'utf8')
  if (/\bAI\b|OperationAI|workspaceOperationAI/.test(navbar)) {
    violations.push(
      `${CONSOLE_NAVBAR} (Core Workspace presentation must expose neutral slots without owning AI behavior)`
    )
  }

  const aiModule = readFileSync(path.join(repoRoot, FIREUX_AI_MODULE), 'utf8')
  if (!aiModule.includes('components: configureComponents')) {
    violations.push(
      `${FIREUX_AI_MODULE} (FireUX AI must register its own presentation components)`
    )
  }
}

function validateWorkspaceEntityComponentHierarchy(repoRoot, violations) {
  for (const root of CONSOLE_ENTITY_COMPONENT_ROOTS) {
    if (!existsSync(path.join(repoRoot, root, 'Index.vue'))) {
      violations.push(
        `${root}/Index.vue (the actual Workspace Entity Index capability must use its visible product name)`
      )
    }
    if (existsSync(path.join(repoRoot, root, 'Index', 'Index.vue'))) {
      violations.push(
        `${root}/Index/Index.vue (do not hide a Workspace Entity doorway behind an opaque repeated Index bucket)`
      )
    }
    if (existsSync(path.join(repoRoot, root, 'AI', 'Index.vue'))) {
      violations.push(
        `${root}/AI/Index.vue (AI capabilities must use their visible product name and must not masquerade as the Workspace Entity Index)`
      )
    }
  }

  for (const root of CONSOLE_TEAM_COMPONENT_ROOTS) {
    if (!existsSync(path.join(repoRoot, root, 'Team', 'Index.vue'))) {
      violations.push(
        `${root}/Team/Index.vue (Team is structural Workspace anatomy beside Operations)`
      )
    }
    if (existsSync(path.join(repoRoot, root, 'Operations', 'Team'))) {
      violations.push(
        `${root}/Operations/Team (Team must not be nested inside the Operations implementation bucket)`
      )
    }
  }

  for (const relative of CONSOLE_TEAM_COMPOSABLES) {
    if (!existsSync(path.join(repoRoot, relative))) {
      violations.push(
        `${relative} (Team workspace ownership sits beside operations for every Workspace Entity)`
      )
    }
  }
}

function validateWorkspaceMenuCanon(repoRoot, violations) {
  for (const contract of Object.values(CONSOLE_OPERATION_CONTRACTS)) {
    const relative = `${contract.routeRoot}/create.vue`
    const fullPath = path.join(repoRoot, relative)
    if (!existsSync(fullPath)) continue

    const source = readFileSync(fullPath, 'utf8')
    if (
      !/nav:\s*\{[\s\S]*?hidden:\s*true[\s\S]*?desktop:\s*false[\s\S]*?mobile:\s*false[\s\S]*?\}/.test(
        source
      )
    ) {
      violations.push(
        `${relative} (Create belongs to the selector lifecycle and must not appear in selected-workspace navigation)`
      )
    }
  }

  const kitchenQrRelative =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/qr.vue'
  const kitchenQr = readFileSync(path.join(repoRoot, kitchenQrRelative), 'utf8')
  if (
    !/nav:\s*\{[\s\S]*?hidden:\s*true[\s\S]*?desktop:\s*false[\s\S]*?mobile:\s*false[\s\S]*?\}/.test(
      kitchenQr
    )
  ) {
    violations.push(
      `${kitchenQrRelative} (Menu QR is a child tool, not a top-level Kitchen Operation)`
    )
  }

  const kitchenDevRelative =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/dev.vue'
  const kitchenDev = readFileSync(
    path.join(repoRoot, kitchenDevRelative),
    'utf8'
  )
  const workspaceMiddleware = readFileSync(
    path.join(repoRoot, CONSOLE_MIDDLEWARE),
    'utf8'
  )
  if (!/roles:\s*\[['"]developer['"]\]/.test(kitchenDev)) {
    violations.push(
      `${kitchenDevRelative} (Workspace Dev must require the developer role)`
    )
  }
  if (
    !/needsDeveloper[\s\S]*!import\.meta\.dev[\s\S]*statusCode:\s*404/.test(
      workspaceMiddleware
    ) ||
    !/needsDeveloper[\s\S]*developerId[\s\S]*auth\.uid !== developerId/.test(
      workspaceMiddleware
    )
  ) {
    violations.push(
      `${CONSOLE_MIDDLEWARE} (developer Workspace routes must be build-only and developer-only)`
    )
  }
}

function validateWorkspaceNavigationLifecycle(repoRoot, violations) {
  const pagesConfigRelative =
    'packages/core/fireux-core/src/config/module/pages-config.ts'
  const overviewRelative =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/overview/useKitchenWorkspaceOverview.ts'
  const pagesConfig = readFileSync(
    path.join(repoRoot, pagesConfigRelative),
    'utf8'
  )
  const overview = readFileSync(path.join(repoRoot, overviewRelative), 'utf8')
  const layout = readFileSync(path.join(repoRoot, CONSOLE_LAYOUT), 'utf8')
  const middleware = readFileSync(
    path.join(repoRoot, CONSOLE_MIDDLEWARE),
    'utf8'
  )
  const authGuard = readFileSync(path.join(repoRoot, ROUTE_AUTH_GUARD), 'utf8')

  if (
    !/startsWith\(['"]\/workspace['"]\)[\s\S]*pageTransition:\s*false/.test(
      pagesConfig
    )
  ) {
    violations.push(
      `${pagesConfigRelative} (Workspace navigation must not inherit the global out-in page transition)`
    )
  }
  if (
    /useKitchenWorkspace(?:Menus|Ingredients|Dishes|Recipes|Suppliers|Stations|Mise|Orders|Tables)/.test(
      overview
    )
  ) {
    violations.push(
      `${overviewRelative} (Kitchen Overview must not initialize operation workspaces for summary counts)`
    )
  }
  if (/<NuxtErrorBoundary[^>]*:key=["']route\.fullPath/.test(layout)) {
    violations.push(
      `${CONSOLE_LAYOUT} (route changes must not recreate the persistent Workspace boundary)`
    )
  }
  if (
    !/isWorkspacePath\(path\)[\s\S]*to\.meta\.pageTransition = false/.test(
      middleware
    )
  ) {
    violations.push(
      `${CONSOLE_MIDDLEWARE} (every Workspace navigation must disable the global page transition)`
    )
  }
  if (
    !/const currentUid = auth\.currentUser\?\.uid[\s\S]*if \(currentUid\)[\s\S]*return \{[\s\S]*isAuthenticated: !auth\.currentUser\?\.isAnonymous/.test(
      authGuard
    )
  ) {
    violations.push(
      `${ROUTE_AUTH_GUARD} (established authentication must not install another navigation-time observer)`
    )
  }
}

function validateWorkspaceOperationContracts(repoRoot, violations) {
  for (const [family, contract] of Object.entries(
    CONSOLE_OPERATION_CONTRACTS
  )) {
    const catalogue = contract.catalogue
      ? readFileSync(path.join(repoRoot, contract.catalogue), 'utf8')
      : ''

    for (const operation of contract.operations) {
      const routeCandidates = [
        path.join(repoRoot, contract.routeRoot, `${operation}.vue`),
        path.join(repoRoot, contract.routeRoot, operation, 'index.vue'),
      ]
      if (!routeCandidates.some((candidate) => existsSync(candidate))) {
        violations.push(
          `${contract.routeRoot}/${operation} (missing ${family} Workspace Operation route)`
        )
      }
      if (family === 'kitchen') {
        const routePath = routeCandidates.find((candidate) =>
          existsSync(candidate)
        )
        const routeSource = routePath ? readFileSync(routePath, 'utf8') : ''
        if (
          !routeSource.includes(
            `<WorkspaceKitchenOperationsGuidingLiterature operation="${operation}" />`
          )
        ) {
          violations.push(
            `${contract.routeRoot}/${operation} (Kitchen Workspace Operation must render its catalogue-backed guiding literature)`
          )
        }
        const toolsMarker =
          operation === 'drinks'
            ? '<WorkspaceKitchenOperationsDishesTools'
            : `<WorkspaceKitchenOperationsCapabilityTools operation="${operation}"`
        const aiMarker = '<WorkspaceKitchenOperationsCapabilityAI'
        const viewMarker =
          operation === 'drinks'
            ? '<WorkspaceKitchenOperationsDishesRead'
            : `<WorkspaceKitchenOperationsCapabilityView operation="${operation}"`
        const toolsIndex = routeSource.indexOf(toolsMarker)
        const aiIndex = routeSource.indexOf(aiMarker)
        const aiCloseIndex = routeSource.indexOf('>', aiIndex)
        const aiOperationIndex = routeSource.indexOf(
          `operation="${operation}"`,
          aiIndex
        )
        const viewIndex = routeSource.indexOf(viewMarker)
        if (
          toolsIndex < 0 ||
          aiIndex <= toolsIndex ||
          aiOperationIndex < aiIndex ||
          aiOperationIndex > aiCloseIndex ||
          viewIndex <= aiIndex
        ) {
          violations.push(
            `${contract.routeRoot}/${operation} (Kitchen Workspace Operation must compose Tools, AI, then View)`
          )
        }
      }
      if (
        contract.catalogue &&
        !catalogue.includes(`'${family}.${operation}'`) &&
        !catalogue.includes(`['${operation}'`) &&
        !catalogue.includes(`'${operation}',`)
      ) {
        violations.push(
          `${contract.catalogue} (missing ${family}.${operation} Operation catalogue entry)`
        )
      }
    }

    if (family === 'kitchen') {
      const searchHeadlines = catalogue.match(/\bheadline:\s*['"][^'"]+['"]/g) || []
      if (searchHeadlines.length !== contract.operations.length) {
        violations.push(
          `${contract.catalogue} (every Kitchen Operation requires one search-language customer-job headline)`
        )
      }
      const keywordGroups = catalogue.match(/\bkeywords:\s*\[[\s\S]*?\]/g) || []
      if (
        keywordGroups.length !== contract.operations.length ||
        keywordGroups.some(
          (group) => (group.match(/['"][^'"]+['"]/g) || []).length !== 5
        )
      ) {
        violations.push(
          `${contract.catalogue} (every Kitchen Operation requires exactly five search-intent phrases for its public literature page)`
        )
      }

      const publicOperationPage = readFileSync(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/pages/operations/[slug].vue'
        ),
        'utf8'
      )
      if (
        !publicOperationPage.includes('OperationGuidingLiterature') ||
        !publicOperationPage.includes('operation.headline || operation.title')
      ) {
        violations.push(
          'Core public Operation pages must render the search-language headline and shared guiding literature component.'
        )
      }
      const capabilityCatalogue = readFileSync(
        path.join(
          repoRoot,
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/operation-capabilities.ts'
        ),
        'utf8'
      )
      for (const operation of contract.operations) {
        if (!capabilityCatalogue.includes(`  ${operation}: [`)) {
          violations.push(
            `Kitchen ${operation} Operation is missing its tool capability catalogue.`
          )
        }
      }
    }

    for (const capability of CONSOLE_BASE_CAPABILITIES) {
      const candidates = routeCandidatesForCapability(
        repoRoot,
        contract.routeRoot,
        capability
      )
      if (!candidates.some((candidate) => existsSync(candidate))) {
        violations.push(
          `${contract.routeRoot} (every Workspace requires ${capability})`
        )
      }
      if (
        contract.catalogue &&
        (catalogue.includes(`'${family}.${capability}'`) ||
          new RegExp(`\\[\\s*['\"]${capability}['\"]\\s*,`).test(catalogue))
      ) {
        violations.push(
          `${contract.catalogue} (${capability} is a baked-in Workspace capability, not an Operation)`
        )
      }
    }
  }

  const layout = readFileSync(path.join(repoRoot, CONSOLE_LAYOUT), 'utf8')
  const navbar = readFileSync(
    path.join(repoRoot, CONSOLE_SHARED_NAVBAR),
    'utf8'
  )
  if (
    !layout.includes('LayoutsSharedNotificationsSlideover') ||
    !layout.includes('useWorkspaceNotifications') ||
    !navbar.includes('openNotifications()')
  ) {
    violations.push(
      'Core Workspace shell must provide the baked-in Notifications capability.'
    )
  }
}

function validateWorkspaceAIContracts(repoRoot, violations) {
  for (const contract of CONSOLE_AI_CONTRACTS) {
    const definitionPath = path.join(repoRoot, contract.definition)
    const registrationPath = path.join(repoRoot, contract.registration)
    if (!existsSync(definitionPath)) {
      violations.push(
        `${contract.definition} (missing ${contract.family} Entity-owned AI definition)`
      )
      continue
    }
    if (!existsSync(registrationPath)) {
      violations.push(
        `${contract.registration} (missing ${contract.family} ecosystem AI registration)`
      )
      continue
    }
    const registration = readFileSync(registrationPath, 'utf8')
    const importPath = contract.definition
      .split('/src/')[1]
      .replace(/\.ts$/, '')
    if (!registration.includes(importPath)) {
      violations.push(
        `${contract.registration} (must import the ${contract.family} Entity-owned AI definition)`
      )
    }
  }
}

function routeCandidatesForCapability(repoRoot, routeRoot, capability) {
  return [
    path.join(repoRoot, routeRoot, `${capability}.vue`),
    path.join(repoRoot, routeRoot, capability, 'index.vue'),
  ]
}

function validateKitchenRecipesWorkspace(repoRoot, violations) {
  const files = {
    Index: {
      required: /\bprovideKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceRecipes\s*\(/,
    },
    Read: {
      required: /\buseKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceRecipes\s*\(/,
    },
    Write: {
      required: /\buseKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceRecipes\s*\(/,
    },
  }

  for (const [name, contract] of Object.entries(files)) {
    const relative = `${KITCHEN_RECIPES_COMPONENT_ROOT}/${name}.vue`
    const fullPath = path.join(repoRoot, relative)
    if (!existsSync(fullPath)) {
      violations.push(
        `${relative} (missing Kitchen Recipes workspace consumer)`
      )
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    if (!contract.required.test(source)) {
      violations.push(
        `${relative} (must use the route-owned Kitchen Recipes workspace)`
      )
    }
    if (contract.forbidden.test(source)) {
      violations.push(
        `${relative} (must not instantiate the Kitchen Recipes data graph directly)`
      )
    }
    if (name === 'Read') {
      for (const expected of [
        'v-else-if="error"',
        'title="Recipes unavailable"',
        "outcome === 'empty'",
      ]) {
        if (!source.includes(expected)) {
          violations.push(
            `${relative} (must preserve explicit Recipes read states)`
          )
        }
      }
    }
  }

  const fetchSource = readFileSync(
    path.join(repoRoot, KITCHEN_RECIPES_FETCH),
    'utf8'
  )
  for (const expected of [
    'useFirestoreCollectionState',
    'error,',
    'outcome,',
  ]) {
    if (!fetchSource.includes(expected)) {
      violations.push(
        `${KITCHEN_RECIPES_FETCH} (must preserve the canonical collection state)`
      )
    }
  }
  if (/collectionRef\.value\s*===\s*undefined/.test(fetchSource)) {
    violations.push(
      `${KITCHEN_RECIPES_FETCH} (must use the Firestore pending ref instead of inferring loading from collection data)`
    )
  }

  const controllerSource = readFileSync(
    path.join(repoRoot, KITCHEN_RECIPES_CONTROLLER),
    'utf8'
  )
  for (const expected of [
    'demoData.error.value',
    'demoData.outcome.value',
    'recipesError.value',
    'recipesOutcome.value',
  ]) {
    if (!controllerSource.includes(expected)) {
      violations.push(
        `${KITCHEN_RECIPES_CONTROLLER} (must preserve source-aware Recipes outcomes)`
      )
    }
  }
}

function validateKitchenMenusWorkspace(repoRoot, violations) {
  const files = {
    Index: {
      required: /\bprovideKitchenMenusWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceMenus\s*\(/,
    },
    List: {
      required: /\buseKitchenMenusWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceMenus\s*\(/,
    },
    Debug: {
      required: /\buseKitchenMenusWorkspace\s*\(/,
      forbidden: /\buseKitchenWorkspaceMenus\s*\(/,
    },
  }

  for (const [name, contract] of Object.entries(files)) {
    const relative = `${KITCHEN_MENUS_COMPONENT_ROOT}/${name}.vue`
    const fullPath = path.join(repoRoot, relative)
    if (!existsSync(fullPath)) {
      violations.push(`${relative} (missing Kitchen Menus workspace consumer)`)
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    if (!contract.required.test(source)) {
      violations.push(
        `${relative} (must use the route-owned Kitchen Menus workspace)`
      )
    }
    if (contract.forbidden.test(source)) {
      violations.push(
        `${relative} (must not instantiate the Kitchen Menus data graph directly)`
      )
    }
  }
}

function validateWorkspaceLayout(repoRoot, violations) {
  const fullPath = path.join(repoRoot, CONSOLE_LAYOUT)
  if (!existsSync(fullPath)) {
    violations.push(`${CONSOLE_LAYOUT} (missing shared Workspace layout)`)
    return
  }

  const source = readFileSync(fullPath, 'utf8')
  const hasDirectSlot = /<slot\b[^>]*\bv-else\b/.test(source)
  const hasGuardedSlot =
    /<NuxtErrorBoundary\b[^>]*\bv-else\b/.test(source) &&
    /<NuxtErrorBoundary\b[\s\S]*?<slot\s*\/>[\s\S]*?<template\s+#error=/.test(
      source
    ) &&
    /workspace-page-unavailable/.test(source) &&
    /clearPageError/.test(source)
  if (!hasDirectSlot && !hasGuardedSlot) {
    violations.push(
      `${CONSOLE_LAYOUT} (must consume the AppShell route through a direct or failure-isolated slot)`
    )
  }
  if (/<NuxtPage\b/.test(source)) {
    violations.push(
      `${CONSOLE_LAYOUT} (must not render a second route tree inside AppShell)`
    )
  }
}

function scan(dir, repoRoot, violations, seenPages) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      scan(fullPath, repoRoot, violations, seenPages)
      continue
    }

    const normalized = fullPath.split(path.sep).join('/')
    if (!normalized.includes(PAGE_MARKER) || !normalized.endsWith('.vue'))
      continue

    const source = readFileSync(fullPath, 'utf8')
    const relative = path.relative(repoRoot, fullPath).split(path.sep).join('/')
    const template = readTemplate(source)
    const script = readScript(source)
    const pageMeta = readPageMetaObject(script)
    const surface = readWorkspaceSurface(script)
    const exceptionKind = NON_DIRECT_PAGES.get(relative)
    const directContract = hasDirectContract(template)

    seenPages.add(relative)
    validateRenderedPageRoot(relative, template, pageMeta, violations)
    validateRouteMetaPlacement(relative, pageMeta, violations)

    if (surface && !STANDARD_SURFACES.has(surface)) {
      violations.push(`${relative} (invalid workspaceSurface: ${surface})`)
    }

    if (normalized.endsWith('/edit.vue') && surface !== 'edit') {
      violations.push(
        `${relative} (edit route must declare workspaceSurface: 'edit')`
      )
    }

    if (exceptionKind) {
      if (directContract) {
        violations.push(
          `${relative} (direct page must be removed from exceptions)`
        )
        continue
      }
      validateException(
        relative,
        exceptionKind,
        template,
        script,
        surface,
        violations
      )
      continue
    }

    validateDirectContract(relative, template, script, pageMeta, violations)
  }
}

function validateRenderedPageRoot(relative, template, pageMeta, violations) {
  if (/\bpageTransition\s*:\s*false\b/.test(pageMeta)) return

  if (
    !/^<template\b[^>]*>\s*<(?:div|main|section|article|aside|header|footer|nav|form)\b/.test(
      template
    )
  ) {
    violations.push(
      `${relative} (page transition requires one real root DOM element)`
    )
  }
}

function validateDirectContract(
  relative,
  template,
  script,
  pageMeta,
  violations
) {
  const requiredTemplateParts = [
    ['UDashboardPanel', /<UDashboardPanel\b/],
    ['header slot', /<template\s+#header\b/],
    ['LayoutsWorkspaceNavbar', /<LayoutsWorkspaceNavbar\b/],
    ['body slot', /<template\s+#body\b/],
  ]

  for (const [label, pattern] of requiredTemplateParts) {
    if (!pattern.test(template)) {
      violations.push(`${relative} (missing ${label})`)
    }
  }

  if (!/\blayout\s*:\s*['"]workspace['"]/.test(script)) {
    violations.push(
      `${relative} (direct workspace page must declare layout: 'workspace')`
    )
  }
  const isPublicEntry =
    /\bworkspaceAccess\s*:\s*['"]public-entry['"]/.test(pageMeta) &&
    /\bworkspaceSurface\s*:\s*['"]browse['"]/.test(pageMeta) &&
    /\brequiresSelection\s*:\s*false\b/.test(pageMeta)
  const hasValidAccess = isPublicEntry
    ? /\brequiresAuth\s*:\s*false\b/.test(script)
    : /\brequiresAuth\s*:\s*true\b/.test(script)

  if (!hasValidAccess) {
    violations.push(
      `${relative} (direct workspace page must require auth unless a browse-only public-entry explicitly requires neither auth nor selection)`
    )
  }
  if (!hasTopLevelProperty(pageMeta, 'requiresSelection')) {
    violations.push(
      `${relative} (direct workspace page must declare top-level requiresSelection)`
    )
  }
}

function validateRouteMetaPlacement(relative, pageMeta, violations) {
  if (!pageMeta) {
    violations.push(`${relative} (missing definePageMeta object)`)
    return
  }

  const nav = readTopLevelObjectProperty(pageMeta, 'nav')
  if (!nav) return

  for (const key of ROUTE_ONLY_META_KEYS) {
    if (!hasTopLevelProperty(nav, key)) continue
    violations.push(`${relative} (nav.${key} must move to top-level page meta)`)
  }
}

function validateException(
  relative,
  kind,
  template,
  script,
  surface,
  violations
) {
  if (kind === 'redirect' && !/\bnavigateTo\s*\(/.test(script)) {
    violations.push(`${relative} (redirect exception must call navigateTo)`)
  }
  if (kind === 'router' && !/<NuxtPage\b/.test(template)) {
    violations.push(`${relative} (router exception must render NuxtPage)`)
  }
  if (kind === 'live') {
    if (surface !== 'live') {
      violations.push(
        `${relative} (live exception must declare workspaceSurface: 'live')`
      )
    }
    if (!/\blayout\s*:\s*['"][^'"]+['"]/.test(script)) {
      violations.push(`${relative} (live exception must declare its layout)`)
    }
  }
}

function hasDirectContract(template) {
  return (
    /<UDashboardPanel\b/.test(template) &&
    /<template\s+#header\b/.test(template) &&
    /<LayoutsWorkspaceNavbar\b/.test(template) &&
    /<template\s+#body\b/.test(template)
  )
}

function readTemplate(source) {
  const start = source.indexOf('<template')
  if (start === -1) return ''
  const scriptStart = source.indexOf('<script', start)
  return source
    .slice(start, scriptStart === -1 ? source.length : scriptStart)
    .replace(/<!--[\s\S]*?-->/g, '')
}

function readScript(source) {
  const start = source.indexOf('<script')
  if (start === -1) return ''
  return stripJsComments(source.slice(start))
}

function readWorkspaceSurface(script) {
  return script.match(/\bworkspaceSurface\s*:\s*(['"])([^'"]+)\1/)?.[2] ?? ''
}

function readPageMetaObject(script) {
  const marker = script.indexOf('definePageMeta')
  if (marker === -1) return ''

  const callStart = script.indexOf('(', marker + 'definePageMeta'.length)
  if (callStart === -1) return ''

  const objectStart = script.indexOf('{', callStart + 1)
  if (objectStart === -1) return ''

  return readBalancedObject(script, objectStart)
}

function readTopLevelObjectProperty(objectSource, property) {
  const match = findTopLevelProperty(objectSource, property)
  if (!match || objectSource[match.valueStart] !== '{') return ''
  return readBalancedObject(objectSource, match.valueStart)
}

function hasTopLevelProperty(objectSource, property) {
  return Boolean(findTopLevelProperty(objectSource, property))
}

function findTopLevelProperty(objectSource, property) {
  if (!objectSource) return null

  let depth = 0
  let quote = ''
  let escaped = false

  for (let index = 0; index < objectSource.length; index += 1) {
    const character = objectSource[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = ''
      }
      continue
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character
      continue
    }
    if (character === '{') {
      depth += 1
      continue
    }
    if (character === '}') {
      depth -= 1
      continue
    }
    if (depth !== 1 || !/[A-Za-z_$]/.test(character)) continue

    const candidate = objectSource.slice(index).match(/^([A-Za-z_$][\w$]*)\s*:/)
    if (!candidate || candidate[1] !== property) continue

    let valueStart = index + candidate[0].length
    while (/\s/.test(objectSource[valueStart] ?? '')) valueStart += 1
    return { valueStart }
  }

  return null
}

function readBalancedObject(source, start) {
  let depth = 0
  let quote = ''
  let escaped = false

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = ''
      }
      continue
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character
      continue
    }
    if (character === '{') depth += 1
    if (character === '}') depth -= 1
    if (depth === 0) return source.slice(start, index + 1)
  }

  return ''
}

function stripJsComments(source) {
  let result = ''
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]

    if (lineComment) {
      if (character === '\n') {
        lineComment = false
        result += character
      }
      continue
    }

    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }

    if (quote) {
      result += character
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = ''
      }
      continue
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character
      result += character
      continue
    }
    if (character === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (character === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }

    result += character
  }

  return result
}
