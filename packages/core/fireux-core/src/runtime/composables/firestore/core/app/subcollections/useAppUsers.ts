// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import type { AppUserDoc } from 'fireux-core/runtime/models/core/user.model.ts'

export function useAppUsers() {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const users = firestoreFetchCollection<AppUserDoc>(`apps/${appId}/users`)

  const count = computed(() => users.value?.length ?? 0)
  const admins = computed(() =>
    (users.value ?? []).filter((u) => u.role === 'admin')
  )

  return { users, count, admins }
}
