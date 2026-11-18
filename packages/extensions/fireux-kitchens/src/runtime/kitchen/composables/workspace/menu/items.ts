import { computed } from 'vue'
import { requireMenuWorkspace } from './state'

export function useKitchenWorkspaceMenuItems() {
  const { catalogue } = requireMenuWorkspace().overview
  return { summary: computed(() => catalogue.value.items) }
}
