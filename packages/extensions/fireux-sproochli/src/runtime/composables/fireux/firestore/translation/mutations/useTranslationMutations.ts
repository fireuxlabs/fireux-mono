import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  type Translation,
  type TranslationCreateInput,
  type TranslationUpdateInput,
} from '../../../../../models/translation.model'
import { normalizeTranslationId, translationChildPath } from '../utils/paths'

export function useTranslationMutations(
  options: {
    collectionPath?: string
  } = {}
) {
  const { createDocument: create } = useFirestoreCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { deleteDocument } = useFirestoreDelete()

  const path = (translationDocumentId: string) =>
    translationChildPath(translationDocumentId, options.collectionPath)

  async function createTranslation(
    translationDocumentId: string,
    input: TranslationCreateInput
  ): Promise<string> {
    const collectionPath = path(translationDocumentId)
    const languageCode = normalizeTranslationId(input.language_code)

    if (!collectionPath) {
      throw new Error('[fireux-sproochli] translation document id is required.')
    }
    if (!languageCode) {
      throw new Error('[fireux-sproochli] language code is required.')
    }

    await create(
      collectionPath,
      {
        ...input,
        language_code: languageCode,
      },
      { id: languageCode, app: true, creator: true }
    )

    return languageCode
  }

  async function updateTranslation(
    translationDocumentId: string,
    languageCode: string,
    patch: TranslationUpdateInput
  ): Promise<void> {
    const collectionPath = path(translationDocumentId)
    const id = normalizeTranslationId(languageCode)

    if (!collectionPath || !id) {
      throw new Error('[fireux-sproochli] translation id is required.')
    }

    await updateDocument<Translation>(collectionPath, id, patch)
  }

  async function deleteTranslation(
    translationDocumentId: string,
    languageCode: string
  ): Promise<void> {
    const collectionPath = path(translationDocumentId)
    const id = normalizeTranslationId(languageCode)

    if (!collectionPath || !id) {
      throw new Error('[fireux-sproochli] translation id is required.')
    }

    await deleteDocument(collectionPath, id)
  }

  return {
    createTranslation,
    updateTranslation,
    deleteTranslation,
  }
}
