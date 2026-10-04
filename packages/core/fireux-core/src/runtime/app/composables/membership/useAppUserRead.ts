import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import type { AppUser } from '../../models/app-user.model'

/** Live read of one AppUser through the shared Firestore reader. */
export function useAppUserRead(
  appId: MaybeRef<string | null | undefined>,
  userId: MaybeRef<string | null | undefined>
) {
  const app = computed(() => String(unref(appId) ?? '').trim())
  const targetId = computed(() => String(unref(userId) ?? '').trim())
  const path = computed(() => (app.value ? `apps/${app.value}/users` : ''))
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<AppUser>(path, targetId)
  const appUser = computed<AppUser | null | undefined>(() => {
    if (!(app.value && targetId.value) || source.pending.value) return undefined
    if (source.error.value) return undefined
    return source.value ?? null
  })
  return {
    appUser,
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
