import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, result, dependencies, component = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (component)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = stripTypeScriptTypes(source)
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${source}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const useCollectionSearch = load(
  '../../../../core/fireux-core/src/runtime/composables/shared/useCollectionSearch.ts',
  'useCollectionSearch',
  { computed, ref }
)
const menuMatchesCollectionPicks = load(
  '../runtime/menu/utils/menu-collection-picks.ts',
  'menuMatchesCollectionPicks',
  {}
)

function collectionView(items) {
  const index = {
    collection: ref(items),
    directoryOutcome: ref({ kind: 'list' }),
    hasMore: ref(false),
  }
  const view = load(
    '../runtime/menu/components/Collection/Index.vue',
    '{ query, variant, toggleVariant, visibleItems, visibleCount, selectedPicks, showSearchInput }',
    {
      computed,
      ref,
      defineProps: () => ({ index }),
      withDefaults: (props, defaults) => ({ ...defaults, ...props }),
      useCollectionSearch,
      menuMatchesCollectionPicks,
      useDiagnosticsCollectionJson: (collection) => ({ devJsonData: collection }),
    },
    true
  )
  return { ...view, index }
}
const menus = [
  {
    id: 'food',
    name: 'Comida Casera',
    description: 'Swiss Alpine Tapas',
    status: 'published',
    source: { kitchen_name: 'La Tapberne' },
    contexts: ['collection'],
  },
  {
    id: 'pdf',
    name: 'Wine list',
    description: 'Local wines',
    status: 'published',
    kind: 'doc',
  },
]

test('collection search keeps real Menu and Kitchen fields, service filters and view switching', () => {
  const view = collectionView(menus)
  for (const query of ['COMIDA', 'alpine', 'tapberne', 'food']) {
    view.query.value = query
    assert.deepEqual(
      view.visibleItems.value.map((menu) => menu.id),
      ['food']
    )
  }
  view.query.value = 'wine'
  assert.deepEqual(
    view.visibleItems.value.map((menu) => menu.id),
    ['pdf']
  )
  view.selectedPicks.value = ['collection']
  assert.equal(view.visibleCount.value, 0)
  view.query.value = ''
  assert.equal(view.visibleCount.value, 1)
  assert.equal(view.variant.value, 'summary')
  for (const expected of ['cell', 'pill', 'summary']) {
    view.toggleVariant()
    assert.equal(view.variant.value, expected)
  }
})

test('collection search follows live records without fabricated availability or counts', () => {
  const view = collectionView(menus)
  for (const query of ['true', '0']) {
    view.query.value = query
    assert.equal(view.visibleCount.value, 0)
  }
  view.query.value = 'comida'
  view.index.collection.value = [{ ...menus[0], name: 'Dinner' }]
  assert.equal(view.visibleCount.value, 0)
  view.query.value = 'dinner'
  assert.equal(view.visibleCount.value, 1)
  view.index.collection.value = []
  assert.equal(view.visibleCount.value, 0)
})

test('search visibility still waits for all pages and more than fifteen records', () => {
  const view = collectionView(
    Array.from({ length: 16 }, (_, i) => ({ ...menus[0], id: String(i) }))
  )
  assert.equal(view.showSearchInput.value, true)
  view.index.hasMore.value = true
  assert.equal(view.showSearchInput.value, false)
  view.index.hasMore.value = false
  view.index.collection.value.pop()
  assert.equal(view.showSearchInput.value, false)
})

test('service display preserves unknown, open, closed and pre-order states reactively', () => {
  const now = ref(new Date('2026-09-16T16:00:00Z'))
  const hours = ref({ known: false, open: false })
  const orderType = ref('collection')
  const calls = []
  const useMenuOfferingComputed = load(
    '../runtime/menu/composables/useMenuOfferingComputed.ts',
    'useMenuOfferingComputed',
    {
      computed,
      toValue,
      useKitchenOfferingNow: () => ({ now }),
      readWeekdayTimeOpenState: (config, time) => {
        calls.push({ config, time })
        return config
      },
    }
  )
  const state = useMenuOfferingComputed(hours, { orderType })
  assert.deepEqual(state.menuOfferingChip.value, {
    known: false,
    open: false,
    color: 'neutral',
    label: 'Serving times unavailable',
  })
  hours.value = { known: true, open: true }
  assert.equal(state.menuOfferingChip.value.color, 'success')
  assert.equal(state.menuOfferingChip.value.label, 'Serving now')
  hours.value = { known: true, open: false }
  assert.equal(state.menuOfferingChip.value.color, 'error')
  assert.equal(state.menuOfferingChip.value.label, 'Not serving now')
  orderType.value = 'pre_order'
  assert.equal(state.menuOfferingChip.value.color, 'neutral')
  assert.equal(state.menuOfferingChip.value.label, '')
  now.value = new Date('2026-09-16T17:00:00Z')
  assert.equal(state.menuOfferingOpenState.value.open, false)
  assert.equal(calls.at(-1).time, now.value)
})
