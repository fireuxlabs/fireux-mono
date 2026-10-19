import assert from 'node:assert/strict'
import test from 'node:test'
import { dishPricingHelpers } from './helpers/dish-pricing.mjs'
import { loadOfferingSource } from './offering-test-helpers.mjs'

test('bottle deposit is a sparse Dish setting, independent of normal prices and options', () => {
  const { normalizeDishPricingPatch, readDishPricing } = dishPricingHelpers
  assert.deepEqual(normalizeDishPricingPatch({ bottle_deposit: 10 }), {
    bottle_deposit: 10,
  })
  assert.deepEqual(normalizeDishPricingPatch({ bottle_deposit: 0 }), {
    bottle_deposit: 0,
  })
  for (const bottle_deposit of [
    -1,
    '10',
    null,
    NaN,
    Infinity,
    Number.MAX_VALUE,
  ])
    assert.throws(
      () => normalizeDishPricingPatch({ bottle_deposit }),
      /Bottle deposit/
    )
  const dish = { price: 4, price_options: [], add_ons: [], bottle_deposit: 10 }
  assert.deepEqual(readDishPricing(dish), dish)
  assert.deepEqual(readDishPricing({ price: 4 }), {
    price: 4,
    price_options: [],
    add_ons: [],
  })
})

test('the public manifest preserves explicit deposits without inferring them from copy', () => {
  const { readMenuManifestSections } = loadOfferingSource(
    'menu/server/payload/sections',
    'readMenuManifestSections',
    { readDishItemKind: (value) => value }
  )
  const [section] = readMenuManifestSections([
    {
      label: 'Drinks',
      items: [
        { name: 'Cola', price: 4, bottleDeposit: 10 },
        { name: 'Beer', price: 5, description: 'Bottle deposit 10' },
      ],
    },
  ])
  assert.equal(section.items[0].bottleDeposit, 10)
  assert.equal(section.items[0].price, 4)
  assert.equal(section.items[1].bottleDeposit, undefined)
})

test('the trusted Dish command writes only the deposit and audit stamp', async () => {
  const writes = []
  const createError = (value) => new Error(value.statusMessage)
  const input = loadOfferingSource(
    'kitchen/server/dishes/record-input',
    'dishFields,dishText,validateDishInput',
    { createError }
  )
  const { updateDish } = loadOfferingSource(
    'kitchen/server/dishes/update',
    'updateDish',
    {
      ...input,
      ...dishPricingHelpers,
      createError,
      requireFirestoreDocumentId: (value) => value,
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenRecordMutationAuthority: async () => ({}),
      serverKitchenDishesTarget: (kitchenId) => ({
        collectionPath: `kitchens/${kitchenId}/dishes`,
      }),
      serverAuditStamp: () => ({ by: 'operator' }),
      runGuardedServerTransaction: async (_scope, task) =>
        task({
          read: async () => ({
            exists: true,
            data: {
              kitchen_id: 'venue',
              price: 4,
              price_options: [],
              add_ons: [],
            },
          }),
          update: (target, id, patch) => writes.push({ target, id, patch }),
        }),
    }
  )
  await updateDish(
    {},
    { kitchenId: 'venue', dishId: 'cola', changes: { bottle_deposit: 10 } }
  )
  assert.deepEqual(writes, [
    {
      target: { collectionPath: 'kitchens/venue/dishes' },
      id: 'cola',
      patch: { bottle_deposit: 10, updated: { by: 'operator' } },
    },
  ])
  await assert.rejects(
    updateDish(
      {},
      { kitchenId: 'venue', dishId: 'cola', changes: { bottle_deposit: -1 } }
    ),
    /Bottle deposit/
  )
  assert.equal(writes.length, 1)
})
