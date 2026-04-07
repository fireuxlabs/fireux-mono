import { computed } from 'vue'
import { useKitchenSelection } from './useKitchenSelection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'

export { useKitchenSelection } from './useKitchenSelection'
export type { RuntimeKitchenMode } from './shared'

/**
 * Live kitchen loader.
 * Loads the selected kitchen document from `kitchens/<id>`.
 */
export function useActiveKitchen() {
  const { selectedId: id } = useKitchenSelection()
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const liveKitchen = fetchKitchen(id, 'kitchens', { hydrate: true })
  const kitchen = computed(() => {
    if (!id.value) return null
    return liveKitchen.value ?? null
  })
  const pending = computed(() => Boolean(id.value) && liveKitchen.value === undefined)

  return {
    id,
    kitchen,
    pending,
  }
}
