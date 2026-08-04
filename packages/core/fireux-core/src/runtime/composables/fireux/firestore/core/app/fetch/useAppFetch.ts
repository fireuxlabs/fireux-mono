// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: expose App read errors instead of collapsing them into missing state.
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { useDocument, useFirestore } from '../../../vuefire'
import { computed, isRef, ref, type Ref } from 'vue'
import { AppStorage, type App } from '../../../../../../models/core/app.model'

export type AppFetchOutcome = 'idle' | 'pending' | 'ready' | 'missing' | 'error'

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
      error: ref<unknown>(null),
      outcome: ref<AppFetchOutcome>('idle'),
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
    return normalized || AppStorage.collection
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
      error: ref<unknown>(null),
    }

  const appSource = docState.data ?? ref<App | undefined>(undefined)
  const pending = docState.pending ?? ref(false)
  const error = docState.error ?? ref<unknown>(null)
  const app = computed<App | null | undefined>(() => {
    if (!targetId.value) return undefined
    if (pending.value) return undefined

    const raw = appSource.value
    if (!raw) return null

    return raw
  })
  const outcome = computed<AppFetchOutcome>(() => {
    if (!targetId.value) return 'idle'
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return app.value ? 'ready' : 'missing'
  })
  guardDocumentPromise(
    docState as any,
    `${collectionPath.value}/${targetId.value ?? ''}`
  )

  return { app, pending, error, outcome }
}
