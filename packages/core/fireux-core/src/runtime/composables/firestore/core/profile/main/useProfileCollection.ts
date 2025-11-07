import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

export function useProfileCollection<TProfile extends Profile = Profile>(
  config: ProfileConfig
) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const global = useCollection<TProfile>(
    collection(db, config.collectionName) as any
  )

  const local =
    isTenant && appId
      ? useCollection<Partial<TProfile>>(
          collection(db, 'apps', appId, config.collectionName) as any
        )
      : null

  const profiles = computed<TProfile[]>(() => {
    const coreList = (global.value ?? []) as TProfile[]
    const overlayList = (local?.value ?? []) as Partial<TProfile>[]

    if (!overlayList.length) return coreList

    const overlayById = new Map<string, Partial<TProfile>>()
    for (const overlay of overlayList) {
      const id = (overlay as any)?.id ?? (overlay as any)?.uid
      if (id) overlayById.set(id, overlay)
    }

    const merged = coreList.map((core) => {
      const id = (core as any)?.id ?? (core as any)?.uid
      const overlay = id ? overlayById.get(id) : undefined
      if (overlay) {
        overlayById.delete(id)
        return { ...core, ...overlay } as TProfile
      }
      return core
    })

    if (!overlayById.size) return merged

    const extras = Array.from(overlayById.entries()).map(
      ([id, overlay]) => ({ id, ...(overlay as object) } as TProfile)
    )

    return [...merged, ...extras]
  })

  return { profiles, global, local }
}
