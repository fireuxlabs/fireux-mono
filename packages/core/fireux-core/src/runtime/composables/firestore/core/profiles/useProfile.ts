import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import { useProfileComputed } from './main/useProfileComputed.ts'
import { useProfileEnsure } from './main/useProfileEnsure.ts'
import { useProfileDelete } from './main/useProfileDelete.ts'
import { useProfileCollection } from './main/useProfileCollection.ts'
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../models/core/profile.model.ts'

/**
 * Sleek public entry — same vibe as `useUser()` / `useApp()`.
 * Call with the profile collection you want (e.g., { id: 'chef', collectionName: 'chefs' }).
 */
export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile } = useProfileFetch<TCore, TApp>(uid, {
    collectionName: config.collectionName,
  })
  const collection = useProfileCollection<TCore, TApp>(config)

  return {
    profile,
    collection,
    ...useProfileComputed(profile, config),
    ...useProfileEnsure(profile, config),
    ...useProfileDelete(profile, config),
  }
}
