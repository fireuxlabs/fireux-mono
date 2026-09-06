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
const PROJECT_WORKSPACE =
  'packages/core/fireux-core/src/runtime/project/composables/workspace/core/useProjectWorkspace.ts'
const KITCHEN_WORKSPACE =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspace.ts'
const CONSOLE_AI_CAPABILITY_PLACEHOLDER =
  'packages/extensions/fireux-ai/src/runtime/components/Workspace/AI/CapabilityPlaceholder.vue'
const MISEBOX_DASHBOARD_WORKSPACE =
  'projects/misebox/misebox-app/app/pages/dashboard/workspace.vue'
const MISEBOX_MAIN_PAGE = 'projects/misebox/misebox-app/app/pages/index.vue'
const RETIRED_KITCHEN_WORKSPACE_TOOLS =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Tools/Index.vue'
const MISEBOX_TENANT_KITCHEN_PAGE =
  'packages/ecosystem/fireux-misebox/src/runtime/pages/workspace/kitchen/index.vue'
const MISEBOX_PAGES_CONFIG =
  'packages/ecosystem/fireux-misebox/src/config/module/pages-config.ts'
const MISEBOX_MODULE = 'packages/ecosystem/fireux-misebox/src/module.ts'
const MISEBOX_COMPONENTS_CONFIG =
  'packages/ecosystem/fireux-misebox/src/config/module/components-config.ts'
const FIREUX_AI_MODULE = 'packages/extensions/fireux-ai/src/module.ts'
const ROUTE_AUTH_GUARD =
  'packages/core/fireux-core/src/runtime/utils/routeAuthGuard.ts'
const KITCHEN_MENUS_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus'
const KITCHEN_RECIPES_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Recipes'
const KITCHEN_RECIPES_FETCH =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/recipe/fetch/useKitchenRecipeCollection.ts'
const KITCHEN_RECIPES_CONTROLLER =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/Recipes/useKitchenWorkspaceRecipes.ts'
const KITCHEN_WASTE_DEV =
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Waste/Dev.vue'
const STANDARD_SURFACES = new Set([
  'browse',
  'detail',
  'create',
  'edit',
  'workflow',
  'live',
])
const NON_DIRECT_PAGES = new Map([
  [
    'packages/core/fireux-core/src/runtime/pages/workspace/index.vue',
    'redirect',
  ],
  [
    'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/index.vue',
    'redirect',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity.vue',
    'router',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/index.vue',
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
  'packages/core/fireux-core/src/runtime/project/composables/workspace/team/useProjectTeamData.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenTeamData.ts',
  'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/team/usePortfolioWorkspaceTeam.ts',
  'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/team/usePropertyWorkspaceTeam.ts',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/team/useSupplierWorkspaceTeam.ts',
  'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/team/useBlankWorkspaceTeam.ts',
]
const WORKSPACE_FAMILY_PAGE_ANATOMY = [
  {
    label: 'Project landing',
    page: 'projects/fireux/fireux-app/app/pages/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceProjectSelector',
      '<WorkspaceHero',
      '<WorkspaceProjectIndexAI />',
      '<WorkspaceProject />',
      '<WorkspaceProjectCapabilities />',
      '<WorkspaceProjectDiscovery />',
    ],
  },
  {
    label: 'Kitchen landing',
    page: 'projects/misebox/misebox-app/app/pages/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceKitchenSelector',
      '<WorkspaceHero',
      '<WorkspaceKitchenIndexAI />',
      '<WorkspaceKitchen />',
      '<WorkspaceKitchenCapabilities />',
      '<WorkspaceKitchenDiscovery />',
    ],
  },
  {
    label: 'Project Test',
    page: 'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/test/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<WorkspaceTestInfo',
      '<template #body',
      '<WorkspaceTestSelector',
      '<WorkspaceHero',
      '<WorkspaceTestAI',
      '<WorkspaceTest',
      '<WorkspaceTestDiscovery',
    ],
  },
  {
    label: 'Kitchen Test',
    page: 'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/test/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<WorkspaceTestInfo',
      '<template #body',
      '<WorkspaceTestSelector',
      '<WorkspaceHero',
      '<WorkspaceTestAI',
      '<WorkspaceTest',
      '<WorkspaceTestDiscovery',
    ],
  },
  {
    label: 'Project Team',
    page: 'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/team/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceProjectTeamSelector',
      '<WorkspaceHero',
      '<WorkspaceProjectTeamAI',
      '<WorkspaceProjectTeam',
      '<WorkspaceProjectTeamTools',
      '<WorkspaceProjectTeamDiscovery',
    ],
  },
  {
    label: 'Kitchen Team',
    page: 'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceKitchenTeamSelector',
      '<WorkspaceHero',
      '<WorkspaceKitchenTeamAI',
      '<WorkspaceKitchenTeam',
      '<WorkspaceKitchenTeamTools',
      '<WorkspaceKitchenTeamDiscovery',
    ],
  },
  ...['Dishes', 'Drinks'].map((catalogue) => ({
    label: `Kitchen ${catalogue}`,
    page: `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/${catalogue.toLowerCase()}/index.vue`,
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceKitchenDishesSelector',
      '<WorkspaceHero',
      '<WorkspaceKitchenCapabilityAI',
      '<WorkspaceKitchenDishes />',
      '<WorkspaceKitchenDishesTools',
      '<WorkspaceKitchenDishesCapabilityView',
      '<WorkspaceKitchenDishesDiscovery',
    ],
  })),
  {
    label: 'Kitchen Menus',
    page: 'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menus/index.vue',
    markers: [
      '<template #header',
      '<LayoutsWorkspaceNavbar',
      '<template #body',
      '<WorkspaceKitchenMenusSelector',
      '<WorkspaceHero',
      '<WorkspaceKitchenCapabilityAI',
      '<WorkspaceKitchenMenus />',
      '<WorkspaceKitchenMenusTools',
      '<WorkspaceKitchenMenusCapabilityView',
      '<WorkspaceKitchenMenusDiscovery',
    ],
  },
]
const WORKSPACE_CRUD_SURFACES = [
  'packages/core/fireux-core/src/runtime/components/Workspace/Crud.vue',
  'packages/core/fireux-core/src/runtime/components/Workspace/Team/Crud.vue',
  'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud.vue',
]
const WORKSPACE_CRUD_CREATE_SURFACES = [
  [
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Index.vue',
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Crud/Create.vue',
    '<WorkspaceProjectCrudCreate',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Crud/Create.vue',
    '<WorkspaceKitchenCrudCreate',
  ],
  [
    'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Index.vue',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Crud/Create.vue',
    '<WorkspaceSupplierCrudCreate',
  ],
  [
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Crud.vue',
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Crud/Create.vue',
    '<WorkspaceProjectTeamCrudCreate',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Crud.vue',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Crud/Create.vue',
    '<WorkspaceKitchenTeamCrudCreate',
  ],
  [
    'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud.vue',
    'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud/Create.vue',
    '<WorkspaceTestCrudCreate',
  ],
]
const PROJECT_TEST_READ_MODAL =
  'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud/Read.vue'
const PROJECT_TEST_DETAIL_PAGE =
  'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/test/[testId].vue'
const WORKSPACE_CRUD_PRIMITIVE =
  'packages/core/fireux-core/src/runtime/components/Workspace/CrudToolbar.vue'
const WORKSPACE_CRUD_OPERATIONS = [
  ['create', 'WorkspaceCrudCreate'],
  ['read', 'WorkspaceCrudRead'],
  ['update', 'WorkspaceCrudUpdate'],
  ['delete', 'WorkspaceCrudDelete'],
]
const CONSOLE_OPERATION_CONTRACTS = {
  project: {
    catalogue: 'projects/fireux/fireux-app/app/meta.ts',
    operations: ['apps', 'ecosystem'],
    routeRoot:
      'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project',
  },
  kitchen: {
    catalogue:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capabilities.ts',
    operations: [
      'menus',
      'dishes',
      'drinks',
      'recipes',
      'ingredients',
      'food-safety',
      'orders',
      'inventory',
      'purchasing',
      'receiving',
      'waste',
      'stations',
      'suppliers',
      'finance',
      'costs',
      'waste-report',
      'performance',
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
const KITCHEN_TOOL_BACKED_CAPABILITIES = new Set([
  'dishes',
  'drinks',
  'ingredients',
  'menus',
  'orders',
  'recipes',
  'stations',
  'suppliers',
  'finance',
])

const CONSOLE_AI_CONTRACTS = [
  {
    family: 'project',
    definition:
      'packages/core/fireux-core/src/runtime/project/models/agent-capabilities.ts',
    registration:
      'packages/ecosystem/fireux-fireux/src/runtime/ai/workspace-agents.ts',
  },
  {
    family: 'kitchen',
    definition:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capability-agents.ts',
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
  validateMiseboxWorkspaceDoorway(repoRoot, violations)
  validateMiseboxKitchenEntryOwnership(repoRoot, violations)
  validateWorkspaceNavigationLifecycle(repoRoot, violations)
  validateWorkspaceOperationAIPlaceholder(repoRoot, violations)
  validateWorkspaceEntityComponentHierarchy(repoRoot, violations)
  validateWorkspaceFamilyPageAnatomy(repoRoot, violations)
  validateWorkspaceMenuCanon(repoRoot, violations)
  validateWorkspaceOperationContracts(repoRoot, violations)
  validateWorkspaceAIContracts(repoRoot, violations)
  validateKitchenResearchRecords(repoRoot, violations)
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
        '- Workspace pages compose UDashboardPanel with either their named Workspace Nav and direct children, or LayoutsWorkspaceNavbar plus explicit header and body slots.',
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

function validateWorkspaceFamilyPageAnatomy(repoRoot, violations) {
  for (const contract of WORKSPACE_FAMILY_PAGE_ANATOMY) {
    const source = readFileSync(path.join(repoRoot, contract.page), 'utf8')
    let previousIndex = -1

    if (
      contract.page.startsWith('packages/') &&
      /from ['"]~\/meta['"]/.test(source)
    ) {
      violations.push(
        `${contract.page} (${contract.label} package page must read consuming App identity through runtime config, not ~/meta)`
      )
    }

    for (const marker of contract.markers) {
      const markerIndex = source.indexOf(marker, previousIndex + 1)
      if (markerIndex < 0) {
        violations.push(
          source.includes(marker)
            ? `${contract.page} (${contract.label} Workspace anatomy is out of order at ${marker})`
            : `${contract.page} (${contract.label} must compose ${marker})`
        )
        continue
      }
      previousIndex = markerIndex
    }
  }

  const pageStateContracts = [
    {
      label: 'project.team',
      source:
        'packages/core/fireux-core/src/runtime/project/composables/workspace/team/useProjectWorkspaceTeam.ts',
      keys: ['project', 'team', 'derived'],
    },
    {
      label: 'project.tests',
      source:
        'packages/ecosystem/fireux-fireux/src/runtime/project/composables/workspace/test/useProjectWorkspaceTest.ts',
      keys: ['tests', 'derived'],
    },
    {
      label: 'kitchen.tests',
      source:
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/test/useKitchenWorkspaceTest.ts',
      keys: ['tests', 'derived'],
    },
    {
      label: 'kitchen.team',
      source:
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenWorkspaceTeam.ts',
      keys: ['kitchen', 'team', 'derived'],
    },
  ]
  for (const contract of pageStateContracts) {
    const source = readFileSync(path.join(repoRoot, contract.source), 'utf8')
    const stateOwner = contract.label.endsWith('.tests')
      ? 'test.state'
      : 'state'
    const derivedOwner = contract.label.endsWith('.tests')
      ? 'test.derived'
      : 'derived'
    if (
      !source.includes('useWorkspacePageState(') ||
      !source.includes('pageState.publish({') ||
      contract.keys.some(
        (key) =>
          !source.includes(`${key}: ${stateOwner}.value.${key}`) &&
          key !== 'derived'
      ) ||
      !source.includes(`derived: ${derivedOwner}.value`) ||
      !source.includes('status')
    ) {
      violations.push(
        `${contract.source} (${contract.label} must publish only its accepted page-facing state)`
      )
    }
  }

  const capabilityContextOwners = [
    ...pageStateContracts
      .filter((contract) => !contract.label.endsWith('.tests'))
      .map((contract) => contract.source),
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useTest.ts',
  ]
  for (const sourcePath of capabilityContextOwners) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (
      !source.includes('defineWorkspaceCapabilityContext') ||
      !source.includes('capability:') ||
      !source.includes('primitives:') ||
      !source.includes('create:') ||
      !source.includes('available:') ||
      !source.includes('limit') ||
      !source.includes('natives:')
    ) {
      violations.push(
        `${sourcePath} (main page composable must own its primitive and native capability context)`
      )
    }
  }

  const capabilityContextConsumers = [
    'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Index.vue',
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Crud.vue',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Crud.vue',
    'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud.vue',
  ]
  for (const sourcePath of capabilityContextConsumers) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (!source.includes('derived.capability.availableActions')) {
      violations.push(
        `${sourcePath} (CRUD must consume the main composable capability context)`
      )
    }
  }

  const capabilityInfoPath =
    'packages/core/fireux-core/src/runtime/components/Workspace/CapabilityInfo.vue'
  const capabilityInfo = readFileSync(
    path.join(repoRoot, capabilityInfoPath),
    'utf8'
  )
  if (
    !capabilityInfo.includes('useWorkspacePageState') ||
    !capabilityInfo.includes('capability.value') ||
    !capabilityInfo.includes('Capability natives')
  ) {
    violations.push(
      `${capabilityInfoPath} (navbar Info must present the current page capability context)`
    )
  }
  for (const sourcePath of [
    'packages/core/fireux-core/src/runtime/components/layouts/workspace/Navbar.vue',
    'projects/fireux/fireux-app/app/components/Workspace/Project/Info.vue',
    'projects/misebox/misebox-app/app/components/Workspace/Kitchen/Info.vue',
  ]) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (!source.includes('<WorkspaceCapabilityInfo')) {
      violations.push(
        `${sourcePath} (Workspace Info must include current-page capability context)`
      )
    }
  }

  const primitive = readFileSync(
    path.join(repoRoot, WORKSPACE_CRUD_PRIMITIVE),
    'utf8'
  )

  const readPrimitiveContracts = [
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Index.vue',
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Crud/Read.vue',
      'WorkspaceProjectCrudRead',
      '/workspace/project/',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Crud/Read.vue',
      'WorkspaceKitchenCrudRead',
      '/workspace/kitchen/',
    ],
    [
      'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Index.vue',
      'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Crud/Read.vue',
      'WorkspaceSupplierCrudRead',
      '/suppliers/',
      false,
    ],
    [
      'packages/core/fireux-core/src/runtime/components/Workspace/Team/Crud.vue',
      'packages/core/fireux-core/src/runtime/components/Workspace/Team/Crud/Read.vue',
      'WorkspaceTeamCrudRead',
      'routeBase',
    ],
    [
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud.vue',
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud/Read.vue',
      'WorkspaceTestCrudRead',
      'routeBase',
    ],
  ]

  const workspaceTeamCore = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useTeam.ts'
    ),
    'utf8'
  )
  for (const field of ['id', 'userId', 'name', 'avatar', 'role', 'status']) {
    if (!workspaceTeamCore.includes(`${field}:`)) {
      violations.push(
        `useTeam.ts (Core Workspace Team member contract must own ${field})`
      )
    }
  }
  for (const accessConcern of [
    'useWorkspaceAccess',
    'targetTeamIds',
    'targetOperatorIds',
    'targetAccessIds',
  ]) {
    if (workspaceTeamCore.includes(accessConcern)) {
      violations.push(
        `useTeam.ts (Core Team selection and capacity must not absorb workspace access concern ${accessConcern})`
      )
    }
  }

  for (const teamDataPath of CONSOLE_TEAM_COMPOSABLES.slice(0, 2)) {
    const teamData = readFileSync(path.join(repoRoot, teamDataPath), 'utf8')
    if (
      teamData.includes('provide(') ||
      teamData.includes('inject(') ||
      teamDataPath.includes('Context')
    ) {
      violations.push(
        `${teamDataPath} (Team readers must remain explicit data sources, not a named provide/inject Context layer)`
      )
    }
  }

  for (const liveProofPath of [
    'packages/core/fireux-core/src/runtime/project/composables/workspace/index/useProjectWorkspaceIndex.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex.ts',
    'packages/ecosystem/fireux-fireux/src/runtime/project/composables/workspace/test/useProjectWorkspaceTest.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/test/useKitchenWorkspaceTest.ts',
    'packages/core/fireux-core/src/runtime/project/composables/workspace/team/useProjectWorkspaceTeam.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/team/useKitchenWorkspaceTeam.ts',
  ]) {
    const liveProof = readFileSync(path.join(repoRoot, liveProofPath), 'utf8')
    if (/\brefresh\b/.test(liveProof)) {
      violations.push(
        `${liveProofPath} (Landing, Test, and Team capability controllers must not use refresh to imitate live state)`
      )
    }
  }

  for (const [teamPagePath, requiredConsumers] of [
    [
      'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/team/index.vue',
      [
        'WorkspaceProjectTeamSelector',
        'WorkspaceProjectTeamAI',
        'WorkspaceProjectTeam',
      ],
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/index.vue',
      [
        'WorkspaceKitchenTeamSelector',
        'WorkspaceKitchenTeamAI',
        'WorkspaceKitchenTeam',
        'WorkspaceKitchenTeamTools',
      ],
    ],
  ]) {
    const teamPage = readFileSync(path.join(repoRoot, teamPagePath), 'utf8')
    for (const consumer of requiredConsumers) {
      if (!new RegExp(`<${consumer}\\b[^>]*:team="team"`).test(teamPage)) {
        violations.push(
          `${teamPagePath} (${consumer} must receive the cohesive Team controller instead of parallel state and command props)`
        )
      }
    }
  }
  for (const [
    crudPath,
    readPath,
    modal,
    route,
    collection = true,
  ] of readPrimitiveContracts) {
    const crud = readFileSync(path.join(repoRoot, crudPath), 'utf8')
    const read = readFileSync(path.join(repoRoot, readPath), 'utf8')
    const opensRead =
      crud.includes('@read="readOpen = true"') ||
      (crud.includes('<template #read="{ open, setOpen }">') &&
        crud.includes('@update:open="setOpen"'))
    if (
      !opensRead ||
      !crud.includes(`<${modal}`) ||
      !read.includes('<UModal') ||
      (collection
        ? !read.includes('v-for=')
        : !read.includes('state.supplier.id')) ||
      !read.includes(route)
    ) {
      violations.push(
        `${crudPath} (Read must open its collection modal and each record must link to an individual detail route)`
      )
    }
  }

  for (const [adapter, routeBase] of [
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Crud.vue',
      '/workspace/project/team',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Crud.vue',
      '/workspace/kitchen/team',
    ],
  ]) {
    const source = readFileSync(path.join(repoRoot, adapter), 'utf8')
    if (
      !source.includes('<WorkspaceTeamCrud') ||
      !source.includes(`route-base="${routeBase}"`)
    ) {
      violations.push(
        `${adapter} (Team CRUD adapters must use the Core interaction with their domain detail route)`
      )
    }
  }

  const readDetailPages = [
    'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/[projectId].vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/[kitchenId].vue',
    'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/team/[memberId].vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/[memberId].vue',
    'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/test/[testId].vue',
  ]
  for (const detailPage of readDetailPages) {
    if (!existsSync(path.join(repoRoot, detailPage))) {
      violations.push(
        `${detailPage} (Read primitive record detail route missing)`
      )
    }
  }

  let previousOperation = -1
  for (const [operation, component] of WORKSPACE_CRUD_OPERATIONS) {
    const operationPath = `packages/core/fireux-core/src/runtime/components/Workspace/Crud/${operation[0].toUpperCase()}${operation.slice(1)}.vue`
    const operationSource = readFileSync(
      path.join(repoRoot, operationPath),
      'utf8'
    )
    if (
      !operationSource.includes(
        `label="${operation[0].toUpperCase()}${operation.slice(1)}"`
      )
    ) {
      violations.push(
        `${operationPath} (CRUD operation must own its ${operation} presentation)`
      )
    }
    const operationIndex = primitive.indexOf(
      `<${component}`,
      previousOperation + 1
    )
    if (operationIndex < 0) {
      violations.push(
        `${WORKSPACE_CRUD_PRIMITIVE} (must compose ${component} in canonical order)`
      )
      continue
    }
    previousOperation = operationIndex
  }

  for (const surface of WORKSPACE_CRUD_SURFACES) {
    const source = readFileSync(path.join(repoRoot, surface), 'utf8')
    if (!source.includes('<WorkspaceCrudToolbar')) {
      violations.push(
        `${surface} (Workspace CRUD surface must compose WorkspaceCrudToolbar)`
      )
    }
  }

  for (const [crudPath, createPath, marker] of WORKSPACE_CRUD_CREATE_SURFACES) {
    const crudSource = readFileSync(path.join(repoRoot, crudPath), 'utf8')
    const createSource = readFileSync(path.join(repoRoot, createPath), 'utf8')
    const opensCreate =
      (crudSource.includes('<template #create="{ open, setOpen }">') &&
        crudSource.includes('@update:open="setOpen"')) ||
      ((crudSource.includes('@create="createOpen = true"') ||
        (crudSource.includes('@create="openCreate"') &&
          crudSource.includes('createOpen.value = true'))) &&
        crudSource.includes('v-model:open="createOpen"'))
    if (
      !opensCreate ||
      !crudSource.includes(marker) ||
      !createSource.includes('<UModal') ||
      !createSource.includes("emit('update:open'")
    ) {
      violations.push(
        `${crudPath} (enabled Create must use a guarded CRUD controller and domain-owned ${createPath} modal)`
      )
    }
  }

  const projectTestCrud = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Crud.vue'
    ),
    'utf8'
  )
  const projectTestRead = readFileSync(
    path.join(repoRoot, PROJECT_TEST_READ_MODAL),
    'utf8'
  )
  const projectTestDetail = readFileSync(
    path.join(repoRoot, PROJECT_TEST_DETAIL_PAGE),
    'utf8'
  )
  const projectTestComposable = readFileSync(
    path.join(
      repoRoot,
      'packages/ecosystem/fireux-fireux/src/runtime/project/composables/workspace/test/useProjectWorkspaceTest.ts'
    ),
    'utf8'
  )
  const workspaceTestComposable = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useTest.ts'
    ),
    'utf8'
  )
  if (
    !workspaceTestComposable.includes('selectedTestId') ||
    workspaceTestComposable.includes('selectedIndex') ||
    !workspaceTestComposable.includes('TestPacket') ||
    !workspaceTestComposable.includes('value: string')
  ) {
    violations.push(
      'useTest.ts must own the minimal { id, value } packet and stable-id selection'
    )
  }
  if (
    !projectTestCrud.includes('@read="readOpen = true"') ||
    !projectTestCrud.includes('<WorkspaceTestCrudRead') ||
    !projectTestRead.includes('<UModal') ||
    !projectTestRead.includes('props.natives.select(id)') ||
    !projectTestDetail.includes('<WorkspaceTestDetail')
  ) {
    violations.push(
      'Project Test Read must select from its list modal without remounting the page'
    )
  }

  const kitchenTestPage = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/test/index.vue'
    ),
    'utf8'
  )
  const kitchenTestComposable = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/test/useKitchenWorkspaceTest.ts'
    ),
    'utf8'
  )
  if (
    !kitchenTestPage.includes('<WorkspaceTestSelector') ||
    !kitchenTestPage.includes('<WorkspaceTestAI') ||
    !kitchenTestPage.includes('<WorkspaceTest\n') ||
    !projectTestComposable.includes('useTest({') ||
    !kitchenTestComposable.includes('useTest({') ||
    projectTestComposable.includes('defineWorkspaceCapabilityContext') ||
    kitchenTestComposable.includes('defineWorkspaceCapabilityContext')
  ) {
    violations.push(
      'Project and Kitchen Test must consume the Core WorkspaceTest presentation without prescribing their reader implementation'
    )
  }

  const indexContracts = [
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Index.vue',
      '<WorkspaceCrud',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Index.vue',
      '<WorkspaceCrud',
    ],
    [
      'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Index.vue',
      '<WorkspaceCrud',
    ],
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Selector.vue',
      '<WorkspaceProjectSelectorChoices',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Selector.vue',
      '<WorkspaceKitchenSelectorChoices',
    ],
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Index.vue',
      '<WorkspaceProjectTeamCrud',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Index.vue',
      '<WorkspaceKitchenTeamCrud',
    ],
    [
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Index.vue',
      '<WorkspaceTestCrud',
    ],
  ]

  for (const pagePath of [
    'projects/fireux/fireux-app/app/pages/index.vue',
    MISEBOX_MAIN_PAGE,
  ]) {
    const page = readFileSync(path.join(repoRoot, pagePath), 'utf8')
    if (page.includes(':actions="actions"') || /\brefresh\b/.test(page)) {
      violations.push(
        `${pagePath} (deployed Workspace landing must consume the canonical Workspace components without a refresh escape hatch)`
      )
    }
  }
  for (const [sourcePath, marker] of indexContracts) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (!source.includes(marker)) {
      violations.push(`${sourcePath} (must compose ${marker})`)
    }
  }

  const emptyStateContracts = [
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Selector.vue',
      'title="No Kitchens yet"',
    ],
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Index.vue',
      'title="No team members yet"',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Index.vue',
      'title="No team members yet"',
    ],
    [
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Index.vue',
      'title="No Tests yet"',
    ],
  ]
  for (const [sourcePath, marker] of emptyStateContracts) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (!source.includes('<UAlert') || !source.includes(marker)) {
      violations.push(
        `${sourcePath} (collection-owning surface must present its factual domain empty state)`
      )
    }
  }

  const selectorPlusContracts = [
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Selector.vue',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Selector.vue',
  ]
  for (const sourcePath of selectorPlusContracts) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (!source.includes('icon="i-lucide-plus"')) {
      violations.push(
        `${sourcePath} (selector must expose direct Workspace creation)`
      )
    }
  }

  const projectTestSelector = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/components/Workspace/Test/Selector.vue'
    ),
    'utf8'
  )
  if (
    !projectTestSelector.includes(
      'v-if="derived.capability.primitives.create.available"'
    ) ||
    !projectTestSelector.includes('icon="i-lucide-plus"') ||
    !projectTestSelector.includes('<WorkspaceTestCrudCreate')
  ) {
    violations.push(
      'Project Test selector plus must require Test subscription capacity and open its domain Create modal'
    )
  }

  const teamSelectorPlusContracts = [
    [
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Team/Selector.vue',
      'derived.capability.primitives.create.available',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Team/Selector.vue',
      'derived.capability.primitives.create.available',
    ],
  ]
  for (const [sourcePath, condition] of teamSelectorPlusContracts) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    if (
      !source.includes(`:can-create="${condition}"`) ||
      !source.includes('<WorkspaceTeamSelector')
    ) {
      violations.push(
        `${sourcePath} (Team selector plus must follow Team subscription capacity)`
      )
    }
  }
  const sharedTeamSelector = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/components/Workspace/Team/Selector.vue'
    ),
    'utf8'
  )
  if (
    !sharedTeamSelector.includes('v-if="canCreate"') ||
    !sharedTeamSelector.includes('icon="i-lucide-plus"')
  ) {
    violations.push(
      'Workspace/Team/Selector.vue (shared Team selector must render its capacity-gated Create control)'
    )
  }
}

function validateMiseboxWorkspaceDoorway(repoRoot, violations) {
  const fullPath = path.join(repoRoot, MISEBOX_DASHBOARD_WORKSPACE)
  if (!existsSync(fullPath)) {
    violations.push(
      `${MISEBOX_DASHBOARD_WORKSPACE} (missing Misebox Kitchen Workspace doorway)`
    )
    return
  }

  const source = readFileSync(fullPath, 'utf8')
  if (
    !source.includes("key: 'dashboard-workspace'") ||
    !source.includes("await navigateTo('/', { replace: true })")
  ) {
    violations.push(
      `${MISEBOX_DASHBOARD_WORKSPACE} (Dashboard Workspace must enter the Misebox Kitchen Workspace at /)`
    )
  }
}

function validateMiseboxKitchenEntryOwnership(repoRoot, violations) {
  const mainPage = readFileSync(path.join(repoRoot, MISEBOX_MAIN_PAGE), 'utf8')
  const tenantPage = readFileSync(
    path.join(repoRoot, MISEBOX_TENANT_KITCHEN_PAGE),
    'utf8'
  )
  const pagesConfig = readFileSync(
    path.join(repoRoot, MISEBOX_PAGES_CONFIG),
    'utf8'
  )
  const componentsConfig = readFileSync(
    path.join(repoRoot, MISEBOX_COMPONENTS_CONFIG),
    'utf8'
  )
  const miseboxModule = readFileSync(
    path.join(repoRoot, MISEBOX_MODULE),
    'utf8'
  )

  if (existsSync(path.join(repoRoot, RETIRED_KITCHEN_WORKSPACE_TOOLS))) {
    violations.push(
      `${RETIRED_KITCHEN_WORKSPACE_TOOLS} (retired component collides with the App-owned WorkspaceKitchenTools presentation surface)`
    )
  }

  if (
    !mainPage.includes('<WorkspaceHero') ||
    !mainPage.includes(':title="intro.title"') ||
    !/<WorkspaceKitchen\b/.test(mainPage)
  ) {
    violations.push(
      `${MISEBOX_MAIN_PAGE} (Misebox / must directly compose the Kitchen Hero and Workspace)`
    )
  }

  if (
    !tenantPage.includes('<WorkspaceKitchenNav') ||
    !tenantPage.includes('<WorkspaceKitchenSelector') ||
    !tenantPage.includes('<WorkspaceHero') ||
    !tenantPage.includes('title="Build your Kitchen Workspace"') ||
    !/<WorkspaceKitchen\b/.test(tenantPage) ||
    !tenantPage.includes('<WorkspaceKitchenCapabilities />') ||
    !tenantPage.includes('<WorkspaceKitchenDiscovery />') ||
    !tenantPage.includes('requiresAuth: true') ||
    tenantPage.includes("workspaceAccess: 'public-entry'")
  ) {
    violations.push(
      `${MISEBOX_TENANT_KITCHEN_PAGE} (tenant Kitchen route must retain the canonical simple Kitchen landing anatomy behind authenticated access)`
    )
  }

  if (
    !pagesConfig.includes("workspaces.includes('kitchen')") ||
    !miseboxModule.includes("await installModule('fireux-kitchens')") ||
    miseboxModule.includes('configureServer') ||
    !miseboxModule.includes(
      'if (hasKitchenWorkspace) configurePlugins(resolver)'
    )
  ) {
    violations.push(
      `${MISEBOX_PAGES_CONFIG} (Misebox must mount the Kitchen runtime layer only from the declared Kitchen Workspace, without parallel server registration)`
    )
  }

  if (componentsConfig.includes('#fireux-misebox-components')) {
    violations.push(
      `${MISEBOX_COMPONENTS_CONFIG} (unused ecosystem component aliases are forbidden)`
    )
  }
}

function validateKitchenResearchRecords(repoRoot, violations) {
  const capabilities = [
    ...CONSOLE_OPERATION_CONTRACTS.kitchen.operations,
    'identity',
    'team',
  ]

  for (const capability of capabilities) {
    const modelName = capability === 'finance' ? 'sales' : capability
    const relative = `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/${modelName}-search-demand.ts`
    const fullPath = path.join(repoRoot, relative)
    if (!existsSync(fullPath)) {
      violations.push(
        `${relative} (missing Kitchen capability research source)`
      )
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    if (!/\n\s*records\s*:\s*\[/.test(source)) {
      violations.push(`${relative} (missing capability-owned record map)`)
      continue
    }

    const toolStart = Math.max(
      source.indexOf('toolHypotheses:'),
      source.indexOf('proposedTools:')
    )
    const toolEnd = source.indexOf('aiContract:', toolStart)
    if (toolStart < 0 || toolEnd < 0) continue

    const toolBlock = source.slice(toolStart, toolEnd)
    const toolIds = new Set(
      [...toolBlock.matchAll(/id:\s*'(kitchen\.[^']+)'/g)].map(
        (match) => match[1]
      )
    )
    for (const toolId of toolIds) {
      if (source.split(toolId).length - 1 < 2) {
        violations.push(
          `${relative} (${toolId} is not linked from its record map)`
        )
      }
    }
  }
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
    const mainComponent = 'Index.vue'
    if (!existsSync(path.join(repoRoot, root, mainComponent))) {
      violations.push(
        `${root}/${mainComponent} (the Workspace Entity Main capability must use its visible product name)`
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
    /useKitchenWorkspace(?:Menus|Ingredients|Dishes|Recipes|Suppliers|Stations|Orders|Tables)/.test(
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
        if (operation === 'waste') {
          const devPath = path.join(repoRoot, KITCHEN_WASTE_DEV)
          const devSource = existsSync(devPath)
            ? readFileSync(devPath, 'utf8')
            : ''
          if (
            !routeSource.includes('<WorkspaceKitchenWasteDev') ||
            !devSource.includes('wasteAIContext.devContext')
          ) {
            violations.push(
              `${contract.routeRoot}/${operation} (Waste research clues must remain in the named development context until the capability is built)`
            )
          }
          continue
        }
        const operationSource = routeSource
        const isDishCatalogue = ['dishes', 'drinks'].includes(operation)
        const isAlignedCapability = isDishCatalogue || operation === 'menus'
        const alignedFamily = operation === 'menus' ? 'Menus' : 'Dishes'
        const guidingLiteratureMarker = isAlignedCapability
          ? new RegExp(`<WorkspaceKitchen${alignedFamily}Discovery\\s*/>`)
          : new RegExp(
              `<WorkspaceKitchenCapabilityGuidingLiterature\\s+capability="${operation}"\\s*/>`
            )
        if (!guidingLiteratureMarker.test(operationSource)) {
          violations.push(
            `${contract.routeRoot}/${operation} (Kitchen Workspace capability must render its catalogue-backed guiding literature)`
          )
        }
        const viewMarker = isAlignedCapability
          ? `<WorkspaceKitchen${alignedFamily}CapabilityView`
          : `<WorkspaceKitchenCapabilityView capability="${operation}"`
        const viewIndex = operationSource.indexOf(viewMarker)
        if (viewIndex < 0) {
          violations.push(
            `${contract.routeRoot}/${operation} (Kitchen Workspace capability must expose its catalogue-backed View)`
          )
        } else if (KITCHEN_TOOL_BACKED_CAPABILITIES.has(operation)) {
          const toolsMarker = isAlignedCapability
            ? `<WorkspaceKitchen${alignedFamily}Tools`
            : `<WorkspaceKitchenCapabilityTools capability="${operation}"`
          const aiMarker = '<WorkspaceKitchenCapabilityAI'
          const toolsIndex = operationSource.indexOf(toolsMarker)
          const aiIndex = operationSource.indexOf(aiMarker)
          const aiCloseIndex = operationSource.indexOf('>', aiIndex)
          const aiOperationIndex = operationSource.indexOf(
            `capability="${operation}"`,
            aiIndex
          )
          const orderIsValid = isAlignedCapability
            ? aiIndex >= 0 && toolsIndex > aiIndex && viewIndex > toolsIndex
            : toolsIndex >= 0 && aiIndex > toolsIndex && viewIndex > aiIndex
          if (
            !orderIsValid ||
            aiOperationIndex < aiIndex ||
            aiOperationIndex > aiCloseIndex
          ) {
            violations.push(
              `${contract.routeRoot}/${operation} (tool-backed Kitchen capabilities must compose Tools, AI, then View)`
            )
          }
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
      const searchHeadlines =
        catalogue.match(/\bheadline:\s*['"][^'"]+['"]/g) || []
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
        !publicOperationPage.includes('AppOperationGuidingLiterature') ||
        !publicOperationPage.includes('operation.headline || operation.title')
      ) {
        violations.push(
          'Core public Operation pages must render the search-language headline and shared guiding literature component.'
        )
      }
      const capabilityCatalogue = readFileSync(
        path.join(
          repoRoot,
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capability-tools.ts'
        ),
        'utf8'
      )
      for (const operation of contract.operations.filter((operation) =>
        KITCHEN_TOOL_BACKED_CAPABILITIES.has(operation)
      )) {
        if (
          !capabilityCatalogue.includes(`  ${operation}: [`) &&
          !capabilityCatalogue.includes(`  ${operation}: researchTools(`)
        ) {
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
  const workspaceNavbar = readFileSync(
    path.join(repoRoot, CONSOLE_NAVBAR),
    'utf8'
  )
  for (const relative of [PROJECT_WORKSPACE, KITCHEN_WORKSPACE]) {
    const source = readFileSync(path.join(repoRoot, relative), 'utf8')
    const workspaceSource = source.slice(source.lastIndexOf('return {'))
    const requiredFields = [
      'data',
      'id',
      'outcome',
      'crud',
      'create',
      'update',
      'delete',
    ]
    for (const field of requiredFields) {
      if (!new RegExp(`\\b${field}\\s*[:,}]`).test(workspaceSource)) {
        violations.push(
          `${relative} (useXWorkspace must return the shared ${field.replace(/[:,]/g, '')} field)`
        )
      }
    }
    for (const branch of ['targets:', 'selection:', 'runtime:', 'actions:']) {
      if (workspaceSource.includes(branch)) {
        violations.push(
          `${relative} (useXWorkspace must not return legacy ${branch.slice(0, -1)} branch)`
        )
      }
    }
  }
  if (
    !layout.includes('LayoutsSharedNotificationsSlideover') ||
    !layout.includes('useWorkspaceNotifications') ||
    !navbar.includes('openNotifications()')
  ) {
    violations.push(
      'Core Workspace shell must provide the baked-in Notifications capability.'
    )
  }
  if (
    !navbar.includes('showNotifications') ||
    !workspaceNavbar.includes('show-notifications') ||
    !workspaceNavbar.includes('v-if="calendarTo"')
  ) {
    violations.push(
      'Workspace Calendar and Notifications must remain visible through the shared Workspace navbar.'
    )
  }
  if (
    !workspaceNavbar.includes('aria-label="Copy page JSON"') ||
    !workspaceNavbar.includes(':disabled="!pageState"') ||
    !workspaceNavbar.includes('state: pageState.value')
  ) {
    violations.push(
      'Workspace header must copy the bounded page state JSON contract.'
    )
  }
}

function validateWorkspaceAIContracts(repoRoot, violations) {
  const presentationContracts = [
    {
      file: 'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/AI/Assistant.vue',
      expected: ['<WorkspaceAI', '<WorkspaceAIIntro'],
    },
    {
      file: 'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/AI/Composer.vue',
      expected: ['<WorkspaceAIComposer'],
    },
    {
      file: 'packages/core/fireux-core/src/runtime/components/Workspace/Test/AI.vue',
      expected: ['<WorkspaceAI', '<WorkspaceAIComposer'],
    },
    {
      file: 'packages/ecosystem/fireux-fireux/src/runtime/components/workspace/Project/Team/AI.vue',
      expected: ['<WorkspaceProjectIntent'],
    },
    {
      file: 'packages/ecosystem/fireux-fireux/src/runtime/components/workspace/Project/Intent.vue',
      expected: ['<WorkspaceAI', '<WorkspaceAIComposer'],
    },
  ]

  for (const contract of presentationContracts) {
    const source = readFileSync(path.join(repoRoot, contract.file), 'utf8')
    if (contract.expected.some((expected) => !source.includes(expected))) {
      violations.push(
        `${contract.file} (Workspace AI families must compose the Core-owned presentation anatomy)`
      )
    }
  }

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
      required: /\buseKitchenRecipesWorkspace\s*\(/,
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

  const route =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/recipes/index.vue'
  const routeSource = readFileSync(path.join(repoRoot, route), 'utf8')
  if (
    !/\bprovideKitchenRecipesWorkspace\s*\(/.test(routeSource) ||
    /\buseKitchenWorkspaceRecipes\s*\(/.test(routeSource)
  ) {
    violations.push(
      `${route} (must provide the route-owned Kitchen Recipes workspace once)`
    )
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
  for (const expected of ['error = recipesError', 'outcome = recipesOutcome']) {
    if (!controllerSource.includes(expected)) {
      violations.push(
        `${KITCHEN_RECIPES_CONTROLLER} (must preserve authoritative Recipes outcomes)`
      )
    }
  }
}

function validateKitchenMenusWorkspace(repoRoot, violations) {
  const files = {
    Index: {
      required: /\buseKitchenMenusWorkspace\s*\(/,
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

  const route =
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menus/index.vue'
  const routeSource = readFileSync(path.join(repoRoot, route), 'utf8')
  if (
    !/\bprovideKitchenMenusWorkspace\s*\(/.test(routeSource) ||
    /\buseKitchenWorkspaceMenus\s*\(/.test(routeSource)
  ) {
    violations.push(
      `${route} (must provide the route-owned Kitchen Menus workspace once)`
    )
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
    /<NuxtErrorBoundary\b/.test(source) &&
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
  if (
    /useWorkspaceRouteTargetAccess|selectionAccessPending|selectionBlocked/.test(
      source
    )
  ) {
    violations.push(
      `${CONSOLE_LAYOUT} (the shared layout must remain ignorant of domain Entity selection and access)`
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
    validateKitchenResearchPageFamily(relative, template, violations)

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

function validateKitchenResearchPageFamily(relative, template, violations) {
  const match = relative.match(
    /packages\/extensions\/fireux-kitchens\/src\/runtime\/pages\/workspace\/kitchen\/([^/]+)\/search-demand\/(index|analysis|tools)\.vue$/
  )
  if (!match) return

  const [, capability, stage] = match
  if (capability === 'calendar' || capability === 'overview') return
  if (capability === 'team' && stage === 'tools') return

  const component =
    stage === 'index'
      ? 'WorkspaceKitchenResearchEvidence'
      : stage === 'analysis'
        ? 'WorkspaceKitchenResearchAnalysis'
        : 'WorkspaceKitchenResearchToolSpecifications'

  if (!new RegExp(`<${component}\\b`).test(template)) {
    violations.push(
      `${relative} (ordinary Kitchen research stages must use ${component})`
    )
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
  const usesWorkspaceNav = /<Workspace(?:Project|Kitchen)Nav\b/.test(template)
  const requiredTemplateParts = usesWorkspaceNav
    ? [
        ['UDashboardPanel', /<UDashboardPanel\b/],
        ['Workspace Nav', /<Workspace(?:Project|Kitchen)Nav\b/],
      ]
    : [
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
    (/<Workspace(?:Project|Kitchen)Nav\b/.test(template) ||
      (/<template\s+#header\b/.test(template) &&
        /<LayoutsWorkspaceNavbar\b/.test(template) &&
        /<template\s+#body\b/.test(template)))
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
