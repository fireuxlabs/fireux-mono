import { serverTimestamp } from 'firebase/firestore'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type {
  Conversation,
  ConversationCreateInput,
  ConversationGuestContact,
  ConversationKind,
  ConversationMessage,
  ConversationMessageCreateInput,
  ConversationParticipantType,
  ConversationPreferredChannel,
  ConversationRelatedEntity,
  ConversationStatus,
} from '../../../../../../models/core/conversation.model'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

type CreateConversationInput = {
  app_id?: string
  kind: ConversationKind
  status?: ConversationStatus
  related_entity: Partial<ConversationRelatedEntity>
  guest_contact?: Partial<ConversationGuestContact>
  participant_ids?: string[]
  source_route?: string
  initial_message?: {
    body: string
    sender_id?: string
    sender_type?: ConversationParticipantType
    sender_name?: string
  }
}

const clean = (value: unknown) => String(value || '').trim()

const toStringList = (values: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => clean(value))
        .filter(Boolean)
    )
  )

const normalizeChannel = (value: unknown): ConversationPreferredChannel => {
  const channel = clean(value)
  if (channel === 'email' || channel === 'phone' || channel === 'whatsapp') {
    return channel
  }
  return 'chat'
}

export function useConversationCreate() {
  const fireux = useFireUXConfig()
  const { createDocument } = useFirestoreCreate()

  async function createConversation(input: CreateConversationInput): Promise<string> {
    const body = clean(input.initial_message?.body)
    const senderType = input.initial_message?.sender_type ?? 'guest'
    const senderName =
      clean(input.initial_message?.sender_name) ||
      clean(input.guest_contact?.name) ||
      'Guest'
    const appId = clean(input.app_id) || fireux.appId
    const participantIds = toStringList(input.participant_ids)

    if (!appId) {
      throw new Error('Conversation app id is required')
    }

    if (!input.kind) {
      throw new Error('Conversation kind is required')
    }

    if (!clean(input.related_entity?.id)) {
      throw new Error('Conversation related entity id is required')
    }

    if (!body) {
      throw new Error('Conversation initial message is required')
    }

    const guestContact: ConversationGuestContact = {
      name: clean(input.guest_contact?.name),
      email: clean(input.guest_contact?.email),
      phone: clean(input.guest_contact?.phone),
      company: clean(input.guest_contact?.company),
      preferred_channel: normalizeChannel(input.guest_contact?.preferred_channel),
    }
    const relatedEntity: ConversationRelatedEntity = {
      family: clean(input.related_entity?.family),
      id: clean(input.related_entity?.id),
      path: clean(input.related_entity?.path),
      label: clean(input.related_entity?.label),
    }
    const lastMessage = {
      body,
      sender_id: clean(input.initial_message?.sender_id),
      sender_type: senderType,
      sender_name: senderName,
      created_at: serverTimestamp() as any,
    }

    const conversation: ConversationCreateInput = {
      app_id: appId,
      kind: input.kind,
      status: input.status ?? 'open',
      related_entity: relatedEntity,
      participant_ids: participantIds,
      guest_contact: guestContact,
      source_route: clean(input.source_route),
      last_message: lastMessage,
    }

    const conversationId = await createDocument<Partial<Conversation>>(
      'conversations',
      conversation,
      { app: true }
    )

    const message: ConversationMessageCreateInput = {
      conversation_id: conversationId,
      sender_id: lastMessage.sender_id,
      sender_type: lastMessage.sender_type,
      sender_name: lastMessage.sender_name,
      body,
      read_by: [],
    }

    await createDocument<Partial<ConversationMessage>>(
      `conversations/${conversationId}/messages`,
      message,
      { app: true }
    )

    return conversationId
  }

  return {
    createConversation,
  }
}
