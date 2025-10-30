import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

import type { ProfileFetchResult } from './useProfileFetch.ts'

export function useProfileCollection<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const global = useCollection<TCore>(
    collection(db, config.collectionName) as any
  )

  const local =
    isTenant && appId
      ? useCollection<TApp>(
          collection(db, 'apps', appId, config.collectionName) as any
        )
      : null

  const profiles = computed<ProfileFetchResult<TCore, TApp>[]>(() => {
    const base = global.value ?? []
    const overlays = local?.value ?? []

    if (!base.length) return []

    return base.reduce<ProfileFetchResult<TCore, TApp>[]>((acc, core) => {
      if (!core) return acc
      const overlay = overlays.find((entry) => entry?.id === core.id) ?? null

      const record: ProfileFetchResult<TCore, TApp> = {
        id: core.id,
        core,
        app: overlay,
      } as ProfileFetchResult<TCore, TApp>

      Object.assign(record, core)
      if (overlay && isTenant) Object.assign(record, overlay)

      acc.push(record)
      return acc
    }, [])
  })

  const fetchGlobal = () => global

  return { profiles, global, local, fetchGlobal }
}
