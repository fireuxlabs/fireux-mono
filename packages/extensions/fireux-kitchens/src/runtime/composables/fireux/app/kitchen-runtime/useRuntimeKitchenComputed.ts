import { computed } from 'vue'
import { useRuntimeKitchen } from './useRuntimeKitchen'

export function useRuntimeKitchenComputed(
  runtimeKitchen = useRuntimeKitchen()
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
