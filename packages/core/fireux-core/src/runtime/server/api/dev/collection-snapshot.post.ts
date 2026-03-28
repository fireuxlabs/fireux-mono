import { createError, defineEventHandler, readBody } from 'h3'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

type Body = {
  collectionPath?: string
  docIds?: string[]
}

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

function isValidCollectionPath(value: string) {
  if (!value) return false
  if (value.includes('..')) return false
  const segments = value.split('/').filter(Boolean)
  return segments.length > 0 && segments.length % 2 === 1
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const body = (await readBody(event)) as Body | null
  const collectionPath = normalizeString(body?.collectionPath)
  const docIds = Array.isArray(body?.docIds)
    ? body.docIds.map((value) => normalizeString(value)).filter(Boolean)
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

  const db = getRuntimeFirestore()

  const docs = await Promise.all(
    docIds.map(async (docId) => {
      const docRef = db.collection(collectionPath).doc(docId)
      const subcollections = await docRef.listCollections()

      const entries = await Promise.all(
        subcollections.map(async (subcollection) => {
          const snap = await subcollection.get()
          const items = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Record<string, unknown>),
          }))

          return [
            subcollection.id,
            {
              path: subcollection.path,
              count: items.length,
              ids: items.map((item) => String(item.id || '').trim()).filter(Boolean),
              items,
            },
          ] as const
        })
      )

      return {
        id: docId,
        subcollections: Object.fromEntries(entries),
      }
    })
  )

  return { docs }
})
