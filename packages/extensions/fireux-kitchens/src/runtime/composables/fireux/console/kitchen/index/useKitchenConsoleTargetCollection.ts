// Kitchen owns target projection; Core owns authenticated request lifecycle.
import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useConsoleTargetRequest } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargetRequest'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type {
  KitchenConsoleTargetItem,
} from '../../../../../models/kitchen/kitchen-index.model'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

export type UseKitchenConsoleTargetCollectionResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<ConsoleTargetOutcome>
  refresh: () => Promise<void>
}

export function useKitchenConsoleTargetCollection(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenConsoleTargetCollectionResult {
  const request = useConsoleTargetRequest<KitchenConsoleTargetItem>('kitchen', {
    enabled: options.enabled,
  })
  const { surface } = useKitchenInterface()
  const kitchens = computed<KitchenSurface[]>(() =>
    request.items.value.flatMap((target) => {
      const kitchen = surface({ kitchen: target, routeScope: 'live' })
      return kitchen ? [kitchen] : []
    })
  )

  return {
    kitchens,
    count: computed(() => kitchens.value.length),
    pending: request.pending,
    error: request.error,
    outcome: request.outcome,
    refresh: request.refresh,
  }
}
