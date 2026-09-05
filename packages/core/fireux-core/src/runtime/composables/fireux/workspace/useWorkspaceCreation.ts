import { computed } from 'vue'
import { useAppSession } from '../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from '../../../app/utils/app-subscription-capacity'
import { workspaceAllowanceUsed } from '../../../app/utils/workspace-allowance'
import { resolveWorkspaceCanCreate } from '../../../utils/workspace-policy'

export function useWorkspaceCreation(family: string) {
  const session = useAppSession()
  const config = useFireUXConfig()
  const ready = computed(() => !session.pending.value && !session.error.value)
  const enabled = resolveWorkspaceCanCreate(
    config.role,
    config.workspaceConfig,
    family
  )
  const atCapacity = computed(() => {
    if (!ready.value) return false
    const membership = session.membership.value
    const limit = appSubscriptionCapacity(
      config.subscriptionCapacity,
      family,
      membership?.subscription || 'free'
    )
    return limit !== null && workspaceAllowanceUsed(membership || {}) >= limit
  })
  const canCreate = computed(() => enabled && ready.value && !atCapacity.value)
  const showUpgrade = computed(() => enabled && ready.value && atCapacity.value)
  return { canCreate, showUpgrade }
}
