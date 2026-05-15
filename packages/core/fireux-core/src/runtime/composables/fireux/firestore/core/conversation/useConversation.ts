import { useConversationCollection } from './fetch/useConversationCollection'
import { useConversationFetch } from './fetch/useConversationFetch'
import { useConversationMessages } from './fetch/useConversationMessages'
import { useConversationCreate } from './mutations/useConversationCreate'
import { useConversationMessageCreate } from './mutations/useConversationMessageCreate'
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

export function useConversation(id?: string) {
  return {
    ...useConversationFetch(id || ''),
    ...useConversationMessages(id || ''),
    ...useConversationCollection(),
    ...useConversationCreate(),
    ...useConversationMessageCreate(),
    ...useConversationInterface(),
  }
}
