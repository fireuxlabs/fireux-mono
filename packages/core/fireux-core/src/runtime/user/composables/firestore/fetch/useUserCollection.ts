// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: add bounded canonical User hydration by profile uid.
import { collection, query as fsq, type Query, type QueryDocumentSnapshot } from 'firebase/firestore'
import { computed, ref, type Ref } from 'vue'
import type { User } from '../../../models/user.model.ts'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useCollection,
  useFirestore,
} from '../../../../composables/fireux/firestore/vuefire'

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
      users: ref([] as User[]),
      count: ref(0),
      pending: ref(false),
      error: ref(undefined),
    }
  }

  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const binding = useCollection<User>(
    fsq(collection(db, 'users')) as Query<User>,
    {
      ssrKey: 'users',
      transform: (docSnap: QueryDocumentSnapshot<User>) => {
        return { ...(docSnap.data() as User), id: docSnap.id } as User
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

/**
 * Hydrates canonical User identity for domain rows whose document ids are UIDs.
 * Uses exact document reads so a profile collection never expands into a full
 * User collection scan.
 */
export function useUserHydration(
  ids: Ref<(string | null | undefined)[]>
) {
  const databaseId = readRuntimeIdentityFirestoreDatabaseId()
  const { firestoreLoadDocsByIds } = useFirestoreRead({ databaseId })
  const binding = firestoreLoadDocsByIds<User>({
    collectionPath: 'users',
    ids,
  })
  const users = computed(() => binding.docs.value ?? [])
  const usersById = computed(() =>
    new Map(users.value.map((user) => [user.id, user]))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined

  return {
    users,
    usersById,
    userById,
    pending: binding.pending,
    error: binding.error,
    outcome: binding.outcome,
  }
}
