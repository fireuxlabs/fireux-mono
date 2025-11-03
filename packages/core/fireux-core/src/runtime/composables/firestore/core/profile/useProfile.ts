// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import type { Profile, ProfileConfig } from '../../../../models/core/profile.model.ts'

export function useProfile(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile } = useProfileFetch(uid.value, config.collectionName)
  return { profile: profile as Profile }
}