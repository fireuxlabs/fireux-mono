import { randomUUID } from 'node:crypto'
import {
  createError,
  readMultipartFormData,
  setResponseHeader,
  type H3Event,
} from 'h3'
import sharp from 'sharp'
import {
  multipartField,
  readUploadedMultipartFile,
  type MultipartParts,
} from './multipart'
import {
  saveStorageFileWithDownloadToken,
  deleteStorageFileIfExists,
} from './storage'

/** Domain authority selects the target; Core validates and stores the image. */
export async function uploadProtectedImage(
  event: H3Event,
  authorize: (path: string, parts: MultipartParts) => Promise<void>
) {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const parts = await readMultipartFormData(event)
  const path = multipartField(parts, 'path')
  if (
    !path ||
    path
      .split('/')
      .some((segment) => !segment || ['.', '..'].includes(segment)) ||
    path.length > 500
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image target is invalid.',
    })
  }
  await authorize(path, parts)
  const file = readUploadedMultipartFile(parts, {
    label: 'Image',
    defaultFileName: 'image',
    maxFileSizeMb: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    invalidTypeMessage: 'Upload a JPEG, PNG or WebP image.',
  })
  let data: Buffer
  try {
    data = await sharp(file.data, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer()
  } catch {
    throw createError({
      statusCode: 415,
      statusMessage: 'Image data is invalid.',
    })
  }
  const saved = await saveStorageFileWithDownloadToken({
    objectPath: `${path}/revisions/${randomUUID()}`,
    data,
    contentType: 'image/webp',
  })
  try {
    // A revoked membership or account must not publish a newly uploaded URL.
    await authorize(path, parts)
  } catch (error) {
    await deleteStorageFileIfExists(saved)
    throw error
  }
  return { url: saved.fileUrl }
}
