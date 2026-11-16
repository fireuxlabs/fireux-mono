import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { PlaceDefaults } from 'fireux-places/runtime/place/utils/normalize-place'
import { normalizeKitchen } from '../../runtime/kitchen/utils/normalize-kitchen.ts'
import { readKitchenDocument } from '../../runtime/kitchen/utils/read-kitchen-document.ts'
import { useKitchenInterface } from '../../runtime/kitchen/composables/useKitchenInterface.ts'
import { toKitchenCollectionCell } from '../../runtime/kitchen/utils/kitchen-interface-projection.ts'
import {
  resolveKitchen,
  readKitchenRelatedRecords,
  projectKitchenDetail,
} from '../../runtime/kitchen/server/identity/read.ts'
import { kitchenServiceSummary } from '../../runtime/kitchen/utils/service-summary.ts'

const root = (id, visibility = true) => ({
  identity: { slug: id, status: 'active', visibility },
  created: {
    at: { seconds: 1, nanoseconds: 0 },
    by: 'operator',
    app_id: 'app',
  },
  context: 'Private Kitchen notes',
  guidance_ids: ['private-guidance'],
  services: { title: 'Dinner', item_images: true },
})
const place = (id) => ({
  ...structuredClone(PlaceDefaults),
  id,
  name: 'Place name',
  image_url: '/place-photo.png',
  cover_image: '/cover.png',
  default_currency_code: 'GBP',
  tagline: 'Place tagline',
})

test('canonical and normalized public Kitchen retain distinct data boundaries and same-ID Place', () => {
  const stored = root('venue')
  const canonical = readKitchenDocument(stored, 'venue')
  assert.equal(canonical.context, stored.context)
  assert.deepEqual(canonical.guidance_ids, ['private-guidance'])
  const summary = normalizeKitchen('venue', stored, place('venue'))
  assert.deepEqual(Object.keys(summary).sort(), [
    'id',
    'identity',
    'place',
    'services',
  ])
  assert.equal(summary.identity.source, undefined)
  assert.equal(summary.services.title, 'Dinner')
  assert.equal(normalizeKitchen('venue', stored, place('another')), null)
  assert.equal(
    normalizeKitchen(
      'venue',
      { ...stored, identity: { ...stored.identity, status: 'published' } },
      place('venue')
    ),
    null
  )
  assert.equal(
    readKitchenDocument(
      { ...stored, identity: { ...stored.identity, visibility: 'yes' } },
      'venue'
    ),
    null
  )
})

test('explicit surface preserves Kitchen identity and Place display precedence without root preimages', () => {
  const canonical = readKitchenDocument(root('venue', false), 'venue')
  const input = {
    ...canonical,
    name: 'Copied root name',
    image_url: '/root-photo.png',
    currency: 'CHF',
    fulfilment: { modes: ['delivery'] },
    integrations: { private: true },
    service_labels: ['Browse menus', 'Delivery', 'Delivery'],
    has_published_menu: false,
  }
  const ui = useKitchenInterface()
  const view = ui.surface({
    kitchen: input,
    place: place('venue'),
    routeScope: 'live',
  })
  assert.equal(view.identity, canonical.identity)
  assert.equal(view.display_name, 'Place name')
  assert.equal(view.display_image_url, '/place-photo.png')
  assert.equal(view.currency_code, 'GBP')
  assert.equal(view.created.by, 'operator')
  for (const key of ['fulfilment', 'integrations', 'currency'])
    assert.equal(Object.hasOwn(view, key), false)
  const card = ui.interface(view)
  assert.equal(card.discoveryImageUrl, '/cover.png')
  assert.equal(card.name, 'Place name')
  assert.equal(Object.hasOwn(card, 'fulfilmentModes'), false)
  assert.deepEqual(toKitchenCollectionCell(card).badges, ['Hidden'])
  assert.equal(toKitchenCollectionCell(card).to, '/kitchens/venue/menu')
  assert.equal(ui.surface({ kitchen: input, place: place('another') }), null)
})

test('directory enrichment and exact detail preserve visibility and omit protected root metadata', async () => {
  const records = new Map([
    ['visible', root('visible')],
    ['hidden', root('hidden', false)],
  ])
  const db = {
    collection(name) {
      if (name === 'places') return { doc: (id) => ({ path: `places/${id}` }) }
      let selected
      const query = {
        where(_field, _operator, id) {
          selected = id
          return query
        },
        orderBy() {
          return query
        },
        limit() {
          return query
        },
        async get() {
          return {
            docs: [...records]
              .filter(([id]) => !selected || selected === id)
              .map(([id, data]) => ({ id, data: () => data })),
          }
        },
      }
      return query
    },
    async getAll(...refs) {
      return refs.map((ref) => ({
        exists: true,
        ref,
        data: () => place(ref.path.split('/')[1]),
      }))
    },
  }
  const source = readFileSync(
    new URL('../../runtime/kitchen/server/index/read.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const dependencies = {
    getRuntimeFirestore: () => db,
    createError: (input) =>
      Object.assign(new Error(input.statusMessage), input),
    isFirestoreDocumentId: (value) => Boolean(value && !value.includes('/')),
    FieldPath: { documentId: () => '__name__' },
    resolveKitchen,
    readKitchenRelatedRecords,
    readKitchenOfferings: async () => [
      {
        id: 'browse',
        name: 'Browse',
        enabled: true,
        menu_ids: ['main'],
        interactions: [{ type: 'browse', enabled: true }],
      },
    ],
    kitchenServiceSummary,
    currentMenuAppId: () => 'app',
    readPlaceCurrencyCode: () => 'CHF',
    readPublishedPublicMenuSummary: async () => ({ hasPublishedMenu: true }),
  }
  const read = compileFunction(
    `${stripTypeScriptTypes(source)}; return readKitchens`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const visible = await read()
  assert.deepEqual(
    visible.map((item) => item.id),
    ['visible']
  )
  assert.deepEqual(visible[0].service_labels, [])
  assert.equal(visible[0].has_published_menu, true)
  const all = await read({ includeHidden: true })
  assert.equal(
    all.find((item) => item.id === 'hidden').has_published_menu,
    false
  )
  assert.deepEqual(await read({ placeId: 'hidden' }), [])
  for (const item of all)
    for (const key of ['created', 'context', 'guidance_ids'])
      assert.equal(Object.hasOwn(item, key), false)
  const detail = projectKitchenDetail(
    { id: 'visible', data: records.get('visible') },
    new Map([['places/visible', place('visible')]]),
    {},
    { enabled: false, requested_languages: [] },
    []
  )
  assert.equal(detail.presentation.name, 'Place name')
  assert.equal(detail.kitchen.place.id, detail.kitchen.id)
  assert.equal(Object.hasOwn(detail.kitchen, 'context'), false)
})
