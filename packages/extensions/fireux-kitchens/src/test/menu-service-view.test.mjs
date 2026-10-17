import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/menu/utils/service-menu.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const menuServiceOfferings = compileFunction(
  stripTypeScriptTypes(source) + '; return menuServiceOfferings'
)()
const menu = (name = 'Food') => ({
  id: name,
  name,
  offerings: [
    {
      id: 'collection',
      name: 'Collection',
      paused: false,
      hours: { windows: [{}] },
    },
    { id: 'delivery', paused: false, hours: { windows: [{}] } },
  ],
  offering_options: [
    { type: 'collection', kitchen_offering_id: 'collection' },
    { type: 'delivery', kitchen_offering_id: 'delivery' },
  ],
})
test('collection eligibility is explicit and its times exclude unrelated services', () => {
  assert.deepEqual(
    menuServiceOfferings(menu(), 'collection').map((row) => row.id),
    ['collection']
  )
  assert.equal(
    menuServiceOfferings(menu('Breakfast'), 'collection').length,
    1,
    'names must never determine eligibility'
  )
  assert.deepEqual(
    menuServiceOfferings(
      {
        ...menu(),
        offering_options: [
          { type: 'delivery', kitchen_offering_id: 'delivery' },
        ],
      },
      'collection'
    ),
    []
  )
  for (const change of [
    (row) => (row.offering_options[0].paused = true),
    (row) => (row.offerings[0].paused = true),
    (row) => (row.offerings[0].hours.windows = []),
  ]) {
    const row = menu()
    change(row)
    assert.deepEqual(menuServiceOfferings(row, 'collection'), [])
  }
})
const reader = readFileSync(
  new URL('../runtime/menu/server/index/read.ts', import.meta.url),
  'utf8'
)
  .split('export async function readMenuDirectoryPage')[1]
  .split('function pageSize')[0]
function load(pages, calls) {
  return compileFunction(
    stripTypeScriptTypes('async function readMenuDirectoryPage' + reader) +
      '; return readMenuDirectoryPage',
    [
      'readMenuDirectoryBatch',
      'menuServiceOfferings',
      'pageSize',
      'createError',
      'text',
      'readMatchingMenuDishes',
      'matchesFoodSearch',
      'getRuntimeFirestore',
    ]
  )(
    async (input) => {
      calls.push(input)
      const page = pages.shift()
      if (page instanceof Error) throw page
      return page
    },
    menuServiceOfferings,
    (value) => value || 24,
    (value) => new Error(value.statusMessage),
    value => String(value || '').trim(),
    async (_db, menu) => menu.testMatches || [],
    (text, query) => text.toLowerCase().includes(query.toLowerCase()),
    () => ({})
  )
}
test('service pagination scans past ineligible pages and preserves the next raw cursor', async () => {
  const scope = { kind: 'directory', kitchenSlug: 'venue' },
    calls = []
  const read = load(
    [
      { scope, items: [{ id: 'breakfast' }], nextCursor: 'a' },
      { scope, items: [menu('Main')], nextCursor: 'b' },
      { scope, items: [menu('Drinks')], nextCursor: 'c' },
    ],
    calls
  )
  const page = await read({ service: 'collection', limit: 2 })
  assert.deepEqual(
    page.items.map((row) => row.name),
    ['Main', 'Drinks']
  )
  assert.equal(page.nextCursor, 'c')
  assert.deepEqual(
    calls.map((row) => row.cursor),
    [undefined, 'a', 'b']
  )
})
test('combined online portal scans past a full ineligible page before returning collection and delivery', async () => {
  const scope = { kind: 'root' }, calls = []
  const pickup = menu('Pickup only')
  pickup.offering_options = pickup.offering_options.filter(row => row.type === 'collection')
  const courier = menu('Delivery only')
  courier.offering_options = courier.offering_options.filter(row => row.type === 'delivery')
  const read = load([
    {scope, items: Array.from({length:24}, (_,i)=>({id:`breakfast-${i}`})), nextCursor:'after-breakfast'},
    {scope, items:[pickup], nextCursor:'after-pickup'},
    {scope, items:[courier], nextCursor:'after-delivery'},
  ], calls)
  const result = await read({service:'online',limit:2})
  assert.deepEqual(result.items.map(row=>row.name),['Pickup only','Delivery only'])
  assert.equal(result.nextCursor,'after-delivery')
  assert.deepEqual(calls.map(row=>row.cursor),[undefined,'after-breakfast','after-pickup'])
})
test('online portal omits paused services and missing serving windows', async () => {
  const paused = menu('Paused')
  paused.offerings.forEach(row=>row.paused=true)
  const unscheduled = menu('No times')
  unscheduled.offerings.forEach(row=>row.hours.windows=[])
  const result = await load([{scope:{kind:'root'},items:[paused,unscheduled],nextCursor:null}],[])({service:'online'})
  assert.deepEqual(result.items,[])
})
test('service scanner reports a failed later raw page instead of returning a false empty result', async () => {
  const calls=[]
  const read=load([
    {scope:{kind:'root'},items:[{id:'breakfast'}],nextCursor:'next'},
    new Error('Read unavailable'),
  ],calls)
  await assert.rejects(read({service:'online'}),/Read unavailable/)
  assert.equal(calls.length,2)
})
test('food search scans beyond nonmatching eligible menus before pagination and keeps matching names', async()=>{
  const later=menu('Dinner')
  later.testMatches=[{id:'margherita',name:'Pizza Margherita'}]
  const scope={kind:'root'}, calls=[]
  const read=load([
    {scope,items:[menu('Breakfast')],nextCursor:'later'},
    {scope,items:[later],nextCursor:'more'},
  ],calls)
  const result=await read({service:'online',search:'margherita',limit:1})
  assert.equal(result.items.length,1)
  assert.equal(result.items[0].name,'Dinner')
  assert.deepEqual(result.items[0].matching_dishes,later.testMatches)
  assert.equal(result.nextCursor,'more')
  assert.deepEqual(calls.map(row=>row.cursor),[undefined,'later'])
})
test('a dish match on a delivery-only menu cannot leak into Collection search',async()=>{
  const delivery=menu('Delivery only')
  delivery.offering_options=delivery.offering_options.filter(option=>option.type==='delivery')
  delivery.testMatches=[{id:'pizza',name:'Pizza'}]
  const result=await load([{scope:{kind:'root'},items:[delivery],nextCursor:null}],[])({service:'collection',search:'pizza'})
  assert.deepEqual(result.items,[])
})
test('unknown service does not silently fall back to Browse', async () => {
  const calls = []
  await assert.rejects(load([], calls)({ service: 'unknown' }), /Unknown/)
  assert.equal(calls.length, 0)
})

const projectionSource = readFileSync(
  new URL('../runtime/menu/utils/service-sections.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const pricingSource = readFileSync(
  new URL('../runtime/kitchen/utils/promotions/pricing.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const pricingHelpers = compileFunction(
  stripTypeScriptTypes(pricingSource) +
    '; return { promotionPricedItem, promotionDay, promotionDays }'
)()
const hoursSource = readFileSync(
  new URL(
    '../../../fireux-places/src/runtime/place/utils/opening-hours-status.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const readOpeningHoursStatus = compileFunction(
  stripTypeScriptTypes(hoursSource) + '; return readOpeningHoursStatus'
)()
const serviceSections = compileFunction(
  stripTypeScriptTypes(projectionSource) + '; return serviceSections',
  ['readOpeningHoursStatus', ...Object.keys(pricingHelpers)]
)(readOpeningHoursStatus, ...Object.values(pricingHelpers))
const sourceMenu = (id, label, dishIds, offering = 'evening') => ({
  manifest: {
    content: {
      sections: [
        {
          id: 'section',
          label,
          items: dishIds.map((dishId) => ({
            id: `${id}-${dishId}`,
            dishId,
            name: dishId,
          })),
        },
      ],
    },
    source: { kitchenId: 'kitchen', menuId: id },
    presentation: { currencyCode: 'CHF' },
  },
  offerings: [{ id: offering }],
})
test('collection combines named sections and deduplicates catalogue items across menus and sections', () => {
  const result = serviceSections([
    sourceMenu('food', 'Pizza', ['margherita', 'salami']),
    sourceMenu('other', 'pizza', ['margherita', 'funghi'], 'lunch'),
    sourceMenu('drinks', 'Drinks', ['water']),
    sourceMenu('duplicate', 'Specials', ['margherita']),
  ])
  assert.deepEqual(
    result.map((section) => section.label),
    ['Pizza', 'Drinks']
  )
  assert.deepEqual(
    result[0].items.map((row) => row.item.dishId),
    ['margherita', 'salami', 'funghi']
  )
  assert.deepEqual(
    result[0].items[0].offerings.map((row) => row.id),
    ['evening', 'lunch']
  )
})
test('collection excludes private, daily and ineligible sources and preserves distinct unlinked items', () => {
  const privateMenu = sourceMenu('private', 'Private', ['private'])
  privateMenu.manifest.content.audience = 'private_link'
  const daily = sourceMenu('daily', 'Daily', ['daily'])
  daily.manifest.content.daily = { date: '2026-10-16' }
  const ineligible = sourceMenu('closed', 'Closed', ['closed'])
  ineligible.offerings = []
  assert.deepEqual(serviceSections([privateMenu, daily, ineligible]), [])
  assert.equal(
    serviceSections([
      sourceMenu('a', 'Food', ['']),
      sourceMenu('b', 'Food', ['']),
    ])[0].items.length,
    2
  )
})

test('shared section times are compact, while differing item schedules stay explicit', () => {
  const shared = serviceSections([sourceMenu('main', 'Food', ['a', 'b'])])
  assert.deepEqual(
    shared[0].offerings.map((row) => row.id),
    ['evening']
  )
  const mixed = serviceSections([
    sourceMenu('main', 'Food', ['a']),
    sourceMenu('lunch', 'Food', ['b'], 'lunch'),
  ])
  assert.deepEqual(mixed[0].offerings, [])
  assert.deepEqual(
    mixed[0].items.map((row) => row.offerings[0].id),
    ['evening', 'lunch']
  )
})

test('delivery uses only explicit delivery options and delivery serving times', () => {
  assert.deepEqual(
    menuServiceOfferings(menu(), 'delivery').map((row) => row.id),
    ['delivery']
  )
  const collectionOnly = menu()
  collectionOnly.offering_options = [collectionOnly.offering_options[0]]
  assert.deepEqual(menuServiceOfferings(collectionOnly, 'delivery'), [])
  for (const change of [
    (row) => (row.offering_options[1].paused = true),
    (row) => (row.offerings[1].paused = true),
    (row) => (row.offerings[1].hours.windows = []),
  ]) {
    const row = menu()
    change(row)
    assert.deepEqual(menuServiceOfferings(row, 'delivery'), [])
    assert.equal(menuServiceOfferings(row, 'collection').length, 1)
  }
})
test('delivery pagination skips collection-only menus without losing later matches', async () => {
  const collectionOnly = menu('Collection only')
  collectionOnly.offering_options = [collectionOnly.offering_options[0]]
  const calls = []
  const page = await load(
    [
      { items: [collectionOnly], nextCursor: 'next' },
      { items: [menu('Drinks')], nextCursor: null },
    ],
    calls
  )({ service: 'delivery', limit: 1 })
  assert.equal(page.items[0].name, 'Drinks')
  assert.equal(calls[1].cursor, 'next')
  assert.equal(calls[1].service, 'delivery')
})

test('service item endpoint carries Delivery through every page and excludes documents', async () => {
  const handlerSource = readFileSync(
    new URL(
      '../runtime/server/api/menus/service/items.get.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
    .replace('export default', 'const handler =')
  const calls = [],
    fetched = []
  const pages = [
    {
      items: [
        { ...menu('Main'), slug: 'main' },
        { ...menu('PDF'), kind: 'doc' },
      ],
      nextCursor: 'next',
    },
    { items: [{ ...menu('Drinks'), slug: 'drinks' }], nextCursor: null },
  ]
  const handler = compileFunction(
    stripTypeScriptTypes(handlerSource) + '; return handler',
    [
      'defineLiveReadHandler',
      'getQuery',
      'createError',
      'readMenuDirectoryPage',
      'menuServiceOfferings',
      'serviceSections',
    ]
  )(
    (read) => read,
    () => ({ kitchenSlug: 'venue', service: 'delivery' }),
    (error) => new Error(error.statusMessage),
    async (input) => {
      calls.push(input)
      return pages.shift()
    },
    menuServiceOfferings,
    serviceSections
  )
  const result = await handler({
    $fetch: async (url, options) => {
      fetched.push({ url, options })
      return {
        kind: 'manifest',
        manifest: sourceMenu(url, 'Food', ['shared']).manifest,
      }
    },
  })
  assert.equal(fetched.length, 2)
  assert.deepEqual(
    calls.map((input) => input.service),
    ['delivery', 'delivery']
  )
  assert.equal(calls[1].cursor, 'next')
  const sections = serviceSections(result.sources)
  assert.equal(sections[0].items.length, 1)
  assert.deepEqual(
    sections[0].offerings.map((row) => row.id),
    ['delivery']
  )
  assert.equal(fetched[0].options.query.kitchenSlug, 'venue')
})

test('At your table uses dine-in eligibility and only its serving times', () => {
  const row = menu('Main')
  row.offerings.push({ id: 'tables', paused: false, hours: { windows: [{}] } })
  row.offering_options.push({ type: 'dine_in', kitchen_offering_id: 'tables' })
  assert.deepEqual(
    menuServiceOfferings(row, 'table').map((offering) => offering.id),
    ['tables']
  )
  for (const change of [
    (value) => (value.offering_options[2].paused = true),
    (value) => (value.offerings[2].paused = true),
    (value) => (value.offerings[2].hours.windows = []),
  ]) {
    const value = structuredClone(row)
    change(value)
    assert.deepEqual(menuServiceOfferings(value, 'table'), [])
    assert.equal(menuServiceOfferings(value, 'collection').length, 1)
  }
  assert.deepEqual(menuServiceOfferings(menu(), 'table'), [])
})
test('table pagination excludes collection-only menus and retains later dine-in matches', async () => {
  const tables = menu('Lunch')
  tables.offerings = [{ id: 'lunch', paused: false, hours: { windows: [{}] } }]
  tables.offering_options = [{ type: 'dine_in', kitchen_offering_id: 'lunch' }]
  const calls = []
  const result = await load(
    [
      { items: [menu()], nextCursor: 'next' },
      { items: [tables], nextCursor: null },
    ],
    calls
  )({ service: 'table', limit: 1 })
  assert.deepEqual(
    result.items.map((row) => row.name),
    ['Lunch']
  )
  assert.equal(calls[1].service, 'table')
})

test('Room service uses only room-service eligibility and serving times', () => {
  const row = menu('Main')
  row.offerings.push({ id: 'rooms', paused: false, hours: { windows: [{}] } })
  row.offering_options.push({
    type: 'room_service',
    kitchen_offering_id: 'rooms',
  })
  assert.deepEqual(
    menuServiceOfferings(row, 'room_service').map((offering) => offering.id),
    ['rooms']
  )
  assert.deepEqual(menuServiceOfferings(menu(), 'room_service'), [])
  for (const change of [
    (value) => (value.offering_options[2].paused = true),
    (value) => (value.offerings[2].paused = true),
    (value) => (value.offerings[2].hours.windows = []),
  ]) {
    const value = structuredClone(row)
    change(value)
    assert.deepEqual(menuServiceOfferings(value, 'room_service'), [])
    assert.equal(menuServiceOfferings(value, 'delivery').length, 1)
  }
})
test('room-service pagination retains later eligible menus', async () => {
  const rooms = menu('Supper')
  rooms.offerings = [{ id: 'rooms', paused: false, hours: { windows: [{}] } }]
  rooms.offering_options = [
    { type: 'room_service', kitchen_offering_id: 'rooms' },
  ]
  const calls = []
  const result = await load(
    [
      { items: [menu()], nextCursor: 'next' },
      { items: [rooms], nextCursor: null },
    ],
    calls
  )({ service: 'room_service', limit: 1 })
  assert.deepEqual(
    result.items.map((row) => row.name),
    ['Supper']
  )
  assert.equal(calls[1].service, 'room_service')
})

const roomSource = readFileSync(
  new URL('../runtime/menu/utils/room-service.ts', import.meta.url),
  'utf8'
).replace(/^export /gm, '')
const { roomServiceRoomNumber, roomServiceEntrancePath } = compileFunction(
  stripTypeScriptTypes(roomSource) +
    '; return { roomServiceRoomNumber, roomServiceEntrancePath }'
)()
test('room entrance requires a room and preserves its label in the dedicated URL', () => {
  for (const value of [
    undefined,
    null,
    '',
    ' ',
    ['204'],
    '../204',
    '204/205',
    '<204>',
  ]) {
    assert.equal(roomServiceRoomNumber(value), '')
    assert.equal(roomServiceEntrancePath('venue', value), '')
  }
  assert.equal(roomServiceRoomNumber(' 0204 '), '0204')
  assert.equal(
    roomServiceEntrancePath('venue', '0204'),
    '/kitchens/venue/room-service/0204'
  )
  assert.equal(
    roomServiceEntrancePath('venue', 'Suite A-2'),
    '/kitchens/venue/room-service/Suite%20A-2'
  )
  const entrance = new URL(
    roomServiceEntrancePath('venue', '204'),
    'https://example.test'
  )
  const section = new URL('#service-section-2', entrance)
  assert.equal(section.pathname, entrance.pathname)
})

const tableSource = readFileSync(
  new URL('../runtime/menu/utils/table-service.ts', import.meta.url),
  'utf8'
).replace(/^export /gm, '')
const { tableServiceTableNumber, tableServiceEntrancePath } = compileFunction(
  stripTypeScriptTypes(tableSource) +
    '; return { tableServiceTableNumber, tableServiceEntrancePath }'
)()
test('table entrance requires a table number and preserves it across section navigation', () => {
  for (const value of [
    undefined,
    null,
    '',
    ' ',
    ['12'],
    '../12',
    '12/13',
    '<12>',
  ]) {
    assert.equal(tableServiceTableNumber(value), '')
    assert.equal(tableServiceEntrancePath('venue', value), '')
  }
  assert.equal(tableServiceTableNumber(' 012 '), '012')
  assert.equal(
    tableServiceEntrancePath('venue', '012'),
    '/kitchens/venue/table-service/012'
  )
  assert.equal(
    tableServiceEntrancePath('venue', 'Terrace A-2'),
    '/kitchens/venue/table-service/Terrace%20A-2'
  )
  const entrance = new URL(
    tableServiceEntrancePath('venue', '12'),
    'https://example.test'
  )
  assert.equal(
    new URL('#service-section-3', entrance).pathname,
    entrance.pathname
  )
})

test('large overlapping catalogues remain unique, ordered and retain every service schedule', () => {
  const sources = Array.from({ length: 120 }, (_, index) =>
    sourceMenu(
      `menu-${index}`,
      `Section ${index % 6}`,
      Array.from({ length: 100 }, (_, item) => `dish-${item}`),
      `schedule-${index}`
    )
  )
  const result = serviceSections(sources)
  const items = result.flatMap((section) => section.items)
  assert.equal(items.length, 100)
  assert.equal(new Set(items.map((row) => row.key)).size, 100)
  assert.equal(items[0].item.dishId, 'dish-0')
  assert.equal(items[99].item.dishId, 'dish-99')
  assert.ok(items.every((row) => row.offerings.length === 120))
  assert.equal(
    result.length,
    1,
    'duplicate-only sections must not leave empty navigation entries'
  )
})
test('different kitchens never collapse equal catalogue IDs', () => {
  const first = sourceMenu('a', 'Food', ['same'])
  const second = sourceMenu('b', 'Food', ['same'])
  second.manifest.source.kitchenId = 'another-kitchen'
  assert.equal(serviceSections([first, second])[0].items.length, 2)
})
test('dedicated table and room labels reject punctuation-only context', () => {
  for (const label of ['.', '..', '-', '_', '...']) {
    assert.equal(tableServiceTableNumber(label), '')
    assert.equal(roomServiceRoomNumber(label), '')
  }
})
