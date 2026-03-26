import { computed, shallowRef, watch, type Ref } from 'vue'
import { useFirestoreRead } from '../fireux/firestore/operations/useFirestoreRead'

export function useDevStorageCollection<T>(collectionPath: Ref<string> | string) {
  const { firestoreFetchCollection } = useFirestoreRead()

  const resolvedCollectionPath = computed(() =>
    String(typeof collectionPath === 'string' ? collectionPath : collectionPath.value || '').trim()
  )

  const sourceRef = shallowRef<Ref<T[] | undefined> | null>(null)

  watch(
    resolvedCollectionPath,
    (nextPath) => {
      sourceRef.value = nextPath ? firestoreFetchCollection<T>(nextPath) : null
    },
    { immediate: true }
  )

  const items = computed<T[]>(() => sourceRef.value?.value ?? [])

  return {
    collectionPath: resolvedCollectionPath,
    items,
  }
}

export function buildDevCollectionSnapshot(
  path: string,
  items: Record<string, unknown>[]
) {
  return {
    path,
    count: items.length,
    ids: items
      .map((item) => String((item as any)?.id || '').trim())
      .filter(Boolean),
    items,
  }
}
