import { computed } from 'vue'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenSelection } from './useKitchenSelection'

/**
 * Live kitchen loader.
 * Loads the selected kitchen document from `kitchens/<id>`.
 */
export function useActiveKitchen() {
  const { selectedId: id } = useKitchenSelection()
  const { kitchen: liveKitchen, pending } = useKitchenFetch(id)

  const kitchen = computed(() => {
    if (!id.value) return null
    return liveKitchen.value ?? null
  })

  return {
    id,
    kitchen,
    pending,
  }
}
