import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import { resolveReadOutcome } from '../runtime/composables/fireux/firestore/operations/read-outcome.ts'

function load(file, names, deps) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace('export default ', 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}

test('Tenant directories choose App-scoped reads and never substitute global identities on failure', () => {
  for (const isTenant of [true, false]) {
    let tenantReads = 0,
      globalReads = 0
    const source = {
      users: ref([{ id: 'member', handle: 'member' }]),
      pending: ref(false),
      error: ref(null),
      outcome: ref('ready'),
      hasMore: ref(false),
      loadMore() {},
    }
    const { useUserDirectory } = load(
      '../runtime/user/composables/directory/useUserDirectory.ts',
      'useUserDirectory',
      {
        computed,
        resolveReadOutcome,
        useFireUXConfig: () => ({ appId: 'tenant-a', isTenant }),
        useUserDirectoryCollection: (appId) => {
          assert.equal(appId, 'tenant-a')
          tenantReads++
          return source
        },
        useUserCollection: () => {
          globalReads++
          return source
        },
        useUserSession: () => ({
          user: ref({ id: 'self', handle: 'self' }),
          appUser: ref(null),
          appOutcome: ref('missing'),
        }),
        isUserDirectoryEligible: (user) => Boolean(user.handle),
      }
    )
    const directory = useUserDirectory()
    assert.equal(tenantReads, isTenant ? 1 : 0)
    assert.equal(globalReads, isTenant ? 0 : 1)
    assert.deepEqual(
      directory.users.value.map((user) => user.id),
      isTenant ? ['member'] : ['self', 'member']
    )
    source.error.value = new Error('Directory read failed')
    assert.deepEqual(directory.users.value, [])
    assert.equal(directory.outcome.value, 'error')
    source.error.value = null
    source.pending.value = true
    assert.deepEqual(directory.users.value, [])
    assert.equal(directory.outcome.value, 'pending')
  }
})

function serverHarness() {
  let members = [
    { id: 'a', role: 'user' },
    { id: 'b', role: 'admin' },
    { id: 'c', role: 'user' },
    { id: 'd', role: 'dev' },
  ]
  const identities = new Map([
    ['a', { handle: 'alice' }],
    ['c', { handle: '' }],
    ['d', { handle: 'dana' }],
    ['outside', { handle: 'outsider' }],
  ])
  const queries = []
  const createError = (input) =>
    Object.assign(new Error(input.statusMessage), input)
  const { readUserDirectoryScopeIds } = load(
    '../runtime/user/server/directory/scope.ts',
    'readUserDirectoryScopeIds',
    {
      createError,
      FieldPath: { documentId: () => '__name__' },
      getRuntimeFirestore: () => ({
        collection: (collection) => {
          assert.equal(collection, 'apps')
          return {
            doc: (appId) => ({
              collection: (child) => {
                assert.equal(appId, 'tenant-a')
                assert.equal(child, 'users')
                let cursor = '',
                  limit = 0
                const query = {
                  orderBy: (field) => {
                    assert.equal(field, '__name__')
                    return query
                  },
                  startAfter: (value) => {
                    cursor = value
                    return query
                  },
                  limit: (value) => {
                    limit = value
                    return query
                  },
                  get: async () => {
                    queries.push({ appId, cursor, limit })
                    return {
                      docs: members
                        .filter((member) => member.id > cursor)
                        .slice(0, limit)
                        .map((member) => ({
                          id: member.id,
                          exists: true,
                          get: (key) => member[key],
                        })),
                    }
                  },
                }
                return query
              },
            }),
          }
        },
      }),
    }
  )
  let scope = { kind: 'tenant-app', appId: 'tenant-a' }
  const identityDb = {
    collection: () => ({ doc: (id) => ({ id }) }),
    getAll: async (...refs) =>
      refs.map(({ id }) => ({
        id,
        exists: identities.has(id),
        data: () => identities.get(id),
      })),
  }
  const { handler } = load(
    '../runtime/server/api/users/index.get.ts',
    'handler',
    {
      defineLiveReadHandler: (fn) => fn,
      createError,
      setResponseHeaders() {},
      getQuery: (event) => event.query,
      requireFirestoreDocumentId: (id) => {
        if (typeof id !== 'string' || !id || id.includes('/'))
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid cursor',
          })
        return id
      },
      resolveUserDirectoryScope: () => scope,
      readUserDirectoryScopeIds,
      getRuntimeIdentityFirestore: () => identityDb,
      normalizeUser: (id, data) => ({ id, ...data }),
      isUserDirectoryEligible: (user) => Boolean(user.handle),
    }
  )
  const { readLivePages } = load(
    '../runtime/composables/fireux/firestore/readLivePages.ts',
    'readLivePages',
    {}
  )
  const fetch = async (_url, options = {}) =>
    handler({ query: { limit: 2, ...options.query } })
  return {
    queries,
    identities,
    handler,
    fetch,
    readLivePages,
    setMembers: (value) => {
      members = value
    },
    setScope: (value) => {
      scope = value
    },
  }
}

test('Tenant pagination follows membership cursors across missing identities without reading unrelated Users', async () => {
  const h = serverHarness()
  const first = await h.fetch('/api/users')
  assert.deepEqual(
    first.items.map((user) => user.id),
    ['a']
  )
  assert.equal(first.nextCursor, 'b')
  const second = await h.fetch('/api/users', {
    query: { cursor: first.nextCursor },
  })
  assert.deepEqual(
    second.items.map((user) => user.id),
    ['d']
  )
  assert.equal(second.nextCursor, null)
  assert.deepEqual(h.queries, [
    { appId: 'tenant-a', cursor: '', limit: 3 },
    { appId: 'tenant-a', cursor: 'b', limit: 3 },
  ])
  await assert.rejects(h.handler({ query: { cursor: ['a'] } }), {
    statusCode: 400,
  })
  await assert.rejects(h.handler({ query: { cursor: 'wrong/path' } }), {
    statusCode: 400,
  })
  h.setScope({ kind: 'global' })
  await assert.rejects(h.handler({ query: { cursor: 'b' } }), {
    statusCode: 400,
  })
})

test('Loaded tenant pages replace membership after removal, identity edits and moving cursor boundaries', async () => {
  const h = serverHarness()
  const read = () => h.readLivePages(h.fetch, '/api/users', 2)
  assert.deepEqual(
    (await read()).items.map((user) => user.id),
    ['a', 'd']
  )
  h.setMembers([
    { id: 'b', role: 'admin' },
    { id: 'c', role: 'user' },
    { id: 'd', role: 'dev' },
  ])
  h.identities.set('b', { handle: 'bob' })
  h.identities.set('d', { handle: 'updated-dana' })
  const changed = await read()
  assert.deepEqual(
    changed.items.map((user) => user.id),
    ['b', 'd']
  )
  assert.equal(
    changed.items.find((user) => user.id === 'd').handle,
    'updated-dana'
  )
  h.identities.delete('b')
  assert.deepEqual(
    (await read()).items.map((user) => user.id),
    ['d']
  )
  h.setMembers([{ id: 'b', role: 'unexpected-role' }])
  await assert.rejects(read(), { statusCode: 409 })
})

test('Tenant collection preserves live pages, honest failures and bounded load-more retries', async () => {
  const h = serverHarness()
  let run,
    refreshCount = 0,
    fail = false
  const state = {
    data: ref(null),
    pending: ref(true),
    error: ref(null),
    refresh: async () => {
      refreshCount++
      state.pending.value = true
      try {
        if (fail) throw new Error('Unavailable')
        state.error.value = null
        state.data.value = await run(h.fetch)
      } catch (error) {
        state.error.value = error
      } finally {
        state.pending.value = false
      }
    },
  }
  const { useUserDirectoryCollection } = load(
    '../runtime/user/composables/directory/useUserDirectoryCollection.ts',
    'useUserDirectoryCollection',
    {
      computed,
      ref,
      resolveReadOutcome,
      readLivePages: h.readLivePages,
      useLiveAsyncData: (key, handler) => {
        assert.equal(key, 'user-directory:tenant-a')
        run = handler
        return state
      },
    }
  )
  const directory = useUserDirectoryCollection('tenant-a')
  assert.equal(directory.outcome.value, 'pending')
  await state.refresh()
  assert.deepEqual(
    directory.users.value.map((user) => user.id),
    ['a']
  )
  assert.equal(directory.hasMore.value, true)
  fail = true
  await directory.loadMore()
  assert.deepEqual(directory.users.value, [])
  assert.equal(directory.outcome.value, 'error')
  fail = false
  await state.refresh()
  assert.deepEqual(
    directory.users.value.map((user) => user.id),
    ['a'],
    'failed page growth is rolled back'
  )
  const before = refreshCount
  await Promise.all([directory.loadMore(), directory.loadMore()])
  assert.equal(refreshCount, before + 1)
  assert.deepEqual(
    directory.users.value.map((user) => user.id),
    ['a', 'd']
  )
  assert.equal(directory.hasMore.value, false)
  await directory.loadMore()
  assert.equal(refreshCount, before + 1)
})
