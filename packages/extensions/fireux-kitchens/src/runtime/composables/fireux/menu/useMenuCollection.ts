import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { PublicMenu } from './useMenuFetch'

export function useMenuCollection() {
  const state = useAsyncData(
    'menu-collection',
    () => $fetch<PublicMenu[]>('/api/menus')
  )
  const menus = computed(() => state.data.value ?? [])
  const count = computed(() => menus.value.length)

  return {
    menus,
    count,
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
  }
}
