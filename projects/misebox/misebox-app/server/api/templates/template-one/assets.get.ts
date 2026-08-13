import { getQuery } from 'h3'
import { inspectAppAssetReadiness } from 'fireux-core/runtime/server/utils/appAssetReadiness'

const allowedAppIds = new Set(['friiites'])

export default defineEventHandler(async (event) => {
  const appId = String(getQuery(event).appId || '').trim()
  if (!allowedAppIds.has(appId)) {
    throw createError({ statusCode: 404, statusMessage: 'Template App not found.' })
  }

  const runtime = useRuntimeConfig(event)
  const bucketName = String(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket || ''
  ).trim()
  if (!bucketName) {
    throw createError({ statusCode: 503, statusMessage: 'Storage is not configured.' })
  }

  return inspectAppAssetReadiness(appId, bucketName)
})
