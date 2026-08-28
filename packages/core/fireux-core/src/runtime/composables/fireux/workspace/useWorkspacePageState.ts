import { useState } from '#imports'
import { computed, type ComputedRef } from 'vue'
import { normalizeWorkspace } from './useWorkspace'

export type WorkspacePageState = {
  user: Record<string, unknown>
  entity: Record<string, unknown> | null
  derived: Record<string, unknown>
}

const stateKey = (workspace: string) =>
  `fireux-workspace-page-state-${normalizeWorkspace(workspace) || 'unknown'}`

export function useWorkspacePageState(workspace: string): {
  state: ComputedRef<WorkspacePageState | null>
  publish: (state: WorkspacePageState) => void
} {
  const pageState = useState<WorkspacePageState | null>(
    stateKey(workspace),
    () => null
  )

  return {
    state: computed(() => pageState.value),
    publish: (state) => {
      pageState.value = state
    },
  }
}
