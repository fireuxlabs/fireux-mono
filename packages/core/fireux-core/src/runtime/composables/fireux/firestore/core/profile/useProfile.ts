// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth'
import { useProfileFetch } from './fetch/useProfileFetch'
import type {
  AppProfileBase,
  CoreProfileBase,
  ProfileConfig,
} from '../../../../../models/core/profile.model'

/**
 * Unified Profile composable (core-only)
 * - Returns grouped profile refs (core/app)
 * - No computed, no ensure/update/delete (handled by domain facades)
 */
export function useProfile<
  TCore extends CoreProfileBase = CoreProfileBase,
  TApp extends AppProfileBase = AppProfileBase,
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile, pending } = useProfileFetch<TCore, TApp>(uid, config)

  return { profile, pending }
}


