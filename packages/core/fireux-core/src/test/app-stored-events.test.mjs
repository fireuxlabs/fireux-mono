import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createJiti } from 'jiti'

const load = createJiti(import.meta.url)
const targets = await load.import('../runtime/app/server/mutation-targets.ts')
const memberships = await load.import(
  '../runtime/app/app-user/server/mutation-targets.ts'
)
const notifications = await load.import(
  '../runtime/user/server/mutation-targets.ts'
)
const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/app/server/events/publish-joined-event.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'\"]+['\"];?\n/gm, '')
    .replace(/^export /gm, '')
)
const input = { appId: 'app-a', ecosystemId: 'ecosystem', userId: 'joining' }
const at = {
  toMillis: () => 1700000000000,
  toDate: () => new Date(1700000000000),
}

function fixture({ failNotification = false } = {}) {
  const records = new Map([
    ['apps/app-a', { name: 'App A' }],
    ['apps/app-a/users/joining', { role: 'admin', created: { at } }],
    ['apps/app-a/users/owner', { role: 'admin' }],
    ['apps/app-a/users/developer', { role: 'dev' }],
  ])
  const serverStamp = { serverTimestamp: true }
  const scopes = []
  const publish = compileFunction(
    `${source}; return publishAppUserJoinedEvent`,
    [
      'FieldValue',
      'runGuardedServerTransaction',
      ...Object.keys(targets),
      'serverAppUsersTarget',
      'serverUserNotificationsTarget',
    ]
  )(
    { serverTimestamp: () => serverStamp },
    async (database, work) => {
      assert.equal(database.kind, 'runtime')
      const staged = []
      const key = (target, id) => {
        assert.equal(target.database.kind, 'runtime')
        scopes.push(target.collectionPath)
        return `${target.collectionPath}/${id}`
      }
      const result = await work({
        read: async (target, id) => {
          assert.equal(staged.length, 0, 'reads precede writes')
          const path = key(target, id)
          return { exists: records.has(path), data: records.get(path) }
        },
        query: async (target, query) => {
          assert.equal(staged.length, 0, 'queries precede writes')
          key(target, '')
          return [...records]
            .filter(
              ([path, data]) =>
                path.startsWith(`${target.collectionPath}/`) &&
                data[query.field] === query.value
            )
            .slice(0, query.limit)
            .map(([path, data]) => ({ id: path.split('/').at(-1), data }))
        },
        create: (target, id, data) => {
          const path = key(target, id)
          if (failNotification && path.startsWith('users/'))
            throw Error('Notification rejected')
          staged.push([path, data])
        },
      })
      for (const [path] of staged) assert.equal(records.has(path), false)
      for (const [path, data] of staged) records.set(path, data)
      return result
    },
    ...Object.values(targets),
    memberships.serverAppUsersTarget,
    notifications.serverUserNotificationsTarget
  )
  return { publish, records, scopes, serverStamp }
}

test('joined events retain their payload and atomically notify other App admins and developers', async () => {
  const f = fixture()
  const result = await f.publish(input)
  assert.deepEqual(result, {
    created: true,
    eventId: 'user-joined-joining-1700000000000',
    membershipRole: 'admin',
    occurredAt: at.toDate().toISOString(),
  })
  assert.deepEqual(f.records.get(`apps/app-a/events/${result.eventId}`), {
    id: result.eventId,
    name: 'app.user.joined',
    version: 1,
    app_id: 'app-a',
    ecosystem_id: 'ecosystem',
    source: 'identity',
    subject: { kind: 'user', id: 'joining' },
    actor: { kind: 'user', id: 'joining' },
    payload: { user_id: 'joining', membership_role: 'admin' },
    occurred_at: at,
    published_at: f.serverStamp,
  })
  for (const id of ['owner', 'developer'])
    assert.deepEqual(
      f.records.get(`users/${id}/notifications/${result.eventId}`),
      {
        message: 'New user joined App A.',
        scope: 'app',
        created: { at: f.serverStamp, app_id: 'app-a' },
        read: false,
      }
    )
  assert.equal(
    f.records.has(`users/joining/notifications/${result.eventId}`),
    false
  )
})

test('retries preserve the first event and notifications; a later membership occurrence gets a distinct event', async () => {
  const f = fixture()
  const first = await f.publish(input)
  const snapshot = [...f.records]
  assert.deepEqual(await f.publish(input), { ...first, created: false })
  assert.deepEqual([...f.records], snapshot)
  f.records.get('apps/app-a/users/joining').created.at = {
    seconds: 1700000001,
    nanoseconds: 123,
  }
  const later = await f.publish(input)
  assert.equal(later.created, true)
  assert.equal(later.eventId, 'user-joined-joining-1700000001-123')
})

test('missing App or membership fails before writes and another App cannot reuse membership', async () => {
  for (const missing of ['apps/app-a', 'apps/app-a/users/joining']) {
    const f = fixture()
    f.records.delete(missing)
    const before = [...f.records]
    await assert.rejects(f.publish(input), /does not exist|not a member/)
    assert.deepEqual([...f.records], before)
  }
  const f = fixture()
  f.records.set('apps/app-b', { name: 'App B' })
  await assert.rejects(f.publish({ ...input, appId: 'app-b' }), /not a member/)
  assert.ok(
    f.scopes.every((path) => path === 'apps' || path.startsWith('apps/app-b/'))
  )
})

test('notification failure commits neither the event nor any notification', async () => {
  const f = fixture({ failNotification: true })
  const before = [...f.records]
  await assert.rejects(f.publish(input), /Notification rejected/)
  assert.deepEqual([...f.records], before)
})

test('membership without a creation timestamp keeps the initial ID and server timestamp fallback', async () => {
  const f = fixture()
  f.records.get('apps/app-a/users/joining').created = {}
  const result = await f.publish(input)
  assert.equal(result.eventId, 'user-joined-joining-initial')
  assert.equal(
    f.records.get(`apps/app-a/events/${result.eventId}`).occurred_at,
    f.serverStamp
  )
})
