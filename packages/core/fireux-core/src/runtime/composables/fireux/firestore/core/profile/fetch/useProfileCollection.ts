// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: prevent app-private collection reads from the root database.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: join canonical User by uid and keep overlays out of root public collections.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: reserve this raw Firestore seam for app-only private profiles.
import { collection } from 'firebase/firestore'
import {
  useCollection,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import type {
  ProfileBase,
  ProfileConfig,
  ProfileRecord,
} from '../../../../../../models/core/profile.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

export function useProfileCollection<
  TProfile extends ProfileRecord = ProfileBase
>(config: ProfileConfig) {
  if (config.storage !== 'app-only') {
    throw new Error(
      `[useProfileCollection] ${config.collectionName} is public; use its bounded public profile projection.`
    )
  }

  const appDb = useFirestore()
  const { appId } = useFireUXConfig()

  const idFieldOptions = { idField: 'id' } as Record<string, unknown>

  const globalProfiles = computed<TProfile[]>(() => [])
  const localSource = computed(() =>
    appId
      ? collection(appDb, AppStorage.collection, appId, config.collectionName)
      : null
  )

  const localProfiles = useCollection<Partial<TProfile>>(
    localSource as any,
    idFieldOptions as any
  )

  const pending = computed(() => localProfiles.pending.value)
  const error = computed<unknown | undefined>(() => localProfiles.error.value)
  const count = computed(() => localProfiles.value?.length ?? 0)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  const profileUsers = computed(() => [])
  const usersById = computed(() => new Map<string, never>())
  const userById = (_id: string | null | undefined) => undefined

  return {
    globalProfiles,
    localProfiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
