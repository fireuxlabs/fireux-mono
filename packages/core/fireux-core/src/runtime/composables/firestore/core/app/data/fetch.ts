import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef, type Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'

/**
 * Fetch a single app document by id (accepts raw ids or refs).
 * Returns { app, pending } so callers can debounce UI while refetching.
 */
export function useAppFetch(
  appId: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const targetId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return value ?? null
  })

  const docRef = computed(() =>
    targetId.value ? (doc(db, 'apps', targetId.value) as any) : null
  )

  const { data: app, pending } = useDocument<App | undefined>(docRef as any)
  return { app, pending }
}

/**
 * Fetch all app documents. Returns a simple computed list wrapper.
 */
export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<App>('apps')
  const apps = computed(() => source.value ?? [])
  return { apps }
}
