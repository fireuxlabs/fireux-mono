import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, type Ref } from 'vue'
import type { TranslationDocument } from '../../../../../models/translation.model'
import {
  normalizeTranslationId,
  translationDocumentPath,
} from '../utils/paths'

export function useTranslationDocumentFetch(
  translationDocumentId: string | Ref<string | null | undefined>,
  options: {
    collectionPath?: string | Ref<string | null | undefined>
  } = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const collectionPath = computed(() =>
    translationDocumentPath(
      typeof options.collectionPath === 'string'
        ? options.collectionPath
        : options.collectionPath?.value ?? undefined
    )
  )
  const documentId = computed(() =>
    normalizeTranslationId(
      typeof translationDocumentId === 'string'
        ? translationDocumentId
        : translationDocumentId.value
    )
  )
  const source = firestoreFetchDoc<TranslationDocument>(
    collectionPath,
    documentId
  )
  const translationDocument = computed(() => source.value ?? null)

  return {
    collectionPath,
    translationDocument,
    exists: computed(() => Boolean(translationDocument.value)),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
