import { computed, provide, ref } from 'vue'
import { prepWorkspaceKey } from './state'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { createPrepSummaries } from './summaries'

function createKitchenPrepWorkspace() {
  const kitchen = useKitchenWorkspace()
  const kitchenId = computed(() =>
    kitchen.outcome.value === 'ready' ? kitchen.id.value : ''
  )
  const { summaries, preparations } = createPrepSummaries(
    kitchenId,
    kitchen.outcome
  )
  const query = ref('')
  const summary = computed(() => summaries.value.preparations)
  const results = computed(() => {
    if (summary.value.outcome !== 'ready') return []
    const search = query.value.trim().toLocaleLowerCase()
    return preparations.value.filter(({ name, description }) =>
      [name, description].some((text) =>
        text?.toLocaleLowerCase().includes(search)
      )
    )
  })
  const overview = { query, summary, results }
  const ready = computed(() => kitchen.outcome.value === 'ready')
  const createTo = '/workspace/kitchen/prep/recipes'

  const description = computed(() => {
    const name = kitchen.data.value?.name
    return `Manage ${name ? `${name}'s` : "your Kitchen's"} preparations, recipes, ingredients and production`
  })

  return { description, ready, createTo, summaries, overview }
}

/** Mount the shared Prep state once for the operational children. */
export function useKitchenWorkspacePrep() {
  const workspace = createKitchenPrepWorkspace()
  provide(prepWorkspaceKey, workspace)
  return { description: workspace.description }
}
