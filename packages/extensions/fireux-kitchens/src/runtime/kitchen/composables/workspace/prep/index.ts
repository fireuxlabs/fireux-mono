import { computed, inject, provide, ref, type InjectionKey } from 'vue'
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

  const description = computed(() => {
    const name = kitchen.data.value?.name
    return `Manage ${name ? `${name}'s` : "your Kitchen's"} preparations, recipes, ingredients and production`
  })

  return { description, summaries, overview }
}

const prepOverviewKey: InjectionKey<
  ReturnType<typeof createKitchenPrepWorkspace>['overview']
> = Symbol('KitchenPrepOverview')

export function useKitchenPrepOverview() {
  const overview = inject(prepOverviewKey, null)
  if (!overview) throw new Error('Prep overview requires its workspace owner.')
  return overview
}

/** Mount the Prep reads once for the overview and its summary cards. */
export function useKitchenWorkspacePrep() {
  const workspace = createKitchenPrepWorkspace()
  provide(prepOverviewKey, workspace.overview)
  return { description: workspace.description, summaries: workspace.summaries }
}
