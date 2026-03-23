import { doc as firestoreDoc, type DocumentSnapshot } from 'firebase/firestore'
import { computed, type Ref } from 'vue'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Portfolio } from '../../../../models/portfolio.model'
import {
  getReadOnlyPortfolioScenario,
  type ReadOnlyPortfolioScenario,
} from './read-only-scenarios'

export function useRuntimePortfolioDocument(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  documentCollectionPath: Ref<string>
}) {
  const db = useFirestore()

  const docRef = computed(() => {
    if (params.isReadOnly.value) return null
    if (!params.id.value) return null
    const path = String(params.documentCollectionPath.value || '').trim()
    if (!path) return null
    return firestoreDoc(db, path, params.id.value)
  })

  const { data: liveDoc } = useDocument<Portfolio | undefined>(docRef as any, {
    transform: (docSnap: DocumentSnapshot<Portfolio>) => {
      const raw = docSnap.data()
      if (!raw) return undefined
      return { ...(raw as any), id: docSnap.id } as Portfolio
    },
  } as any)

  const scenario = computed<ReadOnlyPortfolioScenario | null>(() => {
    if (!params.isReadOnly.value || !params.id.value) return null
    return getReadOnlyPortfolioScenario(params.id.value)
  })

  const doc = computed<Portfolio | null>(() => {
    if (!params.id.value) return null
    if (params.isReadOnly.value) return scenario.value?.portfolio ?? null
    return liveDoc.value ?? null
  })

  const pending = computed(() => {
    if (!params.id.value) return false
    if (params.isReadOnly.value) return false
    return liveDoc.value === undefined
  })

  return {
    doc,
    pending,
    scenario,
  }
}
