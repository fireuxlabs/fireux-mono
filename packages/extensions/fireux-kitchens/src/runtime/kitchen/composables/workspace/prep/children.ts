import { computed } from 'vue'
import { requirePrepWorkspace } from './state'

export function useKitchenWorkspacePrepPreparations() {
  const { summaries } = requirePrepWorkspace()
  return { summary: computed(() => summaries.value.preparations) }
}

export function useKitchenWorkspacePrepRecipes() {
  const { summaries } = requirePrepWorkspace()
  return { summary: computed(() => summaries.value.recipes) }
}

export function useKitchenWorkspacePrepIngredients() {
  const { summaries } = requirePrepWorkspace()
  return { summary: computed(() => summaries.value.ingredients) }
}

export function useKitchenWorkspacePrepStations() {
  const { summaries } = requirePrepWorkspace()
  return { summary: computed(() => summaries.value.stations) }
}
