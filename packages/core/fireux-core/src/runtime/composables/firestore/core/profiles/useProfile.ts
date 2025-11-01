// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import { useProfileEnsure } from './main/useProfileEnsure.ts'
import { useProfileDelete } from './main/useProfileDelete.ts'
import type { ProfileBase, ProfileConfig } from '../../../../models/core/profile.model.ts'

export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { coreProfile, appProfile } = useProfileFetch<TCore, TApp>(uid, {
    collectionName: config.collectionName,
  })

  return {
    coreProfile,
    appProfile,
    ...useProfileEnsure(coreProfile, config),
    ...useProfileDelete(coreProfile, config),
  }
}