import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, dependencies, name) {
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
  ])
  const tx = { read: async (target, id) => ({ exists: records.has(`${target}/${id}`), data: records.get(`${target}/${id}`) }), create: (target, id, data) => { writes.push({ target, id, data }); records.set(`${target}/${id}`, data) } }
  let beforeTransaction = () => {}
  const create = load('../../runtime/kitchen/server/stations/create.ts', {
    createError, requireFirestoreDocumentId, requireKitchenMutationAuthority,
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
    runGuardedServerTransaction: async (_, run) => { beforeTransaction(); return run(tx) },
    kitchenStationsTarget: id => `kitchens/${id}/stations`, serverAuditStamp: x => x,
  }, 'createKitchenStation')
  return { create, records, writes, before: callback => { beforeTransaction = callback } }
}
test('authorized Station create stamps runtime authority and never overwrites', async () => {
  const h = harness()
  assert.deepEqual(await h.create({}, { kitchenId: 'k', name: ' Grill ', sortOrder: 2 }), { id: 'grill' })
  assert.equal(h.writes[0].data.kitchen_id, 'k')
  assert.deepEqual(h.writes[0].data.created, { by: 'u', appId: 'app' })
  await assert.rejects(h.create({}, { kitchenId: 'k', name: 'Grill' }), { statusCode: 409 })
  assert.equal(h.writes.length, 1)
})
test('transaction observes denied/revoked/recreated App membership and exact Kitchen access', async () => {
  for (const change of [
    h => h.records.delete('apps/app/users/u'),
    h => { h.records.get('apps/app/users/u').role = 'guest' },
    h => { h.records.get('apps/app/users/u').created.at = { seconds: 2, nanoseconds: 0 } },
    h => { h.records.get('kitchen_access/app/users/u').ids = ['another'] },
    h => h.records.delete('kitchen_access/app/users/u'),
    h => h.records.delete('places/k'),
  ]) {
    const h = harness(); h.before(() => change(h))
    await assert.rejects(h.create({}, { kitchenId: 'k', name: 'Grill' }))
    assert.equal(h.writes.length, 0)
  }
})
test('rejects unsupported fields and invalid inputs before writes', async () => {
  for (const input of [null, [], {}, { kitchenId: 'a/b', name: 'Grill' }, { kitchenId: 'k', name: '' }, { kitchenId: 'k', name: 3 }, { kitchenId: 'k', name: 'Grill', sortOrder: -1 }, { kitchenId: 'k', name: 'Grill', sortOrder: '1' }, { kitchenId: 'k', name: 'Grill', active: false }, { kitchenId: 'k', name: 'Grill', kitchenCollectionPath: 'elsewhere' }]) {
    const h = harness(); await assert.rejects(h.create({}, input)); assert.equal(h.writes.length, 0)
  }
})
test('client blocks account/Kitchen round trips during both waits and dispatches stable input once', async () => {
  for (const stage of ['auth', 'token']) for (const scope of ['stable', 'kitchen', 'account', 'signout']) {
    let resolveUser, resolveToken
    const auth = new Promise(resolve => { resolveUser = resolve }), token = new Promise(resolve => { resolveToken = resolve })
    const user = { uid: 'u', getIdToken: () => token }, currentUser = ref(user), selectedId = ref('k'), calls = []
    const factory = load('../../runtime/kitchen/composables/stations/useKitchenStationCreate.ts', {
      watch, useAuth: () => ({ currentUser }), useRequireUser: () => auth, useKitchenWorkspaceSelection: () => ({ selectedId }),
      useWorkspaceWriteGuard: () => ({ requireWritableData() {} }), $fetch: async (...args) => { calls.push(args); return { id: 'grill' } },
    }, 'useKitchenStationCreate')
    const input = { kitchenId: 'k', name: 'Grill', sortOrder: 1 }, pending = factory().createKitchenStation(input)
    const result = scope === 'stable' ? pending : assert.rejects(pending, /changed/)
    if (stage === 'token') { resolveUser(user); await Promise.resolve() }
    if (scope === 'kitchen') { selectedId.value = 'other'; selectedId.value = 'k' }
    if (scope === 'account' || scope === 'signout') { currentUser.value = scope === 'signout' ? null : { uid: 'other' }; currentUser.value = user }
    input.name = 'Changed'
    resolveUser(user); resolveToken('token'); await result
    assert.equal(calls.length, scope === 'stable' ? 1 : 0)
    if (scope === 'stable') assert.equal(calls[0][1].body.name, 'Grill')
  }
})
