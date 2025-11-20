// FILE: packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgent.ts

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import {
  agentConfig,
  type AgentProfile,
  type AgentCoreProfile,
  type AgentCard,
} from '../../../../models/profiles/Agent.model.ts'
import { useAgentComputed } from './main/useAgentComputed.ts'
import { useAgentInterface } from './main/useAgentInterface.ts'
import { useAgentUpdate } from './main/useAgentUpdate.ts'

export type { AgentProfile, AgentCoreProfile, AgentCard }

/**
 * useAgent
 * - Runtime facade for Agent profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profileCore, profileApp)
 *   - update helpers
 */
export function useAgent() {
  const { profile: refs, pending } = useProfile<AgentProfile>(agentConfig)
  const { coreProfile, appProfile } = refs

  // canonical user
  const { coreUser } = useUser()

  const computed = useAgentComputed(refs, pending)
  const ui = useAgentInterface(refs, coreUser)
  const update = useAgentUpdate(refs)

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    ...computed,
    ...ui,
    ...update,
  }
}
