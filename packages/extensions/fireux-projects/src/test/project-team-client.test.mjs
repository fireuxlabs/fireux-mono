import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, effectScope, nextTick, ref, watchEffect } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { useWorkspaceTeam } from '../../../fireux-workspace/src/runtime/workspace/composables/useWorkspaceTeam.ts'
import { appSubscriptionCapacity } from '../../../../core/fireux-core/src/runtime/app/utils/app-subscription-capacity.ts'
import { normalizeString } from '../../../../core/fireux-core/src/runtime/utils/normalize-string.ts'

function load(path, name, bindings) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}

function fixture(t, summary = false) {
  const currentUser = ref({
    uid: 'actor',
    getIdToken: async () => 'token-for-actor',
  })
  const hasAuthState = ref(true)
  const id = ref('project-one')
  const outcome = ref('ready')
  const workspace = {
    id,
    outcome,
    data: computed(() =>
      outcome.value === 'ready'
        ? { id: id.value, identity: { name: 'Project One' } }
        : null
    ),
  }
  const native = {
    data: ref(),
    pending: ref(false),
    error: ref(),
    status: ref('success'),
  }
  const appSession = {
    appUser: ref({ role: 'user', subscription: 'free' }),
    pending: ref(false),
    error: ref(),
  }
  let acquisition,
    refreshed = 0
  const commands = []
  const useApiRead = (key, handler, options) => {
    assert.equal(acquisition, undefined, 'one native API read owner')
    acquisition = { key, handler, options }
    return native
  }
  const owner = effectScope()
  t.after(() => owner.stop())
  const reader = owner.run(() =>
    load(
      summary
        ? '../runtime/project/composables/useProjectTeamSummary.ts'
        : '../runtime/project/composables/workspace/useProjectWorkspaceTeam.ts',
      summary ? 'useProjectTeamSummary' : 'useProjectWorkspaceTeam',
      {
        computed,
        watchEffect,
        normalizeString,
        useAuth: () => ({ currentUser, hasAuthState }),
        useApiRead,
        useAppSession: () => appSession,
        useProjectWorkspace: () => workspace,
        useFireUXConfig: () => ({
          subscriptionCapacity: { 'project.team': { free: 5 } },
        }),
        appSubscriptionCapacity,
        useWorkspaceTeam,
        useCommandScope,
        useWorkspacePageState: () => ({ publish() {} }),
        refreshNuxtData: async () => {
          refreshed++
        },
        $fetch: async (url, options) => {
          commands.push({ url, options })
          await options.onResponse({ options, response: { ok: true } })
          return options.method === 'DELETE'
            ? {
                ok: true,
                project_id: id.value,
                member_id: 'person',
                name: 'Alex',
              }
            : { memberId: 'created', name: 'New Person' }
        },
      }
    )()
  )
  const members = () =>
    summary ? reader.members.value : reader.state.value.team.members
  return {
    reader,
    native,
    acquisition,
    currentUser,
    hasAuthState,
    id,
    outcome,
    appSession,
    members,
    commands,
    refreshed: () => refreshed,
  }
}

const response = (id = 'project-one', name = 'Alex') => ({
  ok: true,
  project_id: id,
  members: [{ id: 'person', name, avatar: '', userId: '', roleIds: [] }],
})

for (const summary of [false, true]) {
  const name = summary ? 'overview summary' : 'Team workspace'
  test(`${name} acquires its protected projection through the supplied Core fetcher`, async (t) => {
    const h = fixture(t, summary)
    assert.equal(h.acquisition.options.server, false)
    const calls = []
    const signal = new AbortController().signal
    const dto = response()
    const result = await h.acquisition.handler({
      signal,
      fetch: async (url, options) => {
        calls.push({ url, options })
        return dto
      },
    })
    assert.equal(result, dto)
    assert.deepEqual(calls, [
      {
        url: '/api/internal/control/projects/project-one/team',
        options: { headers: { authorization: 'Bearer token-for-actor' } },
      },
    ])
    const initialKey = h.acquisition.key.value
    h.id.value = 'another-project'
    assert.notEqual(h.acquisition.key.value, initialKey)
    const projectKey = h.acquisition.key.value
    h.currentUser.value = { ...h.currentUser.value, uid: 'another-account' }
    assert.notEqual(h.acquisition.key.value, projectKey)
    assert.equal(h.commands.length, 0)
  })

  test(`${name} reflects refreshed data and hides loading, failed and mismatched rosters`, (t) => {
    const h = fixture(t, summary)
    h.native.data.value = response()
    assert.equal(h.members()[0].name, 'Alex')
    h.native.data.value = response('project-one', 'Remote change')
    assert.equal(h.members()[0].name, 'Remote change')
    if (summary) h.native.status.value = 'pending'
    else h.native.pending.value = true
    assert.deepEqual(h.members(), [])
    h.native.status.value = 'success'
    h.native.pending.value = false
    h.native.error.value = Object.assign(new Error('Revoked'), {
      statusCode: 403,
    })
    assert.deepEqual(h.members(), [])
    assert.equal(
      summary ? h.reader.error.value.statusCode : h.reader.derived.value.status,
      summary ? 403 : 'error'
    )
    h.native.error.value = undefined
    h.native.data.value = response('another-project')
    assert.deepEqual(h.members(), [])
    h.native.data.value = response()
    h.outcome.value = 'pending'
    assert.deepEqual(h.members(), [])
    h.outcome.value = 'idle'
    h.id.value = ''
    assert.deepEqual(h.members(), [])
    if (!summary) assert.equal(h.reader.derived.value.status, 'empty')
  })

  test(`${name} makes no API request without an authorized selected root or account`, async (t) => {
    const h = fixture(t, summary)
    const fetch = () => assert.fail('Inactive Team scope must not acquire data')
    h.outcome.value = 'empty'
    const unavailable = await h.acquisition.handler({ fetch })
    assert.deepEqual(
      unavailable,
      summary ? null : { ok: true, project_id: '', members: [] }
    )
    h.outcome.value = 'ready'
    h.currentUser.value = null
    const signedOut = await h.acquisition.handler({ fetch })
    assert.deepEqual(
      signedOut,
      summary ? null : { ok: true, project_id: 'project-one', members: [] }
    )
  })
}

test('Team commands retain their native refresh hooks and protected endpoints', async (t) => {
  const h = fixture(t)
  h.native.data.value = response()
  await nextTick()
  await h.reader.primitives.create({ name: 'New Person' })
  await h.reader.primitives.update({ memberId: 'person', name: 'Updated' })
  await h.reader.primitives.delete('person')
  assert.deepEqual(
    h.commands.map(({ url, options }) => [url, options.method]),
    [
      ['/api/internal/control/projects/project-one/team', 'POST'],
      ['/api/internal/control/projects/project-one/team/person', 'PATCH'],
      ['/api/internal/control/projects/project-one/team/person', 'DELETE'],
    ]
  )
  assert.equal(h.refreshed(), 3)
  assert.ok(
    h.commands.every(
      ({ options }) =>
        options.headers.authorization === 'Bearer token-for-actor'
    )
  )
})
