import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AgentState } from './fireux/firestore/profiles/Agent/useAgent'
import { useAgent } from './fireux/firestore/profiles/Agent/useAgent'

export function useJobPermissions(agentRef?: Ref<AgentState>) {
  const resolvedAgent = agentRef ?? useAgent().agent
  const canPostJob = computed(() => Boolean(resolvedAgent.value?.core))

  return { canPostJob }
}
