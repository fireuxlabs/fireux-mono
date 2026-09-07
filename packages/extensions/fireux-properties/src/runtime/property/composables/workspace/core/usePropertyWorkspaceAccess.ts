import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'

/** Property selection follows the current AppUser relationship, never Team labels. */
export function usePropertyWorkspaceAccess() {
  const app = useAppSession()
  const ids = computed(() => [...new Set(app.appUser.value?.properties ?? [])])
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (app.pending.value) return 'pending'
    if (app.error.value) return 'error'
    return ids.value.length ? 'ready' : 'empty'
  })
  return { ids, outcome }
}
