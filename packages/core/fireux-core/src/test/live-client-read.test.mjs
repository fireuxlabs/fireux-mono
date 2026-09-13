import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch, toValue, effectScope, onScopeDispose } from 'vue'

function load(name, dependencies, client = true) {
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL(
        `../runtime/composables/fireux/firestore/${name}.ts`,
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', String(client))
    .replaceAll('import.meta.server', String(!client))
    .replaceAll('import.meta', '({})')
  return compileFunction(
    `${source}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const settle = async () => {
  for (let i = 0; i < 8; i++)
    await new Promise((resolve) => setImmediate(resolve))
}

function harness({
  client = true,
  hydrated = false,
  initial,
  handler,
  key = 'menus',
}) {
  const stateKeys = []
  const requests = []
  const streams = []
  const mounts = []
  const timers = new Map()
  let timerId = 0
  let running = 0
  function useAsyncData(_key, run) {
    stateKeys.push(toValue(_key))
    const data = ref(hydrated ? structuredClone(initial) : undefined)
    const error = ref()
    const status = ref(hydrated ? 'success' : 'idle')
    let latest = 0
    const execute = async (options = {}) => {
      if (hydrated && !Object.hasOwn(options, 'cachedData')) return
      const current = ++latest
      running++
      status.value = 'pending'
      try {
        const result = await run()
        if (current === latest) {
          data.value = result
          error.value = undefined
          status.value = 'success'
        }
      } catch (failure) {
        if (current === latest) {
          error.value = failure
          status.value = 'error'
        }
      } finally {
        running--
      }
    }
    const ready = hydrated ? Promise.resolve() : Promise.resolve().then(execute)
    return {
      data,
      error,
      status,
      pending: computed(() => status.value === 'pending'),
      execute,
      refresh: execute,
      then: (fn) => ready.then(fn),
    }
  }
  const dependencies = {
    useAsyncData,
    useId: () => 'test-owner',
    createError: (value) =>
      value instanceof Error
        ? value
        : Object.assign(new Error(value.message || ''), value),
    getCurrentInstance: () => (hydrated ? {} : null),
    onMounted: (fn) => mounts.push(fn),
    onScopeDispose,
    toValue,
    watch,
    setTimeout: (fn, delay) => {
      const id = ++timerId
      timers.set(id, { fn, delay })
      return id
    },
    clearTimeout: (id) => timers.delete(id),
    $fetch: async (url, options) => {
      requests.push({ url, options })
      return structuredClone(initial)
    },
    window: { location: { origin: 'http://localhost' } },
    sharedLiveResponse: async (url, options) => {
      const stream = { url: url.href, signal: options.signal }
      streams.push(stream)
      return new Response(
        new ReadableStream({
          start(controller) {
            stream.send = (value, event) =>
              controller.enqueue(
                new TextEncoder().encode(
                  `${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(value)}\n\n`
                )
              )
            const abort = () => controller.error(new Error('aborted'))
            options.signal.addEventListener('abort', abort, { once: true })
            if (options.signal.aborted) abort()
          },
        }),
        { headers: { 'content-type': 'text/event-stream' } }
      )
    },
  }
  const useLive = load('useLiveAsyncData', dependencies, client)
  const scope = effectScope()
  const state = scope.run(() => useLive(key, handler))
  for (const mount of mounts) mount()
  return {
    state,
    stateKeys,
    scope,
    requests,
    streams,
    timers,
    get running() {
      return running
    },
    stream(path) {
      const result = streams.findLast(
        (stream) =>
          stream.url === `http://localhost${path}` && !stream.signal.aborted
      )
      assert.ok(result, `No active stream for ${path}`)
      return result
    },
  }
}

test('SSR reads use an ordinary request and open no browser stream', async (t) => {
  const h = harness({
    client: false,
    initial: [{ id: 'published' }],
    handler: (fetch) => fetch('/api/menus'),
  })
  t.after(() => h.scope.stop())
  await settle()
  assert.deepEqual(h.state.data.value, [{ id: 'published' }])
  assert.equal(h.requests.length, 1)
  assert.equal(h.streams.length, 0)
  assert.equal(h.running, 0)
})

for (const hydrated of [false, true])
  test(`pushed results update and revoke data after ${hydrated ? 'SSR hydration' : 'client loading'} without browser GETs`, async (t) => {
    const h = harness({
      hydrated,
      initial: [{ id: 'ssr-value' }],
      handler: (fetch) => fetch('/api/menus'),
    })
    t.after(() => h.scope.stop())
    await settle()
    assert.equal(h.requests.length, 0)
    const stream = h.stream('/api/menus')
    stream.send([{ id: 'published' }])
    await settle()
    assert.deepEqual(h.state.data.value, [{ id: 'published' }])
    stream.send([])
    await settle()
    assert.deepEqual(h.state.data.value, [])
    assert.equal(h.requests.length, 0)
    assert.equal(h.streams.length, 1)
    stream.send({ statusCode: 403, message: 'Denied' }, 'read-error')
    await settle()
    assert.equal(h.state.data.value, undefined)
    assert.equal(h.state.error.value.statusCode, 403)
    assert.equal(stream.signal.aborted, true)
    assert.equal(h.timers.size, 0)
    assert.equal(h.running, 0)
  })

test('a denied initial stream settles the pending read without retrying', async (t) => {
  const h = harness({ handler: (fetch) => fetch('/api/private') })
  t.after(() => h.scope.stop())
  await settle()
  const stream = h.stream('/api/private')
  stream.send({ statusCode: 403, message: 'Denied' }, 'read-error')
  await settle()
  assert.equal(h.running, 0)
  assert.equal(h.state.data.value, undefined)
  assert.equal(h.state.error.value.statusCode, 403)
  assert.equal(stream.signal.aborted, true)
  assert.equal(h.requests.length, 0)
  assert.equal(h.timers.size, 0)
})

test('disposal settles a reader still waiting for its first frame', async () => {
  const h = harness({ handler: (fetch) => fetch('/api/menus') })
  await settle()
  const stream = h.stream('/api/menus')
  assert.equal(h.running, 1)
  h.scope.stop()
  await settle()
  assert.equal(stream.signal.aborted, true)
  assert.equal(h.running, 0)
  assert.equal(h.state.data.value, undefined)
  assert.equal(h.timers.size, 0)
})

test('changing identity cancels a pending first frame and allows the new read to settle', async (t) => {
  const key = ref('first')
  const h = harness({
    key,
    handler: (fetch) => fetch(`/api/menus/${key.value}`),
  })
  t.after(() => h.scope.stop())
  await settle()
  const first = h.stream('/api/menus/first')
  key.value = 'second'
  const next = h.state.execute({ cachedData: undefined })
  await settle()
  assert.equal(first.signal.aborted, true)
  assert.equal(h.running, 1)
  h.stream('/api/menus/second').send({ id: 'second' })
  await next
  assert.deepEqual(h.state.data.value, { id: 'second' })
  assert.equal(h.running, 0)
  assert.equal(h.requests.length, 0)
})

test('joined paged handlers use pushed values and replace obsolete cursor subscriptions', async (t) => {
  const readLivePages = load('readLivePages', {})
  const h = harness({
    handler: async (fetch) => {
      const [owner, page] = await Promise.all([
        fetch('/api/owner'),
        readLivePages(fetch, '/api/menus', 2),
      ])
      return {
        labels: page.items.map((item) => `${owner.name}: ${item.name}`),
        nextCursor: page.nextCursor,
      }
    },
  })
  t.after(() => h.scope.stop())
  await settle()
  h.stream('/api/owner').send({ name: 'Kitchen' })
  h.stream('/api/menus').send({
    items: [{ id: 'a', name: 'Food' }],
    nextCursor: 'b',
  })
  await settle()
  const oldPage = h.stream('/api/menus?cursor=b')
  oldPage.send({ items: [{ id: 'b', name: 'Drinks' }], nextCursor: null })
  await settle()
  assert.deepEqual(h.state.data.value.labels, [
    'Kitchen: Food',
    'Kitchen: Drinks',
  ])
  h.stream('/api/menus').send({
    items: [{ id: 'a', name: 'Lunch' }],
    nextCursor: 'c',
  })
  await settle()
  h.stream('/api/menus?cursor=c').send({
    items: [{ id: 'c', name: 'Dinner' }],
    nextCursor: null,
  })
  await settle()
  assert.deepEqual(h.state.data.value.labels, [
    'Kitchen: Lunch',
    'Kitchen: Dinner',
  ])
  assert.equal(oldPage.signal.aborted, true)
  h.stream('/api/owner').send({ name: 'Restaurant' })
  await settle()
  assert.deepEqual(h.state.data.value.labels, [
    'Restaurant: Lunch',
    'Restaurant: Dinner',
  ])
  assert.equal(h.requests.length, 0)
  assert.equal(h.streams.length, 4)
  assert.equal(h.running, 0)
})

// Nuxt caches the first handler by key; mounted owners must not share that handler.
test('component-owned live state gets a hydration-stable owner key', async () => {
  const h = harness({
    hydrated: true,
    initial: [],
    key: 'directory',
    handler: () => [],
  })
  assert.deepEqual(h.stateKeys, ['directory:test-owner'])
  h.scope.stop()
  await settle()
})

for (const initiallyMissing of [false, true]) {
  test(`missing document recovers on the same live stream (initial: ${initiallyMissing})`, async (t) => {
    const h = harness({ handler: (fetch) => fetch('/api/document') })
    t.after(() => h.scope.stop())
    await settle()
    const stream = h.stream('/api/document')
    if (!initiallyMissing) {
      stream.send({ id: 'original' })
      await settle()
    }
    stream.send({ statusCode: 404, message: 'Missing' }, 'read-error')
    await settle()
    assert.equal(h.state.error.value.statusCode, 404)
    assert.equal(h.state.data.value, undefined)
    assert.equal(stream.signal.aborted, false)
    assert.equal(h.timers.size, 0)
    stream.send({ id: 'original' })
    await settle()
    assert.deepEqual(h.state.data.value, { id: 'original' })
    assert.equal(h.state.error.value, undefined)
    assert.equal(h.streams.length, 1)
  })
}
