import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const whatsapp = load(
  '../runtime/kitchen/utils/ordering-whatsapp.ts',
  'readKitchenOrderWhatsAppNotificationPolicy'
)
const policy = load(
  '../runtime/kitchen/utils/ordering-policy.ts',
  'readKitchenOrderTypeConfig',
  {
    KitchenOrderContactFields: ['name', 'phone', 'email'],
    KitchenOrderTypes: [
      'dine_in',
      'eat_in',
      'takeaway',
      'collection',
      'delivery',
      'pre_order',
      'room_service',
    ],
    ...whatsapp,
  }
)
const hours = {
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['friday'], open: '17:00', close: '22:00' }],
}
const core = load('../runtime/utils/weekday-time-core.ts', 'weekdayTimeCore')
const time = load(
  '../runtime/utils/weekday-time-config.ts',
  'weekdayTimeConfig',
  core
)
const { requireOperatingHours } = load(
  '../runtime/kitchen/utils/operating-hours.ts',
  'requireOperatingHours',
  { readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig }
)
const { readKitchenServices } = load(
  '../runtime/kitchen/utils/kitchen-services.ts',
  'readKitchenServices',
  {
    ...policy,
    requireOperatingHours,
  }
)
const { kitchenMenuOrdering } = load(
  '../runtime/menu/utils/menu-ordering.ts',
  'kitchenMenuOrdering',
  { readKitchenServices }
)
const { patchKitchenServiceInteraction } = load(
  '../runtime/kitchen/utils/service-interaction.ts',
  'patchKitchenServiceInteraction'
)
const ids = {
  createError: (input) => Object.assign(new Error(input.statusMessage), input),
  requireFirestoreDocumentId: (value) => {
    if (typeof value !== 'string' || !value || value.includes('/'))
      throw new Error('Invalid id')
    return value
  },
}
const validation = load(
  '../runtime/kitchen/server/services/validation.ts',
  'readServiceCreate, readServiceUpdate, requireConfiguredService',
  { ...ids, requireOperatingHours }
)
const { readInteractionChanges } = load(
  '../runtime/kitchen/server/services/interaction-validation.ts',
  'readInteractionChanges',
  {
    ...ids,
    KitchenOrderTypes: [
      'pre_order',
      'collection',
      'delivery',
      'eat_in',
      'takeaway',
      'dine_in',
      'room_service',
    ],
  }
)
const interaction = { type: 'pre_order', enabled: false, notice_hours: 24 }
const service = {
  id: 'breakfast',
  name: 'Breakfast',
  enabled: false,
  menu_ids: ['food'],
  hours,
  interactions: [{ type: 'browse', enabled: true }, interaction],
}
const active = {
  ...service,
  enabled: true,
  interactions: [{ ...interaction, enabled: true }],
}

test('service and interaction switches both gate ordering; Menu IDs establish membership', () => {
  for (const value of [
    service,
    { ...service, enabled: true },
    { ...active, enabled: false },
  ])
    assert.deepEqual(kitchenMenuOrdering([value], 'food'), {
      enabled: false,
      order_types: [],
    })
  assert.equal(kitchenMenuOrdering([active], 'food').enabled, true)
  assert.equal(kitchenMenuOrdering([active], 'renamed-food').enabled, false)
  assert.deepEqual(readKitchenServices({ services: [active] }), [])
})

test('same interaction on two named services retains two identities and independent hours', () => {
  const late = {
    ...active,
    id: 'room-service',
    name: 'Room service',
    hours: {
      ...hours,
      windows: [{ days: ['friday'], open: '22:00', close: '04:00' }],
    },
  }
  const configs = kitchenMenuOrdering([active, late], 'food').order_types
  assert.deepEqual(
    configs.map((row) => row.kitchen_service_id),
    ['breakfast', 'room-service']
  )
  assert.deepEqual(
    configs.map((row) => row.service_hours.operation_hours.windows[0].open),
    ['17:00', '22:00']
  )
  assert.equal(configs[0].kitchen_service_name, 'Breakfast')
})

test('malformed stored schedules never acquire a guessed timezone', () => {
  for (const timezone of ['', 'invalid/zone']) {
    const rows = readKitchenServices([
      { ...active, hours: { ...hours, timezone } },
    ])
    assert.equal(rows[0].hours, undefined)
    assert.equal(kitchenMenuOrdering(rows, 'food').enabled, false)
  }
})

test('one service shares its policy across Menus; browse does not grant ordering', () => {
  const shared = {
    ...active,
    menu_ids: ['food', 'drinks'],
    interactions: [
      { ...interaction, enabled: true, availability: { paused: true } },
    ],
  }
  assert.deepEqual(
    kitchenMenuOrdering([shared], 'food'),
    kitchenMenuOrdering([shared], 'drinks')
  )
  assert.equal(
    kitchenMenuOrdering([shared], 'food').order_types[0].availability.paused,
    true
  )
  assert.equal(
    kitchenMenuOrdering([{ ...service, enabled: true }], 'food').enabled,
    false
  )
})

test('interaction patches preserve fields, false, zero notice and deposit removal', () => {
  const current = {
    ...interaction,
    availability: { paused: true, message: 'Closed' },
    fulfilment: {
      handoff_instructions: 'Bar',
      deposit: { type: 'fixed', amount: 5 },
    },
  }
  const next = patchKitchenServiceInteraction('pre_order', current, {
    notice_hours: 0,
    availability: { paused: false },
    fulfilment: { deposit: null },
  })
  assert.deepEqual(next.availability, { paused: false, message: 'Closed' })
  assert.deepEqual(next.fulfilment, { handoff_instructions: 'Bar' })
  assert.equal(next.enabled, false)
  assert.equal(next.asap_enabled, false)
  assert.equal(next.notice_hours, 0)
  assert.equal(current.fulfilment.deposit.amount, 5)
})

test('requests reject retired policy fields, arbitrary database selection and malformed schedules', () => {
  const base = {
    kitchenId: 'k',
    serviceId: 'breakfast',
    type: 'pre_order',
    changes: { enabled: false },
  }
  assert.equal(readInteractionChanges(base).changes.enabled, false)
  for (const input of [
    { ...base, databaseId: 'other' },
    { ...base, serviceId: '' },
    ...[
      { menu_ids: ['food'] },
      { service_hours: { inherit_kitchen_operation_hours: true } },
      { enabled: 'yes' },
      { notice_hours: -1 },
      { fulfilment: { payment_methods: ['cash'] } },
    ].map((changes) => ({ ...base, changes })),
    { ...base, type: 'browse', changes: { notice_hours: 1 } },
  ])
    assert.throws(() => readInteractionChanges(input))
  for (const changes of [
    { menu_ids: ['x/y'] },
    { hours: { ...hours, timezone: 'bad/zone' } },
    { hours: { ...hours, windows: [] } },
    { service_hours: {} },
  ])
    assert.throws(() =>
      validation.readServiceUpdate({
        kitchenId: 'k',
        serviceId: 'breakfast',
        changes,
      })
    )
  assert.throws(
    () => validation.requireConfiguredService({ ...active, hours: undefined }),
    /hours/
  )
  assert.doesNotThrow(() =>
    validation.requireConfiguredService({ ...service, hours: undefined })
  )
})

function commands({
  denied = false,
  missingMenu = false,
  stored = [service, { ...service, id: 'supper' }],
} = {}) {
  const writes = [],
    reads = [],
    trace = []
  const tx = {
    read: async (target, id) => {
      reads.push([target, id])
      return { exists: !missingMenu && id === 'food' }
    },
    update: (...args) => writes.push(args),
  }
  const api = load(
    '../runtime/kitchen/server/services/commands.ts',
    'createKitchenService, updateKitchenService, updateKitchenServiceInteraction',
    {
      ...ids,
      ...validation,
      readInteractionChanges,
      readKitchenServices,
      patchKitchenServiceInteraction,
      randomUUID: () => 'generated-service',
      runGuardedServerTransaction: async (_, fn) => {
        trace.push('transaction')
        return fn(tx)
      },
      readKitchenMutationActor: async () => {
        if (denied) throw new Error('Sign in')
        return { uid: 'actor' }
      },
      requireKitchenMutationAuthority: async (_, actor, id) => {
        assert.equal(id, 'k')
        trace.push('authority')
        return { rootData: { services: stored }, ownerAppId: 'app' }
      },
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
      serverKitchenMenusTarget: (id) => `kitchens/${id}/menus`,
      serverAuditStamp: (value) => value,
    }
  )
  return { ...api, writes, reads, trace }
}

test('creation starts disabled and has its own stable identity with browse only', async () => {
  const api = commands()
  const result = await api.createKitchenService(
    {},
    { kitchenId: 'k', name: '  Breakfast  ' }
  )
  assert.deepEqual(result.service, {
    id: 'generated-service',
    name: 'Breakfast',
    enabled: false,
    menu_ids: [],
    interactions: [{ type: 'browse', enabled: true }],
  })
  assert.deepEqual(Object.keys(api.writes[0][2]), ['services', 'updated'])
  assert.equal(api.writes[0][2].services.length, 3)
})

test('rename preserves service identity, sibling services and explicit schedule', async () => {
  const api = commands()
  await api.updateKitchenService(
    {},
    {
      kitchenId: 'k',
      serviceId: 'breakfast',
      changes: { name: 'Early breakfast' },
    }
  )
  const rows = api.writes[0][2].services
  assert.equal(rows[0].id, 'breakfast')
  assert.equal(rows[0].name, 'Early breakfast')
  assert.deepEqual(rows[0].hours, hours)
  assert.equal(rows[1].name, 'Breakfast')
})

test('membership reads stay in authorized Kitchen; missing Menus prevent enabling', async () => {
  const api = commands()
  await api.updateKitchenService(
    {},
    { kitchenId: 'k', serviceId: 'breakfast', changes: { menu_ids: ['food'] } }
  )
  assert.deepEqual(api.reads, [['kitchens/k/menus', 'food']])
  const missing = commands({ missingMenu: true })
  await assert.rejects(
    missing.updateKitchenService(
      {},
      { kitchenId: 'k', serviceId: 'breakfast', changes: { enabled: true } }
    ),
    /no longer exists/
  )
  assert.equal(missing.writes.length, 0)
  await missing.updateKitchenService(
    {},
    { kitchenId: 'k', serviceId: 'breakfast', changes: { enabled: false } }
  )
  assert.equal(missing.writes.length, 1)
})

test('interaction updates cannot silently select another service or activate master switch', async () => {
  const api = commands()
  await api.updateKitchenServiceInteraction(
    {},
    {
      kitchenId: 'k',
      serviceId: 'breakfast',
      type: 'pre_order',
      changes: { enabled: true },
    }
  )
  const rows = api.writes[0][2].services
  assert.equal(rows[0].enabled, false)
  assert.equal(
    rows[0].interactions.find((row) => row.type === 'pre_order').enabled,
    true
  )
  assert.equal(
    rows[1].interactions.find((row) => row.type === 'pre_order').enabled,
    false
  )
  await assert.rejects(
    api.updateKitchenServiceInteraction(
      {},
      {
        kitchenId: 'k',
        serviceId: 'missing',
        type: 'pre_order',
        changes: { enabled: false },
      }
    ),
    /not found/
  )
})

test('unauthenticated requests do not start transactions', async () => {
  const api = commands({ denied: true })
  await assert.rejects(
    api.updateKitchenService(
      {},
      { kitchenId: 'k', serviceId: 'breakfast', changes: { enabled: false } }
    ),
    /Sign in/
  )
  assert.equal(api.trace.length, 0)
  assert.equal(api.writes.length, 0)
})
