import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/useMembershipAccess'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { portfolioAccessCollection } from '../../../utils/access'

/** Live Portfolio access is independent of the organisational Team. */
export function usePortfolioWorkspaceAccess() {
  const app = useAppSession()
  const config = useFireUXConfig()
  const access = useMembershipAccess(
    () => portfolioAccessCollection(config.appId),
    app.uid,
    app.appUser
  )
  const ids = computed(() =>
    app.pending.value || app.error.value ? [] : access.ids.value
  )
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (app.pending.value || access.pending.value) return 'pending'
    if (app.error.value || access.error.value) return 'error'
    return ids.value.length ? 'ready' : 'empty'
  })
  return { ids, outcome }
}
