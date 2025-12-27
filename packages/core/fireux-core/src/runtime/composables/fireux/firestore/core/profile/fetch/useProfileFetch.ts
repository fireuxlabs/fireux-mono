// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type { Ref } from 'vue'
import type {
  Profile,
  ProfileConfig,
} from '../../../../../../models/core/profile.model'

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

  /**
   * Canon: Tenant profile overlay (domain deltas)
   * - Path: `apps/{appId}/{domainCollection}/{uid}` (e.g. `apps/niederhorn/chefs/{uid}`)
   * - This IS a tenant delta layer for domain profiles (Chef/Agent/Supplier/Professional).
   * - We only read/write it when `isTenant === true` to avoid operator apps (e.g. `misebox-app`)
   *   accidentally behaving like a tenant.
   * - If you need to admin-fetch a specific tenant’s overlay while in ecosystem mode,
   *   do it via an explicit targetAppId/path (not via “current app hydration”).
   */
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
