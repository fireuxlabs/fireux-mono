import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const tableSource = readFileSync(
  new URL('../runtime/kitchen/utils/table-service.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const tableChannelEnabled = compileFunction(
  `${stripTypeScriptTypes(tableSource)}; return tableChannelEnabled`
)()

const source = readFileSync(
  new URL('../runtime/menu/server/payload/offering-profile.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const menuOfferingProfile = compileFunction(
  `${stripTypeScriptTypes(source)}; return menuOfferingProfile`,
  [
    'readKitchenMenuOrdering',
    'isMenuOrderingEnabled',
    'menuContextProfile',
    'normalizeMenuRouteContext',
    'readKitchenPublicOfferings',
    'tableChannelEnabled',
  ]
)(
  (value) => value,
  (value) => value.enabled,
  (context) => ({
    context,
    surface: context,
    defaultOrderType: context === 'generic' ? undefined : context,
    visibleOrderTypes:
      context === 'generic'
        ? ['collection', 'delivery', 'dine_in']
        : context === 'staff_pos'
          ? ['dine_in']
          : [context],
  }),
  (value) => value || 'generic',
  () => [],
  tableChannelEnabled
)

const ordering = {
  enabled: true,
  order_types: [
    {
      type: 'collection',
      kitchen_offering_id: 'lunch',
      kitchen_offering_name: 'Lunch',
      notifications: { whatsapp: { recipient_phone: 'private' } },
    },
    {
      type: 'delivery',
      kitchen_offering_id: 'lunch',
      kitchen_offering_name: 'Lunch',
    },
  ],
}
test('public service profile filters context and removes notification recipients without mutating policy', () => {
  const profile = menuOfferingProfile({
    menuContext: 'collection',
    kitchenOfferingId: 'lunch',
    kitchen_offerings: ordering,
    choices: [{ order_type: 'collection' }, { order_type: 'delivery' }],
  })
  assert.deepEqual(profile.orderTypes, ['collection'])
  assert.deepEqual(profile.availableOrderTypes, ['collection', 'delivery'])
  assert.equal(profile.choices.length, 1)
  assert.equal(profile.defaultOrderType, 'collection')
  assert.equal(JSON.stringify(profile).includes('private'), false)
  assert.equal(
    ordering.order_types[0].notifications.whatsapp.recipient_phone,
    'private'
  )
})

test('unavailable context and disabled services cannot enable ordering', () => {
  assert.equal(
    menuOfferingProfile({ menuContext: 'pre_order', kitchen_offerings: ordering })
      .orderingEnabled,
    false
  )
  assert.equal(
    menuOfferingProfile({ kitchen_offerings: { ...ordering, enabled: false } })
      .orderingEnabled,
    false
  )
})

test('duplicate modes stay scoped to the requested named service, without first-service fallback', () => {
  const services = {
    enabled: true,
    order_types: [
      {
        type: 'collection',
        kitchen_offering_id: 'lunch',
        kitchen_offering_name: 'Lunch',
        message: 'Lunch only',
      },
      {
        type: 'collection',
        kitchen_offering_id: 'dinner',
        kitchen_offering_name: 'Dinner',
        message: 'Dinner only',
      },
    ],
  }
  const profile = menuOfferingProfile({
    menuContext: 'collection',
    kitchenOfferingId: 'dinner',
    kitchen_offerings: services,
  })
  assert.equal(profile.ordering.order_types.length, 1)
  assert.equal(profile.defaultOrderTypeConfig.message, 'Dinner only')
  assert.equal(profile.selectedOfferingId, 'dinner')
  for (const kitchenOfferingId of ['', 'unknown']) {
    assert.equal(
      menuOfferingProfile({
        menuContext: 'collection',
        kitchenOfferingId,
        kitchen_offerings: services,
      }).orderingEnabled,
      false
    )
  }
})

test('guest and staff table surfaces expose only their enabled channel', () => {
  const kitchen_offerings = {
    enabled: true,
    order_types: [
      {
        type: 'dine_in',
        kitchen_offering_id: 'tables',
        kitchen_offering_name: 'Tables',
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  const scope = { kitchen_offerings, kitchenOfferingId: 'tables' }
  assert.equal(
    menuOfferingProfile({ ...scope, menuContext: 'dine_in' }).orderingEnabled,
    false
  )
  assert.equal(
    menuOfferingProfile({ ...scope, menuContext: 'staff_pos' }).orderingEnabled,
    true
  )
  assert.deepEqual(
    menuOfferingProfile({ ...scope, menuContext: 'generic' })
      .availableOrderTypes,
    []
  )
})
