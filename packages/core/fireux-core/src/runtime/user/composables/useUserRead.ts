import { computed, isRef, ref, type Ref } from 'vue'
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { readRuntimeIdentityFirestoreDatabaseId, useDocument, useFirestore } from '../../composables/fireux/firestore/vuefire'
import type { User } from '../models/user.model'
import { normalizeUser } from '../utils/normalize-user'

/** Live read of exactly one root User document. */
export function useUserRead(id: string | null | undefined | Ref<string | null | undefined>) {
  if (import.meta.server) return {
    user: ref<User | undefined>(),
    pending: ref(false),
    error: ref<unknown>(null),
    outcome: ref<'idle'>('idle'),
  }
  const userId = computed(() => String(isRef(id) ? id.value || '' : id || '').trim())
  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const reference = computed(() => userId.value ? doc(db, 'users', userId.value) : null)
  const state = useDocument<User | undefined>(reference as any, {
    transform: (snapshot: DocumentSnapshot<User>) => {
      const raw = snapshot.data()
      return raw ? normalizeUser(snapshot.id, raw) ?? undefined : undefined
    },
  } as any)
  const user = computed<User | null | undefined>(() => userId.value ? state.data.value ?? null : undefined)
  const outcome = computed(() => {
    if (!userId.value) return 'idle' as const
    if (state.pending.value) return 'pending' as const
    if (state.error.value) return 'error' as const
    return user.value ? ('ready' as const) : ('missing' as const)
  })
  return {
    user,
    pending: state.pending,
    error: state.error,
    outcome,
  }
}

export type UserRead = ReturnType<typeof useUserRead>
