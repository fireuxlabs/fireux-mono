import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const root = new URL('../../../../../', import.meta.url)
function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const contract = load(
  'packages/core/fireux-core/src/runtime/server/utils/records/context.ts',
  '({ readContextRequest, contextChange })',
  { createError }
)
const readRecordString = (source, key) =>
  typeof source[key] === 'string' ? source[key].trim() : ''
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw new Error('Invalid id')
  return value
}

test('text contract rejects structures, unsupported fields and stale writes', () => {
  for (const context of [{ notes: 'x' }, [], 'x'.repeat(32001)])
    assert.throws(
      () => contract.readContextRequest({ context, previous: '' }, [], true),
      /must be text/
    )
  assert.throws(
    () =>
      contract.readContextRequest(
        { context: '', previous: '', prices: [] },
        [],
        true
      ),
    /Unsupported/
  )
  assert.throws(
    () => contract.contextChange({ context: 'new', previous: '' }, 'changed'),
    /changed elsewhere/
  )
  assert.equal(
    contract.contextChange({ context: '  background  ', previous: '' }, ''),
    'background'
  )
})

for (const [entity, packageName] of [
  ['property', 'fireux-properties'],
  ['portfolio', 'fireux-properties'],
  ['supplier', 'fireux-suppliers'],
]) {
  test(`${entity}: authority precedes reads/writes, conflict retains stored text, and only context/stamp changes`, async () => {
    const cap = entity[0].toUpperCase() + entity.slice(1)
    const target = {
      collectionPath: entity === 'property' ? 'properties' : `${entity}s`,
    }
    let allowed = true
    const stored = {
      context: '',
      identity: { name: 'Original' },
      prices: [13, 15],
    }
    const writes = []
    const command = load(
      `packages/extensions/${packageName}/src/runtime/${entity}/server/context.ts`,
      `${entity}Context`,
      {
        ...contract,
        readRecordString,
        requireFirestoreDocumentId,
        [`read${cap}MutationActor`]: async () => ({ uid: 'operator' }),
        [`require${cap}MutationAuthority`]: async () => {
          if (!allowed) throw new Error('Revoked membership')
          return { rootData: stored }
        },
        runGuardedServerTransaction: async (_, action) =>
          action({
            update: (owner, id, patch) => {
              writes.push({ owner, id, patch })
              Object.assign(stored, patch)
            },
          }),
        FIRESTORE_MUTATION_TARGETS: {
          [entity === 'property' ? 'properties' : `${entity}s`]: target,
        },
        serverAuditStamp: () => ({ by: 'operator' }),
      }
    )
    const scope = { [`${entity}Id`]: 'one' }
    assert.deepEqual(await command({}, scope), { context: '' })
    await command(
      {},
      { ...scope, context: '  Background  ', previous: '' },
      true
    )
    assert.deepEqual(writes, [
      {
        owner: target,
        id: 'one',
        patch: { context: 'Background', updated: { by: 'operator' } },
      },
    ])
    assert.deepEqual(stored.identity, { name: 'Original' })
    assert.deepEqual(stored.prices, [13, 15])
    await assert.rejects(
      command({}, { ...scope, context: 'stale', previous: '' }, true),
      /changed elsewhere/
    )
    allowed = false
    await assert.rejects(command({}, scope), /Revoked/)
    await assert.rejects(
      command({}, { ...scope, context: '', previous: 'Background' }, true),
      /Revoked/
    )
    assert.equal(writes.length, 1)
  })
}

test('App context is confined to configured App and transactional admin authority', async () => {
  let role = 'user'
  const writes = []
  const command = load(
    'packages/core/fireux-core/src/runtime/app/server/context.ts',
    'appContext',
    {
      ...contract,
      createError,
      readRecordString,
      useFireUXConfig: () => ({ appId: 'local' }),
      requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
      FIRESTORE_MUTATION_TARGETS: {
        runtimeApps: { database: 'runtime', collectionPath: 'apps' },
      },
      serverAppUsersTarget: () => ({ collectionPath: 'members' }),
      serverAuditStamp: () => ({ by: 'actor' }),
      runGuardedServerTransaction: async (_, action) =>
        action({
          read: async (target) =>
            target.collectionPath === 'apps'
              ? { exists: true, data: { context: '' } }
              : { exists: true, data: { role } },
          update: (...args) => writes.push(args),
        }),
    }
  )
  await assert.rejects(command({}, { appId: 'remote' }), /current App/)
  await assert.rejects(command({}, { appId: 'local' }), /admin/)
  role = 'admin'
  assert.deepEqual(
    await command(
      {},
      { appId: 'local', context: 'App background', previous: '' },
      true
    ),
    { context: 'App background' }
  )
  assert.deepEqual(Object.keys(writes[0][2]).sort(), ['context', 'updated'])
})

test('Project context rechecks membership inside the transaction before reading or saving background', async () => {
  let allowed = false
  const writes = []
  const target = { database: 'fireux', collectionPath: 'projects' }
  const command = load(
    'packages/ecosystem/fireux-fireux/src/runtime/project/server/context.ts',
    'projectContext',
    {
      ...contract,
      readRecordString,
      requireProjectOperator: async () => ({
        uid: 'operator',
        projectId: 'one',
        appId: 'fireux',
      }),
      requireProjectOperatorInTransaction: async () => {
        if (!allowed) throw new Error('Membership revoked')
      },
      fireuxProjectsTarget: target,
      serverAuditStamp: () => ({ by: 'operator' }),
      runGuardedServerTransaction: async (_, action) =>
        action({
          read: async () => ({ exists: true, data: { context: 'Saved' } }),
          update: (...args) => writes.push(args),
        }),
    }
  )
  await assert.rejects(command({}, { projectId: 'one' }), /revoked/)
  assert.equal(writes.length, 0)
  allowed = true
  assert.deepEqual(await command({}, { projectId: 'one' }), {
    context: 'Saved',
  })
  await command(
    {},
    { projectId: 'one', context: 'Reviewed', previous: 'Saved' },
    true
  )
  assert.deepEqual(writes[0], [
    target,
    'one',
    { context: 'Reviewed', updated: { by: 'operator' } },
  ])
})

test('public Project and App projections omit stored context', () => {
  const projectReaders = load(
    'packages/ecosystem/fireux-fireux/src/runtime/project/utils/readProject.ts',
    '({ readProjectDocument, readProjectPublicSummary })',
    {
      isFirestoreDocumentId: (value) =>
        typeof value === 'string' && !!value && !value.includes('/'),
    }
  )
  const stamp = { at: { seconds: 1, nanoseconds: 0 } }
  const source = {
    identity: {
      status: 'active',
      name: 'Project',
      description: '',
      image_url: '',
    },
    created: stamp,
    updated: stamp,
    context: 'Private background',
  }
  assert.equal(
    projectReaders.readProjectDocument(source, 'one').context,
    'Private background'
  )
  assert.deepEqual(
    Object.keys(projectReaders.readProjectPublicSummary(source, 'one')).sort(),
    ['id', 'identity']
  )
  assert.equal(
    projectReaders.readProjectDocument({ ...source, context: {} }, 'one'),
    null
  )
  const readApp = load(
    'packages/core/fireux-core/src/runtime/app/utils/readApp.ts',
    'readAppDocument',
    {}
  )
  const app = readApp(
    {
      ecosystem_id: 'fireux',
      role: 'global',
      status: 'active',
      name: 'App',
      created: stamp,
      updated: stamp,
      context: 'Private App background',
    },
    'app'
  )
  assert.equal(Object.hasOwn(app, 'context'), false)
})

test('User editing writes only the authenticated private context and detects conflicts', async () => {
  let body = { context: 'Personal background', previous: '' }
  let saved = ''
  const writes = []
  const handler = load('packages/core/fireux-core/src/runtime/server/api/internal/user/context.patch.ts', 'handler', {
    contextChange: contract.contextChange, createError,
    FieldValue: { serverTimestamp: () => 'now' },
    defineEventHandler: value => value,
    readBody: async () => body,
    requireFirebaseBearerUser: async () => ({ uid: 'self' }),
    USER_CONTEXT_MAX_LENGTH: 8000,
    UserContextStorage: { document: 'context' },
    FIRESTORE_MUTATION_TARGETS: { users: { collectionPath: 'users' } },
    serverUserContextTarget: uid => ({ database: 'identity', collectionPath: `users/${uid}/private` }),
    runGuardedServerTransaction: async (_, action) => action({
      read: async target => target.collectionPath === 'users' ? { exists: true } : { exists: true, data: { context: saved } },
      update: (target, id, patch) => { writes.push({ target, id, patch }); saved = patch.context },
    }),
  })
  await handler({})
  assert.equal(writes[0].target.collectionPath, 'users/self/private')
  assert.equal(writes[0].id, 'context')
  assert.deepEqual(Object.keys(writes[0].patch).sort(), ['context', 'updated'])
  await assert.rejects(handler({}), /changed elsewhere/)
  body = { context: 'Other account', userId: 'other' }
  await assert.rejects(handler({}), /Only User context/)
  assert.equal(writes.length, 1)
})
