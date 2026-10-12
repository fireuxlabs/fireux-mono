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

test('Menus & Recipes group index preserves capability destinations independently of route prefixes', () => {
  const group = 'Menus & Recipes'
  const index = navigation(join(root, 'menus-recipes.vue'))
  assert.equal(index.group, group)
  assert.equal(index.groupIndex, true)
  assert.equal(index.groupDisplay, 'nested')
  assert.equal(index.hidden, undefined)

  const expected = [
    ['Menus & Recipes', '/workspace/kitchen/menus-recipes'],
    ['Menus', '/workspace/kitchen/menus'],
    ['Food & drinks', '/workspace/kitchen/food/dishes'],
    ['Recipes', '/workspace/kitchen/food/recipes'],
    ['Ingredients', '/workspace/kitchen/food/ingredients'],
  ]
  assert.deepEqual(
    destinations
      .filter((item) => item.group === group)
      .map((item) => [item.label, item.to])
      .sort((left, right) => left[1].localeCompare(right[1])),
    expected.sort((left, right) => left[1].localeCompare(right[1]))
  )

  // Drinks remains a contextual capability in this group, not a duplicate
  // primary sidebar entrance alongside Food & drinks.
  const drinks = navigation(join(root, 'food/drinks/index.vue'))
  assert.equal(drinks.group, group)
  assert.equal(drinks.hidden, true)
  assert.equal(drinks.key, 'workspace-kitchen-drinks')
})

test('Identity group opens its index and has distinct profile, hours and appearance children', () => {
  const index = navigation(join(root, 'identity/index.vue'))
  assert.equal(index.group, 'Identity')
  assert.equal(index.groupIndex, true)
  assert.equal(index.label, 'Identity')
  assert.equal(index.groupDisplay, 'nested')
  assert.deepEqual(
    destinations
      .filter((item) => item.group === 'Identity')
      .map((item) => item.to)
      .sort(),
    [
      '/workspace/kitchen/identity',
      '/workspace/kitchen/identity/appearance',
      '/workspace/kitchen/identity/operating-hours',
      '/workspace/kitchen/identity/profile',
    ]
  )
})

test('retired Place editor route is removed and all Identity tools have explicit destinations', () => {
  assert.equal(existsSync(join(root, 'identity/place.vue')), false)
  const profile = navigation(join(root, 'identity/profile.vue'))
  assert.equal(profile.label, 'Venue profile')
  assert.equal(profile.group, 'Identity')
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
  const grouped = ['stock', 'reports', 'developer', 'identity']
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
    ['orders/board.vue', 'WorkspaceKitchenOrdersPage'],
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
    destinations.some((item) => item.to === '/workspace/kitchen/fulfilment')
  )
})

test('Orders has three substantial children and retired board perspectives have no routes', () => {
  const index = navigation(join(root, 'orders/index.vue'))
  assert.deepEqual(
    index.children.map((item) => item.label),
    ['Order board', 'Offerings', 'Delivery & payments']
  )
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
