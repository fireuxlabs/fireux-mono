// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileFetch.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from '../../user/useUser.ts'
import type { Profile, ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

export function useProfileFetch(
  id: string | null | undefined,
  config: ProfileConfig
) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { user } = useUser()

  if (!id) {
    const profile = computed<Profile | null>(() => null)
    return { profile }
  }

  const { data: coreRef } = useDocument<Profile | undefined>(
    doc(db, config.collectionName, id) as any
  )

  const { data: appRef } = useDocument<Record<string, unknown> | undefined>(
    isTenant && appId ? (doc(db, 'apps', appId, config.collectionName, id) as any) : null
  )

  const profile = computed<Profile | null>(() => {
    const core = coreRef.value
    if (!core) return null

    const u = user.value
    const minimalUser = u
      ? { id: u.id, display_name: u.display_name, avatar: u.avatar, handle: (u as any).handle }
      : {}

    return { ...core, ...(appRef.value ?? {}), user: minimalUser } as Profile
  })

  return { profile }
}