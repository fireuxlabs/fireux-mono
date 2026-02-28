import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { computed, isRef, ref, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { AppModel } from '../../../../../../models/core/app.model'

function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardDocumentPromise(
  state: { promise?: Ref<Promise<unknown>> },
  context: string
) {
  const promise = state.promise?.value
  if (!promise || typeof promise.catch !== 'function') return

  promise.catch((error) => {
    if (!import.meta.dev) return
    if (isOfflineFirestoreError(error)) {
      console.warn(`[useAppFetch] offline read ignored (${context})`, error)
      return
    }
    console.error(`[useAppFetch] read failed (${context})`, error)
  })
}

/**
 * Fetch a single app document by id (accepts raw ids or refs).
 * Returns { app, pending } so callers can debounce UI while refetching.
 */
export function useAppFetch(
  appId: string | null | undefined | Ref<string | null | undefined>
) {
  if (import.meta.server) {
    return {
      app: ref<AppModel | undefined>(undefined),
      pending: ref(false),
    }
  }

  const db = useFirestore()

  const targetId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return value ?? null
  })

  const docRef = computed(() =>
    targetId.value ? (doc(db, 'apps', targetId.value) as any) : null
  )

  const docState =
    useDocument<AppModel | undefined>(docRef as any, {
      transform: (docSnap: DocumentSnapshot<AppModel>) => {
        const raw = docSnap.data()
        if (!raw) return undefined
        return { ...(raw as any), id: docSnap.id } as AppModel
      },
    } as any) || {
      data: ref<AppModel | undefined>(undefined),
      pending: ref(false),
    }

  const app = docState.data ?? ref<AppModel | undefined>(undefined)
  const pending = docState.pending ?? ref(false)
  guardDocumentPromise(docState as any, `apps/${targetId.value ?? ''}`)

  return { app, pending }
}
