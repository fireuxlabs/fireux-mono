import {
  serviceHoursPolicy,
  testKitchenHours,
} from './offering-test-helpers.mjs'
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
  parentHours = testKitchenHours(),
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
      ...serviceHoursPolicy,
      resolveKitchenOperationHours: () => parentHours,
      FieldValue: { delete: () => ({ deleted: true }) },
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
test('invalid hours, ineligible menus, missing menus and denied authority never write', async () => {
  for (const [settings, body] of [
    [{}, input({ hours: { ...hours, windows: [] } })],
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
test('a service cannot configure another service record', async () => {
  const delivery = {
    id: 'delivery',
    name: 'Delivery',
    enabled: true,
    menu_ids: ['food'],
    hours,
    interactions: [{ type: 'delivery', enabled: true }],
  }
  const h = harness({ services: [delivery] })
  await assert.rejects(
    h.configureKitchenOffering({}, input({ offeringId: delivery.id })),
    /different service/
  )
  assert.deepEqual(h.writes, [])
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

test('provided service cards expose separate staff and guest table channels', () => {
  assert.deepEqual(
    options.kitchenOfferingOptions.map((row) => row.label),
    [
      'Collection',
      'Delivery',
      'Pre-order',
      'Table service',
      'QR table ordering',
      'Room service',
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
  assert.deepEqual(options.offeringsForOption([offering], qr), [])
  assert.deepEqual(options.offeringsForOption([offering], staff), [offering])
})

test('Table service and QR table ordering have independent menus, hours and activation', async () => {
  const staff = {
    id: 'staff',
    name: 'Dinner',
    enabled: true,
    menu_ids: ['food'],
    hours,
    interactions: [
      {
        type: 'dine_in',
        enabled: true,
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  const qr = {
    ...staff,
    id: 'qr',
    interactions: [
      {
        type: 'dine_in',
        enabled: true,
        table_channels: { staff_pos: false, table_qr: true },
      },
    ],
  }
  const h = harness({ services: [staff, qr] })
  const untouched = structuredClone(h.children.get('qr'))
  const body = {
    kitchenId: 'venue',
    offeringId: 'staff',
    option: 'table_service',
    enabled: true,
    interactions: [{ type: 'dine_in', changes: {} }],
  }
  const changedHours = {
    ...hours,
    windows: [{ days: ['sunday'], open: '10:00', close: '12:00' }],
  }
  await h.configureKitchenOffering(
    {},
    { ...body, menu_ids: ['drinks'], hours: changedHours }
  )
  const off = await h.configureKitchenOffering({}, { ...body, enabled: false })
  assert.equal(off.offering.enabled, false)
  assert.deepEqual(off.offering.menu_ids, ['drinks'])
  assert.deepEqual(off.offering.hours, changedHours)
  const option = options.kitchenOfferingOptions.find(
    (row) => row.key === 'table_service'
  )
  assert.deepEqual(options.offeringsForOption([off.offering, qr], option), [
    off.offering,
  ])
  assert.deepEqual(h.children.get('qr'), untouched)
  await assert.rejects(
    h.configureKitchenOffering({}, { ...body, offeringId: 'qr' }),
    /different service/
  )
  const qrOption = options.kitchenOfferingOptions.find(
    (row) => row.key === 'qr_tables'
  )
  assert.deepEqual(options.offeringsForOption([off.offering, qr], qrOption), [
    qr,
  ])
})

test('turning a table setup off preserves its service identity', () => {
  assert.deepEqual(tableChannels.configureTableChannel('table_qr', false), {
    enabled: false,
    table_channels: { staff_pos: false, table_qr: true },
  })
  assert.deepEqual(tableChannels.configureTableChannel('staff_pos', true), {
    enabled: true,
    table_channels: { staff_pos: true, table_qr: false },
  })
})

test('first QR setup is independent of an existing staff table setup', async () => {
  const staff = {
    id: 'staff',
    name: 'Tables',
    enabled: true,
    menu_ids: ['food'],
    hours,
    interactions: [
      {
        type: 'dine_in',
        enabled: true,
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  const h = harness({ services: [staff] })
  const created = await h.configureKitchenOffering(
    {},
    input({
      option: 'qr_tables',
      interactions: [{ type: 'dine_in', changes: {} }],
    })
  )
  assert.notEqual(created.offering.id, staff.id)
  assert.deepEqual(
    created.offering.interactions.find((row) => row.type === 'dine_in')
      .table_channels,
    { staff_pos: false, table_qr: true }
  )
  assert.deepEqual(
    h.children.get('staff'),
    offeringContract.kitchenOfferingData(staff)
  )
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

test('Collection can be enabled first, then configured incrementally without replacing untouched fields', async () => {
  const h = harness()
  const on = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      option: 'collection',
      enabled: true,
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  assert.equal(on.offering.enabled, true)
  assert.deepEqual(on.offering.menu_ids, [])
  assert.equal(on.offering.hours, undefined)
  const selected = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      offeringId: on.offering.id,
      option: 'collection',
      enabled: true,
      menu_ids: ['food'],
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  const timed = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      offeringId: on.offering.id,
      option: 'collection',
      enabled: true,
      hours,
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  assert.deepEqual(selected.offering.menu_ids, ['food'])
  assert.deepEqual(timed.offering.menu_ids, ['food'])
  assert.deepEqual(timed.offering.hours, hours)
  const off = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      offeringId: on.offering.id,
      option: 'collection',
      enabled: false,
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  assert.equal(
    off.offering.interactions.find((row) => row.type === 'collection').enabled,
    false
  )
  assert.deepEqual(off.offering.menu_ids, ['food'])
  assert.deepEqual(off.offering.hours, hours)
})

test('Collection can select a draft menu while customer publication remains separate', async () => {
  const h = harness({ menu: { status: 'draft', format: 'interactive' } })
  const result = await h.configureKitchenOffering({}, input())
  assert.equal(result.offering.enabled, true)
  assert.deepEqual(result.offering.menu_ids, ['food'])
})

test('Collection can be turned off even when a previously selected menu has disappeared', async () => {
  const h = harness({
    menu: null,
    services: [
      {
        id: 'pickup',
        name: 'Collection',
        enabled: true,
        menu_ids: ['missing'],
        hours,
        interactions: [{ type: 'collection', enabled: true }],
      },
    ],
  })
  const result = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      offeringId: 'pickup',
      option: 'collection',
      enabled: false,
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  assert.equal(result.offering.interactions[0].enabled, false)
  assert.deepEqual(h.reads, [])
})

test('clearing Collection hours removes the stored field and retains its menus', async () => {
  const h = harness({
    services: [
      {
        id: 'pickup',
        name: 'Collection',
        enabled: true,
        menu_ids: ['food'],
        hours,
        interactions: [{ type: 'collection', enabled: true }],
      },
    ],
  })
  const result = await h.configureKitchenOffering(
    {},
    {
      kitchenId: 'venue',
      offeringId: 'pickup',
      option: 'collection',
      enabled: true,
      hours: null,
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  assert.equal(result.offering.hours, undefined)
  assert.deepEqual(result.offering.menu_ids, ['food'])
  assert.deepEqual(h.writes[0].data.hours, { deleted: true })
})

test('each provided service supports On before configuration and sparse automatic updates', async () => {
  for (const option of options.kitchenOfferingOptions) {
    const h = harness()
    const body = {
      kitchenId: 'venue',
      option: option.key,
      enabled: true,
      interactions: option.types.map((type) => ({ type, changes: {} })),
    }
    const first = await h.configureKitchenOffering({}, body)
    assert.equal(first.offering.enabled, true, option.key)
    assert.deepEqual(first.offering.menu_ids, [])
    assert.equal(first.offering.hours, undefined)
    const selected = await h.configureKitchenOffering(
      {},
      {
        ...body,
        offeringId: first.offering.id,
        ...(option.key === 'counter'
          ? {
              interactions: body.interactions.map((row) => ({
                ...row,
                changes: { menu_ids: ['food'] },
              })),
            }
          : { menu_ids: ['food'] }),
      }
    )
    const timed = await h.configureKitchenOffering(
      {},
      { ...body, offeringId: first.offering.id, hours }
    )
    assert.deepEqual(timed.offering.menu_ids, selected.offering.menu_ids)
    const off = await h.configureKitchenOffering(
      {},
      { ...body, offeringId: first.offering.id, enabled: false }
    )
    assert.equal(off.offering.enabled, false, option.key)
    assert.deepEqual(off.offering.menu_ids, ['food'])
    assert.deepEqual(off.offering.hours, hours)
  }
})

test('Kiosk always supports both modes and retains their menus while off', async () => {
  const h = harness({
    services: [
      {
        id: 'kiosk',
        name: 'Kiosk',
        enabled: true,
        menu_ids: ['food'],
        hours,
        interactions: [
          { type: 'eat_in', enabled: true, menu_ids: ['food'] },
          { type: 'takeaway', enabled: false, menu_ids: [] },
        ],
      },
    ],
  })
  const body = {
    kitchenId: 'venue',
    offeringId: 'kiosk',
    option: 'counter',
    enabled: false,
    interactions: [
      { type: 'eat_in', changes: {} },
      { type: 'takeaway', changes: {} },
    ],
  }
  const off = await h.configureKitchenOffering({}, body)
  assert.equal(off.offering.enabled, false)
  assert.equal(
    off.offering.interactions.find((row) => row.type === 'eat_in').enabled,
    true
  )
  const on = await h.configureKitchenOffering({}, { ...body, enabled: true })
  assert.equal(
    on.offering.interactions.find((row) => row.type === 'eat_in').enabled,
    true
  )
  assert.equal(
    on.offering.interactions.find((row) => row.type === 'takeaway').enabled,
    true
  )
  const switched = await h.configureKitchenOffering(
    {},
    {
      ...body,
      enabled: true,
      interactions: [
        { type: 'eat_in', changes: {} },
        { type: 'takeaway', changes: { enabled: false } },
      ],
    }
  )
  assert.equal(
    switched.offering.interactions.find((row) => row.type === 'eat_in').enabled,
    true
  )
  assert.equal(
    switched.offering.interactions.find((row) => row.type === 'takeaway')
      .enabled,
    true
  )
})

test('Kiosk keeps independent mode menus, validates selections and retains them while off', async () => {
  const h = harness()
  const body = {
    kitchenId: 'venue',
    option: 'counter',
    enabled: true,
    hours,
    interactions: [
      { type: 'eat_in', changes: { enabled: true, menu_ids: ['food'] } },
      { type: 'takeaway', changes: { enabled: true, menu_ids: ['drinks'] } },
    ],
  }
  const first = await h.configureKitchenOffering({}, body)
  assert.deepEqual(first.offering.menu_ids, ['food', 'drinks'])
  assert.deepEqual(
    first.offering.interactions.find((row) => row.type === 'eat_in').menu_ids,
    ['food']
  )
  assert.deepEqual(
    first.offering.interactions.find((row) => row.type === 'takeaway').menu_ids,
    ['drinks']
  )
  const changed = await h.configureKitchenOffering(
    {},
    {
      ...body,
      offeringId: first.offering.id,
      interactions: [
        { type: 'eat_in', changes: {} },
        { type: 'takeaway', changes: { menu_ids: [] } },
      ],
    }
  )
  assert.deepEqual(changed.offering.menu_ids, ['food'])
  assert.deepEqual(
    changed.offering.interactions.find((row) => row.type === 'eat_in').menu_ids,
    ['food']
  )
  const off = await h.configureKitchenOffering(
    {},
    {
      ...body,
      offeringId: first.offering.id,
      enabled: false,
      interactions: [
        { type: 'eat_in', changes: {} },
        { type: 'takeaway', changes: {} },
      ],
    }
  )
  assert.deepEqual(off.offering.menu_ids, ['food'])
  await assert.rejects(
    h.configureKitchenOffering({}, { ...body, menu_ids: ['food'] }),
    /separately/
  )
  await assert.rejects(
    harness({ menu: null }).configureKitchenOffering(
      {},
      {
        ...body,
        interactions: [
          { type: 'eat_in', changes: { menu_ids: ['missing'] } },
          { type: 'takeaway', changes: {} },
        ],
      }
    ),
    /no longer exists/
  )
})

test('service hours can inherit, switch to custom and return to inheritance', async () => {
  const h = harness()
  const body = {
    kitchenId: 'venue',
    option: 'collection',
    enabled: true,
    interactions: [{ type: 'collection', changes: {} }],
  }
  const first = await h.configureKitchenOffering({}, body)
  assert.equal(first.offering.hours_source, 'kitchen')
  assert.equal(first.offering.hours, undefined)
  const custom = await h.configureKitchenOffering(
    {},
    { ...body, offeringId: first.offering.id, hours_source: 'custom', hours }
  )
  assert.equal(custom.offering.hours_source, 'custom')
  assert.deepEqual(custom.offering.hours, hours)
  const inherited = await h.configureKitchenOffering(
    {},
    {
      ...body,
      offeringId: first.offering.id,
      hours_source: 'kitchen',
      hours: null,
    }
  )
  assert.equal(inherited.offering.hours_source, 'kitchen')
  assert.equal(inherited.offering.hours, undefined)
  assert.equal(h.children.get(first.offering.id).hours, undefined)
})

test('custom service hours cannot extend beyond the Kitchen schedule', async () => {
  const parentHours = {
    ...hours,
    windows: [{ days: ['monday'], open: '12:00', close: '18:00' }],
  }
  const h = harness({ parentHours })
  await assert.rejects(
    h.configureKitchenOffering({}, input()),
    /within Kitchen service hours/
  )
  assert.deepEqual(h.writes, [])
})
