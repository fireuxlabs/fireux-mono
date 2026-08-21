import { createHash, randomBytes, randomUUID, timingSafeEqual, } from 'node:crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import {
  ConversationAccessStorage,
  ConversationMessageStorage,
  ConversationStorage,
  type ConversationParticipantType,
} from '../../../models/operations/conversation.model'
import { firebaseBearerUser } from '../auth/bearer'
import { getRuntimeFirestore } from '../getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../ids/path'
import { runGuardedServerTransaction } from '../firestore-mutations/server-transaction'
import {
  serverAppConversationsTarget,
  serverConversationMessagesTarget,
  serverConversationPrivateTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireChatStartBudget } from './start-rate-limit'

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
const MAX_MESSAGES = 200

type StartChatInput = {
  body?: unknown
  email?: unknown
  name?: unknown
  source_route?: unknown
}

type ChatSessionInput = {
  conversation_id?: unknown
  token?: unknown
}

type SendChatMessageInput = ChatSessionInput & {
  body?: unknown
}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function requiredText(value: unknown, label: string, max: number) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > max) badRequest(`${label} is invalid.`)
  return text
}

function optionalText(value: unknown, label: string, max: number) {
  if (value === undefined || value === null || value === '') return ''
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > max) badRequest(`${label} is invalid.`)
  return text
}

function emailAddress(value: unknown) {
  const email = requiredText(value, 'Email', 320).toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    badRequest('Email is invalid.')
  }
  return email
}

function accessToken(value: unknown) {
  const token = requiredText(value, 'Chat recovery token', 128)
  if (!/^[A-Za-z0-9_-]{40,128}$/.test(token)) {
    badRequest('Chat recovery token is invalid.')
  }
  return token
}

function tokenHash(value: string) {
  return createHash('sha256').update(value, 'utf8').digest()
}

function storedTokenMatches(value: unknown, token: string) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) return false
  const stored = Buffer.from(value, 'hex')
  const supplied = tokenHash(token)
  return stored.length === supplied.length && timingSafeEqual(stored, supplied)
}

async function actorFor(event: H3Event, appId: string) {
  const user = await firebaseBearerUser(event).catch(() => null)
  if (!user) {
    return {
      id: '',
      name: '',
      type: 'guest' as ConversationParticipantType,
      isAdmin: false,
    }
  }

  const membership = await getRuntimeFirestore()
    .collection('apps')
    .doc(appId)
    .collection('users')
    .doc(user.uid)
    .get()
  const isAdmin = membership.exists && membership.data()?.role === 'admin'
  return {
    id: user.uid,
    name: typeof user.decoded.name === 'string' ? user.decoded.name.trim() : '',
    type: (isAdmin ? 'admin' : 'user') as ConversationParticipantType,
    isAdmin,
  }
}

function sessionRefs(appId: string, conversationId: string) {
  const conversationRef = getRuntimeFirestore()
    .collection('apps')
    .doc(appId)
    .collection(ConversationStorage.collection)
    .doc(conversationId)
  return {
    conversationRef,
    accessRef: conversationRef
      .collection(ConversationAccessStorage.collection)
      .doc(ConversationAccessStorage.document),
  }
}

function assertLiveAccess(
  access: Record<string, unknown> | undefined,
  token: string,
  isAdmin: boolean
) {
  const expiresAt = access?.expires_at
  const expiresMillis =
    expiresAt &&
    typeof (expiresAt as { toMillis?: unknown }).toMillis === 'function'
      ? (expiresAt as Timestamp).toMillis()
      : 0
  if (!expiresMillis || expiresMillis <= Date.now()) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This chat session has expired.',
    })
  }
  if (!isAdmin && !storedTokenMatches(access?.token_hash, token)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat session not found.',
    })
  }
}

export async function startChatSession(event: H3Event, input: StartChatInput) {
  const { appId, appName } = useFireUXConfig(event)
  requireChatStartBudget(event, appId)
  const name = requiredText(input.name, 'Name', 120)
  const email = emailAddress(input.email)
  const body = requiredText(input.body, 'Message', 4000)
  const sourceRoute = optionalText(input.source_route, 'Source route', 500)
  const actor = await actorFor(event, appId)
  const conversationId = randomUUID()
  const messageId = randomUUID()
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Timestamp.fromMillis(Date.now() + SESSION_LIFETIME_MS)
  const senderName = actor.name || name

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    mutations.create(serverAppConversationsTarget(appId), conversationId, {
      app_id: appId,
      kind: 'general',
      status: 'open',
      related_entity: {
        family: 'apps',
        id: appId,
        path: `apps/${appId}`,
        label: appName,
      },
      participant_ids: actor.id ? [actor.id] : [],
      guest_contact: {
        name,
        email,
        phone: '',
        company: '',
        preferred_channel: 'chat',
      },
      source_route: sourceRoute,
      last_message: {
        body,
        sender_id: actor.id,
        sender_type: actor.type,
        sender_name: senderName,
        created_at: FieldValue.serverTimestamp(),
      },
      expires_at: expiresAt,
      created: {
        at: FieldValue.serverTimestamp(),
        ...(actor.id ? { by: actor.id } : {}),
        app_id: appId,
      },
      updated: {
        at: FieldValue.serverTimestamp(),
        ...(actor.id ? { by: actor.id } : {}),
      },
    })
    mutations.create(
      serverConversationMessagesTarget(appId, conversationId),
      messageId,
      {
        conversation_id: conversationId,
        sender_id: actor.id,
        sender_type: actor.type,
        sender_name: senderName,
        body,
        read_by: actor.id ? [actor.id] : [],
        created: {
          at: FieldValue.serverTimestamp(),
          ...(actor.id ? { by: actor.id } : {}),
          app_id: appId,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          ...(actor.id ? { by: actor.id } : {}),
        },
      }
    )
    mutations.create(
      serverConversationPrivateTarget(appId, conversationId),
      ConversationAccessStorage.document,
      {
        token_hash: tokenHash(token).toString('hex'),
        expires_at: expiresAt,
        created_at: FieldValue.serverTimestamp(),
      }
    )
  })

  return {
    ok: true as const,
    conversation_id: conversationId,
    token,
    expires_at: expiresAt.toDate().toISOString(),
  }
}

export async function readChatSession(event: H3Event, input: ChatSessionInput) {
  const { appId } = useFireUXConfig(event)
  const conversationId = requireFirestoreDocumentId(
    input.conversation_id,
    'Conversation id'
  )
  const actor = await actorFor(event, appId)
  const token = actor.isAdmin
    ? optionalText(input.token, 'Chat recovery token', 128)
    : accessToken(input.token)
  const { conversationRef, accessRef } = sessionRefs(appId, conversationId)
  const [conversation, access] = await Promise.all([
    conversationRef.get(),
    accessRef.get(),
  ])
  if (!conversation.exists || !access.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat session not found.',
    })
  }
  assertLiveAccess(access.data(), token, actor.isAdmin)
  const messages = await conversationRef
    .collection(ConversationMessageStorage.collection)
    .orderBy('created.at', 'asc')
    .limit(MAX_MESSAGES)
    .get()

  return {
    ok: true as const,
    conversation_id: conversation.id,
    status: conversation.data()?.status ?? 'open',
    messages: messages.docs.map((message) => {
      const data = message.data()
      return {
        id: message.id,
        body: typeof data.body === 'string' ? data.body : '',
        sender_name:
          typeof data.sender_name === 'string' ? data.sender_name : '',
        sender_type: data.sender_type,
        created_at:
          typeof data.created?.at?.toDate === 'function'
            ? data.created.at.toDate().toISOString()
            : '',
      }
    }),
    truncated: messages.size === MAX_MESSAGES,
  }
}

export async function sendChatMessage(
  event: H3Event,
  input: SendChatMessageInput
) {
  const { appId } = useFireUXConfig(event)
  const conversationId = requireFirestoreDocumentId(
    input.conversation_id,
    'Conversation id'
  )
  const body = requiredText(input.body, 'Message', 4000)
  const actor = await actorFor(event, appId)
  const token = actor.isAdmin
    ? optionalText(input.token, 'Chat recovery token', 128)
    : accessToken(input.token)
  const messageId = randomUUID()

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [conversation, access] = await Promise.all([
      mutations.read(serverAppConversationsTarget(appId), conversationId),
      mutations.read(
        serverConversationPrivateTarget(appId, conversationId),
        ConversationAccessStorage.document
      ),
    ])
    if (!conversation.exists || !access.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chat session not found.',
      })
    }
    assertLiveAccess(access.data, token, actor.isAdmin)
    const conversationData = conversation.data || {}
    if (
      conversationData.status === 'closed' ||
      conversationData.status === 'archived'
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This chat is closed.',
      })
    }
    const guestName =
      typeof conversationData.guest_contact?.name === 'string'
        ? conversationData.guest_contact.name
        : 'Guest'
    const senderName = actor.name || guestName
    const stamp = {
      at: FieldValue.serverTimestamp(),
      ...(actor.id ? { by: actor.id } : {}),
    }
    mutations.create(
      serverConversationMessagesTarget(appId, conversationId),
      messageId,
      {
        conversation_id: conversationId,
        sender_id: actor.id,
        sender_type: actor.type,
        sender_name: senderName,
        body,
        read_by: actor.id ? [actor.id] : [],
        created: { ...stamp, app_id: appId },
        updated: stamp,
      }
    )
    mutations.update(serverAppConversationsTarget(appId), conversationId, {
      last_message: {
        body,
        sender_id: actor.id,
        sender_type: actor.type,
        sender_name: senderName,
        created_at: FieldValue.serverTimestamp(),
      },
      updated: stamp,
    })
  })

  return { ok: true as const, message_id: messageId }
}
