import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, reactive, unref, watch, onScopeDispose, effectScope } from 'vue'
const root = new URL('../../../../../', import.meta.url)
function load(path, dependencies, name) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const core = 'packages/core/fireux-core/src/runtime/'
const readMembershipAccessIds = load(
  core + 'app/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const requireWorkspaceEntityMemberRole = load(
  core + 'server/utils/workspace-entity/onboarding-authority.ts',
  { createError },
  'requireWorkspaceEntityMemberRole'
)
const hasProjectAppContext = load(
  'packages/ecosystem/fireux-fireux/src/runtime/project/utils/app-context-connection.ts',
  {},
  'hasProjectAppContext'
)
const useCommandScope = load(
  core + 'composables/fireux/commands/useCommandScope.ts',
  { watch, onScopeDispose },
  'useCommandScope'
)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400 })
  return value
}
function harness(role = 'user') {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = []
  const records = new Map([
    ['apps/fireux-app', {}],
    ['members/u', { role, created: { at } }],
    ['access/u', { ids: ['project', 'misebox'], membership_created_at: at }],
    ['projects/project', { name: 'Before' }],
    ['projects/misebox', { name: 'Misebox' }],
  ])
  let before = () => {}
  const update = load(
    'projects/fireux/fireux-app/server/project/identity/update.ts',
    {
      createError,
      requireFirebaseBearerUser: async () => ({ uid: 'u' }),
      requireFirestoreDocumentId,
      useFireUXConfig: () => ({ appId: 'fireux-app' }),
      hasProjectAppContext,
      fireuxAppUsersTarget: () => 'members',
      serverProjectAccessTarget: () => 'access',
      fireuxProjectsTarget: 'projects',
      FIRESTORE_MUTATION_TARGETS: {
        fireuxApps: 'apps',
        fireuxProjects: 'projects',
      },
      requireWorkspaceEntityMemberRole,
      readMembershipAccessIds,
      serverAuditStamp: (x) => x,
      runGuardedServerTransaction: async (target, callback) => {
        assert.deepEqual(target, { kind: 'named', databaseId: 'fireux' })
        before()
        return callback({
          read: async (target, id) => ({
            exists: records.has(`${target}/${id}`),
            data: records.get(`${target}/${id}`),
          }),
          update: (...args) => writes.push(args),
        })
      },
    },
    'updateProjectIdentity'
  )
  return {
    update,
    writes,
    records,
    before: (fn) => {
      before = fn
    },
  }
}
test('admin/user/dev identity writes use direct PATCH body and server stamp', async () => {
  for (const role of ['admin', 'user', 'dev']) {
    const h = harness(role)
    await h.update({}, 'project', {
      name: ' New  name ',
      description: ' Notes ',
      image_url: '',
    })
    assert.deepEqual(h.writes, [
      [
        'projects',
        'project',
        {
          name: 'New name',
          description: 'Notes',
          image_url: '',
          updated: { by: 'u' },
        },
      ],
    ])
  }
})
test('transaction rejects revoked membership/access and membership recreation', async () => {
  for (const mutate of [
    (h) => h.records.delete('apps/fireux-app'),
    (h) => h.records.delete('members/u'),
    (h) => {
      h.records.get('members/u').role = 'guest'
    },
    (h) => {
      h.records.get('members/u').created.at = { seconds: 2, nanoseconds: 0 }
    },
    (h) => h.records.delete('access/u'),
    (h) => {
      h.records.get('access/u').ids = ['other']
    },
    (h) => h.records.delete('projects/project'),
  ]) {
    const h = harness()
    h.before(() => mutate(h))
    await assert.rejects(h.update({}, 'project', { name: 'Name' }))
    assert.equal(h.writes.length, 0)
  }
})
test('connected App owns fields even without contacting provider; name remains editable', async () => {
  const h = harness()
  for (const body of [
    { description: '' },
    { image_url: '' },
    { name: 'New', description: 'No' },
  ]) {
    await assert.rejects(h.update({}, 'misebox', body), { statusCode: 403 })
  }
  assert.equal(h.writes.length, 0)
  await h.update({}, 'misebox', { name: 'New' })
  assert.equal(h.writes.length, 1)
})
test('strict identity fields reject envelopes, ownership fields, malformed values and URLs', async () => {
  for (const body of [
    null,
    [],
    {},
    { changes: { name: 'New' } },
    { name: 'New', app_id: 'other' },
    { updated: {} },
    { name: 1 },
    { name: '' },
    { name: 'x'.repeat(121) },
    { description: 'x'.repeat(2001) },
    { image_url: 'http://example.com/a' },
    { image_url: 'https://u:p@example.com/a' },
  ]) {
    const h = harness()
    await assert.rejects(h.update({}, 'project', body), { statusCode: 400 })
    assert.equal(h.writes.length, 0)
  }
})
test('client PATCH exact envelope and round-trip scope invalidation during token wait', async () => {
  for (const scope of [
    'stable',
    'project',
    'account',
    'signout',
    'app',
    'disposal',
    'bad-result',
  ]) {
    let resolveToken
    const token = new Promise((resolve) => {
      resolveToken = resolve
    })
    const user = { uid: 'u', getIdToken: () => token },
      currentUser = ref(user),
      id = ref('project'),
      calls = []
    const config = reactive({ appId: 'fireux-app' }),
      owner = effectScope()
    const useProjectUpdate = load(
      'packages/ecosystem/fireux-fireux/src/runtime/project/composables/useProjectUpdate.ts',
      {
        unref,
        useCommandScope,
        useFireUXConfig: () => config,
        useAuth: () => ({ currentUser }),
        $fetch: async (...args) => {
          calls.push(args)
          return {
            ok: true,
            project_id: scope === 'bad-result' ? 'other' : 'project',
          }
        },
      },
      'useProjectUpdate'
    )
    const command = owner.run(() => useProjectUpdate(id))
    const body = { name: 'New' },
      pending = command.updateProject(body)
    const done =
      scope === 'stable'
        ? pending
        : assert.rejects(
            pending,
            scope === 'bad-result' ? /did not match/ : /changed/
          )
    if (scope === 'project') {
      id.value = 'other'
      id.value = 'project'
    }
    if (scope === 'account' || scope === 'signout') {
      currentUser.value = scope === 'signout' ? null : { uid: 'other' }
      currentUser.value = user
    }
    if (scope === 'app') {
      config.appId = 'other'
      config.appId = 'fireux-app'
    }
    if (scope === 'disposal') owner.stop()
    body.name = 'Changed'
    resolveToken('token')
    await done
    assert.equal(calls.length, ['stable', 'bad-result'].includes(scope) ? 1 : 0)
    owner.stop()
    if (scope === 'stable')
      assert.deepEqual(calls[0], [
        '/api/internal/control/projects/project/identity',
        {
          method: 'PATCH',
          headers: { authorization: 'Bearer token' },
          body: { name: 'New' },
        },
      ])
  }
})
