import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(file, name, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source, { mode: 'transform' })};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const targets = {
  suppliers: 'suppliers',
  products: 'products',
  ingredients: 'ingredients',
}
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400 })
  return value
}
const readMembershipAccessIds = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const authorize = load(
  '../runtime/supplier/server/team/authority.ts',
  'requireSupplierMutationAuthority',
  {
    createError,
    readMembershipAccessIds,
    APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverSupplierAccessTarget: (app) => `supplier_access/${app}/users`,
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    readFireuxEntityManagement: (value) => value,
    resolveFireuxEntityManagementAppId: (value) => value.app_id,
  }
)
function harness() {
  const at = { seconds: 10, nanoseconds: 0 }
  const records = new Map([
    ['suppliers/s', { management: { mode: 'root' } }],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    ['supplier_access/app/users/u', { ids: ['s'], membership_created_at: at }],
    ['products/p', {}],
    ['ingredients/i', { status: 'active' }],
    [
      'suppliers/s/items/offer',
      {
        product_id: 'p',
        ingredient_id: 'i',
        pack_cost_minor: 100,
        currency_code: 'CHF',
      },
    ],
  ])
  const writes = []
  let before = () => {}
  const commands = load(
    '../runtime/supplier/server/items/commands.ts',
    '({createSupplierItem, updateSupplierItem, deleteSupplierItem})',
    {
      createError,
      requireFirestoreDocumentId,
      requireSupplierMutationAuthority: authorize,
      APP_MUTATION_TARGETS: targets,
USER_MUTATION_TARGETS: targets,
ECOSYSTEM_MUTATION_TARGETS: targets,
FIREUX_MUTATION_TARGETS: targets,
SPROOCHLI_MUTATION_TARGETS: targets,
PLACE_MUTATION_TARGETS: targets,
KITCHEN_MUTATION_TARGETS: targets,
INGREDIENT_MUTATION_TARGETS: targets,
PRODUCT_MUTATION_TARGETS: targets,
PROPERTY_MUTATION_TARGETS: targets,
PORTFOLIO_MUTATION_TARGETS: targets,
SUPPLIER_MUTATION_TARGETS: targets,
JOB_MUTATION_TARGETS: targets,
      serverSupplierItemsTarget: (id) => `suppliers/${id}/items`,
      randomUUID: () => 'new-offer',
      serverAuditStamp: (value) => ({ ...value, at: 'server' }),
      readSupplierMutationActor: async () => ({
        uid: 'u',
        runtimeAppId: 'app',
        ecosystem: 'bringli',
      }),
      runGuardedServerTransaction: async (_, run) => {
        before()
        return run({
          read: async (target, id) => ({
            exists: records.has(`${target}/${id}`),
            data: records.get(`${target}/${id}`),
          }),
          create: (...args) => writes.push(['create', ...args]),
          update: (...args) => writes.push(['update', ...args]),
          delete: (...args) => writes.push(['delete', ...args]),
        })
      },
    }
  )
  return { ...commands, records, writes, before: (fn) => (before = fn) }
}

test('Supplier creates an exact parent-owned Product offer with optional active Ingredient and normalized commercial data', async () => {
  const h = harness()
  const result = await h.createSupplierItem({}, 's', {
    product_id: 'p',
    ingredient_id: 'i',
    pack_cost_minor: 0,
    currency_code: ' chf ',
    quantity_per_pack: 2.5,
    min_order_quantity: null,
    metadata: { notes: ['bulk', null] },
    active: true,
  })
  assert.equal(result.supplier_item_id, 'new-offer')
  assert.equal(h.writes.length, 1)
  const [verb, target, id, body] = h.writes[0]
  assert.deepEqual(
    [verb, target, id],
    ['create', 'suppliers/s/items', 'new-offer']
  )
  assert.equal(body.currency_code, 'CHF')
  assert.equal(body.pack_cost_minor, 0)
  assert.equal(body.quantity_per_pack, 2.5)
  assert.equal(body.min_order_quantity, null)
  assert.equal(body.supplier_id, 's')
  assert.equal(body.product_id, 'p')
  assert.equal(body.ingredient_id, 'i')
})

test('Unknown commercial facts remain unknown; invalid numbers, currency and unsupported fields never write', async () => {
  const h = harness()
  await h.createSupplierItem({}, 's', {
    product_id: 'p',
    pack_cost_minor: null,
    quantity_per_pack: null,
    lead_time_days: null,
  })
  assert.equal(h.writes[0][3].pack_cost_minor, null)
  assert.equal(h.writes[0][3].currency_code, undefined)
  assert.equal(h.writes[0][3].ingredient_id, undefined)
  const cycle = {}
  cycle.self = cycle
  for (const patch of [
    { pack_cost_minor: -1 },
    { pack_cost_minor: 0.5 },
    { pack_cost_minor: 100 },
    { pack_cost_minor: Number.MAX_SAFE_INTEGER + 1, currency_code: 'CHF' },
    { currency_code: 'EURO' },
    { quantity_per_pack: 0 },
    { quantity_per_pack: Infinity },
    { min_order_quantity: -1 },
    { lead_time_days: 1.5 },
    { active: 'true' },
    { availability_state: 'custom' },
    { name_override: 123 },
    { metadata: [] },
    { metadata: { unknown: undefined } },
    { metadata: { nested: [['bulk']] } },
    { metadata: { bad: NaN } },
    { metadata: cycle },
    { supplier_id: 'other' },
    { created: {} },
  ]) {
    const invalid = harness()
    await assert.rejects(
      invalid.createSupplierItem({}, 's', { product_id: 'p', ...patch }),
      { statusCode: 400 }
    )
    assert.equal(invalid.writes.length, 0)
  }
})

test('Updates preserve immutable references and validate price/currency together against the stored offer', async () => {
  const h = harness()
  await h.updateSupplierItem({}, 's', 'offer', {
    pack_cost_minor: 0,
    availability_state: 'limited',
  })
  assert.equal(h.writes[0][3].pack_cost_minor, 0)
  assert.equal(h.writes[0][3].product_id, undefined)
  for (const patch of [
    { product_id: 'other' },
    { ingredient_id: 'other' },
    { currency_code: '' },
    { metadata: { nested: [[1]] } },
    {},
  ]) {
    const invalid = harness()
    await assert.rejects(invalid.updateSupplierItem({}, 's', 'offer', patch), {
      statusCode: 400,
    })
    assert.equal(invalid.writes.length, 0)
  }
  const unknown = harness()
  await unknown.updateSupplierItem({}, 's', 'offer', {
    pack_cost_minor: null,
    currency_code: '',
  })
  assert.equal(unknown.writes[0][3].pack_cost_minor, null)
})

test('Revoked/recreated membership, changed associations and foreign management block every command inside its transaction', async () => {
  for (const invalidate of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => (h.records.get('apps/app/users/u').created.at = { seconds: 20 }),
    (h) => (h.records.get('supplier_access/app/users/u').ids = []),
    (h) =>
      (h.records.get('suppliers/s').management = {
        mode: 'app',
        app_id: 'other',
      }),
  ])
    for (const command of ['create', 'update', 'delete']) {
      const h = harness()
      h.before(() => invalidate(h))
      const run =
        command === 'create'
          ? () => h.createSupplierItem({}, 's', { product_id: 'p' })
          : command === 'update'
            ? () => h.updateSupplierItem({}, 's', 'offer', { active: false })
            : () => h.deleteSupplierItem({}, 's', 'offer')
      await assert.rejects(run())
      assert.equal(h.writes.length, 0)
    }
})

test('Missing Product/inactive Ingredient reject create; delete removes only the exact Supplier-owned offer', async () => {
  for (const invalidate of [
    (h) => h.records.delete('products/p'),
    (h) => (h.records.get('ingredients/i').status = 'inactive'),
  ]) {
    const h = harness()
    h.before(() => invalidate(h))
    await assert.rejects(
      h.createSupplierItem({}, 's', { product_id: 'p', ingredient_id: 'i' }),
      { statusCode: 409 }
    )
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await h.deleteSupplierItem({}, 's', 'offer')
  assert.deepEqual(h.writes, [['delete', 'suppliers/s/items', 'offer']])
})

test('Supplier price presentation distinguishes unknown values from an explicitly free offer', () => {
  const interfaceOwner = load(
    '../runtime/supplier/composables/item/useSupplierItemInterface.ts',
    'useSupplierItemInterface',
    { safeString: (value) => String(value ?? '') }
  )()
  const input = { id: 'offer', supplier_id: 's', product_id: 'p' }
  const unknown = interfaceOwner.interface(input)
  assert.equal(unknown.packPriceLabel, '')
  assert.equal(unknown.unitPriceLabel, '')
  assert.ok(!unknown.badges.some((badge) => badge.startsWith('Unit ')))
  const free = interfaceOwner.interface({
    ...input,
    pack_cost_minor: 0,
    quantity_per_pack: 2,
    currency_code: 'CHF',
  })
  assert.match(free.packPriceLabel, /0[.,]00/)
  assert.match(free.unitPriceLabel, /0[.,]00/)
  assert.equal(
    interfaceOwner.interface({
      ...input,
      pack_cost_minor: 100,
      quantity_per_pack: 2,
    }).packPriceLabel,
    ''
  )
})

test('Currency scale and positive sub-cent unit costs never masquerade as free', () => {
  const owner = load(
    '../runtime/supplier/composables/item/useSupplierItemInterface.ts',
    'useSupplierItemInterface',
    { safeString: (value) => String(value ?? '') }
  )()
  const input = { id: 'offer', supplier_id: 's', product_id: 'p' }
  const tiny = owner.interface({
    ...input,
    pack_cost_minor: 100,
    quantity_per_pack: 1_000,
    currency_code: 'CHF',
  })
  assert.match(tiny.unitPriceLabel, /0[.,]001/)
  const tinier = owner.interface({
    ...input,
    pack_cost_minor: 1,
    quantity_per_pack: 1_000_000,
    currency_code: 'CHF',
  })
  assert.ok(tinier.unitPriceLabel.startsWith('< '))
  assert.match(
    owner.interface({ ...input, pack_cost_minor: 100, currency_code: 'JPY' })
      .packPriceLabel,
    /100/
  )
  assert.match(
    owner.interface({ ...input, pack_cost_minor: 100, currency_code: 'KWD' })
      .packPriceLabel,
    /0[.,]100/
  )
})
