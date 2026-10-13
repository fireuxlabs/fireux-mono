import { isDeepStrictEqual } from 'node:util'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  ref,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'
function load(path, names, deps = {}) {
  const source = readFileSync(
    new URL('../../runtime/' + path, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return {' + names + '}',
    Object.keys(deps)
  )(...Object.values(deps))
}
const policy = load(
  'kitchen/utils/order-intake.ts',
  'readKitchenOrderIntake,kitchenOrderIntakeFromRoot,isOffSiteKitchenOrder,kitchenOrderIntakePaused,kitchenOrderRequiresAcceptance'
)
const normal = policy.readKitchenOrderIntake(undefined)
const types = [
  'dine_in',
  'eat_in',
  'takeaway',
  'room_service',
  'collection',
  'delivery',
  'pre_order',
]
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)

test('public ordering projection shows global pauses without removing saved per-offering pauses', () => {
  const { readKitchenMenuOrdering } = load(
    'menu/server/ordering/config.ts',
    'readKitchenMenuOrdering',
    {
      ...policy,
      kitchenMenuOrdering: () => ({
        enabled: true,
        order_types: types.map((type) => ({
          type,
          availability: { paused: type === 'takeaway' },
        })),
      }),
      menuOrderTypeStrategy: () => ({ resolvesDelivery: false }),
      kitchenPaymentMethodsForOrderType: () => [],
    }
  )
  for (const pause of ['open', 'off_site', 'all']) {
    const result = readKitchenMenuOrdering([], 'menu', undefined, {
      ...normal,
      pause,
    })
    for (const row of result.order_types)
      assert.equal(
        row.availability.paused,
        row.type === 'takeaway' ||
          policy.kitchenOrderIntakePaused({ ...normal, pause }, row.type)
      )
  }
})

test('pause and acceptance are independent, exhaustive rules over current order types', () => {
  for (const type of types) {
    assert.equal(
      policy.kitchenOrderRequiresAcceptance(normal, type),
      ['collection', 'delivery', 'pre_order'].includes(type)
    )
    assert.equal(
      policy.kitchenOrderRequiresAcceptance(
        { ...normal, off_site_acceptance: 'automatic' },
        type
      ),
      type === 'pre_order'
    )
    assert.equal(
      policy.kitchenOrderIntakePaused({ ...normal, pause: 'off_site' }, type),
      ['collection', 'delivery', 'pre_order'].includes(type)
    )
    assert.equal(
      policy.kitchenOrderIntakePaused({ ...normal, pause: 'all' }, type),
      true
    )
    assert.equal(policy.kitchenOrderIntakePaused(normal, type), false)
  }
  for (const bad of [
    null,
    {},
    { ...normal, pause: 'unknown' },
    { ...normal, preparation_minutes: 0 },
    { ...normal, preparation_minutes: 13 },
    { ...normal, extra: true },
  ])
    assert.throws(() => policy.readKitchenOrderIntake(bad))
  assert.deepEqual(
    policy.kitchenOrderIntakeFromRoot({ orders: { intake: normal } }),
    normal
  )
})

test('actual intake command validates before credentials and authorizes inside its transaction', async () => {
  const writes = [],
    events = []
  let denied = false
  let changed = false
  const { updateKitchenOrderIntake } = load(
    'kitchen/server/ordering/intake.ts',
    'updateKitchenOrderIntake',
    {
      ...policy,
      isDeepStrictEqual,
      createError,
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw Error('invalid id')
        return value
      },
      readKitchenMutationActor: async () => {
        events.push('actor')
        return { uid: 'actor' }
      },
      requireKitchenRecordMutationAuthority: async (_tx, _actor, id) => {
        events.push('authority:' + id)
        if (denied) throw Error('revoked')
        return {
          ownerAppId: 'app',
          rootData: changed
            ? {
                orders: {
                  intake: { ...normal, off_site_acceptance: 'automatic' },
                },
              }
            : {},
        }
      },
      runGuardedServerTransaction: async (_lane, fn) =>
        fn({ update: (...args) => writes.push(args) }),
      FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens-target' },
      serverAuditStamp: (stamp) => stamp,
    }
  )
  await assert.rejects(
    updateKitchenOrderIntake(
      {},
      {
        kitchenId: 'k',
        expected: normal,
        intake: { ...normal, preparation_minutes: 1 },
      }
    )
  )
  assert.deepEqual(events, [])
  const result = await updateKitchenOrderIntake(
    {},
    {
      kitchenId: 'k',
      expected: normal,
      intake: { ...normal, pause: 'off_site' },
    }
  )
  assert.equal(result.kitchenId, 'k')
  assert.deepEqual(events, ['actor', 'authority:k'])
  assert.equal(writes[0][0], 'kitchens-target')
  assert.equal(writes[0][1], 'k')
  assert.deepEqual(writes[0][2]['orders.intake'], {
    ...normal,
    pause: 'off_site',
  })
  changed = true
  await assert.rejects(
    updateKitchenOrderIntake(
      {},
      { kitchenId: 'k', expected: normal, intake: normal }
    ),
    /Service settings changed/
  )
  assert.equal(writes.length, 1)
  denied = true
  await assert.rejects(
    updateKitchenOrderIntake(
      {},
      { kitchenId: 'k', expected: normal, intake: normal }
    ),
    /revoked/
  )
  assert.equal(writes.length, 1)
})

test('actual new-order fulfilment skips human acceptance only for eligible new arrivals, retaining payment choice', async () => {
  const { resolveMenuOrderFulfilment } = load(
    'menu/server/ordering/order-fulfilment.ts',
    'resolveMenuOrderFulfilment',
    {
      ...policy,
      createError,
      menuOrderTypeStrategy: () => ({ resolvesDelivery: false }),
      validateMenuOrderSchedule() {},
      numberValue: (x) => Number(x || 0),
      money: String,
    }
  )
  for (const acceptance of ['manual', 'automatic'])
    for (const type of types) {
      const result = await resolveMenuOrderFulfilment({
        command: { orderType: type, customer: {}, orderTypeConfig: { type } },
        context: { intake: { ...normal, off_site_acceptance: acceptance } },
        subtotal: 10,
        currencyCode: 'CHF',
      })
      assert.equal(
        result.status,
        policy.kitchenOrderRequiresAcceptance(
          { ...normal, off_site_acceptance: acceptance },
          type
        )
          ? 'pending_acceptance'
          : 'awaiting_payment_choice'
      )
      assert.equal(result.payment.flow, 'confirmation_first')
      assert.equal(result.payment.method, undefined)
      assert.equal(result.policySnapshot.preparation_minutes, 45)
    }
  for (const pause of ['all', 'off_site'])
    for (const type of types) {
      const run = resolveMenuOrderFulfilment({
        command: { orderType: type, customer: {} },
        context: { intake: { ...normal, pause } },
        subtotal: 10,
        currencyCode: 'CHF',
      })
      if (policy.kitchenOrderIntakePaused({ ...normal, pause }, type))
        await assert.rejects(run, /paused/)
      else await run
    }
})

const commandSource = readFileSync(
  new URL(
    '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  stripTypeScriptTypes(commandSource) + ';return useCommandScope',
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)

test('service-setting saves cannot dispatch after account, App, Kitchen, access or disposal changes', async () => {
  for (const change of ['account', 'app', 'kitchen', 'access', 'dispose']) {
    let resolve
    const token = new Promise((done) => {
      resolve = done
    })
    const calls = []
    const currentUser = ref({ uid: 'a', getIdToken: () => token }),
      config = reactive({ appId: 'app' }),
      appUser = ref({ created: { at: 1 } })
    const workspace = {
        id: ref('k'),
        outcome: ref('ready'),
        data: ref({ orders: { intake: normal } }),
        hasAccount: ref(true),
      accountReady: ref(true),
      },
      access = { ids: ref(['k']), outcome: ref('ready') },
      scope = effectScope()
    const { useKitchenOrderIntake } = load(
      'kitchen/composables/workspace/orders/useKitchenOrderIntake.ts',
      'useKitchenOrderIntake',
      {
        ...policy,
        computed,
        ref,
        watch,
        useCommandScope,
        useKitchenWorkspace: () => workspace,
        useAuth: () => ({ currentUser }),
        useUserSession: () => ({ appUser }),
        useKitchenAccess: () => access,
        useFireUXConfig: () => config,
        $fetch: async (...args) => {
          calls.push(args)
          return { ok: true, kitchenId: 'k', intake: args[1].body.intake }
        },
      }
    )
    const state = scope.run(() => useKitchenOrderIntake())
    const pending = state.save({ pause: 'all' })
    if (change === 'account') currentUser.value = null
    if (change === 'app') {
      config.appId = 'other'
      config.appId = 'app'
    }
    if (change === 'kitchen') {
      workspace.id.value = 'other'
      workspace.id.value = 'k'
    }
    if (change === 'access') {
      access.ids.value = []
      access.ids.value = ['k']
    }
    if (change === 'dispose') scope.stop()
    resolve('token')
    await pending
    assert.equal(calls.length, 0, change)
    scope.stop()
  }
})
