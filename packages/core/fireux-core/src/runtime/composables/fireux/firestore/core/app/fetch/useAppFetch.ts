import { doc } from 'firebase/firestore'
import { computed, isRef, ref, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { AppModel } from '../../../../../../models/core/app.model'

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

  const docState = useDocument<AppModel | undefined>(docRef as any) || {
    data: ref<AppModel | undefined>(undefined),
    pending: ref(false),
  }

  const app = docState.data ?? ref<AppModel | undefined>(undefined)
  const pending = docState.pending ?? ref(false)

  return { app, pending }
}
