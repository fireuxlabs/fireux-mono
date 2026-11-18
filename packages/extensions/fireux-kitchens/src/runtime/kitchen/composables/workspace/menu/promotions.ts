import { computed } from 'vue'
import { requireMenuWorkspace } from './state'

export function useKitchenWorkspaceMenuPromotions() {
  const { catalogue } = requireMenuWorkspace().overview
  return { summary: computed(() => catalogue.value.promotions) }
}
