import {
  serviceHoursPolicy,
  testKitchenHours,
} from './offering-test-helpers.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  loadOfferingSource as load,
  serviceMenuPolicy,
  offeringContract,
  offeringReads,
  offeringTargets,
  interactionValidation,
} from './offering-test-helpers.mjs'

function core(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/' + path + '.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return {' + names + '}',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const { isFirestoreDocumentId } = core(
  'utils/firestore-document-id',
  'isFirestoreDocumentId'
)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !isFirestoreDocumentId(value))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid document id.',
    })
  return value.trim()
}
const errors = { createError, requireFirestoreDocumentId }
const timeCore = load('utils/weekday-time-core', 'weekdayTimeCore')
const time = load('utils/weekday-time-config', 'weekdayTimeConfig', timeCore)
const hoursValidation = load(
  'kitchen/utils/operating-hours',
  'requireOperatingHours',
  {
    readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig,
  }
)
const validation = load(
  'kitchen/server/offerings/validation',
  'readOfferingUpdate, requireConfiguredOffering, requireServiceMenus, fail',
  { ...errors, ...hoursValidation, ...timeCore, ...serviceMenuPolicy }
)
const interactionInput = load(
  'kitchen/server/offerings/interaction-validation',
  'readInteractionChanges',
  {
    ...errors,
    ...interactionValidation,
    KitchenOrderTypes: [
      'collection',
      'delivery',
      'pre_order',
      'dine_in',
      'eat_in',
      'takeaway',
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
  'tableServiceChannel, configureTableChannel, tableChannelEnabled'
)
const options = load(
  'kitchen/utils/offering-options',
  'kitchenOfferingOptions',
  tableChannels
)
const { readMembershipAccessIds } = core(
  'app/utils/membership-access',
  'readMembershipAccessIds'
)
const { readKitchenAccessIds } = load(
  'kitchen/utils/kitchen-access',
  'readKitchenAccessIds',
  {
    readMembershipAccessIds,
    KITCHEN_USER_LIMIT: 500,
  }
)
const authority = load(
  'kitchen/server/core/mutation-authority',
  'requireKitchenMutationAuthority',
  {
    createError,
    readKitchenAccessIds,
    serverAppUsersTarget: (app) => 'apps/' + app + '/users',
    serverKitchenAccessTarget: () => 'kitchen_access',
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
PLACE_MUTATION_TARGETS: { places: 'places' },
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
  }
)
const hours = () => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['friday'], open: '17:00', close: '22:00' }],
})
const changes = () => ({
  enabled: true,
  notice_hours: 0,
  message: 'Welcome',
  asap_enabled: true,
  slot_interval_minutes: 30,
  schedule_horizon_days: 7,
  fulfilment: {
    handoff_instructions: 'Bar',
    deposit: {
      type: 'percent',
      amount: 25,
      currency_code: 'CHF',
      label: 'Deposit',
    },
  },
  customer: { required_fields: ['name', 'phone'] },
  availability: { paused: false, message: 'Open' },
  notifications: {
    whatsapp: { enabled: true, recipient_phone: '+41791234567' },
  },
})
const saved = (extra = {}) => ({
  id: 'saved',
  name: 'Dinner',
  enabled: false,
  menu_ids: ['food'],
  hours: hours(),
  interactions: [
    { type: 'browse', enabled: true },
    { type: 'collection', enabled: false },
  ],
  ...extra,
})
const interaction = () => ({
  kitchenId: 'k',
  offeringId: 'saved',
  type: 'collection',
  changes: changes(),
})
const configure = () => ({
  kitchenId: 'k',
  option: 'collection',
  name: 'Dinner',
  menu_ids: ['food'],
  hours: hours(),
  enabled: true,
  interactions: [{ type: 'collection', changes: changes() }],
})
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function harness({ wait, retry, offerings = [saved()] } = {}) {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ['kitchens/k', {}],
    ['places/k', {}],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    ['kitchens/k/menus/food', { status: 'published', format: 'interactive' }],
    ...offerings.map((row) => [
      'kitchens/k/offerings/' + row.id,
      offeringContract.kitchenOfferingData(structuredClone(row)),
    ]),
  ])
  const reads = [],
    writes = [],
    attempts = []
  let actors = 0,
    ids = 0
  const path = (target) =>
    typeof target === 'string' ? target : target.collectionPath
  const dependencies = {
    ...serviceHoursPolicy,
    resolveKitchenOperationHours: testKitchenHours,
    ...errors,
    ...validation,
    ...interactionInput,
    ...patch,
    ...tableChannels,
    ...options,
    ...offeringContract,
    ...offeringReads,
    ...offeringTargets,
    ...authority,
    FieldValue: { delete: () => ({ deleted: true }) },
    serverKitchenMenusTarget: (id) => 'kitchens/' + id + '/menus',
    randomUUID: () => {
      ids++
      return 'created-' + ids
    },
    readKitchenMutationActor: async () => {
      actors++
      await wait?.promise
      return { uid: 'u', runtimeAppId: 'app' }
    },
    runGuardedServerTransaction: async (_, work) => {
      const run = async (commit) => {
        const staged = []
        let writing = false
        const read = (target, id) => {
          assert.equal(writing, false, 'transaction reads precede every write')
          const key = path(target) + '/' + id
          reads.push(key)
          return {
            exists: records.has(key),
            data: structuredClone(records.get(key)),
          }
        }
        const write = (kind, target, id, data) => {
          writing = true
          const key = path(target) + '/' + id
          if (kind === 'create') assert.equal(records.has(key), false)
          staged.push([kind, key, structuredClone(data)])
        }
        const result = await work({
          read: async (target, id) => read(target, id),
          readAll: async (target, limit, after) => {
            assert.equal(writing, false, 'collection reads precede every write')
            const prefix = path(target) + '/'
            reads.push([prefix, limit, after])
            return [...records]
              .filter(
                ([key]) =>
                  key.startsWith(prefix) &&
                  !key.slice(prefix.length).includes('/')
              )
              .map(([key, data]) => ({
                id: key.slice(prefix.length),
                data: structuredClone(data),
              }))
              .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
              .filter((row) => !after || row.id > after)
              .slice(0, limit)
          },
          create: (target, id, data) => write('create', target, id, data),
          update: (target, id, data) => write('update', target, id, data),
        })
        attempts.push(staged)
        if (commit) {
          for (const [kind, key, data] of staged) {
            const next = { ...records.get(key), ...data }
            if (data.hours?.deleted) delete next.hours
            records.set(key, next)
            writes.push([kind, key, data])
          }
        }
        return result
      }
      if (retry) {
        await run(false)
        retry(records)
      }
      return run(true)
    },
  }
  return {
    ...load(
      'kitchen/server/offerings/update',
      'updateKitchenOffering',
      dependencies
    ),
    ...load(
      'kitchen/server/offerings/update-interaction',
      'updateKitchenOfferingInteraction',
      dependencies
    ),
    ...load(
      'kitchen/server/offerings/configure',
      'configureKitchenOffering, readOfferingConfiguration',
      dependencies
    ),
    records,
    reads,
    writes,
    attempts,
    get actors() {
      return actors
    },
    get ids() {
      return ids
    },
  }
}

test('shared interaction validation returns detached nested policy and retains false, zero and deposit removal', () => {
  const input = {
    ...changes(),
    table_channels: { staff_pos: true, table_qr: false },
  }
  const expected = structuredClone(input)
  const parsed = interactionValidation.requireKitchenInteractionChanges(
    'dine_in',
    input
  )
  input.enabled = false
  input.table_channels.table_qr = true
  input.fulfilment.deposit.amount = 999
  input.customer.required_fields.push('email')
  input.availability.paused = true
  input.notifications.whatsapp.recipient_phone = '+44999999999'
  assert.deepEqual(parsed, expected)
  assert.deepEqual(
    interactionValidation.requireKitchenInteractionChanges('collection', {
      enabled: false,
      notice_hours: 0,
      fulfilment: { deposit: null },
      notifications: { whatsapp: { enabled: false, recipient_phone: '' } },
    }),
    {
      enabled: false,
      notice_hours: 0,
      fulfilment: { deposit: null },
      notifications: { whatsapp: { enabled: false, recipient_phone: '' } },
    }
  )
})

test('coerced policy primitives and malformed nested shapes fail before credentials or writes', async () => {
  const bad = [
    { fulfilment: { deposit: { type: ['percent'], amount: 1000 } } },
    { fulfilment: { deposit: { type: 'percent', amount: 101 } } },
    { customer: { required_fields: [['name']] } },
    ...[null, false, 0, ''].map((whatsapp) => ({
      notifications: { whatsapp },
    })),
    {
      notifications: {
        whatsapp: { enabled: true, recipient_phone: ['+41791234567'] },
      },
    },
    { notifications: { whatsapp: { enabled: false, recipient_phone: 41 } } },
    { table_channels: { staff_pos: true, table_qr: 'false' } },
  ]
  for (const change of bad) {
    const h = harness()
    await assert.rejects(
      h.updateKitchenOfferingInteraction(
        {},
        {
          ...interaction(),
          type: 'dine_in',
          changes: change,
        }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.actors, 0)
    assert.equal(h.writes.length, 0)
  }
})

test('Offering envelopes reject malformed IDs, schedule scalars and acknowledgement before credentials', async () => {
  const malformedHours = [
    { ...hours(), source: ['custom'] },
    {
      ...hours(),
      windows: [{ days: [['friday']], open: '17:00', close: '22:00' }],
    },
    {
      ...hours(),
      windows: [{ days: ['friday'], open: ['17:00'], close: '22:00' }],
    },
    {
      ...hours(),
      windows: [
        { days: ['friday'], open: '17:00', close: '22:00', ignored: true },
      ],
    },
  ]
  for (const body of [
    ...malformedHours.map((hours) => ({
      kitchenId: 'k',
      offeringId: 'saved',
      changes: { hours },
    })),
    { kitchenId: ['k'], offeringId: 'saved', changes: { enabled: false } },
    { kitchenId: 'k', offeringId: '..', changes: { enabled: false } },
    {
      kitchenId: 'k',
      offeringId: 'saved',
      changes: { menu_ids: ['food/other'] },
    },
  ]) {
    const h = harness()
    await assert.rejects(h.updateKitchenOffering({}, body), { statusCode: 400 })
    assert.equal(h.actors, 0)
    assert.equal(h.writes.length, 0)
  }
  for (const activateShared of [null, 'true', 1, []]) {
    const h = harness()
    await assert.rejects(
      h.configureKitchenOffering({}, { ...configure(), activateShared }),
      { statusCode: 400 }
    )
    assert.equal(h.actors, 0)
    assert.equal(h.writes.length, 0)
  }
})

test('mixed and entirely invalid Offering weekdays fail before actor resolution for update and configure', async () => {
  for (const days of [['friday', 'not-a-day'], ['not-a-day']]) {
    for (const [action, body] of [
      [
        'updateKitchenOffering',
        {
          kitchenId: 'k',
          offeringId: 'saved',
          changes: {
            hours: {
              ...hours(),
              windows: [{ days, open: '17:00', close: '22:00' }],
            },
          },
        },
      ],
      [
        'configureKitchenOffering',
        {
          ...configure(),
          hours: {
            ...hours(),
            windows: [{ days, open: '17:00', close: '22:00' }],
          },
        },
      ],
    ]) {
      const h = harness({ wait: deferred() })
      await assert.rejects(h[action]({}, body), { statusCode: 400 })
      assert.equal(h.actors, 0, action)
      assert.equal(h.writes.length, 0, action)
    }
  }
})

test('known weekday case and surrounding whitespace still normalize and deduplicate on update and configure', async () => {
  const authoredHours = {
    ...hours(),
    windows: [
      {
        days: [' FRIDAY ', 'Friday', 'sAtUrDaY'],
        open: '17:00',
        close: '22:00',
      },
    ],
  }
  const expectedHours = {
    ...hours(),
    windows: [{ days: ['friday', 'saturday'], open: '17:00', close: '22:00' }],
  }
  for (const [action, body] of [
    [
      'updateKitchenOffering',
      {
        kitchenId: 'k',
        offeringId: 'saved',
        changes: { hours: authoredHours },
      },
    ],
    [
      'configureKitchenOffering',
      { ...configure(), offeringId: 'saved', hours: authoredHours },
    ],
  ]) {
    const h = harness()
    const result = await h[action]({}, body)
    assert.deepEqual(result.offering.hours, expectedHours, action)
    assert.equal(h.writes.length, 1, action)
  }
})

test('update retains copied Menu selection and hours through credentials and retries', async () => {
  const wait = deferred()
  const input = {
    kitchenId: 'k',
    offeringId: 'saved',
    changes: { name: 'Original', menu_ids: ['food'], hours: hours() },
  }
  const expected = structuredClone(input.changes)
  const h = harness({
    wait,
    retry: () => {
      input.changes.hours.windows[0].days.push('saturday')
      input.changes.menu_ids.push('missing')
    },
  })
  const pending = h.updateKitchenOffering({}, input)
  input.offeringId = 'other'
  input.changes.name = 'Changed'
  input.changes.hours.windows[0].open = '00:00'
  wait.resolve()
  const result = await pending
  assert.equal(result.offering.id, 'saved')
  assert.deepEqual(
    {
      name: result.offering.name,
      menu_ids: result.offering.menu_ids,
      hours: result.offering.hours,
    },
    expected
  )
  assert.equal(h.writes.length, 1)
  assert.equal(h.records.has('kitchens/k/offerings/other'), false)
})

test('interaction update commits the validated original nested settings after credentials and retry', async () => {
  const wait = deferred(),
    input = interaction(),
    expected = structuredClone(input.changes)
  const h = harness({
    wait,
    retry: () => {
      input.changes.fulfilment.deposit.type = ['percent']
      input.changes.fulfilment.deposit.amount = 1000
      input.changes.notifications.whatsapp.recipient_phone = ['+44999999999']
    },
  })
  const pending = h.updateKitchenOfferingInteraction({}, input)
  input.kitchenId = 'other'
  input.type = 'delivery'
  input.changes.enabled = false
  input.changes.customer.required_fields.push('email')
  input.changes.availability.paused = true
  wait.resolve()
  const result = await pending
  const row = result.offering.interactions.find(
    (row) => row.type === 'collection'
  )
  assert.deepEqual(row, { type: 'collection', ...expected })
  assert.equal(result.offering.enabled, false)
  assert.equal(
    result.offering.interactions.some((row) => row.type === 'delivery'),
    false
  )
  assert.equal(h.writes.length, 1)
})

test('configure commits a detached complete draft and stable created ID across credentials and retry', async () => {
  const wait = deferred(),
    input = configure(),
    expected = structuredClone(input)
  const h = harness({
    wait,
    offerings: [],
    retry: () => {
      input.interactions[0].changes.fulfilment.deposit.amount = 1000
      input.interactions[0].changes.notifications.whatsapp.enabled = false
      input.menu_ids.push('missing')
    },
  })
  const pending = h.configureKitchenOffering({}, input)
  input.kitchenId = 'other'
  input.option = 'delivery'
  input.name = 'Changed'
  input.enabled = false
  input.hours.windows[0].days.push('saturday')
  input.interactions[0].type = 'delivery'
  input.interactions[0].changes.customer.required_fields.push('email')
  wait.resolve()
  const result = await pending
  assert.equal(result.offering.id, 'created-1')
  assert.equal(result.offering.name, expected.name)
  assert.equal(result.offering.enabled, true)
  assert.deepEqual(result.offering.menu_ids, expected.menu_ids)
  assert.deepEqual(result.offering.hours, expected.hours)
  assert.deepEqual(
    result.offering.interactions.find((row) => row.type === 'collection'),
    { type: 'collection', ...expected.interactions[0].changes }
  )
  assert.equal(h.ids, 1)
  assert.equal(h.writes.length, 1)
})

test('current membership, association and linked Place remain transaction prerequisites on retry', async () => {
  for (const revoke of [
    (records) => records.delete('apps/app/users/u'),
    (records) => {
      records.get('apps/app/users/u').role = 'viewer'
    },
    (records) => {
      records.get('apps/app/users/u').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }
    },
    (records) => records.delete('kitchen_access/u'),
    (records) => records.delete('places/k'),
  ]) {
    for (const [action, input] of [
      [
        'updateKitchenOffering',
        { kitchenId: 'k', offeringId: 'saved', changes: { name: 'Dinner' } },
      ],
      ['updateKitchenOfferingInteraction', interaction()],
      ['configureKitchenOffering', { ...configure(), offeringId: 'saved' }],
    ]) {
      const h = harness({ retry: revoke })
      await assert.rejects(h[action]({}, input))
      assert.equal(h.writes.length, 0)
    }
  }
})

test('retry detects a removed selected Menu and concurrent first configuration without committing', async () => {
  for (const [action, input] of [
    [
      'updateKitchenOffering',
      { kitchenId: 'k', offeringId: 'saved', changes: { enabled: true } },
    ],
    ['updateKitchenOfferingInteraction', interaction()],
    ['configureKitchenOffering', { ...configure(), offeringId: 'saved' }],
  ]) {
    const h = harness({
      offerings: [saved({ enabled: true })],
      retry: (records) => records.delete('kitchens/k/menus/food'),
    })
    await assert.rejects(h[action]({}, input), /selected Menu no longer exists/)
    assert.equal(h.writes.length, 0)
  }
  const h = harness({
    offerings: [],
    retry: (records) =>
      records.set(
        'kitchens/k/offerings/concurrent',
        offeringContract.kitchenOfferingData(saved({ id: 'concurrent' }))
      ),
  })
  await assert.rejects(h.configureKitchenOffering({}, configure()), {
    statusCode: 409,
  })
  assert.equal(h.writes.length, 0)
})

test('complete paged children participate in configuration conflicts and malformed siblings fail closed', async () => {
  const offerings = Array.from({ length: 1001 }, (_, index) =>
    saved({
      id: String(index).padStart(4, '0'),
      interactions: [
        { type: index === 1000 ? 'collection' : 'browse', enabled: false },
      ],
    })
  )
  const h = harness({ offerings })
  await assert.rejects(h.configureKitchenOffering({}, configure()), {
    statusCode: 409,
  })
  assert.equal(h.reads.filter(Array.isArray).length, 2)
  assert.equal(h.writes.length, 0)
  const malformed = harness()
  malformed.records.set(
    'kitchens/k/offerings/broken',
    offeringContract.kitchenOfferingData(
      saved({
        id: 'broken',
        interactions: [
          {
            type: 'collection',
            enabled: false,
            fulfilment: { deposit: { type: ['percent'], amount: 1000 } },
          },
        ],
      })
    )
  )
  await assert.rejects(
    malformed.updateKitchenOffering(
      {},
      { kitchenId: 'k', offeringId: 'saved', changes: { name: 'Dinner' } }
    )
  )
  assert.equal(malformed.writes.length, 0)
})

test('another configuration cannot be created for an existing service', async () => {
  const h = harness()
  await assert.rejects(
    h.configureKitchenOffering({}, configure()),
    /already has saved settings/
  )
  await assert.rejects(
    h.configureKitchenOffering({}, { ...configure(), createSeparate: true }),
    /Unsupported/
  )
  assert.deepEqual(h.writes, [])
})

test('separate creation cannot target an existing offering and invalid timing fails before authority or writes', async () => {
  for (const patch of [
    { createSeparate: true, offeringId: 'saved' },
    { collection_timing: '24_hours' },
    { option: 'delivery', collection_timing: 'next_day' },
  ]) {
    const h = harness()
    await assert.rejects(() =>
      h.configureKitchenOffering({}, { ...configure(), ...patch })
    )
    assert.equal(h.actors, 0)
    assert.deepEqual(h.writes, [])
  }
})

test('next-day collection rejects immediate pickup without writing any record', async () => {
  const h = harness({ offerings: [] })
  await assert.rejects(
    () =>
      h.configureKitchenOffering(
        {},
        { ...configure(), collection_timing: 'next_day' }
      ),
    /immediate collection/
  )
  assert.deepEqual(h.writes, [])
})

test('timing and configuration edits preserve separate identity and never write main services', async () => {
  const main = saved({
    enabled: true,
    interactions: [{ type: 'collection', enabled: true }],
  })
  const delivery = saved({
    id: 'delivery',
    interactions: [{ type: 'delivery', enabled: true }],
  })
  const picnic = saved({
    id: 'picnic',
    name: 'Picnic',
    separate: true,
    collection_timing: 'next_day',
  })
  const h = harness({ offerings: [main, delivery, picnic] })
  const before = structuredClone([...h.records])
  for (const timing of ['same_day', 'next_day', 'same_day']) {
    const result = await h.updateKitchenOffering(
      {},
      {
        kitchenId: 'k',
        offeringId: 'picnic',
        changes: { collection_timing: timing },
      }
    )
    assert.equal(result.offering.separate, true)
    assert.equal(result.offering.collection_timing, timing)
  }
  const configured = await h.configureKitchenOffering(
    {},
    {
      ...configure(),
      offeringId: 'picnic',
      enabled: false,
      collection_timing: 'same_day',
    }
  )
  assert.equal(configured.offering.separate, true)
  assert.equal(configured.offering.collection_timing, 'same_day')
  for (const [path, data] of before)
    if (!path.endsWith('/picnic'))
      assert.deepEqual(h.records.get(path), data, path)
  assert.ok(
    h.writes.every(([, path]) => path === 'kitchens/k/offerings/picnic')
  )
})

test('ordinary edits cannot remove the separate identity', async () => {
  const h = harness({ offerings: [saved({ separate: true })] })
  await assert.rejects(() =>
    h.updateKitchenOffering(
      {},
      { kitchenId: 'k', offeringId: 'saved', changes: { separate: false } }
    )
  )
  assert.deepEqual(h.writes, [])
})

test('every service save rejects Daily specials, documents and archived menu selections without writing', async () => {
  for (const data of [
    { status: 'published', format: 'interactive', schedule: 'daily' },
    { status: 'published', format: 'document' },
    { status: 'archived', format: 'interactive' },
  ]) {
    for (const action of [
      'configure-off',
      'configure-on',
      'edit',
      'enable',
      'interaction',
    ]) {
      const h = harness({
        offerings: [saved({ enabled: action === 'interaction' })],
      })
      h.records.set('kitchens/k/menus/food', data)
      const before = structuredClone([...h.records])
      await assert.rejects(
        () =>
          action.startsWith('configure')
            ? h.configureKitchenOffering(
                {},
                {
                  ...configure(),
                  offeringId: 'saved',
                  enabled: action === 'configure-on',
                }
              )
            : action === 'interaction'
              ? h.updateKitchenOfferingInteraction(
                  {},
                  {
                    kitchenId: 'k',
                    offeringId: 'saved',
                    type: 'collection',
                    changes: { enabled: true },
                  }
                )
              : h.updateKitchenOffering(
                  {},
                  {
                    kitchenId: 'k',
                    offeringId: 'saved',
                    changes:
                      action === 'enable'
                        ? { enabled: true }
                        : { menu_ids: ['food'] },
                  }
                ),
        /regular interactive menus/
      )
      assert.deepEqual(h.writes, [], action)
      assert.deepEqual([...h.records], before, action)
    }
  }
})

test('Collection setup can select drafts while the general enable command keeps its readiness gate', async () => {
  const h = harness()
  h.records.set('kitchens/k/menus/food', {
    status: 'draft',
    format: 'interactive',
  })
  await h.configureKitchenOffering(
    {},
    { ...configure(), offeringId: 'saved', enabled: false }
  )
  await h.updateKitchenOffering(
    {},
    { kitchenId: 'k', offeringId: 'saved', changes: { menu_ids: ['food'] } }
  )
  const count = h.writes.length
  await assert.rejects(
    () =>
      h.updateKitchenOffering(
        {},
        {
          kitchenId: 'k',
          offeringId: 'saved',
          changes: { enabled: true },
        }
      ),
    /Publish at least one/
  )
  assert.equal(h.writes.length, count)
  await h.updateKitchenOffering(
    {},
    { kitchenId: 'k', offeringId: 'saved', changes: { enabled: false } }
  )
})

test('Collection configuration preserves the latest hidden policy on transaction retry', async () => {
  const current = saved()
  const hidden = {
    notice_hours: 2,
    message: 'Updated elsewhere',
    customer: { required_fields: ['phone'] },
  }
  const h = harness({
    offerings: [current],
    retry: (records) => {
      const record = records.get('kitchens/k/offerings/saved')
      const collection = record.interactions.find(
        (row) => row.type === 'collection'
      )
      Object.assign(collection, hidden)
    },
  })
  const result = await h.configureKitchenOffering(
    {},
    {
      ...configure(),
      offeringId: 'saved',
      interactions: [{ type: 'collection', changes: { enabled: true } }],
    }
  )
  const collection = result.offering.interactions.find(
    (row) => row.type === 'collection'
  )
  for (const [key, value] of Object.entries(hidden))
    assert.deepEqual(collection[key], value)
  assert.equal(h.writes.length, 1)
  assert.equal(result.offering.id, current.id)
})

test('policy updates cannot add another service or change a table entry identity', async () => {
  for (const input of [
    { ...interaction(), type: 'delivery', changes: { notice_hours: 1 } },
    {
      ...interaction(),
      type: 'dine_in',
      changes: { table_channels: { staff_pos: false, table_qr: true } },
    },
  ]) {
    const h = harness()
    await assert.rejects(h.updateKitchenOfferingInteraction({}, input), {
      statusCode: 400,
    })
    assert.deepEqual(h.writes, [])
  }
})
