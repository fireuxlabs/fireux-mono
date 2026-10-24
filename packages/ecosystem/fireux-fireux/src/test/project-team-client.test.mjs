import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, effectScope, ref, watchEffect } from 'vue'
import { useWorkspaceTeam } from '../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceTeam.ts'

function fixture() {
  const source = readFileSync(
    new URL(
      '../runtime/project/composables/useProjectTeam.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const currentUser = ref({ uid: 'actor', getIdToken: async () => 'token' })
  const workspace = {
    data: ref({ id: 'project-a', identity: { name: 'Project A' } }),
    outcome: ref('ready'),
  }
  const projection = {
    data: ref({
      ok: true,
      project_id: 'project-a',
      members: [{ id: 'person-a', name: 'Person A', roleIds: [] }],
    }),
    pending: ref(false),
    error: ref(undefined),
  }
  const session = {
    appUser: ref({ role: 'admin', subscription: 'business' }),
    pending: ref(false),
    error: ref(undefined),
  }
  const dependencies = {
    computed,
    watchEffect,
    useWorkspaceTeam,
    useAuth: () => ({ currentUser, hasAuthState: ref(true) }),
    useAppSession: () => session,
    useProjectWorkspace: () => workspace,
    useFireUXConfig: () => ({ appId: 'fireux', subscriptionCapacity: {} }),
    useLiveAsyncData: () => projection,
    normalizeString: (value) => String(value ?? '').trim(),
    appSubscriptionCapacity: () => 10,
    useWorkspacePageState: () => ({ publish() {} }),
  }
  const make = compileFunction(
    `${stripTypeScriptTypes(source)}; return useProjectTeam`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const owner = effectScope()
  const state = owner.run(make)
  return {
    state,
    workspace,
    projection,
    session,
    stop: () => owner.stop(),
  }
}

test('Project Team distinguishes a failed collection read from loading or an empty roster', () => {
  const f = fixture()
  assert.equal(f.state.derived.value.status, 'ready')
  assert.equal(f.state.context.value.collection.records.length, 1)
  f.projection.error.value = new Error('Team could not be read')
  assert.equal(f.state.derived.value.status, 'error')
  assert.equal(
    f.state.derived.value.capability.primitives.create.available,
    false
  )
  assert.equal(f.state.context.value.collection.records.length, 0)
  f.projection.error.value = undefined
  f.projection.data.value = { ok: true, project_id: 'project-a', members: [] }
  assert.equal(f.state.derived.value.status, 'ready')
  assert.equal(
    f.state.derived.value.capability.primitives.create.available,
    true
  )
  f.stop()
})

test('Project Team hides old roster records while the next scope is loading', () => {
  const f = fixture()
  f.workspace.data.value = { id: 'project-b', identity: { name: 'Project B' } }
  f.projection.pending.value = true
  assert.equal(f.state.context.value.collection.records.length, 0)
  assert.equal(f.state.derived.value.status, 'loading')
  assert.equal(
    f.state.derived.value.capability.primitives.create.available,
    false
  )
  f.projection.pending.value = false
  f.projection.data.value = {
    ok: true,
    project_id: 'project-b',
    members: [{ id: 'person-b', name: 'Person B', roleIds: [] }],
  }
  assert.equal(f.state.context.value.collection.records[0].id, 'person-b')
  assert.equal(
    f.state.derived.value.capability.primitives.create.available,
    true
  )
  f.stop()
})

test('a settled Workspace without a Project shows an empty surface rather than perpetual loading', () => {
  const f = fixture()
  f.workspace.data.value = null
  f.workspace.outcome.value = 'idle'
  assert.equal(f.state.derived.value.status, 'empty')
  assert.equal(f.state.context.value.collection.records.length, 0)
  assert.equal(
    f.state.derived.value.capability.primitives.create.available,
    false
  )
  f.stop()
})
