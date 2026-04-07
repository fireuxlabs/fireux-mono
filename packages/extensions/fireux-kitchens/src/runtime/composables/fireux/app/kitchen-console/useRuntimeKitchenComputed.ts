import { computed } from 'vue'
import { useActiveKitchen } from './useActiveKitchen'

export function useRuntimeKitchenComputed(
  runtimeKitchen = useActiveKitchen()
) {
  const hasActiveMenu = computed(() => false)

  const menuStatusLabel = computed(() => (hasActiveMenu.value ? 'Open' : 'Closed'))

  return {
    runtimeKitchen,
    hasActiveMenu,
    menuStatusLabel,
  }
}
