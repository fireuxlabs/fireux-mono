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
  normalizeItemPricingPatch,
  readItemOffer,
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
    bottle_deposit: 2,
  }
  const before = structuredClone(raw)
  const offer = readItemOffer(raw)
  assert.equal(offer.price, 8)
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

test('selling adapter rejects identity/legacy fields and snapshots canonical changes before credentials', async () => {
  const calls = []
  const use = load(
    'composables/items/useItemOfferUpdate.ts',
    'useItemOfferUpdate',
    {
      normalizeItemPricingPatch,
      useItemMutation: () => ({
        mutate: async (...args) => {
          calls.push(args)
          return { id: 'aioli' }
        },
      }),
    }
  )
  const api = use()
  await assert.rejects(
    api.updateOffer('aioli', { name: 'Wrong' }, { kitchenId: 'k' }),
    /Unsupported/
  )
  await assert.rejects(
    api.updateOffer('aioli', { price_options: [] }, { kitchenId: 'k' }),
    /Unsupported/
  )
  assert.equal(calls.length, 0)
  const draft = { choice_groups: [group()] }
  await api.updateOffer('aioli', draft, { kitchenId: 'k' })
  draft.choice_groups[0].options[0].price = 100
  assert.equal(calls[0][1].changes.price, 8)
  assert.equal(calls[0][1].changes.choice_groups[0].options[0].price, 8)
})

test('pricing draft survives same-record refresh, resets on navigation, and ignores obsolete save feedback', async () => {
  const scope = effectScope()
  const offer = ref({ price: 10, choice_groups: [] }),
    kitchenId = ref('k'),
    itemId = ref('aioli'),
    canWrite = ref(true),
    offerError = ref(null)
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
        normalizeItemPricingPatch,
        priceItemChoices,
        useKitchenWorkspace: () => ({ data: ref({}) }),
        readPlaceCurrencyCode: () => 'CHF',
        useKitchenItemContext: () => ({
          offer,
          offerError,
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
        useItemOfferUpdate: () => ({
          updateOffer: (id, changes, target) => {
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
  offer.value = { price: 11, choice_groups: [] }
  await nextTick()
  assert.equal(api.price.value, 15)
  api.resetDraft()
  assert.equal(api.price.value, 11)
  api.groups.value = [group()]
  assert.equal(offer.value.choice_groups.length, 0)
  const save = api.save()
  assert.equal(calls[0].changes.price, 8)
  assert.equal(Object.hasOwn(calls[0].changes, 'price_options'), false)
  itemId.value = 'soup'
  offer.value = { price: 7, choice_groups: [] }
  await nextTick()
  resolveSave({ id: 'aioli' })
  await save
  assert.equal(api.price.value, 7)
  assert.equal(api.message.value, '')
  assert.equal(api.busy.value, false)
  offer.value = { choice_groups: [] }
  await nextTick()
  assert.equal(api.previewPrice.value, 'Set a normal price to preview.')
  scope.stop()
})
