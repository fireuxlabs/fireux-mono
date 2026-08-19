// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: skip root reads for app-private profiles.
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from '../../../vuefire'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from '../../../../../../app/composables/config/FireUXConfig'
import type { Ref } from 'vue'
import { AppStorage } from '../../../../../../app/models/app.model.ts'
import type {
  AppProfileBase,
  ProfileBase,
  ProfileConfig,
  ProfileRecord,
} from '../../../../../../models/utils/profile.model'

/**
 * Minimal profile fetch:
 * - Fires global + app listeners (when path pieces exist)
 * - Returns refs directly (no computed merge)
 */
export type ProfileRefs<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = AppProfileBase,
> = {
  coreProfile: Ref<TCore | undefined | null>
  appProfile: Ref<Partial<TApp> | undefined | null>
}

export function useProfileFetch<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = AppProfileBase,
>(
  id: string | null | undefined | Ref<string | null | undefined>,
  config: ProfileConfig
) {
  const appDb = useFirestore()
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value && config.storage !== 'app-only'
      ? (doc(identityDb, config.collectionName, uid.value) as any)
      : null
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
      ? (doc(appDb, AppStorage.collection, appId, config.collectionName, uid.value) as any)
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
