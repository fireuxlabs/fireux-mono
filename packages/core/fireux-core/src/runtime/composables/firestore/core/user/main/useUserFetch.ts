// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value ? (doc(db, 'users', uid.value) as any) : null
  )

  const appDoc = computed(() =>
    uid.value && appId
      ? (doc(db, 'apps', appId, 'users', uid.value) as any)
      : null
  )

  const { data: coreUserRef } = useDocument<User | undefined>(coreDoc as any)

  const { data: appUserRef } = useDocument<AppUser | undefined>(appDoc as any)

  const coreUser = computed(() => coreUserRef.value ?? null)
  const appUser = computed(() => appUserRef.value ?? null)

  return { coreUser, appUser }
}
