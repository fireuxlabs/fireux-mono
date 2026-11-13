import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { effectScope, onScopeDispose, ref, watch } from 'vue'
import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestore-document-id.ts'
import { readMembershipAccessIds } from '../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts'

function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const requireWorkspaceEntityMemberRole = load(
  '../../../../core/fireux-core/src/runtime/workspace/server/entity/onboarding-authority.ts',
  'requireWorkspaceEntityMemberRole',
  { createError }
)
const readProjectDocument = load(
  '../runtime/project/utils/readProject.ts',
  'readProjectDocument',
  { isFirestoreDocumentId }
)
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)

function identityHarness() {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ['apps/app', {}],
    ['members/user', { role: 'user', created: { at } }],
    ['access/user', { ids: ['project'], membership_created_at: at }],
    [
      'projects/project',
      {
        identity: {
          status: 'inactive',
          name: 'Project',
          description: '',
          image_url: '',
        },
        context: 'Private background',
        created: { at },
        updated: { at },
      },
    ],
  ])
  const writes = []
  const update = load(
    '../runtime/project/server/identity/update.ts',
    'updateProjectIdentity',
    {
      createError,
      readProjectDocument,
      readMembershipAccessIds,
      requireWorkspaceEntityMemberRole,
      requireFirebaseBearerUser: async () => ({ uid: 'user' }),
      requireFirestoreDocumentId: (value) => {
        assert.ok(isFirestoreDocumentId(value))
        return value
      },
      useFireUXConfig: () => ({ appId: 'app' }),
      fireuxProjectsTarget: 'projects',
      fireuxAppUsersTarget: () => 'members',
      serverProjectAccessTarget: () => 'access',
      FIREUX_MUTATION_TARGETS: { fireuxApps: 'apps' },
      serverAuditStamp: ({ by }) => ({ at: 'now', by }),
      runGuardedServerTransaction: async (target, action) => {
        assert.deepEqual(target, { kind: 'named', databaseId: 'fireux' })
        return action({
          read: async (target, id) => ({
            exists: records.has(`${target}/${id}`),
            data: records.get(`${target}/${id}`),
          }),
          update: (target, id, patch) => writes.push({ target, id, patch }),
        })
      },
    }
  )
  return { records, writes, update }
}

test('Project status writes only the selected Identity field and audit stamp', async () => {
  for (const status of ['active', 'inactive']) {
    const h = identityHarness()
    const before = structuredClone(h.records.get('projects/project'))
    assert.deepEqual(await h.update({}, 'project', { status }), {
      ok: true,
      project_id: 'project',
    })
    assert.deepEqual(h.writes, [
      {
        target: 'projects',
        id: 'project',
        patch: {
          'identity.status': status,
          updated: { at: 'now', by: 'user' },
        },
      },
    ])
    assert.deepEqual(h.records.get('projects/project'), before)
  }
})

test('Project status rejects every unsupported value before writing', async () => {
  for (const status of [
    'archived',
    'ACTIVE',
    ' active ',
    '',
    null,
    true,
    1,
    {},
    [],
  ]) {
    const h = identityHarness()
    await assert.rejects(h.update({}, 'project', { status }), {
      statusCode: 400,
    })
    assert.deepEqual(h.writes, [])
  }
})

test('Project status changes require current membership and exact Project access', async () => {
  for (const revoke of [
    (h) => h.records.delete('members/user'),
    (h) => {
      h.records.get('access/user').ids = ['other']
    },
    (h) => {
      h.records.get('members/user').created.at = { seconds: 2, nanoseconds: 0 }
    },
  ]) {
    const h = identityHarness()
    revoke(h)
    await assert.rejects(h.update({}, 'project', { status: 'active' }), {
      statusCode: 403,
    })
    assert.deepEqual(h.writes, [])
  }
  const h = identityHarness()
  await assert.rejects(h.update({}, 'other', { status: 'active' }), {
    statusCode: 403,
  })
  assert.deepEqual(h.writes, [])
})

test('Project status transport snapshots its input and rejects obsolete selection or editor intent', async () => {
  for (const changed of ['none', 'selection', 'editor']) {
    let resolveToken
    const token = new Promise((resolve) => {
      resolveToken = resolve
    })
    const selectedId = ref('project')
    let surfaceCurrent = true
    const calls = []
    const owner = effectScope()
    const useProjectUpdate = load(
      '../runtime/project/composables/useProjectUpdate.ts',
      'useProjectUpdate',
      {
        useCommandScope,
        useAuth: () => ({
          currentUser: ref({ uid: 'user', getIdToken: () => token }),
        }),
        useAppSession: () => ({ appUser: ref({ id: 'user' }) }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useRoute: () => ({ fullPath: '/workspace/project' }),
        refreshNuxtData: async () => {},
        $fetch: async (...args) => {
          calls.push(args)
          return { ok: true, project_id: 'project' }
        },
      }
    )
    const command = owner.run(() => useProjectUpdate([selectedId]))
    const changes = { status: 'active' }
    const pending = command.updateProject(
      {
        projectId: selectedId.value,
        changes,
      },
      () => surfaceCurrent
    )
    const done =
      changed !== 'none' ? assert.rejects(pending, /context changed/) : pending
    changes.status = 'inactive'
    if (changed === 'selection') {
      selectedId.value = 'other'
      selectedId.value = 'project'
    }
    if (changed === 'editor') surfaceCurrent = false
    resolveToken('token')
    await done
    assert.equal(calls.length, changed === 'none' ? 1 : 0)
    if (calls.length) {
      assert.equal(
        calls[0][0],
        '/api/internal/control/projects/project/identity'
      )
      assert.equal(calls[0][1].method, 'PATCH')
      assert.deepEqual(calls[0][1].body, { status: 'active' })
    }
    owner.stop()
  }
})
