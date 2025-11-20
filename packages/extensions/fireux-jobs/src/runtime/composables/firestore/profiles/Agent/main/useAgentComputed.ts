import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'

/**
 * useAgentComputed
 * - Stubbed computed helpers for Agent profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useAgent() return
 */
export function useAgentComputed(
  refs: ProfileRefs<AgentProfile>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
