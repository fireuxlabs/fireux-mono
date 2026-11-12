import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, reactive } from 'vue'
const source = readFileSync(
  new URL(
    '../runtime/workspace/composables/useWorkspacePageNavigation.ts',
    import.meta.url
  ),
  'utf8'
)
function group(workspace, entry, items, navKey, routeOverride) {
  const current = items.find((item) => item.key === navKey)
  const script = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export function', 'function')
  return compileFunction(
    `${stripTypeScriptTypes(script)}; return useWorkspacePageNavigation()`,
    [
      'computed',
      'useRoute',
      'useWorkspaceNav',
      'useWorkspaceEntryCta',
      'toWorkspaceFamilyLabel',
    ]
  )(
    computed,
    () => routeOverride || { path: current.to, meta: { nav: current } },
    () => ({ items: ref(items), currentWorkspace: ref(workspace) }),
    () => ({ workspaceEntryPath: ref(entry) }),
    (value) => value[0].toUpperCase() + value.slice(1)
  )
}
test('Kitchen group framing starts at its group and retains navigation children', () => {
  const children = [
    {
      key: 'items',
      label: 'Items',
      to: '/workspace/kitchen/menu/items',
    },
  ]
  const state = group(
    'kitchen',
    '/',
    [
      {
        key: 'workspace-kitchen-overview',
        label: 'Overview',
        to: '/workspace/kitchen/overview',
      },
      {
        key: 'workspace-kitchen-menu-group',
        label: 'Food & drink',
        to: '/workspace/kitchen/menu',
        children,
      },
    ],
    'workspace-kitchen-menu-group'
  )
  assert.deepEqual(state.breadcrumbs.value, [{ label: 'Food & drink' }])
  assert.deepEqual(state.children.value, children)
})
test('another Workspace also omits synthetic entry prefixes', () => {
  const state = group(
    'project',
    '/workspace/project',
    [
      {
        key: 'workspace-project-delivery',
        label: 'Delivery',
        to: '/workspace/project/delivery',
      },
    ],
    'workspace-project-delivery'
  )
  assert.deepEqual(state.breadcrumbs.value, [{ label: 'Delivery' }])
  assert.deepEqual(state.children.value, [])
  assert.ok(!source.includes('/workspace/kitchen'))
  assert.ok(!source.includes('<slot'))
})

test('content header ownership follows explicit route metadata and resets on navigation', () => {
  const item = {
    key: 'food',
    label: 'Food & drink',
    description: 'Static introduction',
    to: '/workspace/kitchen/food',
  }
  const route = reactive({
    path: item.to,
    meta: { nav: item, workspaceHeader: 'content' },
  })
  const state = group('kitchen', '/', [item], 'food', route)
  assert.equal(state.contentHeader.value, true)
  assert.equal(state.title.value, 'Food & drink')
  assert.equal(state.description.value, 'Static introduction')
  route.path = '/workspace/kitchen/food/items/deeply/nested'
  route.meta = { nav: { label: 'Items', description: 'Manage items' } }
  assert.equal(state.contentHeader.value, false)
  assert.equal(state.title.value, 'Items')
  assert.equal(state.description.value, 'Manage items')
})

test('child pages retain registered group links without synthetic prefixes', () => {
  const items = [
    {
      key: 'workspace-kitchen-home',
      label: 'Kitchen Workspace',
      to: '/workspace/kitchen',
    },
    {
      key: 'workspace-kitchen-overview',
      label: 'Overview',
      to: '/workspace/kitchen/overview',
    },
    {
      key: 'workspace-kitchen-menu',
      label: 'Menus',
      to: '/workspace/kitchen/menu',
      children: [{ label: 'Items', to: '/workspace/kitchen/menu/items' }],
    },
  ]
  const state = group('kitchen', '/', items, 'workspace-kitchen-menu', {
    path: '/workspace/kitchen/menu/items',
    meta: { nav: { label: 'Items' } },
  })
  assert.deepEqual(state.breadcrumbs.value, [
    { label: 'Menus', to: '/workspace/kitchen/menu' },
    { label: 'Items' },
  ])
})

for (const [key, label, path] of [
  ['home', 'Kitchen Workspace', '/workspace/kitchen'],
  ['overview', 'Overview', '/workspace/kitchen/overview'],
]) {
  test(`${key} remains a standalone current page`, () => {
    const state = group(
      'kitchen',
      '/workspace/kitchen',
      [{ key, label, to: path }],
      key
    )
    assert.deepEqual(state.breadcrumbs.value, [{ label }])
  })
}

test('similar URL segments do not create unnamed breadcrumb ancestors', () => {
  const state = group(
    'project',
    '/workspace/project',
    [
      { key: 'project', label: 'Project', to: '/workspace/project' },
      { key: 'team', label: 'Team', to: '/workspace/project/team' },
    ],
    'team',
    {
      path: '/workspace/project/teamwork/record',
      meta: { nav: { label: 'Record' } },
    }
  )
  assert.deepEqual(state.breadcrumbs.value, [{ label: 'Record' }])
})
