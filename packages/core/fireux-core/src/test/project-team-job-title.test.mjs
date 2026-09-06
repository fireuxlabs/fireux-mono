import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = name => readFileSync(new URL(`../../../../../projects/fireux/fireux-app/server/project/team/${name}.ts`, import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
const error = e => Object.assign(new Error(e.statusMessage), e)
test('Project title updates preserve omitted access and protected owner roles', async () => {
 const patches = []
 let role = 'operator'
 const run = compileFunction(`${stripTypeScriptTypes(source('update'))}; return updateProjectTeamMember`, ['createError', 'runGuardedServerTransaction', 'requireFirestoreDocumentId', 'serverAuditStamp', 'fireuxProjectTeamMembersTarget', 'requireProjectOperator'])(error, async (_, fn) => fn({ read: async () => ({ exists: true, data: { role } }), update: (_, __, patch) => patches.push(patch) }), v => v, () => ({}), () => ({ database: 'fireux' }), async () => ({ uid: 'actor', projectId: 'p' }))
 for (const jobTitle of ['Developer', '', undefined]) {
  await run({}, 'p', 'm', { name: 'Alex', ...(jobTitle !== undefined ? { jobTitle } : {}) })
  assert.equal(patches.at(-1).job_title, jobTitle)
  assert.equal(Object.hasOwn(patches.at(-1), 'role'), false)
 }
 role = 'owner'
 await run({}, 'p', 'm', { name: 'Alex', role: 'member', jobTitle: 'Designer' })
 assert.equal(Object.hasOwn(patches.at(-1), 'role'), false)
 await assert.rejects(run({}, 'p', 'm', { name: 'Alex', jobTitle: 42 }), { statusCode: 400 })
 await assert.rejects(run({}, 'p', 'm', { name: 'Alex', jobTitle: 'x'.repeat(121) }), { statusCode: 400 })
 assert.equal(patches.length, 4)
})
test('Project creation saves a custom title with default member access', async () => {
 let record
 const run = compileFunction(`${stripTypeScriptTypes(source('create'))}; return createProjectTeamMember`, ['randomUUID', 'createError', 'runGuardedServerTransaction', 'fireuxProjectTeamMembersTarget', 'serverAuditStamp', 'requireFirestoreDocumentId', 'requireProjectOperator', 'useRuntimeConfig'])(() => 'm', error, async (_, fn) => fn({ create: (_, __, value) => { record = value } }), () => ({ database: 'fireux' }), () => ({}), v => v, async () => ({ uid: 'actor', projectId: 'p' }), () => ({}))
 await run({}, 'p', { name: 'Alex', jobTitle: ' Project   Manager ' })
 assert.equal(record.job_title, 'Project Manager')
 assert.equal(record.role, 'member')
 await assert.rejects(run({}, 'p', { name: 'Alex', jobTitle: 'x'.repeat(121) }), { statusCode: 400 })
})
