import { getQuery, setHeader } from 'h3'
import { APP_IMAGE_SYNC_KINDS } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/appMedia'
import { readAppAsset } from 'fireux-core/runtime/server/utils/appAssetReadiness'

const allowedAppIds = new Set(['friiites'])
const allowedRoles = new Set<string>(APP_IMAGE_SYNC_KINDS)

export default defineEventHandler(async (event) => {
  const appId = String(getQuery(event).appId || '').trim()
  const role = String(event.context.params?.role || '').trim()
  if (!allowedAppIds.has(appId) || !allowedRoles.has(role)) {
    throw createError({ statusCode: 404, statusMessage: 'Template asset not found.' })
  }

  const runtime = useRuntimeConfig(event)
  const bucketName = String(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket || ''
  ).trim()
  if (!bucketName) {
    throw createError({ statusCode: 503, statusMessage: 'Storage is not configured.' })
  }

  const contents = await readAppAsset(
    appId,
    bucketName,
    role as (typeof APP_IMAGE_SYNC_KINDS)[number]
  )
  if (!contents) throw createError({ statusCode: 404, statusMessage: 'Template asset not found.' })
  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'private, max-age=300')
  return contents
})
