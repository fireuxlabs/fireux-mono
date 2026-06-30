import { serverTimestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import {
  type Conversation,
  type ConversationCreateInput,
  type ConversationGuestContact,
  type ConversationKind,
  type ConversationMessage,
  type ConversationMessageCreateInput,
  type ConversationParticipantType,
  type ConversationPreferredChannel,
  type ConversationRelatedEntity,
  type ConversationStatus,
} from '../../../../../../models/core/conversation.model'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useConversationPaths } from '../utils/paths/useConversationPaths'

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

const normalizeString = (value: unknown) => String(value ?? '').trim()

const toStringList = (values: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => normalizeString(value))
        .filter(Boolean)
    )
  )

const normalizeChannel = (value: unknown): ConversationPreferredChannel => {
  const channel = normalizeString(value)
  if (channel === 'email' || channel === 'phone' || channel === 'whatsapp') {
    return channel
  }
  return 'chat'
}

export function useConversationCreate() {
  const fireux = useFireUXConfig()
  const { createDocument } = useFirestoreCreate()
  const scopedAppId = ref('')
  const paths = useConversationPaths(scopedAppId)

  async function createConversation(input: CreateConversationInput): Promise<string> {
    const body = normalizeString(input.initial_message?.body)
    const senderType = input.initial_message?.sender_type ?? 'guest'
    const senderName =
      normalizeString(input.initial_message?.sender_name) ||
      normalizeString(input.guest_contact?.name) ||
      'Guest'
    const appId = normalizeString(input.app_id) || fireux.appId
    scopedAppId.value = appId
    const participantIds = toStringList(input.participant_ids)

    if (!appId) {
      throw new Error('Conversation app id is required')
    }

    if (!input.kind) {
      throw new Error('Conversation kind is required')
    }

    if (!normalizeString(input.related_entity?.id)) {
      throw new Error('Conversation related entity id is required')
    }

    if (!body) {
      throw new Error('Conversation initial message is required')
    }

    const guestContact: ConversationGuestContact = {
      name: normalizeString(input.guest_contact?.name),
      email: normalizeString(input.guest_contact?.email),
      phone: normalizeString(input.guest_contact?.phone),
      company: normalizeString(input.guest_contact?.company),
      preferred_channel: normalizeChannel(input.guest_contact?.preferred_channel),
    }
    const relatedEntity: ConversationRelatedEntity = {
      family: normalizeString(input.related_entity?.family),
      id: normalizeString(input.related_entity?.id),
      path: normalizeString(input.related_entity?.path),
      label: normalizeString(input.related_entity?.label),
    }
    const lastMessage = {
      body,
      sender_id: normalizeString(input.initial_message?.sender_id),
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
      source_route: normalizeString(input.source_route),
      last_message: lastMessage,
    }

    const conversationId = await createDocument<Partial<Conversation>>(
      paths.collectionPath.value,
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
      paths.messageCollectionPath(conversationId).value,
      message,
      { app: true }
    )

    return conversationId
  }

  return {
    createConversation,
  }
}
