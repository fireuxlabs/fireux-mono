import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
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

test('Food & drinks, Menus and Services are direct entrances without duplicate overview groups', () => {
  for (const [file, label] of [
    ['food/dishes/index.vue', 'Food & drinks'],
    ['menus/index.vue', 'Menus'],
    ['services/index.vue', 'Services'],
  ]) {
    const nav = navigation(join(root, file))
    assert.equal(nav.label, label)
    assert.equal(nav.group, '')
    assert.notEqual(nav.hidden, true)
  }
  for (const file of [
    'overview/index.vue',
    'menu-setup.vue',
    'food/drinks/index.vue',
  ])
    assert.equal(navigation(join(root, file)).hidden, true)
  assert.ok(
    destinations.some((item) => item.to === '/workspace/kitchen/promotions')
  )
})

test('Settings owns all existing venue configuration entrances exactly once', () => {
  const settings = navigation(join(root, 'settings/index.vue'))
  assert.equal(settings.groupIndex, true)
  assert.deepEqual(
    settings.children.map((item) => item.to),
    [
      '/workspace/kitchen/identity',
      '/workspace/kitchen/identity/profile',
      '/workspace/kitchen/identity/operating-hours',
      '/workspace/kitchen/identity/appearance',
      '/workspace/kitchen/identity/payments',
      '/workspace/kitchen/settings/integrations',
      '/workspace/kitchen/settings/access',
    ]
  )
  for (const file of [
    'index',
    'profile',
    'operating-hours',
    'appearance',
    'payments',
  ]) {
    const nav = navigation(join(root, `identity/${file}.vue`))
    assert.equal(nav.hidden, true)
    assert.equal(nav.group, 'Settings')
  }
  assert.equal(existsSync(join(root, 'identity/place.vue')), false)
})

test('Menu record, import and research routes all live in the direct Menu subtree', () => {
  const expected = [
    'index.vue',
    'create.vue',
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
    assert.ok(existsSync(join(root, 'menus', file)), file)
  assert.equal(existsSync(join(root, 'food', 'menus')), false)
})

test('all Kitchen groups with working indexes link their labels without duplicate index children', () => {
  for (const name of ['orders', 'prep', 'food-safety', 'team', 'settings']) {
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
  const explicit = ['orders', 'prep', 'food-safety', 'team', 'settings']
  const grouped = ['stock', 'reports', 'developer']
  for (const name of [...explicit, ...grouped]) {
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
    ['orders/board.vue', 'WorkspaceKitchenOrdersBoard'],
    ['prep/plan.vue', 'WorkspaceKitchenPrep'],
    ['food-safety/checks.vue', 'WorkspaceKitchenFoodSafetyPage'],
    ['team/people.vue', 'WorkspaceKitchenTeam'],
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

test('Orders contains the board and Services is a separate visible capability', () => {
  const index = navigation(join(root, 'orders/index.vue'))
  assert.deepEqual(
    index.children.map((item) => item.label),
    ['Order board']
  )
  const offerings = navigation(join(root, 'services/index.vue'))
  assert.equal(offerings.label, 'Services')
  assert.equal(offerings.key, 'workspace-kitchen-services')
  assert.notEqual(offerings.hidden, true)
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
          child.to === `/workspace/kitchen/food/${path}`
      )
    )
    const record = navigation(join(root, `food/${path}/index.vue`))
    assert.equal(record.group, 'Prep & Production')
    assert.equal(record.hidden, true)
  }
})
