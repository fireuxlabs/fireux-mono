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
  new URL('../runtime/menu/server/payload/service-profile.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const menuServiceProfile = compileFunction(
  `${stripTypeScriptTypes(source)}; return menuServiceProfile`,
  [
    'readKitchenMenuOrdering',
    'isMenuOrderingEnabled',
    'menuContextProfile',
    'normalizeMenuRouteContext',
    'readKitchenPublicServices',
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
      kitchen_service_id: 'lunch',
      kitchen_service_name: 'Lunch',
      notifications: { whatsapp: { recipient_phone: 'private' } },
    },
    {
      type: 'delivery',
      kitchen_service_id: 'lunch',
      kitchen_service_name: 'Lunch',
    },
  ],
}
test('public service profile filters context and removes notification recipients without mutating policy', () => {
  const profile = menuServiceProfile({
    menuContext: 'collection',
    kitchenServiceId: 'lunch',
    kitchen_services: ordering,
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
    menuServiceProfile({ menuContext: 'pre_order', kitchen_services: ordering })
      .orderingEnabled,
    false
  )
  assert.equal(
    menuServiceProfile({ kitchen_services: { ...ordering, enabled: false } })
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
        kitchen_service_id: 'lunch',
        kitchen_service_name: 'Lunch',
        message: 'Lunch only',
      },
      {
        type: 'collection',
        kitchen_service_id: 'dinner',
        kitchen_service_name: 'Dinner',
        message: 'Dinner only',
      },
    ],
  }
  const profile = menuServiceProfile({
    menuContext: 'collection',
    kitchenServiceId: 'dinner',
    kitchen_services: services,
  })
  assert.equal(profile.ordering.order_types.length, 1)
  assert.equal(profile.defaultOrderTypeConfig.message, 'Dinner only')
  assert.equal(profile.selectedServiceId, 'dinner')
  for (const kitchenServiceId of ['', 'unknown']) {
    assert.equal(
      menuServiceProfile({
        menuContext: 'collection',
        kitchenServiceId,
        kitchen_services: services,
      }).orderingEnabled,
      false
    )
  }
})

test('guest and staff table surfaces expose only their enabled channel', () => {
  const kitchen_services = {
    enabled: true,
    order_types: [
      {
        type: 'dine_in',
        kitchen_service_id: 'tables',
        kitchen_service_name: 'Tables',
        table_channels: { staff_pos: true, table_qr: false },
      },
    ],
  }
  const scope = { kitchen_services, kitchenServiceId: 'tables' }
  assert.equal(
    menuServiceProfile({ ...scope, menuContext: 'dine_in' }).orderingEnabled,
    false
  )
  assert.equal(
    menuServiceProfile({ ...scope, menuContext: 'staff_pos' }).orderingEnabled,
    true
  )
  assert.deepEqual(
    menuServiceProfile({ ...scope, menuContext: 'generic' })
      .availableOrderTypes,
    []
  )
})
