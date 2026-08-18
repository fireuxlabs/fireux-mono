import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import { DocumentLinkStorage, type DocumentLink } from '../../../../../models/document-link.model'

const normalizeId = (value: unknown) => String(value || '').trim()
type DemoDocumentLink = Partial<Pick<
  DocumentLink,
  | 'id'
  | 'portfolio_id'
  | 'document_id'
  | 'target_type'
  | 'target_id'
>>

const isDocumentLinkTargetType = (
  value: unknown
): value is DocumentLink['target_type'] =>
  value === 'portfolio' ||
  value === 'property' ||
  value === 'unit' ||
  value === 'compliance-record' ||
  value === 'tenancy' ||
  value === 'task'
const demoDocumentLinks = (
  scenario: Record<string, unknown> | null
): DemoDocumentLink[] => {
  const links = scenario?.documentLinks
  return Array.isArray(links) ? links as DemoDocumentLink[] : []
}

const toDocumentLink = (entry: DemoDocumentLink): DocumentLink => ({
  id: normalizeId(entry.id),
  portfolio_id: normalizeId(entry.portfolio_id),
  document_id: normalizeId(entry.document_id),
  target_type: isDocumentLinkTargetType(entry.target_type)
    ? entry.target_type
    : 'portfolio',
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
 * It belongs to console/portfolio/operations/Documents, not root Firestore entity access.
 */
export function usePortfolioDocumentLinks(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<DocumentLink[] | undefined> | null>
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

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
      return demoDocumentLinks(runtimePortfolio.scenario.value).map((entry) =>
        toDocumentLink(entry)
      )
    }
    return sourceRef.value?.value ?? []
  })
  const { byId: documentLink } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    documentLink,
  }
}
