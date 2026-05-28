import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed, type Ref } from 'vue'
import type { Translation } from '../../../../../models/translation.model'
import { translationChildPath } from '../utils/paths'

export function useTranslationCollection(
  translationDocumentId: string | Ref<string | null | undefined>,
  options: {
    collectionPath?: string | Ref<string | null | undefined>
  } = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = computed(() =>
    translationChildPath(
      typeof translationDocumentId === 'string'
        ? translationDocumentId
        : translationDocumentId.value,
      typeof options.collectionPath === 'string'
        ? options.collectionPath
        : options.collectionPath?.value ?? undefined
    )
  )
  const translations = firestoreFetchCollection<Translation>(collectionPath)
  const count = computed(() => translations.value?.length ?? 0)
  const { byId: translation } = useCollectionById(translations)

  return {
    collectionPath,
    translations,
    translation,
    count,
  }
}
