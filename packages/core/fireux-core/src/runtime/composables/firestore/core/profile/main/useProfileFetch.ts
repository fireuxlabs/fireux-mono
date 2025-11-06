// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { Ref } from 'vue'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

/**
 * Minimal profile fetch:
 * - Fires global + app listeners (when path pieces exist)
 * - Returns refs directly (no computed merge)
 */
export type ProfileRefs<TProfile extends Profile = Profile> = {
  coreProfile: Ref<TProfile | undefined | null>
  appProfile: Ref<Partial<TProfile> | undefined | null>
}

export function useProfileFetch<TProfile extends Profile = Profile>(
  id: string | null | undefined,
  config: ProfileConfig
) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const { data: coreProfile } = useDocument<TProfile | undefined>(
    id ? (doc(db, config.collectionName, id) as any) : null
  )

  const { data: appProfile } = useDocument<Partial<TProfile> | undefined>(
    id && isTenant && appId
      ? (doc(db, 'apps', appId, config.collectionName, id) as any)
      : null
  )

  const profile: ProfileRefs<TProfile> = { coreProfile, appProfile }
  return { profile }
}
