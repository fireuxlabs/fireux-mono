// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

export function useUserFetch(id: string | null | undefined) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const { data: coreUserRef } = useDocument<User | undefined>(
    id ? (doc(db, 'users', id) as any) : null
  )

  const { data: appUserRef } = useDocument<AppUser | undefined>(
    id && appId ? (doc(db, 'apps', appId, 'users', id) as any) : null
  )

  const coreUser = computed(() => coreUserRef.value ?? null)
  const appUser = computed(() => appUserRef.value ?? null)

  return { coreUser, appUser }
}
