import { commandScopeDeps } from './command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref, watch, effectScope } from 'vue'
function harness() {
  const lifetime = effectScope()
  let resolveUser, resolveToken
  const auth = new Promise((resolve) => {
    resolveUser = resolve
  })
  const token = new Promise((resolve) => {
    resolveToken = resolve
  })
  const user = { uid: 'a', getIdToken: () => token }
  const currentUser = ref(user),
    selectedId = ref('kitchen-a'),
    calls = []
  const dependencies = commandScopeDeps({
    useRoute: () => ({ fullPath: '/menus/create' }),
    computed,
    unref,
    watch,
    useAuth: () => ({ currentUser }),
    useRequireUser: () => auth,
    useWorkspace: () => ({ selectedId }),
    $fetch: async (...args) => {
      calls.push(args)
      return {
        created: true,
        id: 'menu',
        slug: 'food',
        kitchenId: args[1].body.kitchenId,
      }
    },
  })
  const source = readFileSync(
    new URL(
      '../runtime/menu/composables/firestore/mutations/useMenuCreate.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export type[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const create = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuCreate`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return {
    scope: lifetime,
    create: lifetime.run(() => create({ useSelectedKitchen: true })).createMenu,
    currentUser,
    selectedId,
    calls,
    user,
    resolveUser,
    resolveToken,
  }
}
test('captures payload and retains explicit Kitchen independently of workspace selection', async () => {
  const h = harness(),
    input = { name: 'Food', kitchenId: 'explicit' }
  const pending = h.create(input)
  input.name = 'Changed'
  input.kitchenId = 'changed'
  h.selectedId.value = 'other'
  h.resolveUser(h.user)
  await Promise.resolve()
  h.resolveToken('token')
  await pending
  const [path, { onResponse, ...options }] = h.calls[0]
  assert.equal(typeof onResponse, 'function')
  assert.deepEqual(
    [path, options],
    [
      '/api/workspace/kitchen/menus',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        body: { name: 'Food', kitchenId: 'explicit' },
      },
    ]
  )
  h.scope.stop()
})
test('rejects changed implicit Kitchen/account during either credential wait', async () => {
  for (const stage of ['auth', 'token'])
    for (const scope of ['kitchen', 'account', 'signout']) {
      const h = harness(),
        pending = h.create({ name: 'Food' })
      const rejected = assert.rejects(pending, /changed/)
      if (stage === 'token') {
        h.resolveUser(h.user)
        await Promise.resolve()
      }
      if (scope === 'kitchen') h.selectedId.value = 'other'
      else h.currentUser.value = scope === 'signout' ? null : { uid: 'b' }
      h.resolveUser(h.user)
      h.resolveToken('token')
      await rejected
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    }
})
test('stable implicit scope dispatches once', async () => {
  const h = harness(),
    pending = h.create({ name: 'Food' })
  h.resolveUser(h.user)
  await Promise.resolve()
  h.resolveToken('token')
  await pending
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0][1].body.kitchenId, 'kitchen-a')
  h.scope.stop()
})

test('rejects same-tick scope round trips during either credential wait', async () => {
  for (const stage of ['auth', 'token'])
    for (const scope of ['kitchen', 'account', 'signout']) {
      const h = harness(),
        pending = h.create({ name: 'Food' })
      const rejected = assert.rejects(pending, /changed/)
      if (stage === 'token') {
        h.resolveUser(h.user)
        await Promise.resolve()
      }
      if (scope === 'kitchen') {
        h.selectedId.value = 'kitchen-b'
        h.selectedId.value = 'kitchen-a'
      } else {
        h.currentUser.value = scope === 'signout' ? null : { uid: 'b' }
        h.currentUser.value = h.user
      }
      h.resolveUser(h.user)
      h.resolveToken('token')
      await rejected
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    }
})
test('explicit Kitchen ignores workspace round trips but rejects account round trips', async () => {
  for (const stage of ['auth', 'token'])
    for (const scope of ['kitchen', 'account', 'signout']) {
      const h = harness(),
        pending = h.create({ name: 'Food', kitchenId: 'explicit' })
      const result =
        scope === 'kitchen' ? pending : assert.rejects(pending, /changed/)
      if (stage === 'token') {
        h.resolveUser(h.user)
        await Promise.resolve()
      }
      if (scope === 'kitchen') {
        h.selectedId.value = 'kitchen-b'
        h.selectedId.value = 'kitchen-a'
      } else {
        h.currentUser.value = scope === 'signout' ? null : { uid: 'b' }
        h.currentUser.value = h.user
      }
      h.resolveUser(h.user)
      h.resolveToken('token')
      await result
      assert.equal(h.calls.length, scope === 'kitchen' ? 1 : 0)
      if (scope === 'kitchen')
        assert.equal(h.calls[0][1].body.kitchenId, 'explicit')
      h.scope.stop()
    }
})

test('Create disposal stops implicit and explicit Kitchen dispatch during either credential wait', async () => {
  for (const stage of ['auth', 'token'])
    for (const explicit of [false, true]) {
      const h = harness()
      const pending = h.create({
        name: 'Food',
        ...(explicit ? { kitchenId: 'explicit' } : {}),
      })
      const rejected = assert.rejects(pending, /changed/)
      if (stage === 'token') {
        h.resolveUser(h.user)
        await Promise.resolve()
      }
      h.scope.stop()
      h.resolveUser(h.user)
      h.resolveToken('token')
      await rejected
      assert.equal(h.calls.length, 0)
    }
})
