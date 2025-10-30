import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

export function useUserCollection() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const global = useCollection<User>(collection(db, 'users') as any)
  const local =
    isTenant && appId
      ? useCollection<AppUser>(collection(db, 'apps', appId, 'users') as any)
      : null

  const users = computed<User[]>(() => {
    const base = global.value ?? []
    const overlays = local?.value ?? []
    if (!overlays.length) return base

    return base.map((core) => {
      const overlay = overlays.find((entry) => entry.id === core.id)
      return overlay ? { ...core, appUser: overlay } : core
    })
  })

  return { users, global, local }
}
