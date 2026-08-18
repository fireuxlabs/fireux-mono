import { computed } from 'vue'
import type { Ref } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import type { AgentState } from '../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'

export type JobAuthorReadiness =
  | 'loading'
  | 'unavailable'
  | 'needs-app-membership'
  | 'needs-agent-profile'
  | 'needs-agent-app-support'
  | 'ready'

export function useJobPermissions(
  agentRef?: Ref<AgentState>,
  agentPendingRef?: Ref<boolean>
) {
  const localAgent = agentRef ? null : useAgent()
  const resolvedAgent = agentRef ?? localAgent!.agent
  const resolvedAgentPending =
    agentPendingRef ?? localAgent?.pending ?? computed(() => false)
  const { appUser, appOutcome } = useUser()

  const hasAppMembership = computed(() => {
    const role = appUser.value?.role
    return role === 'user' || role === 'admin'
  })
  const hasAgentProfile = computed(() => Boolean(resolvedAgent.value?.core?.id))
  const hasAgentAppSupport = computed(() =>
    Boolean(
      resolvedAgent.value?.app?.id && appUser.value?.profiles.includes('agent')
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
    if (!hasAgentAppSupport.value) return 'needs-agent-app-support'
    return 'ready'
  })
  const canPostJob = computed(() => authorReadiness.value === 'ready')
  const isChecking = computed(() => authorReadiness.value === 'loading')

  return {
    authorReadiness,
    canPostJob,
    hasAgentAppSupport,
    hasAgentProfile,
    hasAppMembership,
    isChecking,
  }
}
