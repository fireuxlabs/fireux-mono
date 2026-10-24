import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(
  new URL('../runtime/pages/workspace/kitchen/', import.meta.url)
)
const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)]
  )
function navigation(file) {
  const script = readFileSync(file, 'utf8').match(
    /<script[^>]*>([\s\S]*?)<\/script>/
  )?.[1]
  if (!script) return
  const source = ts.createSourceFile(
    file,
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  let nav
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === 'definePageMeta'
    ) {
      nav = Function(`return (${node.arguments[0].getText(source)})`)().nav
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return nav
}
const destinations = files(root)
  .filter((file) => file.endsWith('.vue'))
  .flatMap((file) => {
    const nav = navigation(file)
    if (!nav || nav.hidden || nav.desktop === false) return []
    const to =
      '/workspace/kitchen/' +
      relative(root, file)
        .replace(/\.vue$/, '')
        .replace(/\/index$/, '')
    return nav.children?.length
      ? [
          ...(nav.groupIndex
            ? [{ label: nav.label, to, group: nav.label }]
            : []),
          ...nav.children.map((child) => ({ ...child, group: nav.label })),
        ]
      : [{ label: nav.label, to, group: nav.group }]
  })

test('Kitchen primary navigation has unique destinations backed by actual pages', () => {
  assert.ok(destinations.length > 0)
  const seen = new Set()
  for (const item of destinations) {
    assert.ok(!seen.has(item.to), `Duplicate destination: ${item.to}`)
    seen.add(item.to)
    assert.ok(
      !item.to.includes('?view='),
      `Page view needs a child route: ${item.to}`
    )
    const path = item.to.split('#')[0].replace('/workspace/kitchen/', '')
    assert.ok(
      existsSync(join(root, path + '.vue')) ||
        existsSync(join(root, path, 'index.vue')),
      `Missing page: ${item.to}`
    )
  }
})

test('Food & drink has its own index and four sibling working pages', () => {
  const food = navigation(join(root, 'food-and-drink/index.vue'))
  assert.equal(food.label, 'Food & drink')
  assert.equal(food.groupIndex, true)
  assert.notEqual(food.hidden, true)
  assert.deepEqual(
    food.children.map(({ label, to }) => [label, to]),
    [
      ['Items', '/workspace/kitchen/food-and-drink/items'],
      ['Menus', '/workspace/kitchen/food-and-drink/menus'],
      ['Promotions', '/workspace/kitchen/food-and-drink/promotions'],
      ['Services', '/workspace/kitchen/food-and-drink/services'],
    ]
  )
  for (const file of [
    'food-and-drink/items/index.vue',
    'food-and-drink/menus/index.vue',
    'food-and-drink/promotions/index.vue',
    'food-and-drink/services/index.vue',
  ]) {
    const nav = navigation(join(root, file))
    assert.equal(nav.hidden, true)
    assert.equal(nav.group, 'Food & drink')
    assert.ok(!nav.children?.length)
  }
  assert.ok(
    readFileSync(join(root, 'food-and-drink/index.vue'), 'utf8').includes(
      'KitchenFoodAndDrink'
    )
  )
  assert.equal(navigation(join(root, 'overview/index.vue')).hidden, undefined)
})

test('Identity and brand is top level, separate from technical Settings', () => {
  const identity = navigation(join(root, 'identity/index.vue'))
  assert.equal(identity.label, 'Identity & brand')
  assert.equal(identity.group, '')
  assert.notEqual(identity.hidden, true)
  assert.equal(identity.groupIndex, true)
  assert.deepEqual(
    identity.children.map((item) => item.to),
    [
      '/workspace/kitchen/identity/profile',
      '/workspace/kitchen/identity/operating-hours',
      '/workspace/kitchen/identity/appearance',
    ]
  )
  const settings = navigation(join(root, 'settings/index.vue'))
  assert.deepEqual(
    settings.children.map((item) => item.to),
    [
      '/workspace/kitchen/identity/payments',
      '/workspace/kitchen/settings/integrations',
      '/workspace/kitchen/settings/access',
    ]
  )
  for (const file of ['profile', 'operating-hours', 'appearance']) {
    const nav = navigation(join(root, `identity/${file}.vue`))
    assert.equal(nav.hidden, true)
    assert.equal(nav.group, 'Identity & brand')
  }
  assert.equal(
    navigation(join(root, 'identity/payments.vue')).group,
    'Settings'
  )
})

test('Menu record, import and research routes all live in the direct Menu subtree', () => {
  const expected = [
    'index.vue',
    'uploads/[uploadId].vue',
    '[menuSlug]/index.vue',
    '[menuSlug]/content.vue',
    '[menuSlug]/publishing.vue',
    '[menuSlug]/source.vue',
    '[menuSlug]/[sectionId].vue',
    'search-demand/index.vue',
    'search-demand/analysis.vue',
    'search-demand/tools.vue',
  ]
  for (const file of expected)
    assert.ok(existsSync(join(root, 'food-and-drink/menus', file)), file)
  assert.equal(existsSync(join(root, 'food', 'menus')), false)
})

test('all Kitchen groups with working indexes link their labels without duplicate index children', () => {
  for (const name of [
    'orders',
    'food-and-drink',
    'prep',
    'stock',
    'food-safety',
    'team',
    'reports',
    'settings',
  ]) {
    const index = navigation(join(root, name, 'index.vue'))
    assert.equal(index.groupIndex, true, name)
    assert.ok(index.children.length > 0, name)
    assert.ok(
      index.children.every(
        (child) => child.to !== `/workspace/kitchen/${name}`
      ),
      name
    )
  }
  assert.ok(
    !readFileSync(join(root, 'settings/index.vue'), 'utf8').includes(
      'navigateTo('
    )
  )
})

test('every Kitchen sidebar group has one working index and operational screens retain child destinations', () => {
  const explicit = [
    'orders',
    'food-and-drink',
    'prep',
    'stock',
    'food-safety',
    'team',
    'reports',
    'settings',
  ]
  for (const name of explicit) {
    const index = navigation(join(root, name, 'index.vue'))
    assert.equal(index.groupIndex, true, name)
    assert.ok(
      !readFileSync(join(root, name, 'index.vue'), 'utf8').includes(
        'navigateTo('
      ),
      name
    )
  }
  const operational = [
    ['orders/board.vue', 'KitchenOrdersBoard'],
    ['prep/plan.vue', 'KitchenPrepAndProductionPlanning'],
    ['food-safety/checks.vue', 'KitchenFoodSafetyPage'],
    ['team/people.vue', 'KitchenTeam'],
  ]
  for (const [file, component] of operational) {
    assert.equal(navigation(join(root, file)).hidden, true, file)
    assert.ok(readFileSync(join(root, file), 'utf8').includes(component), file)
    assert.ok(
      destinations.some(
        (item) => item.to === '/workspace/kitchen/' + file.replace(/\.vue$/, '')
      ),
      file
    )
  }
  assert.ok(
    destinations.some(
      (item) => item.to === '/workspace/kitchen/identity/payments'
    )
  )
})

test('Orders retains its board and Services belongs to Food & drink', () => {
  const index = navigation(join(root, 'orders/index.vue'))
  assert.deepEqual(
    index.children.map((item) => item.label),
    ['Order board']
  )
  const offerings = navigation(join(root, 'food-and-drink/services/index.vue'))
  assert.equal(offerings.label, 'Services')
  assert.equal(offerings.key, 'workspace-kitchen-services')
  assert.equal(offerings.hidden, true)
  assert.equal(offerings.group, 'Food & drink')
  assert.ok(!index.children.some((item) => item.to.includes('/services')))
  assert.equal(existsSync(join(root, 'orders/channels/index.vue')), false)
  for (const old of [
    'orders/all.vue',
    'orders/queue.vue',
    'orders/pass.vue',
    'orders/pre-orders.vue',
    'orders/tables/index.vue',
    'orders/tables/edit.vue',
  ])
    assert.equal(existsSync(join(root, old)), false, old)
})

test('Recipes and Ingredients are production children outside the Menus group', () => {
  const prep = navigation(join(root, 'prep/index.vue'))
  for (const [label, path] of [
    ['Recipes', 'recipes'],
    ['Ingredients', 'ingredients'],
  ]) {
    assert.ok(
      prep.children.some(
        (child) =>
          child.label === label &&
          child.to === `/workspace/kitchen/prep/${path}`
      )
    )
    const record = navigation(join(root, `prep/${path}/index.vue`))
    assert.equal(record.group, 'Prep & Production')
    assert.equal(record.hidden, true)
  }
})

test('Home uses the footer Kitchen switcher while Overview remains in primary navigation', () => {
  const home = navigation(
    fileURLToPath(
      new URL(
        '../../../../../projects/misebox/misebox-app/app/pages/index.vue',
        import.meta.url
      )
    )
  )
  const overview = navigation(join(root, 'overview/index.vue'))
  assert.equal(home.key, 'workspace-kitchen')
  assert.equal(home.label, 'Home')
  assert.equal(home.position, 'bottom')
  assert.equal(home.group, '')
  assert.equal(overview.position, 'top')
})

test('Overview presents group entrances without flattening their children', () => {
  const file = fileURLToPath(
    new URL(
      '../runtime/kitchen/components/Workspace/Overview/Groups.vue',
      import.meta.url
    )
  )
  const script = readFileSync(file, 'utf8')
    .match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*$/gm, '')
  const items = [
    {
      key: 'workspace-kitchen-overview',
      to: '/workspace/kitchen/overview',
      desktop: true,
      position: 'top',
      order: 0,
    },
    {
      key: 'workspace-kitchen',
      to: '/',
      desktop: true,
      position: 'top',
      order: -100,
    },
    {
      key: 'menus',
      to: '/workspace/kitchen/food-and-drink/menus',
      desktop: true,
      position: 'top',
      order: 11,
      children: [{ to: '/workspace/kitchen/food-and-drink/promotions' }],
    },
    {
      key: 'prep',
      to: '/workspace/kitchen/prep',
      desktop: true,
      position: 'top',
      order: 20,
      children: [{ to: '/workspace/kitchen/prep/recipes' }],
    },
    {
      key: 'calendar',
      to: '/workspace/kitchen/calendar',
      desktop: false,
      position: 'middle',
      order: 50,
    },
    {
      key: 'other-workspace',
      to: '/workspace/property/settings',
      desktop: true,
      position: 'top',
      order: 90,
    },
  ]
  const areas = Function(
    'computed',
    'useNav',
    `${script}; return areas.value`
  )(
    (read) => ({
      get value() {
        return read()
      },
    }),
    () => ({ items: { value: [...items].reverse() } })
  )
  assert.deepEqual(
    areas.map((area) => area.to),
    ['/workspace/kitchen/food-and-drink/menus', '/workspace/kitchen/prep']
  )
  assert.deepEqual(areas[0].children, items[2].children)
})

test('collection breadcrumbs return to their route-owned group index', () => {
  const file = fileURLToPath(
    new URL(
      '../runtime/kitchen/components/Workspace/Collection/Header.vue',
      import.meta.url
    )
  )
  const script = readFileSync(file, 'utf8')
    .match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*$/gm, '')
  const executable = ts.transpileModule(script, {
    compilerOptions: { target: ts.ScriptTarget.ESNext },
  }).outputText
  const prep = navigation(join(root, 'prep/index.vue'))
  const project = (path) =>
    Function(
      'computed',
      'defineProps',
      'useWorkspaceEntryCta',
      'useRoute',
      'useNav',
      `${executable}; return breadcrumbs.value`
    )(
      (read) => ({
        get value() {
          return read()
        },
      }),
      () => ({ title: path.endsWith('recipes') ? 'Recipes' : 'Food & drinks' }),
      () => ({ workspaceEntryPath: { value: '/' } }),
      () => ({ path }),
      () => ({ items: { value: [{ ...prep, to: '/workspace/kitchen/prep' }] } })
    )
  assert.deepEqual(
    project('/workspace/kitchen/prep/recipes').map((item) => item.to),
    ['/', '/workspace/kitchen/overview', '/workspace/kitchen/prep', undefined]
  )
  assert.deepEqual(
    project('/workspace/kitchen/food-and-drink/items').map((item) => item.to),
    ['/', '/workspace/kitchen/overview', undefined]
  )
})

test('Developer is not a Workspace navigation or Overview entrance', () => {
  assert.equal(navigation(join(root, 'developer/index.vue')).hidden, true)
  assert.ok(
    destinations.every(
      (item) => !item.to.startsWith('/workspace/kitchen/developer')
    )
  )
})

test('Kitchen navigation puts identity and team before domain groups, and Settings last', () => {
  const visible = files(root)
    .filter((file) => file.endsWith('.vue'))
    .map(navigation)
    .filter(
      (nav) =>
        nav &&
        !nav.hidden &&
        !nav.parked &&
        nav.desktop !== false &&
        nav.position === 'top'
    )
    .sort((a, b) => a.order - b.order)
  assert.deepEqual(
    visible.map((nav) => nav.label),
    [
      'Overview',
      'Identity & brand',
      'Team',
      'Food & drink',
      'Orders',
      'Prep & Production',
      'Stock & Purchasing',
      'Food Safety',
      'Reports',
      'Settings',
    ]
  )
})

test('shared Workspace navigation preserves the agreed Kitchen group order', () => {
  const source = readFileSync(
    fileURLToPath(
      new URL(
        '../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceNav.ts',
        import.meta.url
      )
    ),
    'utf8'
  ).replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText
  const items = files(root)
    .filter((file) => file.endsWith('.vue'))
    .flatMap((file) => {
      const nav = navigation(file)
      if (!nav || nav.hidden || nav.parked || nav.desktop === false) return []
      return [
        {
          ...nav,
          to:
            '/workspace/kitchen/' +
            relative(root, file)
              .replace(/\.vue$/, '')
              .replace(/\/index$/, ''),
        },
      ]
    })
  const result = Function(
    'exports',
    'computed',
    'useRoute',
    'useFireUXConfig',
    'useNav',
    'normalizeWorkspaceFamily',
    'workspaceFamilyFromRouteContext',
    `${compiled}; return exports.useWorkspaceNav()`
  )(
    {},
    (read) => ({
      get value() {
        return read()
      },
    }),
    () => ({ path: '/workspace/kitchen/food-and-drink', meta: { workspace: 'kitchen' } }),
    () => ({ workspaces: ['kitchen'] }),
    () => ({ items: { value: items } }),
    (value) => value,
    (path) => path.split('/')[2]
  )
  assert.deepEqual(
    result.desktop.value
      .filter((item) => item.position === 'top')
      .map((item) => item.label),
    [
      'Overview',
      'Identity & brand',
      'Team',
      'Food & drink',
      'Orders',
      'Prep & Production',
      'Stock & Purchasing',
      'Food Safety',
      'Reports',
      'Settings',
    ]
  )
})


test('Food & drink creation and service configuration have no redundant child pages', () => {
  for (const file of ['items/create.vue', 'menus/create.vue', 'services/[offering].vue'])
    assert.equal(existsSync(join(root, 'food-and-drink', file)), false, file)
  assert.ok(existsSync(join(root, 'food-and-drink/items/[dishId].vue')))
  assert.ok(existsSync(join(root, 'food-and-drink/menus/[menuSlug]/index.vue')))
  assert.equal(existsSync(join(root, 'food/drinks')), false)
})


test('group child surfaces retain every entrance and compose summaries inside the standard card', () => {
  const components = new URL('../runtime/kitchen/components/', import.meta.url)
  const group = readFileSync(new URL('../../../../core/fireux-core/src/runtime/workspace/components/GroupPage.vue', import.meta.url), 'utf8')
  const food = readFileSync(new URL('FoodAndDrink/Index.vue', components), 'utf8')
  const services = readFileSync(new URL('FoodAndDrink/Services/Overview.vue', components), 'utf8')
  assert.match(group, /v-for="item in children"/)
  assert.match(group, /<slot>/)
  assert.ok(!group.includes('excludePages'))
  assert.ok(food.indexOf('<KitchenFoodAndDrinkAI') < food.indexOf('<KitchenFoodAndDrinkItemsOverview'))
  assert.match(food, /<WorkspaceGroupPage workspace="kitchen" nav-key="workspace-kitchen-food"/)
  assert.match(food, /<KitchenFoodAndDrinkServicesOverview/)
  const keys = navigation(join(root, 'food-and-drink/index.vue')).children.map(child => child.key)
  assert.deepEqual(keys, ['items', 'menus', 'promotions', 'services'])
  assert.ok(!food.includes('<template #'))
  for (const name of ['Items', 'Menus', 'Promotions', 'Services']) {
    const child = readFileSync(new URL(`FoodAndDrink/${name}/Overview.vue`, components), 'utf8')
    assert.match(child, /WorkspaceKitchenNavigationChild/)
    assert.ok(child.includes(`child-key="${name.toLowerCase()}"`))
  }
  assert.ok(!food.includes('item.to'))
  assert.ok(!food.includes("split('/'"))
  assert.match(services, /:to="row.to"/)
  assert.ok(!services.includes('<section'))
})

test('every declared Kitchen group index composes the shared group shell', () => {
  const groups = files(root).filter(file => file.endsWith('.vue') && navigation(file)?.groupIndex)
  assert.equal(groups.length, 10)
  for (const file of groups) {
    const source = readFileSync(file, 'utf8')
    const composition = file.endsWith('/food-and-drink/index.vue')
      ? readFileSync(new URL('../runtime/kitchen/components/FoodAndDrink/Index.vue', import.meta.url), 'utf8')
      : file.endsWith('/prep/index.vue')
        ? readFileSync(new URL('../runtime/kitchen/components/PrepAndProduction/Index.vue', import.meta.url), 'utf8')
        : source
    assert.match(composition, /<WorkspaceGroupPage\b/, relative(root,file))
    assert.ok(!composition.includes('<UDashboardPanel'), relative(root,file))
  }
  assert.equal(existsSync(join(root,'menu-setup.vue')),false)
  const identity = readFileSync(new URL('../runtime/kitchen/components/Identity/Index.vue', import.meta.url),'utf8')
  assert.ok(!identity.includes('<UBreadcrumb'))
})
