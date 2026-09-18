import assert from 'node:assert/strict'
import test from 'node:test'
import {
  load,
  readKitchenServices,
  kioskService,
} from './kitchen/kiosk-test-helpers.mjs'

const { readKitchenPublicServices } = load(
  '../../runtime/kitchen/utils/public-services.ts',
  'readKitchenPublicServices',
  { readKitchenServices }
)
test('Kitchen document menus receive scoped times while standalone documents remain independent', () => {
  const { buildMenuDocumentPayload } = load(
    '../../runtime/menu/server/payload/document.ts',
    'buildMenuDocumentPayload',
    {
      readKitchenPublicServices,
      readRecordString: (value, key) => value[key] || '',
      readMenuFile: () => ({}),
      menuFileKind: () => 'pdf',
      readMenuDocumentKind: () => 'pdf',
      menuPayloadPresentation: () => ({}),
      hasMenuFile: () => false,
    }
  )
  const scoped = buildMenuDocumentPayload(
    'food',
    {},
    {
      kitchenId: 'venue',
      kitchenMenuId: 'food',
      kitchen_services: [kioskService],
    }
  )
  assert.equal(scoped.document.services[0].id, 'lunch')
  assert.equal(
    buildMenuDocumentPayload('file', {}).document.services,
    undefined
  )
})
test('public summaries keep exact menu membership and exclude disabled offerings', () => {
  const value = [
    kioskService,
    { ...kioskService, id: 'dinner', enabled: false },
    { ...kioskService, id: 'drinks', menu_ids: ['drinks'] },
  ]
  assert.deepEqual(
    readKitchenPublicServices(value, 'food').map((row) => row.id),
    ['lunch']
  )
  assert.deepEqual(readKitchenPublicServices(value, ''), [])
})

test('Menu payload exposes only that Menu and the explicitly requested service schedule', () => {
  const { menuServiceProfile } = load(
    '../../runtime/menu/server/payload/service-profile.ts',
    'menuServiceProfile',
    {
      readKitchenPublicServices,
      readKitchenMenuOrdering: () => ({ enabled: false, order_types: [] }),
      isMenuOrderingEnabled: () => false,
      normalizeMenuRouteContext: (value) => value || 'generic',
      menuContextProfile: (context) => ({
        context,
        surface: context,
        visibleOrderTypes: [],
      }),
    }
  )
  const value = [
    kioskService,
    { ...kioskService, id: 'dinner' },
    { ...kioskService, id: 'other-menu', menu_ids: ['drinks'] },
  ]
  assert.deepEqual(
    menuServiceProfile({
      kitchen_services: value,
      kitchenMenuId: 'food',
    }).services.map((row) => row.id),
    ['lunch', 'dinner']
  )
  assert.deepEqual(
    menuServiceProfile({
      kitchen_services: value,
      kitchenMenuId: 'food',
      menuContext: 'collection',
      kitchenServiceId: 'dinner',
    }).services.map((row) => row.id),
    ['dinner']
  )
  assert.deepEqual(menuServiceProfile({ kitchen_services: value }).services, [])
})
test('notification and ordering policy never enter the public timing summary', () => {
  const services = [
    {
      ...kioskService,
      interactions: [
        {
          type: 'takeaway',
          enabled: true,
          notifications: { whatsapp: { recipient_phone: 'private-recipient' } },
          availability: { paused: true },
        },
      ],
    },
  ]
  const [row] = readKitchenPublicServices(services, 'food')
  assert.deepEqual(Object.keys(row).sort(), ['hours', 'id', 'name', 'paused'])
  assert.equal(row.paused, true)
  assert.equal(JSON.stringify(row).includes('private-recipient'), false)
})
test('a still available interaction keeps the service available, and missing hours remain unknown', () => {
  const [row] = readKitchenPublicServices(
    [
      {
        ...kioskService,
        hours: undefined,
        interactions: [
          { type: 'takeaway', enabled: true, availability: { paused: true } },
          { type: 'eat_in', enabled: true },
        ],
      },
    ],
    'food'
  )
  assert.equal(row.paused, false)
  assert.equal(row.hours, undefined)
})
