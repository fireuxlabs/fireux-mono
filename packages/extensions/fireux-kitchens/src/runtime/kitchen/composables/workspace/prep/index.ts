import { computed, provide } from 'vue'
import { prepWorkspaceKey } from './state'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

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
export function useKitchenWorkspacePrep() {
  const workspace = createKitchenPrepWorkspace()
  provide(prepWorkspaceKey, workspace)
  return { description: workspace.description }
}
