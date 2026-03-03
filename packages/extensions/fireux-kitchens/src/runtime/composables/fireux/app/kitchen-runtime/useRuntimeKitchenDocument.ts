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

  const doc = computed(() => {
    if (params.isReadOnly.value) {
      if (!params.id.value) return null
      return getReadOnlyKitchenScenario(params.id.value).kitchen ?? null
    }
    if (!params.id.value) return null

    return liveKitchen.value ?? null
  })

  const pending = computed(() => {
    if (!params.id.value) return false
    if (params.isReadOnly.value) return false
    return liveKitchen.value === undefined
  })

  return {
    doc,
    pending,
  }
}
