import type { MaybeRefOrGetter } from 'vue'
import { usePropertiesConsoleDemoData } from '../../../../composables/fireux/console/shared/usePropertiesConsoleDemoData'

export function usePortfolioConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  return usePropertiesConsoleDemoData(active)
}
