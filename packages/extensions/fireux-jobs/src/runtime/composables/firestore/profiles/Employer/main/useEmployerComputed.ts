import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

/**
 * useEmployerComputed
 * - Stubbed computed helpers for Employer profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useEmployer() return
 */
export function useEmployerComputed(
  refs: ProfileRefs<EmployerProfile>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
