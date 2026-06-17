import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { PublicMenu } from './usePublicMenuFetch'

export function usePublicMenuCollection() {
  const state = useAsyncData(
    'public-menus',
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
