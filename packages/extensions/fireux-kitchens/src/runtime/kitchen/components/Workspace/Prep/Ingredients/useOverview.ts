import { computed } from 'vue'
import { useKitchenWorkspacePrepIngredients } from '../../../../composables/workspace/prep/children'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspacePrepIngredientsOverview() {
  const { summary } = useKitchenWorkspacePrepIngredients()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
