import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { computed, effectScope, ref, toValue, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  provideKitchenItemContext,
  useKitchenItemContext,
} from '../../../runtime/kitchen/composables/items/useKitchenItemContext.ts'
import { readItemIdentity } from '../../../runtime/kitchen/utils/item-identity.ts'
import { readItemSellingTerms } from '../../../runtime/kitchen/utils/item-pricing.ts'
import { ItemStorage } from '../../../runtime/kitchen/models/item.model.ts'
import { serverKitchenItemsTarget } from '../../../runtime/kitchen/server/mutation-targets.ts'

const at = { seconds: 100, nanoseconds: 20 }

test('Item storage and trusted target use the same Item collection', () => {
  const target = serverKitchenItemsTarget('k')
  assert.equal(ItemStorage.path, 'kitchens/{kitchenId}/items/{dishId}')
  assert.equal(target.collectionPath, 'kitchens/k/items')
  assert.equal(target.key, 'kitchens.items')
})

test('historical Item identity is read without importing layers or trusting stored ownership', () => {
  const source = {
    id: 'wrong',
    kitchen_id: 'wrong-kitchen',
    name: ' Aioli ',
    description: ' Garlic mayonnaise ',
    image: ' https://example.test/photo.webp ',
    is_flagship: true,
    item_kind: 'food',
    category: 'Sauces',
    price: 9.5,
    price_options: [{ label: 'Large', price: 12 }],
    preparation_station_ids: ['bar'],
    created: { at, by: 'operator', app_id: 'misebox' },
    updated: { at, by: 'operator', app_id: 'historical-extra' },
  }
  const before = structuredClone(source)
  const item = readStoredItem('aioli', source)
  assert.deepEqual(item, {
    id: 'aioli',
    name: 'Aioli',
    item_kind: 'food',
    description: 'Garlic mayonnaise',
    image: 'https://example.test/photo.webp',
    created: { at, by: 'operator', app_id: 'misebox' },
    updated: { at, by: 'operator' },
    choice_groups: [
      {
        id: 'legacy-variants',
        name: 'Variants',
        min: 1,
        max: 1,
        pricing: 'full',
        options: [{ id: 'large', label: 'Large', price: 12 }],
      },
    ],
  })
  assert.deepEqual(source, before)
  item.created.at.seconds = 999
  assert.equal(source.created.at.seconds, 100)
})

test('missing or malformed historical provenance stays absent, without invented values', () => {
  assert.deepEqual(
    readStoredItem('old', { name: 'Old item', description: '', image: null }),
    {
      id: 'old',
      name: 'Old item',
    }
  )
  for (const stamp of [
    null,
    {},
    { at: {} },
    { at: { seconds: NaN, nanoseconds: 0 } },
    { at: { seconds: 1, nanoseconds: -1 } },
  ]) {
    const result = readStoredItem('old', {
      name: 'Old item',
      created: stamp,
      updated: stamp,
    })
    assert.equal(Object.hasOwn(result, 'created'), false)
    assert.equal(Object.hasOwn(result, 'updated'), false)
  }
})

function readerFixture() {
  const kitchenId = ref('k'),
    itemId = ref('aioli')
  const access = {
    outcome: ref('ready'),
    ids: ref(['k', 'other']),
    error: ref(),
  }
  const state = ref('ready'),
    error = ref()
  const records = ref({
    'kitchens/k/items/aioli': { id: 'forged', name: 'Aioli' },
    'kitchens/other/items/aioli': { name: 'Other Aioli' },
  })
  let bindings = 0,
    path
  const sourceText = readFileSync(
    new URL(
      '../../../runtime/kitchen/composables/items/useKitchenItemRead.ts',
      import.meta.url
    ),
    'utf8'
  )
  const source = stripTypeScriptTypes(sourceText)
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const deps = {
    computed,
    readItemIdentity,
    readItemSellingTerms,
    toValue,
    ItemStorage,
    useKitchenAccess: () => access,
    readRuntimeFirestoreDatabaseId: () => 'misebox',
    useFirestoreRead: () => ({
      firestoreFetchDoc: (collection, id) => {
        bindings++
        path = computed(() =>
          toValue(collection) ? `${toValue(collection)}/${toValue(id)}` : ''
        )
        const value = computed(() =>
          state.value === 'ready' ? records.value[path.value] : undefined
        )
        return Object.assign(value, {
          error,
          outcome: computed(() =>
            state.value === 'ready'
              ? value.value
                ? 'ready'
                : 'empty'
              : state.value
          ),
        })
      },
    }),
  }
  const use = new Function(
    ...Object.keys(deps),
    `${source}; return useKitchenItemRead`
  )(...Object.values(deps))
  const scope = effectScope()
  const reader = scope.run(() => use(kitchenId, itemId))
  return {
    kitchenId,
    itemId,
    access,
    state,
    error,
    scope,
    reader,
    path,
    bindings,
    records,
  }
}

test('one Item reader uses the Items path and rebinds exact Kitchen/Item scope', () => {
  const f = readerFixture()
  assert.equal(f.bindings, 1)
  assert.equal(f.path.value, 'kitchens/k/items/aioli')
  assert.equal(f.reader.item.value.id, 'aioli')
  f.kitchenId.value = 'other'
  assert.equal(f.path.value, 'kitchens/other/items/aioli')
  assert.equal(f.reader.item.value.name, 'Other Aioli')
  f.itemId.value = 'missing'
  assert.equal(f.reader.outcome.value, 'empty')
  assert.equal(f.reader.item.value, null)
  f.access.ids.value = []
  assert.equal(f.path.value, '')
  assert.equal(f.reader.canWrite.value, false)
  f.scope.stop()
})

test('Item reader preserves pending/error/idle and withholds retained identity', () => {
  const f = readerFixture()
  f.state.value = 'pending'
  assert.equal(f.reader.outcome.value, 'pending')
  assert.equal(f.reader.item.value, null)
  f.state.value = 'error'
  f.error.value = Error('Denied')
  assert.equal(f.reader.outcome.value, 'error')
  assert.equal(f.reader.error.value.message, 'Denied')
  f.access.outcome.value = 'pending'
  assert.equal(f.path.value, '')
  assert.equal(f.reader.outcome.value, 'pending')
  f.kitchenId.value = ''
  assert.equal(f.reader.outcome.value, 'idle')
  f.scope.stop()
})

function readStoredItem(id, data) {
  const f = readerFixture()
  f.records.value = { [`kitchens/k/items/${id}`]: data }
  f.itemId.value = id
  const item = f.reader.item.value
  f.scope.stop()
  return item
}

test('Item context shares the exact reader and rejects use outside its owner', async () => {
  const owner = {
    item: ref({ id: 'aioli', name: 'Aioli' }),
    canWrite: ref(true),
  }
  const Child = {
    setup() {
      const context = useKitchenItemContext()
      assert.equal(context, owner)
      return () => h('p', context.item.value.name)
    },
  }
  const render = () =>
    renderToString(
      createSSRApp({
        setup() {
          assert.equal(provideKitchenItemContext(owner), owner)
          return () => h(Child)
        },
      })
    )
  assert.match(await render(), /Aioli/)
  owner.item.value = { id: 'soup', name: 'Soup' }
  assert.match(await render(), /Soup/)
  const orphan = createSSRApp(Child)
  orphan.config.warnHandler = () => {}
  await assert.rejects(
    renderToString(orphan),
    /requires its Item context provider/
  )
})

test('Item keeps independently valid provenance without requiring a second record shape', () => {
  const item = readStoredItem('partial', {
    name: 'Soup',
    created: { at: { seconds: 1.5, nanoseconds: 0 } },
    updated: { at, by: ' operator ', app_id: 'not-an-update-field' },
  })
  assert.equal(Object.hasOwn(item, 'created'), false)
  assert.deepEqual(item.updated, { at, by: 'operator' })
})

test('selling terms share the canonical Item read without inventing a normal price', () => {
  const f = readerFixture()
  f.records.value['kitchens/k/items/aioli'] = {
    name: 'Aioli',
    price_options: [{ label: 'Large', quantity: 0, unit: '', price: 12 }],
    add_ons: [{ id: 'garlic', label: 'Garlic', price: 0 }],
  }
  assert.equal(f.bindings, 1)
  assert.equal(f.reader.item.value.id, 'aioli')
  assert.equal(f.reader.item.value.name, 'Aioli')
  assert.equal(f.reader.item.value.price, undefined)
  assert.deepEqual(
    f.reader.item.value.choice_groups.map((group) => [
      group.min,
      group.max,
      group.pricing,
    ]),
    [
      [1, 1, 'full'],
      [0, null, 'additional'],
    ]
  )
  assert.equal(f.reader.pricingError.value, null)
  f.access.ids.value = []
  assert.equal(f.reader.item.value, null)
  f.scope.stop()
})

test('malformed selling data does not hide Item identity or become editable empty defaults', () => {
  const f = readerFixture()
  f.records.value['kitchens/k/items/aioli'] = {
    name: 'Aioli',
    choice_groups: [{ bad: true }],
  }
  assert.equal(f.reader.outcome.value, 'ready')
  assert.equal(f.reader.item.value.name, 'Aioli')
  assert.equal(f.reader.item.value?.price, undefined)
  assert.ok(f.reader.pricingError.value instanceof Error)
  assert.deepEqual(f.records.value['kitchens/k/items/aioli'].choice_groups, [
    { bad: true },
  ])
  f.scope.stop()
})
