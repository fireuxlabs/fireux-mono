import { createError, defineEventHandler, getQuery, type H3Event } from 'h3'
import { getProductsFirestore } from '../../utils/getAdmin'
import { assertProductsServiceAccess } from '../../utils/assertProductsServiceAccess'

export default defineEventHandler(async (event: H3Event) => {
  await assertProductsServiceAccess(event)

  try {
    const query = getQuery(event)
    const appId = String(query?.appId || '').trim()

    if (!appId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing appId query param' })
    }

    const db = getProductsFirestore()
    const snapshot = await db.collection(`apps/${appId}/licenses`).get()

    const licenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>),
    }))

    return { licenses }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load licenses'
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
