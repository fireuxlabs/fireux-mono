import { computed, isRef, type Ref } from 'vue'
import type { ConversationMessage } from '../../../../../../models/core/conversation.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useConversationPaths } from '../utils/paths/useConversationPaths'

export function useConversationMessages(
  conversationId: string | Ref<string | null | undefined> | null | undefined,
  options: { appId?: string | Ref<string | null | undefined> } = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const id = computed(() =>
    isRef(conversationId)
      ? String(conversationId.value || '').trim()
      : String(conversationId || '').trim()
  )
  const paths = useConversationPaths(options.appId)
  const collectionPath = paths.messageCollectionPath(id)
  const firestoreSource = firestoreFetchCollection<ConversationMessage>(
    collectionPath
  )

  const messages = computed<ConversationMessage[]>(() =>
    firestoreSource.value ?? []
  )
  const count = computed(() => messages.value.length)
  const pending = firestoreSource.pending
  const error = firestoreSource.error
  const outcome = firestoreSource.outcome

  return {
    messages,
    count,
    pending,
    error,
    outcome,
  }
}
