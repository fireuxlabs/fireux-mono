import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, watch } from 'vue'

function load(path, name, dependencies) {
  const code = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(code)}; return ${name}`, Object.keys(dependencies))(...Object.values(dependencies))
}
function controller(fetch) {
  let execute
  const data = ref()
  const factory = load('../runtime/app/composables/useAppCollection.ts', 'useAppCollection', {
    computed, ref, toValue, watch,
    useAuth: () => ({ currentUser: ref(null), hasAuthState: ref(true) }),
    $fetch: fetch,
    useAsyncData: (_key, handler) => {
      execute = async () => { data.value = await handler() }
      return { data, pending: ref(false), error: ref(null), refresh: () => execute() }
    },
  })
  const endpoint = ref('/apps?limit=2')
  return { endpoint, state: factory(endpoint), execute: () => execute() }
}

test('App pages append without duplicates and expose the next cursor', async () => {
  const urls = []
  const c = controller(async url => {
    urls.push(url)
    return url.includes('cursor=')
      ? { ok: true, items: [{ id: 'b' }, { id: 'c' }], nextCursor: null }
      : { ok: true, items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'b' }
  })
  await c.execute()
  await c.state.loadMore()
  assert.deepEqual(c.state.apps.value.map(a => a.id), ['a', 'b', 'c'])
  assert.equal(c.state.hasMore.value, false)
  assert.match(urls[1], /cursor=b/)
})

test('A late page cannot enter a different relationship', async () => {
  let resolve
  const c = controller(async url => url.includes('cursor=')
    ? new Promise(done => { resolve = done })
    : { ok: true, items: [{ id: 'a' }], nextCursor: 'a' })
  await c.execute()
  const pending = c.state.loadMore()
  c.endpoint.value = '/apps?projectId=other'
  resolve({ ok: true, items: [{ id: 'stale' }], nextCursor: null })
  await pending
  assert.deepEqual(c.state.apps.value, [])
  assert.equal(c.state.loadingMore.value, false)
})

test('An empty scope performs no request', async () => {
  const c = controller(async () => { throw new Error('Unexpected request') })
  c.endpoint.value = ''
  await c.execute()
  assert.equal(c.state.outcome.value, 'idle')
})

test('Page validation rejects unbounded or malformed requests', () => {
  const parse = load('../runtime/app/server/collection/read.ts', 'readAppPageInput', {
    createError: input => new Error(input.statusMessage),
  })
  assert.deepEqual(parse({}), { limit: 24, cursor: '' })
  for (const limit of [0, -1, 101, 'bad']) assert.throws(() => parse({ limit }))
  assert.throws(() => parse({ cursor: 'a/b' }))
})

test('Merged pages have stable cursors and reject duplicate identities', () => {
  const page = load('../runtime/app/server/collection/read.ts', 'appCollectionPage', {
    createError: input => new Error(input.statusMessage),
  })
  assert.deepEqual(page([{ id: 'c' }, { id: 'a' }, { id: 'b' }], 2), {
    ok: true, items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'b',
  })
  assert.throws(() => page([{ id: 'a' }, { id: 'a' }]), /Duplicate/)
})
