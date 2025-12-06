import { defineEventHandler } from 'h3'
import { getFirebaseAdminApp, getFirestoreDb } from './firebase-admin'

const COLLECTION_LIMIT = 10
const TARGET_DATABASE_ID = 'registry'
const PROJECT_ID = 'fireux-2005'

export default defineEventHandler(async () => {
  try {
    await getFirebaseAdminApp()

    const db = await getFirestoreDb(TARGET_DATABASE_ID)
    const lastPing = new Date().toISOString()

    const collections = await db.listCollections()
    const userCollections = collections.filter(
      (collection) => !collection.id.startsWith('diagnostics')
    )

    const trimmedCollections = userCollections
      .slice(0, COLLECTION_LIMIT)
      .map((collection) => ({ id: collection.id, path: collection.path }))
    const limited = userCollections.length > COLLECTION_LIMIT

    return {
      message: 'Hello from FireUX server',
      projectId: PROJECT_ID,
      lastPing,
      collections: trimmedCollections,
      limited,
      databaseId: 'registry',
      error: null as string | null,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reach Firestore'
    console.error('[hello endpoint] Firestore interaction failed', error)
    return {
      message: 'Hello from FireUX server',
      projectId: PROJECT_ID,
      lastPing: null,
      collections: [],
      limited: false,
      databaseId: 'registry',
      error: message,
    }
  }
})
