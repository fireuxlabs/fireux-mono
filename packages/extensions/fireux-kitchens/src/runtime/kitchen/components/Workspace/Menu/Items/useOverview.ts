import { computed } from 'vue'
import { useKitchenWorkspaceMenuItems } from '../../../../composables/workspace/menu/items'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspaceMenuItemsOverview() {
  const { summary } = useKitchenWorkspaceMenuItems()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
