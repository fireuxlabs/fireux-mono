import {
  serviceMenuPolicy,
  offeringContract,
  offeringReads,
  offeringTargets,
  offeringHarness,
  interactionValidation,
} from './offering-test-helpers.mjs'
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
  'kitchen/server/offerings/validation',
  'readOfferingUpdate, requireConfiguredOffering, requireServiceMenus, fail',
  { ...errors, ...hoursValidation, ...core, ...serviceMenuPolicy }
)
const interactions = load(
  'kitchen/server/offerings/interaction-validation',
  'readInteractionChanges',
  {
    ...errors,
    ...interactionValidation,
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
  'kitchen/utils/offering-interaction',
  'patchKitchenOfferingInteraction'
)
const tableChannels = load(
  'kitchen/utils/table-service',
  'tableServiceChannel,tableChannelEnabled,configureTableChannel'
)
const options = load(
  'kitchen/utils/offering-options',
  'kitchenOfferingOptions, offeringsForOption, offeringOptionEnabled, offeringOptionStatus',
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
  menu = { status: 'published', format: 'interactive' },
  authorized = true,
} = {}) {
  const writes = [],
    reads = []
  const child = offeringHarness(services)
  const write = (target, id, data) => {
    writes.push({ target, id, data })
    child.write(target, id, data)
  }
  const command = load(
    'kitchen/server/offerings/configure',
    'readOfferingConfiguration, configureKitchenOffering',
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
      ...offeringContract,
      ...offeringReads,
      ...offeringTargets,
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
      serverKitchenMenusTarget: (kitchenId) => kitchenId + '/menus',
      serverAuditStamp: (value) => value,
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          readAll: child.readAll,
          create: write,
          read: async (target, id) => {
            reads.push({ target, id })
            return { exists: menu !== null, data: menu }
          },
          update: write,
        }),
    }
  )
  return {
    ...command,
    writes,
    reads,
    children: child.children,
    offerings: child.values,
  }
}
test('first setup writes a fully configured offering once, after checking owned menus', async () => {
  const h = harness()
  const result = await h.configureKitchenOffering({}, input())
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0].target.collectionPath, 'kitchens/venue/offerings')
  assert.equal(h.writes[0].id, result.offering.id)
  assert.equal('services' in h.writes[0].data, false)
  assert.equal('id' in h.writes[0].data, false)
  assert.equal(result.offering.enabled, true)
  assert.deepEqual(h.reads, [{ target: 'venue/menus', id: 'food' }])
  assert.deepEqual(result.offering.menu_ids, ['food'])
  assert.equal(result.offering.hours.timezone, 'Europe/Zurich')
  assert.equal(
    result.offering.interactions.find((row) => row.type === 'collection')
      .enabled,
    true
  )
})
test('saving an off draft never enables it', async () => {
  const h = harness()
  const result = await h.configureKitchenOffering({}, input({ enabled: false }))
  assert.equal(result.offering.enabled, false)
  assert.equal(
    result.offering.interactions.find((row) => row.type === 'collection')
      .enabled,
    false
  )
})

test('explicit pickup draft uses official hours while leaving an existing test offering off', async () => {
  const websiteTest = {
    id: 'website-test',
    name: 'Website test',
    enabled: false,
    menu_ids: ['food'],
    hours,
    interactions: [{ type: 'collection', enabled: true }],
  }
  const draft = {
    id: 'pickup-draft',
    name: 'Bären pickup',
    enabled: false,
    menu_ids: [],
    interactions: [{ type: 'browse', enabled: true }],
  }
  const pickupHours = {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [
      {
        days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        open: '16:00',
        close: '22:30',
      },
      { days: ['sunday'], open: '12:15', close: '20:30' },
    ],
  }
  const h = harness({ services: [websiteTest, draft] })
  const result = await h.configureKitchenOffering(
    {},
    input({
      offeringId: draft.id,
      name: draft.name,
      hours: pickupHours,
      enabled: false,
    })
  )
  assert.deepEqual(
    h.offerings().find((row) => row.id === websiteTest.id),
    websiteTest
  )
  assert.equal(result.offering.id, draft.id)
  assert.equal(result.offering.enabled, false)
  assert.deepEqual(result.offering.hours, pickupHours)
  assert.deepEqual(result.offering.menu_ids, ['food'])
  assert.deepEqual(h.reads, [{ target: 'venue/menus', id: 'food' }])
})
test('invalid setup, unpublished-only menus, missing menus and denied authority never write', async () => {
  for (const [settings, body] of [
    [{}, input({ menu_ids: [] })],
    [{}, input({ hours: { ...hours, windows: [] } })],
    [{ menu: { status: 'draft', format: 'interactive' } }, input()],
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
    await assert.rejects(h.configureKitchenOffering({}, body))
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
    await assert.rejects(h.configureKitchenOffering({}, value))
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
  const offering = {
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
  const unrelated = { ...offering, id: 'other', name: 'Lunch' }
  const h = harness({ services: [offering, unrelated] })
  const { offering: saved } = await h.configureKitchenOffering(
    {},
    input({ offeringId: 'shared', name: 'Dinner', enabled: false })
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
  assert.deepEqual(
    h.children.get(unrelated.id),
    offeringContract.kitchenOfferingData(unrelated)
  )
  assert.notEqual(h.writes[0].id, unrelated.id)
})
test('activating shared saved modes requires explicit acknowledgement', async () => {
  const offering = {
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
  const h = harness({ services: [offering] })
  await assert.rejects(
    h.configureKitchenOffering({}, input({ offeringId: 'shared' })),
    /also enables/
  )
  assert.equal(h.writes.length, 0)
  const { offering: saved } = await h.configureKitchenOffering(
    {},
    input({ offeringId: 'shared', activateShared: true })
  )
  assert.equal(saved.enabled, true)
  assert.equal(
    saved.interactions.find((row) => row.type === 'delivery').enabled,
    true
  )
})
test('fixed options reflect existing states without changing records', () => {
  const offering = {
    id: 'shared',
    enabled: true,
    interactions: [
      { type: 'collection', enabled: true },
      { type: 'delivery', enabled: false },
    ],
  }
  const before = JSON.stringify(offering)
  assert.equal(
    options.offeringOptionEnabled(offering, options.kitchenOfferingOptions[0]),
    true
  )
  assert.equal(
    options.offeringOptionEnabled(offering, options.kitchenOfferingOptions[1]),
    false
  )
  assert.deepEqual(
    options.offeringsForOption([offering], options.kitchenOfferingOptions[1]),
    [offering]
  )
  assert.equal(JSON.stringify(offering), before)
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
    h.configureKitchenOffering({}, input()),
    /already has saved settings/
  )
  assert.equal(h.writes.length, 0)
})

test('six offering cards expose separate staff and guest table channels', () => {
  assert.deepEqual(
    options.kitchenOfferingOptions.map((row) => row.label),
    [
      'Collection',
      'Delivery',
      'Pre-order',
      'Table service',
      'QR table ordering',
      'Kiosk',
    ]
  )
  const staff = options.kitchenOfferingOptions.find(
    (row) => row.key === 'table_service'
  )
  const qr = options.kitchenOfferingOptions.find(
    (row) => row.key === 'qr_tables'
  )
  const offering = {
    enabled: true,
    interactions: [
      {
        type: 'dine_in',
        enabled: true,
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  assert.equal(options.offeringOptionEnabled(offering, staff), true)
  assert.equal(options.offeringOptionEnabled(offering, qr), false)
  assert.deepEqual(options.offeringsForOption([offering], qr), [offering])
})

test('table channel configuration reuses menus and hours and preserves the sibling switch', async () => {
  const tableInput = (changes = {}) =>
    input({
      option: 'table_service',
      name: 'Tables',
      interactions: [{ type: 'dine_in', changes: { enabled: true } }],
      ...changes,
    })
  const first = await harness().configureKitchenOffering({}, tableInput())
  let offering = first.offering
  assert.deepEqual(
    offering.interactions.find((row) => row.type === 'dine_in').table_channels,
    { staff_pos: true, table_qr: false }
  )
  const second = await harness({
    services: [offering],
  }).configureKitchenOffering(
    {},
    tableInput({ offeringId: offering.id, option: 'qr_tables' })
  )
  offering = second.offering
  assert.deepEqual(
    offering.interactions.find((row) => row.type === 'dine_in').table_channels,
    { staff_pos: true, table_qr: true }
  )
  assert.deepEqual(offering.menu_ids, ['food'])
  assert.deepEqual(offering.hours, hours)
  const third = await harness({
    services: [offering],
  }).configureKitchenOffering(
    {},
    tableInput({ offeringId: offering.id, enabled: false })
  )
  const dineIn = third.offering.interactions.find(
    (row) => row.type === 'dine_in'
  )
  assert.equal(dineIn.enabled, true)
  assert.deepEqual(dineIn.table_channels, { staff_pos: false, table_qr: true })
  const fourth = await harness({
    services: [third.offering],
  }).configureKitchenOffering(
    {},
    tableInput({ offeringId: offering.id, option: 'qr_tables', enabled: false })
  )
  assert.equal(
    fourth.offering.interactions.find((row) => row.type === 'dine_in').enabled,
    false
  )
  await assert.rejects(
    harness({ services: [offering] }).configureKitchenOffering(
      {},
      tableInput({ option: 'qr_tables' })
    ),
    /already has saved settings/
  )
})

test('legacy table channels preserve availability; switching on an off offering does not enable its sibling', () => {
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
        offeringId: 'tables',
        type: 'dine_in',
        changes: { table_channels: channels },
      })
    )
  }
})

test('overview groups separate services by interaction regardless of collection timing', () => {
  const picnic = {
    id: 'picnic',
    separate: true,
    enabled: true,
    interactions: [
      { type: 'collection', enabled: true },
      { type: 'delivery', enabled: true },
    ],
  }
  for (const timing of ['next_day', 'same_day', 'next_day']) {
    picnic.collection_timing = timing
    for (const option of options.kitchenOfferingOptions)
      assert.deepEqual(
        options.offeringsForOption([picnic], option),
        ['collection', 'delivery'].includes(option.key) ? [picnic] : []
      )
  }
})

test('each overview row distinguishes On, Off and Paused without hiding disabled records', () => {
  const option = options.kitchenOfferingOptions[0]
  const service = {
    id: 'concept',
    enabled: true,
    separate: true,
    interactions: [
      { type: 'collection', enabled: true, availability: { paused: true } },
    ],
  }
  assert.equal(options.offeringOptionStatus(service, option), 'Paused')
  assert.equal(options.offeringsForOption([service], option).length, 1)
  service.enabled = false
  assert.equal(options.offeringOptionStatus(service, option), 'Off')
  assert.equal(options.offeringsForOption([service], option).length, 1)
  service.enabled = true
  service.interactions[0].availability.paused = false
  assert.equal(options.offeringOptionStatus(service, option), 'On')
})
