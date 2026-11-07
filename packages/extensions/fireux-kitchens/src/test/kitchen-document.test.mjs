import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
import { readKitchenDocument } from '../runtime/kitchen/utils/read-kitchen-document.ts'

const stamp = {
  at: { seconds: 123, nanoseconds: 456 },
  by: 'operator',
  app_id: 'app',
}
const canonical = (id = 'kitchen') => ({
  id,
  identity: { slug: id, status: 'active', visibility: true },
  created: structuredClone(stamp),
})

test('Stored Kitchen preserves audited creation, optional update/source and declared capability configuration', () => {
  const kitchen = {
    ...canonical(),
    context: 'Operator context',
    updated: structuredClone(stamp),
    theme: {
      palette: {
        canvas: '#ffffff',
        text: '#000000',
        accent: '#ff0000',
        accent_contrast: '#ffffff',
      },
    },
    orders: {
      operation_hours: {
        source: 'custom',
        timezone: 'Europe/Zurich',
        windows: [{ days: ['monday'], open: '22:00', close: '02:00' }],
      },
      printing: { ticket_device_id: '' },
    },
    services: { title: 'Food & drinks', item_images: false },
    tables: { count: 0 },
  }
  assert.deepEqual(readKitchenDocument(kitchen, 'kitchen'), kitchen)
  for (const status of ['active', 'inactive', 'archived']) {
    const value = canonical()
    value.identity.status = status
    assert.deepEqual(readKitchenDocument(value, value.id), value)
    assert.equal(
      Object.hasOwn(readKitchenDocument(value, value.id).identity, 'source'),
      false
    )
    for (const source of ['user', 'place']) {
      value.identity.source = source
      assert.equal(readKitchenDocument(value, value.id).identity.source, source)
    }
  }
  const { id, ...stored } = canonical()
  assert.equal(readKitchenDocument(stored, id).id, id)
  assert.equal(Object.hasOwn(readKitchenDocument(stored, id), 'updated'), false)
})

test('Stored Kitchen rejects invalid identity, stamps, borrowed Place facts and retired children', () => {
  const cases = [
    null,
    [],
    { ...canonical(), id: 'other' },
    { ...canonical(), identity: {} },
    {
      ...canonical(),
      identity: { ...canonical().identity, source: 'unknown' },
    },
    {
      ...canonical(),
      identity: { ...canonical().identity, status: 'published' },
    },
    {
      ...canonical(),
      identity: { ...canonical().identity, visibility: 'true' },
    },
    { ...canonical(), identity: { ...canonical().identity, slug: '' } },
    {
      ...canonical(),
      identity: { ...canonical().identity, name: 'Place-owned' },
    },
    { ...canonical(), created: undefined },
    { ...canonical(), created: { at: '2026-11-07' } },
    {
      ...canonical(),
      created: { ...stamp, at: { seconds: NaN, nanoseconds: 0 } },
    },
    {
      ...canonical(),
      created: { ...stamp, at: { seconds: 0, nanoseconds: 1_000_000_000 } },
    },
    { ...canonical(), updated: { ...stamp, app_id: 123 } },
    { ...canonical(), context: {} },
    { ...canonical(), name: 'Borrowed Place' },
    { ...canonical(), currency: 'CHF' },
    { ...canonical(), fulfilment: { modes: ['collection'] } },
    { ...canonical(), integrations: {} },
    { ...canonical(), services: [] },
    { ...canonical(), tables: { count: 501 } },
    { ...canonical(), theme: { palette: {} } },
    { ...canonical(), orders: { printing: { ticket_device_id: 1 } } },
    {
      ...canonical(),
      orders: {
        operation_hours: {
          source: 'custom',
          timezone: '',
          windows: [{ days: ['funday'], open: '12:00', close: '13:00' }],
        },
      },
    },
  ]
  for (const value of cases)
    assert.equal(readKitchenDocument(value, 'kitchen'), null)
  assert.equal(readKitchenDocument(canonical(), 'bad/path'), null)
})

function targetsHarness() {
  const access = {
    ids: ref(['a', 'b']),
    outcome: ref('ready'),
    pending: ref(false),
    error: ref(),
  }
  const kitchen = {
    docs: ref([canonical('a'), canonical('b')]),
    outcome: ref('ready'),
    error: ref(),
  }
  const place = {
    docs: ref([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]),
    outcome: ref('ready'),
    error: ref(),
  }
  const options = []
  const enabled = ref(true)
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/composables/useKitchenCollection.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const bindings = {
    computed,
    toValue,
    readKitchenDocument,
    useKitchenAccess: () => access,
    useFirestoreRead: () => ({
      firestoreLoadDocsByIds: (input) => {
        options.push(input)
        return options.length === 1 ? kitchen : place
      },
    }),
    useKitchenInterface: () => ({
      surface: ({ kitchen, place }) => ({
        ...kitchen,
        presentation: { display_name: place?.name || '' },
      }),
    }),
  }
  const factory = compileFunction(
    `${stripTypeScriptTypes(source)}; return useKitchenCollection`,
    Object.keys(bindings)
  )(...Object.values(bindings))
  return {
    access,
    kitchen,
    place,
    options,
    enabled,
    state: factory({ enabled }),
  }
}

test('Membership Kitchen collection masks malformed roots, recovers and ignores revoked bindings', () => {
  const h = targetsHarness()
  assert.equal(h.state.outcome.value, 'ready')
  assert.equal(h.state.count.value, 2)
  h.kitchen.docs.value = [canonical('a'), { ...canonical('b'), identity: {} }]
  assert.equal(h.state.outcome.value, 'error')
  assert.equal(h.state.count.value, 0)
  assert.deepEqual(h.state.kitchens.value, [])
  assert.deepEqual(h.options[1].ids.value, [])
  h.kitchen.docs.value = [canonical('a'), canonical('b')]
  assert.equal(h.state.count.value, 2)
  assert.equal(h.state.error.value, undefined)

  h.access.ids.value = ['a']
  h.kitchen.docs.value = [canonical('a'), { ...canonical('b'), identity: {} }]
  assert.deepEqual(
    h.state.kitchens.value.map(({ id }) => id),
    ['a']
  )
  assert.equal(h.state.outcome.value, 'ready')
  h.place.error.value = new Error('Place failed')
  assert.equal(h.state.outcome.value, 'error')
  assert.equal(h.state.count.value, 0)
  h.enabled.value = false
  assert.equal(h.state.outcome.value, 'idle')
  assert.equal(h.state.error.value, undefined)
  assert.equal(h.state.count.value, 0)
  h.enabled.value = true
  h.access.ids.value = []
  assert.equal(h.state.outcome.value, 'empty')
  assert.equal(h.state.error.value, undefined)
})
