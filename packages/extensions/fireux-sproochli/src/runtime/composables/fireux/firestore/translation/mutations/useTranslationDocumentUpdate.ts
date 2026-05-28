import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  type TranslationDocument,
  type TranslationDocumentUpdateInput,
} from '../../../../../models/translation.model'
import {
  normalizeTranslationId,
  translationDocumentPath,
} from '../utils/paths'

export function useTranslationDocumentUpdate(options: {
  collectionPath?: string
} = {}) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = translationDocumentPath(options.collectionPath)

  async function updateTranslationDocument(
    translationDocumentId: string,
    patch: TranslationDocumentUpdateInput
  ): Promise<void> {
    const id = normalizeTranslationId(translationDocumentId)
    if (!id) {
      throw new Error('[fireux-sproochli] translation document id is required.')
    }

    await updateDocument<TranslationDocument>(collectionPath, id, patch)
  }

  return {
    updateTranslationDocument,
  }
}
