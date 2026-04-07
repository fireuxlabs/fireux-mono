import { computed } from 'vue'
import { useActiveKitchen } from './useActiveKitchen'

export function useRuntimeKitchenComputed(
  runtimeKitchen = useActiveKitchen()
) {
  const hasActiveMenu = computed(() =>
    (runtimeKitchen.data.value.menus ?? []).some((menu) => Boolean(menu?.active))
  )

  const menuStatusLabel = computed(() => (hasActiveMenu.value ? 'Open' : 'Closed'))

  return {
    runtimeKitchen,
    hasActiveMenu,
    menuStatusLabel,
  }
}
