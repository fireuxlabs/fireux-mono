import { computed, isRef, type Ref } from 'vue'
import type {
  Conversation,
  ConversationKind,
  ConversationStatus,
} from '../../../../../../models/core/conversation.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useConversationPaths } from '../utils/paths/useConversationPaths'

type ConversationCollectionSource = 'live' | 'test'

type ConversationCollectionFilter = {
  appId?: string | null
  kind?: ConversationKind | null
  status?: ConversationStatus | null
  participantId?: string | null
  relatedEntityId?: string | null
}

type UseConversationCollectionOptions = {
  source?: ConversationCollectionSource | Ref<ConversationCollectionSource>
  filter?: ConversationCollectionFilter | Ref<ConversationCollectionFilter | null | undefined>
}

const TEST_COLLECTION_PATH = 'test-conversations'

const clean = (value: unknown) => String(value || '').trim()

export function useConversationCollection(
  options: UseConversationCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceMode = computed<ConversationCollectionSource>(() =>
    isRef(options.source) ? options.source.value : options.source ?? 'live'
  )
  const filter = computed<ConversationCollectionFilter>(() =>
    isRef(options.filter) ? options.filter.value ?? {} : options.filter ?? {}
  )
  const paths = useConversationPaths(computed(() => filter.value.appId))
  const collectionPath = computed(() =>
    sourceMode.value === 'test'
      ? paths.appId.value
        ? `apps/${paths.appId.value}/${TEST_COLLECTION_PATH}`
        : ''
      : paths.collectionPath.value
  )
  const firestoreSource = computed(() =>
    firestoreFetchCollection<Conversation>(collectionPath.value)
  )

  const conversations = computed<Conversation[]>(() => {
    const appId = clean(filter.value.appId)
    const participantId = clean(filter.value.participantId)
    const relatedEntityId = clean(filter.value.relatedEntityId)
    const kind = clean(filter.value.kind)
    const status = clean(filter.value.status)

    return (firestoreSource.value.value ?? []).filter((conversation) => {
      if (!clean(conversation.id)) return false
      if (appId && conversation.app_id !== appId) return false
      if (kind && conversation.kind !== kind) return false
      if (status && conversation.status !== status) return false
      if (participantId && !conversation.participant_ids.includes(participantId)) return false
      if (relatedEntityId && conversation.related_entity.id !== relatedEntityId) return false
      return true
    })
  })

  const count = computed(() => conversations.value.length)
  const pending = computed(() => firestoreSource.value.value === undefined)

  return {
    conversations,
    count,
    pending,
  }
}
