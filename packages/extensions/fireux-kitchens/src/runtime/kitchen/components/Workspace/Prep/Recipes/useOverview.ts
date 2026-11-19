import { computed } from 'vue'
import { useKitchenWorkspacePrepRecipes } from '../../../../composables/workspace/prep/children'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspacePrepRecipesOverview() {
  const { summary } = useKitchenWorkspacePrepRecipes()
  const overview = computed(() => overviewSummary(summary.value))
  return { overview }
}
