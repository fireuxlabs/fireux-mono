import { computed, type Ref } from 'vue'
import { useFirestoreRead } from '../fireux/firestore/operations/useFirestoreRead'

export function useDevStorageCollection<T>(collectionPath: Ref<string> | string) {
  const { firestoreFetchCollection } = useFirestoreRead()

  const resolvedCollectionPath = computed(() =>
    String(typeof collectionPath === 'string' ? collectionPath : collectionPath.value || '').trim()
  )

  const source = firestoreFetchCollection<T>(resolvedCollectionPath)
  const items = computed<T[]>(() => source.value ?? [])

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
