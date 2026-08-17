// @fireux-script
// last_used: 2026-07-25
// usage_note: keeps console page composition explicit and surface metadata valid.
// FILE: scripts/guards/console-pages.mjs
// Concurrent edit — 2026-07-20 16:21 CEST — Console Spine project cleanup: remove the retired app redirect exception.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: enforce route-level access and selection metadata.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const PAGE_MARKER = '/pages/console/'
const CONSOLE_LAYOUT =
  'packages/core/fireux-core/src/runtime/layouts/console.vue'
const CONSOLE_MIDDLEWARE =
  'packages/core/fireux-core/src/runtime/middleware/fireux-console.global.ts'
const CONSOLE_ROUTING =
  'packages/core/fireux-core/src/runtime/composables/fireux/app/routing/consoleRoutes.ts'
const CONSOLE_NAV =
  'packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/useConsoleNav.ts'
const CONSOLE_AGENT_PAGE =
  'packages/ecosystem/fireux-misebox/src/runtime/pages/console/agent.vue'
const ROUTE_AUTH_GUARD =
  'packages/core/fireux-core/src/runtime/utils/routeAuthGuard.ts'
const KITCHEN_MENUS_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Menus'
const KITCHEN_RECIPES_COMPONENT_ROOT =
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Recipes'
const KITCHEN_RECIPES_FETCH =
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/recipe/fetch/useKitchenRecipeCollection.ts'
const KITCHEN_RECIPES_CONTROLLER =
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/operations/Recipes/useKitchenConsoleRecipes.ts'
const STANDARD_SURFACES = new Set([
  'browse',
  'detail',
  'create',
  'edit',
  'workflow',
  'live',
])
const NON_DIRECT_PAGES = new Map([
  ['packages/core/fireux-core/src/runtime/pages/console/index.vue', 'redirect'],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/identity.vue',
    'router',
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue',
    'live',
  ],
])
const ROUTE_ONLY_META_KEYS = [
  'requiresAuth',
  'requiresSelection',
  'roles',
  'visibility',
]
const CONSOLE_OPERATION_CONTRACTS = {
  project: {
    catalogue: 'projects/fireux/fireux-app/app/meta.ts',
    operations: ['identity', 'apps', 'ecosystem'],
    routeRoot: 'projects/fireux/fireux-app/app/pages/console/project',
  },
  kitchen: {
    catalogue:
      'packages/extensions/fireux-kitchens/src/runtime/content/operations.ts',
    operations: [
      'identity',
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'recipes',
      'stations',
      'team',
      'suppliers',
      'tables',
      'finance',
    ],
    routeRoot:
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen',
  },
  supplier: {
    catalogue:
      'packages/extensions/fireux-suppliers/src/runtime/content/operations.ts',
    operations: ['identity', 'catalogue', 'ingredients', 'items', 'team'],
    routeRoot:
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier',
  },
  portfolio: {
    catalogue:
      'packages/extensions/fireux-properties/src/runtime/content/operations.ts',
    operations: [
      'identity',
      'properties',
      'compliance',
      'documents',
      'tasks',
      'finance',
      'team',
    ],
    routeRoot:
      'packages/extensions/fireux-properties/src/runtime/pages/console/portfolio',
  },
  property: {
    catalogue:
      'packages/extensions/fireux-properties/src/runtime/content/operations.ts',
    operations: ['identity', 'reservations', 'calendar', 'team'],
    routeRoot:
      'packages/extensions/fireux-properties/src/runtime/pages/console/property',
  },
  blank: {
    catalogue: 'projects/fireux/fireux-blank/app/meta.ts',
    operations: ['identity'],
    routeRoot: 'projects/fireux/fireux-blank/app/pages/console/blank',
  },
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const seenPages = new Set()

  validateConsoleLayout(repoRoot, violations)
  validateConsoleNavigationLifecycle(repoRoot, violations)
  validateConsoleAgentDoorway(repoRoot, violations)
  validateConsoleMenuCanon(repoRoot, violations)
  validateConsoleOperationContracts(repoRoot, violations)
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
        '[guard] ❌ console page contract drift detected:',
        ...violations
          .sort((left, right) => left.localeCompare(right))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Every Console page using the shared transition has one real root DOM element; only an explicit pageTransition: false route is exempt.',
        '- Console pages compose UDashboardPanel, LayoutsConsoleNavbar, and a body slot directly.',
        '- Pages own body width and spacing; named domain components own domain presentation.',
        '- Header actions belong in the console navbar right slot.',
        '- Route access, visibility, roles, and selection requirements belong at top-level page meta; nav owns presentation only.',
        '- Surface metadata, when declared, uses browse, detail, create, edit, workflow, or live.',
        '- Only redirects, nested routers, and live layouts are exempt.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ console pages use the explicit page contract')
}

function validateConsoleAgentDoorway(repoRoot, violations) {
  const routing = readFileSync(path.join(repoRoot, CONSOLE_ROUTING), 'utf8')
  const nav = readFileSync(path.join(repoRoot, CONSOLE_NAV), 'utf8')
  const middleware = readFileSync(path.join(repoRoot, CONSOLE_MIDDLEWARE), 'utf8')
  const page = readFileSync(path.join(repoRoot, CONSOLE_AGENT_PAGE), 'utf8')

  if (
    !/CONSOLE_AGENT_PATH\s*=\s*`\$\{CONSOLE_ROOT\}\/agent`/.test(routing) ||
    !/isConsoleAgentPath\(path\)[\s\S]*normalizeConsoleFamily\(familyQuery\)/.test(routing)
  ) {
    violations.push(
      `${CONSOLE_ROUTING} (/console/agent must resolve its active family from explicit route context)`
    )
  }
  if (
    !/item\.key === ['"]console-agent['"][\s\S]*CONSOLE_AGENT_PATH/.test(nav) ||
    /URLSearchParams|family=\$\{/.test(nav)
  ) {
    violations.push(
      `${CONSOLE_NAV} (the shared Agent doorway must use its clean canonical URL and consume Console runtime context)`
    )
  }
  if (
    !/const agentPath = isConsoleAgentPath\(path\)/.test(middleware) ||
    !/routeFamily && !enabledFamilies\.has\(routeFamily\)/.test(middleware)
  ) {
    violations.push(
      `${CONSOLE_MIDDLEWARE} (/console/agent must allow ecosystem context and validate explicit family context)`
    )
  }
  if (
    !/key:\s*['"]console-agent['"]/.test(page) ||
    !/position:\s*['"]bottom['"]/.test(page) ||
    !/requiresSelection:\s*false/.test(page) ||
    !/useConsoleSelection\(item\)/.test(page) ||
    !/consoleRoot\.activeFamily\.value/.test(page) ||
    /pages\/console\/[^'"\s]+\/agent/.test(page)
  ) {
    violations.push(
      `${CONSOLE_AGENT_PAGE} (the shared doorway must sit beneath the family doorway and consume canonical family selection without creating a family-local Agent route)`
    )
  }
}

function validateConsoleMenuCanon(repoRoot, violations) {
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
    'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/qr.vue'
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
    'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dev.vue'
  const kitchenDev = readFileSync(path.join(repoRoot, kitchenDevRelative), 'utf8')
  const consoleMiddleware = readFileSync(
    path.join(repoRoot, CONSOLE_MIDDLEWARE),
    'utf8'
  )
  if (!/roles:\s*\[['"]developer['"]\]/.test(kitchenDev)) {
    violations.push(`${kitchenDevRelative} (Console Dev must require the developer role)`)
  }
  if (
    !/needsDeveloper[\s\S]*!import\.meta\.dev[\s\S]*statusCode:\s*404/.test(
      consoleMiddleware
    ) ||
    !/needsDeveloper[\s\S]*developerId[\s\S]*auth\.uid !== developerId/.test(
      consoleMiddleware
    )
  ) {
    violations.push(
      `${CONSOLE_MIDDLEWARE} (developer Console routes must be build-only and developer-only)`
    )
  }
}

function validateConsoleNavigationLifecycle(repoRoot, violations) {
  const pagesConfigRelative =
    'packages/core/fireux-core/src/config/module/pages-config.ts'
  const overviewRelative =
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/overview/useKitchenConsoleOverview.ts'
  const pagesConfig = readFileSync(path.join(repoRoot, pagesConfigRelative), 'utf8')
  const overview = readFileSync(path.join(repoRoot, overviewRelative), 'utf8')
  const layout = readFileSync(path.join(repoRoot, CONSOLE_LAYOUT), 'utf8')
  const middleware = readFileSync(path.join(repoRoot, CONSOLE_MIDDLEWARE), 'utf8')
  const authGuard = readFileSync(path.join(repoRoot, ROUTE_AUTH_GUARD), 'utf8')

  if (
    !/startsWith\(['"]\/console['"]\)[\s\S]*pageTransition:\s*false/.test(
      pagesConfig
    )
  ) {
    violations.push(
      `${pagesConfigRelative} (Console navigation must not inherit the global out-in page transition)`
    )
  }
  if (/useKitchenConsole(?:Menus|Ingredients|Dishes|Recipes|Suppliers|Stations|Mise|Orders|Tables)/.test(overview)) {
    violations.push(
      `${overviewRelative} (Kitchen Overview must not initialize operation workspaces for summary counts)`
    )
  }
  if (/<NuxtErrorBoundary[^>]*:key=["']route\.fullPath/.test(layout)) {
    violations.push(
      `${CONSOLE_LAYOUT} (route changes must not recreate the persistent Console boundary)`
    )
  }
  if (!/isConsolePath\(path\)[\s\S]*to\.meta\.pageTransition = false/.test(middleware)) {
    violations.push(
      `${CONSOLE_MIDDLEWARE} (every Console navigation must disable the global page transition)`
    )
  }
  if (!/const currentUid = auth\.currentUser\?\.uid[\s\S]*if \(currentUid\)[\s\S]*return \{[\s\S]*isAuthenticated: !auth\.currentUser\?\.isAnonymous/.test(authGuard)) {
    violations.push(
      `${ROUTE_AUTH_GUARD} (established authentication must not install another navigation-time observer)`
    )
  }
}

function validateConsoleOperationContracts(repoRoot, violations) {
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
          `${contract.routeRoot}/${operation} (missing ${family} Console Operation route)`
        )
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

    const identityRoute = routeCandidatesForIdentity(
      repoRoot,
      contract.routeRoot
    )
    if (!identityRoute.some((candidate) => existsSync(candidate))) {
      violations.push(`${contract.routeRoot} (every Console requires Identity)`)
    }
  }
}

function routeCandidatesForIdentity(repoRoot, routeRoot) {
  return [
    path.join(repoRoot, routeRoot, 'identity.vue'),
    path.join(repoRoot, routeRoot, 'identity', 'index.vue'),
  ]
}

function validateKitchenRecipesWorkspace(repoRoot, violations) {
  const files = {
    Index: {
      required: /\bprovideKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenConsoleRecipes\s*\(/,
    },
    Read: {
      required: /\buseKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenConsoleRecipes\s*\(/,
    },
    Write: {
      required: /\buseKitchenRecipesWorkspace\s*\(/,
      forbidden: /\buseKitchenConsoleRecipes\s*\(/,
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
      forbidden: /\buseKitchenConsoleMenus\s*\(/,
    },
    List: {
      required: /\buseKitchenMenusWorkspace\s*\(/,
      forbidden: /\buseKitchenConsoleMenus\s*\(/,
    },
    Debug: {
      required: /\buseKitchenMenusWorkspace\s*\(/,
      forbidden: /\buseKitchenConsoleMenus\s*\(/,
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

function validateConsoleLayout(repoRoot, violations) {
  const fullPath = path.join(repoRoot, CONSOLE_LAYOUT)
  if (!existsSync(fullPath)) {
    violations.push(`${CONSOLE_LAYOUT} (missing shared Console layout)`)
    return
  }

  const source = readFileSync(fullPath, 'utf8')
  const hasDirectSlot = /<slot\b[^>]*\bv-else\b/.test(source)
  const hasGuardedSlot =
    /<NuxtErrorBoundary\b[^>]*\bv-else\b/.test(source) &&
    /<NuxtErrorBoundary\b[\s\S]*?<slot\s*\/>[\s\S]*?<template\s+#error=/.test(
      source
    ) &&
    /console-page-unavailable/.test(source) &&
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
    const surface = readConsoleSurface(script)
    const exceptionKind = NON_DIRECT_PAGES.get(relative)
    const directContract = hasDirectContract(template)

    seenPages.add(relative)
    validateRenderedPageRoot(relative, template, pageMeta, violations)
    validateRouteMetaPlacement(relative, pageMeta, violations)

    if (surface && !STANDARD_SURFACES.has(surface)) {
      violations.push(`${relative} (invalid consoleSurface: ${surface})`)
    }

    if (normalized.endsWith('/edit.vue') && surface !== 'edit') {
      violations.push(
        `${relative} (edit route must declare consoleSurface: 'edit')`
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
    ['LayoutsConsoleNavbar', /<LayoutsConsoleNavbar\b/],
    ['body slot', /<template\s+#body\b/],
  ]

  for (const [label, pattern] of requiredTemplateParts) {
    if (!pattern.test(template)) {
      violations.push(`${relative} (missing ${label})`)
    }
  }

  if (!/\blayout\s*:\s*['"]console['"]/.test(script)) {
    violations.push(
      `${relative} (direct console page must declare layout: 'console')`
    )
  }
  if (!/\brequiresAuth\s*:\s*true\b/.test(script)) {
    violations.push(
      `${relative} (direct console page must declare requiresAuth: true)`
    )
  }
  if (!hasTopLevelProperty(pageMeta, 'requiresSelection')) {
    violations.push(
      `${relative} (direct console page must declare top-level requiresSelection)`
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
        `${relative} (live exception must declare consoleSurface: 'live')`
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
    /<LayoutsConsoleNavbar\b/.test(template) &&
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

function readConsoleSurface(script) {
  return script.match(/\bconsoleSurface\s*:\s*(['"])([^'"]+)\1/)?.[2] ?? ''
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
