import type { FireuxAppSubscriptionCapacity } from '../../../config/app/types'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppSession } from '../../app/composables/useAppSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from '../../app/utils/app-subscription-capacity'
import { resolveWorkspaceCanCreate } from '../utils/policy'
import type { WorkspaceOutcome } from '../models/outcome'

export type WorkspaceCreationUsage = {
  count: number
  outcome: WorkspaceOutcome
}

export function useWorkspaceCreation(
  family: string,
  usage: MaybeRefOrGetter<WorkspaceCreationUsage>,
  capacity?: FireuxAppSubscriptionCapacity
) {
  const session = useAppSession()
  const config = useFireUXConfig()
  const ready = computed(() => {
    if (session.pending.value || session.error.value) return false
    // Guests may enter the sign-in journey; the create command requires membership.
    if (!session.appUser.value) return true
    const current = toValue(usage)
    return (
      ['ready', 'empty'].includes(current.outcome) &&
      Number.isSafeInteger(current.count) &&
      current.count >= 0
    )
  })
  const enabled = resolveWorkspaceCanCreate(
    config.role,
    config.workspaceConfig,
    family
  )
  const atCapacity = computed(() => {
    if (!ready.value || !session.appUser.value) return false
    const membership = session.appUser.value
    const limit = appSubscriptionCapacity(
      capacity ?? config.subscriptionCapacity,
      family,
      membership?.subscription || 'free'
    )
    return limit !== null && toValue(usage).count >= limit
  })
  const canCreate = computed(() => enabled && ready.value && !atCapacity.value)
  const showUpgrade = computed(() => enabled && ready.value && atCapacity.value)
  return { canCreate, showUpgrade, creationEnabled: computed(() => enabled) }
}
