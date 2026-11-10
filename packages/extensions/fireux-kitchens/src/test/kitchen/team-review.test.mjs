import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watch, watchEffect } from 'vue'
import { useCommandScope } from '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { teamIntentRecords } from '../../../../../core/fireux-core/src/runtime/workspace/utils/team-intent-records.ts'

function load(file, expression, deps) {
  const source = readFileSync(
    new URL('../../runtime/kitchen/' + file, import.meta.url),
    'utf8'
  )
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return ' + expression,
    Object.keys(deps)
  )(...Object.values(deps))
}

function fixture(t) {
  const token = Promise.withResolvers(),
    response = Promise.withResolvers()
  const currentUser = ref({ uid: 'operator', getIdToken: () => token.promise })
  const membership = ref({ role: 'user' })
  const kitchen = ref({ id: 'k' })
  const selected = ref('first')
  const members = ref(
    ['first', 'detail'].map((id) => ({ id, name: id, role_ids: [] }))
  )
  const actions = ref(['read', 'delete'])
  const calls = [],
    events = []
  let refreshes = 0
  const scope = effectScope()
  t.after(() => scope.stop())
  const deps = {
    computed,
    ref,
    watch,
    watchEffect,
    useCommandScope,
    useAuth: () => ({ currentUser, hasAuthState: ref(true) }),
    useAppSession: () => ({
      appUser: membership,
      pending: ref(false),
      error: ref(null),
    }),
    useFireUXConfig: () => ({}),
    useKitchenWorkspace: () => ({ data: kitchen, outcome: ref('ready') }),
    normalizeString: (value) => String(value || '').trim(),
    readRuntimeFirestoreDatabaseId: () => '',
    useKitchenChildCollection: () => ({
      items: members,
      pending: ref(false),
      error: ref(null),
    }),
    useAsyncData: (key) => ({
      data: ref({
        scope: key.value.slice('kitchen-team:'.length),
        response: {
          ok: true,
          kitchenId: 'k',
          canManageTeam: true,
          members: [],
        },
      }),
      error: ref(null),
    }),
    useWorkspaceTeam: () => ({
      selectedTeamMemberId: selected,
      derived: computed(() => ({
        capability: {
          availableActions: actions.value,
          primitives: Object.fromEntries(
            actions.value.map((action) => [action, { available: true }])
          ),
        },
      })),
    }),
    useWorkspacePageState: () => ({ publish() {} }),
    useKitchenMemberInvitationCreate: () => ({}),
    refreshNuxtData: () => {
      refreshes++
    },
    $fetch: async (url, options) => {
      calls.push({ url, options })
      const result = await response.promise
      await options.onResponse?.({ options, response: { ok: true } })
      return result
    },
  }
  const team = scope.run(() =>
    load(
      'composables/workspace/useKitchenWorkspaceTeam.ts',
      'useKitchenWorkspaceTeam()',
      deps
    )
  )
  const ai = scope.run(() =>
    load('components/Team/AI.vue', '{submit,prompt,submitting}', {
      ...deps,
      teamIntentRecords,
      useRoute: () => ({ fullPath: '/workspace/kitchen/team/people' }),
      defineProps: () => ({ team }),
      defineEmits: () => (_, intent) => events.push(intent),
      useWorkspaceDraftHandoff: () => ({ take: () => '' }),
      useRequireUser: async () => currentUser.value,
    })
  )
  ai.prompt.value = 'Review the Team'
  return {
    scope,
    ai,
    team,
    currentUser,
    membership,
    members,
    kitchen,
    selected,
    actions,
    token,
    response,
    calls,
    events,
    refreshes: () => refreshes,
  }
}

for (const action of ['read', 'delete'])
  test(`Kitchen Team delivers the ${action} review without refreshing its roster`, async (t) => {
    const h = fixture(t)
    const request = h.ai.submit()
    h.token.resolve('token')
    h.response.resolve({ action, name: '', message: '' })
    await request
    assert.equal(h.calls.length, 1)
    assert.equal(h.calls[0].options.body.selectedId, 'first')
    assert.deepEqual(h.events, [{ action, name: '', message: '' }])
    assert.equal(h.refreshes(), 0)
  })

test('Kitchen Team keeps a selection beyond record 100 in the request and the whole roster in the view', async (t) => {
  const h = fixture(t)
  h.members.value = Array.from({ length: 105 }, (_, i) => ({
    id: String(i),
    name: 'Member ' + i,
    role_ids: [],
  }))
  h.selected.value = '104'
  const request = h.ai.submit()
  h.token.resolve('token')
  h.response.resolve({ action: 'delete', name: '', message: '' })
  await request
  const body = h.calls[0].options.body
  assert.equal(body.selectedId, '104')
  assert.deepEqual(
    body.records.map((r) => r.id),
    [...h.members.value.slice(0, 99).map((m) => m.id), '104']
  )
  assert.equal(h.team.context.value.collection.records.length, 105)
})

for (const boundary of ['currentUser', 'kitchen', 'selected', 'actions']) {
  test(`Kitchen Team drops an old review after a ${boundary} round trip`, async (t) => {
    const h = fixture(t)
    const request = h.ai.submit()
    h.token.resolve('token')
    await Promise.resolve()
    await Promise.resolve()
    assert.equal(h.calls.length, 1)
    const old = h[boundary].value
    h[boundary].value = {
      currentUser: { uid: 'other' },
      kitchen: { id: 'other' },
      selected: 'detail',
      actions: [],
    }[boundary]
    h[boundary].value = old
    h.response.resolve({ action: 'delete', name: '', message: '' })
    await request
    assert.deepEqual(h.events, [])
    assert.equal(h.ai.submitting.value, false)
  })
}

for (const boundary of [
  'currentUser',
  'kitchen',
  'membership',
  'confirmation',
]) {
  test(`Kitchen Team checks ${boundary} before dispatching the confirmed removal`, async (t) => {
    const h = fixture(t)
    let current = true
    const removal = h.team.primitives.delete('detail', () => current)
    if (boundary === 'confirmation') current = false
    else {
      const previous = h[boundary].value
      h[boundary].value = {
        currentUser: { uid: 'other' },
        kitchen: { id: 'other' },
        membership: null,
      }[boundary]
      h[boundary].value = previous
    }
    h.token.resolve('token')
    await assert.rejects(removal, /changed/)
    assert.equal(h.calls.length, 0)
  })
}

test('Kitchen Team removes exactly the reviewed detail member and refreshes the roster', async (t) => {
  const h = fixture(t)
  const removal = h.team.primitives.delete('detail')
  h.token.resolve('token')
  h.response.resolve({ ok: true, memberId: 'detail', name: 'Alex' })
  await removal
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].url, '/api/workspace/kitchen/team/members/detail')
  assert.equal(h.calls[0].options.query.kitchenId, 'k')
  assert.equal(h.calls[0].options.method, 'DELETE')
  assert.equal(h.selected.value, 'first')
  assert.equal(h.refreshes(), 1)
})
