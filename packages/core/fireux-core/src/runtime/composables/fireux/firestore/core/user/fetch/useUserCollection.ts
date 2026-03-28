import { collection, query as fsq, type Query, type QueryDocumentSnapshot } from 'firebase/firestore'
import { computed, ref, type Ref } from 'vue'
import type { CoreUser } from '../../../../../../models/core/user.model'
import { useCollection, useFirestore } from '../../../vuefire'

function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardCollectionPromise(
  state: { promise?: Ref<Promise<unknown>> },
  context: string
) {
  const promise = state.promise?.value
  if (!promise || typeof promise.catch !== 'function') return

  promise.catch((error) => {
    if (!import.meta.dev) return
    if (isOfflineFirestoreError(error)) {
      console.warn(`[useUserCollection] offline read ignored (${context})`, error)
      return
    }
    console.error(`[useUserCollection] read failed (${context})`, error)
  })
}

/**
 * Streams the canonical `/users` collection.
 */
export function useUserCollection() {
  if (import.meta.server) {
    return {
      users: ref([] as CoreUser[]),
      count: ref(0),
      pending: ref(false),
      error: ref(undefined),
    }
  }

  const db = useFirestore()
  const binding = useCollection<CoreUser>(
    fsq(collection(db, 'users')) as Query<CoreUser>,
    {
      ssrKey: 'users',
      transform: (docSnap: QueryDocumentSnapshot<CoreUser>) => {
        return { ...(docSnap.data() as CoreUser), id: docSnap.id } as CoreUser
      },
    } as any
  )
  guardCollectionPromise(binding as any, 'users')

  const users = computed(() => binding.data.value ?? [])
  const count = computed(() => users.value.length)
  const pending = binding.pending ?? ref(false)
  const error = binding.error ?? ref(undefined)

  return {
    users,
    count,
    pending,
    error,
  }
}
