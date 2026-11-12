// User-owned profile with optional App-specific state.
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useProfileFetch } from './useProfileFetch'
import type {
  ProfileAppStateBase,
  ProfileBase,
  ProfileConfig,
  ProfileRecord,
} from '../../models/profile.model'

/**
 * Unified Profile composable (core-only)
 * - Returns grouped User-owned profile and optional App-state refs
 * - No computed, no ensure/update/delete (handled by domain facades)
 */
export function useProfile<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = ProfileAppStateBase,
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile, pending } = useProfileFetch<TCore, TApp>(uid, config)

  return { profile, pending }
}
