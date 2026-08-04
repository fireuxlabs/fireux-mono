import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { ConversationMessageStorage, ConversationStorage } from '../../../../../../../models/operations/conversation.model'

const clean = (value: unknown) => String(value ?? '').trim()

export function useConversationPaths(
  appId?: MaybeRefOrGetter<string | null | undefined>
) {
  const fireux = useFireUXConfig()
  const resolvedAppId = computed(() => clean(toValue(appId)) || fireux.appId)
  const collectionPath = computed(() =>
    resolvedAppId.value
      ? `apps/${resolvedAppId.value}/${ConversationStorage.collection}`
      : ''
  )
  const messageCollectionPath = (
    conversationId: MaybeRefOrGetter<string | null | undefined>
  ) => computed(() => {
    const id = clean(toValue(conversationId))
    if (!collectionPath.value || !id) return ''

    return `${collectionPath.value}/${id}/${ConversationMessageStorage.collection}`
  })

  return {
    appId: resolvedAppId,
    collectionPath,
    messageCollectionPath,
  }
}
