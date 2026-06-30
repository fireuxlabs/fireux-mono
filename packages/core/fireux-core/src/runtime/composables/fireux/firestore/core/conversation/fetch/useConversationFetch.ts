import { computed, isRef, type Ref } from 'vue'
import type { Conversation } from '../../../../../../models/core/conversation.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useConversationPaths } from '../utils/paths/useConversationPaths'

type ConversationFetchSource = 'live' | 'test'

type UseConversationFetchOptions = {
  source?: ConversationFetchSource | Ref<ConversationFetchSource>
  appId?: string | Ref<string | null | undefined>
}

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
  const paths = useConversationPaths(options.appId)
  const collectionPath = computed(() =>
    sourceMode.value === 'test'
      ? paths.appId.value
        ? `apps/${paths.appId.value}/${TEST_COLLECTION_PATH}`
        : ''
      : paths.collectionPath.value
  )

  const firestoreSource = computed(() => {
    if (!conversationId.value || !collectionPath.value) return null
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
