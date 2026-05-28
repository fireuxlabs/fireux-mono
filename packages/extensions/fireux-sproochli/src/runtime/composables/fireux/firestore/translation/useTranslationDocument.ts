import type { Ref } from 'vue'
import type { TranslationDocument } from '../../../../models/translation.model'
import { useTranslationDocumentCollection } from './fetch/useTranslationDocumentCollection'
import { useTranslationDocumentFetch } from './fetch/useTranslationDocumentFetch'
import { useTranslationCollection } from './fetch/useTranslationCollection'
import { useTranslationDocumentCreate } from './mutations/useTranslationDocumentCreate'
import { useTranslationDocumentDelete } from './mutations/useTranslationDocumentDelete'
import { useTranslationDocumentUpdate } from './mutations/useTranslationDocumentUpdate'
import { useTranslationMutations } from './mutations/useTranslationMutations'

export type { TranslationDocument }

export {
  useTranslationDocumentCollection,
  useTranslationDocumentFetch,
  useTranslationCollection,
  useTranslationDocumentCreate,
  useTranslationDocumentDelete,
  useTranslationDocumentUpdate,
  useTranslationMutations,
}

export function useTranslationDocument(id: string | Ref<string>) {
  const fetched = useTranslationDocumentFetch(id)

  return {
    ...fetched,
    ...useTranslationDocumentCollection(),
    ...useTranslationCollection(id),
    ...useTranslationDocumentCreate(),
    ...useTranslationDocumentDelete(),
    ...useTranslationDocumentUpdate(),
    ...useTranslationMutations(),
  }
}
