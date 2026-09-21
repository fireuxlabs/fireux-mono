import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref } from 'vue'

function load(path, bindings, result) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (path.endsWith('.vue'))
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}
const isGuestProject = load(
  '../runtime/project/utils/guest-project.ts',
  {},
  'isGuestProject'
)
const createError = ({ statusCode, statusMessage }) =>
  Object.assign(new Error(statusMessage), { statusCode })
const owned = (uid = 'guest', appId = 'app') => ({
  name: 'Existing work',
  guest_owner_uid: uid,
  created: { by: uid, app_id: appId },
})

function harness({ root, appExists = true, canCreate = true } = {}) {
  const records = new Map(root ? [['guest', root]] : [])
  const writes = []
  let tail = Promise.resolve()
  const createProject = load(
    '../../../../../projects/fireux/fireux-app/server/project/index/create.ts',
    {
      createError,
      isGuestProject,
      useFireUXConfig: () => ({
        appId: 'app',
        role: 'global',
        workspaceConfig: {},
      }),
      requireFirebaseBearerUser: async (_event, _message, options) => {
        assert.equal(options.allowAnonymous, true)
        return {
          uid: 'guest',
          decoded: { firebase: { sign_in_provider: 'anonymous' } },
        }
      },
      requireFirestoreDocumentId: (value) => value,
      resolveWorkspaceCanCreate: () => canCreate,
      serverAuditStamp: ({ by, appId }) => ({
        by,
        ...(appId ? { app_id: appId } : {}),
        at: 123,
      }),
      FIRESTORE_MUTATION_TARGETS: {
        fireuxApps: 'apps',
        fireuxProjects: 'projects',
      },
      // Serialize commits as Firestore does for competing transactions on this root.
      runGuardedServerTransaction: (database, run) => {
        assert.deepEqual(database, { kind: 'named', databaseId: 'fireux' })
        const operation = tail.then(async () => {
          const staged = []
          const response = await run({
            read: async (target, id) => {
              assert.equal(staged.length, 0, 'read before write')
              if (target === 'apps') return { exists: appExists, data: {} }
              assert.equal(target, 'projects')
              assert.equal(id, 'guest')
              return { exists: records.has(id), data: records.get(id) }
            },
            create: (target, id, data) => {
              assert.equal(
                target,
                'projects',
                'guest creation must not fabricate membership or Team'
              )
              assert.equal(records.has(id), false)
              staged.push({ id, data })
            },
          })
          for (const item of staged) {
            records.set(item.id, item.data)
            writes.push(item)
          }
          return response
        })
        tail = operation.catch(() => {})
        return operation
      },
      getFirestoreDb: () => {
        throw new Error('Guest must not enter account creation')
      },
    },
    'createProject'
  )
  return {
    records,
    writes,
    run: (input = { name: 'First idea' }) => createProject({}, input),
  }
}

test('anonymous creation persists one minimal Project and concurrent retries resume without overwriting', async () => {
  const h = harness()
  const results = await Promise.all([
    h.run(),
    h.run({ name: 'Different name' }),
    h.run(),
  ])
  assert.deepEqual(
    results.map((result) => result.action),
    ['create', 'resume', 'resume']
  )
  assert.ok(results.every((result) => result.project_id === 'guest'))
  assert.equal(h.writes.length, 1)
  assert.equal(h.records.size, 1)
  assert.equal(h.records.get('guest').name, 'First idea')
  assert.equal(h.records.get('guest').status, 'inactive')
  assert.equal(isGuestProject(h.records.get('guest'), 'guest', 'app'), true)
})

test('a fresh request resumes stored guest work without any write', async () => {
  const h = harness({ root: owned() })
  assert.equal((await h.run()).action, 'resume')
  assert.equal(h.writes.length, 0)
  assert.equal(h.records.get('guest').name, 'Existing work')
})

test('existing account records, other creators and other Apps cannot be claimed or overwritten', async () => {
  for (const root of [
    { name: 'Account Project', created: { by: 'guest', app_id: 'app' } },
    owned('other'),
    owned('guest', 'other-app'),
    { ...owned(), created: { by: 'other', app_id: 'app' } },
  ]) {
    const h = harness({ root })
    await assert.rejects(h.run(), { statusCode: 409 })
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.records.get('guest'), root)
  }
})

test('guest creation retains App availability, configuration and bounded-input checks', async () => {
  for (const options of [{ appExists: false }, { canCreate: false }]) {
    const h = harness(options)
    await assert.rejects(h.run(), { statusCode: 403 })
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  for (const input of [
    {},
    { name: 'x'.repeat(121) },
    { name: 'Valid', project_id: 'other' },
  ]) {
    await assert.rejects(h.run(input), { statusCode: 400 })
  }
  assert.equal(h.writes.length, 0)
})

test('guest Home resumes from live persisted state and hides stale roots on identity changes', () => {
  const currentUser = ref({ uid: 'guest', isAnonymous: true })
  const source = { data: ref(null), outcome: ref('pending'), error: ref(null) }
  let boundId
  const state = load(
    '../runtime/project/components/Workspace/Home/Guest.vue',
    {
      computed,
      isGuestProject,
      useAuth: () => ({ currentUser }),
      useFireUXConfig: () => ({
        appId: 'app',
        role: 'global',
        workspaceConfig: {},
      }),
      resolveWorkspaceCanCreate: () => true,
      useProjectRead: (id) => {
        boundId = id
        return source
      },
    },
    '({ pending, error, project, canCreate })'
  )
  assert.equal(boundId.value, 'guest')
  assert.equal(state.pending.value, true)
  source.outcome.value = 'missing'
  assert.equal(state.pending.value, false)
  assert.equal(state.project.value, null)
  source.data.value = { id: 'guest', ...owned() }
  source.outcome.value = 'ready'
  assert.equal(state.project.value.name, 'Existing work')
  source.error.value = new Error('offline')
  assert.equal(state.project.value, null)
  assert.ok(state.error.value)
  source.error.value = null
  currentUser.value = { uid: 'other', isAnonymous: true }
  assert.equal(boundId.value, 'other')
  assert.equal(state.project.value, null)
  currentUser.value = { uid: 'account', isAnonymous: false }
  assert.equal(boundId.value, null)
  assert.equal(state.project.value, null)
})
