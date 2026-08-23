// Kitchen owns target projection; Core owns authenticated request lifecycle.
import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useWorkspaceTargetRequest } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTargetRequest'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDirectoryIndex'
import type { KitchenWorkspaceKitchen } from '../../../models/kitchen-index.model.ts'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../firestore/utils/view/useKitchenInterface'

export type UseKitchenWorkspaceTargetCollectionResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
  refresh: () => Promise<void>
}

export function useKitchenWorkspaceTargetCollection(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenWorkspaceTargetCollectionResult {
  const request = useWorkspaceTargetRequest<KitchenWorkspaceKitchen>(
    'kitchen',
    {
      enabled: options.enabled,
    }
  )
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
