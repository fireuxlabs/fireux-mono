import { ref, isRef, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type UserIdSource = string | Ref<string | null | undefined>

export function useUserFetch(id: UserIdSource) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const idRef: Ref<string | null | undefined> = isRef(id) ? id : ref(id)

  const { data: user } = useDocument<User>(() => {
    const targetId = idRef.value
    return targetId ? (doc(db, 'users', targetId) as any) : null
  })

  const { data: appUser } = useDocument<AppUser>(() => {
    const targetId = idRef.value
    if (!(targetId && isTenant && appId)) return null
    return doc(db, 'apps', appId, 'users', targetId) as any
  })

  return { user, appUser }
}
