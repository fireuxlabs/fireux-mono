import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { Agent } from '../../../../../../models/profiles/Agent/Agent.model'

/**
 * useAgentComputed
 * - Stubbed computed helpers for Agent profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useAgent() return
 */
export function useAgentComputed(
  refs: ProfileRefs<Agent>,
  pending?: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
