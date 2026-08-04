import { doc } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { EcosystemStorage } from '../../../../../../models/core/ecosystem.model'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from '../../../vuefire'

export function useEcosystemFetch(id: string | { value: string }) {
  if (import.meta.server) {
    return {
      ecosystem: ref<EcosystemSurface | null | undefined>(undefined),
      pending: ref(false),
    }
  }

  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())

  const ecosystemId = computed(() =>
    typeof id === 'string' ? String(id || '').trim() : String(id.value || '').trim()
  )

  const docRef = computed(() =>
    ecosystemId.value
      ? (doc(db, EcosystemStorage.collection, ecosystemId.value) as any)
      : null
  )

  const docState =
    useDocument<EcosystemSurface | undefined>(docRef as any, {
      transform: (docSnap: any) => {
        if (!docSnap?.exists?.()) return undefined
        const raw = docSnap.data()
        if (!raw) return undefined
        return {
          ...(raw as EcosystemSurface),
          id: String(docSnap.id || ecosystemId.value).trim(),
        }
      },
    } as any) || {
      data: ref<EcosystemSurface | undefined>(undefined),
      pending: ref(false),
    }

  const source = docState.data ?? ref<EcosystemSurface | undefined>(undefined)
  const pending = docState.pending ?? ref(false)

  const ecosystem = computed(() => {
    if (!ecosystemId.value) return undefined
    if (pending.value) return undefined

    const entry = source.value
    if (!entry) return null

    return {
      ...entry,
      id: String(entry.id || ecosystemId.value).trim(),
    }
  })

  return {
    ecosystem,
    pending,
  }
}
