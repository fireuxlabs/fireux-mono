import { collection } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useCollection,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../../../models/core/profile.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

export function useProfileCollection<
  TProfile extends ProfileBase = ProfileBase
>(config: ProfileConfig) {
  const appDb = useFirestore()
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const identityDb = useFirestore(identityDatabaseId)
  const { appId } = useFireUXConfig()

  const idFieldOptions = { idField: 'id' } as Record<string, unknown>

  const globalProfiles = useCollection<TProfile>(
    collection(identityDb, config.collectionName) as any,
    idFieldOptions as any
  )

  const localProfiles =
    appId
      ? useCollection<Partial<TProfile>>(
          collection(appDb, AppStorage.collection, appId, config.collectionName) as any,
          idFieldOptions as any
        )
      : null

  const pending = computed(() =>
    globalProfiles.pending.value || Boolean(localProfiles?.pending.value)
  )
  const error = computed<unknown | undefined>(() =>
    globalProfiles.error.value ?? localProfiles?.error.value
  )
  const count = computed(() =>
    (globalProfiles.value?.length ?? 0) + (localProfiles?.value?.length ?? 0)
  )
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    globalProfiles,
    localProfiles,
    pending,
    error,
    outcome,
  }
}
