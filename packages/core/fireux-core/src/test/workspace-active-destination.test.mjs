import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, ref } from 'vue'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL(
    '../runtime/composables/navigation/workspace-active-destination.ts',
    import.meta.url
  ),
  'utf8'
).replace('export function', 'function')
const active = compileFunction(
  `${stripTypeScriptTypes(source)}; return workspaceActiveDestination`
)()
const current = (path, query = {}, hash = '') => ({
  path,
  query,
  hash,
  meta: {},
})

test('nested destinations supersede their group default, including detail routes', () => {
  const links = [
    '/workspace/kitchen/orders',
    '/workspace/kitchen/offerings',
    '/workspace/kitchen/orders/queue',
  ]
  assert.equal(active(links, current('/workspace/kitchen/offerings')), links[1])
  assert.equal(
    active(links, current('/workspace/kitchen/offerings/breakfast')),
    links[1]
  )
  assert.equal(
    active(links, current('/workspace/kitchen/orders/queue')),
    links[2]
  )
  assert.equal(active(links, current('/workspace/kitchen/orders')), links[0])
})

test('identity child pages do not highlight their parent link', () => {
  const links = [
    '/workspace/kitchen/identity',
    '/workspace/kitchen/identity/appearance',
  ]
  assert.equal(active(links, current(links[1])), links[1])
})

test('in-page sections and existing query destinations take precedence over a plain link', () => {
  const links = [
    '/workspace/project/team',
    '/workspace/project/team#responsibilities',
    '/workspace/project/team?view=roles',
  ]
  assert.equal(
    active(links, current(links[0], {}, '#responsibilities')),
    links[1]
  )
  assert.equal(active(links, current(links[0], { view: 'roles' })), links[2])
  assert.equal(active(links, current(links[0])), links[0])
})

test('path boundaries prevent similarly named capabilities matching each other', () => {
  assert.equal(
    active(
      ['/workspace/kitchen/orders'],
      current('/workspace/kitchen/orders-old')
    ),
    undefined
  )
  assert.equal(
    active(
      ['/workspace/project/apps'],
      current('/workspace/project/apps/demo')
    ),
    '/workspace/project/apps'
  )
})

// Exercise the actual shared sidebar projection for both supported group shapes.
function sidebar(items, route) {
  const layout = readFileSync(
    new URL('../runtime/layouts/workspace.vue', import.meta.url),
    'utf8'
  )
  const start = layout.indexOf('const activeDestination = computed(')
  const end = layout.indexOf('const middleNav = computed(', start)
  const source = stripTypeScriptTypes(layout.slice(start, end))
  const open = ref(true)
  const groupVisit = ref(0)
  const result = compileFunction(
    `${source}; return { activeDestination, topNavItems }`,
    [
      'computed',
      'topNav',
      'route',
      'workspaceActiveDestination',
      'open',
      'groupVisit',
    ]
  )(computed, ref(items), route, active, open, groupVisit)
  return { ...result, open, groupVisit }
}

test('explicit-child group indexes open their own page and expand on arrival in any Workspace', () => {
  for (const family of [
    'kitchen',
    'project',
    'supplier',
    'portfolio',
    'property',
  ]) {
    const to = `/workspace/${family}/example`
    const items = [
      {
        key: 'example',
        label: 'Example',
        to,
        groupIndex: true,
        children: [{ label: 'Details', to: `${to}/details` }],
      },
    ]
    const route = ref(current('/elsewhere'))
    // The layout receives an unwrapped reactive route rather than a Ref.
    const state = sidebar(
      items,
      new Proxy({}, { get: (_, key) => route.value[key] })
    )
    const link = state.topNavItems.value[0]
    assert.equal(link.type, 'link')
    assert.equal(link.to, to)
    assert.equal(link.defaultOpen, false)
    link.onSelect()
    assert.equal(state.open.value, false)
    assert.equal(state.groupVisit.value, 1)
    route.value = current(to)
    assert.equal(state.activeDestination.value, to)
    assert.equal(state.topNavItems.value[0].defaultOpen, true)
    route.value = current(`${to}/details`)
    assert.equal(state.topNavItems.value[0].children[0].active, true)
    assert.equal(state.topNavItems.value[0].defaultOpen, true)
  }
})

test('route-group index omits its duplicate child and indexless groups retain trigger behaviour', () => {
  const state = sidebar(
    [
      {
        label: 'Identity',
        to: '/workspace/kitchen/identity',
        group: 'Identity',
        groupDisplay: 'nested',
        groupIndex: true,
      },
      {
        label: 'Profile',
        to: '/workspace/kitchen/identity/profile',
        group: 'Identity',
        groupDisplay: 'nested',
      },
      {
        label: 'Settings',
        to: '/workspace/kitchen/settings',
        children: [
          { label: 'Access', to: '/workspace/kitchen/settings/access' },
        ],
      },
    ],
    current('/workspace/kitchen/identity')
  )
  const [identity, settings] = state.topNavItems.value
  assert.equal(identity.type, 'link')
  assert.equal(identity.to, '/workspace/kitchen/identity')
  assert.deepEqual(
    identity.children.map((item) => item.label),
    ['Profile']
  )
  assert.equal(identity.defaultOpen, true)
  assert.equal(settings.type, 'trigger')
  assert.equal(settings.to, undefined)
})
