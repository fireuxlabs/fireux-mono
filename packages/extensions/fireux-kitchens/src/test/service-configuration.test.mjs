import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const errors = {
  createError: (input) => Object.assign(new Error(input.statusMessage), input),
  requireFirestoreDocumentId: (value) => {
    if (typeof value !== 'string' || !value || value.includes('/'))
      throw new Error('Invalid id')
    return value
  },
}
const core = load('utils/weekday-time-core', 'weekdayTimeCore')
const time = load('utils/weekday-time-config', 'weekdayTimeConfig', core)
const hoursValidation = load(
  'kitchen/utils/operating-hours',
  'requireOperatingHours',
  { readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig }
)
const base = load(
  'kitchen/server/services/validation',
  'readServiceUpdate, requireConfiguredService, fail',
  { ...errors, ...hoursValidation }
)
const interactions = load(
  'kitchen/server/services/interaction-validation',
  'readInteractionChanges',
  {
    ...errors,
    KitchenOrderTypes: [
      'collection',
      'delivery',
      'pre_order',
      'eat_in',
      'takeaway',
      'dine_in',
      'room_service',
    ],
  }
)
const patch = load(
  'kitchen/utils/service-interaction',
  'patchKitchenServiceInteraction'
)
const tableChannels = load(
  'kitchen/utils/table-service',
  'tableServiceChannel,tableChannelEnabled,configureTableChannel'
)
const options = load(
  'kitchen/utils/service-options',
  'kitchenServiceOptions, servicesForOption, serviceOptionEnabled',
  tableChannels
)
const hours = {
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['monday'], open: '12:00', close: '22:00' }],
}
const input = (changes = {}) => ({
  kitchenId: 'venue',
  option: 'collection',
  name: 'Collection',
  menu_ids: ['food'],
  hours,
  enabled: true,
  interactions: [
    { type: 'collection', changes: { enabled: true, notice_hours: 0.5 } },
  ],
  ...changes,
})
function harness({
  services = [],
  menu = { status: 'published' },
  authorized = true,
} = {}) {
  const writes = [],
    reads = []
  const command = load(
    'kitchen/server/services/configure',
    'readServiceConfiguration, configureKitchenService',
    {
      ...errors,
      ...base,
      ...interactions,
      ...patch,
      ...options,
      ...tableChannels,
      randomUUID: () => 'new-id',
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenMutationAuthority: async () => {
        if (!authorized) throw new Error('Denied')
        return { rootData: { services }, ownerAppId: 'app' }
      },
      readKitchenServices: (value) => value,
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
      serverKitchenMenusTarget: (kitchenId) => kitchenId + '/menus',
      serverAuditStamp: (value) => value,
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          read: async (target, id) => {
            reads.push({ target, id })
            return { exists: menu !== null, data: menu }
          },
          update: (target, id, data) => writes.push({ target, id, data }),
        }),
    }
  )
  return { ...command, writes, reads }
}
test('first setup writes a fully configured service once, after checking owned menus', async () => {
  const h = harness()
  const result = await h.configureKitchenService({}, input())
  assert.equal(h.writes.length, 1)
  assert.equal(result.service.enabled, true)
  assert.deepEqual(h.reads, [{ target: 'venue/menus', id: 'food' }])
  assert.deepEqual(result.service.menu_ids, ['food'])
  assert.equal(result.service.hours.timezone, 'Europe/Zurich')
  assert.equal(
    result.service.interactions.find((row) => row.type === 'collection')
      .enabled,
    true
  )
})
test('saving an off draft never enables it', async () => {
  const h = harness()
  const result = await h.configureKitchenService({}, input({ enabled: false }))
  assert.equal(result.service.enabled, false)
  assert.equal(
    result.service.interactions.find((row) => row.type === 'collection')
      .enabled,
    false
  )
})
test('invalid setup, unpublished-only menus, missing menus and denied authority never write', async () => {
  for (const [settings, body] of [
    [{}, input({ menu_ids: [] })],
    [{}, input({ hours: { ...hours, windows: [] } })],
    [{ menu: { status: 'draft' } }, input()],
    [
      {
        menu: {
          status: 'published',
          doc: { url: 'https://example.test/menu.pdf' },
        },
      },
      input(),
    ],
    [{ menu: null }, input()],
    [{ authorized: false }, input()],
  ]) {
    const h = harness(settings)
    await assert.rejects(h.configureKitchenService({}, body))
    assert.equal(h.writes.length, 0)
  }
})
test('configuration rejects wrong, duplicate and unsupported interaction settings', async () => {
  for (const value of [
    input({ interactions: [{ type: 'delivery', changes: { enabled: true } }] }),
    input({
      option: 'counter',
      interactions: [
        { type: 'eat_in', changes: { enabled: true } },
        { type: 'eat_in', changes: { enabled: true } },
      ],
    }),
    input({
      interactions: [
        { type: 'collection', changes: { enabled: true, secret: 'no' } },
      ],
    }),
  ]) {
    const h = harness()
    await assert.rejects(h.configureKitchenService({}, value))
    assert.equal(h.writes.length, 0)
  }
})
test('editing one mode preserves other interactions, exact record identity and unrelated offerings', async () => {
  const delivery = {
    type: 'delivery',
    enabled: true,
    notice_hours: 1,
    availability: { paused: true },
  }
  const service = {
    id: 'shared',
    name: 'Dinner',
    enabled: true,
    menu_ids: ['food'],
    hours,
    interactions: [
      delivery,
      {
        type: 'collection',
        enabled: true,
        notifications: { whatsapp: { enabled: false } },
      },
    ],
  }
  const unrelated = { ...service, id: 'other', name: 'Lunch' }
  const h = harness({ services: [service, unrelated] })
  const { service: saved } = await h.configureKitchenService(
    {},
    input({ serviceId: 'shared', name: 'Dinner', enabled: false })
  )
  assert.equal(saved.id, 'shared')
  assert.equal(saved.enabled, true)
  assert.deepEqual(
    saved.interactions.find((row) => row.type === 'delivery'),
    delivery
  )
  assert.equal(
    saved.interactions.find((row) => row.type === 'collection').enabled,
    false
  )
  assert.deepEqual(h.writes[0].data.services[1], unrelated)
})
test('activating shared saved modes requires explicit acknowledgement', async () => {
  const service = {
    id: 'shared',
    name: 'Dinner',
    enabled: false,
    menu_ids: ['food'],
    hours,
    interactions: [
      { type: 'delivery', enabled: true },
      { type: 'collection', enabled: false },
    ],
  }
  const h = harness({ services: [service] })
  await assert.rejects(
    h.configureKitchenService({}, input({ serviceId: 'shared' })),
    /also enables/
  )
  assert.equal(h.writes.length, 0)
  const { service: saved } = await h.configureKitchenService(
    {},
    input({ serviceId: 'shared', activateShared: true })
  )
  assert.equal(saved.enabled, true)
  assert.equal(
    saved.interactions.find((row) => row.type === 'delivery').enabled,
    true
  )
})
test('fixed options reflect existing states without changing records', () => {
  const service = {
    id: 'shared',
    enabled: true,
    interactions: [
      { type: 'collection', enabled: true },
      { type: 'delivery', enabled: false },
    ],
  }
  const before = JSON.stringify(service)
  assert.equal(
    options.serviceOptionEnabled(service, options.kitchenServiceOptions[0]),
    true
  )
  assert.equal(
    options.serviceOptionEnabled(service, options.kitchenServiceOptions[1]),
    false
  )
  assert.deepEqual(
    options.servicesForOption([service], options.kitchenServiceOptions[1]),
    [service]
  )
  assert.equal(JSON.stringify(service), before)
})

test('retries or concurrent first setup cannot create duplicate option records', async () => {
  const h = harness({
    services: [
      {
        id: 'existing',
        name: 'Collection',
        enabled: false,
        menu_ids: ['food'],
        hours,
        interactions: [{ type: 'collection', enabled: false }],
      },
    ],
  })
  await assert.rejects(
    h.configureKitchenService({}, input()),
    /already has saved settings/
  )
  assert.equal(h.writes.length, 0)
})

test('six service cards expose separate staff and guest table channels', () => {
  assert.deepEqual(
    options.kitchenServiceOptions.map((row) => row.label),
    [
      'Collection',
      'Delivery',
      'Pre-order',
      'Table service',
      'QR Tables',
      'Kiosk',
    ]
  )
  const staff = options.kitchenServiceOptions.find(
    (row) => row.key === 'table_service'
  )
  const qr = options.kitchenServiceOptions.find(
    (row) => row.key === 'qr_tables'
  )
  const service = {
    enabled: true,
    interactions: [
      {
        type: 'dine_in',
        enabled: true,
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  assert.equal(options.serviceOptionEnabled(service, staff), true)
  assert.equal(options.serviceOptionEnabled(service, qr), false)
  assert.deepEqual(options.servicesForOption([service], qr), [service])
})

test('table channel configuration reuses menus and hours and preserves the sibling switch', async () => {
  const tableInput = (changes = {}) =>
    input({
      option: 'table_service',
      name: 'Tables',
      interactions: [{ type: 'dine_in', changes: { enabled: true } }],
      ...changes,
    })
  const first = await harness().configureKitchenService({}, tableInput())
  let service = first.service
  assert.deepEqual(
    service.interactions.find((row) => row.type === 'dine_in').table_channels,
    { staff_pos: true, table_qr: false }
  )
  const second = await harness({ services: [service] }).configureKitchenService(
    {},
    tableInput({ serviceId: service.id, option: 'qr_tables' })
  )
  service = second.service
  assert.deepEqual(
    service.interactions.find((row) => row.type === 'dine_in').table_channels,
    { staff_pos: true, table_qr: true }
  )
  assert.deepEqual(service.menu_ids, ['food'])
  assert.deepEqual(service.hours, hours)
  const third = await harness({ services: [service] }).configureKitchenService(
    {},
    tableInput({ serviceId: service.id, enabled: false })
  )
  const dineIn = third.service.interactions.find(
    (row) => row.type === 'dine_in'
  )
  assert.equal(dineIn.enabled, true)
  assert.deepEqual(dineIn.table_channels, { staff_pos: false, table_qr: true })
  const fourth = await harness({
    services: [third.service],
  }).configureKitchenService(
    {},
    tableInput({ serviceId: service.id, option: 'qr_tables', enabled: false })
  )
  assert.equal(
    fourth.service.interactions.find((row) => row.type === 'dine_in').enabled,
    false
  )
  await assert.rejects(
    harness({ services: [service] }).configureKitchenService(
      {},
      tableInput({ option: 'qr_tables' })
    ),
    /already has saved settings/
  )
})

test('legacy table channels preserve availability; switching on an off service does not enable its sibling', () => {
  const legacy = { type: 'dine_in', enabled: true }
  assert.deepEqual(
    tableChannels.configureTableChannel(legacy, 'table_qr', false),
    { enabled: true, table_channels: { staff_pos: true, table_qr: false } }
  )
  assert.deepEqual(
    tableChannels.configureTableChannel(
      { ...legacy, enabled: false },
      'staff_pos',
      true
    ),
    { enabled: true, table_channels: { staff_pos: true, table_qr: false } }
  )
  for (const channels of [
    { staff_pos: true },
    { staff_pos: true, table_qr: 'yes' },
    { staff_pos: true, table_qr: false, unknown: true },
  ]) {
    assert.throws(() =>
      interactions.readInteractionChanges({
        kitchenId: 'venue',
        serviceId: 'tables',
        type: 'dine_in',
        changes: { table_channels: channels },
      })
    )
  }
})
