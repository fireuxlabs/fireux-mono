import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from '#imports'

type DevCollectionDocMeta = {
  collectionPath: string
  docPath: string
}

type DevSubcollectionSnapshot = {
  path: string
  count: number
  ids: string[]
  items: Record<string, unknown>[]
}

type DevCollectionSnapshotResponse = {
  docs: Array<{
    id: string
    subcollections: Record<string, DevSubcollectionSnapshot>
  }>
}

const DEV_META_KEY = '__fireuxDevMeta'

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

export function useDevCollectionJson<T extends Record<string, unknown>>(
  itemsRef: MaybeRefOrGetter<T[]>,
  collectionPathRef?: MaybeRefOrGetter<string | null | undefined>
) {
  const subcollectionsById = ref(new Map<string, Record<string, DevSubcollectionSnapshot>>())

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
    items.value
      .map((item) => String((item as Record<string, unknown>)?.id || '').trim())
      .filter(Boolean)
  )

  const fetchKey = computed(() =>
    resolvedCollectionPath.value && docIds.value.length
      ? `${resolvedCollectionPath.value}::${docIds.value.join(',')}`
      : ''
  )

  watch(
    fetchKey,
    async (nextKey) => {
      if (!import.meta.dev || import.meta.server) return

      if (!nextKey) {
        subcollectionsById.value = new Map()
        return
      }

      try {
        const payload = await $fetch<DevCollectionSnapshotResponse>('/api/dev/collection-snapshot', {
          method: 'POST',
          body: {
            collectionPath: resolvedCollectionPath.value,
            docIds: docIds.value,
          },
        })

        const nextMap = new Map<string, Record<string, DevSubcollectionSnapshot>>()
        for (const entry of payload.docs ?? []) {
          const id = String(entry?.id || '').trim()
          if (!id) continue
          nextMap.set(id, entry.subcollections || {})
        }
        subcollectionsById.value = nextMap
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useDevCollectionJson] failed to load subcollections', error)
        }
        subcollectionsById.value = new Map()
      }
    },
    { immediate: true }
  )

  const devJsonData = computed(() =>
    items.value.map((item) => {
      const id = String((item as Record<string, unknown>)?.id || '').trim()
      if (!id) return item

      const subcollections = subcollectionsById.value.get(id)
      if (!subcollections || !Object.keys(subcollections).length) return item

      return {
        ...item,
        subcollections,
      }
    })
  )

  return {
    devJsonData,
    resolvedCollectionPath,
  }
}
