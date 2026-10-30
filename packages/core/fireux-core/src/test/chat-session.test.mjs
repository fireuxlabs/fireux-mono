import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'

function fixture() {
  const records = new Map()
  const target = (path) => ({ collectionPath: path })
  const clock = (millis) => ({
    toDate: () => new Date(millis),
    toMillis: () => millis,
  })
  const source = readFileSync(
    new URL('../runtime/server/utils/chat/session.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const transaction = async (_, work) => {
    const writes = []
    const result = await work({
      read: async (t, id) => ({
        exists: records.has(`${t.collectionPath}/${id}`),
        data: records.get(`${t.collectionPath}/${id}`),
      }),
      create: (t, id, data) =>
        writes.push(() => {
          const key = `${t.collectionPath}/${id}`
          assert.equal(records.has(key), false)
          records.set(key, data)
        }),
      update: (t, id, data) =>
        writes.push(() => {
          const key = `${t.collectionPath}/${id}`
          records.set(key, { ...records.get(key), ...data })
        }),
    })
    writes.forEach((write) => write())
    return result
  }
  const deps = {
    createHash,
    randomBytes,
    randomUUID,
    timingSafeEqual,
    createError: (data) => Object.assign(new Error(data.statusMessage), data),
    FieldValue: { serverTimestamp: () => clock(Date.now()) },
    Timestamp: { fromMillis: clock },
    requireFirestoreDocumentId: (value) => {
      if (typeof value !== 'string' || !value || value.includes('/'))
        throw Error('Bad id')
      return value
    },
    serverAppConversationsTarget: (app) => target(`apps/${app}/conversations`),
    serverConversationMessagesTarget: (app, id) =>
      target(`apps/${app}/conversations/${id}/messages`),
    serverConversationPrivateTarget: (app, id) =>
      target(`apps/${app}/conversations/${id}/private`),
    ConversationAccessStorage: { document: 'session' },
    useFireUXConfig: () => ({ appId: 'app-a', appName: 'Fixture App' }),
    requireChatStartBudget() {},
    firebaseBearerUser: async () => null,
    runGuardedServerTransaction: transaction,
  }
  const core = compileFunction(
    `${stripTypeScriptTypes(source)};return {startChatSession,sendChatMessage,stageChatSessionCreation,requireChatSessionAccess}`,
    Object.keys(deps)
  )(...Object.values(deps))
  return { ...core, records, transaction, clock }
}

test('normal chat intake creates the Core-owned Conversation, first message and hashed recovery together', async () => {
  const f = fixture()
  const result = await f.startChatSession(
    {},
    {
      name: 'Guest',
      email: 'GUEST@example.com',
      body: 'Fixture message',
      source_route: '/chat',
    }
  )
  assert.equal(f.records.size, 3)
  const base = `apps/app-a/conversations/${result.conversation_id}`
  assert.equal(f.records.get(base).guest_contact.email, 'guest@example.com')
  assert.equal(f.records.get(base).related_entity.family, 'apps')
  assert.equal(
    f.records.get(`${base}/private/session`).token_hash,
    createHash('sha256').update(result.token).digest('hex')
  )
  assert.equal(
    JSON.stringify([...f.records.values()]).includes(result.token),
    false
  )
  await f.sendChatMessage(
    {},
    {
      conversation_id: result.conversation_id,
      token: result.token,
      body: 'Follow-up',
    }
  )
  assert.equal(f.records.get(base).last_message.body, 'Follow-up')
})

test('domain composition uses the same Core schema and remains atomic with its parent job', async () => {
  const f = fixture(),
    id = 'request-a'
  await assert.rejects(
    f.transaction({}, async (tx) => {
      tx.create({ collectionPath: 'requests' }, id, { stage: 'received' })
      f.stageChatSessionCreation(tx, {
        appId: 'app-a',
        conversationId: id,
        token: 'invalid',
        actor: { id: '', name: 'Buyer', type: 'guest' },
        contact: { name: 'Buyer', email: 'buyer@example.com' },
        body: 'Request',
        sourceRoute: '/menu-express',
        relatedEntity: {
          family: 'requests',
          id,
          path: `requests/${id}`,
          label: 'Menu',
        },
      })
    }),
    /token is invalid/
  )
  assert.equal(f.records.size, 0)
  await f.transaction({}, async (tx) => {
    tx.create({ collectionPath: 'requests' }, id, { stage: 'received' })
    f.stageChatSessionCreation(tx, {
      appId: 'app-a',
      conversationId: id,
      token: 'a'.repeat(64),
      actor: { id: '', name: 'Buyer', type: 'guest' },
      contact: { name: 'Buyer', email: 'buyer@example.com', company: 'Venue' },
      body: 'Request',
      sourceRoute: '/menu-express',
      relatedEntity: {
        family: 'requests',
        id,
        path: `requests/${id}`,
        label: 'Menu',
      },
    })
  })
  assert.equal(f.records.size, 4)
  assert.equal(
    f.records.get(`apps/app-a/conversations/${id}`).related_entity.family,
    'requests'
  )
})

test('wrong recovery, closed writes and malformed/expired sessions fail before a message is staged', async () => {
  const f = fixture()
  const session = await f.startChatSession(
    {},
    { name: 'Guest', email: 'guest@example.com', body: 'Start' }
  )
  const base = `apps/app-a/conversations/${session.conversation_id}`,
    access = `${base}/private/session`
  await assert.rejects(
    f.sendChatMessage(
      {},
      {
        conversation_id: session.conversation_id,
        token: 'b'.repeat(64),
        body: 'Denied',
      }
    ),
    /not found/
  )
  assert.equal(f.records.size, 3)
  f.records.get(base).status = 'closed'
  await assert.rejects(
    f.sendChatMessage(
      {},
      {
        conversation_id: session.conversation_id,
        token: session.token,
        body: 'Denied',
      }
    ),
    /closed/
  )
  await f.transaction({}, (tx) =>
    f.requireChatSessionAccess(tx, {
      appId: 'app-a',
      conversationId: session.conversation_id,
      token: session.token,
    })
  )
  for (const expiry of [1, NaN]) {
    f.records.get(access).expires_at = f.clock(expiry)
    await assert.rejects(
      f.sendChatMessage(
        {},
        {
          conversation_id: session.conversation_id,
          token: session.token,
          body: 'Denied',
        }
      ),
      /expired/
    )
  }
  assert.equal(f.records.size, 3)
})
