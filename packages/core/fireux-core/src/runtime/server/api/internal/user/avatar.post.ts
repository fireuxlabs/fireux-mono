import {
  createError,
  defineEventHandler,
  readMultipartFormData,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import imageSize from 'image-size'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { saveStorageFileWithDownloadToken } from '../../../utils/uploads/storage'

const MAX_AVATAR_BYTES = 10 * 1024 * 1024
const CONTENT_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

function detectedContentType(data: Buffer) {
  const type = imageSize(data).type
  if (type === 'jpg' || type === 'jpeg') return 'image/jpeg'
  if (type === 'png' || type === 'webp' || type === 'gif') {
    return `image/${type}`
  }
  return ''
}

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const parts = await readMultipartFormData(event)
  const avatarParts = (parts || []).filter((part) => part.name === 'avatar')
  if (avatarParts.length !== 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Exactly one avatar image is required.',
    })
  }

  const avatar = avatarParts[0]!
  if (!avatar.data.length || avatar.data.length > MAX_AVATAR_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Avatar image must be between 1 byte and 10 MB.',
    })
  }

  let contentType = ''
  try {
    contentType = detectedContentType(avatar.data)
  } catch {
    contentType = ''
  }
  if (!contentType || !CONTENT_TYPES.has(contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Avatar must be a PNG, JPEG, WebP, or GIF image.',
    })
  }

  const saved = await saveStorageFileWithDownloadToken({
    objectPath: `users/${uid}/avatar`,
    data: avatar.data,
    contentType,
    cacheControl: 'public,max-age=31536000,immutable',
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return { ok: true as const, avatar: saved.fileUrl }
})
