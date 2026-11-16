import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiReadConnections } from '../../runtime/composables/http/api-read-connections.ts'

const before = 'a'.repeat(64),
  after = 'b'.repeat(64)
const wait = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(predicate) {
  for (let count = 0; count < 100; count++) {
    if (predicate()) return
    await wait()
  }
  assert.fail('Expected live client transition did not occur.')
}
function transport({ ignoreAbort = false } = {}) {
  const requests = []
  let active = 0,
    peak = 0,
    ordinary = 0
  return {
    requests,
    get active() {
      return active
    },
    get peak() {
      return peak
    },
    get ordinary() {
      return ordinary
    },
    async fetch(url, options = {}) {
      if (url !== '/api/live') {
        ordinary++
        return new Response('ok')
      }
      let writer,
        closed = false
      const stream = new ReadableStream({
        start(controller) {
          writer = controller
        },
      })
      active++
      peak = Math.max(peak, active)
      function close(error) {
        if (closed) return
        closed = true
        active--
        if (error) writer.error(error)
        else writer.close()
      }
      const request = {
        url,
        options,
        subscriptions: JSON.parse(options.body),
        send(value, split = false) {
          if (closed) return
          const frame = `data: ${JSON.stringify(value)}\n\n`,
            encoder = new TextEncoder()
          if (split) {
            writer.enqueue(encoder.encode(frame.slice(0, 9)))
            writer.enqueue(encoder.encode(frame.slice(9)))
          } else writer.enqueue(encoder.encode(frame))
        },
        close,
        get closed() {
          return closed
        },
      }
      requests.push(request)
      if (!ignoreAbort)
        options.signal.addEventListener(
          'abort',
          () => close(new DOMException('Aborted', 'AbortError')),
          { once: true }
        )
      return new Response(stream, {
        headers: { 'content-type': 'text/event-stream' },
      })
    },
  }
}
function fixture(context, settings = {}) {
  const network = transport(settings)
  const credentials = []
  const manager = createApiReadConnections({
    fetch: network.fetch.bind(network),
    token: async (force) => {
      credentials.push(force)
      return `private-token-${credentials.length}`
    },
    retryDelay: () => 5,
    heartbeatTimeoutMs: settings.heartbeatTimeoutMs,
  })
  context.after(() => {
    manager.stop()
    for (const request of network.requests) request.close()
  })
  return { network, credentials, manager }
}
function subscribe(manager, url, callbacks = {}, access = 'public') {
  return manager.subscribe(
    { url, version: before, access },
    { change() {}, error() {}, ...callbacks }
  )
}

test('twelve distinct readers use one connection while ordinary reads and mutations remain available', async (context) => {
  const { manager, network, credentials } = fixture(context)
  const handles = Array.from({ length: 12 }, (_, index) =>
    subscribe(manager, `/api/records/${index}`)
  )
  await until(() => network.requests.length === 1)
  assert.equal(network.requests[0].subscriptions.length, 12)
  assert.equal(network.peak, 1)
  assert.equal(await (await network.fetch('/api/records')).text(), 'ok')
  assert.equal(
    await (await network.fetch('/api/records/one', { method: 'PATCH' })).text(),
    'ok'
  )
  assert.equal(network.ordinary, 2)
  assert.deepEqual(credentials, [])
  for (const handle of handles) handle.stop()
  await until(() => network.active === 0)
  assert.equal(manager.size, 0)
})

test('identical subscriptions deduplicate and an existing connection refreshes a later stale reader', async (context) => {
  const { manager, network } = fixture(context)
  const changes = []
  const first = subscribe(manager, '/api/records/one', {
    change: (version) => changes.push(['first', version]),
  })
  const second = subscribe(manager, '/api/records/one', {
    change: (version) => changes.push(['second', version]),
  })
  await until(() => network.requests.length === 1)
  const request = network.requests[0],
    id = request.subscriptions[0].id
  assert.equal(request.subscriptions.length, 1)
  request.send({ type: 'ready', id, version: after }, true)
  await until(() => changes.length === 2)
  first.update(after)
  second.update(after)
  request.send({ type: 'change', id, version: after })
  await wait()
  assert.equal(changes.length, 2)
  const third = subscribe(manager, '/api/records/one', {
    change: (version) => changes.push(['third', version]),
  })
  await until(() => changes.length === 3)
  assert.equal(network.requests.length, 1)
  first.stop()
  second.stop()
  assert.equal(manager.size, 1)
  third.stop()
  await until(() => network.active === 0)
})

test('protected reconnects reacquire credentials in headers and preserve the latest DTO version', async (context) => {
  const { manager, network, credentials } = fixture(context)
  const handle = subscribe(manager, '/api/protected/one', {}, 'protected')
  await until(() => network.requests.length === 1)
  handle.update(after)
  network.requests[0].send({ type: 'reauth' })
  await until(() => network.requests.length === 2)
  assert.deepEqual(credentials, [false, false])
  assert.equal(
    network.requests[0].options.headers.authorization,
    'Bearer private-token-1'
  )
  assert.equal(
    network.requests[1].options.headers.authorization,
    'Bearer private-token-2'
  )
  assert.equal(network.requests[1].subscriptions[0].version, after)
  for (const request of network.requests) {
    assert.doesNotMatch(request.url, /token/)
    assert.doesNotMatch(request.options.body, /token|authorization/)
  }
  assert.equal(network.peak, 1)
})

test('one failed identity refresh cannot loop or disable unrelated public readers', async (context) => {
  const { manager, network, credentials } = fixture(context)
  const errors = []
  subscribe(manager, '/api/public/one')
  subscribe(
    manager,
    '/api/protected/one',
    { error: (error) => errors.push(error) },
    'protected'
  )
  await until(() => network.requests.length === 1)
  const fail = (request) =>
    request.send({
      type: 'error',
      id: request.subscriptions.find(
        (item) => item.url === '/api/protected/one'
      ).id,
      statusCode: 401,
      message: 'Sign in.',
      retryable: false,
    })
  fail(network.requests[0])
  await until(() => network.requests.length === 2)
  fail(network.requests[1])
  await until(() => network.requests.length === 3)
  assert.deepEqual(credentials, [false, true])
  assert.deepEqual(
    network.requests[2].subscriptions.map((item) => item.url),
    ['/api/public/one']
  )
  await wait(25)
  assert.equal(network.requests.length, 3)
  assert.equal(errors.length, 2)
})

test('terminal source errors reconnect once with backoff and a ready event recovers the reader', async (context) => {
  const { manager, network } = fixture(context)
  const errors = [],
    changes = []
  subscribe(manager, '/api/records/one', {
    error: (error) => errors.push(error),
    change: (value) => changes.push(value),
  })
  await until(() => network.requests.length === 1)
  network.requests[0].send({
    type: 'error',
    id: network.requests[0].subscriptions[0].id,
    statusCode: 503,
    message: 'Unavailable.',
    retryable: true,
  })
  await until(() => network.requests.length === 2)
  network.requests[1].send({
    type: 'ready',
    id: network.requests[1].subscriptions[0].id,
    version: before,
  })
  await until(() => changes.length === 1)
  assert.equal(errors.length, 1)
  assert.equal(network.peak, 1)
})

test('old connection completions cannot notify a new identity scope', async (context) => {
  const { manager, network } = fixture(context, { ignoreAbort: true })
  const changes = []
  subscribe(manager, '/api/records/one', {
    change: (value) => changes.push(value),
  })
  await until(() => network.requests.length === 1)
  manager.setIdentity('app|second-user')
  await until(() => network.requests.length === 2)
  network.requests[0].send({
    type: 'change',
    id: network.requests[0].subscriptions[0].id,
    version: after,
  })
  await wait()
  assert.deepEqual(changes, [])
  network.requests[1].send({
    type: 'ready',
    id: network.requests[1].subscriptions[0].id,
    version: after,
  })
  await until(() => changes.length === 1)
})

test('the shared connection has a bounded subscription budget', async (context) => {
  const { manager } = fixture(context)
  for (let index = 0; index < 32; index++)
    subscribe(manager, `/api/records/${index}`)
  assert.throws(() => subscribe(manager, '/api/records/overflow'), /budget/)
})

test('a stalled public connection reconnects when heartbeats stop', async (context) => {
  const { manager, network } = fixture(context, { heartbeatTimeoutMs: 12 })
  const errors = []
  subscribe(manager, '/api/records/one', {
    error: (error) => errors.push(error),
  })
  await until(() => network.requests.length === 2)
  assert.equal(errors[0].statusCode, 503)
  assert.equal(network.peak, 1)
})
