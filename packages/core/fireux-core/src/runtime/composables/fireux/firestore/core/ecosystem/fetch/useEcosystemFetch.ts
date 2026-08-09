import { doc } from 'firebase/firestore'
import { computed, ref } from 'vue'
import {
  EcosystemStorage,
  type Ecosystem,
} from '../../../../../../models/core/ecosystem.model'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from '../../../vuefire'

export function useEcosystemFetch(id: string | { value: string }) {
  if (import.meta.server) {
    return {
      ecosystem: ref<Ecosystem | null | undefined>(undefined),
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
    useDocument<Ecosystem | undefined>(docRef as any, {
      transform: (docSnap: any) => {
        if (!docSnap?.exists?.()) return undefined
        const raw = docSnap.data()
        if (!raw) return undefined
        return {
          ...(raw as Ecosystem),
          id: String(docSnap.id || ecosystemId.value).trim(),
        }
      },
    } as any) || {
      data: ref<Ecosystem | undefined>(undefined),
      pending: ref(false),
    }

  const source = docState.data ?? ref<Ecosystem | undefined>(undefined)
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
