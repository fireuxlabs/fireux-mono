import assert from 'node:assert/strict'
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { Timestamp } from 'firebase-admin/firestore'
import { readKitchenMemberInvitationHistory } from '../../runtime/kitchen/server/team/invitation-history.ts'

function loadCommand(file, names, bindings) {
  const source = readFileSync(
    new URL('../../runtime/kitchen/server/team/' + file, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '\nreturn {' + names + '}',
    Object.keys(bindings)
  )(...Object.values(bindings))
}

const app = { appId: 'misebox', uid: 'recipient' }
const otherApp = { appId: 'tenant', uid: 'recipient' }
const input = { kitchenId: 'kitchen', memberId: 'person' }

function fixture() {
  const team = new Map([['person', { name: 'Alex', user_id: '' }]])
  const invitations = new Map()
  const writes = []
  let sequence = 0
  const stamp = (options) => ({
    at: new Timestamp(1, ++sequence),
    by: options.by,
    app_id: options.appId,
  })
  const transaction = {
    read: async (target, id) => ({
      exists: target.has(id),
      data: target.get(id),
    }),
    query: async (target, { field, value, afterId, limit }) =>
      [...target.keys()]
        .sort()
        .filter(
          (id) => target.get(id)[field] === value && (!afterId || id > afterId)
        )
        .slice(0, limit)
        .map((id) => ({ id, data: target.get(id) })),
    create: (target, id, data) => {
      assert.equal(target.has(id), false)
      target.set(id, data)
      writes.push('create')
    },
    update: (target, id, data) => {
      assert.ok(target.has(id))
      Object.assign(target.get(id), data)
      writes.push('update')
    },
    delete: (target, id) => {
      target.delete(id)
      writes.push('delete')
    },
  }
  const bindings = {
    useFireUXConfig: (event) => event,
    requireFirebaseBearerUser: async (event) => event,
    readKitchenMutationActor: async (event) => ({
      uid: event.uid,
      runtimeAppId: event.appId,
    }),
    requireKitchenMutationAuthority: async (_tx, actor) => ({
      ownerAppId: actor.runtimeAppId,
    }),
    requireFirestoreDocumentId: (value) => {
      assert.equal(typeof value, 'string')
      return value
    },
    createError: (data) => Object.assign(new Error(data.statusMessage), data),
    runGuardedServerTransaction: async (_placement, run) => run(transaction),
    serverKitchenTeamMembersTarget: () => team,
    serverKitchenMemberInvitationsTarget: () => invitations,
    serverAuditStamp: stamp,
    createHash,
    randomBytes,
    randomUUID,
    timingSafeEqual,
    Timestamp,
    FieldValue: { serverTimestamp: () => Timestamp.now() },
    readKitchenMemberInvitationHistory,
    deleteTeamMember: async (tx, target, id) => {
      const { data } = await tx.read(target, id)
      tx.delete(target, id)
      return { name: data.name }
    },
  }
  const {
    createKitchenMemberInvitation,
    acceptKitchenMemberInvitation,
    inspectKitchenMemberInvitation,
  } = loadCommand(
    'member-invitation.ts',
    'createKitchenMemberInvitation, acceptKitchenMemberInvitation, inspectKitchenMemberInvitation',
    bindings
  )
  const { deleteKitchenTeamMember } = loadCommand(
    'delete.ts',
    'deleteKitchenTeamMember',
    bindings
  )
  function legacy(id, status, memberId = 'person') {
    const secret = randomBytes(32).toString('base64url')
    invitations.set(id, {
      member_id: memberId,
      status,
      created: stamp({ appId: app.appId }),
      expires_at: Timestamp.fromMillis(Date.now() + 86400000),
      token_hash: createHash('sha256').update(secret).digest('hex'),
    })
    const encoded = Buffer.from(
      JSON.stringify({
        appId: app.appId,
        kitchenId: input.kitchenId,
        invitationId: id,
      })
    ).toString('base64url')
    return encoded + '.' + secret
  }
  return {
    team,
    invitations,
    writes,
    legacy,
    issue: () => createKitchenMemberInvitation(app, input),
    remove: () => deleteKitchenTeamMember(app, input),
    inspect: inspectKitchenMemberInvitation,
    accept: acceptKitchenMemberInvitation,
  }
}

test('inspection and acceptance validate the issuing App even if the locator is rewritten', async () => {
  const h = fixture()
  const { token } = await h.issue()
  const [encoded, secret] = token.split('.')
  const locator = JSON.parse(Buffer.from(encoded, 'base64url').toString())
  const forged =
    Buffer.from(JSON.stringify({ ...locator, appId: otherApp.appId })).toString(
      'base64url'
    ) +
    '.' +
    secret
  for (const read of [h.inspect, h.accept]) {
    await assert.rejects(read(otherApp, token), { statusCode: 404 })
    await assert.rejects(read(otherApp, forged), { statusCode: 404 })
  }
  assert.equal(h.team.get(input.memberId).user_id, '')
  assert.equal((await h.inspect(app, token)).memberName, 'Alex')
  const result = await h.accept(app, token)
  assert.deepEqual(result, {
    ok: true,
    memberId: input.memberId,
    kitchenId: input.kitchenId,
    memberName: 'Alex',
  })
  const count = h.writes.length
  assert.deepEqual(await h.accept(app, token), result)
  assert.equal(h.writes.length, count)
  await assert.rejects(h.accept({ ...app, uid: 'other-user' }, token), {
    statusCode: 410,
  })
  h.team.get(input.memberId).user_id = ''
  await assert.rejects(h.accept(app, token), { statusCode: 410 })
})

test('acceptance rejects a different secret, a duplicate account link and an expired link', async () => {
  const h = fixture()
  const token = h.legacy('latest', 'pending')
  const [locator] = token.split('.')
  await assert.rejects(h.accept(app, locator + '.' + 'X'.repeat(43)), {
    statusCode: 410,
  })
  h.team.set('another-member', { name: 'Linked elsewhere', user_id: app.uid })
  await assert.rejects(h.accept(app, token), { statusCode: 409 })
  h.invitations.get('latest').expires_at = Timestamp.fromMillis(Date.now() - 1)
  for (const read of [h.inspect, h.accept])
    await assert.rejects(read(app, token), { statusCode: 410 })
  assert.deepEqual(h.writes, [])
})

test('previously issued links respect the most recent committed invitation across pages', async () => {
  const h = fixture()
  const old = h.legacy('a', 'pending')
  for (let i = 0; i < 105; i++) h.legacy('middle-' + i, 'replaced')
  const current = h.legacy('z', 'pending')
  for (const read of [h.inspect, h.accept])
    await assert.rejects(read(app, old), { statusCode: 410 })
  assert.equal((await h.inspect(app, current)).memberName, 'Alex')
  assert.equal((await h.accept(app, current)).memberId, 'person')
})

test('reissuing and removing the member retire all earlier pending links, including later pages', async () => {
  const h = fixture()
  h.legacy('other', 'pending', 'someone-else')
  for (let i = 0; i < 105; i++)
    h.legacy('entry-' + i, i % 2 ? 'replaced' : 'pending')
  const previous = h.legacy('zz', 'pending')
  const { token } = await h.issue()
  await assert.rejects(h.accept(app, previous), { statusCode: 410 })
  assert.equal(
    [...h.invitations.values()].filter(
      (row) => row.member_id === 'person' && row.status === 'pending'
    ).length,
    1
  )
  assert.equal((await h.inspect(app, token)).memberName, 'Alex')
  h.legacy('zzz', 'pending')
  await h.remove()
  assert.equal(h.team.has('person'), false)
  assert.equal(
    [...h.invitations.values()].filter(
      (row) => row.member_id === 'person' && row.status === 'pending'
    ).length,
    0
  )
  assert.equal(h.invitations.get('other').status, 'pending')
  await assert.rejects(h.accept(app, token), { statusCode: 410 })
})
