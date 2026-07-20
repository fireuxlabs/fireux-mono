// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: allow app-private records through the shared profile seam.
import { useAuth } from '../../../firebase/useAuth'
import { useProfileFetch } from './fetch/useProfileFetch'
import type {
  AppProfileBase,
  ProfileBase,
  ProfileConfig,
  ProfileRecord,
} from '../../../../../models/core/profile.model'

/**
 * Unified Profile composable (core-only)
 * - Returns grouped profile refs (core/app)
 * - No computed, no ensure/update/delete (handled by domain facades)
 */
export function useProfile<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = AppProfileBase,
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile, pending } = useProfileFetch<TCore, TApp>(uid, config)

  return { profile, pending }
}
