import test from 'node:test'
import assert from 'node:assert/strict'
import { createEvent } from 'h3'
import {
  captureLiveProjection,
  defineLiveProjection,
  liveProjectionVersion,
} from '../../runtime/server/utils/live-projection.ts'
import { LiveProjectionSourcePool } from '../../runtime/server/utils/live-projection-sources.ts'
import { subscribeLiveProjection } from '../../runtime/server/utils/live-projection-subscription.ts'
import { apiReadUrl } from '../../runtime/utils/api-read-protocol.ts'

const wait = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return
    await wait()
  }
  assert.fail('Expected live projection transition did not occur.')
}
function document(path, value = {}) {
  const listeners = new Set()
  return {
    path,
    value,
    firestore: database,
    starts: 0,
    stops: 0,
    initial: null,
    isEqual(other) {
      return other.firestore === this.firestore && other.path === this.path
    },
    onSnapshot(next, error) {
      this.starts++
      const listener = { next, error }
      listeners.add(listener)
      queueMicrotask(() => {
        this.initial?.()
        if (listeners.has(listener)) next({})
      })
      let active = true
      return () => {
        if (active) {
          active = false
          this.stops++
          listeners.delete(listener)
        }
      }
    },
    emit() {
      for (const listener of [...listeners]) listener.next({})
    },
    fail() {
      for (const listener of [...listeners])
        listener.error(new Error('SDK listener stopped'))
      listeners.clear()
    },
    get active() {
      return listeners.size
    },
  }
}
const database = {}
function request(path = '/api/fixture') {
  const headers = new Map()
  const event = createEvent(
    { method: 'GET', url: path, headers: {} },
    {
      setHeader: (key, value) => headers.set(key.toLowerCase(), value),
      getHeader: (key) => headers.get(key.toLowerCase()),
    }
  )
  return { event, headers }
}
async function capture(read, access = 'public') {
  const { event, headers } = request()
  const handler = defineLiveProjection({ access, read })
  const projection = await captureLiveProjection('/api/fixture', () =>
    handler(event)
  )
  return { projection, headers }
}

test('normal reads retain their DTO; capture is private and only same-origin API GETs are accepted', async () => {
  const source = document('records/one', { name: 'Public', secret: 'PRIVATE' })
  const handler = defineLiveProjection({
    access: 'public',
    read: (_event, sources) => {
      sources.watch(source)
      return { name: source.value.name }
    },
  })
  const { event, headers } = request()
  assert.deepEqual(await handler(event), { name: 'Public' })
  assert.equal(headers.get('x-fireux-live'), 'public')
  assert.match(headers.get('x-fireux-live-version'), /^[a-f\d]{64}$/)
  assert.equal(source.active, 0)
  assert.equal(
    apiReadUrl('/base/api/records?id=one'),
    '/base/api/records?id=one'
  )
  for (const url of [
    'https://other.invalid/api/records',
    '/api/live',
    '/base/api/live',
    '/api/%2fprivate',
    '/not-api',
    '/api/records#private',
  ])
    assert.throws(() => apiReadUrl(url))
  await assert.rejects(
    captureLiveProjection('/api/other', () => handler(event)),
    { statusCode: 400 }
  )
  assert.equal(
    liveProjectionVersion({ b: 2, a: 1 }),
    liveProjectionVersion({ a: 1, b: 2 })
  )
})

test('subscription readiness rereads after initial snapshots and closes the SSR-to-listener gap', async () => {
  const source = document('records/one', { name: 'Before' })
  const { projection } = await capture((_event, sources) => {
    sources.watch(source)
    return { name: source.value.name }
  })
  source.value.name = 'Changed before subscribe'
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'one',
    version: projection.initial.version,
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  assert.deepEqual(events, [
    {
      type: 'ready',
      id: 'one',
      version: liveProjectionVersion({ name: 'Changed before subscribe' }),
    },
  ])
  subscription.stop()
  assert.equal(pool.size, 0)
  assert.equal(source.active, 0)
})

test('the domain can declare a protected query variant before returning any DTO', async () => {
  const source = document('records/one', { name: 'Private' })
  const handler = defineLiveProjection({
    access: (event) =>
      event.path.includes('hidden=true') ? 'protected' : 'public',
    read: (_event, sources) => {
      sources.watch(source)
      return { name: source.value.name }
    },
  })
  const { event, headers } = request('/api/fixture?hidden=true')
  await handler(event)
  assert.equal(headers.get('x-fireux-live'), 'protected')
})

test('a domain fallback cannot swallow invalid source or budget declarations', async () => {
  for (const budget of [false, true]) {
    const { event, headers } = request()
    const handler = defineLiveProjection({
      access: 'public',
      read: (_event, sources) => {
        try {
          if (!budget) sources.watch({ onSnapshot() {} })
          else
            for (let index = 0; index <= 4096; index++)
              sources.watch({
                firestore: {},
                onSnapshot() {},
                isEqual: () => false,
              })
        } catch {
          /* An existing domain fallback must not make this look complete. */
        }
        return { apparentlyComplete: true }
      },
    })
    await assert.rejects(handler(event), (error) => error.statusCode === 500)
    assert.equal(headers.has('x-fireux-live-version'), false)
  }
})

test('changed joins are installed and reread before notification; removed joins unsubscribe', async () => {
  const first = document('joined/first', { name: 'First' })
  const second = document('joined/second', { name: 'Second' })
  const root = document('roots/one', { join: first })
  const { projection } = await capture((_event, sources) => {
    sources.watch(root)
    const joined = sources.watch(root.value.join)
    return { name: joined.value.name }
  })
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'one',
    version: projection.initial.version,
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  second.initial = () => {
    second.value.name = 'Changed during installation'
  }
  root.value.join = second
  root.emit()
  await until(() => events.some((event) => event.type === 'change'))
  assert.equal(
    events.at(-1).version,
    liveProjectionVersion({ name: 'Changed during installation' })
  )
  assert.equal(first.active, 0)
  assert.equal(second.active, 1)
  subscription.stop()
  assert.equal(pool.size, 0)
})

test('membership revocation clears the data subscription and retains only authority for recovery', async () => {
  const membership = document('apps/app/users/actor', { allowed: true })
  const team = document('projects/one/team/person', {
    name: 'Protected',
    secret: 'NEVER SEND',
  })
  const { projection } = await capture((_event, sources) => {
    sources.watch(membership, { authority: true })
    if (!membership.value.allowed)
      throw Object.assign(new Error('Denied'), { statusCode: 403 })
    sources.watch(team)
    return { members: [{ name: team.value.name }] }
  }, 'protected')
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'team',
    version: projection.initial.version,
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  membership.value.allowed = false
  membership.emit()
  await until(() => events.some((event) => event.statusCode === 403))
  assert.equal(team.active, 0)
  assert.equal(membership.active, 1)
  team.value.name = 'Still private'
  membership.value.allowed = true
  membership.emit()
  await until(
    () => events.filter((event) => event.type === 'ready').length === 2
  )
  assert.equal(
    events.at(-1).version,
    liveProjectionVersion({ members: [{ name: 'Still private' }] })
  )
  assert.doesNotMatch(
    JSON.stringify(events),
    /NEVER SEND|Still private|apps\/|projects\//
  )
  subscription.stop()
})

test('an unavailable public record can recover through an explicit authority source', async () => {
  const root = document('records/one', { visible: false })
  const { projection, headers } = await capture((_event, sources) => {
    sources.watch(root, { authority: true })
    if (!root.value.visible)
      throw Object.assign(new Error('Unavailable'), { statusCode: 404 })
    return { name: 'Visible' }
  })
  assert.equal(headers.get('x-fireux-live'), 'public')
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'one',
    version: '',
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  assert.equal(events.at(-1).statusCode, 404)
  root.value.visible = true
  root.emit()
  await until(() => events.some((event) => event.type === 'ready'))
  subscription.stop()
})

test('private-only field changes produce no public invalidation and shared sources refcount correctly', async () => {
  const source = document('records/one', { name: 'Public', secret: 'Before' })
  const { projection } = await capture((_event, sources) => {
    sources.watch(source)
    return { name: source.value.name }
  })
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscriptions = ['first', 'second'].map((id) =>
    subscribeLiveProjection({
      id,
      version: projection.initial.version,
      projection,
      pool,
      send: (event) => events.push(event),
    })
  )
  await Promise.all(subscriptions.map((subscription) => subscription.ready))
  assert.equal(source.starts, 1)
  source.value.secret = 'After'
  source.emit()
  await wait(50)
  assert.equal(events.length, 2)
  subscriptions[0].stop()
  assert.equal(source.active, 1)
  subscriptions[1].stop()
  assert.equal(source.active, 0)
  assert.equal(source.stops, 1)
})

test('terminal native listener errors stop delivery and release the shared native source', async () => {
  const source = document('records/one', { name: 'Public' })
  const { projection } = await capture((_event, sources) => {
    sources.watch(source)
    return { name: source.value.name }
  })
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'one',
    version: projection.initial.version,
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  source.fail()
  await until(() => events.some((event) => event.statusCode === 503))
  assert.equal(pool.size, 0)
  const count = events.length
  source.emit()
  await wait(35)
  assert.equal(events.length, count)
})

test('disposal suppresses a delayed projection and installs no later sources', async () => {
  const source = document('records/one', { name: 'Before' })
  let delay, release
  const { projection } = await capture(async (_event, sources) => {
    sources.watch(source)
    if (delay) await delay
    return { name: source.value.name }
  })
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'one',
    version: projection.initial.version,
    projection,
    pool,
    send: (event) => events.push(event),
  })
  await subscription.ready
  delay = new Promise((resolve) => {
    release = resolve
  })
  source.value.name = 'After'
  source.emit()
  await wait(30)
  subscription.stop()
  release()
  await wait()
  assert.equal(events.length, 1)
  assert.equal(pool.size, 0)
})
