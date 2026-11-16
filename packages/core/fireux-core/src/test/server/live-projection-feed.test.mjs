import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { liveProjectionFailure } from '../../runtime/server/utils/live-projection-subscription.ts'
import {
  API_READ_MAX_BODY_BYTES,
  API_READ_MAX_CHANNELS,
  apiReadUrl,
  apiReadVersion,
} from '../../runtime/utils/api-read-protocol.ts'

const version = 'a'.repeat(64)
const wait = () => new Promise((resolve) => setTimeout(resolve, 2))
async function until(predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return
    await wait()
  }
  assert.fail('Expected feed transition did not occur.')
}
function fixture({
  access = 'public',
  actor = true,
  dispatchError,
  writeGate,
} = {}) {
  const events = [],
    requests = [],
    jobs = [],
    timeouts = new Map(),
    intervals = new Map()
  let closed = false,
    closeHandler,
    authReads = 0
  const stream = {
    onClosed(handler) {
      closeHandler = handler
    },
    async push(event) {
      events.push(JSON.parse(event.data))
      if (writeGate) await writeGate
    },
    async close() {
      if (closed) return
      closed = true
      await closeHandler?.()
    },
    send() {
      return { stream: true }
    },
  }
  const dependencies = {
    createError: ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    createEventStream: () => stream,
    getHeader: (event, name) => event.headers[name],
    getRequestURL: () => new URL('http://fixture.local/api/live'),
    getRequestWebStream: (event) =>
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(event.body))
          controller.close()
        },
      }),
    API_READ_MAX_BODY_BYTES,
    API_READ_MAX_CHANNELS,
    apiReadUrl,
    apiReadVersion,
    firebaseBearerUser: async () => {
      authReads++
      await Promise.resolve()
      return actor
        ? {
            uid: 'actor',
            decoded: { exp: Math.floor(Date.now() / 1000) + 3600 },
          }
        : null
    },
    captureLiveProjection: async (url, dispatch) => {
      await dispatch()
      return { access: typeof access === 'function' ? access(url) : access }
    },
    subscribeLiveProjection: (options) => {
      const job = {
        options,
        stopped: false,
        stop() {
          this.stopped = true
        },
      }
      jobs.push(job)
      return job
    },
    liveProjectionFailure,
    $fetch: {
      raw: async (url, options) => {
        requests.push({ url, options })
        if (dispatchError) throw dispatchError
        return {}
      },
    },
    setTimeout: (callback, delay) => {
      const id = {}
      timeouts.set(id, { callback, delay })
      return id
    },
    clearTimeout: (id) => timeouts.delete(id),
    setInterval: (callback, delay) => {
      const id = {}
      intervals.set(id, { callback, delay })
      return id
    },
    clearInterval: (id) => intervals.delete(id),
  }
  const source = readFileSync(
    new URL(
      '../../runtime/server/utils/live-projection-feed.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const serve = compileFunction(
    stripTypeScriptTypes(source) + ';return serveLiveProjectionFeed',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return {
    events,
    requests,
    jobs,
    stream,
    timeouts,
    intervals,
    get authReads() {
      return authReads
    },
    get closed() {
      return closed
    },
    serve: (subscriptions, headers = {}) =>
      serve({
        body:
          typeof subscriptions === 'string'
            ? subscriptions
            : JSON.stringify(subscriptions),
        headers,
      }),
  }
}
const channel = (index) => ({
  id: `read-${index}`,
  url: `/api/records/${index}`,
  version,
})

test('one H3 feed dispatches twelve ordinary GET projections and cleans every subscription', async () => {
  const h = fixture()
  await h.serve(Array.from({ length: 12 }, (_, index) => channel(index)))
  await until(() => h.jobs.length === 12)
  assert.equal(h.requests.length, 12)
  assert.equal(h.authReads, 0)
  assert.equal(h.intervals.size, 1)
  await h.stream.close()
  assert.equal(
    h.jobs.every((job) => job.stopped),
    true
  )
  assert.equal(
    h.requests.every((request) => request.options.signal.aborted),
    true
  )
  assert.equal(h.intervals.size, 0)
})

test('protected projections share one bounded credential lease; credentials stay in headers', async () => {
  const h = fixture({ access: 'protected' })
  await h.serve([channel(1), channel(2)], {
    authorization: 'Bearer SECRET',
    cookie: 'session=PRIVATE',
  })
  await until(() => h.jobs.length === 2)
  assert.equal(h.authReads, 1)
  assert.equal(h.timeouts.size, 1)
  const lease = [...h.timeouts.values()][0]
  assert.equal(lease.delay, 60_000)
  assert.equal(
    h.requests.every(
      (request) => request.options.headers.authorization === 'Bearer SECRET'
    ),
    true
  )
  assert.doesNotMatch(JSON.stringify(h.events), /SECRET|PRIVATE|records\//)
  lease.callback()
  await until(() => h.closed)
  assert.deepEqual(h.events, [{ type: 'reauth' }])
  assert.equal(
    h.jobs.every((job) => job.stopped),
    true
  )
})

test('an invalid bearer prevents protected subscriptions while independent public reads remain available', async () => {
  const h = fixture({
    access: (url) => (url.endsWith('/1') ? 'public' : 'protected'),
    actor: false,
  })
  await h.serve([channel(1), channel(2), channel(3)])
  await until(() => h.events.length === 2 && h.jobs.length === 1)
  assert.equal(h.authReads, 1)
  assert.equal(
    h.events.every((event) => event.statusCode === 401),
    true
  )
  assert.equal(h.jobs[0].options.id, 'read-1')
  await h.stream.close()
})

test('malformed, oversized, duplicate, foreign and caller-authority subscriptions are rejected before dispatch', async () => {
  for (const input of [
    [],
    Array.from({ length: 33 }, (_, index) => channel(index)),
    [channel(1), channel(1)],
    [{ ...channel(1), url: 'https://other.invalid/api/records' }],
    [{ ...channel(1), url: '/api/live' }],
    [{ ...channel(1), appId: 'caller-selected' }],
    [{ ...channel(1), language: 'en\r\nsecret: bad' }],
    'x'.repeat(API_READ_MAX_BODY_BYTES + 1),
  ]) {
    const h = fixture()
    await assert.rejects(
      h.serve(input),
      (error) => error.statusCode === 400 || error.statusCode === 413
    )
    assert.equal(h.requests.length, 0)
  }
  const h = fixture()
  await assert.rejects(
    h.serve([channel(1)], { origin: 'https://other.invalid' }),
    { statusCode: 403 }
  )
  assert.equal(h.requests.length, 0)
})

test('internal errors are reduced to safe channel failures without raw paths or credentials', async () => {
  const h = fixture({
    dispatchError: new Error('private/firestore/path PRIVATE_KEY=secret'),
  })
  await h.serve([channel(1)])
  await until(() => h.events.length === 1)
  assert.equal(h.events[0].statusCode, 503)
  assert.doesNotMatch(
    JSON.stringify(h.events),
    /PRIVATE_KEY|firestore\/path|secret/
  )
  await h.stream.close()
})

test('a slow reader retains only the latest bounded channel notification', async () => {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const h = fixture({ writeGate: gate })
  await h.serve([channel(1)])
  await until(() => h.jobs.length === 1)
  for (let index = 0; index < 100; index++)
    h.jobs[0].options.send({
      type: 'change',
      id: 'read-1',
      version: index === 99 ? 'b'.repeat(64) : version,
    })
  assert.equal(h.events.length, 1)
  release()
  await until(() => h.events.length === 2)
  assert.equal(h.events[1].version, 'b'.repeat(64))
  await h.stream.close()
})
