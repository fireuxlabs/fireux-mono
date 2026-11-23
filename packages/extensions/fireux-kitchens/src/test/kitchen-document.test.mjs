import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
import {
  readKitchenDocument,
  resolveKitchenPlaceId,
} from '../runtime/kitchen/utils/read-kitchen-document.ts'

const canonical = (id) => ({ id })

test('Kitchen projects path identity and loads no embedded or optional data', () => {
  const stored = {
    id: 'kitchen',
    identity: { name: 'Previous name' },
    items: [{ id: 'embedded', name: 'Ignore me' }],
    orders: { malformed: true },
  }
  const original = structuredClone(stored)
  assert.deepEqual(readKitchenDocument(stored, 'kitchen'), {
    id: 'kitchen',
    name: 'Previous name',
  })
  assert.deepEqual(stored, original)
  assert.equal(
    readKitchenDocument({ ...stored, name: ' New name ' }, 'kitchen', 'Place')
      .name,
    'New name'
  )
  assert.deepEqual(readKitchenDocument({}, 'kitchen'), {
    id: 'kitchen',
    name: 'kitchen',
  })
})

test('Kitchen requires a valid path ID and an existing matching document', () => {
  assert.equal(readKitchenDocument(undefined, 'kitchen'), null)
  assert.equal(readKitchenDocument([], 'kitchen'), null)
  assert.equal(readKitchenDocument({}, 'invalid/id'), null)
  assert.equal(readKitchenDocument({ id: 'elsewhere' }, 'kitchen'), null)
})

function targetsHarness() {
  const access = {
    ids: ref(['a', 'b', 'bad/id']),
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
    resolveKitchenPlaceId,
    useKitchenAccess: () => access,
    useFirestoreRead: () => ({
      firestoreLoadDocsByIds: (input) => {
        options.push(input)
        return options.length === 1 ? kitchen : place
      },
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

test('Membership Kitchen collection rejects invalid IDs and hides revoked bindings', () => {
  const h = targetsHarness()
  h.kitchen.docs.value = [canonical('a'), canonical('b')]
  assert.equal(h.state.outcome.value, 'ready')
  assert.equal(h.state.count.value, 2)
  assert.deepEqual(h.options[1].ids.value, ['a', 'b'])
  assert.equal(h.state.kitchens.value[0].name, 'A')
  h.kitchen.docs.value = [canonical('a'), { id: 'bad/id' }]
  assert.equal(h.state.outcome.value, 'error')
  assert.equal(h.state.count.value, 0)
  assert.deepEqual(h.state.kitchens.value, [])
  assert.deepEqual(h.options[1].ids.value, [])
  h.kitchen.docs.value = [canonical('a'), canonical('b')]
  assert.equal(h.state.count.value, 2)
  assert.equal(h.state.error.value, undefined)

  h.access.ids.value = ['a']
  h.kitchen.docs.value = [canonical('a'), { id: 'bad/id' }]
  assert.deepEqual(
    h.state.kitchens.value.map(({ id }) => id),
    ['a']
  )
  assert.equal(h.state.outcome.value, 'ready')
  h.place.error.value = new Error('Place failed')
  h.place.docs.value = []
  h.place.outcome.value = 'error'
  assert.equal(h.state.outcome.value, 'ready')
  assert.equal(h.state.count.value, 1)
  assert.equal(h.state.kitchens.value[0].name, 'a')
  h.enabled.value = false
  assert.equal(h.state.outcome.value, 'idle')
  assert.equal(h.state.error.value, undefined)
  assert.equal(h.state.count.value, 0)
  h.enabled.value = true
  h.access.ids.value = []
  assert.equal(h.state.outcome.value, 'empty')
  assert.equal(h.state.error.value, undefined)
})
