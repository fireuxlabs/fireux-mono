import { computed } from 'vue'
import { useKitchenWorkspacePrepPreparations } from '../../../../composables/workspace/prep/children'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspacePrepPreparationsOverview() {
  const { summary } = useKitchenWorkspacePrepPreparations()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
