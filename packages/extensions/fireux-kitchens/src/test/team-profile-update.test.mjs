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
    'createError', 'runGuardedServerTransaction', 'requireFirestoreDocumentId', 'serverAuditStamp',
    'serverKitchenTeamMembersTarget', 'readKitchenMutationActor', 'requireKitchenMutationAuthority',
  ])(
    input => Object.assign(new Error(input.statusMessage), input),
    async (_target, run) => run({ read: async () => ({ exists: true, data: record }), update: (...args) => writes.push(args) }),
    value => value, () => ({ by: 'actor' }), id => `kitchens/${id}/team`,
    async () => ({ uid: 'actor' }), async () => ({ teamRole: 'owner' }),
  )
  return { writes, update: name => command({}, { kitchenId: 'pizza', updates: [{ memberId: 'person', changes: { name } }] }) }
}
test('unlinked name edit preserves access and historical fields', async () => {
  const { update, writes } = fixture({ name: 'Before', role: 'member', notes: 'Keep', user_id: '' })
  await update('After')
  assert.equal(writes.length, 1)
  assert.deepEqual(Object.keys(writes[0][2]).sort(), ['display_name', 'name', 'updated'])
  assert.equal(writes[0][2].name, 'After')
})
test('linked account cannot be renamed through Team', async () => {
  const { update, writes } = fixture({ name: 'Account name', role: 'member', user_id: 'linked' })
  await assert.rejects(update('Different'), /managed in the person’s account/)
  assert.equal(writes.length, 0)
})
