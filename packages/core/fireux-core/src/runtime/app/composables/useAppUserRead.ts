import { computed, isRef, ref, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from '../../composables/fireux/firestore/vuefire'
import type { AppUser } from '../models/app-user.model'

/** Live read of one App-owned relationship record. */
export function useAppUserRead(
  appId: string | Ref<string | null | undefined>,
  userId: string | Ref<string | null | undefined>
) {
  if (import.meta.server) return { appUser: ref<AppUser | undefined>(), pending: ref(false), error: ref<unknown>(null) }
  const app = computed(() => String(isRef(appId) ? appId.value || '' : appId || '').trim())
  const user = computed(() => String(isRef(userId) ? userId.value || '' : userId || '').trim())
  const db = useFirestore()
  const reference = computed(() => app.value && user.value ? doc(db, 'apps', app.value, 'users', user.value) : null)
  const state = useDocument<AppUser>(reference as any)
  return {
    appUser: computed<AppUser | null | undefined>(() => app.value && user.value ? state.data.value ?? null : undefined),
    pending: state.pending,
    error: state.error,
  }
}
