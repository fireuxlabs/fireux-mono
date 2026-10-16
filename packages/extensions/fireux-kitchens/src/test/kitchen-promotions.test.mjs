import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `;return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const helpers = load(
  '../runtime/kitchen/utils/promotions/pricing.ts',
  'normalizeKitchenPromotion,promotionsOverlap,promotionDishIds'
)
const offer = () => ({
  name: 'Sunday pizzas',
  status: 'active',
  currency: 'CHF',
  days: ['sunday'],
  dishes: [{ dishId: 'margherita', price: 11 }],
})
const deletedField = Symbol('delete')
function harness(options = {}) {
  const writes = [],
    promotions = new Map(options.promotions || [])
  let transactionStart = 0
  const tx = {
    async read(target, id) {
      assert.equal(writes.length, transactionStart, 'all reads precede writes')
      return { exists: promotions.has(id), data: promotions.get(id) }
    },
    async readMany(_target, ids) {
      return ids.map((id) => ({
        id,
        exists: !options.missingDish,
        data: {
          kitchen_id: options.foreignDish ? 'other' : 'kitchen',
          ...(options.archivedDish ? { status: 'archived' } : {}),
        },
      }))
    },
    async query(_target, input) {
      assert(input.limit >= 1 && input.limit <= 100)
      assert.equal(writes.length, transactionStart)
      return [...promotions].map(([id, data]) => ({ id, data }))
    },
    create(target, id, data) {
      writes.push(['create', target, id, data])
      promotions.set(id, data)
    },
    update(target, id, data) {
      writes.push(['update', target, id, data])
      const next = { ...promotions.get(id), ...data }
      for (const key of Object.keys(next))
        if (next[key] === deletedField) delete next[key]
      promotions.set(id, next)
    },
  }
  const { saveKitchenPromotion } = load(
    '../runtime/kitchen/server/promotions/write.ts',
    'saveKitchenPromotion',
    {
      ...helpers,
      FieldValue: { delete: () => deletedField },
      randomUUID: () => 'new-offer',
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw new Error('Invalid id')
        return value
      },
      runGuardedServerTransaction: async (_, work) => {
        transactionStart = writes.length
        return work(tx)
      },
      readKitchenMutationActor: async () => {
        if (options.wait) await options.wait
        return { uid: 'cook', runtimeAppId: 'app' }
      },
      requireKitchenMutationAuthority: async () => {
        if (options.denied) throw new Error('Denied')
        return { placeData: { currency: 'CHF' } }
      },
      serverKitchenDishesTarget: () => 'dishes',
      kitchenPromotionsTarget: () => 'promotions',
      readPlaceCurrencyCode: (data) => data.currency,
      serverAuditStamp: () => ({ by: 'cook', at: 'stamp' }),
    }
  )
  return {
    writes,
    promotions,
    save: (promotion = offer(), promotionId) =>
      saveKitchenPromotion(
        {},
        {
          kitchenId: 'kitchen',
          promotion,
          ...(promotionId ? { promotionId } : {}),
        }
      ),
  }
}
test('active overlap follows dish identity and weekday, independently of Menu', () => {
  assert(helpers.promotionsOverlap(offer(), offer()))
  for (const patch of [
    { dishes: [{ dishId: 'salad', price: 5 }] },
    { days: ['monday'] },
    { status: 'paused' },
  ])
    assert.equal(
      helpers.promotionsOverlap(offer(), { ...offer(), ...patch }),
      false
    )
})
test('saving writes only the promotion', async () => {
  const h = harness()
  await h.save()
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0][1], 'promotions')
  assert.deepEqual(h.writes[0][3].dishes, [{ dishId: 'margherita', price: 11 }])
})
test('authority, currency, catalogue ownership and overlapping offers reject before writes', async () => {
  for (const [options, patch] of [
    [{ denied: true }, {}],
    [{ missingDish: true }, {}],
    [{ foreignDish: true }, {}],
    [{}, { currency: 'EUR' }],
    [{ promotions: [['other', offer()]] }, {}],
  ]) {
    const h = harness(options)
    await assert.rejects(h.save({ ...offer(), ...patch }))
    assert.equal(h.writes.length, 0)
  }
})
test('pausing an existing promotion keeps identity and allows withdrawal despite another offer', async () => {
  const h = harness({
    promotions: [
      ['sunday', offer()],
      ['other', offer()],
    ],
  })
  await h.save({ ...offer(), status: 'paused' }, 'sunday')
  assert.equal(h.promotions.get('sunday').status, 'paused')
  assert.equal(h.writes[0][0], 'update')
})
test('public projection includes only dishes present in this Menu and no audit metadata', async () => {
  const db = {
    collection(path) {
      assert.equal(path, 'kitchens/kitchen/promotions')
      return {
        where(field, op, value) {
          assert.deepEqual([field, op, value], ['status', '==', 'active'])
          return {
            async get() {
              return {
                docs: [
                  { id: 'meal', data: () => mealDeal() },
                  {
                    id: 'sunday',
                    data: () => ({
                      ...offer(),
                      dishes: [
                        ...offer().dishes,
                        { dishId: 'private-dish', price: 99 },
                      ],
                      previous_menu_promotion: { private: 'audit' },
                    }),
                  },
                ],
              }
            },
          }
        },
      }
    },
  }
  const { readMenuPromotions } = load(
    '../runtime/kitchen/server/promotions/read.ts',
    'readMenuPromotions',
    { ...helpers, getRuntimeFirestore: () => db }
  )
  const result = await readMenuPromotions(
    'kitchen',
    ['margherita'],
    'Europe/Zurich',
    'CHF'
  )
  assert.equal(result.length, 1)
  assert.deepEqual(result[0].dishes, [{ dishId: 'margherita', price: 11 }])
  assert.equal(result[0].previous_menu_promotion, undefined)
  assert.deepEqual(
    await readMenuPromotions('kitchen', ['salad'], 'Europe/Zurich', 'CHF'),
    []
  )
  await assert.rejects(
    readMenuPromotions('kitchen', ['margherita'], 'Europe/Zurich', 'EUR')
  )
})

const mealDeal = () => ({
  name: 'Pizza meal deal',
  status: 'active',
  currency: 'CHF',
  days: ['sunday'],
  price: 15,
  groups: [
    {
      id: 'pizza',
      name: 'Pizza',
      choose: 1,
      dishes: [
        { dishId: 'margherita', supplement: 0 },
        { dishId: 'swiss', supplement: 3 },
      ],
    },
    {
      id: 'drink',
      name: 'Drink',
      choose: 1,
      dishes: [{ dishId: 'water', supplement: 0 }],
    },
  ],
})

test('meal deals preserve set price, included choices, supplements and detached nested intent', async () => {
  let release
  const wait = new Promise((resolve) => {
    release = resolve
  })
  const h = harness({ wait })
  const input = mealDeal()
  const pending = h.save(input)
  input.price = 99
  input.groups[0].dishes[0].supplement = 99
  input.groups[1].choose = 9
  input.days.push('monday')
  release()
  await pending
  const saved = h.promotions.get('new-offer')
  assert.equal(saved.price, 15)
  assert.equal(saved.groups[0].dishes[0].supplement, 0)
  assert.equal(saved.groups[0].dishes[1].supplement, 3)
  assert.equal(saved.groups[1].choose, 1)
  assert.deepEqual(saved.days, ['sunday'])
  assert.deepEqual(
    h.writes.map((write) => write[1]),
    ['promotions']
  )
})

test('malformed meal deals and mixed promotion forms reject before writes', async () => {
  const cases = [
    { price: -1 },
    { price: '15' },
    { price: 1.111 },
    { groups: [] },
    { dishes: offer().dishes },
    { groups: [{ ...mealDeal().groups[0], choose: 0 }] },
    { groups: [{ ...mealDeal().groups[0], choose: 3 }] },
    { groups: [{ ...mealDeal().groups[0], choose: 1.5 }] },
    { groups: [{ ...mealDeal().groups[0], name: '' }] },
    {
      groups: [
        {
          ...mealDeal().groups[0],
          dishes: [{ dishId: 'margherita', supplement: -1 }],
        },
      ],
    },
    {
      groups: [
        {
          ...mealDeal().groups[0],
          dishes: [{ dishId: 'margherita', supplement: '0' }],
        },
      ],
    },
    {
      groups: [
        {
          ...mealDeal().groups[0],
          dishes: [
            { dishId: 'margherita', supplement: 0 },
            { dishId: 'margherita', supplement: 1 },
          ],
        },
      ],
    },
    { groups: [mealDeal().groups[0], mealDeal().groups[0]] },
  ]
  for (const patch of cases) {
    const h = harness()
    await assert.rejects(h.save({ ...mealDeal(), ...patch }))
    assert.equal(h.writes.length, 0)
  }
})

test('meal deals check every Dish owner and status without touching normal Dish terms', async () => {
  for (const options of [
    { denied: true },
    { missingDish: true },
    { foreignDish: true },
    { archivedDish: true },
  ]) {
    const h = harness(options)
    await assert.rejects(h.save(mealDeal()))
    assert.equal(h.writes.length, 0)
  }
  assert.deepEqual(helpers.promotionDishIds(mealDeal()), [
    'margherita',
    'swiss',
    'water',
  ])
})

test('meal deals can share Dishes with other promotions without repricing standalone items', async () => {
  assert.equal(helpers.promotionsOverlap(mealDeal(), offer()), false)
  assert.equal(helpers.promotionsOverlap(offer(), mealDeal()), false)
  assert.equal(helpers.promotionsOverlap(mealDeal(), mealDeal()), false)
  const h = harness({ promotions: [['sunday', offer()]] })
  await h.save(mealDeal())
  assert.deepEqual(h.promotions.get('sunday'), offer())
  const reverse = harness({ promotions: [['meal', mealDeal()]] })
  await reverse.save(offer())
})

test('changing a promotion form removes the previous form fields and retains its identity', async () => {
  const h = harness({ promotions: [['existing', offer()]] })
  await h.save(mealDeal(), 'existing')
  assert.equal(h.promotions.get('existing').dishes, undefined)
  assert.equal(h.promotions.get('existing').price, 15)
  await h.save(offer(), 'existing')
  assert.equal(h.promotions.get('existing').groups, undefined)
  assert.equal(h.promotions.get('existing').price, undefined)
  assert.deepEqual(h.promotions.get('existing').dishes, offer().dishes)
  assert.ok(
    h.writes.every(
      (write) => write[1] === 'promotions' && write[2] === 'existing'
    )
  )
})
