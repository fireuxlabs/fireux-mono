import type { MaybeRefOrGetter } from 'vue'
import { usePropertiesWorkspaceDemoData } from '../../../../composables/fireux/workspace/shared/usePropertiesWorkspaceDemoData'

export function usePortfolioWorkspaceDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  return usePropertiesWorkspaceDemoData(active)
}
