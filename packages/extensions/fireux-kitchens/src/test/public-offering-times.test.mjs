import assert from 'node:assert/strict'
import test from 'node:test'
import {
  load,
  normalizeKitchenOfferings,
  kioskService,
  publicMenuOrderTypes,
} from './kitchen/offering-test-helpers.mjs'

const { readKitchenPublicOfferings } = load(
  '../../runtime/kitchen/utils/public-offerings.ts',
  'readKitchenPublicOfferings',
  { normalizeKitchenOfferings }
)
test('Kitchen document menus receive scoped times while standalone documents remain independent', () => {
  const { buildMenuDocumentPayload } = load(
    '../../runtime/menu/server/payload/document.ts',
    'buildMenuDocumentPayload',
    {
      readKitchenPublicOfferings,
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
      kitchen_offerings: [kioskService],
    }
  )
  assert.equal(scoped.document.offerings[0].id, 'lunch')
  assert.equal(
    buildMenuDocumentPayload('file', {}).document.offerings,
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
    readKitchenPublicOfferings(value, 'food').map((row) => row.id),
    ['lunch']
  )
  assert.deepEqual(readKitchenPublicOfferings(value, ''), [])
})

test('Menu payload exposes only that Menu and the explicitly requested service schedule', () => {
  const { menuOfferingProfile } = load(
    '../../runtime/menu/server/payload/offering-profile.ts',
    'menuOfferingProfile',
    {
      readKitchenPublicOfferings,
      readKitchenMenuOrdering: () => ({ enabled: false, order_types: [] }),
      publicMenuOrderTypes,
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
    menuOfferingProfile({
      kitchen_offerings: value,
      kitchenMenuId: 'food',
    }).offerings.map((row) => row.id),
    ['lunch', 'dinner']
  )
  assert.deepEqual(
    menuOfferingProfile({
      kitchen_offerings: value,
      kitchenMenuId: 'food',
      menuContext: 'collection',
      kitchenOfferingId: 'dinner',
    }).offerings.map((row) => row.id),
    ['dinner']
  )
  assert.deepEqual(
    menuOfferingProfile({ kitchen_offerings: value }).offerings,
    []
  )
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
  const [row] = readKitchenPublicOfferings(services, 'food')
  assert.deepEqual(Object.keys(row).sort(), ['hours', 'id', 'name', 'paused'])
  assert.equal(row.paused, true)
  assert.equal(JSON.stringify(row).includes('private-recipient'), false)
})
test('a still available interaction keeps the service available, and missing hours remain unknown', () => {
  const [row] = readKitchenPublicOfferings(
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
