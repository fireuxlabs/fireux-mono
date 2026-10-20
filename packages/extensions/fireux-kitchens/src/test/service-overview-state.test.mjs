import assert from 'node:assert/strict'
import test from 'node:test'
import { serviceOverviewProjection } from './offering-test-helpers.mjs'
const { serviceOverviewSnapshot } = serviceOverviewProjection
const base = {
  kitchenId: 'k',
  outcome: 'ready',
  menusOutcome: 'ready',
  canWrite: true,
  offerings: [],
  menus: [],
}
const configured = (patch = {}) => ({
  id: 'main',
  name: 'Collection',
  enabled: true,
  menu_ids: ['food'],
  interactions: [
    {
      type: 'collection',
      enabled: true,
      notifications: { whatsapp: { recipient_phone: 'PRIVATE' } },
    },
  ],
  ...patch,
})

test('Services presents only the fixed Misebox options, including those not enabled', () => {
  const state = serviceOverviewSnapshot(base)
  assert.deepEqual(
    state.services.map((row) => row.type),
    [
      'collection',
      'delivery',
      'pre_order',
      'table_service',
      'qr_tables',
      'room_service',
      'counter',
    ]
  )
  assert.ok(state.services.every((row) => row.status === 'Not enabled'))
  assert.deepEqual(state.derived.enabledServices, [])
})

test('page JSON describes Enabled, Paused and Off configurations without sensitive operational data', () => {
  const state = serviceOverviewSnapshot({
    ...base,
    offerings: [
      configured(),
      configured({
        id: 'paused',
        name: 'Packed lunch',
        separate: true,
        interactions: [
          { type: 'delivery', enabled: true, availability: { paused: true } },
        ],
      }),
      configured({ id: 'off', enabled: false }),
    ],
  })
  assert.equal(state.services[0].status, 'Enabled')
  assert.equal(state.services[1].status, 'Paused')
  assert.equal(state.services[0].configurations[1].status, 'Off')
  assert.deepEqual(state.derived.enabledServices, ['collection'])
  assert.equal(JSON.stringify(state).includes('PRIVATE'), false)
  assert.equal(JSON.stringify(state).includes('notifications'), false)
})

test('unresolved and failed reads do not publish stale configurations as enabled', () => {
  for (const outcome of ['idle', 'pending', 'error']) {
    const state = serviceOverviewSnapshot({
      ...base,
      outcome,
      offerings: [configured()],
    })
    assert.deepEqual(state.derived.enabledServices, [])
    assert.ok(state.services.every((row) => row.configurations.length === 0))
  }
})

test('published Services state is available to the shared Copy page JSON action', async () => {
  const { readFileSync } = await import('node:fs')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const { ref, computed } = await import('vue')
  const source = readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspacePageState.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  let copied = ''
  const shared = ref(null)
  const usePage = compileFunction(
    stripTypeScriptTypes(source) + ';return useWorkspacePageState',
    ['useRoute', 'useState', 'computed', 'normalizeWorkspace', 'navigator']
  )(
    () => ({ path: '/workspace/kitchen/food-and-drink/services' }),
    () => shared,
    computed,
    (value) => value,
    {
      clipboard: {
        writeText: async (value) => {
          copied = value
        },
      },
    }
  )
  const page = usePage('kitchen')
  page.publish(serviceOverviewSnapshot({ ...base, offerings: [configured()] }))
  await page.copy()
  const payload = JSON.parse(copied)
  assert.equal(payload.page.path, '/workspace/kitchen/food-and-drink/services')
  assert.equal(payload.state.services.length, 7)
  assert.equal(payload.state.services[0].status, 'Enabled')
  assert.deepEqual(payload.state.derived.enabledServices, ['collection'])
})
