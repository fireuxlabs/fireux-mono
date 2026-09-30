import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const root = new URL('../../../../../', import.meta.url)
function load(path, name, deps) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`, Object.keys(deps))(...Object.values(deps))
}
const command = load('packages/core/fireux-core/src/runtime/server/utils/workspace-team/roles.ts', 'teamRolesCommand', {
  randomUUID: () => 'custom-id', createError: x => Object.assign(new Error(x.statusMessage), x),
})
const owners = [
  ['kitchen', 'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/roles.ts'],
  ['property', 'packages/extensions/fireux-properties/src/runtime/property/server/team/roles.ts'],
  ['portfolio', 'packages/extensions/fireux-properties/src/runtime/portfolio/server/team/roles.ts'],
  ['supplier', 'packages/extensions/fireux-suppliers/src/runtime/supplier/server/team/roles.ts'],
  ['project', 'projects/fireux/fireux-app/server/project/team/roles.ts'],
  ['blank', 'projects/fireux/fireux-blank/server/utils/blank/team/roles.ts'],
]
function harness(domain, path) {
  const title = domain[0].toUpperCase() + domain.slice(1)
  const roles = new Map([['dev', { name: 'Stored override' }]])
  const person = { name: 'Member', user_id: 'user-a', role_ids: [], unrelated: 'retained' }
  const writes = []
  let authorized = false, denied = false
  const tx = {
    readAll: async target => {
      assert.ok(authorized)
      return target === 'members' ? [{ id: 'person', data: person }] : [...roles].map(([id, data]) => ({ id, data }))
    },
    read: async (_target, id) => ({ exists: id === 'person', data: person }),
    create: (target, id, data) => { writes.push({ target, id, data }); roles.set(id, data) },
    update: (target, id, data) => {
      writes.push({ target, id, data })
      if (target === 'members') Object.assign(person, data)
      else roles.set(id, { ...roles.get(id), ...data })
    },
  }
  const authorize = () => { if (denied) throw new Error('Domain access denied'); authorized = true }
  const deps = {
    teamRolesCommand: command,
    defineFirestoreMutationTarget: value => value,
    requireFirestoreDocumentId: value => value,
    runGuardedServerTransaction: async (_database, run) => run(tx),
    [`server${title}TeamMembersTarget`]: () => 'members',
    [`read${title}MutationActor`]: async () => ({ uid: 'actor' }),
    [`require${title}MutationAuthority`]: async (received, actor, id) => {
      assert.equal(received, tx); assert.equal(actor.uid, 'actor'); assert.equal(id, 'parent-a'); authorize()
    },
    requireProjectOperator: async (_event, id) => { authorize(); return { uid: 'actor', projectId: id } },
    fireuxProjectTeamMembersTarget: () => 'members',
  }
  const owner = load(path, `${domain}Roles`, deps)
  const run = input => domain === 'project' ? owner({}, 'parent-a', input) : owner({}, { ...input, [`${domain}Id`]: 'parent-a' })
  return { run, roles, person, writes, deny() { authorized = false; denied = true } }
}
for (const [domain, path] of owners) {
  test(`${domain}: authored fixed/custom role policy and authority remain intact`, async () => {
    const h = harness(domain, path)
    const read = await h.run({ action: 'read', memberId: 'person' })
    assert.deepEqual(read.roles, [{ id: 'dev', name: 'Dev' }, { id: 'operator', name: 'Operator' }])
    for (const roleId of ['dev', 'operator']) {
      await assert.rejects(h.run({ action: 'rename', roleId, name: 'Changed' }), /Dev and Operator are fixed roles/)
    }
    await assert.rejects(h.run({ action: 'create', name: ' operator ' }), /already exists/)
    assert.equal(h.writes.length, 0)
    await h.run({ action: 'create', name: ' Custom role ' })
    await h.run({ action: 'rename', roleId: 'custom-id', name: 'Edited role' })
    assert.equal(h.roles.get('custom-id').name, 'Edited role')
    await h.run({ action: 'assign', memberId: 'person', roleIds: ['dev', 'operator', 'custom-id', 'custom-id'] })
    assert.deepEqual(h.person.role_ids, ['dev', 'operator', 'custom-id'])
    assert.deepEqual(Object.keys(h.writes.at(-1).data), ['role_ids'])
    assert.equal(h.person.user_id, 'user-a')
    assert.equal(h.person.unrelated, 'retained')
    const writeCount = h.writes.length
    for (const roleIds of [['foreign-role'], [1], Array(21).fill('dev')])
      await assert.rejects(h.run({ action: 'assign', memberId: 'person', roleIds }), /available|20 roles/)
    await assert.rejects(h.run({ action: 'assign', memberId: 'missing', roleIds: ['dev'] }), /Select a Team member/)
    assert.equal(h.writes.length, writeCount)
    h.deny()
    await assert.rejects(h.run({ action: 'assign', memberId: 'person', roleIds: [] }), /Domain access denied/)
    assert.equal(h.writes.length, writeCount)
  })
}

test('Core uses supplied fixed labels without adding its own roles', async () => {
  const tx = { readAll: async () => [], read: async () => ({ exists: true, data: {} }) }
  const policy = { fixedRoles: [{ id: 'fixture', name: 'Fixture label' }], fixedRoleRenameMessage: 'Fixture cannot be renamed.' }
  const read = await command(tx, 'roles', 'members', { action: 'read' }, policy)
  assert.deepEqual(read.roles, policy.fixedRoles)
  await assert.rejects(command(tx, 'roles', 'members', { action: 'rename', roleId: 'fixture' }, policy), /Fixture cannot be renamed/)
  await assert.rejects(command(tx, 'roles', 'members', { action: 'assign', memberId: 'person', roleIds: ['dev'] }, policy), /no longer available/)
})

test('shared editor limits stay unchanged with domain policy input', async () => {
  const policy = { fixedRoles: [], fixedRoleRenameMessage: 'Fixed role.' }
  let writes = 0
  const roles = Array.from({ length: 100 }, (_, index) => ({ id: `role-${index}`, data: { name: `Role ${index}` } }))
  const tx = {
    readAll: async target => target === 'roles' ? roles : Array.from({ length: 201 }, (_, index) => ({ id: `member-${index}`, data: {} })),
    create() { writes++ }, update() { writes++ },
  }
  await assert.rejects(command(tx, 'roles', 'members', { action: 'create', name: 'Extra' }, policy), /100 roles/)
  await assert.rejects(command(tx, 'roles', 'members', { action: 'read' }, policy), /Team is too large/)
  roles.push({ id: 'overflow', data: { name: 'Overflow' } })
  await assert.rejects(command(tx, 'roles', 'members', { action: 'read' }, policy), /too many roles/)
  roles.length = 0
  await assert.rejects(command(tx, 'roles', 'members', { action: 'create', name: 'x'.repeat(81) }, policy), /80 characters/)
  assert.equal(writes, 0)
})
