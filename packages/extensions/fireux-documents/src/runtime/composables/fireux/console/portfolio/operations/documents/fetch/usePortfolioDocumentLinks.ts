import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import type { DemoDocumentLink } from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/demo-scenarios'
import type { DocumentLink } from '../../../../../../../models/document-link.model'

const normalizeId = (value: unknown) => String(value || '').trim()

const toDocumentLink = (entry: DemoDocumentLink): DocumentLink => ({
  id: normalizeId(entry.id),
  portfolio_id: normalizeId(entry.portfolio_id),
  document_id: normalizeId(entry.document_id),
  target_type: normalizeId(entry.target_type) as DocumentLink['target_type'],
  target_id: normalizeId(entry.target_id),
  target_label: '',
  created: { at: {} as any, by: undefined, app_id: undefined },
  updated: { at: {} as any, by: undefined },
})

/**
 * FireUX stack family: Console operation record.
 * Entity: DocumentLink.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/composables/README.md
 *
 * This file reads Portfolio-scoped document attachment records for the selected /console/portfolio workspace.
 * It belongs to console/portfolio/operations/documents, not root Firestore entity access.
 */
export function usePortfolioDocumentLinks(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<DocumentLink[] | undefined> | null>
  const collectionPath = usePortfolioConsoleChildPath(runtimePortfolio, 'document-links')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<DocumentLink>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<DocumentLink[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      return (runtimePortfolio.scenario.value?.documentLinks ?? []).map((entry) =>
        toDocumentLink(entry)
      )
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collectionPath,
    collection,
  }
}
