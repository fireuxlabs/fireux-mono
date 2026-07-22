import type { MaybeRefOrGetter } from 'vue'
import { usePropertiesConsoleDemoData } from '../../shared/usePropertiesConsoleDemoData'

export function usePortfolioConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  return usePropertiesConsoleDemoData(active)
}
