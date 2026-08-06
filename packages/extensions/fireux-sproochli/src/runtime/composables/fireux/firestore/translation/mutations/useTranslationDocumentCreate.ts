import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  type TranslationDocumentCreateInput,
} from '../../../../../models/translation.model'
import {
  normalizeTranslationId,
  translationDocumentPath,
} from '../utils/paths'

export function useTranslationDocumentCreate(options: {
  collectionPath?: string
} = {}) {
  const create = useFirestoreClientCreate()
  const collectionPath = translationDocumentPath(options.collectionPath)

  async function createTranslationDocument(
    translationDocumentId: string,
    input: TranslationDocumentCreateInput
  ): Promise<string> {
    const id = normalizeTranslationId(translationDocumentId)
    if (!id) {
      throw new Error('[fireux-sproochli] translation document id is required.')
    }

    await create(
      defineRuntimeClientCreateTarget(
        'project.translation-documents',
        collectionPath
      ),
      input,
      { id, app: true, creator: true }
    )

    return id
  }

  return {
    createTranslationDocument,
  }
}
