import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  normalizeTranslationId,
  translationDocumentPath,
} from '../utils/paths'

export function useTranslationDocumentDelete(options: {
  collectionPath?: string
} = {}) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = translationDocumentPath(options.collectionPath)

  async function deleteTranslationDocument(
    translationDocumentId: string
  ): Promise<void> {
    const id = normalizeTranslationId(translationDocumentId)
    if (!id) {
      throw new Error('[fireux-sproochli] translation document id is required.')
    }

    await deleteDocument(collectionPath, id)
  }

  return {
    deleteTranslationDocument,
  }
}
