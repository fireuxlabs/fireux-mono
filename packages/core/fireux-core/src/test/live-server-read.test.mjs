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

function profileLiveHarness(rootCollection) {
  const messages = [],
    listeners = new Map(),
    references = new Map(),
    rows = new Map()
  let disconnect
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
  const defineLiveReadHandler = compileFunction(
    `${handlerSource}; return defineLiveReadHandler`,
    [
      'createEventStream',
      'defineEventHandler',
      'getHeader',
      'setResponseHeader',
      'appendResponseHeader',
      'H3Event',
      'ServerResponse',
      'collectFirestoreReads',
    ]
  )(
    () => stream,
    (fn) => fn,
    () => 'text/event-stream',
    () => {},
    () => {},
    Event,
    class {},
    collectFirestoreReads
  )
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: rows.has(path),
    ref: { path, parent: { parent: { id: path.split('/')[1] } } },
    data: () => rows.get(path),
  })
  const reference = (key, read) => {
    if (!references.has(key))
      references.set(key, {
        key,
        get: async () => read(),
        isEqual(other) {
          return other === this
        },
        onSnapshot(fn) {
          const callbacks = listeners.get(key) || new Set()
          callbacks.add(fn)
          listeners.set(key, callbacks)
          return () => {
            callbacks.delete(fn)
            if (!callbacks.size) listeners.delete(key)
          }
        },
      })
    return references.get(key)
  }
  const profilePath = rootCollection
    ? `${rootCollection}/person`
    : 'users/person/profiles/chef'
  const userPath = 'users/person'
  rows.set(profilePath, { kind: 'chef', title: 'Original profile' })
  rows.set(userPath, { handle: 'alice', display_name: 'Alice' })
  const profiles = reference('profile-query', () => {
    const docs = rows.has(profilePath) ? [snapshot(profilePath)] : []
    return { docs, empty: !docs.length, size: docs.length }
  })
  profiles.where = () => profiles
  profiles.limit = () => profiles
  const handles = reference('handle-query', () => {
    const docs =
      rows.get(userPath)?.handle === 'alice' ? [snapshot(userPath)] : []
    return { docs, empty: !docs.length, size: docs.length }
  })
  handles.where = () => handles
  handles.limit = () => handles
  const db = {
    collection: (name) => (name === 'users' ? handles : profiles),
    collectionGroup: () => profiles,
    doc: (path) => reference(path, () => snapshot(path)),
    getAll: async (...refs) => Promise.all(refs.map((ref) => ref.get())),
  }
  const profileSource = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/user/server/directory/profile-directory.ts',
        import.meta.url
      ),
      'utf8'
    )
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
  )
  const factories = compileFunction(
    `${profileSource}; return {createProfileDirectoryHandler, createProfileDetailHandler}`,
    [
      'defineLiveReadHandler',
      'defineEventHandler',
      'createError',
      'getQuery',
      'setResponseHeaders',
      'getRuntimeIdentityFirestore',
      'requireFirestoreDocumentId',
      'readUserIdentitySummary',
    ]
  )(
    defineLiveReadHandler,
    (fn) => fn,
    (input) => Object.assign(new Error(input.statusMessage), input),
    () => ({}),
    () => {},
    () => observeRuntimeFirestore(db),
    (value) => value,
    (value) => (value.exists ? { id: value.id, ...value.data() } : null)
  )
  const config = {
    kind: 'chef',
    mapProfile: (data) => data,
    ...(rootCollection ? { rootCollection } : {}),
  }
  const settle = async () => {
    for (let i = 0; i < 8; i++)
      await new Promise((resolve) => setImmediate(resolve))
  }
  const notify = async (key) => {
    for (const fn of [...(listeners.get(key) || [])]) fn()
    await settle()
  }
  return {
    messages,
    rows,
    listeners,
    profilePath,
    userPath,
    settle,
    notify,
    disconnect: () => disconnect(),
    open: (mode) =>
      factories[
        mode === 'collection'
          ? 'createProfileDirectoryHandler'
          : 'createProfileDetailHandler'
      ](config)({ node: { req: {} }, context: { params: { id: 'alice' } } }),
  }
}

for (const rootCollection of [undefined, 'chefs']) {
  for (const mode of ['collection', 'detail']) {
    test(`Profile ${mode} streams joined User/profile changes, removal, reappearance and disposal (${rootCollection || 'nested'})`, async () => {
      const h = profileLiveHarness(rootCollection)
      const entry = () => {
        const data = JSON.parse(h.messages.at(-1).data)
        return mode === 'collection' ? data.items[0] : data.item
      }
      assert.equal(await h.open(mode), 'stream')
      await h.settle()
      assert.equal(entry().user.display_name, 'Alice')
      assert.ok(h.listeners.has(h.userPath), 'joined canonical User stays live')
      assert.ok(
        h.listeners.has(
          mode === 'collection' ? 'profile-query' : h.profilePath
        ),
        'profile source stays live'
      )
      h.rows.set(h.userPath, { handle: 'alice', display_name: 'Updated name' })
      await h.notify(h.userPath)
      assert.equal(entry().user.display_name, 'Updated name')
      h.rows.set(h.profilePath, { kind: 'chef', title: 'Updated profile' })
      await h.notify(mode === 'collection' ? 'profile-query' : h.profilePath)
      assert.equal(entry().profile.title, 'Updated profile')
      h.rows.delete(h.profilePath)
      await h.notify(mode === 'collection' ? 'profile-query' : h.profilePath)
      if (mode === 'collection')
        assert.deepEqual(JSON.parse(h.messages.at(-1).data).items, [])
      else {
        assert.equal(h.messages.at(-1).event, 'read-error')
        assert.equal(JSON.parse(h.messages.at(-1).data).statusCode, 404)
      }
      assert.ok(
        h.listeners.has(
          mode === 'collection' ? 'profile-query' : h.profilePath
        ),
        'missing profile can reappear'
      )
      h.rows.set(h.profilePath, { kind: 'chef', title: 'Restored profile' })
      await h.notify(mode === 'collection' ? 'profile-query' : h.profilePath)
      assert.equal(entry().profile.title, 'Restored profile')
      h.disconnect()
      assert.equal(
        h.listeners.size,
        0,
        'all joined subscriptions stop on disposal'
      )
      const messageCount = h.messages.length
      await h.notify(h.userPath)
      assert.equal(h.messages.length, messageCount)
    })
  }
}
