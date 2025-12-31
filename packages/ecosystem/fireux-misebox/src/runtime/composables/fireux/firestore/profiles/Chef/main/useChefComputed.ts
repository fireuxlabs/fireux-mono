import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model.ts'

/**
 * useChefComputed
 * - Stubbed computed helpers for Chef profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useChef() return
 */
export function useChefComputed(
  refs: ProfileRefs<ChefCore>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
