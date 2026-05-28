import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, type Ref } from 'vue'
import {
  type TranslationDocument,
} from '../../../../../models/translation.model'
import { translationDocumentPath } from '../utils/paths'

export function useTranslationDocumentCollection(options: {
  collectionPath?: string | Ref<string | null | undefined>
} = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = computed(() =>
    translationDocumentPath(
      typeof options.collectionPath === 'string'
        ? options.collectionPath
        : options.collectionPath?.value ?? undefined
    )
  )
  const translationDocuments =
    firestoreFetchCollection<TranslationDocument>(collectionPath)
  const count = computed(() => translationDocuments.value?.length ?? 0)

  return {
    collectionPath,
    translationDocuments,
    count,
  }
}
