import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, unref } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function harness({ signedIn = true, failure } = {}) {
  const calls = []
  const create = load(
    '../runtime/menu/composables/publication/useMenuPublication.ts',
    'useMenuPublication',
    {
      useAuth: () => ({
        currentUser: ref(
          signedIn
            ? {
                getIdToken: async () => {
                  calls.push('token')
                  return 'token'
                },
              }
            : null
        ),
      }),
      $fetch: async (...args) => {
        calls.push(['request', ...args])
        if (failure) throw failure
      },
    }
  )
  return { ...create(), calls }
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
  assert.deepEqual(h.calls, [])
})

test('metadata updates reject publication changes before any write or directory sync', async () => {
  const calls = []
  const create = load(
    '../runtime/menu/composables/firestore/mutations/useMenuUpdate.ts',
    'useMenuUpdate',
    {
      unref,
      useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
      useFirestoreUpdate: () => ({ updateDocument: () => calls.push('write') }),
      useFireUXConfig: () => ({ appId: 'app' }),
      useAuth: () => ({ currentUser: ref(null) }),
      menuPath: () => 'kitchens/k/menus',
      syncMenuDirectory: () => calls.push('sync'),
    }
  )
  for (const status of ['draft', 'published', 'archived']) {
    await assert.rejects(
      create().updateMenu('k', 'm', { status }),
      /Unsupported Menu field/
    )
  }
  assert.deepEqual(calls, [])
})
