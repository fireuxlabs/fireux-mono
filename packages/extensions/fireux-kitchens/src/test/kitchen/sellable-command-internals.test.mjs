import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, dependencies, names) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type (?:\*[^\n]*|\{[\s\S]*?\} from [^\n]*)\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return {' + names + '}',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const { isFirestoreDocumentId } = load(
  '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts',
  {},
  'isFirestoreDocumentId'
)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !isFirestoreDocumentId(value.trim()))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid document id.',
    })
  return value.trim()
}
const utils = load(
  '../../runtime/kitchen/utils/sellable.ts',
  {},
  'readKitchenSellable,readSellableForm,readSellableTerms'
)
const normalizers = load(
  '../../runtime/menu/utils/menu-item.ts',
  {},
  'normalizeMenuItemPriceOptions,normalizeMenuItemAddOns'
)
const { normalizeMenuItemPatch } = load(
  '../../runtime/menu/utils/menu-item-patch.ts',
  {
    ...normalizers,
    normalizeSlug: (value) =>
      String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
  },
  'normalizeMenuItemPatch'
)
const { legacyPlacementSellable } = load(
  '../../runtime/kitchen/server/sellables/legacy.ts',
  { ...utils, normalizeMenuItemPatch },
  'legacyPlacementSellable'
)
const { readMembershipAccessIds } = load(
  '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const { readKitchenAccessIds } = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)
const authority = load(
  '../../runtime/kitchen/server/core/mutation-authority.ts',
  {
    createError,
    readKitchenAccessIds,
    serverAppUsersTarget: (app) => 'apps/' + app + '/users',
    serverKitchenAccessTarget: () => 'kitchen_access',
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' },
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
  },
  'requireKitchenMutationAuthority'
)
const { readPlaceCurrencyCode } = load(
  '../../../../fireux-places/src/runtime/place/utils/place-spine.ts',
  {},
  'readPlaceCurrencyCode'
)
const options = () => [
  { label: 'Glass', quantity: 1, unit: '', price: 4 },
  { label: 'Bottle', quantity: 1, unit: '', price: 5 },
]
const item = () => ({
  dish_id: 'coke',
  price: 3,
  price_options: options(),
  add_ons: [{ id: 'ice', label: 'Ice', price: 0 }],
})
const terms = () => ({
  currency: 'CHF',
  prices: { 'v-0': 4, 'v-1': 5 },
  add_ons: [{ id: 'ice', label: 'Ice', price: 0 }],
  fulfilment: { 'v-0': ['collection'] },
})
const binding = () => ({
  kitchenId: 'k',
  menuId: 'food',
  sectionId: 'drinks',
  itemId: 'item',
})
const update = () => ({
  kitchenId: 'k',
  sellableId: 'offer',
  expectedRevision: 1,
  terms: terms(),
})
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function harness({ wait, retry, before } = {}) {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = [],
    reads = []
  const records = new Map([
    ['kitchens/k', {}],
    ['places/k', { default_currency_code: 'CHF' }],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    ['menus/food', {}],
    ['sections/drinks', {}],
    ['items/item', item()],
    ['dishes/coke', { name: 'Coke', kitchen_id: 'k' }],
    [
      'sellables/offer',
      legacyPlacementSellable(item(), 'CHF', (index) => 'v-' + index),
    ],
  ])
  let actors = 0
  const dependencies = {
    ...utils,
    ...authority,
    createError,
    normalizeMenuItemPatch,
    legacyPlacementSellable,
    requireFirestoreDocumentId,
    readPlaceCurrencyCode,
    randomUUID: () => 'new-offer',
    serverAuditStamp: (value) => value,
    serverKitchenMenusTarget: () => 'menus',
    serverKitchenMenuSectionsTarget: () => 'sections',
    serverKitchenMenuItemsTarget: () => 'items',
    serverKitchenDishesTarget: () => 'dishes',
    serverKitchenSellablesTarget: () => 'sellables',
    readKitchenMutationActor: async () => {
      actors++
      await wait?.promise
      return { uid: 'u', runtimeAppId: 'app' }
    },
    runGuardedServerTransaction: async (_, work) => {
      before?.(records)
      const run = async (commit) => {
        let writing = false
        const staged = []
        const result = await work({
          read: async (target, id) => {
            assert.equal(
              writing,
              false,
              'transaction reads must precede writes'
            )
            reads.push(target + '/' + id)
            return {
              exists: records.has(target + '/' + id),
              data: structuredClone(records.get(target + '/' + id)),
            }
          },
          create: (target, id, data) => {
            writing = true
            assert.equal(records.has(target + '/' + id), false)
            staged.push(['create', target + '/' + id, structuredClone(data)])
          },
          update: (target, id, data) => {
            writing = true
            staged.push(['update', target + '/' + id, structuredClone(data)])
          },
        })
        if (commit)
          for (const [verb, path, data] of staged) {
            writes.push([verb, path, data])
            records.set(path, { ...records.get(path), ...data })
          }
        return result
      }
      if (retry) {
        await run(false)
        retry(records)
      }
      return run(true)
    },
  }
  return {
    ...load(
      '../../runtime/kitchen/server/sellables/bind.ts',
      dependencies,
      'bindKitchenMenuSellable'
    ),
    ...load(
      '../../runtime/kitchen/server/sellables/update-terms.ts',
      dependencies,
      'updateKitchenSellableTerms'
    ),
    records,
    writes,
    reads,
    get actors() {
      return actors
    },
  }
}

test('terms detach prices, add-ons, fulfilment and revision before credentials', async () => {
  const wait = deferred(),
    h = harness({ wait }),
    input = update()
  const pending = h.updateKitchenSellableTerms({}, input)
  input.expectedRevision = 99
  input.terms.prices['v-0'] = 999
  input.terms.add_ons[0].price = 999
  input.terms.fulfilment['v-0'].push('delivery')
  wait.resolve()
  assert.deepEqual(await pending, {
    ok: true,
    kitchenId: 'k',
    sellableId: 'offer',
    revision: 2,
  })
  assert.deepEqual(h.records.get('sellables/offer').terms, terms())
  assert.deepEqual(
    h.records.get('sellables/offer').variants,
    legacyPlacementSellable(item(), 'CHF', (index) => 'v-' + index).variants
  )
})

test('retried terms keep the originating payload and cannot adopt a newer revision', async () => {
  let input = update()
  const stable = harness({
    retry: () => {
      input.terms.prices['v-0'] = 999
    },
  })
  await stable.updateKitchenSellableTerms({}, input)
  assert.equal(stable.records.get('sellables/offer').terms.prices['v-0'], 4)
  input = update()
  const stale = harness({
    retry: (records) => {
      records.get('sellables/offer').revision = 2
      input.expectedRevision = 2
    },
  })
  await assert.rejects(stale.updateKitchenSellableTerms({}, input), {
    statusCode: 409,
  })
  assert.equal(stale.writes.length, 0)
  assert.equal(stale.records.get('sellables/offer').revision, 2)
})

test('bind detaches supplied forms and reviewed options before credentials and retries', async () => {
  for (const retry of [false, true]) {
    const input = {
      ...binding(),
      variantForms: [
        { volume: { value: 300, unit: 'ml' }, container: 'glass' },
        { container: 'bottle' },
      ],
      expectedPriceOptions: options(),
    }
    const change = () => {
      input.variantForms[0].volume.value = 999
      input.variantForms[1].container = 'wrong'
      input.expectedPriceOptions[0].price = 999
    }
    const wait = retry ? undefined : deferred(),
      h = harness(retry ? { retry: change } : { wait })
    const pending = h.bindKitchenMenuSellable({}, input)
    if (wait) {
      change()
      wait.resolve()
    }
    await pending
    const canonical = h.records.get('sellables/new-offer')
    assert.deepEqual(
      canonical.variants.map((row) => row.form),
      [
        { volume: { value: 300, unit: 'ml' }, container: 'glass' },
        { container: 'bottle' },
      ]
    )
    assert.deepEqual(canonical.terms.prices, {
      'new-offer-1': 4,
      'new-offer-2': 5,
    })
    assert.deepEqual(h.records.get('items/item').price_options, options())
  }
})

test('bind refuses a changed reviewed option set on the committing retry', async () => {
  const h = harness({
    retry: (records) => {
      records.get('items/item').price_options.reverse()
    },
  })
  await assert.rejects(
    h.bindKitchenMenuSellable(
      {},
      {
        ...binding(),
        variantForms: [{ container: 'glass' }, { container: 'bottle' }],
        expectedPriceOptions: options(),
      }
    ),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, 0)
  assert.equal(h.records.has('sellables/new-offer'), false)
})

test('malformed authored envelopes, revisions and terms reject before credentials', async () => {
  for (const input of [
    null,
    [],
    { ...update(), variantForms: [] },
    ...[
      undefined,
      null,
      '1',
      0,
      -1,
      1.5,
      Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ].map((expectedRevision) => ({ ...update(), expectedRevision })),
    { ...update(), terms: { ...terms(), currency: ['CHF'] } },
    {
      ...update(),
      terms: { ...terms(), fulfilment: { 'v-0': [['collection']] } },
    },
    {
      ...update(),
      terms: {
        ...terms(),
        fulfilment: { 'v-0': ['collection', 'collection'] },
      },
    },
    {
      ...update(),
      terms: {
        ...terms(),
        add_ons: [{ id: 'ice', label: 'Ice', price: 0, unsupported: true }],
      },
    },
    { ...update(), terms: { ...terms(), prices: { 'v-0': '4', 'v-1': 5 } } },
    { ...update(), terms: { ...terms(), dish_id: 'other' } },
  ]) {
    const h = harness()
    await assert.rejects(h.updateKitchenSellableTerms({}, input), {
      statusCode: 400,
    })
    assert.equal(h.actors, 0)
    assert.equal(h.writes.length, 0)
  }
  for (const input of [
    null,
    [],
    { ...binding(), terms: terms() },
    { ...binding(), sellableId: null },
    { ...binding(), variantForms: 'glass', expectedPriceOptions: [] },
    {
      ...binding(),
      variantForms: [{ volume: { value: '300', unit: 'ml' } }],
      expectedPriceOptions: [],
    },
    {
      ...binding(),
      variantForms: [{ container: 'glass', unknown: true }],
      expectedPriceOptions: [],
    },
    { ...binding(), expectedPriceOptions: [{ label: 'Glass', price: '4' }] },
  ]) {
    const h = harness()
    await assert.rejects(h.bindKitchenMenuSellable({}, input), {
      statusCode: 400,
    })
    assert.equal(h.actors, 0)
    assert.equal(h.writes.length, 0)
  }
})

test('pure terms validation preserves zero prices, explicit empty restrictions and exact IDs', () => {
  const input = {
    ...terms(),
    prices: { 'v-0': 0, 'v-1': 0 },
    fulfilment: { 'v-0': [] },
  }
  const copied = utils.readSellableTerms(input, ['v-0', 'v-1'])
  input.prices['v-0'] = 999
  input.add_ons[0].price = 999
  input.fulfilment['v-0'].push('delivery')
  assert.deepEqual(copied, {
    currency: 'CHF',
    prices: { 'v-0': 0, 'v-1': 0 },
    add_ons: [{ id: 'ice', label: 'Ice', price: 0 }],
    fulfilment: { 'v-0': [] },
  })
  assert.throws(() => utils.readSellableTerms(terms(), ['v-0']), /Invalid/)
  for (const patch of [
    { currency: ['CHF'] },
    { fulfilment: { 'v-0': [['collection']] } },
  ])
    assert.throws(
      () =>
        utils.readKitchenSellable({
          ...legacyPlacementSellable(item(), 'CHF', (index) => 'v-' + index),
          terms: { ...terms(), ...patch },
        }),
      /Invalid/
    )
})

test('allowed variant IDs retain exact own restrictions, including prototype-named keys', () => {
  const value = {
    currency: 'CHF',
    prices: Object.fromEntries([['__proto__', 4]]),
    add_ons: [],
    fulfilment: Object.fromEntries([['__proto__', []]]),
  }
  const result = utils.readSellableTerms(value, ['__proto__'])
  assert.equal(Object.getPrototypeOf(result.fulfilment), Object.prototype)
  assert.equal(Object.hasOwn(result.fulfilment, '__proto__'), true)
  assert.deepEqual(result.fulfilment.__proto__, [])
  assert.deepEqual(JSON.parse(JSON.stringify(result)), value)
})

test('both writers recheck membership lifetime, exact Kitchen access and linked Place on retries', async () => {
  for (const action of [
    'bindKitchenMenuSellable',
    'updateKitchenSellableTerms',
  ])
    for (const revoke of [
      (records) => records.delete('apps/app/users/u'),
      (records) => {
        records.get('apps/app/users/u').created.at = {
          seconds: 2,
          nanoseconds: 0,
        }
      },
      (records) => {
        records.get('kitchen_access/u').apps.app.ids = ['other']
      },
      (records) => records.delete('kitchen_access/u'),
      (records) => records.delete('places/k'),
      (records) => {
        records.get('places/k').default_currency_code = 'EUR'
      },
    ]) {
      const h = harness({ retry: revoke })
      await assert.rejects(
        h[action](
          {},
          action === 'bindKitchenMenuSellable'
            ? { ...binding(), sellableId: 'offer' }
            : update()
        )
      )
      assert.equal(h.writes.length, 0)
    }
})

test('bind verifies exact placement and canonical Dish Kitchen, then atomically preserves its legacy preimages', async () => {
  for (const corrupt of [
    (records) => records.delete('menus/food'),
    (records) => records.delete('sections/drinks'),
    (records) => records.delete('items/item'),
    (records) => records.delete('dishes/coke'),
    (records) => {
      records.get('dishes/coke').kitchen_id = 'other'
    },
  ]) {
    const h = harness({ before: corrupt })
    await assert.rejects(h.bindKitchenMenuSellable({}, binding()), {
      statusCode: 409,
    })
    assert.equal(h.writes.length, 0)
  }
  const h = harness(),
    preimage = structuredClone(h.records.get('items/item'))
  const result = await h.bindKitchenMenuSellable({}, binding())
  assert.deepEqual(result, { ok: true, sellableId: 'new-offer', reused: false })
  assert.equal(h.writes.length, 2)
  for (const field of ['price', 'price_options', 'add_ons'])
    assert.deepEqual(h.records.get('items/item')[field], preimage[field])
  const repeated = await h.bindKitchenMenuSellable({}, binding())
  assert.deepEqual(repeated, {
    ok: true,
    sellableId: 'new-offer',
    reused: true,
  })
  assert.equal(h.writes.length, 2)
})

test('reuse stays explicit and does not replace established forms or stable variant identity', async () => {
  const h = harness()
  h.records.get('sellables/offer').variants[0].form = { container: 'glass' }
  await h.bindKitchenMenuSellable({}, { ...binding(), sellableId: 'offer' })
  assert.equal(h.records.get('items/item').sellable_id, 'offer')
  await assert.rejects(
    h.bindKitchenMenuSellable({}, { ...binding(), sellableId: 'other' }),
    { statusCode: 409 }
  )
  await h.bindKitchenMenuSellable(
    {},
    {
      ...binding(),
      variantForms: [{ container: 'wrong' }, null],
      expectedPriceOptions: options(),
    }
  )
  assert.equal(
    h.records.get('sellables/offer').variants[0].form.container,
    'glass'
  )
  assert.equal(h.records.has('sellables/new-offer'), false)
})

test('exhausted stored revision is a conflict and never a caller terms failure', async () => {
  const h = harness(),
    input = update()
  input.expectedRevision = Number.MAX_SAFE_INTEGER
  h.records.get('sellables/offer').revision = Number.MAX_SAFE_INTEGER
  await assert.rejects(h.updateKitchenSellableTerms({}, input), {
    statusCode: 409,
  })
  assert.equal(h.writes.length, 0)
})
