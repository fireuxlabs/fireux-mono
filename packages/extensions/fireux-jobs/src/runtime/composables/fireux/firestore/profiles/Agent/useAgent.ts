// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/useAgent.ts

import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { agentConfig } from './config/agentConfig'
import type { Agent, AppAgent } from '../../../../../models/profiles/Agent/Agent.model'
import { useAgentComputed } from './utils/view/useAgentComputed'
import { useAgentInterface, type AgentCard } from './utils/view/useAgentInterface'
import { useAgentUpdate } from './mutations/useAgentUpdate'
import { useAgentCreate } from './mutations/useAgentCreate'
import { useAgentSeo } from './utils/useAgentSeo'

export type AgentState = {
  user: unknown | null
  core: Agent | null
  app: Partial<AppAgent> | null
}

export type { Agent, AgentCard }

export function useAgent() {
  const { profile: refs, pending } = useProfile<Agent, AppAgent>(agentConfig)
  const { coreProfile, appProfile } = refs

  // canonical user for UI layer
  const { coreUser } = useUser()

  const agent = computed<AgentState>(() => ({
    user: (coreUser.value ?? null) as unknown,
    core: coreProfile.value ?? null,
    app: appProfile.value ?? null,
  }))

  const agentComputed = useAgentComputed(refs, pending)
  const ui = useAgentInterface(refs, coreUser)
  const update = useAgentUpdate(refs)
  const create = useAgentCreate()

  return {
    profileRefs: refs,
    coreProfile,
    appProfile,
    agent,
    pending,

    ...agentComputed,
    ...ui,
    ...update,
    ...create,
    useAgentSeo,
  }
}
