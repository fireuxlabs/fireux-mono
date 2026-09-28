import assert from 'node:assert/strict'
import test from 'node:test'
import { createSellableAdoptionFixture } from './helpers/sellable-adoption-fixture.mjs'

test('Bären-priced plain pickup pizza reaches a CHF13 Sale without drink or modifier assumptions', async () => {
  const fixture = createSellableAdoptionFixture({ pizzaPrice: 13 })
  const order = await fixture.order({ itemId: 'pizza', quantity: 1 })
  assert.equal(order.status, 'pending_acceptance')
  assert.equal(order.pricing.total.amount_minor, 1300)
  assert.equal(order.items.length, 1)
  assert.equal(fixture.transition(order.id, 'accept').stage, 'queue')
  assert.equal(fixture.transition(order.id, 'mark_ready').stage, 'pass')
  const completed = fixture.transition(order.id, 'complete')
  assert.equal(completed.order.status, 'completed')
  assert.equal(completed.completion.financialFact.amount_minor, 1300)
  assert.throws(() => fixture.transition(order.id, 'complete'), /Cannot/)
})

test('observed Bären cheese crust price is resolved from stored terms, not customer price', async () => {
  const fixture = createSellableAdoptionFixture({
    pizzaPrice: 13,
    pizzaAddOns: [{ id: 'cheese-crust', label: 'mit Käserand', price: 5 }],
  })
  const order = await fixture.order({
    lines: [
      {
        itemId: 'pizza',
        quantity: 1,
        addOns: [{ id: 'cheese-crust', label: 'mit Käserand', price: 0.01 }],
      },
    ],
  })
  assert.equal(order.pricing.total.amount_minor, 1800)
})

test('connected fixture binds, selects, orders and completes canonical pizza plus Coke without live IO', async () => {
  const fixture = createSellableAdoptionFixture()
  const input = { kitchenId: 'fixture', menuId: 'menu', sectionId: 'section' }
  const pizza = await fixture.adopt({ ...input, itemId: 'pizza' })
  const forms = [
    {
      volume: { value: 300, unit: 'ml' },
      container: 'glass',
      source: 'fountain',
    },
    {
      volume: { value: 500, unit: 'ml' },
      container: 'glass',
      source: 'fountain',
    },
    { volume: { value: 500, unit: 'ml' }, container: 'bottle' },
    { volume: { value: 330, unit: 'ml' }, container: 'can' },
  ]
  const coke = await fixture.adopt({
    ...input,
    itemId: 'coke',
    variantForms: forms,
    expectedPriceOptions: fixture.legacyOptions('coke'),
  })
  assert.equal(
    (await fixture.adopt({ ...input, itemId: 'pizza' })).sellableId,
    pizza.sellableId
  )
  assert.deepEqual(
    fixture.read(coke.sellableId).variants.map((v) => v.form),
    forms
  )
  const rows = (await fixture.menu())[0].items
  assert.deepEqual(rows[0].priceOptions, [])
  assert.equal(rows[1].priceOptions.length, 4)
  const selected = rows[1].priceOptions[2]
  const order = await fixture.order({
    lines: [
      { itemId: 'pizza', quantity: 1 },
      { itemId: 'coke', quantity: 1, variant: { ...selected, price: 0.01 } },
    ],
  })
  assert.equal(order.status, 'pending_acceptance')
  assert.equal(order.pricing.total.amount_minor, 2350)
  assert.equal(order.items[1].variant_id, selected.id)
  assert.equal(order.items[0].sellable_id, pizza.sellableId)
  assert.equal(order.items[0].variant_label, undefined)
  assert.equal(order.items[1].sellable_id, coke.sellableId)
  assert.equal(fixture.transition(order.id, 'accept').stage, 'queue')
  assert.equal(fixture.transition(order.id, 'mark_ready').stage, 'pass')
  const result = fixture.transition(order.id, 'complete')
  assert.equal(result.order.status, 'completed')
  assert.equal(result.completion.financialFact.amount_minor, 2350)
  assert.equal(result.completion.sale.lines[1].variant_id, selected.id)
  assert.equal(result.completion.sale.lines[1].sellable_revision, 1)
  assert.throws(() => fixture.transition(order.id, 'complete'), /Cannot/)
})
