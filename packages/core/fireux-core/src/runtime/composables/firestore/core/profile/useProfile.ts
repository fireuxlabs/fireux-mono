// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import type { Profile, ProfileConfig } from '../../../../models/core/profile.model.ts'
import type { Ref } from 'vue'

/**
 * Public API:
 * - Fetches one reactive `profile` (core + tenant overlay)
 * - Automatically injects the current user
 * - Generic so domain types (Professional, Employer, etc.) keep their fields
 */
export function useProfile<T extends Profile = Profile>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile } = useProfileFetch(uid.value, config)
  return { profile: profile as unknown as Ref<T | null> }
}