import { computed, type Ref } from 'vue'
import { getReadOnlyKitchenScenario } from '../../../../dev/read-only-scenarios'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'

export function useRuntimeKitchenDocument(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  kitchenCollectionPath: Ref<string>
}) {
  const { kitchen: fetchKitchen } = useKitchenFetch()

  return computed(() => {
    if (params.isReadOnly.value) {
      if (!params.id.value) return null
      return getReadOnlyKitchenScenario(params.id.value).kitchen ?? null
    }
    if (!params.id.value) return null

    return (
      fetchKitchen(params.id.value, params.kitchenCollectionPath.value, {
        hydrate: true,
      }).value ?? null
    )
  })
}
