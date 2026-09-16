import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'

/** Resolve the routed slug to the stable Menu identity used by data commands. */
export function useKitchenWorkspaceMenuRecord() {
  const state = useKitchenWorkspaceMenus()
  const menuSlug = useRouteParam('menuSlug')
  const menu = computed(() => state.pending.value || state.error.value
    ? null
    : state.rawMenus.value.find(item => item.slug === menuSlug.value) ?? null)
  const menuId = computed(() => menu.value?.id || '')
  return { ...state, menu, menuId, menuSlug }
}
