import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { ReadOnlyDocumentLink } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { DocumentLink } from '../../../../../models/document-link.model'

const normalizeId = (value: unknown) => String(value || '').trim()

const toDocumentLink = (entry: ReadOnlyDocumentLink): DocumentLink => ({
  id: normalizeId(entry.id),
  portfolio_id: normalizeId(entry.portfolio_id),
  document_id: normalizeId(entry.document_id),
  target_type: normalizeId(entry.target_type) as DocumentLink['target_type'],
  target_id: normalizeId(entry.target_id),
  target_label: '',
  created: { at: {} as any, by: undefined, app_id: undefined },
  updated: { at: {} as any, by: undefined },
})

export function useDocumentLinkCollection(runtimePortfolio = useRuntimePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<DocumentLink[] | undefined> | null>

  watch(
    [runtimePortfolio.id, runtimePortfolio.mode],
    ([portfolioId, mode]) => {
      if (!portfolioId || mode === 'read-only') {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<DocumentLink>(`portfolios/${portfolioId}/document-links`)
    },
    { immediate: true }
  )

  const collection = computed<DocumentLink[]>(() => {
    if (runtimePortfolio.isReadOnly.value) {
      return (runtimePortfolio.scenario.value?.documentLinks ?? []).map((entry) =>
        toDocumentLink(entry)
      )
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collection,
  }
}
