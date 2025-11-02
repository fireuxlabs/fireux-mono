// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { computed } from 'vue'

import { useAuth } from '../../../firebase/useAuth.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import { useProfileEnsure } from './main/useProfileEnsure.ts'
import { useProfileDelete } from './main/useProfileDelete.ts'
import type { ProfileBase, ProfileConfig } from '../../../../models/core/profile.model.ts'

export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const { coreProfile, appProfile } = useProfileFetch<TCore, TApp>(uid, {
    collectionName: config.collectionName,
  })

  type CollectionRef<T> = ReturnType<typeof firestoreFetchCollection<T>>

  const profile = computed(() => {
    const currentUid = uid.value
    if (!currentUid) return null

    const core = coreProfile.value ?? null
    const app = isTenant ? appProfile.value ?? null : undefined

    const flattened: Record<string, unknown> = {
      id: currentUid,
      core,
      ...(isTenant ? { app: app ?? null } : {}),
    }

    if (core && typeof core === 'object') Object.assign(flattened, core as object)
    if (isTenant && app && typeof app === 'object') Object.assign(flattened, app as object)

    return flattened as unknown as TCore & {
      id: string
      core: TCore | null
      app?: TApp | null
    }
  })

  const collectionLocal = isTenant && appId
    ? firestoreFetchCollection<TApp>(`apps/${appId}/${config.collectionName}`)
    : null

  let collectionGlobal: CollectionRef<TCore> | null
  if (isTenant) {
    collectionGlobal = null
  } else {
    collectionGlobal = firestoreFetchCollection<TCore>(config.collectionName)
  }

  const fetchGlobal = () => {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection<TCore>(config.collectionName)
    return collectionGlobal
  }

  return {
    profile,
    coreProfile,
    appProfile,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    ...useProfileEnsure(profile, config),
    ...useProfileDelete(profile, config),
  }
}