import test from 'node:test'
import assert from 'node:assert/strict'
import { AsyncLocalStorage } from 'node:async_hooks'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL('../runtime/server/utils/firestore/live-read.ts', import.meta.url),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const { collectFirestoreReads, observeRuntimeFirestore } = compileFunction(
  `${source}; return {collectFirestoreReads, observeRuntimeFirestore}`,
  ['AsyncLocalStorage']
)(AsyncLocalStorage)

test('live scope discovers query, nested document and getAll dependencies without affecting ordinary reads', async () => {
  const watched = []
  const record = {
    onSnapshot() {},
    isEqual(other) {
      return other === this
    },
    get() {
      assert.equal(this, record)
      return Promise.resolve({
        ref: record,
        data: () => ({ value: 1 }),
        get: () => 'admin',
      })
    },
    collection() {
      return record
    },
    doc() {
      return record
    },
    where() {
      return record
    },
    set() {
      throw new Error('should not run')
    },
  }
  const db = {
    collection: () => record,
    getAll: async (...refs) => Promise.all(refs.map((ref) => ref.get())),
  }
  assert.equal(observeRuntimeFirestore(db), db)
  await collectFirestoreReads(
    (value) => watched.push(value),
    async () => {
      const live = observeRuntimeFirestore(db)
      const query = live.collection('menus').where('status', '==', 'published')
      const snapshot = await query.get()
      assert.equal(snapshot.get('role'), 'admin')
      await snapshot.ref.collection('items').get()
      await live.getAll(query)
      assert.throws(() => query.set({}), /must not write/)
    }
  )
  assert.ok(watched.length >= 3)
  assert.equal(observeRuntimeFirestore(db), db)
})

test('concurrent live requests do not share dependency collectors', async () => {
  const received = [[], []]
  await Promise.all(
    received.map((items, index) =>
      collectFirestoreReads(
        (source) => items.push(source.id),
        async () => {
          await new Promise((resolve) => setImmediate(resolve))
          const reference = {
            id: index,
            onSnapshot() {},
            get: async () => ({}),
          }
          await observeRuntimeFirestore({ doc: () => reference })
            .doc('x')
            .get()
        }
      )
    )
  )
  assert.deepEqual(received, [[0], [1]])
})

const handlerSource =
  'const liveResponseSink = { getStore: () => undefined };\n' +
  stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/server/utils/http/defineLiveReadHandler.ts',
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
test('a protected projection rechecks membership and closes on revocation', async () => {
  const messages = []
  let disconnect
  let notify
  let allowed = true
  let present = true
  let stopped = false
  const stream = {
    onClosed: (fn) => {
      disconnect = fn
    },
    push: async (message) => messages.push(message),
    close: async () => disconnect(),
    send: () => 'stream',
  }
  class Event {
    constructor(req, res) {
      this.node = { req, res }
      this.context = {}
    }
  }
  const define = compileFunction(
    `${handlerSource}; return defineLiveReadHandler`,
    [
      'createEventStream',
      'defineEventHandler',
      'getHeader',
      'H3Event',
      'ServerResponse',
      'collectFirestoreReads',
    ]
  )(
    () => stream,
    (fn) => fn,
    () => 'text/event-stream',
    Event,
    class {},
    collectFirestoreReads
  )
  const membership = {
    onSnapshot: (fn) => {
      notify = fn
      return () => {
        stopped = true
      }
    },
    isEqual(other) {
      return other === this
    },
    get: async () => ({ allowed }),
  }
  const handler = define(async () => {
    const data = await observeRuntimeFirestore({ doc: () => membership })
      .doc('membership')
      .get()
    if (!data.allowed)
      throw Object.assign(new Error('Denied'), { statusCode: 403 })
    if (!present) throw Object.assign(new Error('Missing'), { statusCode: 404 })
    return { protected: 'visible' }
  })
  const settle = async () => {
    for (let i = 0; i < 6; i++)
      await new Promise((resolve) => setImmediate(resolve))
  }
  await handler({ node: { req: {} }, context: {} })
  await settle()
  assert.deepEqual(JSON.parse(messages[0].data), { protected: 'visible' })
  present = false
  notify()
  await settle()
  assert.equal(JSON.parse(messages.at(-1).data).statusCode, 404)
  assert.equal(stopped, false)
  present = true
  notify()
  await settle()
  assert.deepEqual(JSON.parse(messages.at(-1).data), { protected: 'visible' })
  allowed = false
  notify()
  await settle()
  assert.equal(messages.at(-1).event, 'read-error')
  assert.equal(JSON.parse(messages.at(-1).data).statusCode, 403)
  assert.equal(stopped, true)
})

test('disconnect during an awaited projection must not create late subscriptions', async () => {
  let disconnect,
    release,
    active = 0
  const gate = new Promise((r) => (release = r))
  const stream = {
    onClosed: (fn) => (disconnect = fn),
    push: async () => {},
    close: async () => disconnect(),
    send: () => 'stream',
  }
  class Event {
    constructor(req, res) {
      this.node = { req, res }
      this.context = {}
    }
  }
  const define = compileFunction(
    `${handlerSource}; return defineLiveReadHandler`,
    [
      'createEventStream',
      'defineEventHandler',
      'getHeader',
      'H3Event',
      'ServerResponse',
      'collectFirestoreReads',
    ]
  )(
    () => stream,
    (fn) => fn,
    () => 'text/event-stream',
    Event,
    class {},
    collectFirestoreReads
  )
  const ref = {
    onSnapshot: () => {
      active++
      return () => active--
    },
    isEqual(other) {
      return other === this
    },
    get: async () => ({}),
  }
  const handler = define(async () => {
    await gate
    await observeRuntimeFirestore({ doc: () => ref })
      .doc('late')
      .get()
    return { ok: true }
  })
  await handler({ node: { req: {} }, context: {} })
  disconnect()
  release()
  for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r))
  assert.equal(active, 0, 'no subscription survives disconnect')
})
