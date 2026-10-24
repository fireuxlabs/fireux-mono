import { useRoute, useState } from '#imports'
import { computed, onScopeDispose, watch, type ComputedRef } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { normalizeWorkspace, useWorkspace } from './useWorkspace'

export type WorkspacePageState = Record<string, unknown> & {
  user?: Record<string, unknown>
  derived: Record<string, unknown>
}

type Publication = { scope: string; value: WorkspacePageState }

/** Publishers own their lifetime; readers never clear another component's publication. */
export function useWorkspacePageState(workspace: string): {
  state: ComputedRef<WorkspacePageState | null>
  publish: (state: WorkspacePageState) => void
  copy: () => Promise<void>
} {
  const route = useRoute()
  const path = route.path
  const family = normalizeWorkspace(workspace)
  const config = useFireUXConfig()
  const { currentUser } = useAuth()
  const { selectedId } = useWorkspace(family)
  const scope = computed(() =>
    JSON.stringify([
      config.appId,
      currentUser.value?.uid || '',
      family,
      selectedId.value,
      route.fullPath,
    ])
  )
  const publication = useState<Publication | null>(
    `fireux-workspace-page-state-${config.appId}-${family}-${path}`,
    () => null
  )
  let owned: Publication | null = null
  let disposed = false
  const state = computed(() =>
    !disposed && route.path === path && publication.value?.scope === scope.value
      ? publication.value.value
      : null
  )
  watch(
    scope,
    () => {
      if (publication.value?.scope !== scope.value) publication.value = null
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
    if (owned && publication.value === owned) publication.value = null
  })

  return {
    state,
    copy: async () => {
      const value = state.value
      if (!value) return
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            page: { path, workspace: family },
            state: value,
          },
          null,
          2
        )
      )
    },
    publish: (value) => {
      if (disposed || route.path !== path) return
      publication.value = { scope: scope.value, value }
      // Keep the reactive identity so an old publisher cannot clear a newer one.
      owned = publication.value
    },
  }
}
