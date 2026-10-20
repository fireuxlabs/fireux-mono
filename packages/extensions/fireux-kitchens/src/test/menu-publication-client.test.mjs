import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch, computed, effectScope } from 'vue'
import { commandScopeDeps } from './command-scope-fixture.mjs'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function harness({
  signedIn = true,
  failure,
  result = { ok: true, menu_id: 'm' },
  tokenWait,
} = {}) {
  const calls = []
  const currentUser = ref(
    signedIn
      ? {
          uid: 'operator',
          getIdToken: async () => {
            calls.push('token')
            return tokenWait ? tokenWait : 'token'
          },
        }
      : null
  )
  const selectedId = ref('k'),
    route = ref('/workspace/kitchen/food-and-drink/menus/lunch')
  const membership = ref({ role: 'user' })
  const scope = effectScope()
  const useMenuEditorScope = load(
    '../runtime/menu/composables/useMenuEditorScope.ts',
    'useMenuEditorScope',
    commandScopeDeps({
      watch,
      useAuth: () => ({ currentUser }),
      useUserSession: () => ({ appUser: membership }),
    })
  )
  const create = load(
    '../runtime/menu/composables/publication/useMenuPublication.ts',
    'useMenuPublication',
    {
      useAuth: () => ({ currentUser }),
      useRoute: () => ({
        get fullPath() {
          return route.value
        },
      }),
      useKitchenWorkspaceSelection: () => ({ selectedId }),
      useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
      useMenuEditorScope,
      $fetch: async (...args) => {
        calls.push(['request', ...args])
        if (failure) throw failure
        return result
      },
    }
  )
  return {
    ...scope.run(create),
    calls,
    currentUser,
    selectedId,
    route,
    membership,
    stop: () => scope.stop(),
  }
}
for (const [action, endpoint] of [
  ['publishMenu', 'publish'],
  ['unpublishMenu', 'unpublish'],
  ['archiveMenu', 'archive'],
]) {
  test(`${action} uses only authentication and its trusted command`, async () => {
    const h = harness()
    assert.equal(await h[action]('k', 'm'), undefined)
    assert.deepEqual(h.calls, [
      'token',
      [
        'request',
        `/api/workspace/kitchen/menus/${endpoint}`,
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token' },
          body: { kitchenId: 'k', menuId: 'm' },
          retry: 0,
        },
      ],
    ])
  })
  test(`${action} propagates command errors without a local status write`, async () => {
    const failure = new Error('Menu needs at least one item')
    const h = harness({ failure })
    await assert.rejects(h[action]('k', 'm'), failure)
    assert.equal(h.calls.length, 2)
  })
}

test('publication authentication errors remain action-specific', async () => {
  const h = harness({ signedIn: false })
  await assert.rejects(h.publishMenu('k', 'm'), {
    message: 'Sign in before publishing this Menu.',
  })
  await assert.rejects(h.unpublishMenu('k', 'm'), {
    message: 'Sign in before unpublishing this menu.',
  })
  await assert.rejects(h.archiveMenu('k', 'm'), {
    message: 'Sign in before archiving this Menu.',
  })
  await assert.rejects(h.restoreMenu('k', 'm'), {
    message: 'Sign in before restoring this Menu.',
  })
  assert.deepEqual(h.calls, [])
})

function deferred() {
  let resolve
  const promise = new Promise((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
for (const action of ['publishMenu', 'unpublishMenu', 'archiveMenu']) {
  test(`${action} does not dispatch after account, membership, Kitchen, route roundtrips or disposal during credentials`, async () => {
    for (const change of [
      'account',
      'membership',
      'kitchen',
      'route',
      'dispose',
    ]) {
      const token = deferred(),
        h = harness({ tokenWait: token.promise })
      const result = assert.rejects(h[action]('k', 'm'), /changed/)
      if (change === 'account') {
        const user = h.currentUser.value
        h.currentUser.value = null
        h.currentUser.value = user
      }
      if (change === 'membership') {
        const member = h.membership.value
        h.membership.value = null
        h.membership.value = member
      }
      if (change === 'kitchen') {
        h.selectedId.value = 'other'
        h.selectedId.value = 'k'
      }
      if (change === 'route') {
        h.route.value = '/other'
        h.route.value = '/workspace/kitchen/food-and-drink/menus/lunch'
      }
      if (change === 'dispose') h.stop()
      token.resolve('token')
      await result
      assert.deepEqual(h.calls, ['token'], change)
      h.stop()
    }
  })
  test(`${action} rejects mismatched Kitchen and malformed success responses`, async () => {
    const h = harness()
    await assert.rejects(h[action]('other', 'm'), /selected Kitchen/)
    assert.deepEqual(h.calls, [])
    h.stop()
    for (const result of [
      undefined,
      { ok: false },
      ...(action === 'publishMenu' ? [{ ok: true, menu_id: 'other' }] : []),
    ]) {
      const bad = harness({ result: result ?? null })
      await assert.rejects(bad[action]('k', 'm'), /response did not match/)
      bad.stop()
    }
  })
}

test('publication UI suppresses obsolete completion, errors and busy resets', async () => {
  for (const action of ['publishOrRepublish', 'unpublish'])
    for (const changed of [false, true])
      for (const failed of [false, true]) {
        const source = readFileSync(
          new URL(
            '../runtime/kitchen/components/Workspace/Menus/Publication/Actions.vue',
            import.meta.url
          ),
          'utf8'
        )
          .split('<script setup lang="ts">')[1]
          .split('</script>')[0]
          .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
        const pending = deferred(),
          notices = [],
          reset = []
        let current = true
        const deps = {
          computed,
          ref,
          useMenuEditorScope: (_sources, fn) => {
            reset.push(fn)
            return () => () => current
          },
          useKitchenMenuRecordContext: () => ({
            menu: ref({
              slug: 'lunch',
              status: action === 'unpublish' ? 'published' : 'draft',
            }),
            kitchenId: ref('k'),
            menuId: ref('m'),
            canWrite: ref(true),
            selectedKitchen: ref({ slug: 'kitchen' }),
            publishMenu: () => pending.promise,
            unpublishMenu: () => pending.promise,
          }),
          useToastify: () => ({ add: (n) => notices.push(n) }),
          useFireUXConfig: () => ({ isTenant: false }),
          useRequestURL: () => new URL('http://workspace.localhost:3001'),
          menuWebsiteOrigin: () => 'http://localhost:3001',
          menuRouteQrPath: () => '/kitchens/kitchen/menus/lunch/qr',
          menuRoutePath: () => '/kitchens/kitchen/menus/lunch',
          tenantMenuRouteScope: () => ({}),
          directoryMenuRouteScope: () => ({}),
        }
        const api = compileFunction(
          `${stripTypeScriptTypes(source)}; return { publishOrRepublish, unpublish, busy, errorMessage, publicMenuUrl, publicQrUrl }`,
          Object.keys(deps)
        )(...Object.values(deps))
        assert.equal(
          api.publicMenuUrl.value,
          'http://localhost:3001/kitchens/kitchen/menus/lunch'
        )
        assert.equal(
          api.publicQrUrl.value,
          'http://localhost:3001/kitchens/kitchen/menus/lunch/qr'
        )
        const result = api[action]()
        if (changed) {
          current = false
          reset.forEach((fn) => fn())
          api.busy.value = true
        }
        // Deferred rejection is captured by the real component; resolving a rejected Promise adopts its failure.
        pending.resolve(
          failed ? Promise.reject(new Error('Failed')) : undefined
        )
        await result
        assert.equal(
          notices.length,
          changed ? 0 : action === 'unpublish' && failed ? 0 : 1
        )
        assert.equal(api.errorMessage.value, failed && !changed ? 'Failed' : '')
        assert.equal(api.busy.value, changed)
      }
})
