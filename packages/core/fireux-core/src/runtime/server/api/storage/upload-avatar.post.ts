import {
  defineEventHandler,
  readBody,
  getQuery,
  createError,
  setResponseHeaders,
} from 'h3'
import { getAdmin } from '../../utils/getAdmin'

// POST /api/storage/upload-avatar?uid=...
// Body options:
// - { url: string } to fetch from remote URL (e.g., proxied Google avatar)
// - raw binary (ArrayBuffer) for direct upload; set header content-type: image/*
export default defineEventHandler(async (event) => {
  const { uid } = getQuery(event)
  if (!uid || typeof uid !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing uid' })
  }

  const admin = getAdmin()

  // Ensure storage is available
  const storage = admin.storage?.()
  if (!storage) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin storage not available',
    })
  }

  const bucket = storage.bucket()
  const path = `core-users/${uid}/avatar.jpg`

  // Accept either JSON with { url } or raw binary body
  const contentType =
    event.node.req.headers['content-type'] || 'application/octet-stream'
  let buffer: Buffer | null = null

  if (contentType.startsWith('application/json')) {
    const body = await readBody<{ url?: string }>(event)
    const url = body?.url
    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing url in JSON body',
      })
    }
    const resp = await fetch(url)
    if (!resp.ok) {
      throw createError({
        statusCode: resp.status,
        statusMessage: 'Failed to fetch source URL',
      })
    }
    const arr = await resp.arrayBuffer()
    buffer = Buffer.from(arr)
  } else {
    // Raw binary
    const arr = (await readBody<ArrayBuffer>(event)) as any
    if (!arr) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing binary body',
      })
    }
    buffer = Buffer.from(arr)
  }

  // Upload
  const file = bucket.file(path)
  // Stable token-based download URL
  const token = (globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2)) as string
  await file.save(buffer, {
    contentType: 'image/jpeg',
    public: false,
    resumable: false,
    validation: false,
    metadata: {
      cacheControl: 'public, max-age=31536000',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })

  const bucketName = bucket.name
  const encodedPath = encodeURIComponent(path)
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`

  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  return { url, path }
})
