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
    readWeekdayTimeWindowsConfig: (value) => value || { windows: [] },
    ...whatsapp,
  }
)
const { readKitchenOrdering } = load(
  '../runtime/kitchen/utils/kitchen-ordering.ts',
  'readKitchenOrdering',
  policy
)
const { kitchenMenuOrdering } = load(
  '../runtime/menu/utils/menu-ordering.ts',
  'kitchenMenuOrdering',
  { readKitchenOrdering }
)
const { patchKitchenOrderingService } = load(
  '../runtime/kitchen/utils/ordering-service.ts',
  'patchKitchenOrderingService'
)
const { readServiceChanges } = load(
  '../runtime/kitchen/server/ordering/validation.ts',
  'readServiceChanges',
  {
    createError: (input) =>
      Object.assign(new Error(input.statusMessage), input),
    requireFirestoreDocumentId: (value) => {
      if (!value || value.includes('/')) throw new Error('id')
      return value
    },
    KitchenOrderTypes: [
      'collection',
      'delivery',
      'pre_order',
      'eat_in',
      'takeaway',
      'dine_in',
      'room_service',
    ],
    compactKitchenServiceHours: (value) => {
      if (value.inherit_kitchen_operation_hours) return
      if (!value.operation_hours?.windows?.length) throw new Error('hours')
      return value
    },
  }
)
const service = {
  type: 'pre_order',
  enabled: false,
  menu_ids: ['food'],
  notice_hours: 24,
}

test('disabled services cannot grant ordering; membership uses stable IDs', () => {
  assert.deepEqual(kitchenMenuOrdering({ services: [service] }, 'food'), {
    enabled: false,
    order_types: [],
  })
  const active = { ...service, enabled: true }
  assert.equal(
    kitchenMenuOrdering({ services: [active] }, 'food').enabled,
    true
  )
  assert.equal(
    kitchenMenuOrdering({ services: [active] }, 'comida-casera').enabled,
    false
  )
  assert.equal(
    kitchenMenuOrdering({ services: [active] }, 'drinks').enabled,
    false
  )
  assert.deepEqual(
    readKitchenOrdering({ enabled: true, order_types: [{ type: 'pre_order' }] })
      .services,
    []
  )
})

test('shared service policy is identical across selected Menus and preserves pause', () => {
  const active = {
    ...service,
    enabled: true,
    menu_ids: ['food', 'drinks'],
    availability: { paused: true, message: 'Closed today' },
  }
  const a = kitchenMenuOrdering({ services: [active] }, 'food')
  assert.deepEqual(a, kitchenMenuOrdering({ services: [active] }, 'drinks'))
  assert.equal(a.order_types[0].availability.paused, true)
  assert.equal(Object.hasOwn(a.order_types[0], 'menu_ids'), false)
})

test('patches preserve sibling fields, keep explicit false and allow zero notice', () => {
  const current = {
    ...service,
    availability: { paused: true, message: 'Closed' },
    fulfilment: {
      handoff_instructions: 'Counter',
      deposit: { type: 'fixed', amount: 5 },
    },
  }
  const result = patchKitchenOrderingService('pre_order', current, {
    availability: { paused: false },
    notice_hours: 0,
    message: '',
  })
  assert.deepEqual(result.availability, { paused: false, message: 'Closed' })
  assert.equal(result.fulfilment.deposit.amount, 5)
  assert.equal(result.enabled, false)
  assert.equal(result.asap_enabled, false)
  assert.equal(
    readKitchenOrdering({ services: [result] }).services[0].notice_hours,
    0
  )
})

test('trusted request rejects database selection, retired Menu policy and malformed fields', () => {
  const base = {
    kitchenId: 'k',
    type: 'pre_order',
    changes: { enabled: false },
  }
  assert.equal(readServiceChanges(base).changes.enabled, false)
  for (const input of [
    { ...base, databaseId: 'other' },
    { ...base, changes: { order_types: [] } },
    { ...base, changes: { menu_ids: ['x/y'] } },
    { ...base, changes: { enabled: 'yes' } },
    {
      ...base,
      changes: { service_hours: { inherit_menu_service_hours: true } },
    },
    { ...base, changes: { fulfilment: { payment_methods: ['cash'] } } },
    { ...base, changes: { notice_hours: -1 } },
  ])
    assert.throws(() => readServiceChanges(input))
})

test('trusted service command checks Kitchen authority and only that Kitchen’s Menu membership', async () => {
  let write,
    authorized = false,
    missing = false
  const tx = {
    read: async (target, id) => {
      assert.equal(target, 'kitchens/k/menus')
      return { exists: !missing && id === 'food' }
    },
    update: (target, id, patch) => {
      write = { target, id, patch }
    },
  }
  const { updateKitchenOrderingService } = load(
    '../runtime/kitchen/server/ordering/update.ts',
    'updateKitchenOrderingService',
    {
      patchKitchenOrderingService,
      readKitchenOrdering,
      readServiceChanges,
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      runGuardedServerTransaction: async (scope, operation) => operation(tx),
      readKitchenMutationActor: async () => ({ uid: 'actor' }),
      requireKitchenMutationAuthority: async (
        transaction,
        actor,
        kitchenId
      ) => {
        assert.equal(kitchenId, 'k')
        authorized = true
        return {
          rootData: {
            ordering: {
              services: [
                { ...service, enabled: true },
                { type: 'delivery', enabled: false, menu_ids: [] },
              ],
            },
          },
          ownerAppId: 'a',
        }
      },
      requireFirestoreDocumentId: (value) => value,
      serverKitchenMenusTarget: (id) => `kitchens/${id}/menus`,
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
      serverAuditStamp: (value) => value,
    }
  )
  await updateKitchenOrderingService(
    {},
    { kitchenId: 'k', type: 'pre_order', changes: { menu_ids: ['food'] } }
  )
  assert.equal(authorized, true)
  assert.equal(write.patch.ordering.services.length, 2)
  missing = true
  write = null
  await assert.rejects(
    updateKitchenOrderingService(
      {},
      { kitchenId: 'k', type: 'pre_order', changes: { enabled: true } }
    ),
    /no longer exists/
  )
  assert.equal(write, null)
  await updateKitchenOrderingService(
    {},
    { kitchenId: 'k', type: 'pre_order', changes: { enabled: false } }
  )
  assert.equal(
    write.patch.ordering.services.find((row) => row.type === 'pre_order')
      .enabled,
    false
  )
})

test('unauthenticated actor rejection happens before any transaction or mutation', async () => {
  let touched = false
  const { updateKitchenOrderingService } = load(
    '../runtime/kitchen/server/ordering/update.ts',
    'updateKitchenOrderingService',
    {
      readServiceChanges,
      readKitchenMutationActor: async () => {
        throw Object.assign(new Error('Sign in'), { statusCode: 401 })
      },
      runGuardedServerTransaction: async () => {
        touched = true
      },
    }
  )
  await assert.rejects(
    updateKitchenOrderingService(
      {},
      { kitchenId: 'k', type: 'pre_order', changes: { enabled: false } }
    ),
    { statusCode: 401 }
  )
  assert.equal(touched, false)
})

test('removing a deposit keeps handoff instructions without storing null', () => {
  const current = {
    ...service,
    fulfilment: {
      handoff_instructions: 'Ask at the bar',
      deposit: { type: 'fixed', amount: 5 },
    },
  }
  const patch = readServiceChanges({
    kitchenId: 'k',
    type: 'pre_order',
    changes: { fulfilment: { deposit: null } },
  })
  const updated = patchKitchenOrderingService(
    'pre_order',
    current,
    patch.changes
  )
  assert.deepEqual(updated.fulfilment, {
    handoff_instructions: 'Ask at the bar',
  })
  assert.equal(current.fulfilment.deposit.amount, 5)
  assert.equal(updated.enabled, false)
})
