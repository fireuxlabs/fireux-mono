import { createError, defineEventHandler, getQuery } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

function readId(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return String(raw || '').trim()
}

export default defineEventHandler(async (event) => {
  const id = readId(getQuery(event).id)

  if (!id || id.includes('/') || id === '.' || id === '..') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document id is not valid',
    })
  }

  const db = getRuntimeFirestore('go-qr')
  const snap = await db.collection('go_qr_documents').doc(id).get()

  return {
    id,
    taken: snap.exists,
  }
})
