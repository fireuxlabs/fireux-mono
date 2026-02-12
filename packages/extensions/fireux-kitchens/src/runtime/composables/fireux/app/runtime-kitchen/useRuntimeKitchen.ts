import { computed, unref, type Ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../../dummy/scenario'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import {
  normalizeMode,
  normalizeString,
  resolveRuntimeKitchenCollectionPath,
  type RuntimeKitchenMode,
} from './shared'
import { useRuntimeKitchenState } from './state'

export { useRuntimeKitchenSelection } from './state'
export type { RuntimeKitchenMode } from './shared'

export function useRuntimeKitchen(
  kitchenId?: string | Ref<string | null | undefined>,
  mode?: RuntimeKitchenMode | Ref<RuntimeKitchenMode | null | undefined>
) {
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const { runtimeKitchenIdState, runtimeKitchenModeState } = useRuntimeKitchenState()

  const kitchenIdValue = computed(() => normalizeString(unref(kitchenId)) || runtimeKitchenIdState.value || '')
  const modeValue = computed<RuntimeKitchenMode>(
    () => normalizeMode(unref(mode)) ?? runtimeKitchenModeState.value ?? 'dummy'
  )
  const isDummy = computed(() => modeValue.value === 'dummy')

  return computed(() => {
    if (isDummy.value) return dummyKitchenScenario.kitchen
    if (!kitchenIdValue.value) return null

    const collectionPath = resolveRuntimeKitchenCollectionPath(modeValue.value)
    return (
      fetchKitchen(kitchenIdValue.value, collectionPath, {
        hydrate: modeValue.value !== 'test',
      }).value ?? null
    )
  })
}
