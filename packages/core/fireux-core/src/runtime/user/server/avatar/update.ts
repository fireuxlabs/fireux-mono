import { randomUUID } from 'node:crypto'
import {
  createError,
  readMultipartFormData,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import imageSize from 'image-size'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import {
  deleteStorageFileIfExists,
  parseFirebaseStorageDownloadUrl,
  saveStorageFileWithDownloadToken,
} from '../../../server/utils/uploads/storage'
import { FIRESTORE_MUTATION_TARGETS } from '../../../utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'

const MAX_AVATAR_BYTES = 10 * 1024 * 1024

function avatarContentType(data: Buffer): string {
  let type = ''
  try {
    type = imageSize(data).type || ''
  } catch {
    // Invalid image bytes receive the same bounded public error below.
  }
  if (type === 'jpg' || type === 'jpeg') return 'image/jpeg'
  if (type === 'png' || type === 'webp' || type === 'gif')
    return `image/${type}`
  throw createError({
    statusCode: 415,
    statusMessage: 'Avatar must be a PNG, JPEG, WebP, or GIF image.',
  })
}

/** One command owns validated upload, User attachment and exact-file cleanup. */
export async function updateUserAvatar(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const parts = await readMultipartFormData(event)
  const images = (parts || []).filter((part) => part.name === 'avatar')
  if (images.length !== 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Exactly one avatar image is required.',
    })
  }
  const image = images[0]!
  if (!image.data.length || image.data.length > MAX_AVATAR_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Avatar image must be between 1 byte and 10 MB.',
    })
  }
  const contentType = avatarContentType(image.data)
  const users = FIRESTORE_MUTATION_TARGETS.users
  const saved = await saveStorageFileWithDownloadToken({
    objectPath: `users/${uid}/avatar/${randomUUID()}`,
    data: image.data,
    contentType,
    cacheControl: 'public,max-age=31536000,immutable',
  })
  let previous: unknown
  try {
    previous = await runGuardedServerTransaction(
      users.database,
      async (mutations) => {
        const user = await mutations.read(users, uid)
        if (!user.exists) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Create the User before updating the avatar.',
          })
        }
        mutations.update(users, uid, { avatar: saved.fileUrl })
        return user.data?.avatar
      }
    )
  } catch (error) {
    try {
      // A failed response does not prove that the transaction failed to commit.
      const current = await runGuardedServerTransaction(
        users.database,
        async (mutations) => (await mutations.read(users, uid)).data?.avatar
      )
      const selected = parseFirebaseStorageDownloadUrl(current)
      if (
        selected?.bucketName !== saved.bucketName ||
        selected?.objectPath !== saved.objectPath
      ) {
        await deleteStorageFileIfExists(saved)
      }
    } catch {
      // Keep the upload until its attachment can be confirmed.
      console.warn('[User avatar] Failed upload cleanup needs retry.')
    }
    throw error
  }

  const old = parseFirebaseStorageDownloadUrl(previous)
  if (
    old &&
    old.bucketName === saved.bucketName &&
    old.objectPath.startsWith(`users/${uid}/avatar/`) &&
    old.objectPath !== saved.objectPath
  ) {
    try {
      // Uploads use unique paths. Never clean a file that is selected again.
      const current = await runGuardedServerTransaction(
        users.database,
        async (mutations) => (await mutations.read(users, uid)).data?.avatar
      )
      const selected = parseFirebaseStorageDownloadUrl(current)
      if (
        selected?.bucketName !== old.bucketName ||
        selected?.objectPath !== old.objectPath
      ) {
        await deleteStorageFileIfExists(old)
      }
    } catch {
      // The saved User is authoritative; cleanup failure must not undo its avatar.
      console.warn('[User avatar] Previous upload cleanup needs retry.')
    }
  }
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return { ok: true as const, avatar: saved.fileUrl }
}
