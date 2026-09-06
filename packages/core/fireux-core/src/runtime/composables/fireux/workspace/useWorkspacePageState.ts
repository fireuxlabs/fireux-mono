import { useRoute, useState } from '#imports'
import { computed, type ComputedRef } from 'vue'
import { normalizeWorkspace } from './useWorkspace'

export type WorkspacePageState = Record<string, unknown> & {
  user?: Record<string, unknown>
  derived: Record<string, unknown>
}

const stateKey = (workspace: string, path: string) =>
  `fireux-workspace-page-state-${normalizeWorkspace(workspace) || 'unknown'}-${path}`

export function useWorkspacePageState(workspace: string): {
  state: ComputedRef<WorkspacePageState | null>
  publish: (state: WorkspacePageState) => void
  copy: () => Promise<void>
} {
  const route = useRoute()
  const pageState = useState<WorkspacePageState | null>(
    stateKey(workspace, route.path),
    () => null
  )

  return {
    state: computed(() => pageState.value),
    copy: async () => {
      if (!pageState.value) return
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            page: {
              path: route.path,
              workspace: normalizeWorkspace(workspace),
            },
            state: pageState.value,
          },
          null,
          2
        )
      )
    },
    publish: (state) => {
      pageState.value = state
    },
  }
}
