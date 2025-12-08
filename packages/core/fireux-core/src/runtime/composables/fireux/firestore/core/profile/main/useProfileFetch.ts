// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
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
  id: string | null | undefined | Ref<string | null | undefined>,
  config: ProfileConfig
) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value ? (doc(db, config.collectionName, uid.value) as any) : null
  )

  const appDoc = computed(() =>
    uid.value && isTenant && appId
      ? (doc(db, 'apps', appId, config.collectionName, uid.value) as any)
      : null
  )

  const { data: coreProfile, pending: corePending } = useDocument<
    TProfile | undefined
  >(coreDoc as any)

  const { data: appProfile, pending: appPending } = useDocument<
    Partial<TProfile> | undefined
  >(appDoc as any)

  const profile: ProfileRefs<TProfile> = { coreProfile, appProfile }
  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return { profile, pending }
}
