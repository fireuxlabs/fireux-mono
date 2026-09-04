import { computed, isRef, ref, type Ref } from 'vue'
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { readRuntimeIdentityFirestoreDatabaseId, useDocument, useFirestore } from '../../composables/fireux/firestore/vuefire'
import type { User } from '../models/user.model'
import { normalizeUser } from '../utils/normalize-user'

/** Live read of exactly one root User document. */
export function useUserRead(id: string | null | undefined | Ref<string | null | undefined>) {
  if (import.meta.server) return { user: ref<User | undefined>(), pending: ref(false), error: ref<unknown>(null) }
  const userId = computed(() => String(isRef(id) ? id.value || '' : id || '').trim())
  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const reference = computed(() => userId.value ? doc(db, 'users', userId.value) : null)
  const state = useDocument<User | undefined>(reference as any, {
    transform: (snapshot: DocumentSnapshot<User>) => {
      const raw = snapshot.data()
      return raw ? normalizeUser(snapshot.id, raw) ?? undefined : undefined
    },
  } as any)
  return {
    user: computed<User | null | undefined>(() => userId.value ? state.data.value ?? null : undefined),
    pending: state.pending,
    error: state.error,
  }
}

export type UserRead = ReturnType<typeof useUserRead>
