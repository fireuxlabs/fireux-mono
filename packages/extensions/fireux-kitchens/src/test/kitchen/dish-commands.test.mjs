import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
  dependencies = commandScopeDeps(dependencies)
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`, Object.keys(dependencies))(...Object.values(dependencies))
}
const createError = x => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = value => {
  if (typeof value !== 'string' || !value || value.includes('/')) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load('../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts', {}, 'readMembershipAccessIds')
const readKitchenAccessIds = load('../../runtime/kitchen/utils/kitchen-access.ts', { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }, 'readKitchenAccessIds')
const requireKitchenMutationAuthority = load('../../runtime/kitchen/server/core/mutation-authority.ts', {
  serverAppUsersTarget: app => `apps/${app}/users`, serverKitchenAccessTarget: app => `kitchen_access/${app}/users`,
  FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' }, readKitchenAccessIds,
  isAppUserSubscription: value => ['free', 'premium', 'business'].includes(value), createError,
}, 'requireKitchenMutationAuthority')
function harness() {
  const at = { seconds: 1, nanoseconds: 0 }, writes = []
  const records = new Map([
    ['kitchens/k', {}], ['places/k', {}],
    ['apps/app/users/u', { role: 'user', subscription: 'free', created: { at } }],
    ['kitchen_access/app/users/u', { ids: ['k'], membership_created_at: at }],
    ['dishes/k/existing', { name: 'Existing', image: 'keep' }],
  ])
  let before = () => {}
  const commands = load('../../runtime/kitchen/server/dishes/commands.ts', {
    createError, requireFirestoreDocumentId, requireKitchenMutationAuthority,
    normalizeSlug: value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    dishCategories: [{ value: 'main' }], serverKitchenDishesTarget: id => `dishes/${id}`,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    serverAuditStamp: x => x,
    runGuardedServerTransaction: async (_, run) => { before(); return run({
      read: async (target, id) => ({ exists: records.has(`${target}/${id}`), data: records.get(`${target}/${id}`) }),
      create: (target, id, data) => { writes.push(['create', target, id, data]); records.set(`${target}/${id}`, data) },
      update: (...args) => writes.push(['update', ...args]), delete: (...args) => writes.push(['delete', ...args]),
    }) },
  }, '({createDish, updateDish, deleteDish})')
  return { ...commands, records, writes, before: fn => { before = fn } }
}
test('food and drink create atomically; duplicate cannot overwrite; media and flagship remain separate', async () => {
  for (const item_kind of ['food', 'drink']) {
    const h = harness()
    assert.deepEqual(await h.createDish({}, { kitchenId: 'k', draft: { name: 'Cola', item_kind, is_flagship: true } }), { id: 'cola' })
    const data = h.writes[0][3]
    assert.equal(data.item_kind, item_kind); assert.equal(data.image, ''); assert.equal(data.is_flagship, false)
    assert.deepEqual(data.created, { by: 'u', appId: 'app' })
    await assert.rejects(h.createDish({}, { kitchenId: 'k', draft: { name: 'Cola' } }), { statusCode: 409 })
    assert.equal(h.writes.length, 1)
  }
})
test('update validates nested specification; deletion remains document-only', async () => {
  const h = harness()
  const spec = { portion: 1, station: '', ingredients: [{ ingredient_id: 'flour', quantity: 100, unit: 'g', note: '' }], prep_items: [], recipe_ids: ['dough'], assembly: ['Bake'], source_note: '' }
  await h.updateDish({}, { kitchenId: 'k', dishId: 'existing', changes: { name: ' New ', category: 'main', spec } })
  assert.equal(h.writes[0][3].name, 'New'); assert.deepEqual(h.writes[0][3].spec, spec)
  assert.equal('image' in h.writes[0][3], false)
  await h.deleteDish({}, { kitchenId: 'k', dishId: 'existing' })
  assert.deepEqual(h.writes[1], ['delete', 'dishes/k', 'existing'])
})
test('all commands enforce transaction-time current membership and bound Kitchen grant', async () => {
  for (const action of ['createDish', 'updateDish', 'deleteDish']) for (const change of [
    h => h.records.delete('apps/app/users/u'),
    h => { h.records.get('apps/app/users/u').created.at = { seconds: 2, nanoseconds: 0 } },
    h => { h.records.get('kitchen_access/app/users/u').ids = ['other'] },
    h => h.records.delete('kitchen_access/app/users/u'),
  ]) {
    const h = harness(); h.before(() => change(h))
    const input = action === 'createDish' ? { kitchenId: 'k', draft: { name: 'New' } } : action === 'updateDish' ? { kitchenId: 'k', dishId: 'existing', changes: { name: 'New' } } : { kitchenId: 'k', dishId: 'existing' }
    await assert.rejects(h[action]({}, input)); assert.equal(h.writes.length, 0)
  }
})
test('update rejects protected/unknown fields, malformed spec and missing records', async () => {
  for (const changes of [{ image: 'url' }, { kitchen_id: 'other' }, { updated: {} }, { item_kind: 'drink' }, {}, { category: 'bad' }, { name: '' }, { spec: { portion: 1, ingredients: {}, prep_items: [], recipe_ids: [], assembly: [] } }, { spec: { portion: -1 } }]) {
    const h = harness(); await assert.rejects(h.updateDish({}, { kitchenId: 'k', dishId: 'existing', changes })); assert.equal(h.writes.length, 0)
  }
  const h = harness(); await assert.rejects(h.updateDish({}, { kitchenId: 'k', dishId: 'missing', changes: { name: 'New' } }), { statusCode: 404 })
})
test('Dish transport snapshots nested input and invalidates account/Kitchen round trips across waits', async () => {
  for (const stage of ['auth', 'token', 'response']) for (const scope of ['stable', 'kitchen', 'account', 'signout', 'route', 'dispose']) {
    let resolveUser, resolveToken, resolveResponse
    const auth = new Promise(r => { resolveUser = r }), token = new Promise(r => { resolveToken = r }), response = new Promise(r => { resolveResponse = r })
    const user = { uid: 'u', getIdToken: () => token }, currentUser = ref(user), selectedId = ref('k'), routePath = ref('/dishes/cola'), calls = [], disposed = []
    const useDishMutation = load('../../runtime/kitchen/composables/dish/useDishMutation.ts', { onBeforeUnmount: fn => disposed.push(fn),
      watch, useRoute: () => ({ get fullPath() { return routePath.value } }), useAuth: () => ({ currentUser }), useRequireUser: () => auth,
      useKitchenWorkspaceSelection: () => ({ selectedId }), useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
      $fetch: (...args) => { calls.push(args); return response },
    }, 'useDishMutation')
    const input = { draft: { name: 'Cola' } }, pending = useDishMutation().mutate('POST', input, 'k')
    const done = scope === 'stable' || stage === 'response' ? pending : assert.rejects(pending, /changed/)
    if (stage !== 'auth') { resolveUser(user); await Promise.resolve() }
    if (stage === 'response') { resolveToken('token'); await Promise.resolve() }
    if (scope === 'dispose') disposed.forEach(fn => fn())
    if (scope === 'route') { routePath.value = '/dishes/other'; routePath.value = '/dishes/cola' }
    if (scope === 'kitchen') { selectedId.value = 'other'; selectedId.value = 'k' }
    if (scope === 'account' || scope === 'signout') { currentUser.value = scope === 'signout' ? null : { uid: 'other' }; currentUser.value = user }
    input.draft.name = 'Changed'; resolveUser(user); resolveToken('token'); resolveResponse({ id: 'cola' }); await done
    assert.equal(calls.length, scope === 'stable' || stage === 'response' ? 1 : 0)
    if (calls.length) assert.equal(calls[0][1].body.draft.name, 'Cola')
  }
})

test('existing three public adapters retain caller signatures and choose exact command envelopes', async () => {
  const calls = []
  const useDishMutation = () => ({ mutate: async (...args) => { calls.push(args); return { id: 'dish' } } })
  const create = load('../../runtime/kitchen/composables/dish/useDishCreate.ts', { useDishMutation }, 'useDishCreate')()
  const update = load('../../runtime/kitchen/composables/dish/useDishUpdate.ts', { useDishMutation }, 'useDishUpdate')()
  const remove = load('../../runtime/kitchen/composables/dish/useDishDelete.ts', { useDishMutation }, 'useDishDelete')()
  await create.createDish({ name: 'Dish' }, { kitchenId: 'k' })
  await update.updateDish('dish', { description: 'Copy' }, { kitchenId: 'k' })
  await remove.deleteDish('dish', { kitchenId: 'k' })
  assert.deepEqual(calls, [
    ['POST', { draft: { name: 'Dish' } }, 'k'],
    ['PATCH', { dishId: 'dish', changes: { description: 'Copy' } }, 'k'],
    ['DELETE', { dishId: 'dish' }, 'k'],
  ])
})
