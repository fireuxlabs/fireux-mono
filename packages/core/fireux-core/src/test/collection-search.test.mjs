import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/composables/shared/useCollectionSearch.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const useCollectionSearch = compileFunction(
  `${stripTypeScriptTypes(source)}; return useCollectionSearch`,
  ['computed', 'ref']
)(computed, ref)
const base = () => ({ items: ref([]), makeCard: (item) => item })

test('default search keeps the existing pill/cell cycle and starting variant', () => {
  const search = useCollectionSearch(base())
  assert.equal(search.variant.value, 'pill')
  search.toggleVariant()
  assert.equal(search.variant.value, 'cell')
  search.toggleVariant()
  assert.equal(search.variant.value, 'pill')
  const cell = useCollectionSearch({ ...base(), initialVariant: 'cell' })
  assert.equal(cell.variant.value, 'cell')
})

test('custom single and subset variants never toggle into an unlisted variant', () => {
  const single = useCollectionSearch({ ...base(), variants: ['preview'] })
  for (let i = 0; i < 4; i++) {
    single.toggleVariant()
    assert.equal(single.variant.value, 'preview')
  }
  const variants = ['preview', 'cell']
  const subset = useCollectionSearch({
    ...base(),
    variants,
    initialVariant: 'cell',
  })
  variants.push('pill')
  for (const expected of ['preview', 'cell', 'preview', 'cell']) {
    subset.toggleVariant()
    assert.equal(subset.variant.value, expected)
  }
})

test('initial selection and externally changed selection fall back inside the allowed set', () => {
  const search = useCollectionSearch({
    ...base(),
    variants: ['cell', 'preview'],
    initialVariant: 'pill',
  })
  assert.equal(search.variant.value, 'cell')
  search.variant.value = 'pill'
  search.toggleVariant()
  assert.equal(search.variant.value, 'cell')
})

test('empty or unsupported runtime variant sets are rejected', () => {
  assert.throws(
    () => useCollectionSearch({ ...base(), variants: [] }),
    /at least one variant/
  )
  assert.throws(
    () => useCollectionSearch({ ...base(), variants: ['table'] }),
    /unsupported variant/
  )
})

test('shared card filtering normalizes queries and reacts to collection changes', () => {
  const items = ref(undefined)
  const search = useCollectionSearch({
    items,
    makeCard: (item) => item.card,
    initialQuery: '  PIZZA  ',
  })
  assert.deepEqual(search.normalizedItems.value, [])
  assert.equal(search.visibleCount.value, 0)
  items.value = [
    {
      id: 'food',
      card: { title: 'Pizza', tags: ['Food'], detail: { price: 11 } },
    },
    { id: 'drinks', card: { title: 'Coffee', available: true } },
    { id: 'hidden', card: null },
  ]
  assert.deepEqual(
    search.visibleItems.value.map((item) => item.id),
    ['food']
  )
  items.value.push({ id: 'new', card: { title: 'New pizza' } })
  assert.equal(search.visibleCount.value, 2)
  items.value = items.value.filter((item) => item.id !== 'food')
  assert.deepEqual(
    search.visibleItems.value.map((item) => item.id),
    ['new']
  )
  search.query.value = 'TRUE'
  assert.deepEqual(
    search.visibleItems.value.map((item) => item.id),
    ['drinks']
  )
  search.query.value = ' '
  assert.equal(search.visibleItems.value, search.normalizedItems.value)
})

test('custom search text retains precedence over card projection', () => {
  const items = ref([
    { id: 'first', name: 'Kitchen' },
    { id: 'second', name: 'Project' },
  ])
  const search = useCollectionSearch({
    items,
    searchText: (item) => item.name.toLowerCase(),
    makeCard: () => {
      throw new Error('Custom search must not project cards.')
    },
  })
  search.query.value = ' KITCHEN '
  assert.deepEqual(
    search.visibleItems.value.map((item) => item.id),
    ['first']
  )
})
