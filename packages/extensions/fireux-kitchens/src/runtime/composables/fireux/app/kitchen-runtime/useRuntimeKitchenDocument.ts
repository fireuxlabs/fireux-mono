import { computed, type Ref } from 'vue'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { getReadOnlyKitchenScenario } from './read-only-scenarios'

export function useRuntimeKitchenDocument(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  collectionPath: Ref<string>
}) {
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const liveKitchen = fetchKitchen(params.id, params.collectionPath, {
    hydrate: true,
  })
  const readOnlyScenario = computed(() => {
    if (!params.isReadOnly.value || !params.id.value) return null
    return getReadOnlyKitchenScenario(params.id.value)
  })

  const doc = computed(() => {
    if (params.isReadOnly.value) return readOnlyScenario.value?.kitchen ?? null
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
