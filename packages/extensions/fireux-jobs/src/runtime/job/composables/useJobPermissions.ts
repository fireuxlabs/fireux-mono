import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AgentState } from '../../user/composables/profiles/Agent/useAgent'
import { useAgent } from '../../user/composables/profiles/Agent/useAgent'

export type JobAuthorReadiness =
  | 'loading'
  | 'unavailable'
  | 'needs-app-membership'
  | 'needs-agent-profile'
  | 'needs-agent-capability'
  | 'ready'

export function useJobPermissions(
  agentRef?: Ref<AgentState>,
  agentPendingRef?: Ref<boolean>
) {
  const localAgent = agentRef ? null : useAgent()
  const resolvedAgent = agentRef ?? localAgent!.agent
  const resolvedAgentPending =
    agentPendingRef ?? localAgent?.pending ?? computed(() => false)
  const { appUser, appOutcome } = useUserSession()
  const config = useFireUXConfig()

  const hasAppMembership = computed(() => {
    const role = appUser.value?.role
    return role === 'user' || role === 'admin' || role === 'dev'
  })
  const hasAgentProfile = computed(() => Boolean(resolvedAgent.value?.profile?.id))
  const hasAgentCapability = computed(() =>
    Boolean(
      config.profiles.includes('agent')
    )
  )
  const authorReadiness = computed<JobAuthorReadiness>(() => {
    if (
      resolvedAgentPending.value ||
      appOutcome.value === 'idle' ||
      appOutcome.value === 'pending'
    ) {
      return 'loading'
    }
    if (appOutcome.value === 'error') return 'unavailable'
    if (appOutcome.value !== 'ready' || !hasAppMembership.value) {
      return 'needs-app-membership'
    }
    if (!hasAgentProfile.value) return 'needs-agent-profile'
    if (!hasAgentCapability.value) return 'needs-agent-capability'
    return 'ready'
  })
  const canPostJob = computed(() => authorReadiness.value === 'ready')
  const isChecking = computed(() => authorReadiness.value === 'loading')

  return {
    authorReadiness,
    canPostJob,
    hasAgentCapability,
    hasAgentProfile,
    hasAppMembership,
    isChecking,
  }
}
