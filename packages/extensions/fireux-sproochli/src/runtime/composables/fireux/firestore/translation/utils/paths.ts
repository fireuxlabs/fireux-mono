import {
  TranslationDocumentStorage,
  TranslationStorage,
} from '../../../../../models/translation.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export const translationDocumentPath = (
  collectionPath: string | null | undefined = TranslationDocumentStorage.collection
) => normalizeString(collectionPath) || TranslationDocumentStorage.collection

export const translationChildPath = (
  translationDocumentId: unknown,
  collectionPath: string | null | undefined = TranslationDocumentStorage.collection
) => {
  const documentId = normalizeString(translationDocumentId)
  const basePath = translationDocumentPath(collectionPath)

  return documentId
    ? `${basePath}/${documentId}/${TranslationStorage.collection}`
    : ''
}

export const normalizeTranslationId = normalizeString
