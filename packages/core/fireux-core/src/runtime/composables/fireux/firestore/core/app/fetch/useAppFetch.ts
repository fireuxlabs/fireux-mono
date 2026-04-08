import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, isRef, ref, type Ref } from 'vue'
import type { App } from '../../../../../../models/core/app.model'

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
  appId: string | null | undefined | Ref<string | null | undefined>,
  options: {
    collectionPath?: string | Ref<string | null | undefined>
  } = {}
) {
  if (import.meta.server) {
    return {
      app: ref<App | undefined>(undefined),
      pending: ref(false),
    }
  }

  const db = useFirestore()

  const targetId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return value ?? null
  })
  const collectionPath = computed(() => {
    const raw = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath
    const normalized = String(raw || '').trim()
    return normalized || 'apps'
  })

  const docRef = computed(() =>
    targetId.value ? (doc(db, collectionPath.value, targetId.value) as any) : null
  )

  const docState =
    useDocument<App | undefined>(docRef as any, {
      transform: (docSnap: DocumentSnapshot<App>) => {
        const raw = docSnap.data()
        if (!raw) return undefined
        return { ...(raw as any), id: docSnap.id } as App
      },
    } as any) || {
      data: ref<App | undefined>(undefined),
      pending: ref(false),
    }

  const appSource = docState.data ?? ref<App | undefined>(undefined)
  const pending = docState.pending ?? ref(false)
  const app = computed<App | null | undefined>(() => {
    if (!targetId.value) return undefined
    if (pending.value) return undefined

    const raw = appSource.value
    if (!raw) return null

    return raw
  })
  guardDocumentPromise(
    docState as any,
    `${collectionPath.value}/${targetId.value ?? ''}`
  )

  return { app, pending }
}
