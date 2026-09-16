import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

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
  ]
)(
  (value) => value,
  (value) => value.enabled,
  (context) => ({
    context,
    surface: context,
    defaultOrderType: context === 'generic' ? undefined : context,
    visibleOrderTypes:
      context === 'generic' ? ['collection', 'delivery'] : [context],
  }),
  (value) => value || 'generic'
)

const ordering = {
  enabled: true,
  order_types: [
    {
      type: 'collection',
      notifications: { whatsapp: { recipient_phone: 'private' } },
    },
    { type: 'delivery' },
  ],
}
test('public service profile filters context and removes notification recipients without mutating policy', () => {
  const profile = menuServiceProfile({
    menuContext: 'collection',
    kitchen_ordering: ordering,
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
    menuServiceProfile({ menuContext: 'pre_order', kitchen_ordering: ordering })
      .orderingEnabled,
    false
  )
  assert.equal(
    menuServiceProfile({ kitchen_ordering: { ...ordering, enabled: false } })
      .orderingEnabled,
    false
  )
})
