import { computed } from 'vue'
import { useKitchenWorkspaceMenuPromotions } from '../../../../composables/workspace/menu/promotions'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspaceMenuPromotionsOverview() {
  const { summary } = useKitchenWorkspaceMenuPromotions()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
