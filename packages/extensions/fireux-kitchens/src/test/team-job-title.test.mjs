import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = name => readFileSync(new URL(`../runtime/kitchen/server/team/${name}.ts`, import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
const error = e => Object.assign(new Error(e.statusMessage), e)
const id = value => { if (!value) throw new Error('Missing id'); return value }
test('creation explicitly accepts custom job titles and rejects oversized titles', () => {
  const parse = compileFunction(`${stripTypeScriptTypes(source('create'))}; return parseInput`, ['createError', 'requireFirestoreDocumentId'])(error, id)
  assert.equal(parse({ kitchenId: 'k', name: 'Alex', jobTitle: ' Commis   Chef ' }).jobTitle, 'Commis Chef')
  assert.equal(parse({ kitchenId: 'k', name: 'Alex' }).jobTitle, '')
  assert.throws(() => parse({ kitchenId: 'k', name: 'Alex', jobTitle: 'x'.repeat(121) }), { statusCode: 400 })
})
test('job title updates and clearing preserve access fields through the trusted writer', async () => {
  const patches = []
  const run = compileFunction(`${stripTypeScriptTypes(source('update'))}; return updateKitchenTeamMember`, ['createError', 'requireFirestoreDocumentId', 'readKitchenMutationActor', 'runGuardedServerTransaction', 'requireKitchenMutationAuthority', 'serverKitchenTeamMembersTarget', 'serverAuditStamp'])(error, id, async () => ({ uid: 'owner' }), async (_, callback) => callback({ read: async () => ({ exists: true, data: { role: 'operator', user_id: 'alex', permissions: ['recipes.edit'], job_title: 'Chef' } }), update: (_, __, patch) => patches.push(patch) }), async () => ({ teamRole: 'owner' }), () => 'team', () => ({}))
  for (const jobTitle of ['Commis Chef', '', undefined]) {
    await run({}, { kitchenId: 'k', memberId: 'alex', changes: { name: 'Alex', ...(jobTitle !== undefined ? { jobTitle } : {}) } })
    const patch = patches.at(-1)
    assert.equal(patch.job_title, jobTitle)
    assert.equal(Object.hasOwn(patch, 'role'), false)
    assert.equal(Object.hasOwn(patch, 'permissions'), false)
  }
  await assert.rejects(run({}, { kitchenId: 'k', memberId: 'alex', changes: { name: 'Alex', jobTitle: 42 } }), { statusCode: 400 })
  assert.equal(patches.length, 3)
})
