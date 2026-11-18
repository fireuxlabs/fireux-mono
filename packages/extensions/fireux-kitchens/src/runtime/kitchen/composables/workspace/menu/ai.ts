import { requireMenuWorkspace } from './state'
import { useFoodOverviewAI } from './ai-request'

export function useKitchenWorkspaceMenuAi() {
  const { kitchenId, ready, overview } = requireMenuWorkspace().overview
  return { ...useFoodOverviewAI({ kitchenId, ready, overview }), ready }
}
