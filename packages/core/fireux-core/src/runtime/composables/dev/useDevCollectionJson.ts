// Concurrent edit — 2026-07-20 16:18 CEST — Repo Efficiency Pass 1 of 6: authenticate snapshots and clear them across auth changes.
import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from '../fireux/firebase/useAuth'

type DevCollectionDocMeta = {
  collectionPath: string
  docPath: string
}

type DevSubcollectionSnapshot = {
  path: string
  count: number
  truncated: boolean
  ids: string[]
  items: Record<string, unknown>[]
}

type DevCollectionDocSnapshot = {
  subcollections: Record<string, DevSubcollectionSnapshot>
  subcollectionsTruncated: boolean
}

type DevCollectionSnapshotResponse = {
  docs: Array<{
    id: string
    subcollections: Record<string, DevSubcollectionSnapshot>
    subcollectionsTruncated: boolean
  }>
}

const DEV_META_KEY = '__fireuxDevMeta'
const MAX_DEV_COLLECTION_DOCS = 20

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getDevMeta(value: unknown): DevCollectionDocMeta | null {
  if (!isObject(value)) return null
  const meta = (value as Record<string, unknown>)[DEV_META_KEY]
  if (!isObject(meta)) return null

  const collectionPath = String(meta.collectionPath || '').trim()
  const docPath = String(meta.docPath || '').trim()
  if (!collectionPath || !docPath) return null

  return { collectionPath, docPath }
}

export function attachDevCollectionMeta<T extends Record<string, unknown>>(
  value: T,
  collectionPath: string,
  docId: string
): T {
  if (!import.meta.dev || !isObject(value)) return value

  const resolvedCollectionPath = String(collectionPath || '').trim()
  const resolvedDocId = String(docId || '').trim()
  if (!resolvedCollectionPath || !resolvedDocId) return value

  try {
    Object.defineProperty(value, DEV_META_KEY, {
      value: {
        collectionPath: resolvedCollectionPath,
        docPath: `${resolvedCollectionPath}/${resolvedDocId}`,
      } satisfies DevCollectionDocMeta,
      enumerable: false,
      configurable: true,
      writable: false,
    })
  } catch {
    // Ignore metadata attachment failures in production-like environments.
  }

  return value
}

export function useDevCollectionJson<T extends object>(
  itemsRef: MaybeRefOrGetter<T[]>,
  collectionPathRef?: MaybeRefOrGetter<string | null | undefined>
) {
  const { currentUser } = useAuth()
  const authUid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const snapshotsById = ref(new Map<string, DevCollectionDocSnapshot>())
  const enabled = ref(false)
  const refreshToken = ref(0)
  const devJsonLoading = ref(false)
  const devJsonError = ref<unknown>(null)
  let requestId = 0
  let activeController: AbortController | null = null

  const items = computed(() => {
    const value = toValue(itemsRef)
    return Array.isArray(value) ? value : []
  })

  const inferredCollectionPath = computed(() => {
    for (const item of items.value) {
      const meta = getDevMeta(item)
      if (meta?.collectionPath) return meta.collectionPath
    }
    return ''
  })

  const resolvedCollectionPath = computed(() => {
    const explicit = String(toValue(collectionPathRef) || '').trim()
    return explicit || inferredCollectionPath.value
  })

  const docIds = computed(() =>
    [
      ...new Set(
        items.value
          .map((item) =>
            String((item as Record<string, unknown>)?.id || '').trim()
          )
          .filter(Boolean)
      ),
    ].slice(0, MAX_DEV_COLLECTION_DOCS)
  )

  const fetchKey = computed(() =>
    resolvedCollectionPath.value && docIds.value.length
      ? `${resolvedCollectionPath.value}::${docIds.value.join(',')}`
      : ''
  )

  const loadDevJson = () => {
    enabled.value = true
    refreshToken.value += 1
  }

  const unloadDevJson = () => {
    enabled.value = false
    requestId += 1
    activeController?.abort()
    activeController = null
    devJsonLoading.value = false
    devJsonError.value = null
    snapshotsById.value = new Map()
  }

  onScopeDispose(unloadDevJson)

  watch(
    [enabled, fetchKey, refreshToken, authUid],
    async (
      [isEnabled, nextKey, , nextUid]: [boolean, string, number, string]
    ) => {
      if (!import.meta.dev || import.meta.server) return
      if (!isEnabled) return

      const currentRequestId = ++requestId
      activeController?.abort()
      activeController = null
      snapshotsById.value = new Map()
      devJsonError.value = null

      if (!nextKey || !nextUid) {
        devJsonLoading.value = false
        return
      }

      devJsonLoading.value = true
      const controller = new AbortController()
      activeController = controller

      try {
        const user = currentUser.value
        const token = user?.uid === nextUid ? await user.getIdToken() : ''
        if (!token) throw new Error('Developer authentication is required.')
        const payload = await $fetch<DevCollectionSnapshotResponse>(
          '/api/dev/collection-snapshot',
          {
            method: 'POST',
            body: {
              collectionPath: resolvedCollectionPath.value,
              docIds: docIds.value,
            },
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        )
        if (currentRequestId !== requestId) return

        const nextMap = new Map<string, DevCollectionDocSnapshot>()
        for (const entry of payload.docs ?? []) {
          const id = String(entry?.id || '').trim()
          if (!id) continue
          nextMap.set(id, {
            subcollections: entry.subcollections || {},
            subcollectionsTruncated: entry.subcollectionsTruncated === true,
          })
        }
        snapshotsById.value = nextMap
      } catch (error) {
        if (currentRequestId !== requestId) return
        if (import.meta.dev) {
          console.warn(
            '[useDevCollectionJson] failed to load subcollections',
            error
          )
        }
        devJsonError.value = error
        snapshotsById.value = new Map()
      } finally {
        if (currentRequestId === requestId) {
          devJsonLoading.value = false
          activeController = null
        }
      }
    },
    { immediate: true }
  )

  const devJsonData = computed(() =>
    items.value.map((item) => {
      const id = String((item as Record<string, unknown>)?.id || '').trim()
      if (!id) return item

      const snapshot = snapshotsById.value.get(id)
      if (!snapshot || !Object.keys(snapshot.subcollections).length) return item

      return {
        ...item,
        subcollections: snapshot.subcollections,
        ...(snapshot.subcollectionsTruncated
          ? { subcollectionsTruncated: true }
          : {}),
      }
    })
  )

  return {
    devJsonData,
    devJsonError,
    devJsonLoading,
    loadDevJson,
    resolvedCollectionPath,
    unloadDevJson,
  }
}
