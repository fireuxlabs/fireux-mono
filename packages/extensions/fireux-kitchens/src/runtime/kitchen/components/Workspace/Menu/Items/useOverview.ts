import { computed } from 'vue'
import { requireMenuWorkspace } from '../../../../composables/workspace/menu/state'
import { overviewSummary } from '../../../../utils/overview-summary'

export function useKitchenWorkspaceMenuItemsOverview() {
  const { catalogue } = requireMenuWorkspace().overview
  const overview = computed(() => overviewSummary(catalogue.value.items))
  return { overview }
}
