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
  'normalizeKitchenPromotion,normalizePromotionPrice,promotionsOverlap'
)
const offer = () => ({
  kind: 'fixed_price',
  name: 'Sunday pizzas',
  status: 'active',
  menu_id: 'food',
  section_ids: ['pizza'],
  currency: 'CHF',
  amount_minor: 1100,
  days: ['sunday'],
})
function harness(options = {}) {
  const writes = [],
    promotions = new Map(options.promotions || [])
  const menu = {
    status: 'published',
    format: 'interactive',
    schedule: 'regular',
    pricing: {
      label: 'Sunday pizzas',
      currency: 'CHF',
      amount_minor: 1100,
      days: ['sunday'],
      section_ids: ['pizza'],
    },
    ...options.menu,
  }
  const tx = {
    async read(target, id) {
      assert.equal(writes.length, 0, 'all reads precede writes')
      if (target === 'menus') return { exists: true, data: menu }
      if (target === 'sections')
        return { exists: !options.missingSection, data: {} }
      return { exists: promotions.has(id), data: promotions.get(id) }
    },
    async query(_target, input) {
      assert(input.limit >= 1 && input.limit <= 100)
      assert.equal(writes.length, 0)
      return [...promotions].map(([id, data]) => ({ id, data }))
    },
    create(target, id, data) {
      writes.push(['create', target, id, data])
      promotions.set(id, data)
    },
    update(target, id, data) {
      writes.push(['update', target, id, data])
      if (target === 'menus') Object.assign(menu, data)
      else promotions.set(id, { ...promotions.get(id), ...data })
    },
  }
  const { saveKitchenPromotion } = load(
    '../runtime/kitchen/server/promotions/write.ts',
    'saveKitchenPromotion',
    {
      ...helpers,
      randomUUID: () => 'new-offer',
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw new Error('Invalid id')
        return value
      },
      runGuardedServerTransaction: async (_, work) => work(tx),
      readKitchenMutationActor: async () => ({
        uid: 'cook',
        runtimeAppId: 'app',
      }),
      requireKitchenMutationAuthority: async () => {
        if (options.denied) throw new Error('Denied')
        return { placeData: { currency: 'CHF' } }
      },
      serverKitchenMenusTarget: () => 'menus',
      serverKitchenMenuSectionsTarget: () => 'sections',
      kitchenPromotionsTarget: () => 'promotions',
      readPlaceCurrencyCode: (data) => data.currency,
      serverAuditStamp: () => ({ by: 'cook', at: 'stamp' }),
    }
  )
  return {
    writes,
    menu,
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
    migrate: () =>
      saveKitchenPromotion({}, { kitchenId: 'kitchen', menuId: 'food' }, true),
  }
}
test('promotion input detaches intent and rejects unsupported deal types and malformed money', () => {
  const input = offer(),
    normalized = helpers.normalizeKitchenPromotion(input)
  input.days.push('monday')
  assert.deepEqual(normalized.days, ['sunday'])
  for (const patch of [
    { kind: 'meal_deal' },
    { status: 'published' },
    { amount_minor: 11.1 },
    { currency: 'chf' },
    { menu_id: '../food' },
    { days: [] },
    { choices: [] },
  ])
    assert.throws(() =>
      helpers.normalizeKitchenPromotion({ ...offer(), ...patch })
    )
})
test('active overlap considers Menu, section and weekday; paused offers do not conflict', () => {
  assert(helpers.promotionsOverlap(offer(), offer()))
  for (const patch of [
    { menu_id: 'drinks' },
    { section_ids: ['salads'] },
    { days: ['monday'] },
    { status: 'paused' },
  ])
    assert.equal(
      helpers.promotionsOverlap(offer(), { ...offer(), ...patch }),
      false
    )
  assert(helpers.promotionsOverlap(offer(), { ...offer(), section_ids: [] }))
})
test('saving writes only a promotion and never normal Menu terms', async () => {
  const h = harness()
  const before = structuredClone(h.menu)
  await h.save()
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0][1], 'promotions')
  assert.deepEqual(h.menu, before)
})
test('migration preserves preimage and moves the rule atomically with an idempotent retry', async () => {
  const h = harness()
  const before = structuredClone(h.menu.pricing)
  await h.migrate()
  assert.equal(h.writes.length, 2)
  assert.equal(h.menu.pricing, null)
  const migrated = h.promotions.get('menu-food')
  assert.deepEqual(migrated.migration.previous_pricing, before)
  assert.equal(migrated.amount_minor, 1100)
  assert.equal(migrated.name, 'Sunday pizzas')
  assert.equal(migrated.menu_id, 'food')
  assert.equal(migrated.status, 'active')
  h.writes.length = 0
  await h.migrate()
  assert.equal(h.writes.length, 0)
})
test('authority, foreign currency, bad section, daily/document scope and overlapping offers reject before writes', async () => {
  for (const [options, patch] of [
    [{ denied: true }, {}],
    [{ missingSection: true }, {}],
    [{ menu: { schedule: 'daily' } }, {}],
    [{ menu: { format: 'document' } }, {}],
    [{}, { currency: 'EUR' }],
    [{ promotions: [['other', offer()]] }, {}],
  ]) {
    const h = harness(options)
    await assert.rejects(h.save({ ...offer(), ...patch }))
    assert.equal(h.writes.length, 0)
  }
})
test('pausing an existing promotion keeps its identity and leaves Menu prices untouched', async () => {
  const h = harness({ promotions: [['sunday', offer()]] })
  await h.save({ ...offer(), status: 'paused' }, 'sunday')
  assert.equal(h.promotions.get('sunday').status, 'paused')
  assert.equal(h.writes[0][0], 'update')
  assert.notEqual(h.menu.pricing, null)
})

test('public promotion reader excludes paused offers and audit metadata', async () => {
  const active = {
    ...offer(),
    kitchen_id: 'kitchen',
    migration: { previous_pricing: { private: 'audit' } },
  }
  const db = {
    collection(path) {
      assert.equal(path, 'kitchens/kitchen/promotions')
      return {
        where(field, op, id) {
          assert.deepEqual([field, op, id], ['menu_id', '==', 'food'])
          return {
            async get() {
              return {
                docs: [
                  { id: 'sunday', data: () => active },
                  {
                    id: 'paused',
                    data: () => ({ ...offer(), status: 'paused' }),
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
    'food',
    'Europe/Zurich',
    'CHF'
  )
  assert.equal(result.length, 1)
  assert.equal(result[0].timezone, 'Europe/Zurich')
  assert.equal(result[0].migration, undefined)
  assert.equal(result[0].kitchen_id, undefined)
  await assert.rejects(
    readMenuPromotions('kitchen', 'food', 'Europe/Zurich', 'EUR')
  )
})
