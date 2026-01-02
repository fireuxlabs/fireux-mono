// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/useAgent.ts

import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  agentConfig,
  type AgentCore,
} from '../../../../../models/profiles/Agent/Agent.model'
import { useAgentComputed } from './main/useAgentComputed'
import { useAgentInterface } from './main/useAgentInterface'
import type { AgentCard } from '../../../../../types/profiles/AgentCard'
import { useAgentUpdate } from './main/useAgentUpdate'
import { useAgentCreate } from './main/useAgentCreate'

export type Agent = {
  user: unknown | null
  core: AgentCore | null
  app: Partial<AgentCore> | null
}

export type { AgentCore as AgentProfile, AgentCard }

export function useAgent() {
  const { profile: refs, pending } = useProfile<AgentCore>(agentConfig)
  const { coreProfile, appProfile } = refs

  // canonical user for UI layer
  const { coreUser } = useUser()

  const agent = computed<Agent>(() => ({
    user: (coreUser.value ?? null) as unknown,
    core: coreProfile.value ?? null,
    app: appProfile.value ?? null,
  }))

  const agentComputed = useAgentComputed(refs, pending)
  const ui = useAgentInterface(refs, coreUser)
  const update = useAgentUpdate(refs)
  const create = useAgentCreate()

  return {
    profile: refs,
    coreProfile,
    appProfile,
    agent,
    pending,

    ...agentComputed,
    ...ui,
    ...update,
    ...create,
  }
}
