import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { APP_ROLES } from '../runtime/app/models/model.ts'
import { readAppDocument } from '../runtime/app/utils/readApp.ts'
import { ECOSYSTEM_STATUSES } from '../runtime/ecosystem/models/ecosystem.model.ts'

const now = { seconds: 1, nanoseconds: 0 }
function load(path, returned, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.dev', 'false')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${returned}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function fixture({
  global = false,
  split = false,
  interruptLocator = false,
} = {}) {
  const records = new Map()
  const identityRecords = split ? new Map() : records
  const identityDatabaseId = split ? 'fireux-identity' : 'fireux'
  identityRecords.set('users/operator', {})
  const writes = []
  const reconciliations = []
  const target = (collectionPath) => ({ collectionPath })
  const database = (records) => {
    const collection = (path) => ({ doc: (id) => doc(`${path}/${id}`) })
    const doc = (path) => {
      const ref = {
        get: async () => ({
          exists: records.has(path),
          data: () => records.get(path),
          get: (field) => records.get(path)?.[field],
          ref,
        }),
        collection: (name) => collection(`${path}/${name}`),
        set: async (value) => {
          const [owner, , subcollection] = path.split('/')
          assert.equal(subcollection, 'apps')
          if (owner === 'ecosystems' && interruptLocator) {
            interruptLocator = false
            throw new Error('Interrupted Ecosystem locator write')
          }
          reconciliations.push(owner === 'users' ? 'user' : 'ecosystem')
          records.set(path, value)
        },
      }
      return ref
    }
    return { doc, collection }
  }
  const server = {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    FieldValue: { serverTimestamp: () => now },
    getRuntimeIdentityFirestore: (id) => {
      assert.equal(id, identityDatabaseId)
      return database(identityRecords)
    },
    runGuardedServerTransaction: async ({ kind }, action) => {
      const recordsForTransaction =
        kind === 'identity' ? identityRecords : records
      return action({
        read: async (owner, id) => ({
          exists: recordsForTransaction.has(`${owner.collectionPath}/${id}`),
          data: recordsForTransaction.get(`${owner.collectionPath}/${id}`),
        }),
        create: (owner, id, fields) => {
          const path = `${owner.collectionPath}/${id}`
          writes.push({ path, fields })
          recordsForTransaction.set(path, fields)
        },
        update: () => {
          throw new Error('Unexpected overwrite')
        },
      })
    },
  }
  const provisionEcosystem = load(
    '../runtime/ecosystem/server/identity/provision.ts',
    'provisionEcosystem',
    {
      ...server,
      canonicalEcosystem: load(
        '../runtime/ecosystem/server/identity/read.ts',
        'canonicalEcosystem',
        { ECOSYSTEM_STATUSES, createError: server.createError }
      ),
      requireFirestoreDocumentId: (value) => value,
      ECOSYSTEM_MUTATION_TARGETS: { ecosystems: target('ecosystems') },
    }
  )
  const transaction = load(
    '../runtime/app/server/initialization/initialize-transaction.ts',
    '({ assertExistingAppMatchesRuntime, initializeAppWithAdministrator })',
    {
      createError: server.createError,
      FieldValue: server.FieldValue,
      runGuardedServerTransaction: server.runGuardedServerTransaction,
      APP_MUTATION_TARGETS: { runtimeApps: target('apps') },
      USER_MUTATION_TARGETS: { runtimeUsers: target('users') },
      serverAppUsersTarget: (id) => target(`apps/${id}/users`),
      countTransactionAdmins: async () => 0,
      initialMembership: () => ({ role: 'admin' }),
      isAdminMembership: (value) => value?.role === 'admin',
      requireCanonicalMembership: () => {},
      stamp: () => ({ by: 'operator' }),
    }
  )
  const databases = {
    getRuntimeFirestore: () => database(records),
    getRuntimeIdentityFirestore: server.getRuntimeIdentityFirestore,
  }
  const initializeRuntimeApp = load(
    '../runtime/app/server/initialization/initialize.ts',
    '({ initializeRuntimeApp, requireInitializationUser })',
    {
      initializeAppWithAdministrator:
        transaction.initializeAppWithAdministrator,
      createError: server.createError,
      getRuntimeIdentityFirestore: server.getRuntimeIdentityFirestore,
      reconcileUserAppReference: load(
        '../runtime/app/server/membership/user-reference.ts',
        'reconcileUserAppReference',
        { ...databases, FieldValue: server.FieldValue }
      ),
      reconcileAppEcosystemReference: load(
        '../runtime/app/server/relationships/ecosystem-reference.ts',
        'reconcileAppEcosystemReference',
        {
          ...databases,
          FieldValue: server.FieldValue,
          createError: server.createError,
        }
      ),
    }
  )
  const run = load(
    '../runtime/server/api/internal/app/initialize.post.ts',
    'handler',
    {
      ...initializeRuntimeApp,
      assertExistingAppMatchesRuntime:
        transaction.assertExistingAppMatchesRuntime,
      createError: server.createError,
      defineEventHandler: (handler) => handler,
      requireDevDeveloper: async ({ uid }) => ({ uid }),
      useFireUXConfig: ({ config }) => config,
      useRuntimeConfig: (input) => ({
        fireux: { initialAppContext: input.context },
        public: {
          firebaseEcosystem: {
            ...input.ecosystem,
            firebase: {
              databaseId: input.appDatabaseId,
              identityDatabaseId: input.identityDatabaseId,
            },
          },
        },
      }),
      getRuntimeFirestore: databases.getRuntimeFirestore,
      provisionEcosystem,
    }
  )
  const input = {
    uid: 'operator',
    config: {
      appId: global ? 'example-app' : 'example',
      ecosystemId: global ? 'example' : 'fireux',
      projectId: global ? 'example' : 'fireux',
      role: global ? 'global' : 'tenant',
      appName: 'Example',
      appShortName: 'Example',
    },
    appDatabaseId: 'fireux',
    identityDatabaseId,
    ecosystem: { name: 'Example Ecosystem', description: 'Reviewed purpose' },
    context: '  Reviewed App background  ',
  }
  return {
    run,
    initialize: initializeRuntimeApp.initializeRuntimeApp,
    input,
    records,
    identityRecords,
    writes,
    reconciliations,
  }
}
test('configured App creation persists reviewed context; reinitialization preserves operator edits', async () => {
  const f = fixture()
  f.identityRecords.set('ecosystems/fireux', { name: 'FireUX' })
  assert.equal((await f.run(f.input)).appCreated, true)
  assert.equal(f.records.get('apps/example').context, 'Reviewed App background')
  f.records.get('apps/example').context = 'Operator revision'
  assert.equal((await f.run(f.input)).appCreated, false)
  assert.equal(f.records.get('apps/example').context, 'Operator revision')
  assert.equal(f.writes.length, 2)
})
test('configured creation rejects structured or oversized context before writing', async () => {
  const f = fixture({ global: true })
  for (const context of [{ notes: 'x' }, 'x'.repeat(32001)])
    await assert.rejects(f.run({ ...f.input, context }), /must be text/)
  assert.equal(f.writes.length, 0)
})
test('generic App initialization requires an existing Ecosystem even for a Main App', async () => {
  const f = fixture({ global: true })
  await assert.rejects(f.initialize(f.input), {
    statusCode: 409,
    message: 'The App references missing Ecosystem example.',
  })
  assert.deepEqual(f.writes, [])
})
test('retry repairs an interrupted Ecosystem locator without rewriting the App or administrator', async () => {
  const f = fixture({ split: true, interruptLocator: true })
  f.identityRecords.set('ecosystems/fireux', { name: 'FireUX' })
  const appPath = 'apps/example'
  const membershipPath = 'apps/example/users/operator'
  const userLocator = 'users/operator/apps/example'
  const ecosystemLocator = 'ecosystems/fireux/apps/example'

  await assert.rejects(f.run(f.input), /Interrupted Ecosystem locator write/)
  const app = f.records.get(appPath)
  const membership = f.records.get(membershipPath)
  assert.ok(app)
  assert.equal(membership.role, 'admin')
  assert.equal(f.identityRecords.get(userLocator).database_id, 'fireux')
  assert.equal(f.identityRecords.has(ecosystemLocator), false)

  const result = await f.run(f.input)
  assert.equal(result.appCreated, false)
  assert.equal(result.membershipCreated, false)
  assert.equal(result.membershipUpdated, false)
  assert.equal(f.records.get(appPath), app)
  assert.equal(f.records.get(membershipPath), membership)
  assert.equal(f.identityRecords.get(ecosystemLocator).database_id, 'fireux')
  assert.deepEqual(f.reconciliations, ['user', 'ecosystem'])
  assert.equal(f.writes.length, 2)
})
test('configured App creation with blank context produces a readable App without empty defaults', async () => {
  const f = fixture()
  f.identityRecords.set('ecosystems/fireux', { name: 'FireUX' })
  await f.run({ ...f.input, context: '  ' })

  const stored = f.records.get('apps/example')
  assert.deepEqual(stored, {
    ecosystem_id: 'fireux',
    role: 'tenant',
    status: 'active',
    name: 'Example',
    short_name: 'Example',
    created: { at: now, by: 'operator' },
    updated: { at: now, by: 'operator' },
  })
  assert.deepEqual(readAppDocument(stored, 'example'), {
    ...stored,
    id: 'example',
  })
})
test('a Project-free App initializes under an existing Ecosystem', async () => {
  const f = fixture({ global: true })
  f.input.config.projectId = undefined
  f.records.set('ecosystems/example', { project_id: 'owner-project' })

  const created = await f.run(f.input)
  assert.equal(created.appCreated, true)
  assert.equal(created.ecosystemCreated, false)
  assert.equal(f.records.get('apps/example-app').ecosystem_id, 'example')
  assert.deepEqual(f.records.get('ecosystems/example'), {
    project_id: 'owner-project',
  })
  assert.equal((await f.run(f.input)).appCreated, false)
  assert.deepEqual(
    f.writes.map(({ path }) => path),
    ['apps/example-app', 'apps/example-app/users/operator']
  )
})
test('a Project-free App cannot create records for a missing Ecosystem', async () => {
  const f = fixture({ global: true })
  f.input.config.projectId = undefined
  await assert.rejects(f.run(f.input), /missing Ecosystem example/)
  assert.equal(f.writes.length, 0)
})
for (const role of ['tenant', 'standalone']) {
  for (const projectId of [undefined, 'owner-project']) {
    test(`${role} App ${projectId ? 'with' : 'without'} a Project requires an Ecosystem in the identity database`, async () => {
      const f = fixture({ split: true })
      Object.assign(f.input.config, { role, projectId })
      const ecosystemPath = 'ecosystems/fireux'
      f.records.set(ecosystemPath, { name: 'Wrong database' })

      await assert.rejects(f.run(f.input), {
        statusCode: 409,
        message: 'The App references missing Ecosystem fireux.',
      })
      assert.deepEqual(f.writes, [])
      assert.deepEqual(f.reconciliations, [])

      f.identityRecords.set(ecosystemPath, { name: 'Canonical Ecosystem' })
      const result = await f.run(f.input)
      assert.equal(result.appCreated, true)
      assert.equal(result.membershipCreated, true)
      assert.equal(result.ecosystemCreated, false)
      assert.deepEqual(
        f.writes.map(({ path }) => path),
        ['apps/example', 'apps/example/users/operator']
      )
      assert.deepEqual(f.reconciliations, ['user', 'ecosystem'])
    })
  }
}
test('Core normalizes ordinary runtime App identity without Project config', () => {
  const fireux = {
    id: 'fixture',
    name: 'Fixture',
    shortName: 'Fixture',
    role: 'tenant',
    ecosystem: 'misebox',
    ecosystemId: 'misebox',
  }
  const read = load(
    '../runtime/app/composables/config/FireUXConfig.ts',
    'useFireUXConfig',
    { APP_ROLES, useRuntimeConfig: () => ({ public: { fireux } }) }
  )
  assert.equal(read().appId, 'fixture')
  assert.equal(read().ecosystemId, 'misebox')
  assert.equal(read().projectId, undefined)
  fireux.projectId = ' portal-project '
  assert.equal(read().projectId, 'portal-project')
})

test('global main App initialization creates the canonical Ecosystem and preserves later edits', async () => {
  const f = fixture({ global: true, split: true })
  const first = await f.run(f.input)
  assert.equal(first.appCreated, true)
  assert.equal(first.ecosystemCreated, true)
  assert.equal(first.membershipCreated, true)
  assert.deepEqual(f.identityRecords.get('ecosystems/example'), {
    project_id: 'example',
    status: 'active',
    name: 'Example Ecosystem',
    description: 'Reviewed purpose',
    image_url: '',
    created: { at: now, by: 'operator' },
    updated: { at: now, by: 'operator' },
  })

  f.identityRecords.get('ecosystems/example').name = 'Operator edit'
  f.records.get('apps/example-app').context = 'Revised App context'
  const second = await f.run(f.input)
  assert.equal(second.appCreated, false)
  assert.equal(second.ecosystemCreated, false)
  assert.equal(second.membershipCreated, false)
  assert.equal(second.membershipUpdated, false)
  assert.equal(
    f.identityRecords.get('ecosystems/example').name,
    'Operator edit'
  )
  assert.equal(f.records.get('apps/example-app').context, 'Revised App context')
  assert.equal(f.writes.length, 3)
})
test('Ecosystem bootstrap is limited to matching main Apps and rejects Project conflicts before App writes', async () => {
  const otherGlobal = fixture({ global: true })
  otherGlobal.input.config.appId = 'other-global'
  await assert.rejects(otherGlobal.run(otherGlobal.input), /missing Ecosystem/)
  assert.deepEqual(otherGlobal.writes, [])

  const conflict = fixture({ global: true })
  conflict.records.set('ecosystems/example', {
    project_id: 'another-project',
    status: 'active',
    name: 'Existing Ecosystem',
    created: { at: now },
    updated: { at: now },
  })
  await assert.rejects(
    conflict.run(conflict.input),
    /does not match runtime projectId/
  )
  assert.equal(conflict.writes.length, 0)
})
test('A failed App setup precheck blocks Ecosystem creation', async () => {
  const f = fixture({ global: true })
  f.records.set('apps/example-app/users/operator', { role: 'admin' })
  await assert.rejects(f.run(f.input), /without its canonical App record/)
  assert.equal(f.records.has('ecosystems/example'), false)
  assert.equal(f.writes.length, 0)
})
test('App context seed uses the private runtime branch', () => {
  const { setRuntime } = load('../config/app/runtime.ts', '({ setRuntime })')
  const nuxt = {}
  setRuntime(nuxt, {
    app: { id: 'example' },
    private: { initialAppContext: 'Internal background' },
  })
  assert.equal(
    nuxt.runtimeConfig.fireux.initialAppContext,
    'Internal background'
  )
  assert.equal(
    JSON.stringify(nuxt.runtimeConfig.public).includes('Internal background'),
    false
  )
})
