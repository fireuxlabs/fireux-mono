import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'

export function useCompanyCollection<
  T extends Record<string, any> = Record<string, any>,
>(collectionPath = 'companies') {
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