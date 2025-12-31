import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'

/**
 * useProfessionalComputed
 * - Stubbed computed helpers for Professional profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useProfessional() return
 */
export function useProfessionalComputed(
  refs: ProfileRefs<ProfessionalCore>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
