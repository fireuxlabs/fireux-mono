import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import * as choices from '../runtime/kitchen/utils/item-choices.ts'
import { normalizeDishPricingPatch } from '../runtime/kitchen/utils/dish-pricing.ts'
function load(path, result, deps) {
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/components/Menu/Items/' + path,
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + ';return ' + result,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('group controls configure all selection rules and preserve IDs through edits and movement', () => {
  const groups = Vue.ref([])
  const state = load(
    'Pricing/Groups.vue',
    '({addGroup,setRule,setPricing,moveOption,move})',
    {
      defineModel: () => groups,
      defineProps: () => ({ disabled: false, currency: 'CHF' }),
    }
  )
  state.addGroup()
  state.addGroup()
  const first = groups.value[0],
    originalId = first.id,
    optionId = first.options[0].id
  state.setRule(first, 'one')
  assert.deepEqual([first.min, first.max], [1, 1])
  state.setRule(first, 'optional')
  assert.deepEqual([first.min, first.max], [0, 1])
  state.setRule(first, 'several')
  assert.deepEqual([first.min, first.max], [0, null])
  state.setRule(first, 'limits')
  assert.deepEqual([first.min, first.max], [1, 2])
  state.setPricing(first, 'full')
  assert.deepEqual([first.min, first.max], [1, 1])
  first.name = 'Portions'
  first.options[0].label = 'Regular'
  state.move(0, 1)
  assert.equal(groups.value[1].id, originalId)
  assert.equal(groups.value[1].options[0].id, optionId)
})
test('Price & choices reads legacy Items without writes, saves a detached explicit conversion, and cancels locally', async () => {
  const scope = Vue.effectScope(),
    calls = []
  const dish = Vue.ref({
    price: 12,
    price_options: [
      { label: 'Small', quantity: 1, unit: 'portion', price: 12 },
    ],
    add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
  })
  const before = JSON.stringify(dish.value)
  let finish
  const saving = new Promise((resolve) => {
    finish = resolve
  })
  const state = scope.run(() =>
    load('Pricing.vue', '({groups,save,resetDraft,price,previewChoices})', {
      ...Vue,
      ...choices,
      normalizeDishPricingPatch,
      useKitchenWorkspace: () => ({ data: Vue.ref({}) }),
      readPlaceCurrencyCode: () => 'CHF',
      useKitchenItemDetail: () => ({
        dish,
        kitchenId: Vue.ref('k'),
        dishId: Vue.ref('i'),
        canWrite: Vue.ref(true),
      }),
      useDishEditorScope: () => () => () => true,
      useDishUpdate: () => ({
        updateDish: (...args) => {
          calls.push(args)
          return saving
        },
      }),
    })
  )
  assert.equal(calls.length, 0)
  assert.equal(state.groups.value.length, 2)
  state.groups.value[0].name = 'Size'
  const pending = state.save()
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'i')
  assert.equal(calls[0][1].choice_groups[0].name, 'Size')
  assert.deepEqual(calls[0][1].price_options, [])
  assert.deepEqual(calls[0][1].add_ons, [])
  assert.equal(calls[0][1].price, 12)
  state.groups.value[0].name = 'Edited while awaiting save'
  assert.equal(calls[0][1].choice_groups[0].name, 'Size')
  assert.equal(JSON.stringify(dish.value), before)
  finish()
  await pending
  state.resetDraft()
  assert.equal(state.groups.value[0].name, 'Variants')
  assert.equal(calls.length, 1)
  scope.stop()
})

test('Items list shows legacy and explicit groups with starting prices including required choices', () => {
  const state = load('Collection/Results.vue', '({priceLabel,choiceSummary})', {
    ...Vue,
    ...choices,
    defineEmits: () => () => {},
    readPlaceCurrencyCode: () => 'CHF',
    useKitchenDishesContext: () => ({ selectedKitchen: Vue.ref({}) }),
    useDishCatalogueContext: () => ({}),
  })
  assert.equal(
    state.priceLabel({ price: 21, price_options: [], add_ons: [] }),
    'CHF 21.00'
  )
  const old = {
    price: 9.5,
    price_options: [
      { label: 'Small', price: 9.5 },
      { label: 'Large', price: 25 },
    ],
    add_ons: [],
  }
  assert.equal(state.priceLabel(old), 'From CHF 9.50')
  assert.match(state.choiceSummary(old), /Variants · Pick one · 2 choices/)
  const grouped = {
    price: 30,
    price_options: old.price_options,
    add_ons: [],
    choice_groups: [
      {
        id: 'sides',
        name: 'Sides',
        min: 2,
        max: 2,
        pricing: 'additional',
        options: [
          { id: 'a', label: 'A', price: 1 },
          { id: 'b', label: 'B', price: 2 },
          { id: 'c', label: 'C', price: 5 },
        ],
      },
    ],
  }
  const before = JSON.stringify(grouped)
  assert.equal(state.priceLabel(grouped), 'From CHF 33.00')
  assert.equal(state.choiceSummary(grouped), 'Sides · Pick 2 · 3 choices')
  assert.equal(JSON.stringify(grouped), before)
  assert.equal(state.priceLabel({ price_options: [], add_ons: [] }), 'Not set')
})
