import { useConversationCollection } from './fetch/useConversationCollection'
import { useConversationFetch } from './fetch/useConversationFetch'
import { useConversationMessages } from './fetch/useConversationMessages'
import { useConversationCreate } from './mutations/useConversationCreate'
import { useConversationMessageCreate } from './mutations/useConversationMessageCreate'
import { useConversationUpdate } from './mutations/useConversationUpdate'
import { useConversationComputed } from './utils/view/useConversationComputed'
import { useConversationInterface } from './utils/view/useConversationInterface'

export type {
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
} from '../../../../../models/core/conversation.model'

export { useConversationCollection } from './fetch/useConversationCollection'
export { useConversationFetch } from './fetch/useConversationFetch'
export { useConversationMessages } from './fetch/useConversationMessages'
export { useConversationCreate } from './mutations/useConversationCreate'
export { useConversationMessageCreate } from './mutations/useConversationMessageCreate'
export { useConversationUpdate } from './mutations/useConversationUpdate'
export { useConversationComputed } from './utils/view/useConversationComputed'
export { useConversationInterface } from './utils/view/useConversationInterface'

/**
 * FireUX stack family: Shared communication root + messages child.
 * Entity: Conversation.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * Conversation is the shared communication root; ConversationMessage records
 * live under conversations/{conversationId}/messages/{messageId}. Archive is
 * the current removal posture, so status updates replace hard delete canon.
 */
export function useConversation(id?: string) {
  const fetch = useConversationFetch(id || '')

  return {
    ...fetch,
    ...useConversationMessages(id || ''),
    ...useConversationCollection(),
    ...useConversationCreate(),
    ...useConversationMessageCreate(),
    ...useConversationUpdate(),
    ...useConversationComputed(fetch.conversation),
    ...useConversationInterface(),
  }
}
