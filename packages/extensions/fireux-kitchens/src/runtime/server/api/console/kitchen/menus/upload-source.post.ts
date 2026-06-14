import {
  createError,
  defineEventHandler,
  getHeader,
  getMethod,
  getQuery,
  readBody,
  setResponseHeaders,
  setResponseStatus,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { KitchenStorage } from '../../../../../models/kitchen.model'

const menuUploadCollection = 'menu-uploads'

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function bearerToken(value: unknown) {
  return text(value).match(/^Bearer\s+(.+)$/i)?.[1] || ''
}

function pathSegment(value: unknown, label: string) {
  const segment = text(value)
  if (!segment || segment.includes('/')) {
    throw createError({ statusCode: 400, statusMessage: `${label} is required.` })
  }
  return segment
}

function hasOperator(data: Record<string, unknown> | undefined, uid: string) {
  const ids = [
    ...(Array.isArray(data?.operator_ids) ? data.operator_ids : []),
    ...(Array.isArray(data?.team_ids) ? data.team_ids : []),
  ].map((value) => text(value))

  return Boolean(uid && ids.includes(uid))
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization',
  })
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return null
  }

  const token = bearerToken(getHeader(event, 'authorization'))
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in before saving a menu upload.' })
  }

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
  const uid = pathSegment(decoded.uid, 'User id')
  const query = getQuery(event)
  const body = record(await readBody(event).catch(() => ({})))
  const result = record(body.result)
  const appId = pathSegment(body.appId || query.appId, 'App id')
  const kitchenId = pathSegment(body.kitchenId || query.kitchenId, 'Kitchen id')
  const provider = text(body.provider) || 'go-qr'
  const tool = text(body.tool) || 'doc'

  if (provider !== 'go-qr' || tool !== 'doc') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only Go QR doc uploads are supported here.',
    })
  }

  const providerDocId = pathSegment(
    result.id || result.slug || body.providerDocId,
    'Provider doc id'
  )
  const db = getRuntimeFirestore()
  const kitchenPath = `${AppStorage.collection}/${appId}/${KitchenStorage.scopeCollection}/${kitchenId}`
  const kitchenSnap = await db.doc(kitchenPath).get()
  if (!kitchenSnap.exists || !hasOperator(kitchenSnap.data(), uid)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this kitchen.',
    })
  }

  const now = FieldValue.serverTimestamp()
  const uploadRef = db.doc(`${kitchenPath}/${menuUploadCollection}/${providerDocId}`)
  const uploadSnap = await uploadRef.get()
  const upload = {
    id: providerDocId,
    kitchen_id: kitchenId,
    app_id: appId,
    provider: 'go-qr',
    tool: 'doc',
    provider_doc_id: providerDocId,
    provider_slug: text(result.slug) || providerDocId,
    provider_url: text(result.url),
    provider_qr_url: text(result.qr_url),
    provider_path: text(result.path),
    provider_qr_path: text(result.qr_path),
    source_file_name: text(result.file_name || body.sourceFileName),
    source_file_type: text(result.file_type || body.sourceFileType),
    status: 'uploaded',
    ...(!uploadSnap.exists ? {
      created: {
        at: now,
        by: uid,
        app_id: appId,
      },
    } : {}),
    updated: {
      at: now,
      by: uid,
    },
  }

  await uploadRef.set(upload, { merge: true })

  return {
    ok: true,
    id: providerDocId,
    upload,
  }
})
