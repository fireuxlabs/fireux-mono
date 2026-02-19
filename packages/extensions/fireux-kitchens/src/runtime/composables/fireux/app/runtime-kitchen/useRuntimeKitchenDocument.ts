import { computed, type Ref } from 'vue'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { getReadOnlyKitchenScenario } from './read-only-scenarios'

export function useRuntimeKitchenDocument(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  kitchenCollectionPath: Ref<string>
}) {
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const liveKitchen = fetchKitchen(params.id, params.kitchenCollectionPath, {
    hydrate: true,
  })

  return computed(() => {
    if (params.isReadOnly.value) {
      if (!params.id.value) return null
      return getReadOnlyKitchenScenario(params.id.value).kitchen ?? null
    }
    if (!params.id.value) return null

    return liveKitchen.value ?? null
  })
}
