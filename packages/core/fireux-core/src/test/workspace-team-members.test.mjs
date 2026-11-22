import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

function mechanics() {
  const source = readFileSync(
    new URL('../../../../extensions/fireux-workspace/src/runtime/workspace/server/team/members.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {createTeamMember, updateTeamMembers, deleteTeamMember, enrichTeamMembers}`,
    ['randomUUID', 'createError', 'requireFirestoreDocumentId', 'normalizeUser']
  )(
    () => 'generated',
    (value) => Object.assign(new Error(value.statusMessage), value),
    (value) => {
      if (!value || value.includes('/')) throw Error('Invalid id')
      return value
    },
    (id, data) => ({ id, ...data })
  )
}

test('creation rejects duplicate linked users and capacity before any write', async () => {
  const { createTeamMember } = mechanics()
  const writes = []
  const tx = {
    readAll: async () => [{ id: 'old', data: { user_id: 'u' } }],
    create: (...args) => writes.push(args),
  }
  await assert.rejects(
    createTeamMember(
      tx,
      'team',
      { name: 'Alex', userId: 'u' },
      { canAdd: () => true, limitMessage: 'full' }
    ),
    /already on/
  )
  await assert.rejects(
    createTeamMember(
      tx,
      'team',
      { name: 'Alex' },
      { canAdd: () => false, limitMessage: 'full' }
    ),
    /full/
  )
  assert.deepEqual(writes, [])
  await createTeamMember(
    tx,
    'team',
    { name: 'Alex' },
    { canAdd: () => true, limitMessage: 'full' }
  )
  assert.deepEqual(writes, [
    ['team', 'generated', { name: 'Alex', user_id: '', role_ids: [] }],
  ])
})

test('batch update reads every member first, leaves linked identity untouched, and rejects stale ids', async () => {
  const { updateTeamMembers } = mechanics()
  const writes = []
  const tx = {
    readMany: async (_, ids) =>
      ids.map((id) => ({
        id,
        exists: id !== 'missing',
        data: { user_id: id === 'linked' ? 'u' : '' },
      })),
    update: (...args) => writes.push(args),
  }
  await updateTeamMembers(tx, 'team', [
    { memberId: 'linked', changes: { name: 'Ignored' } },
    { memberId: 'local', changes: { name: '  Alex   Smith ' } },
  ])
  assert.deepEqual(writes, [['team', 'local', { name: 'Alex Smith' }]])
  await assert.rejects(
    updateTeamMembers(tx, 'team', [
      { memberId: 'missing', changes: { name: 'Alex' } },
    ]),
    /not found/
  )
  await assert.rejects(
    updateTeamMembers(tx, 'team', [
      { memberId: 'local', changes: { name: 'Alex', status: 'active' } },
    ]),
    /valid name/
  )
})

test('read enrichment keeps stored roles and local identity fallback', async () => {
  const { enrichTeamMembers } = mechanics()
  const db = {
    collection: () => ({ doc: (id) => id }),
    getAll: async () => [
      {
        id: 'u',
        exists: true,
        data: () => ({
          display_name: 'User Name',
          avatar: 'avatar',
          handle: 'handle',
        }),
      },
    ],
  }
  const members = await enrichTeamMembers(
    [
      {
        id: 'linked',
        data: { name: 'old', user_id: 'u', role_ids: ['operator'] },
      },
      { id: 'local', data: { name: 'Alex', user_id: '', role_ids: [] } },
    ],
    db
  )
  assert.equal(members[0].name, 'User Name')
  assert.equal(members[0].avatar, 'avatar')
  assert.deepEqual(members[0].roleIds, ['operator'])
  assert.equal(members[1].name, 'Alex')
  assert.equal(members[1].linked, false)
})

test('live enrichment declares each exact linked User before the same deduplicated getAll', async () => {
  const { enrichTeamMembers } = mechanics()
  const calls = []
  const refs = new Map()
  const identityDb = {
    collection: (path) => ({
      doc: (id) => {
        const ref = { firestore: identityDb, path: `${path}/${id}` }
        refs.set(id, ref)
        return ref
      },
    }),
    getAll: async (...targets) => {
      calls.push(['getAll', targets])
      return targets.map((ref) => ({
        id: ref.path.split('/').at(-1),
        exists: false,
      }))
    },
  }
  const sources = {
    watch: (ref) => {
      calls.push(['watch', ref])
      return ref
    },
  }
  const members = await enrichTeamMembers(
    [
      { id: 'a', data: { name: 'First', user_id: 'u' } },
      { id: 'b', data: { name: 'Second', user_id: 'u' } },
      { id: 'c', data: { name: 'Third', user_id: 'v' } },
      { id: 'local', data: { name: 'Local' } },
    ],
    identityDb,
    sources
  )
  assert.deepEqual(calls, [
    ['watch', refs.get('u')],
    ['watch', refs.get('v')],
    ['getAll', [refs.get('u'), refs.get('v')]],
  ])
  assert.deepEqual(
    members.map((member) => member.name),
    ['First', 'Second', 'Third', 'Local']
  )
  calls.length = 0
  await enrichTeamMembers([], identityDb, sources)
  assert.deepEqual(calls, [])
})
