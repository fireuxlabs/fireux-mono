import { doc, getDoc, type Firestore } from 'firebase/firestore'
import { computed, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import { attachDevCollectionMeta } from '../../../dev/useDevCollectionJson'
import { isOfflineFirestoreError } from './firestore-read-errors'
import type { FirestoreReadOutcome } from './useFirestoreRead'

type MaybeRef<T> = T | Ref<T>

export type FirestoreLoadDocsByIdsOptions = {
  collectionPath: string | Ref<string | null | undefined>
  ids: MaybeRef<(string | number | null | undefined)[] | null | undefined>
}

export function createFirestoreExactDocLoader<T>(input: {
  resolveDb: () => Firestore
  databaseId?: string | Ref<string | null | undefined> | null
  options: FirestoreLoadDocsByIdsOptions
}): {
  docs: Ref<T[] | undefined>
  pending: Ref<boolean>
  error: Ref<unknown | undefined>
  outcome: ComputedRef<FirestoreReadOutcome>
} {
  const { resolveDb } = input
  const { collectionPath, ids } = input.options
  const docs = ref<T[] | undefined>(undefined) as Ref<T[] | undefined>
  const pending = ref(false)
  const error = ref<unknown>()
  let requestId = 0

  const normalizedCollectionPath = computed(() =>
    String(unref(collectionPath) || '').trim()
  )
  const normalizedDatabaseId = computed(() =>
    String(unref(input.databaseId) || '').trim()
  )
  const normalizedIds = computed(() => {
    const values = unref(ids) ?? []
    return Array.from(
      new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))
    )
  })
  const active = computed(() =>
    Boolean(normalizedCollectionPath.value && normalizedIds.value.length)
  )
  const outcome = computed<FirestoreReadOutcome>(() => {
    if (!active.value) return 'idle'
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return docs.value?.length ? 'ready' : 'empty'
  })

  watch(
    () => ({
      collectionPath: normalizedCollectionPath.value,
      databaseId: normalizedDatabaseId.value,
      ids: normalizedIds.value,
    }),
    async ({ collectionPath, ids }: {
      collectionPath: string
      databaseId: string
      ids: string[]
    }) => {
      const currentRequestId = ++requestId
      if (!collectionPath || !ids.length) {
        docs.value = []
        pending.value = false
        error.value = undefined
        return
      }
      if (import.meta.server) {
        docs.value = undefined
        pending.value = true
        error.value = undefined
        return
      }

      docs.value = undefined
      pending.value = true
      error.value = undefined
      try {
        const snapshots = await Promise.all(
          ids.map((id) => getDoc(doc(resolveDb(), collectionPath, id)))
        )
        if (currentRequestId !== requestId) return
        docs.value = snapshots.reduce<T[]>((acc, snapshot) => {
          const raw = snapshot.data()
          if (!raw) return acc
          const value = {
            ...(raw as Record<string, unknown>),
            id: snapshot.id,
          } as unknown as T & Record<string, unknown>
          acc.push(
            attachDevCollectionMeta(value, collectionPath, snapshot.id) as T
          )
          return acc
        }, [])
      } catch (failure) {
        if (import.meta.dev) {
          const label = isOfflineFirestoreError(failure)
            ? 'unavailable while offline'
            : 'failed'
          const method = isOfflineFirestoreError(failure) ? 'warn' : 'error'
          workspace[method](
            `[useFirestoreRead] exact-doc read ${label} (${collectionPath})`,
            failure
          )
        }
        if (currentRequestId === requestId) {
          docs.value = undefined
          error.value = failure
        }
      } finally {
        if (currentRequestId === requestId) pending.value = false
      }
    },
    { immediate: true, deep: true }
  )

  return { docs, pending, error, outcome }
}
