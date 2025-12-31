import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Agent } from './fireux/firestore/profiles/Agent/useAgent'
import { useAgent } from './fireux/firestore/profiles/Agent/useAgent'

export function useJobPermissions(agentRef?: Ref<Agent>) {
  const resolvedAgent = agentRef ?? useAgent().agent
  const canPostJob = computed(() => Boolean(resolvedAgent.value?.core))

  return { canPostJob }
}
