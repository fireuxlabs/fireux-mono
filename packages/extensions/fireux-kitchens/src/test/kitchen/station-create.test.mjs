import { readAppUserSubscription } from '../../../../../core/fireux-core/src/runtime/app/app-user/utils/validation.ts'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, reactive, ref, watch } from 'vue'
function load(path, dependencies, name) {
  dependencies = commandScopeDeps(dependencies)
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const readKitchenAccessIds = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)
const requireKitchenMutationAuthority = load(
  '../../runtime/kitchen/server/core/mutation-authority.ts',
  {
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: (app) => 'kitchen_access',
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    PLACE_MUTATION_TARGETS: { places: 'places' },
    readKitchenAccessIds,
    readAppUserSubscription,
    createError,
  },
  'requireKitchenMutationAuthority'
)
function harness() {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = []
  const records = new Map([
    ['kitchens/k', {}],
    ['places/k', {}],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
  ])
  const tx = {
    read: async (target, id) => ({
      exists: records.has(`${target}/${id}`),
      data: records.get(`${target}/${id}`),
    }),
    create: (target, id, data) => {
      writes.push({ target, id, data })
      records.set(`${target}/${id}`, data)
    },
  }
  let beforeTransaction = () => {}
  const create = load(
    '../../runtime/kitchen/server/stations/create.ts',
    {
      createError,
      requireFirestoreDocumentId,
      requireKitchenMutationAuthority,
      readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'app' }),
      runGuardedServerTransaction: async (_, run) => {
        beforeTransaction()
        return run(tx)
      },
      kitchenStationsTarget: (id) => `kitchens/${id}/stations`,
      serverAuditStamp: (x) => x,
    },
    'createKitchenStation'
  )
  return {
    create,
    records,
    writes,
    before: (callback) => {
      beforeTransaction = callback
    },
  }
}
test('authorized Station create stamps runtime authority and never overwrites', async () => {
  const h = harness()
  assert.deepEqual(
    await h.create({}, { kitchenId: 'k', name: ' Grill ', sortOrder: 2 }),
    { id: 'grill' }
  )
  assert.equal(h.writes[0].data.kitchen_id, 'k')
  assert.deepEqual(h.writes[0].data.created, { by: 'u', appId: 'app' })
  await assert.rejects(h.create({}, { kitchenId: 'k', name: 'Grill' }), {
    statusCode: 409,
  })
  assert.equal(h.writes.length, 1)
})
test('transaction observes denied/revoked/recreated App membership and exact Kitchen access', async () => {
  for (const change of [
    (h) => h.records.delete('apps/app/users/u'),
    (h) => {
      h.records.get('apps/app/users/u').role = 'guest'
    },
    (h) => {
      h.records.get('apps/app/users/u').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }
    },
    (h) => {
      h.records.get('kitchen_access/u').apps.app.ids = ['another']
    },
    (h) => h.records.delete('kitchen_access/u'),
    (h) => h.records.delete('places/k'),
  ]) {
    const h = harness()
    h.before(() => change(h))
    await assert.rejects(h.create({}, { kitchenId: 'k', name: 'Grill' }))
    assert.equal(h.writes.length, 0)
  }
})
test('rejects unsupported fields and invalid inputs before writes', async () => {
  for (const input of [
    null,
    [],
    {},
    { kitchenId: 'a/b', name: 'Grill' },
    { kitchenId: 'k', name: '' },
    { kitchenId: 'k', name: 3 },
    { kitchenId: 'k', name: 'Grill', sortOrder: -1 },
    { kitchenId: 'k', name: 'Grill', sortOrder: '1' },
    { kitchenId: 'k', name: 'Grill', active: false },
    { kitchenId: 'k', name: 'Grill', kitchenCollectionPath: 'elsewhere' },
  ]) {
    const h = harness()
    await assert.rejects(h.create({}, input))
    assert.equal(h.writes.length, 0)
  }
})
test('Station form preserves its target and cancels obsolete credential-stage writes', async () => {
  for (const stage of ['auth', 'token', 'response'])
    for (const change of [
      'stable',
      'kitchen',
      'account',
      'signout',
      'app',
      'membership',
      'grant',
      'dispose',
    ]) {
      let resolveUser, resolveToken, resolveResponse
      const auth = new Promise((resolve) => {
        resolveUser = resolve
      })
      const token = new Promise((resolve) => {
        resolveToken = resolve
      })
      const response = new Promise((resolve) => {
        resolveResponse = resolve
      })
      const user = { uid: 'u', getIdToken: () => token }
      const currentUser = ref(user),
        selectedId = ref('k'),
        canWrite = ref(true)
      const appUser = ref({ role: 'user', created: { at: 'one' } })
      const config = reactive({ appId: 'app' })
      const calls = [],
        lifetime = effectScope()
      const deps = {
        ref,
        computed,
        watch,
        useAuth: () => ({ currentUser }),
        useRequireUser: () => auth,
        useUserSession: () => ({ appUser }),
        useFireUXConfig: () => config,
        useKitchenWorkspaceStations: () => ({
          kitchenId: selectedId,
          rootCollection: ref('kitchens'),
          canWrite,
          stations: ref([]),
        }),
        $fetch: (...args) => {
          calls.push(args)
          return response
        },
      }
      deps.useKitchenStationCreate = load(
        '../../runtime/kitchen/composables/stations/useKitchenStationCreate.ts',
        deps,
        'useKitchenStationCreate'
      )
      const form = lifetime.run(() =>
        load(
          '../../runtime/kitchen/components/PrepAndProduction/Stations/Create/Index.vue',
          deps,
          '({addStation,name,message,saving})'
        )
      )
      form.name.value = 'Grill'
      const pending = form.addStation()
      if (stage !== 'auth') {
        resolveUser(user)
        await Promise.resolve()
      }
      if (stage === 'response') {
        resolveToken('token')
        await Promise.resolve()
        assert.equal(calls.length, 1)
      }
      if (change === 'kitchen') {
        selectedId.value = 'other'
        selectedId.value = 'k'
      }
      if (change === 'account' || change === 'signout') {
        currentUser.value = change === 'signout' ? null : { uid: 'other' }
        currentUser.value = user
      }
      if (change === 'app') {
        config.appId = 'other'
        config.appId = 'app'
      }
      if (change === 'membership') {
        const original = appUser.value
        appUser.value = { created: { at: 'two' } }
        appUser.value = original
      }
      if (change === 'grant') {
        canWrite.value = false
        canWrite.value = true
      }
      if (change === 'dispose') lifetime.stop()
      resolveUser(user)
      resolveToken('token')
      resolveResponse({ id: 'grill' })
      await pending
      const dispatched = change === 'stable' || stage === 'response'
      assert.equal(calls.length, dispatched ? 1 : 0, stage + '/' + change)
      if (dispatched)
        assert.deepEqual(calls[0][1].body, {
          kitchenId: 'k',
          name: 'Grill',
          sortOrder: 1,
          role: 'preparation',
        })
      assert.equal(
        form.message.value,
        change === 'stable' ? 'Added grill.' : ''
      )
      lifetime.stop()
    }
})
