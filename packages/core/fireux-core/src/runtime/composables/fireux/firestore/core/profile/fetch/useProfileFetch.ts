// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts
// Read one User-owned profile and its optional App-specific state.
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from '../../../vuefire'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from '../../../../../../app/composables/config/FireUXConfig'
import type { Ref } from 'vue'
import type {
  ProfileAppStateBase,
  ProfileBase,
  ProfileConfig,
  ProfileRecord,
} from '../../../../../../models/utils/profile.model'

/** Read one User-owned profile and its optional current-App state. */
export type ProfileRefs<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = ProfileAppStateBase,
> = {
  profile: Ref<TCore | undefined | null>
  appState: Ref<Partial<TApp> | undefined | null>
}

export function useProfileFetch<
  TCore extends ProfileRecord = ProfileBase,
  TApp extends ProfileRecord = ProfileAppStateBase,
>(
  id: string | null | undefined | Ref<string | null | undefined>,
  config: ProfileConfig
) {
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const profileDoc = computed(() =>
    uid.value
      ? (doc(identityDb, 'users', uid.value, 'profiles', config.kind) as any)
      : null
  )

  const appStateDoc = computed(() =>
    uid.value && appId && config.storage === 'user-with-app-state'
      ? (doc(
          identityDb,
          'users',
          uid.value,
          'profiles',
          config.kind,
          'app-state',
          appId
        ) as any)
      : null
  )

  const { data: profile, pending: profilePending } = useDocument<
    TCore | undefined
  >(profileDoc as any, {
    transform: (docSnap: DocumentSnapshot<TCore>) => {
      const raw = docSnap.data()
      if (!raw) return undefined
      return { ...(raw as any), id: uid.value } as TCore
    },
  } as any)

  const { data: appState, pending: appStatePending } = useDocument<
    Partial<TApp> | undefined
  >(appStateDoc as any, {
    transform: (docSnap: DocumentSnapshot<Partial<TApp>>) => {
      const raw = docSnap.data()
      if (!raw) return undefined
      return { ...(raw as any), id: docSnap.id } as Partial<TApp>
    },
  } as any)

  const refs: ProfileRefs<TCore, TApp> = { profile, appState }
  const pending = computed(
    () => Boolean(profilePending.value) || Boolean(appStatePending?.value)
  )

  return { profile: refs, pending }
}
