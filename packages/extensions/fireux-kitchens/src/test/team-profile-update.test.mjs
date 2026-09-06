import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../runtime/kitchen/server/team/update.ts', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
function fixture(record) {
  const writes = []
  const command = compileFunction(`${stripTypeScriptTypes(source)}; return updateKitchenTeamMembers`, [
    'createError', 'runGuardedServerTransaction', 'requireFirestoreDocumentId', 'canAddKitchenTeamMember',
    'serverKitchenTeamMembersTarget', 'readKitchenMutationActor', 'requireKitchenMutationAuthority',
  ])(
    input => Object.assign(new Error(input.statusMessage), input),
    async (_target, run) => run({ readAll: async () => [{id: 'person', data: record}], update: (...args) => writes.push(args) }),
    value => value, () => true, id => `kitchens/${id}/team`,
    async () => ({ uid: 'actor' }), async () => ({ teamRole: 'owner' }),
  )
  return { writes, update: name => command({}, { kitchenId: 'pizza', updates: [{ memberId: 'person', changes: { name } }] }) }
}
test('unlinked name edit writes only the profile name', async () => {
  const { update, writes } = fixture({ name: 'Before', role: 'member', notes: 'Keep', user_id: '' })
  await update('After')
  assert.equal(writes.length, 1)
  assert.deepEqual(Object.keys(writes[0][2]).sort(), ['name'])
  assert.equal(writes[0][2].name, 'After')
})
test('linked account cannot be renamed through Team', async () => {
  const { update, writes } = fixture({ name: 'Account name', role: 'member', user_id: 'linked' })
  await update('Different')
  assert.equal(writes.length, 0)
})
