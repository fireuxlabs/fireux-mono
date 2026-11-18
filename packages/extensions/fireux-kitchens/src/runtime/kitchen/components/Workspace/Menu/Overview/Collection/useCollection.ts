import { computed } from 'vue'
import { useKitchenWorkspaceMenuOverview } from '../../../../../composables/workspace/menu/overview'

export function useMenuOverviewCollection() {
  const { menusOutcome, visibleMenus, query, status, totalCount, palette } =
    useKitchenWorkspaceMenuOverview()
  const feedback = computed(() => {
    if (menusOutcome.value === 'idle' || menusOutcome.value === 'pending')
      return 'pending'
    if (menusOutcome.value === 'error') return 'error'
  })
  const emptyMessage = computed(() => {
    if (query.value.trim()) return 'No matching menus.'
    if (status.value === 'published') return 'No published menus yet.'
    if (status.value === 'draft') return 'No draft menus.'
    if (status.value === 'archived') return 'No archived menus.'
    if (totalCount.value)
      return 'No current menus. Choose Archived to view previous menus.'
    return 'No menus yet. Add your first menu to get started.'
  })
  return { feedback, visibleMenus, emptyMessage, palette }
}
