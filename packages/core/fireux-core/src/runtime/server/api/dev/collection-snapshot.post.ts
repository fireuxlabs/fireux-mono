import { createError, defineEventHandler, readBody } from 'h3'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

type Body = {
  collectionPath?: string
  docIds?: string[]
}

const MAX_PARENT_DOCS = 20
const MAX_PARENT_CONCURRENCY = 4
const MAX_SUBCOLLECTIONS_PER_DOC = 5
const MAX_SUBCOLLECTION_DOCS = 50

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

function isValidCollectionPath(value: string) {
  if (!value) return false
  if (value.includes('..')) return false
  const segments = value.split('/').filter(Boolean)
  return (
    segments.length > 0 &&
    segments.length % 2 === 1 &&
    segments.join('/') === value
  )
}

function isValidDocId(value: string) {
  return (
    Boolean(value) &&
    value.length <= 1500 &&
    !value.includes('/') &&
    value !== '..'
  )
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapValue: (value: T) => Promise<R>
) {
  const results = new Array<R>(values.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapValue(values[index] as T)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker())
  )
  return results
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const body = (await readBody(event)) as Body | null
  const collectionPath = normalizeString(body?.collectionPath)
  const docIds = Array.isArray(body?.docIds)
    ? [
        ...new Set(
          body.docIds.map((value) => normalizeString(value)).filter(Boolean)
        ),
      ]
    : []

  if (!isValidCollectionPath(collectionPath)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid collectionPath',
    })
  }

  if (!docIds.length) {
    return { docs: [] }
  }

  if (
    docIds.length > MAX_PARENT_DOCS ||
    docIds.some((id) => !isValidDocId(id))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid docIds',
    })
  }

  const db = getRuntimeFirestore()

  const docs = await mapWithConcurrency(
    docIds,
    MAX_PARENT_CONCURRENCY,
    async (docId) => {
      const docRef = db.collection(collectionPath).doc(docId)
      const allSubcollections = await docRef.listCollections()
      const subcollections = allSubcollections
        .sort((left, right) => left.id.localeCompare(right.id))
        .slice(0, MAX_SUBCOLLECTIONS_PER_DOC)

      const entries = await Promise.all(
        subcollections.map(async (subcollection) => {
          const snap = await subcollection
            .limit(MAX_SUBCOLLECTION_DOCS + 1)
            .get()
          const visibleDocs = snap.docs.slice(0, MAX_SUBCOLLECTION_DOCS)
          const items = visibleDocs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Record<string, unknown>),
          }))

          return [
            subcollection.id,
            {
              path: subcollection.path,
              count: items.length,
              truncated: snap.docs.length > MAX_SUBCOLLECTION_DOCS,
              ids: items
                .map((item) => String(item.id || '').trim())
                .filter(Boolean),
              items,
            },
          ] as const
        })
      )

      return {
        id: docId,
        subcollectionsTruncated:
          allSubcollections.length > MAX_SUBCOLLECTIONS_PER_DOC,
        subcollections: Object.fromEntries(entries),
      }
    }
  )

  return { docs }
})
