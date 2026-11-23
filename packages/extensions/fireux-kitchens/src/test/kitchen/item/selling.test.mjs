import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, watch, effectScope, nextTick } from 'vue'
import {
  normalizeItemChoiceGroups,
  priceItemChoices,
} from '../../../runtime/kitchen/utils/item-choices.ts'
import {
  normalizeItemSellingTerms,
  readItemPricing,
  readItemSellingTerms,
} from '../../../runtime/kitchen/utils/item-pricing.ts'

const group = () => ({
  id: 'size',
  name: 'Size',
  min: 1,
  max: 1,
  pricing: 'full',
  options: [
    { id: 'small', label: 'Small', price: 8 },
    { id: 'large', label: 'Large', price: 12 },
  ],
})
function load(path, result, deps) {
  let source = readFileSync(
    new URL(`../../../runtime/kitchen/${path}`, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return new Function(
    ...Object.keys(deps),
    `${stripTypeScriptTypes(source)}; return ${result}`
  )(...Object.values(deps))
}

test('canonical selling choices win and workspace/public price calculation uses the same rules', () => {
  const raw = {
    price: 99,
    choice_groups: [group()],
    price_options: [{ label: 'Old', price: 50 }],
  }
  const before = structuredClone(raw)
  const offer = readItemSellingTerms(raw)
  assert.equal(offer.price, undefined)
  assert.equal(readItemPricing(raw).price, 8)
  assert.equal(
    priceItemChoices(offer.price, offer.choice_groups, { size: ['large'] })
      .unitMinor,
    1200
  )
  assert.throws(
    () => priceItemChoices(offer.price, offer.choice_groups, { size: [] }),
    /choose/
  )
  assert.deepEqual(raw, before)
})

test('pricing draft survives same-record refresh, resets on navigation, and ignores obsolete save feedback', async () => {
  const scope = effectScope()
  const item = ref({ price: 10, currency_code: 'CHF', choice_groups: [] }),
    kitchenId = ref('k'),
    itemId = ref('aioli'),
    canWrite = ref(true),
    pricingError = ref(null)
  let resolveSave
  const calls = []
  const api = scope.run(() =>
    load(
      'components/Workspace/Menu/Items/Pricing.vue',
      '({price,groups,dirty,save,resetDraft,message,error,busy,previewPrice})',
      {
        computed,
        ref,
        watch,
        normalizeItemChoiceGroups,
        priceItemChoices,
        useKitchenItemContext: () => ({
          item,
          pricingError,
          kitchenId,
          itemId,
          canWrite,
        }),
        useItemEditorScope: (sources, reset) => {
          let version = 0
          watch(
            sources,
            () => {
              version++
              reset()
            },
            { flush: 'sync' }
          )
          return () => {
            const captured = version
            return () => captured === version
          }
        },
        useItemActions: () => ({
          updateItem: (id, changes, target) => {
            calls.push({ id, changes, target })
            return new Promise((resolve) => {
              resolveSave = resolve
            })
          },
        }),
      }
    )
  )
  assert.equal(api.price.value, 10)
  api.price.value = 15
  item.value = { price: 11, currency_code: 'CHF', choice_groups: [] }
  await nextTick()
  assert.equal(api.price.value, 15)
  api.resetDraft()
  assert.equal(api.price.value, 11)
  api.groups.value = [group()]
  assert.equal(item.value.choice_groups.length, 0)
  const save = api.save()
  assert.equal(calls[0].changes.price, null)
  assert.equal(calls[0].changes.currency_code, 'CHF')
  assert.equal(Object.hasOwn(calls[0].changes, 'price_options'), false)
  itemId.value = 'soup'
  item.value = { price: 7, choice_groups: [] }
  await nextTick()
  resolveSave({ id: 'aioli' })
  await save
  assert.equal(api.price.value, 7)
  assert.equal(api.message.value, '')
  assert.equal(api.busy.value, false)
  item.value = { choice_groups: [] }
  await nextTick()
  assert.equal(api.previewPrice.value, 'Set a normal price to preview.')
  scope.stop()
})

test('Margherita stores one denomination and derives its starting and selected prices', () => {
  const choices = [
    {
      ...group(),
      options: [
        { id: '12-inch', label: '12 inch', price: 18 },
        { id: '16-inch', label: '16 inch', price: 24 },
      ],
    },
    {
      id: 'extras',
      name: 'Extras',
      min: 0,
      max: null,
      pricing: 'additional',
      options: [{ id: 'olives', label: 'Olives', price: 2.5 }],
    },
  ]
  const terms = normalizeItemSellingTerms({
    currency_code: 'CHF',
    choice_groups: choices,
  })
  assert.equal(terms.currency_code, 'CHF')
  assert.equal(Object.hasOwn(terms, 'price'), false)
  assert.equal(readItemPricing(terms).price, 18)
  assert.equal(
    priceItemChoices(terms.price, terms.choice_groups, {
      size: ['16-inch'],
      extras: ['olives'],
    }).unitMinor,
    2650
  )
  assert.throws(
    () => normalizeItemSellingTerms({ choice_groups: choices }),
    /currency code/
  )
  assert.throws(
    () =>
      normalizeItemSellingTerms({
        price: 18,
        currency_code: 'CHF',
        choice_groups: choices,
      }),
    /full prices on the choices/
  )
  assert.throws(
    () =>
      normalizeItemSellingTerms(
        { choice_groups: choices.slice(1) },
        {
          ...terms,
          price: 18,
        }
      ),
    /base price/
  )
  assert.deepEqual(
    normalizeItemSellingTerms({ price: 0, currency_code: 'CHF' }),
    {
      price: 0,
      currency_code: 'CHF',
      choice_groups: [],
    }
  )
})
