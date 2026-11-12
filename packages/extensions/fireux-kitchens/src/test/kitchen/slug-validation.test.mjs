import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { validatePublicSlug } from '../../../../../core/fireux-core/src/runtime/utils/slug/validate-public-slug.ts'
import { normalizeSlug } from '../../../../../core/fireux-core/src/runtime/utils/slug/normalize-slug.ts'
const runtime = new URL('../../runtime/', import.meta.url)
const useRuntimeConfig = () => ({
  public: { fireux: { reservedRouteKeys: [' Configured-Route '] } },
})
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('Kitchen server command passes App reservations to its pure parser before writes', async () => {
  const parseKitchenUpdate = load(
    'kitchen/server/identity/update-input.ts',
    'parseKitchenUpdate',
    { createError, validatePublicSlug }
  )
  assert.deepEqual(parseKitchenUpdate({ 'identity.slug': 'Allowed Venue' }), {
    'identity.slug': 'allowed-venue',
  })
  let reads = 0
  const update = load('kitchen/server/identity/update.ts', 'updateKitchen', {
    createError,
    useRuntimeConfig,
    parseKitchenUpdate,
    requireFirestoreDocumentId: (id) => id,
    readKitchenMutationActor: () => reads++,
  })
  await assert.rejects(
    update(
      {},
      {
        kitchen_id: 'venue',
        patch: { 'identity.slug': 'Configured Route' },
      }
    ),
    /reserved/
  )
  assert.equal(reads, 0)
})

test('Kitchen publication rejects configured root routes before sending a command', async () => {
  let commands = 0
  const useKitchenUpdate = load(
    'kitchen/composables/useKitchenUpdate.ts',
    'useKitchenUpdate',
    {
      useAuth: () => ({ currentUser: { value: { uid: 'operator' } } }),
      useAppSession: () => ({ appUser: {} }),
      useFireUXConfig: () => ({ appId: 'app' }),
      useRoute: () => ({ path: '/workspace/kitchen/identity' }),
      useRuntimeConfig,
      useCommandScope: () => () => () => true,
      useRequireUser: () => commands++,
      validatePublicSlug,
    }
  )
  await assert.rejects(
    useKitchenUpdate().publishKitchen({
      kitchenId: 'venue',
      slug: 'Configured Route',
    }),
    /reserved/
  )
  assert.equal(commands, 0)
})

test('Menu naming retains tenant root reservations and directory entity rules', () => {
  for (const isTenant of [true, false]) {
    const menuNameAndSlug = load('menu/server/name.ts', 'menuNameAndSlug', {
      createError,
      useRuntimeConfig,
      useFireUXConfig: () => ({ isTenant }),
      normalizeSlug,
      validatePublicSlug,
    })
    if (isTenant) {
      assert.throws(() => menuNameAndSlug({}, 'Configured Route'), /reserved/)
      assert.deepEqual(menuNameAndSlug({}, 'New'), { name: 'New', slug: 'new' })
    } else {
      assert.deepEqual(menuNameAndSlug({}, 'Configured Route'), {
        name: 'Configured Route',
        slug: 'configured-route',
      })
      assert.throws(() => menuNameAndSlug({}, 'New'), /reserved/)
    }
  }
})
