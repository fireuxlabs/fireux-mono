// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type { Ref } from 'vue'
import type {
  AppProfileBase,
  ProfileBase,
  ProfileConfig,
} from '../../../../../../models/core/profile.model'

/**
 * Minimal profile fetch:
 * - Fires global + app listeners (when path pieces exist)
 * - Returns refs directly (no computed merge)
 */
export type ProfileRefs<
  TCore extends ProfileBase = ProfileBase,
  TApp extends AppProfileBase = AppProfileBase,
> = {
  coreProfile: Ref<TCore | undefined | null>
  appProfile: Ref<Partial<TApp> | undefined | null>
}

export function useProfileFetch<
  TCore extends ProfileBase = ProfileBase,
  TApp extends AppProfileBase = AppProfileBase,
>(
  id: string | null | undefined | Ref<string | null | undefined>,
  config: ProfileConfig
) {
  const appDb = useFirestore()
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value ? (doc(identityDb, config.collectionName, uid.value) as any) : null
  )

  /**
   * Canon: App profile overlay (domain deltas)
   * - Path: `apps/{appId}/{domainCollection}/{uid}` (e.g. `apps/misebox/chefs/{uid}`)
   * - This is the app-scoped domain profile layer for the current app, including global apps.
   * - The first scoped facade should usually live in the global app, then migrate or extend later
   *   when a dedicated app becomes real.
   */
  const appDoc = computed(() =>
    uid.value && appId
      ? (doc(appDb, 'apps', appId, config.collectionName, uid.value) as any)
      : null
  )

  const { data: coreProfile, pending: corePending } = useDocument<
    TCore | undefined
  >(coreDoc as any, {
    transform: (docSnap: DocumentSnapshot<TCore>) => {
      const raw = docSnap.data()
      if (!raw) return undefined
      return { ...(raw as any), id: docSnap.id } as TCore
    },
  } as any)

  const { data: appProfile, pending: appPending } = useDocument<
    Partial<TApp> | undefined
  >(appDoc as any, {
    transform: (docSnap: DocumentSnapshot<Partial<TApp>>) => {
      const raw = docSnap.data()
      if (!raw) return undefined
      return { ...(raw as any), id: docSnap.id } as Partial<TApp>
    },
  } as any)

  const profile: ProfileRefs<TCore, TApp> = { coreProfile, appProfile }
  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return { profile, pending }
}
