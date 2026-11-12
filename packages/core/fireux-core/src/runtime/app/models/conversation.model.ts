/** Shared chat storage paths and the contracts consumed by trusted chat commands. */
export const ConversationStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/conversations/{conversationId}',
  collection: 'conversations',
  parent: 'app',
  idParam: 'conversationId',
  children: {
    messages:
      'apps/{appId}/conversations/{conversationId}/messages/{messageId}',
  },
} as const

export const ConversationMessageStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/conversations/{conversationId}/messages/{messageId}',
  collection: 'messages',
  parent: 'conversation',
  idParam: 'messageId',
} as const

export const ConversationAccessStorage = {
  shape: 'private-support',
  path: 'apps/{appId}/conversations/{conversationId}/private/session',
  collection: 'private',
  document: 'session',
  parent: 'conversation',
} as const

export type ConversationParticipantType = 'admin' | 'user' | 'guest' | 'system'
export type ConversationRelatedEntity = {
  family: string
  id: string
  path: string
  label: string
}
