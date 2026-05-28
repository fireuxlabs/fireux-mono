import type {
  Conversation,
  ConversationStatus,
} from '../../../../../../models/core/conversation.model'
import { ConversationStorage } from '../../../../../../models/core/conversation.model'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'

export type ConversationUpdatePatch = Partial<
  Omit<Conversation, 'id' | 'created' | 'updated'>
>

const clean = (value: unknown) => String(value || '').trim()

export function useConversationUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateConversation(
    conversationId: string,
    patch: ConversationUpdatePatch
  ) {
    const id = clean(conversationId)
    if (!id) throw new Error('Conversation id is required')

    await updateDocument<Conversation>(ConversationStorage.collection, id, patch)
  }

  async function setConversationStatus(
    conversationId: string,
    status: ConversationStatus
  ) {
    await updateConversation(conversationId, { status })
  }

  const openConversation = (conversationId: string) =>
    setConversationStatus(conversationId, 'open')
  const markConversationPending = (conversationId: string) =>
    setConversationStatus(conversationId, 'pending')
  const closeConversation = (conversationId: string) =>
    setConversationStatus(conversationId, 'closed')
  const archiveConversation = (conversationId: string) =>
    setConversationStatus(conversationId, 'archived')

  return {
    updateConversation,
    setConversationStatus,
    openConversation,
    markConversationPending,
    closeConversation,
    archiveConversation,
  }
}
