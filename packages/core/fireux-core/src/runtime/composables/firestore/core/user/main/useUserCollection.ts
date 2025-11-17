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

  const global = useCollection<User>(collection(db, 'users') as any, {
    idField: 'id',
  })
  const local =
    isTenant && appId
      ? useCollection<AppUser>(collection(db, 'apps', appId, 'users') as any, {
          idField: 'id',
        })
      : null

  const users = computed<User[]>(() => {
    const base = global.value ?? []
    return base.map((entry: any) => ({
      ...entry,
      id: typeof entry?.id === 'string' ? entry.id : '',
    })) as User[]
  })

  return { users, global, local }
}
