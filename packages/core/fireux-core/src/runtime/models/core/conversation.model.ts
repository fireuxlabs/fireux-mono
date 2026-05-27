import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Communication
 * Storage: root conversation record with message child records
 * Root path: /conversations/<conversationId>
 * Message path: /conversations/<conversationId>/messages/<messageId>
 *
 * Decision note:
 * - Conversation is a shared communication engine, not an app-specific contact form.
 * - Product apps provide labels and related entity context; the stored shape stays shared.
 * - Public enquiry creation may use guest contact fields, but shipping rules must restrict
 *   reads and follow-up writes to participants or trusted server paths.
 */

export const ConversationStorage = {
  shape: 'public/root',
  path: 'conversations/{conversationId}',
  collection: 'conversations',
  idParam: 'conversationId',
  children: {
    messages: 'conversations/{conversationId}/messages/{messageId}',
  },
} as const

export const ConversationMessageStorage = {
  shape: 'scoped',
  path: 'conversations/{conversationId}/messages/{messageId}',
  collection: 'messages',
  parent: 'conversation',
  idParam: 'messageId',
} as const

export type ConversationKind =
  | 'property_enquiry'
  | 'guest_support'
  | 'provider_lead'
  | 'general'

export type ConversationStatus = 'open' | 'pending' | 'closed' | 'archived'
export type ConversationParticipantType = 'user' | 'guest' | 'system'
export type ConversationPreferredChannel = 'chat' | 'email' | 'phone' | 'whatsapp'

export type ConversationRelatedEntity = {
  family: string
  id: string
  path: string
  label: string
}

export type ConversationGuestContact = {
  name: string
  email: string
  phone: string
  company: string
  preferred_channel: ConversationPreferredChannel
}

export type ConversationLastMessage = {
  body: string
  sender_id: string
  sender_type: ConversationParticipantType
  sender_name: string
  created_at: FirebaseTimestamp
}

export const ConversationModel = {
  id: '',
  app_id: '',
  kind: 'general' as ConversationKind,
  status: 'open' as ConversationStatus,
  related_entity: {
    family: '',
    id: '',
    path: '',
    label: '',
  } as ConversationRelatedEntity,
  participant_ids: [] as string[],
  guest_contact: {
    name: '',
    email: '',
    phone: '',
    company: '',
    preferred_channel: 'chat' as ConversationPreferredChannel,
  } as ConversationGuestContact,
  source_route: '',
  last_message: {
    body: '',
    sender_id: '',
    sender_type: 'guest' as ConversationParticipantType,
    sender_name: '',
    created_at: {} as FirebaseTimestamp,
  } as ConversationLastMessage,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export interface Conversation {
  id: string
  app_id: string
  kind: ConversationKind
  status: ConversationStatus
  related_entity: ConversationRelatedEntity
  participant_ids: string[]
  guest_contact: ConversationGuestContact
  source_route: string
  last_message: ConversationLastMessage
  created: typeof ConversationModel.created
  updated: typeof ConversationModel.updated
}

export const ConversationMessageModel = {
  id: '',
  conversation_id: '',
  sender_id: '',
  sender_type: 'guest' as ConversationParticipantType,
  sender_name: '',
  body: '',
  read_by: [] as string[],

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export interface ConversationMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: ConversationParticipantType
  sender_name: string
  body: string
  read_by: string[]
  created: typeof ConversationMessageModel.created
  updated: typeof ConversationMessageModel.updated
}

export type ConversationCreateInput = Pick<
  Conversation,
  'app_id' | 'kind' | 'related_entity' | 'guest_contact' | 'source_route'
> &
  Partial<Pick<Conversation, 'status' | 'participant_ids' | 'last_message'>>

export type ConversationMessageCreateInput = Pick<
  ConversationMessage,
  'conversation_id' | 'sender_type' | 'sender_name' | 'body'
> &
  Partial<Pick<ConversationMessage, 'sender_id' | 'read_by'>>
