// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/useAgent.ts

import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  agentConfig,
  type Agent,
  type AgentProfile,
} from '../../../../../models/profiles/Agent/Agent.model'
import { useAgentComputed } from './main/useAgentComputed'
import { useAgentInterface } from './main/useAgentInterface'
import type { AgentCard } from './main/useAgentInterface'
import { useAgentUpdate } from './main/useAgentUpdate'
import { useAgentCreate } from './main/useAgentCreate'

export type { AgentProfile, AgentCard }

export function useAgent() {
  const { profile: refs, pending } = useProfile<AgentProfile>(agentConfig)
  const { coreProfile, appProfile } = refs

  // canonical user for UI layer
  const { coreUser } = useUser()

  const agent = computed<Agent>(() => ({
    user: coreUser.value ?? null,
    core: coreProfile.value ?? null,
    app: appProfile.value ?? null,
  }))

  const agentComputed = useAgentComputed(refs, pending)
  const { profile: profileCard, ...ui } = useAgentInterface(refs, coreUser)
  const update = useAgentUpdate(refs)
  const create = useAgentCreate()

  return {
    profile: refs,
    coreProfile,
    appProfile,
    agent,
    pending,
    profileCard,

    ...agentComputed,
    ...ui,
    ...update,
    ...create,
  }
}
