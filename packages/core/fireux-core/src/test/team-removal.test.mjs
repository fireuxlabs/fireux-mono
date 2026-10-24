import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

for (const domain of ['Kitchen', 'Project']) {
  test(`${domain} removal deletes only the roster entry and leaves workspace association alone`, async () => {
    const kitchen = domain === 'Kitchen'
    const path = kitchen
      ? '../../../../extensions/fireux-kitchens/src/runtime/kitchen/server/team/delete.ts'
      : '../../../../ecosystem/fireux-fireux/src/runtime/project/server/team/delete.ts'
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
      .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
      .replace(/^export /gm, '')
    const writes = []
    const tx = {
      read: async () => ({
        exists: true,
        data: { name: 'Alex', user_id: 'account', role_ids: [] },
      }),
      query: async () => [{ id: 'invite', data: { status: 'pending' } }],
      update: (...args) => writes.push(['update', ...args]),
      delete: (...args) => writes.push(['delete', ...args]),
    }
    const team = {
      database: { kind: 'named', databaseId: 'test' },
      collectionPath: 'workspace/team',
    }
    const deps = {
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      runGuardedServerTransaction: async (_db, run) => run(tx),
      requireFirestoreDocumentId: (value) => value,
      serverKitchenTeamMembersTarget: () => team,
      fireuxProjectTeamMembersTarget: () => team,
      readKitchenMutationActor: async () => ({ uid: 'actor' }),
      requireKitchenMutationAuthority: async () => ({}),
      requireProjectOperator: async () => ({ projectId: 'workspace' }),
      requireProjectOperatorInTransaction: async () => ({}),
      serverKitchenMemberInvitationsTarget: () => 'invitations',
      serverAuditStamp: () => ({ by: 'actor' }),
    }
    const memberSource = readFileSync(
      new URL(
        '../runtime/workspace/server/team/members.ts',
        import.meta.url
      ),
      'utf8'
    )
      .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
      .replace(/^export /gm, '')
    deps.deleteTeamMember = compileFunction(
      `${stripTypeScriptTypes(memberSource)}; return deleteTeamMember`,
      Object.keys(deps)
    )(...Object.values(deps))
    const command = compileFunction(
      `${stripTypeScriptTypes(source)}; return ${kitchen ? 'deleteKitchenTeamMember' : 'removeProjectTeamMember'}`,
      Object.keys(deps)
    )(...Object.values(deps))
    const result = kitchen
      ? await command({}, { kitchenId: 'workspace', memberId: 'person' })
      : await command({}, 'workspace', 'person')
    assert.equal(result.name, 'Alex')
    assert.equal('status' in result, false)
    assert.deepEqual(
      writes.filter(([verb]) => verb === 'delete'),
      [['delete', team, 'person']]
    )
    assert.equal(
      writes.filter(([verb]) => verb === 'update').length,
      kitchen ? 1 : 0
    )
    if (kitchen)
      assert.deepEqual(
        writes.find(([verb]) => verb === 'update'),
        [
          'update',
          'invitations',
          'invite',
          { status: 'revoked', updated: { by: 'actor' } },
        ]
      )
  })
}
