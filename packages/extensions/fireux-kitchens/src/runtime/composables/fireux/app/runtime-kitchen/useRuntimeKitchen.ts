import { computed, unref, type Ref } from 'vue'
import { dummyKitchenScenario as readOnlyKitchenScenario } from '../../../../../../../../../dummy/scenario'
import { useKitchenIngredientFetch } from '../../firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import {
  normalizeMode,
  normalizeString,
  resolveRuntimeKitchenCollectionPath,
  type RuntimeKitchenMode,
} from './shared'
import { useRuntimeKitchenSelection } from './state'

export { useRuntimeKitchenSelection } from './state'
export type { RuntimeKitchenMode } from './shared'

type UseRuntimeKitchenParams = {
  kitchenId: string | Ref<string | null | undefined>
  mode: RuntimeKitchenMode | Ref<RuntimeKitchenMode | null | undefined>
}

/**
 * Runtime kitchen resolver
 *
 * Supports:
 * 1) useRuntimeKitchen()                      -> reads from global selection state
 * 2) useRuntimeKitchen({ kitchenId, mode })  -> explicit override
 */
export function useRuntimeKitchen(params?: UseRuntimeKitchenParams) {
  const selection = useRuntimeKitchenSelection()

  const kitchenIdSource = computed(() => {
    if (params?.kitchenId !== undefined) return unref(params.kitchenId)
    return selection.runtimeKitchenId.value
  })

  const modeSource = computed(() => {
    if (params?.mode !== undefined) return unref(params.mode)
    return selection.runtimeKitchenMode.value
  })

  const { kitchen: fetchKitchen } = useKitchenFetch()
  const id = computed(() => normalizeString(kitchenIdSource.value) || '')
  const mode = computed<RuntimeKitchenMode>(() => normalizeMode(modeSource.value) ?? 'read-only')
  const kitchenCollectionPath = computed(() => resolveRuntimeKitchenCollectionPath(mode.value))

  const kitchen = computed(() => {
    if (mode.value === 'read-only') return readOnlyKitchenScenario.kitchen
    if (!id.value) return null

    return (
      fetchKitchen(id.value, kitchenCollectionPath.value, {
        hydrate: mode.value !== 'test',
      }).value ?? null
    )
  })

  // Prevent Firestore kitchen-ingredient queries in read-only mode.
  const firestoreKitchenId = computed(() => (mode.value === 'read-only' ? '' : id.value))
  const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(
    firestoreKitchenId,
    {
      kitchenCollectionPath,
    }
  )

  const kitchenIngredients = computed(() => {
    if (mode.value === 'read-only') {
      return [...(readOnlyKitchenScenario.kitchenIngredients ?? [])]
    }
    return [...(firestoreKitchenIngredients.value ?? [])]
  })

  return {
    id,
    mode,
    kitchen,
    kitchenCollectionPath,
    data: {
      kitchenIngredients,
    },
  }
}
