import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  createError,
  createEvent,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { resolveAppUserAccess } from '../../../../core/fireux-core/src/runtime/app/utils/membership/access.ts'
import { requireFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/server/utils/ids/path.ts'
import { normalizeUser } from '../../../../core/fireux-core/src/runtime/user/utils/normalize-user.ts'
import {
  captureLiveProjection,
  defineLiveProjection,
} from '../../../../core/fireux-core/src/runtime/server/utils/live-projection.ts'
import { LiveProjectionSourcePool } from '../../../../core/fireux-core/src/runtime/server/utils/live-projection-sources.ts'
import { subscribeLiveProjection } from '../../../../core/fireux-core/src/runtime/server/utils/live-projection-subscription.ts'

function load(path, name, bindings) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export default /gm, 'const result = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}
const { readMembershipAccessIds } = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership/membership-access.ts',
  '({readMembershipAccessIds})',
  {}
)
const enrichTeamMembers = load(
  '../../../fireux-workspace/src/runtime/workspace/server/team/members.ts',
  'enrichTeamMembers',
  { createError, requireFirestoreDocumentId, normalizeUser }
)
const stamp = { seconds: 100, nanoseconds: 5 }
const authorityPaths = [
  'apps/fireux-app',
  'apps/fireux-app/users/actor',
  'project_access/fireux-app/users/actor',
  'projects/project-one',
]

function database(entries) {
  const values = new Map(entries),
    references = new Map(),
    reads = []
  const db = {
    values,
    references,
    reads,
    collection: (path) => collection(path),
    getAll: async (...refs) => {
      reads.push({ batch: refs.map((ref) => ref.path) })
      return refs.map(snapshot)
    },
  }
  const snapshot = (ref) => ({
    id: ref.path.split('/').at(-1),
    exists: values.has(ref.path),
    data: () => values.get(ref.path),
  })
  function source(path, limit) {
    const key = limit ? `${path}?limit=${limit}` : path
    if (references.has(key)) return references.get(key)
    const observers = new Set()
    const ref = {
      path,
      limitCount: limit,
      firestore: db,
      isEqual: (other) =>
        other.firestore === db &&
        other.path === path &&
        other.limitCount === limit,
      get: async () => {
        reads.push({ path, ...(limit ? { limit } : {}) })
        return limit
          ? {
              docs: [...values.keys()]
                .filter(
                  (key) =>
                    key.startsWith(`${path}/`) &&
                    key.split('/').length === path.split('/').length + 1
                )
                .sort()
                .slice(0, limit)
                .map((key) => snapshot(source(key))),
            }
          : snapshot(ref)
      },
      onSnapshot(next) {
        observers.add(next)
        queueMicrotask(() => {
          if (observers.has(next)) next({})
        })
        return () => observers.delete(next)
      },
      emit: () => {
        for (const next of [...observers]) next({})
      },
      get active() {
        return observers.size
      },
      ...(limit
        ? {
            where() {
              throw new Error('The Team query must remain unchanged')
            },
          }
        : { collection: (child) => collection(`${path}/${child}`) }),
    }
    references.set(key, ref)
    return ref
  }
  function collection(path) {
    return {
      doc: (id) => source(`${path}/${id}`),
      limit: (count) => source(path, count),
    }
  }
  return db
}

function fixture() {
  const db = database([
    [authorityPaths[0], { private: 'APP_SECRET' }],
    [
      authorityPaths[1],
      { role: 'user', subscription: 'free', created: { at: stamp } },
    ],
    [authorityPaths[2], { ids: ['project-one'], membership_created_at: stamp }],
    [
      authorityPaths[3],
      { identity: { name: 'Project One' }, private: 'PROJECT_SECRET' },
    ],
    [
      'projects/project-one/team/local',
      { name: 'Zulu', user_id: '', role_ids: [], private: 'TEAM_SECRET' },
    ],
    [
      'projects/project-one/team/linked',
      { name: 'Stored Name', user_id: ' user-one ', role_ids: ['dev'] },
    ],
  ])
  const identityDb = database([
    [
      'users/user-one',
      { display_name: 'Alpha', handle: 'alpha', private: 'USER_SECRET' },
    ],
  ])
  const requireProjectOperator = load(
    '../runtime/project/server/authority.ts',
    'requireProjectOperator',
    {
      requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
      useFireUXConfig: () => ({ appId: 'fireux-app' }),
      requireFirestoreDocumentId,
      getRuntimeFirestore: (id) => {
        assert.equal(id, 'fireux')
        return db
      },
      serverProjectAccessTarget: (id) => ({
        collectionPath: `project_access/${id}/users`,
      }),
      readMembershipAccessIds,
      resolveAppUserAccess,
      createError,
    }
  )
  const readProjectTeam = load(
    '../runtime/project/server/team/read.ts',
    'readProjectTeam',
    {
      requireProjectOperator,
      enrichTeamMembers,
      getRuntimeIdentityFirestore: () => identityDb,
    }
  )
  const handler = load(
    '../../../../../projects/fireux/fireux-app/server/api/internal/control/projects/[projectId]/team.get.ts',
    'result',
    {
      defineLiveProjection,
      readProjectTeam,
      getRouterParam,
      setResponseHeaders,
    }
  )
  const url = '/api/internal/control/projects/project-one/team'
  const responses = [],
    headers = new Map()
  async function dispatch() {
    const event = createEvent(
      { method: 'GET', url, headers: {} },
      {
        setHeader: (key, value) => headers.set(key.toLowerCase(), value),
        getHeader: (key) => headers.get(key.toLowerCase()),
      }
    )
    event.context.params = { projectId: 'project-one' }
    const value = await handler(event)
    responses.push(value)
    return value
  }
  return { db, identityDb, dispatch, url, responses, headers }
}

async function until(predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  assert.fail('Project Team projection did not reach the expected state')
}

test('the actual App GET preserves its safe DTO, exact authority and bounded native query', async () => {
  const h = fixture()
  const projection = await captureLiveProjection(h.url, h.dispatch)
  assert.equal(projection.access, 'protected')
  assert.equal(h.headers.get('cache-control'), 'no-store')
  assert.equal(h.headers.get('x-fireux-live'), 'protected')
  assert.deepEqual(
    projection.initial.sources
      .filter((source) => source.authority)
      .map(({ source }) => source.path),
    authorityPaths
  )
  const query = projection.initial.sources.find(
    ({ source }) => source.limitCount
  )
  assert.equal(query.source.path, 'projects/project-one/team')
  assert.equal(query.source.limitCount, 200)
  assert.equal(query.authority, false)
  assert.equal(
    projection.initial.sources.filter(({ source }) => source.limitCount).length,
    1
  )
  assert.deepEqual(h.db.reads, [
    ...authorityPaths.map((path) => ({ path })),
    { path: 'projects/project-one/team', limit: 200 },
  ])
  assert.deepEqual(h.identityDb.reads, [{ batch: ['users/user-one'] }])
  assert.deepEqual(h.responses[0], {
    ok: true,
    project_id: 'project-one',
    members: [
      {
        id: 'linked',
        name: 'Alpha',
        avatar: '/img/ecosystem/avatar.png',
        userId: 'user-one',
        linked: true,
        roleIds: ['dev'],
      },
      {
        id: 'local',
        name: 'Zulu',
        avatar: '',
        userId: '',
        linked: false,
        roleIds: [],
      },
    ],
  })
  assert.doesNotMatch(
    JSON.stringify(h.responses),
    /SECRET|membership_created_at|subscription/
  )
})

test('the Project source declarations drive roster changes and retain only exact authority after revocation', async (t) => {
  const h = fixture()
  const projection = await captureLiveProjection(h.url, h.dispatch)
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'project-team',
    projection,
    version: projection.initial.version,
    pool,
    send: (event) => events.push(event),
  })
  t.after(() => subscription.stop())
  await subscription.ready
  const query = h.db.references.get('projects/project-one/team?limit=200')
  assert.equal(query.active, 1)
  h.db.values.get('projects/project-one/team/local').name = 'Remote change'
  query.emit()
  await until(() => events.some((event) => event.type === 'change'))
  assert.equal(
    h.responses.at(-1).members.find((row) => row.id === 'local').name,
    'Remote change'
  )
  h.db.values.delete(authorityPaths[1])
  h.db.references.get(authorityPaths[1]).emit()
  await until(() => events.some((event) => event.statusCode === 403))
  assert.equal(query.active, 0)
  assert.equal(pool.size, 4)
  assert.ok(
    authorityPaths.every((path) => h.db.references.get(path).active === 1)
  )
  h.db.values.set(authorityPaths[1], {
    role: 'admin',
    subscription: 'free',
    created: { at: { ...stamp, seconds: 101 } },
  })
  h.db.references.get(authorityPaths[1]).emit()
  await new Promise((resolve) => setTimeout(resolve, 40))
  assert.equal(
    query.active,
    0,
    'rejoining and Admin role do not revive the old Project grant'
  )
  h.db.values.get(authorityPaths[2]).membership_created_at = {
    ...stamp,
    seconds: 101,
  }
  h.db.references.get(authorityPaths[2]).emit()
  await until(
    () => events.filter((event) => event.type === 'ready').length === 2
  )
  assert.equal(query.active, 1)
  subscription.stop()
  assert.equal(pool.size, 0)
  assert.ok([...h.db.references.values()].every((ref) => ref.active === 0))
})

test('Project Team declares exact linked Users in the identity database and observes missing identity recovery', async (t) => {
  const h = fixture()
  h.db.values.set('projects/project-one/team/duplicate', {
    name: 'Duplicate stored name',
    user_id: 'user-one',
    role_ids: [],
  })
  h.db.values.set('projects/project-one/team/missing', {
    name: 'Missing stored name',
    user_id: 'user-missing',
    role_ids: [],
  })
  h.db.values.set('users/user-one', {
    display_name: 'Wrong database identity',
    handle: 'wrong-database',
  })
  const projection = await captureLiveProjection(h.url, h.dispatch)
  const identities = projection.initial.sources.filter(
    ({ source }) => source.firestore === h.identityDb
  )
  assert.deepEqual(identities.map(({ source }) => source.path).sort(), [
    'users/user-missing',
    'users/user-one',
  ])
  assert.ok(identities.every(({ authority }) => authority === false))
  assert.equal(projection.initial.sources.length, 7)
  assert.deepEqual(h.identityDb.reads, [
    { batch: ['users/user-one', 'users/user-missing'] },
  ])
  assert.equal(h.db.references.has('users/user-one'), false)
  const events = [],
    pool = new LiveProjectionSourcePool()
  const subscription = subscribeLiveProjection({
    id: 'project-team-identity',
    projection,
    version: projection.initial.version,
    pool,
    send: (event) => events.push(event),
  })
  t.after(() => subscription.stop())
  await subscription.ready
  const user = h.identityDb.references.get('users/user-one')
  const missing = h.identityDb.references.get('users/user-missing')
  assert.equal(user.active, 1, 'duplicate Team links share one native source')
  assert.equal(missing.active, 1, 'missing User documents remain watched')
  assert.equal(pool.size, 7)
  const member = (id) => h.responses.at(-1).members.find((row) => row.id === id)
  assert.equal(member('linked').name, 'Alpha')
  assert.equal(member('missing').linked, false)

  h.identityDb.values.get('users/user-one').display_name = 'Remote identity'
  user.emit()
  await until(() => member('linked').name === 'Remote identity')
  assert.equal(member('duplicate').name, 'Remote identity')
  assert.ok(events.some((event) => event.type === 'change'))

  h.identityDb.values.set('users/user-missing', {
    display_name: 'Recovered identity',
    handle: 'recovered',
  })
  missing.emit()
  await until(() => member('missing').linked)
  assert.equal(member('missing').name, 'Recovered identity')
  assert.equal(member('missing').userId, 'user-missing')

  h.identityDb.values.delete('users/user-one')
  user.emit()
  await until(() => !member('linked').linked)
  assert.equal(member('linked').name, 'Stored Name')
  assert.equal(member('duplicate').name, 'Duplicate stored name')
  assert.equal(user.active, 1)
  subscription.stop()
  assert.equal(pool.size, 0)
  assert.ok(
    [...h.identityDb.references.values()].every((ref) => ref.active === 0)
  )
})
