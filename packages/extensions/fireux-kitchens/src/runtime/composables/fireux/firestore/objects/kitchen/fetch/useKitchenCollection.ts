import { computed, shallowRef, watch } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'

export function useKitchenCollection<
  T extends Record<string, any> = Record<string, any>,
>(collectionPath = 'kitchens') {
  const { firestoreFetchCollection } = useFirestoreManager()

  const path = computed(() => collectionPath)

  const collectionRef = shallowRef(null) as ShallowRef<
    Ref<T[] | undefined> | null
  >
  watch(
    path,
    (nextPath: string) => {
      collectionRef.value = firestoreFetchCollection<T>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed(() => collectionRef.value?.value)
  const count = computed(() => (collection.value ?? []).length)

  return { collectionPath: path, collection, count }
}
