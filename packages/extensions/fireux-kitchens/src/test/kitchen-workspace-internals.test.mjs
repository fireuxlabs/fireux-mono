import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import {
  computed,
  effectScope,
  nextTick,
  onScopeDispose,
  reactive,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

function load(path, name, dependencies, client = false) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', String(client))
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
async function flush() {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}
function roundTrip(h, changed) {
  if (changed === 'account') {
    const old = h.user.value
    h.user.value = { uid: 'other' }
    h.user.value = old
  }
  if (changed === 'membership') {
    const old = h.session.appUser.value
    h.session.appUser.value = { id: 'new' }
    h.session.appUser.value = old
  }
  if (changed === 'app') {
    h.config.appId = 'other'
    h.config.appId = 'app'
  }
  if (changed === 'disposal') h.scope.stop()
}
function creation() {
  const scope = effectScope(),
    credentials = deferred(),
    place = deferred()
  const user = shallowRef({
    uid: 'actor',
    getIdToken: () => credentials.promise,
  })
  const session = { appUser: shallowRef({ id: 'member' }) },
    config = reactive({ appId: 'app' })
  const calls = [],
    response = deferred()
  let fetch = async (path) =>
    path.endsWith('preview')
      ? { place_id: 'place', kitchen_id: 'place', existing: true }
      : {
          ok: true,
          kitchen_id: 'place',
          owner_user_id: 'actor',
          created_root: false,
          created_team_member: false,
        }
  const create = load(
    '../runtime/kitchen/composables/firestore/useKitchenCreate.ts',
    'useKitchenCreate',
    {
      useCommandScope,
      useAuth: () => ({ currentUser: user }),
      useAppSession: () => session,
      useFireUXConfig: () => config,
      useRequireUser: async () => user.value,
      usePlaceCreate: () => ({ ensurePlaceExists: () => place.promise }),
      defineFireuxCreatePlan: (input) => input,
      $fetch: (path, options) => {
        calls.push({ path, options })
        return fetch(path, options)
      },
    }
  )
  return {
    scope,
    user,
    session,
    config,
    calls,
    credentials,
    place,
    response,
    flow: scope.run(create),
    fetch: (fn) => {
      fetch = fn
    },
  }
}
for (const changed of ['account', 'membership', 'app', 'disposal']) {
  test(`Kitchen creation stops after Place preparation if ${changed} intent expires`, async () => {
    const h = creation(),
      pending = h.flow.createKitchen({ place_id: 'place' })
    roundTrip(h, changed)
    h.place.resolve(true)
    h.credentials.resolve('token')
    await assert.rejects(pending, /context changed/)
    assert.deepEqual(h.calls, [])
    h.scope.stop()
  })
  test(`Kitchen contribution rejects obsolete ${changed} credentials before dispatch`, async () => {
    const h = creation(),
      pending = h.flow.contributeKitchenDirectory({ name: 'Original' })
    await flush()
    roundTrip(h, changed)
    h.credentials.resolve('token')
    await assert.rejects(pending, /context changed/)
    assert.deepEqual(h.calls, [])
    h.scope.stop()
  })
  test(`Kitchen preview discards its response after ${changed} changes away and back`, async () => {
    const h = creation()
    h.fetch(() => h.response.promise)
    h.credentials.resolve('token')
    const pending = h.flow.previewKitchenOnboarding({ place_id: 'place' })
    await flush()
    assert.equal(h.calls.length, 1)
    roundTrip(h, changed)
    h.response.resolve({ place_id: 'place', kitchen_id: 'place' })
    await assert.rejects(pending, /context changed/)
    h.scope.stop()
  })
}
test('Kitchen contribution and shell preserve inputs captured before credentials', async () => {
  for (const shell of [false, true]) {
    const h = creation(),
      input = shell
        ? {
            intent: 'create_shell',
            name: 'Original',
            owner_user_id: 'beneficiary',
          }
        : { name: 'Original' }
    const pending = shell
      ? h.flow.createKitchenShell(input)
      : h.flow.contributeKitchenDirectory(input)
    input.name = 'Changed'
    input.owner_user_id = 'other'
    h.credentials.resolve('token')
    await pending
    assert.deepEqual(
      h.calls[0].options.body,
      shell
        ? {
            intent: 'create_shell',
            name: 'Original',
            owner_user_id: 'beneficiary',
          }
        : { name: 'Original' }
    )
    h.scope.stop()
  }
})
test('a committed Kitchen completion remains truthful after its UI owner changes', async () => {
  const h = creation()
  h.fetch(() => h.response.promise)
  h.credentials.resolve('token')
  const input = { place_id: 'place', owner_user_id: 'beneficiary' }
  const pending = h.flow.completeKitchenOnboarding(input)
  input.owner_user_id = 'other'
  await flush()
  roundTrip(h, 'account')
  const result = { ok: true, kitchen_id: 'place', owner_user_id: 'beneficiary' }
  h.response.resolve(result)
  assert.deepEqual(await pending, result)
  assert.equal(h.calls[0].options.body.owner_user_id, 'beneficiary')
  h.scope.stop()
})
test('Kitchen creation composes Place, preview and completion exactly once in its original scope', async () => {
  const h = creation()
  h.place.resolve(true)
  h.credentials.resolve('token')
  assert.equal((await h.flow.createKitchen({ place_id: 'place' })).id, 'place')
  assert.deepEqual(
    h.calls.map((call) => call.path),
    ['/api/kitchens/onboarding/preview', '/api/kitchens/onboarding/complete']
  )
  h.scope.stop()
})

test('Kitchen directory hides retained rows during failure/loading and recovers with live data', () => {
  const state = {
    data: ref([{ id: 'retained' }]),
    pending: ref(false),
    error: ref(null),
    refresh: async () => {},
    then: (callback) => Promise.resolve().then(callback),
  }
  const collection = load(
    '../runtime/kitchen/composables/useKitchenCollection.ts',
    'useKitchenCollection',
    {
      computed,
      toValue,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      useAsyncData: () => state,
    }
  )()
  assert.equal(collection.outcome.value, 'ready')
  assert.equal(collection.count.value, 1)
  state.pending.value = true
  assert.deepEqual(collection.collection.value, [])
  assert.equal(collection.outcome.value, 'pending')
  state.error.value = new Error('failed')
  assert.equal(collection.outcome.value, 'error')
  assert.equal(collection.count.value, 0)
  state.pending.value = false
  state.error.value = null
  state.data.value = [{ id: 'fresh' }]
  assert.deepEqual(collection.collection.value, [{ id: 'fresh' }])
  assert.equal(collection.outcome.value, 'ready')
  state.data.value = []
  assert.equal(collection.outcome.value, 'empty')
})
function selection() {
  const scope = effectScope(),
    navigation = deferred(),
    selectedId = ref('first')
  const user = shallowRef({ uid: 'actor' }),
    session = {
      uid: ref('actor'),
      appUser: shallowRef({ id: 'member' }),
      pending: ref(false),
      error: ref(null),
    }
  const source = {
      kitchens: ref([{ id: 'first' }, { id: 'second' }, { id: 'third' }]),
      outcome: ref('ready'),
    },
    calls = [],
    states = new Map(),
    navigations = []
  const create = load(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex.ts',
    'useKitchenWorkspaceIndex',
    {
      computed,
      watch,
      useCommandScope,
      useWorkspaceEntryCta: () => ({
        workspaceEntryPath: ref('/workspace/kitchen'),
      }),
      useFireUXConfig: () => ({ appId: 'app' }),
      useState: (key, init) => {
        if (!states.has(key)) states.set(key, ref(init()))
        return states.get(key)
      },
      useRoute: () => ({
        query: {},
        path: '/workspace/kitchen/food-and-drink/menus/item',
        meta: { workspace: 'kitchen' },
        matched: [],
      }),
      useRouter: () => ({ getRoutes: () => [] }),
      useWorkspace: () => ({
        selectedId,
        select: (id) => {
          calls.push(id)
          selectedId.value = id
        },
        reconcile: () => {},
      }),
      useKitchenWorkspaceKitchens: () => source,
      useAppSession: () => session,
      resolveAppUserAccess: () => ({}),
      kitchenWorkspaceSwitchPath: () =>
        '/workspace/kitchen/food-and-drink/menus',
      navigateTo: () => {
        const wait = navigations.length ? deferred() : navigation
        navigations.push(wait)
        return wait.promise
      },
    }
  )
  return {
    scope,
    user,
    session,
    source,
    calls,
    selectedId,
    navigation,
    navigations,
    nextIndex: () => scope.run(create),
    flow: scope.run(create),
  }
}
for (const changed of [
  'account',
  'membership',
  'selection',
  'read',
  'disposal',
])
  test(`Kitchen switch ignores navigation completion after ${changed} intent changes`, async () => {
    const h = selection(),
      pending = h.flow.select('second')
    if (changed === 'account') {
      h.session.uid.value = 'other'
      h.session.uid.value = 'actor'
    }
    if (changed === 'membership') roundTrip(h, changed)
    if (changed === 'selection') {
      h.selectedId.value = 'other'
      h.selectedId.value = 'first'
    }
    if (changed === 'read') {
      h.source.outcome.value = 'pending'
      h.source.outcome.value = 'ready'
    }
    if (changed === 'disposal') h.scope.stop()
    h.navigation.resolve()
    await pending
    assert.deepEqual(h.calls, [])
    h.scope.stop()
  })
test('Kitchen switch accepts only a settled accessible Kitchen', async () => {
  const h = selection()
  await h.flow.select('unknown')
  assert.deepEqual(h.calls, [])
  const pending = h.flow.select('second')
  h.navigation.resolve()
  await pending
  assert.deepEqual(h.calls, ['second'])
  h.scope.stop()
})
for (const separate of [false, true])
  test(`the latest Kitchen choice wins across ${separate ? 'separate' : 'one'} selectors`, async () => {
    const h = selection(),
      second = separate ? h.nextIndex() : h.flow
    const old = h.flow.select('second'),
      latest = second.select('third')
    h.navigations[0].resolve()
    await old
    assert.deepEqual(h.calls, [])
    h.navigations[1].resolve()
    await latest
    assert.deepEqual(h.calls, ['third'])
    h.scope.stop()
  })
test('reselecting the current Kitchen cancels a pending switch', async () => {
  const h = selection(),
    old = h.flow.select('second')
  await h.nextIndex().select('first')
  h.navigation.resolve()
  await old
  assert.equal(h.selectedId.value, 'first')
  assert.deepEqual(h.calls, [])
  h.scope.stop()
})
function adoption(client = false) {
  const scope = effectScope(),
    credentials = deferred(),
    response = deferred(),
    calls = [],
    cleared = [],
    states = new Map()
  const user = shallowRef({
      uid: 'actor',
      getIdToken: () => credentials.promise,
    }),
    config = reactive({ appId: 'app' })
  const session = {
    uid: computed(() => user.value?.uid),
    appUser: shallowRef({ id: 'member' }),
    pending: ref(false),
    error: ref(null),
  }
  let proof = { kitchenId: 'guest', secret: 'proof' }
  const useState = (key, init) => {
    if (!states.has(key)) states.set(key, ref(init()))
    return states.get(key)
  }
  const create = load(
    '../runtime/kitchen/composables/workspace/useKitchenAnonymousAdoption.ts',
    'useKitchenAnonymousAdoption',
    {
      watch,
      useCommandScope,
      useState,
      useAuth: () => ({
        currentUser: user,
        isAuthenticated: computed(() => !!user.value),
      }),
      useFireUXConfig: () => config,
      useAppSession: () => session,
      readGuestKitchenClaim: () => proof,
      clearGuestKitchenClaim: (appId, original) => {
        cleared.push({ appId, original })
        if (proof === original) proof = null
      },
      $fetch: (path, options) => {
        calls.push({ path, options })
        return response.promise
      },
    },
    client
  )
  return {
    scope,
    user,
    session,
    config,
    credentials,
    response,
    calls,
    cleared,
    states,
    flow: scope.run(create),
    setProof: (value) => {
      proof = value
    },
  }
}
for (const changed of ['account', 'membership', 'app', 'disposal']) {
  test(`guest Kitchen connection does not dispatch with obsolete ${changed} credentials`, async () => {
    const h = adoption(),
      pending = h.flow.adopt()
    roundTrip(h, changed)
    h.credentials.resolve('token')
    assert.equal(await pending, false)
    assert.deepEqual(h.calls, [])
    assert.equal(h.flow.pending.value, false)
    h.scope.stop()
  })
  test(`confirmed guest connection consumes its proof but suppresses obsolete ${changed} selection`, async () => {
    const h = adoption()
    h.credentials.resolve('token')
    const pending = h.flow.adopt()
    await flush()
    roundTrip(h, changed)
    h.response.resolve({ ok: true, kitchen_id: 'guest', adopted: true })
    assert.equal(await pending, false)
    assert.equal(h.cleared.length, 1)
    assert.equal(h.states.get('kitchen-adopted-selection:app').value, '')
    assert.equal(h.flow.error.value, '')
    h.scope.stop()
  })
}
test('guest connection rejects a mismatched response and preserves the recovery proof', async () => {
  const h = adoption()
  h.credentials.resolve('token')
  const pending = h.flow.adopt()
  await flush()
  h.response.resolve({ ok: true, kitchen_id: 'other', adopted: true })
  assert.equal(await pending, false)
  assert.deepEqual(h.cleared, [])
  assert.match(h.flow.error.value, /could not be connected/)
  h.scope.stop()
})
test('obsolete guest connection failure cannot overwrite the current account feedback', async () => {
  const h = adoption()
  h.credentials.resolve('token')
  const pending = h.flow.adopt()
  await flush()
  roundTrip(h, 'account')
  h.response.reject(new Error('failed'))
  assert.equal(await pending, false)
  assert.equal(h.flow.error.value, '')
  assert.equal(h.flow.pending.value, false)
  h.scope.stop()
})
test('a live account switch can resume guest connection after the old credentials finish', async () => {
  const h = adoption(true)
  await flush()
  h.user.value = { uid: 'new', getIdToken: async () => 'new-token' }
  await nextTick()
  h.credentials.resolve('old-token')
  await flush()
  await nextTick()
  await flush()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].options.headers.Authorization, 'Bearer new-token')
  h.response.resolve({ ok: true, kitchen_id: 'guest', adopted: true })
  await flush()
  assert.equal(h.states.get('kitchen-adopted-selection:app').value, 'guest')
  h.scope.stop()
})
