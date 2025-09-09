import { defineEventHandler, readBody, createError } from 'h3'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { promises as fs } from 'fs'
import { join } from 'path'

// Function to initialize Firebase Admin with dynamic service account
async function initializeFirebaseAdmin() {
  console.log('🔧 [firestore] Starting Firebase Admin initialization...')
  console.log('🔧 [firestore] Current working directory:', process.cwd())
  console.log('🔧 [firestore] Current Firebase apps:', getApps().length)

  // Always try to get existing app first
  const existingApps = getApps()
  if (existingApps.length > 0) {
    console.log(
      '🔧 [firestore] Firebase Admin already initialized, using existing app'
    )
    return existingApps[0] // Return the existing app
  }

  try {
    // Try environment variable first (for production deployment)
    // Prefer unified FIREBASE_SERVICE_ACCOUNT (JSON string); fallback to legacy *_KEY
    const envServiceAccount =
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (envServiceAccount) {
      console.log(
        '🔧 [firestore] Using service account from environment variable'
      )
      const app = initializeApp({
        credential: cert(JSON.parse(envServiceAccount)),
      })
      console.log('✅ [firestore] Firebase Admin initialized from environment')
      return app
    }

    // For local development, find the service account file relative to the app
    // The server runs from the app directory, so config/service-account.json should be accessible
    const serviceAccountPath = join(
      process.cwd(),
      'config',
      'service-account.json'
    )
    console.log(
      '🔧 [firestore] Looking for service account at:',
      serviceAccountPath
    )

    // Check if file exists
    try {
      await fs.access(serviceAccountPath)
      console.log('✅ [firestore] Service account file found')

      const serviceAccountContent = await fs.readFile(
        serviceAccountPath,
        'utf-8'
      )
      const serviceAccount = JSON.parse(serviceAccountContent)

      console.log(
        '🔧 [firestore] Successfully loaded service account for project:',
        serviceAccount.project_id
      )

      const app = initializeApp({
        credential: cert(serviceAccount),
      })
      console.log('✅ [firestore] Firebase Admin initialized from file')
      return app
    } catch (accessError) {
      console.error(
        '❌ [firestore] Service account file not found at:',
        serviceAccountPath
      )

      // Try alternative paths
      const alternativePaths = [
        join(process.cwd(), '..', 'config', 'service-account.json'),
        join(process.cwd(), '..', '..', 'config', 'service-account.json'),
        join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'config',
          'service-account.json'
        ),
      ]

      for (const altPath of alternativePaths) {
        try {
          await fs.access(altPath)
          console.log(
            '✅ [firestore] Found service account at alternative path:',
            altPath
          )
          const serviceAccountContent = await fs.readFile(altPath, 'utf-8')
          const serviceAccount = JSON.parse(serviceAccountContent)

          console.log(
            '🔧 [firestore] Successfully loaded service account for project:',
            serviceAccount.project_id
          )

          const app = initializeApp({
            credential: cert(serviceAccount),
          })
          console.log(
            '✅ [firestore] Firebase Admin initialized from alternative path'
          )
          return app
        } catch (altError) {
          console.log('❌ [firestore] Alternative path not found:', altPath)
        }
      }

      throw new Error(
        `Service account file not found. Tried: ${serviceAccountPath} and alternatives`
      )
    }
  } catch (error) {
    console.error('❌ [firestore] Failed to initialize Firebase Admin:', error)
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 [update-document] Starting request...')
    console.log('🔧 [update-document] Current Firebase apps:', getApps().length)

    // Initialize Firebase Admin with the correct service account and get the app instance
  const app = await initializeFirebaseAdmin()

    console.log(
      '🔧 [update-document] After initialization, Firebase apps:',
      getApps().length
    )

    const body = await readBody(event)
    console.log('📝 update-document received:', body)

    const { collection, documentId, data, merge = true, ping } = body

    // Handle ping/pong for testing
    if (ping) {
      console.log('🏓 [update-document] Ping received:', ping)
    }

    // Validate required fields
    if (!collection || !documentId || !data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: collection, documentId, data',
      })
    }

    console.log(`📝 [update-document] Updating ${collection}/${documentId}`)

    // Get Firestore instance from the initialized app
    if (!app) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Firebase Admin app not initialized',
      })
    }
    const db = getFirestore(app)

    // Update the document
    const docRef = db.collection(collection).doc(documentId)

    if (merge) {
      await docRef.set(data, { merge: true })
    } else {
      await docRef.set(data)
    }

    console.log(
      `✅ [update-document] Document ${collection}/${documentId} updated successfully`
    )

    return {
      success: true,
      collection,
      documentId,
      message: `Document updated in ${collection}/${documentId}`,
      pong: ping ? `pong-${ping}` : undefined,
    }
  } catch (error) {
    console.error('❌ [update-document] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update document: ${errorMessage}`,
    })
  }
})
