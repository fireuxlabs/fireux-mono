import { computed, type Ref } from 'vue'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { getDemoKitchenScenario } from './demo-scenarios'

export function useRuntimeKitchenDocument(params: {
  id: Ref<string>
  isDemo: Ref<boolean>
  documentCollectionPath: Ref<string>
}) {
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const liveKitchen = fetchKitchen(params.id, params.documentCollectionPath, {
    hydrate: true,
  })
  const demoScenario = computed(() => {
    if (!params.isDemo.value || !params.id.value) return null
    return getDemoKitchenScenario(params.id.value)
  })

  const doc = computed(() => {
    if (params.isDemo.value) return demoScenario.value?.kitchen ?? null
    if (!params.id.value) return null

    return liveKitchen.value ?? null
  })

  const pending = computed(() => {
    if (!params.id.value) return false
    if (params.isDemo.value) return false
    return liveKitchen.value === undefined
  })

  return {
    doc,
    pending,
  }
}
