// This rehearsal works only on a loopback emulator and a demo project.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readKitchenGrossSalesReport } from '../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/finance/gross-sales-report-read.ts'

assert.match(process.env.FIRESTORE_EMULATOR_HOST ?? '', /^127\.0\.0\.1:\d+$/)
const db = getFirestore(
  initializeApp({ projectId: 'demo-fireux-live' }),
  'misebox'
)
const kitchen = db.doc(`kitchens/item-cutover-${randomUUID()}`)
const dish = (id) => kitchen.collection('dishes').doc(id)
const item = (id) => kitchen.collection('items').doc(id)
const placement = (menu) =>
  kitchen
    .collection('menus')
    .doc(menu)
    .collection('sections')
    .doc('dinner')
    .collection('items')
    .doc(`entry-${menu}`)
const offer = kitchen.collection('promotions').doc('offer')
const mealDeal = kitchen.collection('promotions').doc('deal')
const order = kitchen.collection('orders').doc('historic')
const sale = kitchen.collection('sales').doc('historic')
const submitted = kitchen.collection('submitted-orders').doc('historic')
const at = Timestamp.fromMillis(1_800_000_000_000)
const catalogue = {
  margherita: { name: 'Margherita', created: { at }, price: 18 },
  coffee: { name: 'Coffee', price: 4 },
}
const linked = (id, field, data) => {
  assert.ok(
    Object.hasOwn(catalogue, id),
    'Reference must resolve in this Kitchen'
  )
  assert.ok(
    !Object.hasOwn(data, 'item_id'),
    'Unexpected mixed reference fields'
  )
  const remaining = { ...data }
  delete remaining[field]
  return { ...remaining, item_id: id }
}
const rewritePlacement = (data) => linked(data.dish_id, 'dish_id', data)
const rewriteChoice = (data) => linked(data.dishId, 'dishId', data)
const report = new Map([
  [
    placement('food'),
    [
      { dish_id: 'margherita', sort_order: 3, updated: { at } },
      rewritePlacement,
    ],
  ],
  [
    placement('evening'),
    [{ dish_id: 'margherita', status: 'archived' }, rewritePlacement],
  ],
  [
    offer,
    [
      { status: 'paused', dishes: [{ dishId: 'margherita', price: 16 }] },
      (data) => ({ ...data, dishes: data.dishes.map(rewriteChoice) }),
    ],
  ],
  [
    mealDeal,
    [
      {
        price: 20,
        groups: [
          {
            id: 'choices',
            choose: 1,
            dishes: [{ dishId: 'coffee', supplement: 0 }],
          },
        ],
      },
      (data) => ({
        ...data,
        groups: data.groups.map((group) => ({
          ...group,
          dishes: group.dishes.map(rewriteChoice),
        })),
      }),
    ],
  ],
])
const money = (amount_minor) => ({ amount_minor, currency_code: 'CHF' })
const financeReport = () =>
  readKitchenGrossSalesReport({
    db,
    appId: 'misebox-app',
    kitchenId: kitchen.id,
    fromDate: '2027-01-15',
    toDate: '2027-01-15',
    timezone: 'Europe/Zurich',
    now: new Date('2027-01-16T12:00:00Z'),
  })

const historical = new Map([
  [order, { items: [{ id: 'line', dish_id: 'unknown-item' }] }],
  [
    sale,
    {
      schema_version: 1,
      app_id: 'misebox-app',
      kitchen_id: kitchen.id,
      menu_id: 'food',
      order_id: sale.id,
      order_number: '17',
      order_type: 'collection',
      channel: 'menu',
      occurred_at: at,
      recorded_at: at,
      actor: { kind: 'user', id: 'fixture-closer' },
      lines: [
        {
          id: 'historic-line',
          menu_id: 'food',
          source_item_id: 'entry-food',
          dish_id: 'margherita',
          label: 'Margherita',
          variant_id: 'large',
          variant_label: '16 inch',
          quantity: 2,
          unit_price: money(1800),
          line_total: money(3600),
        },
      ],
      pricing: {
        minor_unit_digits: 2,
        subtotal: money(3600),
        delivery_fee: money(0),
        total: money(3600),
      },
    },
  ],
  [submitted, { menu: { selections: [{ itemId: 'unclassified-id' }] } }],
])

async function apply() {
  await db.runTransaction(async (tx) => {
    const refs = [
      dish('margherita'),
      dish('coffee'),
      item('margherita'),
      item('coffee'),
      ...report.keys(),
    ]
    const [oldPizza, oldCoffee, newPizza, newCoffee, ...references] =
      await tx.getAll(...refs)
    assert.deepEqual(
      newPizza.data(),
      oldPizza.data(),
      'Conflicting existing Item'
    )
    assert.deepEqual(oldCoffee.data(), catalogue.coffee)
    assert.equal(newCoffee.exists, false, 'Conflicting destination')
    // All preconditions and transformed documents are checked before mutation.
    const replacements = references.map((snapshot, index) => {
      const [before, convert] = [...report.values()][index]
      assert.deepEqual(snapshot.data(), before)
      return [snapshot.ref, convert(before)]
    })
    tx.create(newCoffee.ref, oldCoffee.data())
    for (const [ref, replacement] of replacements) tx.set(ref, replacement)
  })
}

async function rollback(postimages) {
  await db.runTransaction(async (tx) => {
    const current = await tx.getAll(...postimages.map((doc) => doc.ref))
    for (const [index, doc] of current.entries())
      assert.ok(
        doc.updateTime?.isEqual(postimages[index].updateTime),
        'Changed since cutover'
      )
    tx.delete(item('coffee'))
    for (const [ref, [before]] of report) tx.set(ref, before)
  })
}

try {
  const setup = db.batch()
  setup.create(kitchen, { name: 'Item reference rehearsal' })
  for (const [id, fields] of Object.entries(catalogue))
    setup.create(dish(id), fields)
  setup.create(item('margherita'), { name: 'Conflict' })
  for (const [ref, [before]] of report) setup.create(ref, before)
  for (const [ref, fields] of historical) setup.create(ref, fields)
  await setup.commit()
  await assert.rejects(apply(), /Conflicting existing Item/)
  assert.equal((await item('coffee').get()).exists, false)
  assert.equal((await placement('food').get()).data().dish_id, 'margherita')
  await item('margherita').set(catalogue.margherita)
  const matchingVersion = (await item('margherita').get()).updateTime
  const financeBefore = await financeReport()
  assert.equal(financeBefore.sale_count, 1)
  assert.deepEqual(financeBefore.currencies[0].gross_sales, money(3600))
  assert.equal(financeBefore.transactions[0].items[0].quantity, 2)
  await apply()
  assert.deepEqual(await financeReport(), financeBefore)
  const postimages = await db.getAll(item('coffee'), ...report.keys())
  assert.deepEqual(postimages[0].data(), catalogue.coffee)
  for (const [ref, [before, convert]] of report)
    assert.deepEqual((await ref.get()).data(), convert(before))
  assert.ok(
    (await item('margherita').get()).updateTime.isEqual(matchingVersion)
  )
  for (const [ref, fields] of historical)
    assert.deepEqual((await ref.get()).data(), fields)
  // A write after cutover must make blind rollback impossible.
  await placement('food').update({ sort_order: 4 })
  await assert.rejects(rollback(postimages), /Changed since cutover/)
  assert.equal((await item('coffee').get()).exists, true)
  // Reset the isolated fixture for the paused-writer rollback rehearsal.
  await postimages[1].ref.set(postimages[1].data())
  await rollback(await db.getAll(item('coffee'), ...report.keys()))
  assert.deepEqual(await financeReport(), financeBefore)
  assert.equal((await item('coffee').get()).exists, false)
  assert.deepEqual(
    (await item('margherita').get()).data(),
    catalogue.margherita
  )
  for (const [ref, [before]] of report)
    assert.deepEqual((await ref.get()).data(), before)
  for (const [ref, fields] of historical)
    assert.deepEqual((await ref.get()).data(), fields)
  console.log(
    'Named misebox emulator: copy, in-place references, conflicts and rollback verified; historical snapshots, Finance reports and bare prices preserved.'
  )
} finally {
  await db.recursiveDelete(kitchen)
  await db.terminate()
}
