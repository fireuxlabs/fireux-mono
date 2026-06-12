import { computed, isRef, type Ref } from 'vue'
import {
  useKitchenConsoleList,
  type KitchenConsoleListFilter,
} from '../index/useKitchenConsoleList'

type UseKitchenConsoleSourcesOptions = {
  filter?:
    | KitchenConsoleListFilter
    | Ref<KitchenConsoleListFilter | null | undefined>
    | null
}

export function useKitchenConsoleSources(
  options: UseKitchenConsoleSourcesOptions = {}
) {
  const targetFilter = computed<KitchenConsoleListFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return explicitFilter
  })
  const { kitchens: targetKitchens } = useKitchenConsoleList({
    filter: targetFilter,
  })

  return {
    targetKitchens,
  }
}
