import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { createError, getRequestIP, setHeader, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../models/core/app.model'
import { AppUserStorage } from '../../../models/core/user.model'
import {
  ConversationAccessStorage,
  ConversationMessageStorage,
  ConversationStorage,
  type ConversationParticipantType,
} from '../../../models/operations/conversation.model'
import { firebaseBearerUser } from '../auth/bearer'
import { getRuntimeFirestore } from '../getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../ids/path'

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
const MAX_MESSAGES = 200
const CHAT_START_WINDOW_MS = 10 * 60 * 1000
const MAX_CHAT_STARTS_PER_WINDOW = 6
const MAX_RATE_LIMIT_KEYS = 2_000
const rateLimitSalt = randomBytes(32)
const chatStartWindows = new Map<
  string,
  { count: number; resetAt: number }
>()

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

function requireChatStartBudget(event: H3Event, appId: string) {
  const now = Date.now()
  const ip = getRequestIP(event) || 'unknown'
  const key = createHash('sha256')
    .update(rateLimitSalt)
    .update(appId)
    .update('\0')
    .update(ip)
    .digest('hex')
  const current = chatStartWindows.get(key)
  if (!current || current.resetAt <= now) {
    if (chatStartWindows.size >= MAX_RATE_LIMIT_KEYS) {
      const oldestKey = chatStartWindows.keys().next().value
      if (typeof oldestKey === 'string') chatStartWindows.delete(oldestKey)
    }
    chatStartWindows.set(key, {
      count: 1,
      resetAt: now + CHAT_START_WINDOW_MS,
    })
    return
  }
  if (current.count >= MAX_CHAT_STARTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    setHeader(event, 'Retry-After', retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many new chats. Please try again later.',
    })
  }
  current.count += 1
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
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(AppUserStorage.collection)
    .doc(user.uid)
    .get()
  const isAdmin = membership.exists && membership.data()?.role === 'admin'
  return {
    id: user.uid,
    name:
      typeof user.decoded.name === 'string' ? user.decoded.name.trim() : '',
    type: (isAdmin ? 'admin' : 'user') as ConversationParticipantType,
    isAdmin,
  }
}

function sessionRefs(appId: string, conversationId: string) {
  const conversationRef = getRuntimeFirestore()
    .collection(AppStorage.collection)
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
    expiresAt && typeof (expiresAt as { toMillis?: unknown }).toMillis === 'function'
      ? (expiresAt as Timestamp).toMillis()
      : 0
  if (!expiresMillis || expiresMillis <= Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'This chat session has expired.' })
  }
  if (!isAdmin && !storedTokenMatches(access?.token_hash, token)) {
    throw createError({ statusCode: 404, statusMessage: 'Chat session not found.' })
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
  const db = getRuntimeFirestore()
  const conversationRef = db
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(ConversationStorage.collection)
    .doc()
  const messageRef = conversationRef
    .collection(ConversationMessageStorage.collection)
    .doc()
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Timestamp.fromMillis(Date.now() + SESSION_LIFETIME_MS)
  const accessRef = conversationRef
    .collection(ConversationAccessStorage.collection)
    .doc(ConversationAccessStorage.document)
  const senderName = actor.name || name

  await db.runTransaction(async (transaction) => {
    transaction.create(conversationRef, {
      id: conversationRef.id,
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
    transaction.create(messageRef, {
      id: messageRef.id,
      conversation_id: conversationRef.id,
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
    })
    transaction.create(accessRef, {
      token_hash: tokenHash(token).toString('hex'),
      expires_at: expiresAt,
      created_at: FieldValue.serverTimestamp(),
    })
  })

  return {
    ok: true as const,
    conversation_id: conversationRef.id,
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
  const token = actor.isAdmin ? optionalText(input.token, 'Chat recovery token', 128) : accessToken(input.token)
  const { conversationRef, accessRef } = sessionRefs(appId, conversationId)
  const [conversation, access] = await Promise.all([
    conversationRef.get(),
    accessRef.get(),
  ])
  if (!conversation.exists || !access.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Chat session not found.' })
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
        sender_name: typeof data.sender_name === 'string' ? data.sender_name : '',
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

export async function sendChatMessage(event: H3Event, input: SendChatMessageInput) {
  const { appId } = useFireUXConfig(event)
  const conversationId = requireFirestoreDocumentId(
    input.conversation_id,
    'Conversation id'
  )
  const body = requiredText(input.body, 'Message', 4000)
  const actor = await actorFor(event, appId)
  const token = actor.isAdmin ? optionalText(input.token, 'Chat recovery token', 128) : accessToken(input.token)
  const db = getRuntimeFirestore()
  const { conversationRef, accessRef } = sessionRefs(appId, conversationId)
  const messageRef = conversationRef
    .collection(ConversationMessageStorage.collection)
    .doc()

  await db.runTransaction(async (transaction) => {
    const [conversation, access] = await Promise.all([
      transaction.get(conversationRef),
      transaction.get(accessRef),
    ])
    if (!conversation.exists || !access.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Chat session not found.' })
    }
    assertLiveAccess(access.data(), token, actor.isAdmin)
    const conversationData = conversation.data() || {}
    if (conversationData.status === 'closed' || conversationData.status === 'archived') {
      throw createError({ statusCode: 409, statusMessage: 'This chat is closed.' })
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
    transaction.create(messageRef, {
      id: messageRef.id,
      conversation_id: conversationId,
      sender_id: actor.id,
      sender_type: actor.type,
      sender_name: senderName,
      body,
      read_by: actor.id ? [actor.id] : [],
      created: { ...stamp, app_id: appId },
      updated: stamp,
    })
    transaction.update(conversationRef, {
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

  return { ok: true as const, message_id: messageRef.id }
}
