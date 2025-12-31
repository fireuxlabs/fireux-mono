import { computed, shallowRef, watch } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export interface UsePlaceCollectionOptions {
  keyword?: string | null | undefined | Ref<string | null | undefined>
  type?: string | null | undefined | Ref<string | null | undefined>
  types?: string[]
}

function isRefLike<T>(value: unknown): value is Ref<T> {
  return !!value && typeof value === 'object' && 'value' in (value as any)
}

export function usePlaceCollection<T extends Record<string, any> = Record<string, any>>(
  options: UsePlaceCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreManager()
  const configuredTypes = usePlaceTypesConfig()

  const keyword = computed<string | null | undefined>(() => {
    const raw = options.keyword ?? options.type
    if (isRefLike<string | null | undefined>(raw)) return raw.value
    return raw
  })

  const types = computed<string[]>(() => options.types ?? configuredTypes)

  const collectionPath = computed(() =>
    toPlaceCollectionPath(keyword.value, types.value)
  )

  const collectionRef = shallowRef(null) as ShallowRef<Ref<T[] | undefined> | null>
  watch(
    collectionPath,
    (path: string) => {
      collectionRef.value = firestoreFetchCollection<T>(path)
    },
    { immediate: true }
  )

  const collection = computed(() => collectionRef.value?.value)
  const count = computed(() => (collection.value ?? []).length)

  return { collectionPath, collection, count }
}
