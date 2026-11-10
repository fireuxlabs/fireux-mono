import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watchEffect } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'

const source = readFileSync(
  new URL(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspaceTeam.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')

function harness(t) {
  const user = ref({ uid: 'operator', getIdToken: async () => 'token' })
  const kitchen = ref({ id: 'k' })
  const items = ref([{ id: 'person', user_id: '', name: 'Alex', role_ids: [] }])
  const data = ref(),
    error = ref()
  let key, read, reply
  const deps = {
    computed,
    useCommandScope,
    watchEffect,
    useAuth: () => ({ currentUser: user, hasAuthState: ref(true) }),
    useAppSession: () => ({ appUser: ref(null), error: ref() }),
    useFireUXConfig: () => ({}),
    useKitchenWorkspace: () => ({ data: kitchen, outcome: ref('ready') }),
    normalizeString: (value) => String(value || '').trim(),
    readRuntimeFirestoreDatabaseId: () => '',
    useKitchenChildCollection: () => ({
      items,
      pending: ref(false),
      error: ref(),
    }),
    useAsyncData: (requestKey, handler) => {
      key = requestKey
      read = handler
      return { data, error }
    },
    $fetch: async (_path, { query }) => ({
      ok: true,
      canManageTeam: true,
      kitchenId: query.kitchenId,
      members: reply,
    }),
    useWorkspaceTeam: () => ({
      selectedTeamMemberId: ref('person'),
      derived: ref({}),
    }),
    useWorkspacePageState: () => ({ publish() {} }),
    useKitchenMemberInvitationCreate: () => ({}),
  }
  const scope = effectScope()
  t.after(() => scope.stop())
  const team = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return useKitchenWorkspaceTeam()`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  const resolve = async (members) => {
    reply = members
    data.value = await read(null, { signal: new AbortController().signal })
  }
  return { team, key, items, user, kitchen, error, resolve }
}

test('live unlinked roster names and roles change independently of account enrichment', async (t) => {
  const { items, key, resolve, team } = harness(t)
  assert.equal(team.pending.value, true)
  assert.deepEqual(team.teamMembers.value, [])
  await resolve([{ memberId: 'person', name: 'Alex', userId: '', avatar: '' }])
  const originalKey = key.value
  items.value[0].name = 'Alex Morgan'
  items.value[0].role_ids = ['chef']
  assert.equal(key.value, originalKey)
  assert.deepEqual(team.state.value.team.members[0], {
    id: 'person',
    userId: '',
    name: 'Alex Morgan',
    roleIds: ['chef'],
    avatar: '',
  })
})

test('accepting an invitation requires a fresh projection for that exact account and actor', async (t) => {
  const { team, key, items, user, kitchen, error, resolve } = harness(t)
  await resolve([])
  const originalKey = key.value
  items.value[0].user_id = 'account'
  assert.notEqual(key.value, originalKey)
  assert.equal(team.pending.value, true)
  assert.deepEqual(team.teamMembers.value, [])

  await resolve([
    {
      memberId: 'person',
      userId: 'old-account',
      name: 'Other person',
      avatar: 'other.jpg',
    },
  ])
  assert.equal(team.state.value.team.members[0].userId, 'account')
  assert.equal(
    team.state.value.team.members[0].name,
    'Linked account unavailable'
  )
  assert.equal(team.state.value.team.members[0].avatar, '')

  await resolve([
    {
      memberId: 'person',
      userId: 'account',
      name: 'Account name',
      avatar: 'account.jpg',
    },
  ])
  assert.equal(team.state.value.team.members[0].name, 'Account name')
  assert.equal(team.state.value.team.members[0].avatar, 'account.jpg')
  user.value = { ...user.value, uid: 'other-operator' }
  assert.equal(team.pending.value, true)
  assert.deepEqual(team.teamMembers.value, [])
  await resolve([])
  kitchen.value = { id: 'other-kitchen' }
  assert.deepEqual(team.teamMembers.value, [])
  error.value = new Error('Permission denied')
  assert.equal(team.pending.value, false)
  assert.deepEqual(team.teamMembers.value, [])
})

test('late account enrichment cannot expose the previous roster after relinking', async (t) => {
  const { team, items, user, resolve } = harness(t)
  items.value[0].user_id = 'original'
  let release
  user.value.getIdToken = () =>
    new Promise((done) => {
      release = done
    })
  const previousRead = resolve([
    {
      memberId: 'person',
      userId: 'original',
      name: 'Original identity',
      avatar: '',
    },
  ])
  items.value[0].user_id = 'replacement'
  release('token')
  await previousRead
  assert.equal(team.pending.value, true)
  assert.deepEqual(team.teamMembers.value, [])

  user.value.getIdToken = async () => 'token'
  await resolve([
    {
      memberId: 'person',
      userId: 'replacement',
      name: 'Current identity',
      avatar: '',
    },
  ])
  assert.equal(team.state.value.team.members[0].name, 'Current identity')
})
