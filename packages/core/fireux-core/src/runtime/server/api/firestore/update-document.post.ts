import { useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import {
  defineEventHandler,
  readBody,
  createError,
  getHeader,
  type H3Event,
} from 'h3'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { promises as fs } from 'fs'
import { join } from 'path'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function safeEquals(value: string, expected: string): boolean {
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function serviceKeyFromRequest(event: H3Event): string {
  const authorization = firstString(getHeader(event, 'authorization'))
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  return firstString(
    getHeader(event, 'x-fireux-core-service-key'),
    getHeader(event, 'x-fireux-internal-key'),
    bearer
  )
}

function configuredServiceKey(event: H3Event): string {
  const runtime = useRuntimeConfig(event) as any
  const fireuxCore = runtime?.fireuxCore || {}
  const fireux = runtime?.fireux || {}
  return firstString(
    process.env.FIREUX_CORE_SERVICE_KEY,
    process.env.FIREUX_INTERNAL_API_KEY,
    fireuxCore.serviceKey,
    fireuxCore.internalApiKey,
    fireux.serviceKey,
    fireux.internalApiKey
  )
}

function assertDevOrInternalAccess(event: H3Event) {
  if (import.meta.dev) return

  const serviceKey = configuredServiceKey(event)
  if (!serviceKey) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  if (!safeEquals(serviceKeyFromRequest(event), serviceKey)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized FireUX internal request.',
    })
  }
}

function normalizeString(value: unknown): string {
  return String(value || '').trim()
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isValidCollectionPath(value: string): boolean {
  if (!value || value.includes('..')) return false
  const segments = value.split('/').filter(Boolean)
  return segments.length > 0 && segments.length % 2 === 1
}

function isValidDocumentId(value: string): boolean {
  return Boolean(value && !value.includes('/') && value !== '.' && value !== '..')
}

function isHttpError(error: unknown): error is { statusCode: number } {
  return !!error && typeof error === 'object' && 'statusCode' in error
}

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
    // FIREBASE_SERVICE_ACCOUNT is the single supported contract (JSON string)
    const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
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
      `Firebase Admin initialization failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export default defineEventHandler(async (event: H3Event) => {
  assertDevOrInternalAccess(event)

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
    if (!isPlainRecord(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body.',
      })
    }

    const { collection, documentId, data, merge = true, ping } = body
    const collectionPath = normalizeString(collection)
    const normalizedDocumentId = normalizeString(documentId)

    // Handle ping/pong for testing
    if (ping) {
      console.log('🏓 [update-document] Ping received:', ping)
    }

    // Validate required fields
    if (
      !isValidCollectionPath(collectionPath) ||
      !isValidDocumentId(normalizedDocumentId) ||
      !isPlainRecord(data)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Missing or invalid required fields: collection, documentId, data',
      })
    }

    console.log(`📝 [update-document] Updating ${collectionPath}/${normalizedDocumentId}`)

    // Ensure admin app initialization happens before resolving the runtime database.
    void app
    const db = getRuntimeFirestore()

    // Update the document
    const docRef = db.collection(collectionPath).doc(normalizedDocumentId)

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
      collection: collectionPath,
      documentId: normalizedDocumentId,
      message: `Document updated in ${collectionPath}/${normalizedDocumentId}`,
      pong: ping ? `pong-${ping}` : undefined,
    }
  } catch (error) {
    if (isHttpError(error)) throw error

    console.error('❌ [update-document] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update document: ${errorMessage}`,
    })
  }
})
