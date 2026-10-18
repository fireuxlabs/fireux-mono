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
const { normalizeKitchenOfferings } = load(
  '../runtime/kitchen/utils/offering-policy.ts',
  'normalizeKitchenOfferings',
  {
    ...policy,
    requireOperatingHours,
  }
)
const { kitchenMenuOrdering } = load(
  '../runtime/menu/utils/menu-ordering.ts',
  'kitchenMenuOrdering',
  { normalizeKitchenOfferings }
)
const { patchKitchenOfferingInteraction } = load(
  '../runtime/kitchen/utils/offering-interaction.ts',
  'patchKitchenOfferingInteraction'
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
  '../runtime/kitchen/server/offerings/validation.ts',
  'readOfferingUpdate, requireConfiguredOffering, requireServiceMenus',
  { ...ids, requireOperatingHours, ...core, ...serviceMenuPolicy }
)
const { readInteractionChanges } = load(
  '../runtime/kitchen/server/offerings/interaction-validation.ts',
  'readInteractionChanges',
  {
    ...ids,
    ...interactionValidation,
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
const offering = {
  id: 'breakfast',
  name: 'Breakfast',
  enabled: false,
  menu_ids: ['food'],
  hours,
  interactions: [{ type: 'browse', enabled: true }, interaction],
}
const active = {
  ...offering,
  enabled: true,
  interactions: [{ ...interaction, enabled: true }],
}

test('offering and interaction switches both gate ordering; Menu IDs establish membership', () => {
  for (const value of [
    offering,
    { ...offering, enabled: true },
    { ...active, enabled: false },
  ])
    assert.deepEqual(kitchenMenuOrdering([value], 'food'), {
      enabled: false,
      order_types: [],
    })
  assert.equal(kitchenMenuOrdering([active], 'food').enabled, false)
  assert.equal(kitchenMenuOrdering([active], 'food').order_types.length, 1)
  assert.equal(kitchenMenuOrdering([active], 'renamed-food').enabled, false)
  assert.deepEqual(normalizeKitchenOfferings({ services: [active] }), [])
})

test('same interaction on two named services retains two identities and independent hours', () => {
  const late = {
    ...active,
    id: 'room-offering',
    name: 'Room offering',
    hours: {
      ...hours,
      windows: [{ days: ['friday'], open: '22:00', close: '04:00' }],
    },
  }
  const configs = kitchenMenuOrdering([active, late], 'food').order_types
  assert.deepEqual(
    configs.map((row) => row.kitchen_offering_id),
    ['breakfast', 'room-offering']
  )
  assert.deepEqual(
    configs.map((row) => row.offering_hours.operation_hours.windows[0].open),
    ['17:00', '22:00']
  )
  assert.equal(configs[0].kitchen_offering_name, 'Breakfast')
})

test('malformed stored schedules never acquire a guessed timezone', () => {
  for (const timezone of ['', 'invalid/zone']) {
    const rows = normalizeKitchenOfferings([
      { ...active, hours: { ...hours, timezone } },
    ])
    assert.equal(rows[0].hours, undefined)
    assert.equal(kitchenMenuOrdering(rows, 'food').enabled, false)
  }
})

test('one offering shares its policy across Menus; browse does not grant ordering', () => {
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
    kitchenMenuOrdering([{ ...offering, enabled: true }], 'food').enabled,
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
  const next = patchKitchenOfferingInteraction('pre_order', current, {
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
    offeringId: 'breakfast',
    type: 'pre_order',
    changes: { enabled: false },
  }
  assert.equal(readInteractionChanges(base).changes.enabled, false)
  for (const input of [
    { ...base, databaseId: 'other' },
    { ...base, offeringId: '' },
    { ...base, offeringId: undefined, serviceId: 'breakfast' },
    ...[
      { menu_ids: ['food'] },
      { offering_hours: { inherit_kitchen_operation_hours: true } },
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
    { offering_hours: {} },
  ])
    assert.throws(() =>
      validation.readOfferingUpdate({
        kitchenId: 'k',
        offeringId: 'breakfast',
        changes,
      })
    )
  assert.throws(
    () => validation.requireConfiguredOffering({ ...active, hours: undefined }),
    /hours/
  )
  assert.doesNotThrow(() =>
    validation.requireConfiguredOffering({ ...offering, hours: undefined })
  )
})

function commands({
  denied = false,
  missingMenu = false,
  stored = [offering, { ...offering, id: 'supper' }],
} = {}) {
  const writes = [],
    reads = [],
    trace = []
  const child = offeringHarness(stored)
  const write = (...args) => {
    writes.push(args)
    child.write(...args)
  }
  const tx = {
    readAll: child.readAll,
    create: write,
    read: async (target, id) => {
      reads.push([target, id])
      return {
        exists: !missingMenu && id === 'food',
        data: { status: 'published', format: 'interactive' },
      }
    },
    update: write,
  }
  const dependencies = {
    ...ids,
    ...validation,
    readInteractionChanges,
    normalizeKitchenOfferings,
    ...offeringContract,
    ...offeringReads,
    ...offeringTargets,
    FieldValue: { delete: () => ({ deleted: true }) },
    patchKitchenOfferingInteraction,
    randomUUID: () => 'generated-offering',
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
  const api = {
    ...load(
      '../runtime/kitchen/server/offerings/update.ts',
      'updateKitchenOffering',
      dependencies
    ),
    ...load(
      '../runtime/kitchen/server/offerings/update-interaction.ts',
      'updateKitchenOfferingInteraction',
      dependencies
    ),
  }
  return {
    ...api,
    writes,
    reads,
    trace,
    children: child.children,
    offerings: child.values,
  }
}

test('rename preserves offering identity, sibling services and explicit schedule', async () => {
  const api = commands()
  await api.updateKitchenOffering(
    {},
    {
      kitchenId: 'k',
      offeringId: 'breakfast',
      changes: { name: 'Early breakfast' },
    }
  )
  const rows = api.offerings()
  assert.equal(rows[0].id, 'breakfast')
  assert.equal(rows[0].name, 'Early breakfast')
  assert.deepEqual(rows[0].hours, hours)
  assert.equal(rows[1].name, 'Breakfast')
})

test('membership reads stay in authorized Kitchen; missing Menus prevent enabling', async () => {
  const api = commands()
  await api.updateKitchenOffering(
    {},
    { kitchenId: 'k', offeringId: 'breakfast', changes: { menu_ids: ['food'] } }
  )
  assert.deepEqual(api.reads, [['kitchens/k/menus', 'food']])
  const missing = commands({ missingMenu: true })
  await assert.rejects(
    missing.updateKitchenOffering(
      {},
      { kitchenId: 'k', offeringId: 'breakfast', changes: { enabled: true } }
    ),
    /no longer exists/
  )
  assert.equal(missing.writes.length, 0)
  await missing.updateKitchenOffering(
    {},
    { kitchenId: 'k', offeringId: 'breakfast', changes: { enabled: false } }
  )
  assert.equal(missing.writes.length, 1)
})

test('interaction updates cannot silently select another offering or activate master switch', async () => {
  const api = commands()
  await api.updateKitchenOfferingInteraction(
    {},
    {
      kitchenId: 'k',
      offeringId: 'breakfast',
      type: 'pre_order',
      changes: { enabled: true },
    }
  )
  const rows = api.offerings()
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
    api.updateKitchenOfferingInteraction(
      {},
      {
        kitchenId: 'k',
        offeringId: 'missing',
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
    api.updateKitchenOffering(
      {},
      { kitchenId: 'k', offeringId: 'breakfast', changes: { enabled: false } }
    ),
    /Sign in/
  )
  assert.equal(api.trace.length, 0)
  assert.equal(api.writes.length, 0)
})

test('stored table channel flags survive offering reads and malformed flags cannot enable a channel', () => {
  const read = (table_channels) =>
    normalizeKitchenOfferings([
      {
        id: 'tables',
        name: 'Tables',
        enabled: true,
        menu_ids: ['food'],
        hours,
        interactions: [{ type: 'dine_in', enabled: true, table_channels }],
      },
    ])[0].interactions[0]
  assert.deepEqual(read({ staff_pos: true, table_qr: false }).table_channels, {
    staff_pos: true,
    table_qr: false,
  })
  assert.deepEqual(read({ staff_pos: 'true', table_qr: 1 }).table_channels, {
    staff_pos: false,
    table_qr: false,
  })
  assert.equal(read(undefined).table_channels, undefined)
})

test('renaming preserves all valid saved interaction settings and rejects malformed policy without writes', async () => {
  const configured = {
    ...offering,
    interactions: [
      {
        type: 'pre_order',
        enabled: false,
        notice_hours: 24,
        slot_interval_minutes: 30,
        schedule_horizon_days: 7,
        availability: { paused: false, message: 'Later' },
        notifications: { whatsapp: { enabled: false } },
        fulfilment: {
          handoff_instructions: 'Bar',
          deposit: { type: 'fixed', amount: 5, currency_code: 'CHF' },
        },
      },
    ],
  }
  const api = commands({ stored: [configured] })
  await api.updateKitchenOffering(
    {},
    { kitchenId: 'k', offeringId: 'breakfast', changes: { name: 'Renamed' } }
  )
  assert.deepEqual(api.writes[0][2].interactions, configured.interactions)
  for (const malformed of [
    { slot_interval_minutes: 17 },
    { schedule_horizon_days: 1.5 },
  ]) {
    const bad = commands({
      stored: [
        {
          ...configured,
          interactions: [{ ...configured.interactions[0], ...malformed }],
        },
      ],
    })
    await assert.rejects(
      bad.updateKitchenOffering(
        {},
        {
          kitchenId: 'k',
          offeringId: 'breakfast',
          changes: { name: 'Renamed' },
        }
      ),
      /could not be read/
    )
    assert.equal(bad.writes.length, 0)
  }
})

test('separate identity survives saved and public projection independently of timing', () => {
  const { readKitchenPublicOfferings } = load(
    '../runtime/kitchen/utils/public-offerings.ts',
    'readKitchenPublicOfferings',
    { normalizeKitchenOfferings }
  )
  for (const timing of ['next_day', 'same_day']) {
    const picnic = {
      ...active,
      id: 'picnic',
      name: 'Picnic',
      separate: true,
      collection_timing: timing,
    }
    const data = offeringContract.kitchenOfferingData(picnic)
    assert.equal(
      offeringContract.readKitchenOffering('picnic', data).separate,
      true
    )
    const [guest] = readKitchenPublicOfferings([picnic], 'food')
    assert.equal(guest.separate, true)
    assert.equal(guest.collection_timing, timing)
    assert.equal(
      offeringContract.readKitchenOffering('picnic', {
        ...data,
        separate: 'true',
      }),
      null
    )
  }
})

test('Collection enabled before setup grants no customer service eligibility', () => {
  for (const value of [
    { ...active, menu_ids: [] },
    { ...active, hours: undefined },
  ]) {
    assert.deepEqual(kitchenMenuOrdering([value], 'food').order_types, [])
  }
})

test('Kiosk menu eligibility follows the selected Eat in or Takeaway mode', () => {
  const kiosk = {
    id: 'kiosk',
    name: 'Kiosk',
    enabled: true,
    menu_ids: ['food', 'drinks', 'takeaway-drinks'],
    hours,
    interactions: [
      { type: 'eat_in', enabled: true, menu_ids: ['food', 'drinks'] },
      {
        type: 'takeaway',
        enabled: true,
        menu_ids: ['food', 'takeaway-drinks'],
      },
    ],
  }
  assert.deepEqual(
    kitchenMenuOrdering([kiosk], 'food').order_types.map((row) => row.type),
    ['eat_in', 'takeaway']
  )
  assert.deepEqual(
    kitchenMenuOrdering([kiosk], 'drinks').order_types.map((row) => row.type),
    ['eat_in']
  )
  assert.deepEqual(
    kitchenMenuOrdering([kiosk], 'takeaway-drinks').order_types.map(
      (row) => row.type
    ),
    ['takeaway']
  )
  assert.deepEqual(
    kitchenMenuOrdering([{ ...kiosk, enabled: false }], 'food').order_types,
    []
  )
})
