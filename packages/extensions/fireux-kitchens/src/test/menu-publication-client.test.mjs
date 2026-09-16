import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, unref } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/menu/composables/publication/useMenuPublication.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
function harness({ signedIn = true, invalid = false } = {}) {
  const calls = []
  const db = {}
  const dependencies = {
    unref,
    useFireUXConfig: () => ({ appId: 'misebox' }),
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
    useFirestoreResolver: (database) => {
      assert.equal(unref(database), 'misebox')
      return () => db
    },
    useMenuUpdate: () => ({
      updateMenu: async (...args) => {
        calls.push(['update', ...args])
        return 'updated'
      },
    }),
    resolveKitchenCollectionBasePath: (path) => path || 'kitchens',
    DishStorage: { collection: 'dishes' },
    menuPath: ({ kitchenId }) => `kitchens/${kitchenId}/menus`,
    assertMenuCanPublish: async (input) => {
      calls.push(['validate', input])
      if (invalid) throw new Error('Menu needs at least one item')
    },
    $fetch: async (...args) => calls.push(['request', ...args]),
  }
  const create = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuPublication`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return {
    ...create({
      kitchenCollectionPath: ref('kitchens'),
      databaseId: ref('misebox'),
    }),
    calls,
    db,
  }
}

test('publish keeps preflight, authentication, endpoint and body unchanged', async () => {
  const h = harness()
  assert.equal(await h.publishMenu('k', 'm'), undefined)
  assert.deepEqual(h.calls, [
    [
      'validate',
      {
        appId: 'misebox',
        db: h.db,
        dishCollectionPath: 'kitchens/k/dishes',
        kitchenCollectionPath: 'kitchens',
        kitchenId: 'k',
        menuCollectionPath: 'kitchens/k/menus',
        menuId: 'm',
      },
    ],
    'token',
    [
      'request',
      '/api/workspace/kitchen/menus/publish',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        body: { kitchenId: 'k', menuId: 'm' },
      },
    ],
  ])
})

test('a failed preflight makes no publication request', async () => {
  const h = harness({ invalid: true })
  await assert.rejects(h.publishMenu('k', 'm'), /Menu needs at least one item/)
  assert.equal(h.calls.length, 1)
})

test('publication authentication errors remain action-specific', async () => {
  const h = harness({ signedIn: false })
  await assert.rejects(h.publishMenu('k', 'm'), {
    message: 'Sign in before publishing this Menu.',
  })
  await assert.rejects(h.unpublishMenu('k', 'm'), {
    message: 'Sign in before unpublishing this menu.',
  })
  assert.equal(
    h.calls.some((call) => call[0] === 'request'),
    false
  )
})

test('unpublish uses its trusted endpoint and archive retains the update operation', async () => {
  const h = harness()
  assert.equal(await h.unpublishMenu('k', 'm'), undefined)
  assert.deepEqual(h.calls[1], [
    'request',
    '/api/workspace/kitchen/menus/unpublish',
    {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
      body: { kitchenId: 'k', menuId: 'm' },
    },
  ])
  assert.equal(await h.archiveMenu('k', 'm'), undefined)
  assert.deepEqual(h.calls[2], ['update', 'k', 'm', { status: 'archived' }])
})
