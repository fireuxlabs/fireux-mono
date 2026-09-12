import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, result, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const {
  readMembershipAccess,
  readMembershipAccessIds,
  membershipCreatedAt,
  createMembershipAccess,
} = load(
  '../runtime/app/utils/membership-access.ts',
  '{ readMembershipAccess, readMembershipAccessIds, membershipCreatedAt, createMembershipAccess }'
)
const birth = { seconds: 123, nanoseconds: 456 }
const membership = () => ({ created: { at: { ...birth } } })
const access = (ids = ['first']) => ({
  ids,
  membership_created_at: { ...birth },
})

test('access is bound to the exact membership lifetime, including nanoseconds', () => {
  assert.deepEqual(readMembershipAccessIds(access(), membership()), ['first'])
  assert.deepEqual(readMembershipAccessIds(null, membership()), [])
  for (const at of [
    { seconds: 124, nanoseconds: 456 },
    { seconds: 123, nanoseconds: 457 },
  ]) {
    assert.deepEqual(readMembershipAccessIds(access(), { created: { at } }), [])
  }
  const stored = access()
  readMembershipAccessIds(stored, membership()).push('second')
  assert.deepEqual(
    stored.ids,
    ['first'],
    'callers cannot mutate the stored grant'
  )
})

test('malformed ids and timestamps fail explicitly instead of granting or normalizing access', () => {
  for (const ids of [
    null,
    'first',
    [''],
    [' spaced '],
    ['a/b'],
    ['a', 'a'],
    Array(501).fill('a'),
  ]) {
    assert.throws(() => readMembershipAccess({ ...access(), ids }), {
      statusCode: 409,
    })
  }
  for (const at of [
    null,
    '2026-01-01',
    {},
    { seconds: 1.1, nanoseconds: 0 },
    { seconds: 1, nanoseconds: -1 },
    { seconds: 1, nanoseconds: 1e9 },
  ]) {
    assert.throws(() => membershipCreatedAt({ created: { at } }), {
      statusCode: 409,
    })
    assert.throws(
      () => readMembershipAccess({ ...access(), membership_created_at: at }),
      { statusCode: 409 }
    )
  }
  assert.throws(() => readMembershipAccessIds(access(), {}), {
    statusCode: 409,
  })
  assert.throws(() => readMembershipAccessIds({ ids: ['old'] }, membership()), {
    statusCode: 409,
  })
})

test('next-record construction cannot write more ids than readers accept', () => {
  const ids = Array.from({ length: 500 }, (_, index) => `id-${index}`)
  const record = createMembershipAccess(ids, membership())
  assert.deepEqual(readMembershipAccessIds(record, membership()), ids)
  assert.throws(
    () => createMembershipAccess([...ids, 'overflow'], membership()),
    { statusCode: 409 }
  )
})

for (const byAdmin of [false, true]) {
  test(`membership ${byAdmin ? 'removal' : 'leave'} invalidates grants without querying domains`, async () => {
    const before = membership()
    const storedAccess = access()
    const writes = []
    const handleRemoveMember = load(
      '../runtime/app/server/app-user/remove.ts',
      'handleRemoveMember',
      {
        FIRESTORE_MUTATION_TARGETS: { runtimeApps: 'apps' },
        serverAppUsersTarget: () => 'members',
        serverAppJoinRequestsTarget: () => 'joins',
        serverAppMembershipBlocksTarget: () => 'blocks',
        requireFirestoreDocumentId: (value) => value,
        appGovernancePatch: () => ({ updated: true }),
        isAdminMembership: () => false,
        countTransactionAdmins: () => {
          throw new Error('Unexpected admin query')
        },
        requireAdmin: () => assert.equal(byAdmin, true),
        stamp: (actor) => ({ by: actor }),
        forbidden: (_code, message) => {
          throw new Error(message)
        },
      }
    )
    const result = await handleRemoveMember({
      context: {
        actorUid: byAdmin ? 'administrator' : 'person',
        appId: 'app',
        input: { action: 'remove-member', userId: 'person' },
      },
      actorMembershipExists: true,
      actorMembership: before,
      mutations: {
        read: async (target) => {
          if (target === 'members' && byAdmin)
            return { exists: true, data: before }
          assert.ok(['joins', 'blocks'].includes(target))
          return { exists: false }
        },
        delete: (target, id) => writes.push(['delete', target, id]),
        create: (target, id, data) => writes.push(['create', target, id, data]),
        update: (target, id) => writes.push(['update', target, id]),
      },
    })
    assert.equal(result.removed, true)
    assert.deepEqual(writes, [
      ['delete', 'members', 'person'],
      ...(byAdmin
        ? [
            [
              'create',
              'blocks',
              'person',
              { user_id: 'person', blocked: { by: 'administrator' } },
            ],
          ]
        : []),
      ['update', 'apps', 'app'],
    ])
    const rejoined = { created: { at: { seconds: 124, nanoseconds: 0 } } }
    assert.deepEqual(readMembershipAccessIds(storedAccess, rejoined), [])
  })
}

function reader() {
  const source = Object.assign(ref(null), {
    pending: ref(false),
    error: ref(undefined),
    outcome: ref('missing'),
  })
  let reads = 0
  let path, target
  const useMembershipAccess = load(
    '../runtime/app/composables/useMembershipAccess.ts',
    'useMembershipAccess',
    {
      computed,
      toValue,
      readMembershipAccessIds,
      useFirestoreRead: () => ({
        firestoreFetchDoc: (p, id) => {
          reads++
          path = p
          target = id
          return source
        },
      }),
    }
  )
  const collection = ref('example_access/app-a/users')
  const uid = ref('person-a')
  const member = ref(membership())
  const result = useMembershipAccess(collection, uid, member)
  return {
    source,
    result,
    collection,
    uid,
    member,
    path,
    target,
    reads: () => reads,
  }
}

test('one live binding tracks domain path and user identity reactively', () => {
  const state = reader()
  assert.equal(state.path.value, 'example_access/app-a/users')
  assert.equal(state.target.value, 'person-a')
  state.collection.value = 'example_access/app-b/users'
  state.uid.value = 'person-b'
  assert.equal(state.path.value, 'example_access/app-b/users')
  assert.equal(state.target.value, 'person-b')
  assert.equal(state.reads(), 1)
})

test('live revocation and rejoining clear granted ids immediately', () => {
  const { source, result, member, target } = reader()
  assert.equal(result.outcome.value, 'empty')
  source.value = access()
  source.outcome.value = 'ready'
  assert.deepEqual(result.ids.value, ['first'])
  source.value = access([])
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'empty')
  source.value = access()
  member.value = null
  assert.equal(target.value, null)
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'idle')
  member.value = { created: { at: { seconds: 124, nanoseconds: 0 } } }
  assert.deepEqual(
    result.ids.value,
    [],
    'a retained record cannot revive old access'
  )
  assert.equal(result.outcome.value, 'empty')
  source.value = {
    ids: ['new'],
    membership_created_at: member.value.created.at,
  }
  assert.deepEqual(result.ids.value, ['new'])
})

test('loading and failure hide retained access; malformed data remains an error', () => {
  const { source, result, member } = reader()
  source.value = access()
  source.outcome.value = 'ready'
  source.pending.value = true
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'pending')
  source.pending.value = false
  source.outcome.value = 'idle'
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'pending')
  source.outcome.value = 'ready'
  source.error.value = new Error('denied')
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'error')
  source.error.value = undefined
  source.value = { ids: ['broken'] }
  assert.deepEqual(result.ids.value, [])
  assert.equal(result.outcome.value, 'error')
  assert.match(result.error.value.message, /timestamp/)
  member.value = null
  assert.equal(result.error.value, undefined)
  assert.equal(result.outcome.value, 'idle')
})
