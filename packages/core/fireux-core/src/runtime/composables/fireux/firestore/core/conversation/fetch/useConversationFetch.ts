import { computed, isRef, type Ref } from 'vue'
import { ConversationStorage, type Conversation } from '../../../../../../models/core/conversation.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type ConversationFetchSource = 'live' | 'test'

type UseConversationFetchOptions = {
  source?: ConversationFetchSource | Ref<ConversationFetchSource>
}

const DEFAULT_COLLECTION_PATH = ConversationStorage.collection
const TEST_COLLECTION_PATH = 'test-conversations'

export function useConversationFetch(
  id: string | Ref<string | null | undefined> | null | undefined,
  options: UseConversationFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const conversationId = computed(() =>
    isRef(id) ? String(id.value || '').trim() : String(id || '').trim()
  )
  const sourceMode = computed<ConversationFetchSource>(() =>
    isRef(options.source) ? options.source.value : options.source ?? 'live'
  )
  const collectionPath = computed(() =>
    sourceMode.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  )

  const firestoreSource = computed(() => {
    if (!conversationId.value) return null
    return firestoreFetchDoc<Conversation>(collectionPath.value, conversationId.value)
  })

  const conversation = computed<Conversation | null>(() => {
    const entry = firestoreSource.value?.value
    if (!entry?.id) return null
    return entry
  })
  const pending = computed(() => {
    if (!conversationId.value) return false
    return firestoreSource.value?.value === undefined
  })

  return {
    conversation,
    pending,
  }
}
