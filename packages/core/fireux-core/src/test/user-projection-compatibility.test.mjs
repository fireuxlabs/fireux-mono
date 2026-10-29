import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
function load(file, deps, result) {
  const source = readFileSync(
    new URL(`../runtime/${file}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const normalizeUser = load(
  'user/utils/normalize-user.ts',
  { resolveUserAvatarSource: (value) => value || '' },
  'normalizeUser'
)
const isUserDirectoryEligible = (user) => Boolean(user.handle)
const readUserIdentitySummary = load(
  'user/server/identity/summary.ts',
  { normalizeUser, isUserDirectoryEligible },
  'readUserIdentitySummary'
)
const doc = (id, raw = {}) => ({
  id,
  exists: true,
  data: () => ({ handle: id, display_name: id, ...raw }),
  get: (field) => (field === 'handle' ? id : raw[field]),
})

test('batch identity reads return display fields only and reject oversized requests', async () => {
  let ids = ['person', 'person'],
    reads = 0
  const handler = load(
    'server/api/user-identities/index.get.ts',
    {
      defineEventHandler: (value) => value,
      setResponseHeader: () => {},
      getQuery: () => ({ ids }),
      createError,
      requireFirestoreDocumentId: (value) => String(value),
      readUserIdentitySummary,
      getRuntimeIdentityFirestore: () => ({
        collection: () => ({ doc: (id) => id }),
        getAll: async (...values) => {
          reads++
          return values.map((id) =>
            doc(id, { email: 'PRIVATE', context: 'PRIVATE' })
          )
        },
      }),
    },
    'handler'
  )
  const result = await handler({})
  assert.equal(result.length, 1)
  assert.equal(JSON.stringify(result).includes('PRIVATE'), false)
  ids = Array.from({ length: 101 }, (_, i) => `person-${i}`)
  await assert.rejects(handler({}), { statusCode: 400 })
  assert.equal(reads, 1)
})
test('canonical membership lookup retains cross-directory lookup behind current App administration', async () => {
  let role = 'admin',
    duplicates = false
  const handler = load(
    'server/api/internal/app/membership/identity.get.ts',
    {
      defineEventHandler: (value) => value,
      setResponseHeader: () => {},
      getQuery: () => ({ handle: 'person' }),
      createError,
      useFireUXConfig: () => ({ appId: 'tenant' }),
      requireFirestoreDocumentId: (value) => value,
      requireFirebaseBearerUser: async () => ({ uid: 'administrator' }),
      requireAdmin: (data) => {
        if (data?.role !== 'admin') throw createError({ statusCode: 403 })
      },
      normalizeUserHandle: (value) => value,
      readUserIdentitySummary,
      getRuntimeFirestore: () => ({
        doc: (path) => {
          assert.equal(path, 'apps/tenant/users/administrator')
          return { get: async () => ({ data: () => ({ role }) }) }
        },
      }),
      getRuntimeIdentityFirestore: () => ({
        collection: () => ({
          where: (_field, _op, handle) => {
            assert.equal(handle, 'person')
            return {
              limit: (n) => {
                assert.equal(n, 2)
                return {
                  get: async () => ({
                    docs: duplicates
                      ? [doc('person'), doc('another')]
                      : [doc('person', { private_fixture: 'PRIVATE' })],
                  }),
                }
              },
            }
          },
        }),
      }),
    },
    'handler'
  )
  assert.equal((await handler({})).id, 'person')
  duplicates = true
  await assert.rejects(handler({}), { statusCode: 409 })
  role = 'user'
  await assert.rejects(handler({}), { statusCode: 403 })
})
test('global public User pagination preserves cursors and excludes private fields', async () => {
  const docs = [
    doc('alice', { private_fixture: 'PRIVATE' }),
    doc('bob'),
    doc('carol'),
  ]
  const db = {
    collection: () => ({
      doc: (id) => ({
        get: async () => docs.find((doc) => doc.id === id) || { exists: false },
      }),
      orderBy: (field) => {
        assert.equal(field, 'handle')
        let after = '',
          limit = 0
        const query = {
          startAfter: (value) => {
            after = value.id
            return query
          },
          limit: (value) => {
            limit = value
            return query
          },
          get: async () => ({
            docs: docs.filter((doc) => doc.id > after).slice(0, limit),
          }),
        }
        return query
      },
    }),
  }
  const read = load(
    'server/api/users/index.get.ts',
    {
      defineEventHandler: (value) => value,
      createError,
      normalizeUser,
      isUserDirectoryEligible,
      getRuntimeIdentityFirestore: () => db,
    },
    'readGlobalCanonicalUsers'
  )
  const first = await read(2, '')
  assert.deepEqual(
    first.items.map((x) => x.id),
    ['alice', 'bob']
  )
  assert.equal(first.nextCursor, 'bob')
  assert.equal(JSON.stringify(first).includes('PRIVATE'), false)
  const next = await read(2, first.nextCursor)
  assert.deepEqual(
    next.items.map((x) => x.id),
    ['carol']
  )
  assert.equal(next.nextCursor, null)
  await assert.rejects(read(2, 'missing'), { statusCode: 400 })
})
test('identity hydration and handle administration hide previous request results immediately', async () => {
  const ids = ref(['alice', 'alice']),
    state = { data: ref(), pending: ref(false), error: ref(null) }
  let run
  const hydrate = load(
    'user/composables/useUserHydration.ts',
    {
      computed,
      resolveReadOutcome,
      readRuntimeIdentityFirestoreDatabaseId: () => 'identity',
      useAsyncData: (_key, handler) => {
        run = handler
        return state
      },
      $fetch: {
        create:
          () =>
          async (_url, { query }) =>
            query.ids.map((id) => ({
              id,
              display_name: id,
              avatar: '',
              handle: id,
            })),
      },
    },
    'useUserHydration'
  )(ids)
  state.data.value = await run({}, { signal: new AbortController().signal })
  assert.equal(hydrate.users.value.length, 1)
  ids.value = ['bob']
  assert.equal(hydrate.userById('alice'), undefined)
  assert.equal(hydrate.outcome.value, 'pending')
  state.data.value = await run({}, { signal: new AbortController().signal })
  assert.equal(hydrate.userById('bob').id, 'bob')
  const currentUser = ref({ uid: 'admin', getIdToken: async () => 'fixture' }),
    handle = ref('alice')
  let execute
  const lookupState = { data: ref(), pending: ref(false), error: ref(null) }
  const lookup = load(
    'user/composables/useUserByHandle.ts',
    {
      computed,
      unref,
      resolveReadOutcome,
      useAuth: () => ({ currentUser }),
      useFireUXConfig: () => ({ appId: 'app' }),
      normalizeUserHandle: (value) => value,
      useAsyncData: (_key, handler) => {
        execute = handler
        return lookupState
      },
      $fetch: async (_url, { query }) => ({
        id: query.handle,
        handle: query.handle,
        display_name: query.handle,
      }),
    },
    'useUserByHandle'
  )(handle)
  lookupState.data.value = await execute(
    {},
    { signal: new AbortController().signal }
  )
  assert.equal(lookup.uid.value, 'alice')
  handle.value = 'bob'
  assert.equal(lookup.uid.value, null)
  currentUser.value = null
  assert.equal(lookup.outcome.value, 'idle')
  assert.equal(lookup.user.value, null)
})
