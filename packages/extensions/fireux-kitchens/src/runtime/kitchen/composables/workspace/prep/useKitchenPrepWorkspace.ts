import { computed, inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

type KitchenPrepWorkspace = ReturnType<typeof createKitchenPrepWorkspace>
const workspaceKey: InjectionKey<KitchenPrepWorkspace> = Symbol(
  'KitchenPrepWorkspace'
)

function createKitchenPrepWorkspace() {
  const kitchen = useKitchenWorkspace()
  const { kitchenName } = kitchen
  const ready = computed(() => kitchen.outcome.value === 'ready')
  const createTo = '/workspace/kitchen/prep/recipes'

  const description = computed(
    () =>
      `Manage ${kitchenName.value ? `${kitchenName.value}'s` : "your Kitchen's"} preparations, recipes, ingredients and production`
  )

  return { description, ready, createTo }
}

/** Mount the shared Prep state once for the operational children. */
export function useKitchenPrepWorkspace() {
  const workspace = createKitchenPrepWorkspace()
  provide(workspaceKey, workspace)
  return { description: workspace.description }
}

export function useKitchenPrepWorkspaceState() {
  const workspace = inject(workspaceKey, null)
  if (!workspace)
    throw new Error('Prep children require their workspace owner.')
  return workspace
}
