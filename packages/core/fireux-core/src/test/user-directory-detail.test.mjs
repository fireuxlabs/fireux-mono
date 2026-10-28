import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
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
import { computed, ref, toValue, reactive } from 'vue'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
function load(file, names, deps) {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default ', 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('public User detail follows API scope, normalized handles and honest read outcomes', async () => {
  const handle = ref('@ALICE'),
    config = reactive({ appId: 'tenant-a', role: 'tenant' }),
    state = {
      data: ref(null),
      pending: ref(true),
      error: ref(null),
      refresh() {},
      then: (fn) => Promise.resolve().then(fn),
    }
  let run
  const urls = []
  const { useUserDirectoryDetail } = load(
    '../runtime/user/composables/useUserDirectoryDetail.ts',
    'useUserDirectoryDetail',
    {
      computed,
      toValue,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      normalizeUserHandle: (s) => s.toLowerCase(),
      useFireUXConfig: () => config,
      useAsyncData: (_key, handler) => {
        run = handler
        return state
      },
    }
  )
  const detail = useUserDirectoryDetail(handle)
  const fetch = async () => {
    state.data.value = await ((currentReadFetch = async (url) => {
      urls.push(url)
      return {
        item: {
          id: 'user',
          handle: handle.value.replace(/^@/, '').toLowerCase(),
        },
      }
    }),
    run({}, { signal: new AbortController().signal }))
    state.pending.value = false
  }
  await fetch()
  assert.equal(urls[0], '/api/users/alice')
  assert.equal(detail.user.value.handle, 'alice')
  handle.value = 'bob'
  assert.equal(detail.user.value, null)
  await fetch()
  assert.equal(detail.user.value.handle, 'bob')
  config.appId = 'tenant-b'
  assert.equal(detail.user.value, null)
  await fetch()
  for (const statusCode of [404, 403, 503, 500]) {
    state.error.value = { statusCode }
    assert.equal(detail.user.value, null)
    assert.equal(detail.outcome.value, statusCode === 404 ? 'empty' : 'error')
  }
  state.error.value = null
  state.data.value.user.display_name = 'Live name'
  assert.equal(detail.user.value.display_name, 'Live name')
})
test('server rejects ambiguous handles and enforces existing global/tenant membership eligibility', async () => {
  let docs = [],
    scope = { kind: 'global' },
    member = false,
    readLimit
  const createError = (x) => Object.assign(new Error(x.statusMessage), x)
  const { userBelongsToDirectoryScope } = load(
    '../runtime/user/server/directory/scope.ts',
    'userBelongsToDirectoryScope',
    {
      createError,
      getRuntimeFirestore: () => ({
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: async () => ({
                  exists: member,
                  id: 'user',
                  get: () => 'user',
                }),
              }),
            }),
          }),
        }),
      }),
    }
  )
  const { handler } = load(
    '../runtime/server/api/users/[handle].get.ts',
    'handler',
    {
      defineEventHandler: (fn) => fn,
      createError,
      setResponseHeaders() {},
      resolveUserDirectoryScope: () => scope,
      userBelongsToDirectoryScope,
      getRuntimeIdentityFirestore: () => ({
        collection: () => ({
          where: () => ({
            limit: (n) => {
              readLimit = n
              return { get: async () => ({ docs }) }
            },
          }),
        }),
      }),
      normalizeUser: (id, data) => ({ id, handle: data.handle }),
      isUserDirectoryEligible: (user) => Boolean(user.handle),
    }
  )
  const row = (id) => ({ id, data: () => ({ handle: 'alice' }) }),
    event = { context: { params: { handle: 'ALICE' } } }
  docs = [row('a'), row('b')]
  await assert.rejects(handler(event), { statusCode: 500 })
  assert.equal(readLimit, 2)
  docs = [row('a')]
  assert.equal((await handler(event)).item.id, 'a')
  scope = { kind: 'tenant-app', appId: 'tenant-a' }
  await assert.rejects(handler(event), { statusCode: 404 })
  member = true
  assert.equal((await handler(event)).item.id, 'a')
  docs = []
  await assert.rejects(handler(event), { statusCode: 404 })
  docs = [{ id: 'a', data: () => ({ handle: '' }) }]
  await assert.rejects(handler(event), { statusCode: 404 })
})
