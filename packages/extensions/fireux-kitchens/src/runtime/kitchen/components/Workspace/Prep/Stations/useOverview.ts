import { computed } from 'vue'
import { useKitchenWorkspacePrepStations } from '../../../../composables/workspace/prep/children'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspacePrepStationsOverview() {
  const { summary } = useKitchenWorkspacePrepStations()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
